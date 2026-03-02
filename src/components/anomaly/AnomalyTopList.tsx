import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, BarChart2, Gauge, HelpCircle, Radar, TrendingUp } from 'lucide-react';
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
  mode: 'consensus',
  limit: 10,
  deltaBars: 6,
} as const;

const MAIN_TOP_FILTER_DEFAULTS = { ...MAIN_TOP_DEFAULTS } as const;

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

const TOP_LIST_CONFIG = [
  { key: 'agg' as const, title: '종합 이상', sub: 'finalScore (mode 합성)', fetch: () => anomalyService.getTop(MAIN_TOP_DEFAULTS) },
  { key: 'vol' as const, title: '거래량 이상', sub: 'metricValue (|z_vol|)', fetch: () => anomalyService.getTopVol(MAIN_TOP_FILTER_DEFAULTS) },
  { key: 'rng' as const, title: '변동폭 이상', sub: 'metricValue (|z_rng|)', fetch: () => anomalyService.getTopRng(MAIN_TOP_FILTER_DEFAULTS) },
  { key: 'ret' as const, title: '급등/급락', sub: 'metricValue (|z_ret|) + direction', fetch: () => anomalyService.getTopRet(MAIN_TOP_FILTER_DEFAULTS) },
] as const;

type CardKey = (typeof TOP_LIST_CONFIG)[number]['key'];

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
  const [topLists, setTopLists] = useState<Record<string, AnomalyScoreTopResponse | null>>({
    agg: null, vol: null, rng: null, ret: null,
  });
  useEffect(() => {
    const loadTopLists = async () => {
      const results = await Promise.allSettled(
        TOP_LIST_CONFIG.map(async (c) => ({ key: c.key, data: await c.fetch() }))
      );
      const next: Record<string, AnomalyScoreTopResponse | null> = {};
      results.forEach((r, i) => {
        const key = TOP_LIST_CONFIG[i].key;
        next[key] = r.status === 'fulfilled' ? r.value.data : null;
      });
      setTopLists(next);
    };
    loadTopLists();
  }, []);

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
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        position: 'relative',
      }}>
        {/* Left: Title + TS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Header icon */}
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(100,116,139,0.12)',
            border: '1px solid rgba(100,116,139,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Radar size={20} color="#64748b" strokeWidth={2.5} />
          </div>

          <div>
            <div style={{ fontSize: 10, color: '#475569', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 2, fontWeight: 600 }}>
              이상 탐지 리스트
            </div>
            <div style={{ fontSize: 13, color: '#0f172a', fontWeight: 700, letterSpacing: '0.04em' }}>
              {formatTsFull(displayTs)}
            </div>
          </div>
        </div>

        {/* Right: Params */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10, color: '#475569', fontWeight: 600, letterSpacing: '0.04em' }}>
            현재 데이터 기준
          </span>
          {[
            { label: '5m', title: '5분봉' },
            { label: 'consensus', title: '합성 모드' },
            { label: 'Δ 6봉', title: '6개 봉(캔들) 전 대비 변화량' },
          ].map(({ label, title }) => (
            <span
              key={label}
              title={title}
              style={{
                fontSize: 10, padding: '3px 8px', borderRadius: 4,
                background: 'rgba(100,116,139,0.08)',
                border: '1px solid rgba(100,116,139,0.2)',
                color: '#475569',
                fontWeight: 600,
                letterSpacing: '0.05em',
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        {TOP_LIST_CONFIG.map(({ key, title, sub }) => {
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
