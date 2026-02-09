import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AnomalyChart from './AnomalyChart';
import anomalyService from '@/services/AnomalyService';
import filterService from '@/services/FilterService';
import {
  DEFAULT_ANOMALY_SCORE_BANDS,
  type AnomalyFinalCardVM,
  type AnomalyFinalMarkerVM,
  type AnomalySeriesDataset,
  type AnomalyWindowDays,
} from '@/types/AnomalyTypes';
import { Activity, Settings2 } from 'lucide-react';
import { RefreshCw } from 'lucide-react';
import { getNextCandleStartTime, getTimeUntilNextCandle, toISO8601UTC } from '@/utils/timeframeUtils';
import { buildFinalCardVM, buildFinalMarkerVM, buildSeriesDataset } from '@/utils/anomalyTransform';

/**
 * 이상탐지 메인 컴포넌트
 * - 단일 화면: Series(A)로 차트 데이터셋 구성 → Final(B)로 상태 카드/마커 구성
 */
const AnomalyDetection: React.FC = () => {
  // 화면에서 설정하는 4개: venueId / instrumentId / timeframe / mode
  const [venueOptions, setVenueOptions] = useState<Array<{ id: number; label: string }>>([]);
  const [instrumentOptions, setInstrumentOptions] = useState<Array<{ id: number; label: string }>>([]);

  // draft: UI에서 선택만 하고, "설정"을 눌렀을 때만 적용(applied)됩니다.
  const [draftVenueId, setDraftVenueId] = useState<number>(1);
  const [draftInstrumentId, setDraftInstrumentId] = useState<number>(100);
  const [draftTimeframe, setDraftTimeframe] = useState('5m');
  const [draftMode, setDraftMode] = useState<'max' | 'consensus'>('consensus');

  // applied: 실제 API 호출/자동갱신에 사용되는 값
  const [venueId, setVenueId] = useState<number>(1);
  const [instrumentId, setInstrumentId] = useState<number>(100);
  const [timeframe, setTimeframe] = useState('5m');
  const [scoreVersion] = useState('z_v1'); // 기본값
  const [mode, setMode] = useState<'max' | 'consensus'>('consensus');

  const [series, setSeries] = useState<AnomalySeriesDataset | null>(null);
  const [finalCard, setFinalCard] = useState<AnomalyFinalCardVM | null>(null);
  const [finalMarker, setFinalMarker] = useState<AnomalyFinalMarkerVM | null>(null);

  const [visibleWindows, setVisibleWindows] = useState<Record<AnomalyWindowDays, boolean>>({
    30: false,
    60: false,
    90: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [nextRefreshTime, setNextRefreshTime] = useState<Date | null>(null);
  const autoRefreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const SERIES_LOOKBACK_DAYS = 90;

  // "현재시간 90일 전" 고정 from (한 번 정해지면 다음 갱신에서는 to만 움직임)
  // - 초기 로드시 "딱 1번"만 series/final을 호출하기 위해, fixedFromISO 변경이 fetch 트리거가 되지 않도록 구조를 분리합니다.
  const [fixedFromISO, setFixedFromISO] = useState<string>('');
  const fixedFromISORef = useRef<string>('');
  const [filtersReady, setFiltersReady] = useState(false);
  const didInitialApplyRef = useRef(false);

  // 필터(venue/instrument) 옵션 로드
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
            // UI 라벨에서는 id 숫자를 숨김 (예: BTC(1) 같은 표기 제거)
            label: `${v.venueCode}`,
          }));

        const iOpts = (instruments ?? [])
          .filter((i) => i.isActive !== false)
          .map((i) => ({
            id: i.instrumentId,
            // UI 라벨에서는 id 숫자를 숨김 (예: BTC(1) 같은 표기 제거)
            label: `${i.symbol}`,
          }));

        setVenueOptions(vOpts);
        setInstrumentOptions(iOpts);

        // 기본 선택값 보정: draft/applied 모두 유효한 값으로 맞춤
        const nextVenueId = vOpts[0]?.id ?? 1;
        const nextInstrumentId = iOpts[0]?.id ?? 100;

        setDraftVenueId((prev) => (vOpts.some((x) => x.id === prev) ? prev : nextVenueId));
        setDraftInstrumentId((prev) => (iOpts.some((x) => x.id === prev) ? prev : nextInstrumentId));

        setVenueId((prev) => (vOpts.some((x) => x.id === prev) ? prev : nextVenueId));
        setInstrumentId((prev) => (iOpts.some((x) => x.id === prev) ? prev : nextInstrumentId));
      } catch (e) {
        // 필터 로드는 실패해도 화면 자체는 동작 가능(기본값으로 series/final 호출)
        console.error('❌ 필터(venues/instruments) 로드 실패:', e);
      } finally {
        if (!cancelled) setFiltersReady(true);
      }
    };

    loadFilters();
    return () => {
      cancelled = true;
    };
    // 처음 1회 로드
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSeriesThenFinal = useCallback(
    async (params: {
      venueId: number;
      instrumentId: number;
      timeframe: string;
      mode: 'max' | 'consensus';
      fromISO: string;
      toTime?: Date;
    }) => {
      try {
        setLoading(true);
        setError(null);

        const toISO = toISO8601UTC(params.toTime ?? new Date());

        const seriesResponse = await anomalyService.getSeries({
          venueId: params.venueId,
          instrumentId: params.instrumentId,
          from: params.fromISO,
          to: toISO,
          timeframe: params.timeframe,
          scoreVersion,
        });

        const dataset = buildSeriesDataset(seriesResponse, { scoreBands: DEFAULT_ANOMALY_SCORE_BANDS });
        setSeries(dataset);
        setLastUpdateTime(new Date());

        // series(A) 이후 final(B)
        const finalResponse = await anomalyService.getFinal({
          venueId: params.venueId,
          instrumentId: params.instrumentId,
          timeframe: params.timeframe,
          scoreVersion,
          mode: params.mode,
        });

        const card = buildFinalCardVM(finalResponse);
        const marker = buildFinalMarkerVM(finalResponse, dataset);

        setFinalCard(card);
        setFinalMarker(marker);

        const nextRefresh = getNextCandleStartTime(params.timeframe, new Date());
        setNextRefreshTime(nextRefresh);
      } catch (err) {
        console.error('❌ 이상탐지 데이터 조회 실패:', err);
        setError(err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    },
    [scoreVersion]
  );

  const applySettingsAndFetch = useCallback(
    async (reason: 'initial' | 'user') => {
      if (!filtersReady) return;

      const nextVenueId = draftVenueId;
      const nextInstrumentId = draftInstrumentId;
      const nextTimeframe = draftTimeframe;
      const nextMode = draftMode;

      // 적용
      setVenueId(nextVenueId);
      setInstrumentId(nextInstrumentId);
      setTimeframe(nextTimeframe);
      setMode(nextMode);

      // from 고정 재설정(적용 시점 기준으로 90일 전)
      const now = new Date();
      const from = new Date(now.getTime() - SERIES_LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
      const fromISO = toISO8601UTC(from);
      fixedFromISORef.current = fromISO;
      setFixedFromISO(fromISO);

      await fetchSeriesThenFinal({
        venueId: nextVenueId,
        instrumentId: nextInstrumentId,
        timeframe: nextTimeframe,
        mode: nextMode,
        fromISO,
      });

      if (reason === 'user') {
        // 적용을 눌렀을 때만 명시적으로 갱신 시간 표시가 바뀌게 됨(UX)
        setLastUpdateTime(new Date());
      }
    },
    [draftInstrumentId, draftMode, draftTimeframe, draftVenueId, fetchSeriesThenFinal, filtersReady]
  );

  // 초기 1회만 자동 적용(화면 렌더 시 series 1번 + final 1번)
  useEffect(() => {
    if (!filtersReady) return;
    if (didInitialApplyRef.current) return;
    didInitialApplyRef.current = true;
    applySettingsAndFetch('initial').catch(() => {
      // 에러는 fetch 내부에서 처리
    });
  }, [applySettingsAndFetch, filtersReady]);

  // 자동 갱신: 다음 봉 시작 시점에 series → final 재호출
  useEffect(() => {
    let cancelled = false;

    if (autoRefreshTimeoutRef.current) {
      clearTimeout(autoRefreshTimeoutRef.current);
      autoRefreshTimeoutRef.current = null;
    }
    if (!filtersReady) return;
    if (!fixedFromISORef.current) return;

    const scheduleNext = () => {
      if (cancelled) return;
      const now = new Date();
      const waitMs = Math.max(getTimeUntilNextCandle(timeframe, now), 1000);
      autoRefreshTimeoutRef.current = setTimeout(() => {
        if (cancelled) return;
        const nextCandleStart = getNextCandleStartTime(timeframe, new Date());
        fetchSeriesThenFinal({
          venueId,
          instrumentId,
          timeframe,
          mode,
          fromISO: fixedFromISORef.current,
          toTime: nextCandleStart,
        })
          .catch(() => {
            // 실패해도 다음 스케줄은 유지
          })
          .finally(() => scheduleNext());
      }, waitMs);
    };

    scheduleNext();
    return () => {
      cancelled = true;
      if (autoRefreshTimeoutRef.current) {
        clearTimeout(autoRefreshTimeoutRef.current);
        autoRefreshTimeoutRef.current = null;
      }
    };
  }, [filtersReady, fetchSeriesThenFinal, instrumentId, mode, timeframe, venueId]);

  const toggleWindow = (wd: AnomalyWindowDays) => {
    setVisibleWindows((prev) => ({ ...prev, [wd]: !prev[wd] }));
  };

  const headerSubtitle = useMemo(() => {
    const nowISO = toISO8601UTC(new Date());
    return `${timeframe} • (최근 ${SERIES_LOOKBACK_DAYS}일 고정) ${fixedFromISO} ~ ${nowISO}`;
  }, [fixedFromISO, timeframe]);

  const handleRefresh = useCallback(() => {
    if (!fixedFromISORef.current) return;
    fetchSeriesThenFinal({
      venueId,
      instrumentId,
      timeframe,
      mode,
      fromISO: fixedFromISORef.current,
    }).catch(() => {
      // 에러는 fetch 내부에서 처리
    });
  }, [fetchSeriesThenFinal, instrumentId, mode, timeframe, venueId]);

  return (
    <div className="container mx-auto p-4 flex justify-center mt-24 min-h-[700px]">
      {/* 메인 컨테이너 */}
      <div
        className="w-full max-w-[1400px] bg-white rounded-lg flex flex-col h-auto"
        style={{
          boxShadow:
            '0 0 20px 10px rgba(0, 0, 0, 0.5), 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        }}
      >
        {/* 헤더 영역 */}
        <div className="relative px-4 py-3 bg-gradient-to-r from-gray-600 via-gray-800 to-gray-700 rounded-t-lg">
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
                  <h1 className="text-xl font-bold text-white tracking-tight">이상탐지</h1>
                  <p className="mt-0.5 text-blue-100/90 text-xs">이상점수 모니터링 (Series/Final)</p>
                </div>
              </div>

              {/* 새로고침: 최상단 오른쪽 끝 아이콘 */}
              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading || !filtersReady}
                className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-white/10 hover:bg-white/15 disabled:opacity-50"
                title="새로고침"
              >
                <RefreshCw className={`w-4 h-4 text-white ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* 콘텐츠 영역 */}
        <div className="p-6">
          <div className="space-y-6">
            {/* 설정 패널 */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              {/* 1줄: 셀렉박스 + mode(옆에 붙임) */}
              <div className="flex flex-wrap items-end gap-3">
                <div className="w-full sm:w-[200px]">
                  <label className="block text-xs font-medium text-gray-700 mb-1">venueId</label>
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
                  <label className="block text-xs font-medium text-gray-700 mb-1">instrumentId</label>
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

                <div className="w-full sm:w-[160px]">
                  <label className="block text-xs font-medium text-gray-700 mb-1">timeframe</label>
                  <select
                    value={draftTimeframe}
                    onChange={(e) => setDraftTimeframe(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1m">1분</option>
                    <option value="5m">5분</option>
                    <option value="15m">15분</option>
                    <option value="30m">30분</option>
                    <option value="1h">1시간</option>
                    <option value="4h">4시간</option>
                    <option value="1d">1일</option>
                  </select>
                </div>

                {/* mode + 설정: timeframe 옆(간격/디자인 개선) */}
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
                    onClick={() => applySettingsAndFetch('user')}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-semibold border shadow-sm transition-all hover:shadow-md ${
                      loading
                        ? 'bg-gray-100 text-gray-500 border-gray-200'
                        : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                    title="설정"
                    disabled={loading || !filtersReady}
                  >
                    <Settings2 className="w-4 h-4" />
                    <span>설정</span>
                  </button>
                </div>

                <div className="ml-auto flex items-center gap-2 text-xs text-gray-500 pb-2">
                  <span>{lastUpdateTime ? `업데이트: ${lastUpdateTime.toLocaleTimeString()}` : '업데이트: -'}</span>
                  {nextRefreshTime ? <span>{`/ 다음: ${nextRefreshTime.toLocaleTimeString()}`}</span> : null}
                </div>
              </div>

              {/* 밑: 설정 버튼 */}
              <div className="mt-2 text-xs text-gray-500">{headerSubtitle}</div>

              {/* Score 라인 토글 (항상 노출: API 재호출 없이 on/off만 변경) */}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                <span className="text-gray-700 font-medium">Score 라인</span>
                {[30, 60, 90].map((wd) => (
                  <label key={wd} className="flex items-center gap-2 text-gray-700">
                    <input
                      type="checkbox"
                      checked={visibleWindows[wd as AnomalyWindowDays]}
                      onChange={() => toggleWindow(wd as AnomalyWindowDays)}
                      className="h-4 w-4"
                    />
                    <span>{wd}d</span>
                  </label>
                ))}
                <span className="ml-auto text-xs text-gray-500">기본값: 90d만 ON</span>
              </div>
            </div>

            {/* 상단 현재 상태 카드 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {finalCard ? (
                <div className="flex flex-col md:flex-row gap-6 md:items-start md:justify-between">
                  <div>
                    <div className="text-xs text-gray-500">현재 상태</div>
                    <div className="text-3xl font-bold text-gray-900 mt-1">
                      {finalCard.finalLevel ?? 'N/A'}
                    </div>
                    <div className="mt-2 text-sm text-gray-700 space-x-3">
                      <span>
                        finalScore:{' '}
                        <strong>{finalCard.finalScore === null ? 'N/A' : finalCard.finalScore.toFixed(2)}</strong>
                      </span>
                      <span>basis: <strong>{finalCard.basis ?? '-'}</strong></span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      ts: {finalCard.ts ?? '-'} {finalMarker ? '' : '(마커 없음)'}
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
              ) : (
                <div className="text-gray-500">{loading ? 'Final 로딩 중...' : 'Final 데이터가 없습니다.'}</div>
              )}
            </div>

            {/* 차트 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {error ? (
                <div className="text-red-600">❌ {error}</div>
              ) : !series ? (
                <div className="text-gray-500">{loading ? 'Series 로딩 중...' : '표시할 데이터가 없습니다.'}</div>
              ) : (
                <AnomalyChart dataset={series} visibleWindows={visibleWindows} finalMarker={finalMarker} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnomalyDetection;

