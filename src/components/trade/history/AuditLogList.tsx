import React from 'react';
import { useHistoryPage } from '@/hooks/trading/useHistoryPage';
import tradingAuditLogService from '@/services/TradingAuditLogService';
import Pager from './Pager';

function eventColor(event: string): string {
  if (event.includes('risk_rejected')) return 'text-[#f0b90b]';
  if (event.includes('closed')) return 'text-[#848e9c]';
  return 'text-[#eaecef]';
}

function formatData(data: Record<string, unknown>): string {
  if (typeof data.reason === 'string') return data.reason;
  const entries = Object.entries(data);
  if (entries.length === 0) return '-';
  return entries.map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(', ');
}

/** 리스크 거부·포지션 청산 등 감사(audit) 이벤트 이력 */
const AuditLogList: React.FC = () => {
  const { pageItems, page, setPage, hasPrev, hasNext, loading, error } = useHistoryPage(
    (limit) => tradingAuditLogService.getAuditLogs({ limit }),
    null
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto custom-scroll">
        {error ? (
          <div className="px-3 py-6 text-center text-xs text-[#f6465d]">{error}</div>
        ) : loading && pageItems.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-[#848e9c]">불러오는 중...</div>
        ) : pageItems.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-[#848e9c]">
            감사 로그가 없습니다
          </div>
        ) : (
          <ul>
            {pageItems.map((a) => (
              <li
                key={a.id ?? `${a.correlation_id}-${a.created_at}`}
                className="px-3 py-2 border-b border-[#2b3139]/50 hover:bg-[#1e2329]/50"
              >
                <div className="flex items-center gap-2 text-[11px] text-[#848e9c]">
                  <span className="whitespace-nowrap">
                    {a.created_at ? new Date(a.created_at).toLocaleString() : '-'}
                  </span>
                  <span>run: {a.run_id}</span>
                </div>
                <div className={`text-xs mt-0.5 font-medium ${eventColor(a.event)}`}>
                  {a.event}
                </div>
                <div className="text-xs mt-0.5 text-[#eaecef] truncate">
                  {formatData(a.data)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Pager
        page={page}
        hasPrev={hasPrev}
        hasNext={hasNext}
        onPrev={() => setPage((p) => p - 1)}
        onNext={() => setPage((p) => p + 1)}
      />
    </div>
  );
};

export default AuditLogList;
