import React, { useState } from 'react';
import {
  History,
  LayoutDashboard,
  ClipboardList,
  CheckCircle2,
  Crosshair,
  Trophy,
  Wallet,
  MousePointerClick,
} from 'lucide-react';
import { HistoryFilterProvider } from '@/context/HistoryFilterContext';
import EngineStatusBar from '@/components/trade/EngineStatusBar';
import HistoryDateFilterBar from '@/components/trade/history/HistoryDateFilterBar';
import HistorySummaryCards from '@/components/trade/history/HistorySummaryCards';
import EquityTabPanel from '@/components/trade/history/EquityTabPanel';
import SummaryInsightsPanel from '@/components/trade/history/SummaryInsightsPanel';
import OrderHistoryTable from '@/components/trade/history/OrderHistoryTable';
import ExecutionHistoryTable from '@/components/trade/history/ExecutionHistoryTable';
import PositionHistoryTable from '@/components/trade/history/PositionHistoryTable';
import TradeHistoryTable from '@/components/trade/history/TradeHistoryTable';

type TabKey = 'summary' | 'orders' | 'executions' | 'positions' | 'trades' | 'equity';

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'summary', label: '요약', icon: <LayoutDashboard size={14} /> },
  { key: 'orders', label: '주문', icon: <ClipboardList size={14} /> },
  { key: 'executions', label: '체결', icon: <CheckCircle2 size={14} /> },
  { key: 'positions', label: '포지션', icon: <Crosshair size={14} /> },
  { key: 'trades', label: '청산', icon: <Trophy size={14} /> },
  { key: 'equity', label: '잔고', icon: <Wallet size={14} /> },
];

/** BinnAIR /history/* API 기반 트레이딩 내역 대시보드 */
const TradeHistoryDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('summary');
  /** 한 번 연 탭은 유지 → 재진입 시 레이아웃/데이터 번쩍임 방지 */
  const [visited, setVisited] = useState<Set<TabKey>>(() => new Set(['summary']));

  const selectTab = (key: TabKey) => {
    setActiveTab(key);
    setVisited((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  };

  const paneClass = (key: TabKey) =>
    `flex-1 min-h-0 flex flex-col overflow-hidden ${
      activeTab === key ? '' : 'hidden'
    }`;

  return (
    <HistoryFilterProvider enableDateFilter>
      <div
        className="flex flex-col flex-1 min-h-[min(86vh,900px)] h-[calc(100vh-8.5rem)] text-[#eaecef] rounded-xl overflow-hidden border border-[#2b3139]/90 bg-[#0d1117]/95 backdrop-blur-sm"
        style={{
          boxShadow:
            '0 0 0 1px rgba(255,255,255,0.04), 0 12px 40px rgba(0,0,0,0.55), 0 4px 16px rgba(0,0,0,0.35)',
        }}
      >
        <div className="flex-shrink-0 px-5 pt-5 pb-4 border-b border-[#3a4149] bg-gradient-to-b from-[#2a3038] to-[#1e2329]">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5 flex h-11 w-11 items-center justify-center rounded-lg bg-[#f0b90b]/15 border border-[#f0b90b]/35 text-[#f0b90b] shadow-[0_0_20px_rgba(240,185,11,0.12)]">
              <History size={22} strokeWidth={2.25} />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-[#f5f6f7]">
                트레이딩 내역 / 기록
              </h1>
              <p className="text-xs text-[#b7bdc6] mt-1.5 flex items-center gap-1.5 flex-wrap">
                <span>주문·체결·포지션·청산·잔고를 날짜별로 조회합니다.</span>
                <span className="inline-flex items-center gap-1 text-[#848e9c]">
                  <MousePointerClick size={12} />
                  행 클릭 시 틱 상세
                </span>
              </p>
            </div>
          </div>
        </div>
        <EngineStatusBar />
        <HistoryDateFilterBar />
        <HistorySummaryCards />

        <div className="flex-shrink-0 flex items-center gap-1 px-3 py-2.5 border-b border-[#2b3139] overflow-x-auto custom-scroll bg-[#0d1117]/60">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => selectTab(t.key)}
              className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm rounded-md transition-colors ${
                activeTab === t.key
                  ? 'bg-[#2b3139] text-[#eaecef] shadow-sm'
                  : 'text-[#848e9c] hover:text-[#eaecef] hover:bg-[#1e2329]/70'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 min-h-[360px] flex flex-col overflow-hidden bg-[#0b0e11]/70">
          {visited.has('summary') && (
            <div className={paneClass('summary')}>
              <SummaryInsightsPanel />
            </div>
          )}
          {visited.has('orders') && (
            <div className={paneClass('orders')}>
              <OrderHistoryTable />
            </div>
          )}
          {visited.has('executions') && (
            <div className={paneClass('executions')}>
              <ExecutionHistoryTable />
            </div>
          )}
          {visited.has('positions') && (
            <div className={paneClass('positions')}>
              <PositionHistoryTable />
            </div>
          )}
          {visited.has('trades') && (
            <div className={paneClass('trades')}>
              <TradeHistoryTable />
            </div>
          )}
          {visited.has('equity') && (
            <div className={paneClass('equity')}>
              <EquityTabPanel />
            </div>
          )}
        </div>
      </div>
    </HistoryFilterProvider>
  );
};

export default TradeHistoryDashboard;
