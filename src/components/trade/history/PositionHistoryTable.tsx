import React, { useMemo, useState } from 'react';
import { useHistoryPage } from '@/hooks/trading/useHistoryPage';
import { useHistoryQueryParams } from '@/hooks/trading/useHistoryQueryParams';
import tradingHistoryService from '@/services/TradingHistoryService';
import Pager from './Pager';
import HistoryEmptyState from './HistoryEmptyState';
import HistoryPanelFrame from './HistoryPanelFrame';
import HistoryRowIndex from './HistoryRowIndex';
import { formatDuration, formatExitReason } from './historyLabels';

type StatusFilter = '' | 'OPEN' | 'CLOSED';

const PositionHistoryTable: React.FC = () => {
  const query = useHistoryQueryParams();
  const [status, setStatus] = useState<StatusFilter>('');
  const resetKey = useMemo(
    () => JSON.stringify({ ...query, status }),
    [query, status]
  );

  const { pageItems, page, hasPrev, hasNext, goPrev, goNext, totalCount, loading, error } =
    useHistoryPage(
      ({ limit, offset }) =>
        tradingHistoryService.getPositions({
          ...query,
          limit,
          offset,
          status: status || undefined,
        }),
      resetKey
    );

  const isEmpty = !loading && !error && pageItems.length === 0;

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <div className="flex-shrink-0 flex flex-wrap items-center gap-3 px-3 py-2.5 border-b border-[#2b3139] text-xs">
        <div className="inline-flex items-center gap-2 rounded-md border border-[#2b3139] bg-[#1e2329]/70 px-2.5 py-1.5">
          <span className="text-[#b7bdc6] font-medium whitespace-nowrap pr-1.5 border-r border-[#3a4149]">
            상태
          </span>
          <div className="flex items-center gap-1">
            {(
              [
                { key: '', label: '전체' },
                { key: 'OPEN', label: '보유중' },
                { key: 'CLOSED', label: '청산완료' },
              ] as const
            ).map((o) => (
              <button
                key={o.key || 'all'}
                type="button"
                onClick={() => setStatus(o.key)}
                className={`px-2.5 py-1 rounded ${
                  status === o.key
                    ? o.key === 'OPEN'
                      ? 'bg-[#0ecb8133] text-[#0ecb81]'
                      : o.key === 'CLOSED'
                        ? 'bg-[#848e9c33] text-[#b7bdc6]'
                        : 'bg-[#2b3139] text-[#eaecef]'
                    : 'text-[#848e9c] hover:text-[#eaecef] hover:bg-[#2b3139]/60'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <HistoryPanelFrame loading={loading}>
        {error && !loading ? (
          <HistoryEmptyState message={error} variant="error" />
        ) : isEmpty ? (
          <HistoryEmptyState message="포지션 내역이 없습니다" />
        ) : pageItems.length === 0 ? (
          <div className="flex-1 min-h-0" />
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto custom-scroll">
            <table className="w-full text-xs text-left">
              <thead className="sticky top-0 bg-[#0b0e11] text-[#848e9c] border-b border-[#2b3139]">
                <tr>
                  <th className="px-2 py-2 font-medium w-12 text-center">No.</th>
                  <th className="px-3 py-2 font-medium">심볼</th>
                  <th className="px-3 py-2 font-medium">방향</th>
                  <th className="px-3 py-2 font-medium">상태</th>
                  <th className="px-3 py-2 font-medium">수량</th>
                  <th className="px-3 py-2 font-medium">진입가</th>
                  <th className="px-3 py-2 font-medium">익절가(TP)</th>
                  <th className="px-3 py-2 font-medium">손절가(SL)</th>
                  <th className="px-3 py-2 font-medium">청산가</th>
                  <th className="px-3 py-2 font-medium">손익</th>
                  <th className="px-3 py-2 font-medium">청산 사유</th>
                  <th className="px-3 py-2 font-medium whitespace-nowrap">진입 시각</th>
                  <th className="px-3 py-2 font-medium whitespace-nowrap">청산 시각</th>
                  <th className="px-3 py-2 font-medium">보유 시간</th>
                </tr>
              </thead>
              <tbody className="text-[#eaecef]">
                {pageItems.map((p, i) => {
                  const isClosed = p.status === 'CLOSED';
                  const pnl = isClosed ? p.realized_pnl : p.unrealized_pnl;
                  const isLong = p.side === 'LONG';
                  return (
                    <tr
                      key={p.id ?? `${p.symbol}-${p.snapshot_at}`}
                      className="border-b border-[#2b3139]/50 hover:bg-[#1e2329]/50"
                    >
                      <td className="px-2 py-2 text-center">
                        <HistoryRowIndex page={page} index={i} />
                      </td>
                      <td className="px-3 py-2 font-medium">{p.symbol}</td>
                      <td
                        className={`px-3 py-2 font-medium ${
                          isLong ? 'text-[#0ecb81]' : 'text-[#f6465d]'
                        }`}
                      >
                        {isLong ? '롱' : p.side === 'SHORT' ? '숏' : '-'}
                      </td>
                      <td className="px-3 py-2 text-[#848e9c]">
                        {isClosed ? '청산완료' : '보유중'}
                      </td>
                      <td className="px-3 py-2">{p.quantity}</td>
                      <td className="px-3 py-2">{p.avg_entry_price.toLocaleString()}</td>
                      <td className="px-3 py-2 text-[#0ecb81]">
                        {p.tp_price != null ? p.tp_price.toLocaleString() : '-'}
                      </td>
                      <td className="px-3 py-2 text-[#f6465d]">
                        {p.sl_price != null ? p.sl_price.toLocaleString() : '-'}
                      </td>
                      <td className="px-3 py-2">
                        {p.exit_price != null ? p.exit_price.toLocaleString() : '-'}
                      </td>
                      <td
                        className={`px-3 py-2 font-medium ${
                          pnl != null && pnl >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'
                        }`}
                      >
                        {pnl != null ? `${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}` : '-'}
                      </td>
                      <td className="px-3 py-2 text-[#848e9c]">
                        {formatExitReason(p.exit_reason)}
                      </td>
                      <td className="px-3 py-2 text-[#848e9c] whitespace-nowrap">
                        {p.opened_at ? new Date(p.opened_at).toLocaleString() : '-'}
                      </td>
                      <td className="px-3 py-2 text-[#848e9c] whitespace-nowrap">
                        {p.closed_at ? new Date(p.closed_at).toLocaleString() : '-'}
                      </td>
                      <td className="px-3 py-2 text-[#848e9c]">
                        {formatDuration(p.duration_seconds)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pager
          page={page}
          hasPrev={hasPrev}
          hasNext={hasNext}
          onPrev={goPrev}
          onNext={goNext}
          totalCount={totalCount}
        />
      </HistoryPanelFrame>
    </div>
  );
};

export default PositionHistoryTable;
