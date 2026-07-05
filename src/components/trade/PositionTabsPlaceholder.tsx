import React, { useState } from 'react';
import { useLiveAccountStore } from '@/store/trading/liveAccountStore';
import { useHistorySummary } from '@/hooks/trading/useHistorySummary';
import LivePositionsTable from '@/components/trade/LivePositionsTable';
import OrderHistoryTable from '@/components/trade/history/OrderHistoryTable';
import ExecutionHistoryTable from '@/components/trade/history/ExecutionHistoryTable';
import PositionHistoryTable from '@/components/trade/history/PositionHistoryTable';
import TradeHistoryTable from '@/components/trade/history/TradeHistoryTable';

type TabKey =
  | 'positions'
  | 'pending_orders'
  | 'orders'
  | 'executions'
  | 'position_history'
  | 'trades';

const PositionTabsPlaceholder: React.FC = () => {
  const positionsMap = useLiveAccountStore((s) => s.positions);
  const summary = useHistorySummary();
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
      <div className="flex-shrink-0 flex items-center gap-1 px-3 py-2 border-b border-[#2b3139] overflow-x-auto custom-scroll">
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

      {activeTab === 'positions' && <LivePositionsTable />}
      {activeTab === 'pending_orders' && <OrderHistoryTable fillStatus="PENDING" />}
      {activeTab === 'orders' && <OrderHistoryTable />}
      {activeTab === 'executions' && <ExecutionHistoryTable />}
      {activeTab === 'position_history' && <PositionHistoryTable />}
      {activeTab === 'trades' && <TradeHistoryTable />}
    </div>
  );
};

export default PositionTabsPlaceholder;
