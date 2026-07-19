import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AnomalyChart, { type AnomalyChartRangeMode } from './AnomalyChart';
import anomalyService from '@/services/AnomalyService';
import filterService from '@/services/FilterService';
import {
  DEFAULT_ANOMALY_SCORE_BANDS,
  type AnomalyFinalCardVM,
  type AnomalyFinalMarkerVM,
  type AnomalySeriesDataset,
  type AnomalyWindowDays,
} from '@/types/AnomalyTypes';
import { Activity, AlertTriangle, CheckCircle2, Eye, OctagonAlert, RefreshCw, Settings2, Star } from 'lucide-react';
import { toISO8601UTC } from '@/utils/timeframeUtils';
import { buildFinalCardVM, buildFinalMarkerVM, buildSeriesDataset } from '@/utils/anomalyTransform';
import { useAnomalyPolling } from '@/hooks/anomaly/useAnomalyPolling';
import {
  ANOMALY_POLL_INTERVAL_MS,
  ANOMALY_SCORE_TIMEFRAME,
  ANOMALY_SERIES_LOOKBACK_DAYS,
  ANOMALY_WARMING_MESSAGE,
  getAnomalyErrorMessage,
  isAnomalyNotReady,
  isAnomalyTsStale,
} from '@/utils/anomalyRealtime';

/**
 * 이상탐지 모니터링
 * - Redis Writer 스냅샷 REST를 series/final로 폴링 (1~3초)
 * - Series로 차트 데이터셋 구성, Final로 상태 카드/마커 구성
 */
const AnomalyDetection: React.FC = () => {
  const [searchParams] = useSearchParams();
  const urlVenueId = searchParams.get('venueId');
  const urlInstrumentId = searchParams.get('instrumentId');

  const [venueOptions, setVenueOptions] = useState<Array<{ id: number; label: string }>>([]);
  const [instrumentOptions, setInstrumentOptions] = useState<Array<{ id: number; label: string }>>([]);

  // draft: UI 선택값 / applied: 실제 폴링에 사용하는 값
  // timeframe은 Writer 스냅샷 키(ANOMALY_SCORE_TIMEFRAME)로 고정 — UI 선택 없음
  const [draftVenueId, setDraftVenueId] = useState<number>(1);
  const [draftInstrumentId, setDraftInstrumentId] = useState<number>(100);
  const [draftMode, setDraftMode] = useState<'max' | 'consensus'>('consensus');

  const [venueId, setVenueId] = useState<number>(1);
  const [instrumentId, setInstrumentId] = useState<number>(100);
  const [scoreVersion] = useState('z_v1');
  const [mode, setMode] = useState<'max' | 'consensus'>('consensus');

  const [series, setSeries] = useState<AnomalySeriesDataset | null>(null);
  const [finalCard, setFinalCard] = useState<AnomalyFinalCardVM | null>(null);
  const [finalMarker, setFinalMarker] = useState<AnomalyFinalMarkerVM | null>(null);
  const [chartRangeMode, setChartRangeMode] = useState<AnomalyChartRangeMode>('1m');
  const isChartLiveTip = chartRangeMode === '1h';

  // score window 레전드: 기본 90d 표시, 30/60은 토글
  const [visibleWindows, setVisibleWindows] = useState<Record<AnomalyWindowDays, boolean>>({
    30: false,
    60: false,
    90: true,
  });

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [warming, setWarming] = useState(false);
  const [stale, setStale] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  const [fixedFromISO, setFixedFromISO] = useState<string>('');
  const fixedFromISORef = useRef<string>('');
  const seriesRef = useRef<AnomalySeriesDataset | null>(null);
  const lastServerTsRef = useRef<string | null>(null);
  const tsFirstSeenAtRef = useRef<number | null>(null);
  const [filtersReady, setFiltersReady] = useState(false);
  const [settingsApplied, setSettingsApplied] = useState(false);
  const didInitialApplyRef = useRef(false);

  const levelMeta = useMemo(() => {
    const level = (finalCard?.finalLevel ?? '').toUpperCase();

    const base = {
      Icon: CheckCircle2,
      iconBg: 'bg-emerald-50',
      iconFg: 'text-emerald-700',
    };

    if (level.includes('SEVERE')) {
      return { Icon: OctagonAlert, iconBg: 'bg-rose-50', iconFg: 'text-rose-700' };
    }
    if (level.includes('ANOMALY') || level.includes('ALERT')) {
      return { Icon: AlertTriangle, iconBg: 'bg-amber-50', iconFg: 'text-amber-700' };
    }
    if (level.includes('WATCH') || level.includes('WARN')) {
      return { Icon: Eye, iconBg: 'bg-slate-50', iconFg: 'text-slate-700' };
    }
    if (level.includes('NORMAL') || level.includes('OK')) {
      return base;
    }

    return { ...base, iconBg: 'bg-gray-50', iconFg: 'text-gray-700' };
  }, [finalCard?.finalLevel]);

  // 필터(venue/instrument) — /anomaly/filter/* (web.market_symbols)
  useEffect(() => {
    let cancelled = false;

    const loadFilters = async () => {
      try {
        const [venues, instruments] = await Promise.all([
          filterService.getVenues(),
          filterService.getInstruments(),
        ]);

        if (cancelled) return;

        const vOpts = (venues ?? [])
          .filter((v) => v.isActive !== false)
          .map((v) => ({
            id: v.venueId,
            label: `${v.venueCode}`,
          }));

        const iOpts = (instruments ?? [])
          .filter((i) => i.isActive !== false)
          .map((i) => ({
            id: i.instrumentId,
            label: `${i.symbol}`,
          }));

        setVenueOptions(vOpts);
        setInstrumentOptions(iOpts);

        const paramVenueId = urlVenueId ? parseInt(urlVenueId, 10) : null;
        const paramInstrumentId = urlInstrumentId ? parseInt(urlInstrumentId, 10) : null;
        const hasValidUrlVenue = paramVenueId != null && !isNaN(paramVenueId) && vOpts.some((x) => x.id === paramVenueId);
        const hasValidUrlInstrument = paramInstrumentId != null && !isNaN(paramInstrumentId) && iOpts.some((x) => x.id === paramInstrumentId);

        const nextVenueId = hasValidUrlVenue ? paramVenueId! : (vOpts[0]?.id ?? 1);
        const nextInstrumentId = hasValidUrlInstrument ? paramInstrumentId! : (iOpts[0]?.id ?? 100);

        setDraftVenueId(nextVenueId);
        setDraftInstrumentId(nextInstrumentId);
        setVenueId(nextVenueId);
        setInstrumentId(nextInstrumentId);
      } catch (e) {
        console.error('❌ 필터(venues/instruments) 로드 실패:', e);
      } finally {
        if (!cancelled) setFiltersReady(true);
      }
    };

    loadFilters();
    return () => {
      cancelled = true;
    };
    // URL params는 마운트 시점에만 반영
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSeriesAndFinal = useCallback(
    async (params: {
      venueId: number;
      instrumentId: number;
      mode: 'max' | 'consensus';
      fromISO: string;
      signal?: AbortSignal;
      forceLoading?: boolean;
    }) => {
      const showLoading = Boolean(params.forceLoading) || !seriesRef.current;
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      try {
        const toISO = toISO8601UTC(new Date());
        const reqOpts = params.signal ? { signal: params.signal } : undefined;

        const [seriesResponse, finalResponse] = await Promise.all([
          anomalyService.getSeries(
            {
              venueId: params.venueId,
              instrumentId: params.instrumentId,
              from: params.fromISO,
              to: toISO,
              timeframe: ANOMALY_SCORE_TIMEFRAME,
              scoreVersion,
            },
            reqOpts
          ),
          anomalyService.getFinal(
            {
              venueId: params.venueId,
              instrumentId: params.instrumentId,
              timeframe: ANOMALY_SCORE_TIMEFRAME,
              scoreVersion,
              mode: params.mode,
            },
            reqOpts
          ),
        ]);

        if (params.signal?.aborted) return;

        const dataset = buildSeriesDataset(seriesResponse, { scoreBands: DEFAULT_ANOMALY_SCORE_BANDS });
        const card = buildFinalCardVM(finalResponse);
        const marker = buildFinalMarkerVM(finalResponse, dataset);

        seriesRef.current = dataset;
        setSeries(dataset);
        setFinalCard(card);
        setFinalMarker(marker);
        setWarming(false);
        setError(null);
        setLastUpdateTime(new Date());

        // candle ts가 아닌 Writer/서버 시각으로 지연 판단 (봉 ts는 수 분간 동일할 수 있음)
        const serverTs = seriesResponse.meta?.serverTime ?? finalResponse.ts ?? null;
        if (serverTs !== lastServerTsRef.current) {
          lastServerTsRef.current = serverTs;
          tsFirstSeenAtRef.current = Date.now();
          setStale(false);
        } else {
          setStale(isAnomalyTsStale(serverTs, tsFirstSeenAtRef.current));
        }
      } catch (err) {
        if (params.signal?.aborted) return;
        if (isAnomalyNotReady(err)) {
          setWarming(true);
          setError(null);
          return;
        }
        console.error('❌ 이상탐지 데이터 조회 실패:', err);
        setWarming(false);
        // 이미 데이터가 있으면 폴링 실패 시 차트를 지우지 않음
        if (!seriesRef.current) {
          setError(getAnomalyErrorMessage(err));
        }
      } finally {
        if (!params.signal?.aborted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [scoreVersion]
  );

  const applySettings = useCallback(
    (reason: 'initial' | 'user') => {
      if (!filtersReady) return;

      const nextVenueId = draftVenueId;
      const nextInstrumentId = draftInstrumentId;
      const nextMode = draftMode;

      setVenueId(nextVenueId);
      setInstrumentId(nextInstrumentId);
      setMode(nextMode);

      // Redis retention(기본 30일)에 맞춘 조회 구간. 적용 시점 from 고정, 이후 to만 전진
      const now = new Date();
      const from = new Date(now.getTime() - ANOMALY_SERIES_LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
      const fromISO = toISO8601UTC(from);
      fixedFromISORef.current = fromISO;
      setFixedFromISO(fromISO);

      // 종목/설정 변경 시 이전 차트는 유지하되, 첫 페인트는 loading
      if (reason === 'user') {
        seriesRef.current = null;
        setSeries(null);
        setFinalCard(null);
        setFinalMarker(null);
        lastServerTsRef.current = null;
        tsFirstSeenAtRef.current = null;
        setStale(false);
      }

      setSettingsApplied(true);
      setWarming(false);
      setError(null);

      void fetchSeriesAndFinal({
        venueId: nextVenueId,
        instrumentId: nextInstrumentId,
        mode: nextMode,
        fromISO,
        forceLoading: true,
      });
    },
    [draftInstrumentId, draftMode, draftVenueId, fetchSeriesAndFinal, filtersReady]
  );

  // 필터 준비 후 1회 자동 적용
  useEffect(() => {
    if (!filtersReady) return;
    if (didInitialApplyRef.current) return;
    didInitialApplyRef.current = true;
    applySettings('initial');
  }, [applySettings, filtersReady]);

  // Redis 스냅샷 실시간 폴링 (보고 있는 종목만)
  const pollRealtime = useCallback(
    async (signal: AbortSignal) => {
      if (!fixedFromISORef.current) return;
      await fetchSeriesAndFinal({
        venueId,
        instrumentId,
        mode,
        fromISO: fixedFromISORef.current,
        signal,
      });
    },
    [fetchSeriesAndFinal, instrumentId, mode, venueId]
  );

  // Final 카드 + 시계열 차트 모두 항상 2초 폴링 (기간 버튼은 보기 구간만 변경)
  useAnomalyPolling(pollRealtime, [venueId, instrumentId, mode, fixedFromISO], {
    enabled: filtersReady && settingsApplied && Boolean(fixedFromISO),
    intervalMs: ANOMALY_POLL_INTERVAL_MS,
    immediate: false,
  });

  const toggleWindow = useCallback((wd: AnomalyWindowDays) => {
    setVisibleWindows((prev) => ({ ...prev, [wd]: !prev[wd] }));
  }, []);

  const currentVenueLabel = useMemo(() => {
    return venueOptions.find((v) => v.id === venueId)?.label ?? String(venueId);
  }, [venueId, venueOptions]);

  const currentInstrumentLabel = useMemo(() => {
    return instrumentOptions.find((i) => i.id === instrumentId)?.label ?? String(instrumentId);
  }, [instrumentId, instrumentOptions]);

  const ANOMALY_FAVORITES_STORAGE_KEY = 'anomaly.favorites.v1';
  const currentFavoriteId = useMemo(() => `${venueId}:${instrumentId}`, [venueId, instrumentId]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem(ANOMALY_FAVORITES_STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as unknown) : [];
      return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
    } catch {
      return [];
    }
  });

  const isFavorited = favoriteIds.includes(currentFavoriteId);
  const toggleFavorite = useCallback(() => {
    setFavoriteIds((prev) => {
      const next = prev.includes(currentFavoriteId)
        ? prev.filter((id) => id !== currentFavoriteId)
        : [...prev, currentFavoriteId];
      try {
        window.localStorage.setItem(ANOMALY_FAVORITES_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // storage가 막혀도 UI는 동작
      }
      return next;
    });
  }, [currentFavoriteId]);

  const headerSubtitle = useMemo(() => {
    const nowISO = toISO8601UTC(new Date());
    return `LIVE · ${ANOMALY_POLL_INTERVAL_MS / 1000}s • (최근 ${ANOMALY_SERIES_LOOKBACK_DAYS}일) ${fixedFromISO || '-'} ~ ${nowISO}`;
  }, [fixedFromISO]);

  const handleRefresh = useCallback(() => {
    if (!fixedFromISORef.current) return;
    void fetchSeriesAndFinal({
      venueId,
      instrumentId,
      mode,
      fromISO: fixedFromISORef.current,
      forceLoading: !seriesRef.current,
    });
  }, [fetchSeriesAndFinal, instrumentId, mode, venueId]);

  const busy = loading || refreshing;

  return (
    <div className="container mx-auto p-4 flex justify-center mt-24 min-h-[700px]">
      {/* 메인 컨테이너 */}
      <div
        className="w-full max-w-[1300px] bg-white rounded-lg flex flex-col h-auto"
        style={{
          boxShadow:
            '0 0 20px 10px rgba(0, 0, 0, 0.5), 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        }}
      >
        {/* 헤더 영역 */}
        <div className="relative px-4 py-4 bg-gradient-to-r from-gray-600 via-gray-800 to-gray-700 rounded-t-lg">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full blur-2xl"></div>

          <div className="relative z-10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <Activity className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">이상탐지 모니터링</h1>
                  <p className="mt-0.5 text-blue-100/90 text-xs">
                    Series/Final · {ANOMALY_POLL_INTERVAL_MS / 1000}초마다 갱신
                  </p>
                </div>
              </div>

              {/* 우측: 실시간 상태 + 새로고침 */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 text-xs text-white/85">
                  <span className="rounded bg-emerald-400/20 px-2 py-0.5 text-emerald-100 font-semibold">
                    LIVE · {ANOMALY_POLL_INTERVAL_MS / 1000}s
                  </span>
                  <span>
                    {lastUpdateTime
                      ? `갱신: ${lastUpdateTime.toLocaleTimeString()}`
                      : '갱신: -'}
                  </span>
                  {warming ? (
                    <span className="rounded bg-amber-400/20 px-2 py-0.5 text-amber-100 font-semibold">
                      {ANOMALY_WARMING_MESSAGE}
                    </span>
                  ) : null}
                  {!warming && stale ? (
                    <span className="rounded bg-amber-400/20 px-2 py-0.5 text-amber-100 font-semibold">
                      실시간 지연
                    </span>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={busy || !filtersReady}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-white/10 hover:bg-white/15 disabled:opacity-50"
                  title="새로고침"
                >
                  <RefreshCw className={`w-4 h-4 text-white ${busy ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 콘텐츠 영역 */}
        <div className="p-6">
          <div className="space-y-6">
            {/* 설정 패널 */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 relative">
              {/* 우상단: 즐겨찾기 (가로 위치 유지, 위로만 이동) */}
              <button
                type="button"
                onClick={toggleFavorite}
                aria-pressed={isFavorited}
                className={`absolute top-6 right-3 z-10 group inline-flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm transition-all select-none ${
                  isFavorited
                    ? 'border-amber-200 bg-amber-50 hover:bg-amber-100/70 hover:shadow-md'
                    : 'border-gray-200 bg-white hover:bg-gray-50 hover:shadow-md'
                }`}
                title={isFavorited ? '즐겨찾기 해제' : '즐겨찾기 추가'}
              >
                <span
                  className={`h-10 w-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-[1.03] ${
                    isFavorited ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <Star
                    className="w-5 h-5"
                    fill={isFavorited ? 'currentColor' : 'none'}
                  />
                </span>

                <span className="min-w-0 text-left">
                  <span className={`block text-[11px] font-bold tracking-wide ${
                    isFavorited ? 'text-amber-700' : 'text-gray-500'
                  }`}>
                    FAVORITE
                  </span>
                  <span className="block text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight truncate max-w-[360px]">
                    {currentVenueLabel}
                    <span className="mx-2 text-gray-300">/</span>
                    {currentInstrumentLabel}
                  </span>
                </span>
              </button>

              {/* 1줄: 셀렉박스 + mode — 우측 즐겨찾기와 겹치지 않게 pr */}
              <div className="flex flex-wrap items-end gap-3 pr-[min(100%,420px)]">
                <div className="w-full sm:w-[200px]">
                  <label className="block text-xs font-medium text-gray-700 mb-1">venue</label>
                  <select
                    value={draftVenueId}
                    onChange={(e) => setDraftVenueId(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {(venueOptions.length > 0 ? venueOptions : [{ id: draftVenueId, label: String(draftVenueId) }]).map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-full sm:w-[240px]">
                  <label className="block text-xs font-medium text-gray-700 mb-1">instrument</label>
                  <select
                    value={draftInstrumentId}
                    onChange={(e) => setDraftInstrumentId(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {(instrumentOptions.length > 0 ? instrumentOptions : [{ id: draftInstrumentId, label: String(draftInstrumentId) }]).map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* mode + 설정 — mode는 draft만 바꾸고, 설정 클릭 시 적용 */}
                <div className="flex items-center gap-4 pb-1 ml-1 pl-4 border-l border-gray-200">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-800">MODE</span>
                    <div className="inline-flex items-center bg-white border border-gray-200 rounded-full p-1 shadow-sm">
                      <label className="relative">
                        <input
                          className="peer sr-only"
                          type="radio"
                          name="final-mode"
                          checked={draftMode === 'consensus'}
                          onChange={() => setDraftMode('consensus')}
                        />
                        <span className="cursor-pointer select-none px-3 py-1.5 text-sm font-semibold rounded-full text-gray-600 transition-colors hover:bg-gray-100 peer-checked:bg-gray-900 peer-checked:text-white peer-checked:hover:bg-gray-800">
                          consensus
                        </span>
                      </label>
                      <label className="relative">
                        <input
                          className="peer sr-only"
                          type="radio"
                          name="final-mode"
                          checked={draftMode === 'max'}
                          onChange={() => setDraftMode('max')}
                        />
                        <span className="cursor-pointer select-none px-3 py-1.5 text-sm font-semibold rounded-full text-gray-600 transition-colors hover:bg-gray-100 peer-checked:bg-gray-900 peer-checked:text-white peer-checked:hover:bg-gray-800">
                          max
                        </span>
                      </label>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => applySettings('user')}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-semibold border shadow-sm transition-all hover:shadow-md ${
                      busy
                        ? 'bg-gray-100 text-gray-500 border-gray-200'
                        : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                    title="설정"
                    disabled={busy || !filtersReady}
                  >
                    <Settings2 className="w-4 h-4" />
                    <span>설정</span>
                  </button>
                </div>
              </div>

              <div className="mt-2 text-xs text-gray-500 pr-[min(100%,420px)]">{headerSubtitle}</div>
            </div>

            {/* 상단 현재 상태 카드 — 항상 2초 폴링 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {finalCard ? (
                <div className="flex flex-col md:flex-row gap-6 md:items-start md:justify-between">
                  {/* 현재 상태 블록만 살짝 오른쪽으로 */}
                  <div className="pl-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>• STATUS</span>
                      <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                        LIVE · {ANOMALY_POLL_INTERVAL_MS / 1000}s
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-3">
                      <span
                        className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${levelMeta.iconBg}`}
                        aria-hidden
                      >
                        <levelMeta.Icon className={`w-5 h-5 ${levelMeta.iconFg}`} />
                      </span>
                      <div className="text-4xl font-bold text-gray-900 tracking-tight">
                        {finalCard.finalLevel ?? 'N/A'}
                      </div>
                    </div>
                    <div className="mt-3 text-base text-gray-700 space-x-4">
                      <span>
                        finalScore:{' '}
                        <strong>{finalCard.finalScore === null ? 'N/A' : finalCard.finalScore.toFixed(2)}</strong>
                      </span>
                      <span>basis: <strong>{finalCard.basis ?? '-'}</strong></span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      갱신 시각:{' '}
                      <strong className="tabular-nums">
                        {lastUpdateTime ? lastUpdateTime.toLocaleString('ko-KR') : '-'}
                      </strong>
                    </div>
                  </div>

                  {/* 상태 설명(가운데 빈 공간) */}
                  <div className="hidden md:block flex-1 px-4 pt-1">
                    <div className="text-xs font-semibold text-gray-700 mb-2">상태 기준</div>
                    <div className="text-xs text-gray-600 leading-relaxed space-y-1">
                      <div className="flex items-start gap-2">
                        <span className="mt-[3px] inline-block h-2 w-2 rounded-full bg-emerald-500/70" />
                        <div>
                          <span className="font-semibold text-gray-800">NORMAL</span>
                          <span className="ml-2">최종 점수가 낮아 정상 범위</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="mt-[3px] inline-block h-2 w-2 rounded-full bg-slate-500/70" />
                        <div>
                          <span className="font-semibold text-gray-800">WATCH</span>
                          <span className="ml-2">
                            관찰 구간 (기준선 {DEFAULT_ANOMALY_SCORE_BANDS.watch} 이상)
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="mt-[3px] inline-block h-2 w-2 rounded-full bg-amber-500/70" />
                        <div>
                          <span className="font-semibold text-gray-800">ANOMALY</span>
                          <span className="ml-2">
                            이상 징후 (기준선 {DEFAULT_ANOMALY_SCORE_BANDS.anomaly} 이상)
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="mt-[3px] inline-block h-2 w-2 rounded-full bg-rose-500/70" />
                        <div>
                          <span className="font-semibold text-gray-800">SEVERE</span>
                          <span className="ml-2">
                            강한 이상 (기준선 {DEFAULT_ANOMALY_SCORE_BANDS.severe} 이상)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="min-w-[360px]">
                    <div className="text-sm font-semibold text-gray-800 mb-2">components (30/60/90)</div>
                    <div className="space-y-2">
                      {finalCard.rows.map((r) => (
                        <div key={r.windowDays} className="flex items-center justify-between text-sm bg-gray-50 rounded-md px-3 py-2 border border-gray-200">
                          <div className="text-gray-700 w-[52px]">{r.windowDays}d</div>
                          <div className="text-gray-900 font-semibold w-[80px] text-right">
                            {r.score === null ? 'N/A' : r.score.toFixed(2)}
                          </div>
                          <div className="text-gray-700 w-[70px] text-center">{r.driver ?? '-'}</div>
                          <div className="text-gray-700 flex-1 text-right tabular-nums">
                            <span className="mr-2">zRet={r.zRet === null ? 'N/A' : r.zRet.toFixed(2)}</span>
                            <span className="mr-2">zVol={r.zVol === null ? 'N/A' : r.zVol.toFixed(2)}</span>
                            <span>zRng={r.zRng === null ? 'N/A' : r.zRng.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : warming ? (
                <div className="text-amber-700 font-medium">{ANOMALY_WARMING_MESSAGE}… Writer 워밍업 후 자동 갱신됩니다.</div>
              ) : (
                <div className="text-gray-500">{loading ? 'Final 로딩 중...' : 'Final 데이터가 없습니다.'}</div>
              )}
            </div>

            {/* 시계열 차트 — 기간은 보기만. 배지/설명은 1H(tip LIVE) vs 그 외(5m) */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-gray-800">시계열 차트</span>
                {isChartLiveTip ? (
                  <span className="rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                    LIVE · {ANOMALY_POLL_INTERVAL_MS / 1000}s
                  </span>
                ) : (
                  <span className="rounded bg-slate-50 px-2 py-0.5 text-[11px] font-bold text-slate-600 border border-slate-200">
                    5m
                  </span>
                )}
              </div>
              <p className="mb-4 text-xs text-gray-500">
                {isChartLiveTip
                  ? `1H는 tip 샘플 궤적 보기입니다. 차트는 ${ANOMALY_POLL_INTERVAL_MS / 1000}초마다 폴링되며, tip이 샘플 시각으로 이어집니다(최근 1시간 보관).`
                  : '1M/1W/1D는 5분 확정봉 중심 보기입니다. tip 밀도는 맨 끝 최근 1시간에만 있고, 그 이전은 5m 봉입니다.'}
              </p>
              {warming && !series ? (
                <div className="text-amber-700 font-medium">
                  {ANOMALY_WARMING_MESSAGE} — 시세 스냅샷이 준비되면 차트가 표시됩니다.
                </div>
              ) : error && !series ? (
                <div className="text-red-600">❌ {error}</div>
              ) : !series ? (
                <div className="text-gray-500">{loading ? 'Series 로딩 중...' : '표시할 데이터가 없습니다.'}</div>
              ) : (
                <>
                  {warming ? (
                    <div className="mb-3 text-sm text-amber-700 font-medium">
                      {ANOMALY_WARMING_MESSAGE} — 마지막 성공 스냅샷을 유지합니다.
                    </div>
                  ) : null}
                  {stale && !warming ? (
                    <div className="mb-3 text-sm text-amber-700 font-medium">실시간 지연 — 서버 스냅샷이 잠시 갱신되지 않습니다.</div>
                  ) : null}
                  <AnomalyChart
                    dataset={series}
                    visibleWindows={visibleWindows}
                    onToggleWindow={toggleWindow}
                    finalMarker={finalMarker}
                    onRangeModeChange={setChartRangeMode}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnomalyDetection;

