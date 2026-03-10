import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, BarChart2, Gauge, HelpCircle, Info, Radar, TrendingUp } from 'lucide-react';
import anomalyService from '@/services/AnomalyService';
import type {
  AnomalyScoreTopResponse,
  AnomalyScoreTopItem,
} from '@/types/AnomalyListTypes';

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

const MAIN_TOP_DEFAULTS = {
  timeframe: '5m',
  limit: 10,
  deltaBars: 6,
} as const;

const MODE_DESC: Record<string, string> = {
  consensus: '30·60·90일 점수를 가중 평균하여 합성. 변동을 완화하고 안정적인 이상도 산출.',
  max: '30·60·90일 점수 중 최댓값 사용. 극단적 이상을 민감하게 포착.',
};

const DRIVER_DESC: Record<string, string> = {
  VOL: '거래량(Volume) 이상이 종합 점수에 가장 크게 기여했습니다. |z_vol| 기준.',
  RET: '수익률/급등급락(Return) 이상이 종합 점수에 가장 크게 기여했습니다. |z_ret| 기준.',
  RNG: '변동폭(Range) 이상이 종합 점수에 가장 크게 기여했습니다. |z_rng| 기준.',
};

const COL_WIDTH = {
  rank: 16,
  barHint: 56,
  bar: 48,
  score: 40,
  meta: 52,
} as const;

function buildFetchConfig(mode: 'consensus' | 'max') {
  const base = { ...MAIN_TOP_DEFAULTS, mode };
  return [
    { key: 'agg' as const, title: '종합 이상', sub: 'finalScore (mode 합성)', fetch: () => anomalyService.getTop(base) },
    { key: 'vol' as const, title: '거래량 이상', sub: 'metricValue (|z_vol|)', fetch: () => anomalyService.getTopVol(base) },
    { key: 'rng' as const, title: '변동폭 이상', sub: 'metricValue (|z_rng|)', fetch: () => anomalyService.getTopRng(base) },
    { key: 'ret' as const, title: '급등/급락', sub: 'metricValue (|z_ret|) + direction', fetch: () => anomalyService.getTopRet(base) },
  ] as const;
}

type CardKey = 'agg' | 'vol' | 'rng' | 'ret';

function formatTsFull(ts: string | undefined): string {
  if (!ts) return '--:--:--';
  try {
    return new Date(ts).toLocaleString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    });
  } catch { return ts; }
}

function getMetricLevel(val: number | null): 'low' | 'mid' | 'high' | 'extreme' {
  if (val == null || val < 1.5) return 'low';
  if (val < 2.5) return 'mid';
  if (val < 4.0) return 'high';
  return 'extreme';
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
        transition: 'width 0.6s ease',
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

function DriverWithTooltip({ driver }: { driver: string }) {
  const desc = DRIVER_DESC[driver.toUpperCase()] ?? `${driver} 지표가 종합 점수에 기여했습니다.`;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
      <span style={{ fontSize: 9, color: '#6b7280' }}>{driver}</span>
      <span title={desc} style={{ display: 'inline-flex', cursor: 'help' }}>
        <HelpCircle size={10} color="#94a3b8" strokeWidth={2} />
      </span>
    </span>
  );
}

const DIRECTION_DESC: Record<string, string> = {
  UP: '급등 방향: 수익률이 급격히 상승한 이상 구간입니다.',
  DOWN: '급락 방향: 수익률이 급격히 하락한 이상 구간입니다.',
  MIXED: '상하 혼재: 상승과 하락이 혼재된 구간입니다.',
  FLAT: '횡보: 변동이 미미한 구간입니다.',
};

function DirectionChip({ direction }: { direction?: string }) {
  if (!direction) return null;
  const map: Record<string, { icon: string; color: string }> = {
    UP:    { icon: '▲', color: '#dc2626' },
    DOWN:  { icon: '▼', color: '#2563eb' },
    MIXED: { icon: '◆', color: '#64748b' },
    FLAT:  { icon: '─', color: '#94a3b8' },
  };
  const m = map[direction] ?? { icon: direction, color: '#9ca3af' };
  const desc = DIRECTION_DESC[direction];
  return (
    <span
      title={desc}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        color: m.color,
        fontSize: 10,
        fontWeight: 700,
        flexShrink: 0,
        cursor: desc ? 'help' : 'default',
      }}
    >
      {m.icon} {direction}
      {desc && <HelpCircle size={9} color="#94a3b8" strokeWidth={2} style={{ flexShrink: 0 }} />}
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

  return <span style={badgeStyle as React.CSSProperties}>{badge}</span>;
}

function DeltaChip({ delta }: { delta: number | null }) {
  if (delta == null) return <span style={{ color: '#64748b', fontSize: 10 }}>—</span>;
  const isUp = delta > 0;
  const color = isUp ? '#dc2626' : '#2563eb';
  return (
    <span style={{ color, fontWeight: 600, fontSize: 10, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
      {isUp ? '↑' : '↓'} {delta.toFixed(2)}
    </span>
  );
}

function CardRow({ keyType, item, onClick, accent }: {
  keyType: CardKey;
  item: AnomalyScoreTopItem;
  onClick: () => void;
  accent: string;
}) {
  const [hovered, setHovered] = useState(false);

  const metricVal = keyType === 'agg'
    ? (item.finalScore ?? null)
    : (item.metricValue ?? null);

  const valStr = metricVal != null ? metricVal.toFixed(2) : '—';

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '7px 10px',
        borderRadius: 3,
        cursor: 'pointer',
        background: hovered ? 'rgba(0,0,0,0.04)' : 'transparent',
        borderLeft: `2px solid ${hovered ? accent : 'transparent'}`,
        transition: 'all 0.15s ease',
        overflow: 'hidden',
      }}
    >
      {/* Rank */}
      <span style={{ fontSize: 10, color: '#6b7280', width: COL_WIDTH.rank, flexShrink: 0, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
        {item.rank}
      </span>

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
          <DriverWithTooltip driver={item.driver} />
        )}
      </div>

      {/* Score bar */}
      <ScoreBar val={metricVal} />

      {/* Value */}
      <span style={{
        fontSize: 12, fontWeight: 700, color: '#111827',
        fontVariantNumeric: 'tabular-nums', flexShrink: 0, width: COL_WIDTH.score, textAlign: 'right',
      }}>
        {valStr}
      </span>

      {/* META */}
      <div style={{ width: COL_WIDTH.meta, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <DeltaChip delta={item.delta} />
      </div>
    </div>
  );
}

export default function AnomalyTopList() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'consensus' | 'max'>('consensus');
  const [topLists, setTopLists] = useState<Record<string, AnomalyScoreTopResponse | null>>({
    agg: null, vol: null, rng: null, ret: null,
  });

  // 초기 로드 + mode 변경 시
  useEffect(() => {
    const config = buildFetchConfig(mode);
    const loadTopLists = async () => {
      const results = await Promise.allSettled(
        config.map(async (c) => ({ key: c.key, data: await c.fetch() }))
      );
      const next: Record<string, AnomalyScoreTopResponse | null> = {};
      results.forEach((r, i) => {
        const key = config[i].key;
        next[key] = r.status === 'fulfilled' ? r.value.data : null;
      });
      setTopLists(next);
    };
    loadTopLists();
  }, [mode]);

  // 5분마다 리프레시 (10:25, 10:30, 10:35 등 5분 경계에 맞춤)
  useEffect(() => {
    const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5분
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const getMsUntilNextBoundary = () => {
      const now = Date.now();
      const d = new Date(now);
      const minute = d.getMinutes();
      const second = d.getSeconds();
      const ms = d.getMilliseconds();
      const currentMsIntoPeriod = ((minute % 5) * 60000) + (second * 1000) + ms;
      const msUntilNext = REFRESH_INTERVAL_MS - currentMsIntoPeriod;
      return msUntilNext <= 0 ? REFRESH_INTERVAL_MS : msUntilNext;
    };

    const loadTopLists = () => {
      const config = buildFetchConfig(mode);
      Promise.allSettled(
        config.map(async (c) => ({ key: c.key, data: await c.fetch() }))
      ).then((results) => {
        const next: Record<string, AnomalyScoreTopResponse | null> = {};
        config.forEach((c, i) => {
          next[c.key] = results[i].status === 'fulfilled' ? (results[i] as PromiseFulfilledResult<{ key: string; data: AnomalyScoreTopResponse }>).value.data : null;
        });
        setTopLists(next);
      });
    };

    const msUntilFirst = getMsUntilNextBoundary();
    const timeoutId = setTimeout(() => {
      loadTopLists();
      intervalId = setInterval(loadTopLists, REFRESH_INTERVAL_MS);
    }, msUntilFirst);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [mode]);

  const topListConfig = buildFetchConfig(mode);
  const displayTs = topLists.agg?.ts ?? topLists.vol?.ts ?? topLists.rng?.ts ?? topLists.ret?.ts;

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
              <span style={{ fontSize: 10, color: '#475569', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>
                이상 탐지 리스트
              </span>
              <span style={{ fontSize: 9, color: '#64748b', letterSpacing: '0.03em' }}>
                통계적 표준화 기반 이상 탐지 (Multi-Window Z-Score Engine)
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10, color: '#475569', fontWeight: 600, letterSpacing: '0.04em' }}>
            현재 데이터 기준
          </span>
          <span
            title="5분봉"
            style={{
              fontSize: 10, padding: '3px 8px', borderRadius: 4,
              background: 'rgba(100,116,139,0.08)',
              border: '1px solid rgba(100,116,139,0.2)',
              color: '#475569',
              fontWeight: 600,
              letterSpacing: '0.05em',
            }}
          >
            5m
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {(['consensus', 'max'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                title={MODE_DESC[m]}
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
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                {m}
                <HelpCircle size={10} color="#94a3b8" strokeWidth={2} />
              </button>
            ))}
          </div>
          <span
            title="6개 봉(캔들) 전 대비 변화량"
            style={{
              fontSize: 10, padding: '3px 8px', borderRadius: 4,
              background: 'rgba(100,116,139,0.08)',
              border: '1px solid rgba(100,116,139,0.2)',
              color: '#475569',
              fontWeight: 600,
              letterSpacing: '0.05em',
            }}
          >
            Δ 6봉
          </span>
          </div>
        </div>

        {/* 2행: 설명 (전체 폭 → 한 줄) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', paddingLeft: 52 }}>
          <Info size={12} color="#64748b" strokeWidth={2} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 10, color: '#64748b', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
            30·60·90일 통계 분포를 기준으로 가격 수익률·거래량·변동폭을 Z-Score로 표준화하여, 다중 기간 합성 점수로 이상도를 측정합니다.
          </span>
        </div>

        {/* 3행: 데이터 기준 시각 */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, paddingLeft: 52 }}>
          <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600, letterSpacing: '0.04em' }}>
            데이터 기준 시각
          </span>
          <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 700, letterSpacing: '0.04em' }}>
            {formatTsFull(displayTs)}
          </span>
        </div>
      </div>

      {/* Cards Grid */}
      <div style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        {topListConfig.map(({ key, title, sub }) => {
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
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'rgba(100,116,139,0.06)',
              }}>
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
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>{title}</span>
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

              {/* Column header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '5px 10px 4px 10px',
                borderBottom: '1px solid rgba(0,0,0,0.06)',
              }}>
                <span style={{ fontSize: 9, color: '#6b7280', width: COL_WIDTH.rank, textAlign: 'right' }}>#</span>
                <span style={{ fontSize: 9, color: '#6b7280', flex: 1 }}>SYMBOL</span>
                <span style={{ fontSize: 9, color: '#6b7280', width: COL_WIDTH.barHint }} />
                <span style={{ fontSize: 9, color: '#6b7280', width: COL_WIDTH.bar }}>BAR</span>
                <span style={{ fontSize: 9, color: '#6b7280', width: COL_WIDTH.score, textAlign: 'right' }}>SCORE</span>
                <span style={{ fontSize: 9, color: '#6b7280', width: COL_WIDTH.meta, textAlign: 'right' }}>META</span>
              </div>

              {/* Rows */}
              <div style={{ padding: '4px 0', minHeight: 180 }}>
                {items.length > 0 ? (
                  items.map((item) => (
                    <CardRow
                      key={`${item.venueId}-${item.instrumentId}-${item.rank}`}
                      keyType={key}
                      item={item}
                      accent={cfg.accent}
                      onClick={() =>
                        navigate(`/anomaly-monitor?venueId=${item.venueId}&instrumentId=${item.instrumentId}`)
                      }
                    />
                  ))
                ) : (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    height: 150, flexDirection: 'column', gap: 8,
                  }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%',
                      border: '2px solid rgba(100,116,139,0.3)',
                      borderTopColor: '#64748b',
                      animation: 'spin 1s linear infinite',
                    }} />
                    <span style={{ fontSize: 10, color: '#6b7280' }}>Loading...</span>
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
    </div>
  );
}
