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
} from 'recharts';
import tradingHistoryService from '@/services/TradingHistoryService';
import { TradeHistoryItem } from '@/types/TradingHistoryTypes';
import { useHistoryFilter } from '@/context/HistoryFilterContext';
import { useHistorySummary } from '@/hooks/trading/useHistorySummary';
import HistoryEmptyState from './HistoryEmptyState';
import { formatExitReason } from './historyLabels';

const GREEN = '#0ecb81';
const RED = '#f6465d';
const MUTED = '#848e9c';
const EXIT_COLORS = ['#f0b90b', '#0ecb81', '#f6465d', '#3b82f6', '#a855f7', '#848e9c'];

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
      .map(([reason, count]) => ({
        reason,
        label: formatExitReason(reason),
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [trades]);

  const wins = summary?.wins ?? trades.filter((t) => t.is_win).length;
  const losses = summary?.losses ?? trades.filter((t) => !t.is_win).length;
  const winLossData = [
    { name: '승', value: wins, color: GREEN },
    { name: '패', value: losses, color: RED },
  ].filter((d) => d.value > 0);

  if (error && trades.length === 0) {
    return <HistoryEmptyState message={error} variant="error" />;
  }

  if (loading && trades.length === 0) {
    return <HistoryEmptyState message="요약 차트 불러오는 중..." />;
  }

  if (trades.length === 0) {
    return <HistoryEmptyState message="기간 내 청산 거래가 없어 요약 차트를 그릴 수 없습니다" />;
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scroll p-4">
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)] gap-4 h-full min-h-[280px]">
        {/* 일별 실현 손익 */}
        <section className="min-h-[260px] flex flex-col rounded-lg border border-[#2b3139] bg-[#12161c]/80 p-3">
          <div className="flex items-baseline justify-between mb-2">
            <h3 className="text-sm font-semibold text-[#eaecef]">일별 실현 손익</h3>
            <span className="text-[11px] text-[#848e9c]">
              청산 기준 · {trades.length}건 집계
            </span>
          </div>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyPnl} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid stroke="#2b3139" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: MUTED, fontSize: 11 }}
                  axisLine={{ stroke: '#2b3139' }}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: MUTED, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={52}
                />
                <ReferenceLine y={0} stroke="#3a4149" />
                <Tooltip
                  contentStyle={{
                    background: '#1e2329',
                    border: '1px solid #2b3139',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: MUTED }}
                  formatter={(value) => [`${formatUsdt(Number(value))} USDT`, '실현 손익']}
                  labelFormatter={(label, payload) => {
                    const row = payload?.[0]?.payload as
                      | { day?: string; count?: number; wins?: number; losses?: number }
                      | undefined;
                    if (!row?.day) return String(label);
                    return `${row.day} · ${row.count}건 (승 ${row.wins}/패 ${row.losses})`;
                  }}
                />
                <Bar dataKey="pnl" radius={[3, 3, 0, 0]} maxBarSize={28}>
                  {dailyPnl.map((d) => (
                    <Cell key={d.day} fill={d.pnl >= 0 ? GREEN : RED} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 승패 + 청산 사유 */}
        <div className="flex flex-col gap-4 min-h-[260px]">
          <section className="flex-1 min-h-[120px] rounded-lg border border-[#2b3139] bg-[#12161c]/80 p-3">
            <h3 className="text-sm font-semibold text-[#eaecef] mb-1">승 / 패</h3>
            <div className="flex items-center gap-3 h-[calc(100%-1.5rem)]">
              <div className="w-[110px] h-[110px] flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={winLossData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={28}
                      outerRadius={48}
                      stroke="none"
                    >
                      {winLossData.map((d) => (
                        <Cell key={d.name} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#1e2329',
                        border: '1px solid #2b3139',
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-sm space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0ecb81]" />
                  <span className="text-[#848e9c]">승</span>
                  <span className="text-[#0ecb81] font-semibold">{wins}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#f6465d]" />
                  <span className="text-[#848e9c]">패</span>
                  <span className="text-[#f6465d] font-semibold">{losses}</span>
                </div>
                <div className="text-[11px] text-[#848e9c] pt-1">
                  승률{' '}
                  {summary?.win_rate != null
                    ? `${(summary.win_rate * 100).toFixed(1)}%`
                    : wins + losses > 0
                      ? `${((wins / (wins + losses)) * 100).toFixed(1)}%`
                      : '-'}
                </div>
              </div>
            </div>
          </section>

          <section className="flex-1 min-h-[120px] rounded-lg border border-[#2b3139] bg-[#12161c]/80 p-3">
            <h3 className="text-sm font-semibold text-[#eaecef] mb-1">청산 사유</h3>
            <div className="flex items-center gap-3 h-[calc(100%-1.5rem)]">
              <div className="w-[110px] h-[110px] flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={exitBreakdown}
                      dataKey="count"
                      nameKey="label"
                      innerRadius={28}
                      outerRadius={48}
                      stroke="none"
                    >
                      {exitBreakdown.map((d, i) => (
                        <Cell key={d.reason} fill={EXIT_COLORS[i % EXIT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#1e2329',
                        border: '1px solid #2b3139',
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="text-xs space-y-1.5 min-w-0">
                {exitBreakdown.map((d, i) => (
                  <li key={d.reason} className="flex items-center gap-2 truncate">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: EXIT_COLORS[i % EXIT_COLORS.length] }}
                    />
                    <span className="text-[#848e9c] truncate">{d.label}</span>
                    <span className="text-[#eaecef] font-medium ml-auto">{d.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </div>
      <p className="text-[10px] text-[#848e9c] mt-3">
        요약 = 청산(trades) 성과 분석 · 잔고 탭 = equity_usdt 시계열 (계정 잔고 곡선)
      </p>
    </div>
  );
};

export default SummaryInsightsPanel;
