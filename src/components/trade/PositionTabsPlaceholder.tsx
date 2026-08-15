import React, { useState } from 'react';
import { useLiveAccountStore } from '@/store/trading/liveAccountStore';
import { HistoryFilterProvider } from '@/context/HistoryFilterContext';
import { useHistorySummary } from '@/hooks/trading/useHistorySummary';
import LivePositionsTable from '@/components/trade/LivePositionsTable';
import OrderHistoryTable from '@/components/trade/history/OrderHistoryTable';
import ExecutionHistoryTable from '@/components/trade/history/ExecutionHistoryTable';
import PositionHistoryTable from '@/components/trade/history/PositionHistoryTable';
import TradeHistoryTable from '@/components/trade/history/TradeHistoryTable';
import HistoryRunSelect from '@/components/trade/history/HistoryRunSelect';

type TabKey =
  | 'positions'
  | 'pending_orders'
  | 'orders'
  | 'executions'
  | 'position_history'
  | 'trades';

const TabsInner: React.FC = () => {
  const positionsMap = useLiveAccountStore((s) => s.positions);
  const { summary } = useHistorySummary();
  const [activeTab, setActiveTab] = useState<TabKey>('positions');
  const positionCount = Object.keys(positionsMap).length;

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'positions', label: `포지션(${positionCount})` },
    { key: 'pending_orders', label: `미체결 주문(${summary?.orders_pending ?? 0})` },
    { key: 'orders', label: '주문 내역' },
    { key: 'executions', label: '체결 내역' },
    { key: 'position_history', label: '포지션 내역' },
    { key: 'trades', label: `청산 거래(${summary?.closed_trades ?? 0})` },
  ];

  return (
    <div className="h-full min-h-0 flex flex-col overflow-hidden bg-[#0b0e11]">
      <div className="flex-shrink-0 flex flex-col gap-2 border-b border-[#2b3139] px-3 py-2 sm:flex-row sm:items-stretch sm:gap-3">
        <HistoryRunSelect compact className="sm:max-w-[24rem] sm:shrink-0" />
        <div
          className="hidden w-px shrink-0 self-stretch bg-[#2b3139] sm:block"
          aria-hidden
        />
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto custom-scroll rounded-lg border border-[#2b3139]/bg-[#0b0e11]/40 px-2 py-1.5">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={`flex-shrink-0 px-3 py-1.5 text-sm rounded transition-colors ${
                activeTab === t.key
                  ? 'bg-[#2b3139] text-[#eaecef]'
                  : 'text-[#848e9c] hover:text-[#eaecef]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'positions' && <LivePositionsTable />}
      {activeTab === 'pending_orders' && <OrderHistoryTable fillStatus="PENDING" />}
      {activeTab === 'orders' && <OrderHistoryTable />}
      {activeTab === 'executions' && <ExecutionHistoryTable />}
      {activeTab === 'position_history' && <PositionHistoryTable />}
      {activeTab === 'trades' && <TradeHistoryTable />}
    </div>
  );
};

const PositionTabsPlaceholder: React.FC = () => (
  <HistoryFilterProvider enableDateFilter={false}>
    <TabsInner />
  </HistoryFilterProvider>
);

export default PositionTabsPlaceholder;
