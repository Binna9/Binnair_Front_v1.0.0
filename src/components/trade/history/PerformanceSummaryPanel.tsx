import React from 'react';
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
} from 'recharts';
import { usePerformanceSummary } from '@/hooks/trading/usePerformanceSummary';
import { usePerformancePeriods } from '@/hooks/trading/usePerformancePeriods';
import { PerformancePeriodItemDTO } from '@/types/TradingPerformanceTypes';

const GREEN = '#0ecb81';
const RED = '#f6465d';
const MUTED = '#848e9c';

const formatUsdt = (value: number) =>
  value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface StatTileProps {
  label: string;
  value: string;
  colorByValue?: number | null;
}

const StatTile: React.FC<StatTileProps> = ({ label, value, colorByValue }) => {
  const color =
    colorByValue == null
      ? 'text-[#eaecef]'
      : colorByValue >= 0
        ? 'text-[#0ecb81]'
        : 'text-[#f6465d]';
  return (
    <div className="bg-[#1e2329] border border-[#2b3139] rounded-md px-3 py-2 min-w-0">
      <div className="text-[11px] text-[#848e9c] truncate">{label}</div>
      <div className={`text-base font-semibold mt-0.5 truncate ${color}`}>{value}</div>
    </div>
  );
};

interface TooltipPayloadItem {
  payload: PerformancePeriodItemDTO;
}

const ChartTooltip: React.FC<{ active?: boolean; payload?: TooltipPayloadItem[] }> = ({
  active,
  payload,
}) => {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-[#1e2329] border border-[#2b3139] rounded-md px-3 py-2 text-xs">
      <div className="text-[#848e9c] mb-1">{d.period_label}</div>
      <div className={d.realized_pnl_sum >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}>
        손익 {d.realized_pnl_sum >= 0 ? '+' : ''}
        {formatUsdt(d.realized_pnl_sum)} USDT
      </div>
      <div className="text-[#eaecef]">거래 {d.trade_count}건 · 승률 {(d.win_rate * 100).toFixed(0)}%</div>
    </div>
  );
};

/** 성과 요약(승률·PnL·profit factor) + 최근 30일 일별 손익 차트 */
const PerformanceSummaryPanel: React.FC = () => {
  const { summary, loading, error } = usePerformanceSummary();
  const { items: periods } = usePerformancePeriods();

  if (error && !summary) {
    return (
      <div className="flex-1 min-h-0 flex items-center justify-center text-xs text-[#f6465d]">
        {error}
      </div>
    );
  }

  if (loading && !summary) {
    return (
      <div className="flex-1 min-h-0 flex items-center justify-center text-xs text-[#848e9c]">
        성과 요약 불러오는 중...
      </div>
    );
  }

  if (!summary || summary.total_trades === 0) {
    return (
      <div className="flex-1 min-h-0 flex items-center justify-center text-xs text-[#848e9c]">
        청산 이력이 없어 성과 데이터가 없습니다
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scroll p-3">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
        <StatTile label="총 거래" value={`${summary.total_trades}건`} />
        <StatTile label="승률" value={`${(summary.win_rate * 100).toFixed(1)}%`} />
        <StatTile
          label="실현 손익"
          value={`${summary.realized_pnl_total >= 0 ? '+' : ''}${formatUsdt(summary.realized_pnl_total)}`}
          colorByValue={summary.realized_pnl_total}
        />
        <StatTile
          label="평균 손익률"
          value={`${summary.avg_pnl_pct >= 0 ? '+' : ''}${summary.avg_pnl_pct.toFixed(2)}%`}
          colorByValue={summary.avg_pnl_pct}
        />
        <StatTile
          label="Profit Factor"
          value={summary.profit_factor != null ? summary.profit_factor.toFixed(2) : '-'}
        />
        <StatTile
          label="수익률"
          value={summary.return_pct != null ? `${summary.return_pct >= 0 ? '+' : ''}${summary.return_pct.toFixed(2)}%` : '-'}
          colorByValue={summary.return_pct}
        />
      </div>

      <div className="text-[11px] text-[#848e9c] mb-2">일별 실현 손익 (최근 30일)</div>
      {periods.length === 0 ? (
        <div className="text-xs text-[#848e9c]">일별 데이터가 없습니다</div>
      ) : (
        <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer>
            <BarChart data={periods} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
              <CartesianGrid stroke="#2b3139" strokeWidth={1} vertical={false} />
              <XAxis
                dataKey="period_label"
                tick={{ fill: MUTED, fontSize: 10 }}
                axisLine={{ stroke: '#2b3139' }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: MUTED, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <ReferenceLine y={0} stroke="#2b3139" />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: '#2b3139', opacity: 0.4 }} />
              <Bar dataKey="realized_pnl_sum" radius={[2, 2, 0, 0]} maxBarSize={20}>
                {periods.map((p, i) => (
                  <Cell key={i} fill={p.realized_pnl_sum >= 0 ? GREEN : RED} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="text-[10px] text-[#848e9c] mt-1">
        기준 잔고 {summary.reference_equity_usdt != null ? formatUsdt(summary.reference_equity_usdt) : '-'} USDT
      </div>
    </div>
  );
};

export default PerformanceSummaryPanel;
