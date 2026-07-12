import React, { useState } from 'react';
import EngineStatusBar from '@/components/trade/EngineStatusBar';
import FlowTimelineList from '@/components/trade/history/FlowTimelineList';
import SignalHistoryList from '@/components/trade/history/SignalHistoryList';
import AuditLogList from '@/components/trade/history/AuditLogList';
import PerformanceSummaryPanel from '@/components/trade/history/PerformanceSummaryPanel';

type TabKey = 'performance' | 'timeline' | 'signals' | 'audit';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'performance', label: '성과 요약' },
  { key: 'timeline', label: '매매 흐름' },
  { key: 'signals', label: '시그널' },
  { key: 'audit', label: '감사/리스크 로그' },
];

/** BinnAIR 엔진 모니터링 대시보드 — 엔진 상태 + 매매 흐름/시그널/감사로그/성과 요약 */
const TradeHistoryDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('performance');

  return (
    <div className="flex flex-col h-[80vh] min-h-0 bg-[#0b0e11] text-[#eaecef] rounded-lg overflow-hidden border border-[#2b3139]">
      <div className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-[#2b3139]">
        <h1 className="text-base font-semibold">트레이딩 내역 / 기록</h1>
      </div>
      <div className="flex-shrink-0 pt-2">
        <EngineStatusBar />
      </div>
      <div className="flex-shrink-0 flex items-center gap-1 px-3 py-3 border-b border-[#2b3139] overflow-x-auto custom-scroll">
        {TABS.map((t) => (
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

      {activeTab === 'performance' && <PerformanceSummaryPanel />}
      {activeTab === 'timeline' && <FlowTimelineList />}
      {activeTab === 'signals' && <SignalHistoryList />}
      {activeTab === 'audit' && <AuditLogList />}
    </div>
  );
};

export default TradeHistoryDashboard;
