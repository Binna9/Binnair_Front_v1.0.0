import React, { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
  PieChart,
  Pie,
  Sector,
} from 'recharts';
import tradingHistoryService from '@/services/TradingHistoryService';
import { TradeHistoryItem } from '@/types/TradingHistoryTypes';
import { useHistoryFilter } from '@/context/HistoryFilterContext';
import { useHistorySummary } from '@/hooks/trading/useHistorySummary';
import HistoryEmptyState from './HistoryEmptyState';
import HistoryPanelFrame from './HistoryPanelFrame';
import { formatExitReason } from './historyLabels';

const GREEN = '#0ecb81';
const RED = '#f6465d';
const MUTED = '#b7bdc6';
const EXIT_COLORS = ['#f0b90b', '#0ecb81', '#f6465d', '#3b82f6', '#a855f7', '#848e9c'];

const CHART_CARD_HOVER =
  'transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.012] hover:border-[#4a5160] hover:shadow-[0_12px_32px_rgba(0,0,0,0.45)] will-change-transform';

/** 파이 조각 호버 시 살짝 키움 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderActivePieShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius + 5}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
    />
  );
};

const formatUsdt = (value: number) =>
  value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function toDayKey(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function shortDayLabel(dayKey: string): string {
  const [, m, d] = dayKey.split('-');
  return `${m}/${d}`;
}

const tooltipShellStyle: React.CSSProperties = {
  background: 'rgba(30, 35, 41, 0.98)',
  border: '1px solid #f0b90b66',
  borderRadius: 10,
  padding: '10px 12px',
  boxShadow: '0 8px 28px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06)',
  minWidth: 160,
};

/** 일별 PnL 커스텀 툴팁 — 밝은 글자 + 강조 */
const DailyPnlTooltip: React.FC<{
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[];
  label?: string;
}> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload as {
    day: string;
    pnl: number;
    count: number;
    wins: number;
    losses: number;
  };
  const positive = row.pnl >= 0;

  return (
    <div style={tooltipShellStyle}>
      <div className="text-[11px] text-[#b7bdc6] mb-1.5">{row.day}</div>
      <div className="text-[11px] text-[#848e9c] mb-2">
        {row.count}건 · 승 {row.wins} / 패 {row.losses}
      </div>
      <div className="text-[10px] uppercase tracking-wide text-[#f0b90b] mb-0.5">실현 손익</div>
      <div
        className={`text-base font-bold tabular-nums ${
          positive ? 'text-[#0ecb81]' : 'text-[#f6465d]'
        }`}
        style={{ textShadow: positive ? '0 0 12px #0ecb8144' : '0 0 12px #f6465d44' }}
      >
        {positive ? '+' : ''}
        {formatUsdt(row.pnl)}{' '}
        <span className="text-xs font-semibold text-[#eaecef]">USDT</span>
      </div>
    </div>
  );
};

const PieTooltip: React.FC<{
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[];
}> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const name = String(item.name ?? '');
  const value = Number(item.value ?? 0);
  const color = (item.payload?.color as string | undefined) ?? '#f0b90b';

  return (
    <div style={tooltipShellStyle}>
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
        <span className="text-sm font-semibold text-[#f5f6f7]">{name}</span>
      </div>
      <div className="text-base font-bold text-[#eaecef] tabular-nums">{value}건</div>
    </div>
  );
};

/**
 * 요약 탭 인사이트 — equity(잔고 곡선)와 분리.
 * history/trades + summary로 일별 PnL·승패·청산사유를 보여준다.
 */
const SummaryInsightsPanel: React.FC = () => {
  const { queryParams } = useHistoryFilter();
  const { summary } = useHistorySummary(true);
  const [trades, setTrades] = useState<TradeHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [winLossActive, setWinLossActive] = useState<number | undefined>();
  const [exitActive, setExitActive] = useState<number | undefined>();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    tradingHistoryService
      .getTrades({ ...queryParams, limit: 200, offset: 0 })
      .then((res) => {
        if (cancelled) return;
        setTrades(res.items ?? []);
        setError(null);
      })
      .catch(() => {
        if (cancelled) return;
        setError('요약 차트를 불러오지 못했습니다.');
        setTrades([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [queryParams]);

  const dailyPnl = useMemo(() => {
    const map = new Map<string, { pnl: number; wins: number; losses: number; count: number }>();
    for (const t of trades) {
      const key = toDayKey(t.closed_at);
      const cur = map.get(key) ?? { pnl: 0, wins: 0, losses: 0, count: 0 };
      cur.pnl += t.realized_pnl;
      cur.count += 1;
      if (t.is_win) cur.wins += 1;
      else cur.losses += 1;
      map.set(key, cur);
    }
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, v]) => ({
        day,
        label: shortDayLabel(day),
        pnl: Number(v.pnl.toFixed(4)),
        wins: v.wins,
        losses: v.losses,
        count: v.count,
      }));
  }, [trades]);

  const exitBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of trades) {
      const key = t.exit_reason || 'UNKNOWN';
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return [...map.entries()]
      .map(([reason, count], i) => ({
        reason,
        name: formatExitReason(reason),
        label: formatExitReason(reason),
        value: count,
        count,
        color: EXIT_COLORS[i % EXIT_COLORS.length],
      }))
      .sort((a, b) => b.count - a.count);
  }, [trades]);

  const wins = summary?.wins ?? trades.filter((t) => t.is_win).length;
  const losses = summary?.losses ?? trades.filter((t) => !t.is_win).length;
  const winRate =
    summary?.win_rate != null
      ? summary.win_rate * 100
      : wins + losses > 0
        ? (wins / (wins + losses)) * 100
        : null;
  const winLossData = [
    { name: '승', value: wins, color: GREEN },
    { name: '패', value: losses, color: RED },
  ].filter((d) => d.value > 0);

  if (error && trades.length === 0 && !loading) {
    return <HistoryEmptyState message={error} variant="error" />;
  }

  if (trades.length === 0 && !loading) {
    return <HistoryEmptyState message="기간 내 청산 거래가 없어 요약 차트를 그릴 수 없습니다" />;
  }

  return (
    <HistoryPanelFrame loading={loading && trades.length === 0}>
      {trades.length === 0 ? (
        <div className="flex-1 min-h-0" />
      ) : (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scroll p-4">
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.9fr)] gap-4 min-h-[420px] py-1">
        {/* 일별 실현 손익 — 메인 */}
        <section className={`min-h-[360px] flex flex-col rounded-xl border border-[#3a4149] bg-[#1a1f27] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${CHART_CARD_HOVER}`}>
          <div className="flex items-baseline justify-between mb-3 gap-2">
            <div>
              <h3 className="text-base font-bold text-[#f5f6f7]">일별 실현 손익</h3>
              <p className="text-xs text-[#b7bdc6] mt-0.5">청산 기준 집계 · 가장 중요한 성과 지표</p>
            </div>
            <span className="text-xs text-[#f0b90b] font-medium whitespace-nowrap">
              {trades.length}건
            </span>
          </div>
          <div className="flex-1 min-h-[280px] rounded-lg bg-[#0d1117]/80 border border-[#2b3139] p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyPnl} margin={{ top: 12, right: 12, left: 4, bottom: 8 }}>
                <CartesianGrid stroke="#2b3139" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: MUTED, fontSize: 12 }}
                  axisLine={{ stroke: '#3a4149' }}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: MUTED, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={56}
                />
                <ReferenceLine y={0} stroke="#4a5160" />
                <Tooltip
                  content={<DailyPnlTooltip />}
                  cursor={{ fill: 'rgba(240,185,11,0.08)' }}
                  // Recharts 기본 위치 애니메이션 → 왼쪽에서 날아오는 느낌 방지 (AnomalyChart와 동일)
                  animationDuration={0}
                  isAnimationActive={false}
                  wrapperStyle={{
                    outline: 'none',
                    zIndex: 20,
                    transition: 'none',
                    pointerEvents: 'none',
                  }}
                />
                <Bar
                  dataKey="pnl"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                  activeBar={{
                    stroke: '#f0b90b',
                    strokeWidth: 1.5,
                    fillOpacity: 1,
                  }}
                >
                  {dailyPnl.map((d) => (
                    <Cell key={d.day} fill={d.pnl >= 0 ? GREEN : RED} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 승패 + 청산 사유 */}
        <div className="flex flex-col gap-4 min-h-[360px]">
          <section className={`flex-1 min-h-[170px] rounded-xl border border-[#3a4149] bg-[#1a1f27] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${CHART_CARD_HOVER}`}>
            <h3 className="text-base font-bold text-[#f5f6f7] mb-0.5">승 / 패</h3>
            <p className="text-xs text-[#b7bdc6] mb-3">기간 내 승률 분포</p>
            <div className="flex items-center gap-4">
              <div className="w-[128px] h-[128px] flex-shrink-0 rounded-full bg-[#0d1117]/80 border border-[#2b3139] p-1 transition-transform duration-200 ease-out hover:scale-105">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={winLossData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={34}
                      outerRadius={54}
                      stroke="#1a1f27"
                      strokeWidth={2}
                      activeIndex={winLossActive}
                      activeShape={renderActivePieShape}
                      onMouseEnter={(_, index) => setWinLossActive(index)}
                      onMouseLeave={() => setWinLossActive(undefined)}
                    >
                      {winLossData.map((d) => (
                        <Cell key={d.name} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={<PieTooltip />}
                      animationDuration={0}
                      isAnimationActive={false}
                      wrapperStyle={{
                        outline: 'none',
                        zIndex: 20,
                        transition: 'none',
                        pointerEvents: 'none',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2.5 min-w-0">
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0ecb81] shadow-[0_0_8px_#0ecb8166]" />
                  <span className="text-[#b7bdc6]">승</span>
                  <span className="text-[#0ecb81] text-lg font-bold tabular-nums ml-1">{wins}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f6465d] shadow-[0_0_8px_#f6465d66]" />
                  <span className="text-[#b7bdc6]">패</span>
                  <span className="text-[#f6465d] text-lg font-bold tabular-nums ml-1">{losses}</span>
                </div>
                <div className="pt-1 text-sm text-[#eaecef]">
                  승률{' '}
                  <span className="text-[#f0b90b] font-bold text-lg tabular-nums">
                    {winRate != null ? `${winRate.toFixed(1)}%` : '-'}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className={`flex-1 min-h-[170px] rounded-xl border border-[#3a4149] bg-[#1a1f27] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${CHART_CARD_HOVER}`}>
            <h3 className="text-base font-bold text-[#f5f6f7] mb-0.5">청산 사유</h3>
            <p className="text-xs text-[#b7bdc6] mb-3">TP / SL / 시그널 비중</p>
            <div className="flex items-center gap-4">
              <div className="w-[128px] h-[128px] flex-shrink-0 rounded-full bg-[#0d1117]/80 border border-[#2b3139] p-1 transition-transform duration-200 ease-out hover:scale-105">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={exitBreakdown}
                      dataKey="count"
                      nameKey="label"
                      innerRadius={34}
                      outerRadius={54}
                      stroke="#1a1f27"
                      strokeWidth={2}
                      activeIndex={exitActive}
                      activeShape={renderActivePieShape}
                      onMouseEnter={(_, index) => setExitActive(index)}
                      onMouseLeave={() => setExitActive(undefined)}
                    >
                      {exitBreakdown.map((d) => (
                        <Cell key={d.reason} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={<PieTooltip />}
                      animationDuration={0}
                      isAnimationActive={false}
                      wrapperStyle={{
                        outline: 'none',
                        zIndex: 20,
                        transition: 'none',
                        pointerEvents: 'none',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="text-sm space-y-2 min-w-0 flex-1">
                {exitBreakdown.map((d) => (
                  <li key={d.reason} className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{
                        background: d.color,
                        boxShadow: `0 0 8px ${d.color}66`,
                      }}
                    />
                    <span className="text-[#eaecef] truncate font-medium">{d.label}</span>
                    <span className="text-[#f5f6f7] font-bold tabular-nums ml-auto">{d.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </div>
      <p className="text-[11px] text-[#848e9c] mt-3">
        막대에 마우스를 올리면 해당 일 실현 손익이 강조 표시됩니다.
      </p>
    </div>
      )}
    </HistoryPanelFrame>
  );
};

export default SummaryInsightsPanel;
