import { useCallback, useRef, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, BarChart2, Gauge, Info, Radar, TrendingUp } from 'lucide-react';
import anomalyService from '@/services/AnomalyService';
import type {
  AnomalyScoreTopResponse,
  AnomalyScoreTopItem,
} from '@/types/AnomalyListTypes';
import { useAnomalyPolling } from '@/hooks/anomaly/useAnomalyPolling';
import {
  ANOMALY_POLL_INTERVAL_MS,
  ANOMALY_SCORE_TIMEFRAME,
  ANOMALY_WARMING_MESSAGE,
  getAnomalyErrorMessage,
  isAnomalyNotReady,
} from '@/utils/anomalyRealtime';
import {
  SoftCloudMotionStyles,
  SoftCloudText,
  useCloudMist,
  usePrefersReducedMotion,
} from '@/components/anomaly/softCloudMotion';

type TopListStatus = 'loading' | 'ready' | 'warming' | 'error';

const CARD_ICONS = {
  agg: Activity,
  vol: BarChart2,
  rng: Gauge,
  ret: TrendingUp,
} as const;

const CARD_CONFIG = {
  agg: {
    accent: '#2563eb',
    accentDim: 'rgba(37,99,235,0.12)',
    accentGlow: 'rgba(37,99,235,0.35)',
    label: 'AGG',
  },
  vol: {
    accent: '#3b82f6',
    accentDim: 'rgba(59,130,246,0.12)',
    accentGlow: 'rgba(59,130,246,0.35)',
    label: 'VOL',
  },
  rng: {
    accent: '#64748b',
    accentDim: 'rgba(100,116,139,0.12)',
    accentGlow: 'rgba(100,116,139,0.3)',
    label: 'RNG',
  },
  ret: {
    accent: '#dc2626',
    accentDim: 'rgba(220,38,38,0.12)',
    accentGlow: 'rgba(220,38,38,0.35)',
    label: 'RET',
  },
} as const;

/** API score 단위(백엔드 스냅샷 키). UI에는 노출하지 않음 — 화면은 2초 폴링으로 최신 스냅샷을 표시 */
const MAIN_TOP_DEFAULTS = {
  timeframe: ANOMALY_SCORE_TIMEFRAME,
  limit: 10,
  deltaBars: 6,
} as const;

const COL_WIDTH = {
  rank: 16,
  barHint: 88,
  bar: 48,
  score: 40,
  meta: 52,
} as const;

/** 종합 이상(AGG): 종합 점수에 가장 크게 기여한(가장 이상했던) 지표 */
const DRIVER_LABEL: Record<string, string> = {
  VOL: '주원인:거래량',
  RET: '주원인:수익률',
  RNG: '주원인:변동폭',
};

function buildFetchConfig(mode: 'consensus' | 'max', signal?: AbortSignal) {
  const base = { ...MAIN_TOP_DEFAULTS, mode };
  const opts = signal ? { signal } : undefined;
  return [
    {
      key: 'agg' as const,
      title: '종합 이상',
      sub: 'finalScore (mode 합성)',
      desc: '30·60·90일 점수를 mode로 합성한 종합 이상도입니다.',
      fetch: () => anomalyService.getTop(base, opts),
    },
    {
      key: 'vol' as const,
      title: '거래량 이상',
      sub: 'metricValue (|z_vol|)',
      desc: '거래량(log volume)의 Z-Score 절댓값입니다. 평소보다 거래가 얼마나 튀었는지 봅니다.',
      fetch: () => anomalyService.getTopVol(base, opts),
    },
    {
      key: 'rng' as const,
      title: '변동폭 이상',
      sub: 'metricValue (|z_rng|)',
      desc: '고가·저가 범위(range)의 Z-Score 절댓값입니다. 변동폭이 평소보다 큰지 봅니다.',
      fetch: () => anomalyService.getTopRng(base, opts),
    },
    {
      key: 'ret' as const,
      title: '급등/급락',
      sub: 'metricValue (|z_ret|) + direction',
      desc: '수익률(log return) Z-Score 절댓값과 방향(UP/DOWN)입니다. 급등·급락 크기를 봅니다.',
      fetch: () => anomalyService.getTopRet(base, opts),
    },
  ] as const;
}

type CardKey = 'agg' | 'vol' | 'rng' | 'ret';

function formatFetchedAt(d: Date | null): string {
  if (!d) return '--:--:--';
  return d.toLocaleString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  });
}

function ScoreBar({ val, max = 5 }: { val: number | null; max?: number }) {
  const pct = val == null ? 0 : Math.min((val / max) * 100, 100);
  return (
    <div style={{ width: COL_WIDTH.bar, height: 4, background: 'rgba(0,0,0,0.08)', borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
      <div style={{
        height: '100%',
        width: `${pct}%`,
        background: '#111827',
        borderRadius: 2,
        transition: 'width 1.35s cubic-bezier(0.4, 0, 0.2, 1)',
      }} />
    </div>
  );
}

const LEVEL_CONFIG: Record<string, { bg: string; fg: string; label: string }> = {
  SEVERE:  { bg: 'rgba(220,38,38,0.18)',   fg: '#dc2626', label: '위험' },
  ANOMALY: { bg: 'rgba(220,38,38,0.15)',   fg: '#dc2626', label: '이상' },
  WATCH:   { bg: 'rgba(249,115,22,0.18)',  fg: '#ea580c', label: '주의' },
  NORMAL:  { bg: 'rgba(100,116,139,0.12)', fg: '#64748b', label: '정상' },
};

function FinalLevelPill({ level, showNormal = false }: { level: string; showNormal?: boolean }) {
  if (!level) return null;
  const l = level.toUpperCase();
  if (l === 'NORMAL' && !showNormal) return null;
  const c = LEVEL_CONFIG[l] ?? { bg: 'rgba(0,0,0,0.06)', fg: '#6b7280', label: l } as const;
  return (
    <span style={{
      fontSize: 9, padding: '1px 5px', borderRadius: 3,
      background: c.bg, color: c.fg, fontWeight: 700,
      letterSpacing: '0.04em', flexShrink: 0,
      border: `1px solid ${c.fg}44`,
    }}>
      {c.label}
    </span>
  );
}

function DirectionChip({ direction }: { direction?: string }) {
  if (!direction) return null;
  const map: Record<string, { icon: string; color: string }> = {
    UP:    { icon: '▲', color: '#dc2626' },
    DOWN:  { icon: '▼', color: '#2563eb' },
    MIXED: { icon: '◆', color: '#64748b' },
    FLAT:  { icon: '─', color: '#94a3b8' },
  };
  const m = map[direction] ?? { icon: direction, color: '#9ca3af' };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        color: m.color,
        fontSize: 10,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {m.icon} {direction}
    </span>
  );
}

function RapidChangeBadge({ delta }: { delta: number | null }) {
  if (delta == null) return null;
  const abs = Math.abs(delta);
  const isExplosive = abs >= 2;
  const isRapid = abs >= 1;
  if (!isExplosive && !isRapid) return null;

  const badge = isExplosive ? '폭발' : '급변';
  const badgeStyle = isExplosive
    ? {
        fontSize: 9,
        padding: '2px 6px',
        borderRadius: 4,
        fontWeight: 800,
        letterSpacing: '0.06em',
        background: 'linear-gradient(135deg, rgba(220,38,38,0.25), rgba(239,68,68,0.2))',
        color: '#dc2626',
        border: '1px solid rgba(220,38,38,0.5)',
        boxShadow: '0 0 8px rgba(220,38,38,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
        animation: 'deltaPulse 1.5s ease-in-out infinite',
      }
    : {
        fontSize: 9,
        padding: '2px 5px',
        borderRadius: 3,
        fontWeight: 700,
        letterSpacing: '0.04em',
        background: 'linear-gradient(135deg, rgba(249,115,22,0.25), rgba(234,88,12,0.18))',
        color: '#ea580c',
        border: '1px solid rgba(249,115,22,0.45)',
        boxShadow: '0 0 6px rgba(249,115,22,0.25)',
      };

  return <span style={badgeStyle as CSSProperties}>{badge}</span>;
}

function DeltaChip({ delta, reducedMotion }: { delta: number | null; reducedMotion: boolean }) {
  if (delta == null) {
    return <span style={{ color: '#64748b', fontSize: 10 }}>—</span>;
  }
  const isUp = delta > 0;
  const color = isUp ? '#dc2626' : '#2563eb';
  const text = `${isUp ? '↑' : '↓'} ${delta.toFixed(2)}`;
  return (
    <SoftCloudText
      text={text}
      reducedMotion={reducedMotion}
      style={{
        color,
        fontWeight: 600,
        fontSize: 10,
        fontVariantNumeric: 'tabular-nums',
        flexShrink: 0,
        display: 'inline-block',
      }}
    />
  );
}

function CardRow({ keyType, item, onClick, accent, reducedMotion }: {
  keyType: CardKey;
  item: AnomalyScoreTopItem;
  onClick: () => void;
  accent: string;
  reducedMotion: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  const metricVal = keyType === 'agg'
    ? (item.finalScore ?? null)
    : (item.metricValue ?? null);

  const valStr = metricVal != null ? metricVal.toFixed(2) : '—';
  const mistKey = [
    item.rank,
    item.finalLevel,
    metricVal == null ? 'n' : Math.round(metricVal * 100),
    item.delta == null ? 'n' : Math.round(item.delta * 100),
  ].join('|');
  const mist = useCloudMist(mistKey, reducedMotion);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={mist ? 'anomaly-row-mist' : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '7px 10px',
        borderRadius: 6,
        cursor: 'pointer',
        background: hovered ? 'rgba(0,0,0,0.03)' : 'transparent',
        borderLeft: `2px solid ${hovered ? accent : 'transparent'}`,
        transition: 'background 0.55s ease, border-color 0.45s ease',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Rank */}
      <SoftCloudText
        text={String(item.rank)}
        reducedMotion={reducedMotion}
        style={{
          fontSize: 10,
          color: '#6b7280',
          width: COL_WIDTH.rank,
          flexShrink: 0,
          textAlign: 'right',
          fontVariantNumeric: 'tabular-nums',
          display: 'inline-block',
        }}
      />

      {/* Symbol + 정상/급변 배지 */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
        <span style={{
          fontSize: 12, fontWeight: 700, color: '#1f2937',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          letterSpacing: '0.02em',
        }}>
          {item.symbol}
        </span>
        <FinalLevelPill level={item.finalLevel} showNormal={keyType === 'agg'} />
        <RapidChangeBadge delta={item.delta} />
      </div>

      {/* Bar 왼쪽: 고정 너비로 그리드 정렬 */}
      <div style={{ width: COL_WIDTH.barHint, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        {keyType === 'ret' && <DirectionChip direction={item.direction} />}
        {keyType === 'agg' && item.driver && (
          <span style={{ fontSize: 9, color: '#6b7280', fontWeight: 600, whiteSpace: 'nowrap' }}>
            {DRIVER_LABEL[item.driver.toUpperCase()] ?? item.driver}
          </span>
        )}
      </div>

      {/* Score bar */}
      <ScoreBar val={metricVal} />

      {/* Value */}
      <SoftCloudText
        text={valStr}
        reducedMotion={reducedMotion}
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: '#111827',
          fontVariantNumeric: 'tabular-nums',
          flexShrink: 0,
          width: COL_WIDTH.score,
          textAlign: 'right',
          display: 'inline-block',
        }}
      />

      {/* META */}
      <div style={{ width: COL_WIDTH.meta, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <DeltaChip delta={item.delta} reducedMotion={reducedMotion} />
      </div>
    </div>
  );
}

export default function AnomalyTopList() {
  const navigate = useNavigate();
  const reducedMotion = usePrefersReducedMotion();
  const [mode, setMode] = useState<'consensus' | 'max'>('consensus');
  const [topLists, setTopLists] = useState<Record<string, AnomalyScoreTopResponse | null>>({
    agg: null, vol: null, rng: null, ret: null,
  });
  const [status, setStatus] = useState<TopListStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  /** API 응답의 봉 ts가 아니라, 폴링으로 데이터를 받은 시각 (2초마다 갱신) */
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);
  const hasDataRef = useRef(false);

  const pollTopLists = useCallback(async (signal: AbortSignal) => {
    const config = buildFetchConfig(mode, signal);
    const results = await Promise.allSettled(
      config.map(async (c) => ({ key: c.key, data: await c.fetch() }))
    );

    if (signal.aborted) return;

    const errors: unknown[] = [];
    let fulfilledCount = 0;
    const patch: Partial<Record<CardKey, AnomalyScoreTopResponse>> = {};

    results.forEach((r, i) => {
      const key = config[i].key;
      if (r.status === 'fulfilled') {
        patch[key] = r.value.data;
        fulfilledCount += 1;
      } else {
        errors.push(r.reason);
      }
    });

    if (fulfilledCount > 0) {
      setTopLists((prev) => ({ ...prev, ...patch }));
      setFetchedAt(new Date());
    }

    if (fulfilledCount === 0) {
      const allNotReady = errors.length > 0 && errors.every((e) => isAnomalyNotReady(e));
      if (allNotReady) {
        setStatus('warming');
        setErrorMessage(null);
        return;
      }
      if (!hasDataRef.current) {
        setStatus('error');
        setErrorMessage(getAnomalyErrorMessage(errors[0]));
      }
      return;
    }

    hasDataRef.current = true;
    setStatus('ready');
    setErrorMessage(null);
  }, [mode]);

  useAnomalyPolling(pollTopLists, [mode]);

  const topListConfig = buildFetchConfig(mode);

  return (
    <div style={{
      background: '#f8fafc',
      borderRadius: 10,
      overflow: 'hidden',
      maxWidth: 1100,
      margin: '0 auto',
      boxShadow: '0 0 0 1px rgba(15,23,42,0.08), 0 4px 24px rgba(15,23,42,0.1)',
      position: 'relative',
      border: '1px solid rgba(100,116,139,0.12)',
    }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)',
        padding: '16px 24px',
        borderBottom: '1px solid rgba(100,116,139,0.12)',
        boxShadow: '0 2px 8px rgba(15,23,42,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        position: 'relative',
      }}>
        {/* 1행: Title + Params */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(100,116,139,0.12)',
              border: '1px solid rgba(100,116,139,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Radar size={20} color="#64748b" strokeWidth={2.5} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: '#475569', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>
                이상 탐지 리스트
              </span>
              <span style={{ fontSize: 11, color: '#64748b', letterSpacing: '0.03em' }}>
                통계적 표준화 기반 이상 탐지 (Multi-Window Z-Score Engine)
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span
              className={reducedMotion ? undefined : 'anomaly-live-soft'}
              style={{
                fontSize: 10, padding: '3px 8px', borderRadius: 4,
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.35)',
                color: '#047857',
                fontWeight: 700,
                letterSpacing: '0.05em',
              }}
            >
              LIVE · {ANOMALY_POLL_INTERVAL_MS / 1000}s
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {(['consensus', 'max'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  style={{
                    fontSize: 10,
                    padding: '3px 8px',
                    borderRadius: 4,
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    border: `1px solid ${mode === m ? 'rgba(100,116,139,0.5)' : 'rgba(100,116,139,0.2)'}`,
                    background: mode === m ? 'rgba(100,116,139,0.15)' : 'rgba(100,116,139,0.08)',
                    color: mode === m ? '#334155' : '#64748b',
                    cursor: 'pointer',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', paddingLeft: 52 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Info size={13} color="#64748b" strokeWidth={2} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: '#64748b', letterSpacing: '0.02em' }}>
              30·60·90일 통계 분포를 기준으로 가격 수익률·거래량·변동폭을 Z-Score로 표준화하여, 다중 기간 합성 점수로 이상도를 측정합니다.
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Info size={13} color="#64748b" strokeWidth={2} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: '#64748b', letterSpacing: '0.02em' }}>
              consensus=겹치는 구간 합의 max=세 값 중 최댓값.
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, paddingLeft: 52, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600, letterSpacing: '0.04em' }}>
            갱신 시각
          </span>
          <SoftCloudText
            text={formatFetchedAt(fetchedAt)}
            reducedMotion={reducedMotion}
            style={{ fontSize: 13, color: '#0f172a', fontWeight: 700, letterSpacing: '0.04em', display: 'inline-block' }}
          />
          {status === 'warming' && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: '#b45309',
              background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)',
              padding: '2px 8px', borderRadius: 4, letterSpacing: '0.03em',
            }}>
              {ANOMALY_WARMING_MESSAGE}
            </span>
          )}
          {status === 'error' && errorMessage && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: '#dc2626',
              background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.3)',
              padding: '2px 8px', borderRadius: 4,
            }}>
              {errorMessage}
            </span>
          )}
        </div>
      </div>

      {/* Cards Grid */}
      <div style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        {topListConfig.map(({ key, title, sub, desc }) => {
          const cfg = CARD_CONFIG[key];
          const Icon = CARD_ICONS[key];
          const items = topLists[key]?.items ?? [];

          return (
            <div
              key={key}
              style={{
                background: '#ffffff',
                border: '1px solid rgba(15,23,42,0.08)',
                borderRadius: 10,
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(15,23,42,0.05)',
                position: 'relative',
              }}
            >
              {/* Card accent top bar */}
              <div style={{
                height: 2,
                background: 'linear-gradient(90deg, #64748b, transparent)',
                boxShadow: '0 0 8px rgba(100,116,139,0.2)',
              }} />

              {/* Card header */}
              <div style={{
                padding: '12px 14px 10px',
                borderBottom: '1px solid rgba(0,0,0,0.06)',
                background: 'rgba(100,116,139,0.06)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'rgba(100,116,139,0.08)',
                    border: '1px solid rgba(100,116,139,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={16} color="#64748b" strokeWidth={2.5} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        fontSize: 9, fontWeight: 800, letterSpacing: '0.12em',
                        color: '#64748b', textTransform: 'uppercase',
                        background: 'rgba(100,116,139,0.12)', padding: '2px 6px', borderRadius: 3,
                      }}>{cfg.label}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#374151' }}>{title}</span>
                    </div>
                    <div style={{ fontSize: 9, color: '#4b5563', marginTop: 2, letterSpacing: '0.03em' }}>{sub}</div>
                  </div>
                  <span style={{
                    fontSize: 12, fontWeight: 700, color: '#64748b',
                    letterSpacing: '0.04em',
                  }}>
                    TOP 5
                  </span>
                </div>
                <div style={{
                  marginTop: 8,
                  fontSize: 11,
                  color: '#64748b',
                  lineHeight: 1.45,
                  letterSpacing: '0.01em',
                }}>
                  {desc}
                </div>
              </div>

              {/* Column header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '5px 10px 4px 10px',
                borderBottom: '1px solid rgba(0,0,0,0.06)',
              }}>
                <span style={{ fontSize: 9, color: '#6b7280', width: COL_WIDTH.rank, textAlign: 'right' }}>#</span>
                <span style={{ fontSize: 9, color: '#6b7280', flex: 1 }}>종목</span>
                <span style={{ fontSize: 9, color: '#6b7280', width: COL_WIDTH.barHint }} />
                <span style={{ fontSize: 9, color: '#6b7280', width: COL_WIDTH.bar }}>강도</span>
                <span style={{ fontSize: 9, color: '#6b7280', width: COL_WIDTH.score, textAlign: 'right' }}>점수</span>
                <span style={{ fontSize: 9, color: '#6b7280', width: COL_WIDTH.meta, textAlign: 'right' }}>변화</span>
              </div>

              {/* Rows */}
              <div style={{ padding: '4px 0', minHeight: 180 }}>
                {items.length > 0 ? (
                  items.map((item) => (
                    <CardRow
                      key={`${key}-${item.venueId}-${item.instrumentId}`}
                      keyType={key}
                      item={item}
                      accent={cfg.accent}
                      reducedMotion={reducedMotion}
                      onClick={() =>
                        navigate(`/anomaly-monitor?venueId=${item.venueId}&instrumentId=${item.instrumentId}`)
                      }
                    />
                  ))
                ) : (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    height: 150, flexDirection: 'column', gap: 8, padding: '0 16px', textAlign: 'center',
                  }}>
                    {status === 'warming' ? (
                      <>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#b45309' }}>
                          {ANOMALY_WARMING_MESSAGE}
                        </span>
                        <span style={{ fontSize: 10, color: '#6b7280' }}>
                          Writer 워밍업이 끝나면 자동으로 갱신됩니다.
                        </span>
                      </>
                    ) : status === 'error' ? (
                      <>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#dc2626' }}>
                          불러오지 못했습니다
                        </span>
                        <span style={{ fontSize: 10, color: '#6b7280' }}>
                          {errorMessage ?? '잠시 후 다시 시도합니다.'}
                        </span>
                      </>
                    ) : (
                      <>
                        <div style={{
                          width: 24, height: 24, borderRadius: '50%',
                          border: '2px solid rgba(100,116,139,0.3)',
                          borderTopColor: '#64748b',
                          animation: 'spin 1s linear infinite',
                        }} />
                        <span style={{ fontSize: 10, color: '#6b7280' }}>Loading...</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes deltaPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px rgba(220,38,38,0.3), inset 0 1px 0 rgba(255,255,255,0.2); }
          50% { opacity: 0.92; box-shadow: 0 0 12px rgba(220,38,38,0.45), inset 0 1px 0 rgba(255,255,255,0.2); }
        }
      `}</style>
      <SoftCloudMotionStyles />
    </div>
  );
}
