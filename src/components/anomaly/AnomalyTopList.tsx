import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, BarChart2, Gauge, Radar, TrendingUp } from 'lucide-react';
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
    accent: '#0891b2',
    accentDim: 'rgba(8,145,178,0.18)',
    accentGlow: 'rgba(8,145,178,0.4)',
    label: 'AGG',
  },
  vol: {
    accent: '#059669',
    accentDim: 'rgba(5,150,105,0.18)',
    accentGlow: 'rgba(5,150,105,0.4)',
    label: 'VOL',
  },
  rng: {
    accent: '#d97706',
    accentDim: 'rgba(217,119,6,0.18)',
    accentGlow: 'rgba(217,119,6,0.4)',
    label: 'RNG',
  },
  ret: {
    accent: '#dc2626',
    accentDim: 'rgba(220,38,38,0.18)',
    accentGlow: 'rgba(220,38,38,0.4)',
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

function ScoreBar({ val, max = 5, accent }: { val: number | null; max?: number; accent: string }) {
  const pct = val == null ? 0 : Math.min((val / max) * 100, 100);
  return (
    <div style={{ width: 48, height: 4, background: 'rgba(0,0,0,0.08)', borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
      <div style={{
        height: '100%',
        width: `${pct}%`,
        background: accent,
        borderRadius: 2,
        boxShadow: `0 0 6px ${accent}`,
        transition: 'width 0.6s ease',
      }} />
    </div>
  );
}

const LEVEL_CONFIG: Record<string, { bg: string; fg: string; label: string }> = {
  SEVERE:  { bg: 'rgba(239,68,68,0.2)',   fg: '#dc2626', label: '위험' },
  ANOMALY: { bg: 'rgba(249,115,22,0.2)',   fg: '#ea580c', label: '이상' },
  WATCH:   { bg: 'rgba(251,191,36,0.18)',  fg: '#d97706', label: '주의' },
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
    UP:    { icon: '▲', color: '#f87171' },
    DOWN:  { icon: '▼', color: '#60a5fa' },
    MIXED: { icon: '◆', color: '#fbbf24' },
    FLAT:  { icon: '─', color: '#6b7280' },
  };
  const m = map[direction] ?? { icon: direction, color: '#9ca3af' };
  return (
    <span style={{ color: m.color, fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
      {m.icon} {direction}
    </span>
  );
}

function DeltaChip({ delta }: { delta: number | null }) {
  if (delta == null) return <span style={{ color: '#4b5563', fontSize: 10 }}>—</span>;
  const abs = Math.abs(delta);
  const isUp = delta > 0;
  const color = isUp ? '#34d399' : '#60a5fa';
  const badge = abs >= 2 ? '폭발' : abs >= 1 ? '급변' : null;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, flexShrink: 0 }}>
      {badge && (
        <span style={{
          fontSize: 8, padding: '1px 4px', borderRadius: 2, fontWeight: 700,
          background: abs >= 2 ? 'rgba(239,68,68,0.2)' : 'rgba(251,191,36,0.18)',
          color: abs >= 2 ? '#f87171' : '#fbbf24',
          border: `1px solid ${abs >= 2 ? '#f87171' : '#fbbf24'}44`,
        }}>
          {badge}
        </span>
      )}
      <span style={{ color, fontWeight: 600 }}>
        {isUp ? '↑' : '↓'} {delta.toFixed(2)}
      </span>
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

  const level = getMetricLevel(metricVal);
  const levelColors: Record<string, string> = {
    low: '#4b5563', mid: '#fbbf24', high: '#f97316', extreme: '#ef4444'
  };
  const valColor = keyType === 'agg' ? accent : levelColors[level];
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
      <span style={{ fontSize: 10, color: '#6b7280', width: 16, flexShrink: 0, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
        {item.rank}
      </span>

      {/* Symbol */}
      <span style={{
        fontSize: 12, fontWeight: 700, color: '#1f2937',
        flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        letterSpacing: '0.02em',
      }}>
        {item.symbol}
      </span>

      {/* Score bar */}
      <ScoreBar val={metricVal} accent={accent} />

      {/* Value */}
      <span style={{
        fontSize: 12, fontWeight: 700, color: valColor,
        fontVariantNumeric: 'tabular-nums', flexShrink: 0, minWidth: 36, textAlign: 'right',
        textShadow: hovered ? `0 0 8px ${valColor}` : 'none',
        transition: 'text-shadow 0.15s',
      }}>
        {valStr}
      </span>

      {/* Badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        <FinalLevelPill level={item.finalLevel} showNormal={keyType === 'agg'} />
        {keyType === 'ret' && <DirectionChip direction={item.direction} />}
        {keyType === 'agg' && item.driver && (
          <span style={{ fontSize: 9, color: '#6b7280', flexShrink: 0 }}>
            {item.driver}
          </span>
        )}
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
      background: '#ffffff',
      borderRadius: 10,
      overflow: 'hidden',
      maxWidth: 1100,
      margin: '0 auto',
      boxShadow: '0 0 0 1px rgba(0,0,0,0.06), 0 4px 24px rgba(0,0,0,0.08)',
      position: 'relative',
    }}>

      {/* Header */}
      <div style={{
        background: '#ffffff',
        padding: '16px 24px',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
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
            background: 'rgba(8,145,178,0.12)',
            border: '1px solid rgba(8,145,178,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Radar size={20} color="#0891b2" strokeWidth={2.5} />
          </div>

          <div>
            <div style={{ fontSize: 10, color: '#64748b', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 2 }}>
              Anomaly Detection System
            </div>
            <div style={{ fontSize: 13, color: '#1e293b', fontWeight: 700, letterSpacing: '0.04em' }}>
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
                background: 'rgba(0,0,0,0.06)',
                border: '1px solid rgba(0,0,0,0.12)',
                color: '#334155',
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
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: 10,
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                position: 'relative',
              }}
            >
              {/* Card accent top bar */}
              <div style={{
                height: 2,
                background: `linear-gradient(90deg, ${cfg.accent}, transparent)`,
                boxShadow: `0 0 12px ${cfg.accentGlow}`,
              }} />

              {/* Card header */}
              <div style={{
                padding: '12px 14px 10px',
                borderBottom: '1px solid rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: cfg.accentDim,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: `linear-gradient(135deg, ${cfg.accentDim}, rgba(0,0,0,0.06))`,
                  border: `1px solid ${cfg.accent}33`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={16} color={cfg.accent} strokeWidth={2.5} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontSize: 9, fontWeight: 800, letterSpacing: '0.12em',
                      color: cfg.accent, textTransform: 'uppercase',
                      background: `${cfg.accent}18`, padding: '2px 6px', borderRadius: 3,
                    }}>{cfg.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>{title}</span>
                  </div>
                  <div style={{ fontSize: 9, color: '#4b5563', marginTop: 2, letterSpacing: '0.03em' }}>{sub}</div>
                </div>
                <span style={{
                  fontSize: 12, fontWeight: 700, color: `${cfg.accent}99`,
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
                <span style={{ fontSize: 9, color: '#6b7280', width: 16, textAlign: 'right' }}>#</span>
                <span style={{ fontSize: 9, color: '#6b7280', flex: 1 }}>SYMBOL</span>
                <span style={{ fontSize: 9, color: '#6b7280', width: 48 }}>BAR</span>
                <span style={{ fontSize: 9, color: '#6b7280', minWidth: 36, textAlign: 'right' }}>SCORE</span>
                <span style={{ fontSize: 9, color: '#6b7280', flexShrink: 0 }}>META</span>
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
                      border: `2px solid ${cfg.accent}44`,
                      borderTopColor: cfg.accent,
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
      `}</style>
    </div>
  );
}
