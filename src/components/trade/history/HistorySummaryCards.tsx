import React from 'react';
import { useHistorySummary } from '@/hooks/trading/useHistorySummary';

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
    <div className="bg-[#1e2329] border border-[#2b3139] rounded-md px-3 py-2.5 min-w-0 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.03] hover:border-[#4a5160] hover:shadow-[0_8px_20px_rgba(0,0,0,0.35)] will-change-transform">
      <div className="text-[11px] text-[#848e9c] truncate">{label}</div>
      <div className={`text-base font-semibold mt-0.5 truncate ${color}`}>{value}</div>
    </div>
  );
};

const HistorySummaryCards: React.FC = () => {
  const { summary, loading, error } = useHistorySummary(true);

  if (error && !summary) {
    return (
      <div className="px-3 py-4 text-xs text-[#f6465d]">{error}</div>
    );
  }

  if (loading && !summary) {
    return (
      <div className="px-3 py-4 text-xs text-[#848e9c]">요약 불러오는 중...</div>
    );
  }

  if (!summary) return null;

  const wins = summary.wins ?? 0;
  const losses = summary.losses ?? 0;
  const winRate =
    summary.win_rate != null
      ? `${(summary.win_rate * 100).toFixed(1)}%`
      : wins + losses > 0
        ? `${((wins / (wins + losses)) * 100).toFixed(1)}%`
        : '-';

  return (
    <div className="flex-shrink-0 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 px-3 py-3 border-b border-[#2b3139]">
      <StatTile label="보유 포지션" value={`${summary.open_positions}`} />
      <StatTile
        label="주문"
        value={`${summary.orders_filled}/${summary.orders_total}`}
      />
      <StatTile label="미체결" value={`${summary.orders_pending}`} />
      <StatTile label="체결" value={`${summary.executions_total}`} />
      <StatTile label="청산" value={`${summary.closed_trades}`} />
      <StatTile
        label="실현 손익"
        value={`${summary.realized_pnl_sum >= 0 ? '+' : ''}${formatUsdt(summary.realized_pnl_sum)}`}
        colorByValue={summary.realized_pnl_sum}
      />
      <StatTile label="승 / 패" value={`${wins} / ${losses}`} />
      <StatTile label="승률" value={winRate} />
    </div>
  );
};

export default HistorySummaryCards;
