import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import tradingHistoryService from '@/services/TradingHistoryService';
import { EquityHistoryItem } from '@/types/TradingHistoryTypes';
import { useHistoryFilter } from '@/context/HistoryFilterContext';
import HistoryEmptyState from './HistoryEmptyState';

const MUTED = '#848e9c';
const GREEN = '#0ecb81';

const formatUsdt = (value: number) =>
  value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface EquityChartPanelProps {
  /** 요약 탭용 낮은 차트 */
  compact?: boolean;
  limit?: number;
}

const EquityChartPanel: React.FC<EquityChartPanelProps> = ({
  compact = false,
  limit = 200,
}) => {
  const { queryParams, searchEpoch } = useHistoryFilter();
  const [items, setItems] = useState<EquityHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    tradingHistoryService
      .getEquity({ ...queryParams, limit })
      .then((res) => {
        if (cancelled) return;
        setItems(res.items ?? []);
        setError(null);
      })
      .catch(() => {
        if (cancelled) return;
        setError('잔고 곡선을 불러오지 못했습니다.');
        setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [queryParams, limit, searchEpoch]);

  const chartData = items.map((e) => ({
    ...e,
    label: e.snapshot_date ?? new Date(e.snapshot_at).toLocaleString(),
    timeLabel: new Date(e.snapshot_at).toLocaleString(undefined, {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }),
  }));

  if (error && items.length === 0) {
    return <HistoryEmptyState message={error} variant="error" />;
  }

  if (loading && items.length === 0) {
    return <HistoryEmptyState message="잔고 곡선 불러오는 중..." />;
  }

  if (items.length === 0) {
    return <HistoryEmptyState message="잔고 스냅샷이 없습니다" />;
  }

  const height = compact ? 180 : 320;
  const latest = items[items.length - 1];

  return (
    <div className={`flex-1 min-h-0 overflow-y-auto custom-scroll ${compact ? 'p-3' : 'p-4'}`}>
      {!compact && (
        <div className="flex items-baseline gap-3 mb-3">
          <div className="text-sm text-[#848e9c]">현재 잔고</div>
          <div className="text-xl font-semibold text-[#eaecef]">
            {formatUsdt(latest.equity_usdt)} USDT
          </div>
          {latest.cumulative_realized_pnl != null && (
            <div
              className={`text-sm font-medium ${
                latest.cumulative_realized_pnl >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'
              }`}
            >
              누적 PnL{' '}
              {latest.cumulative_realized_pnl >= 0 ? '+' : ''}
              {formatUsdt(latest.cumulative_realized_pnl)}
            </div>
          )}
        </div>
      )}
      {compact && (
        <div className="text-[11px] text-[#848e9c] mb-2">잔고 곡선</div>
      )}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 8, right: 12, left: 8, bottom: 4 }}>
            <CartesianGrid stroke="#2b3139" strokeWidth={1} vertical={false} />
            <XAxis
              dataKey="timeLabel"
              tick={{ fill: MUTED, fontSize: 10 }}
              axisLine={{ stroke: '#2b3139' }}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={40}
            />
            <YAxis
              tick={{ fill: MUTED, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={56}
              domain={['auto', 'auto']}
              tickFormatter={(v: number) =>
                v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(Math.round(v))
              }
            />
            <Tooltip
              contentStyle={{
                background: '#1e2329',
                border: '1px solid #2b3139',
                borderRadius: 6,
                fontSize: 12,
                color: '#eaecef',
              }}
              labelStyle={{ color: MUTED }}
              itemStyle={{ color: '#eaecef' }}
              animationDuration={0}
              isAnimationActive={false}
              wrapperStyle={{ transition: 'none', outline: 'none' }}
              formatter={(value) => [
                `${formatUsdt(Number(value))} USDT`,
                '잔고',
              ]}
            />
            <Line
              type="monotone"
              dataKey="equity_usdt"
              stroke={GREEN}
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 6,
                fill: GREEN,
                stroke: '#eaecef',
                strokeWidth: 1.5,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="text-[10px] text-[#848e9c] mt-1">
        {items.length}개 스냅샷 · x = snapshot_at · y = equity_usdt
      </div>
    </div>
  );
};

export default EquityChartPanel;
