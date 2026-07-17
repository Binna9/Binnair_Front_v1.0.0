import React, { useMemo } from 'react';
import { useHistoryPage } from '@/hooks/trading/useHistoryPage';
import { useHistoryQueryParams, useTickModal } from '@/hooks/trading/useHistoryQueryParams';
import tradingHistoryService from '@/services/TradingHistoryService';
import Pager from './Pager';
import TickDetailModal from './TickDetailModal';
import HistoryEmptyState from './HistoryEmptyState';
import HistoryPanelFrame from './HistoryPanelFrame';
import HistoryRowIndex from './HistoryRowIndex';

const ExecutionHistoryTable: React.FC = () => {
  const query = useHistoryQueryParams();
  const { correlationId, openTick, closeTick } = useTickModal();
  const resetKey = useMemo(() => JSON.stringify(query), [query]);

  const { pageItems, page, hasPrev, hasNext, goPrev, goNext, totalCount, loading, error } =
    useHistoryPage(
      ({ limit, offset }) =>
        tradingHistoryService.getExecutions({ ...query, limit, offset }),
      resetKey
    );

  const isEmpty = !loading && !error && pageItems.length === 0;

  return (
    <HistoryPanelFrame loading={loading}>
      {error && !loading ? (
        <HistoryEmptyState message={error} variant="error" />
      ) : isEmpty ? (
        <HistoryEmptyState message="체결 내역이 없습니다" />
      ) : pageItems.length === 0 ? (
        <div className="flex-1 min-h-0" />
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto custom-scroll">
          <table className="w-full text-xs text-left">
            <thead className="sticky top-0 bg-[#0b0e11] text-[#848e9c] border-b border-[#2b3139]">
              <tr>
                <th className="px-2 py-2 font-medium w-12 text-center">No.</th>
                <th className="px-3 py-2 font-medium whitespace-nowrap">체결 시각</th>
                <th className="px-3 py-2 font-medium">심볼</th>
                <th className="px-3 py-2 font-medium">주문 ID</th>
                <th className="px-3 py-2 font-medium">체결가</th>
                <th className="px-3 py-2 font-medium">체결 수량</th>
                <th className="px-3 py-2 font-medium">명목 금액(USDT)</th>
                <th className="px-3 py-2 font-medium">포지션 방향</th>
                <th className="px-3 py-2 font-medium">상태</th>
              </tr>
            </thead>
            <tbody className="text-[#eaecef]">
              {pageItems.map((e, i) => (
                <tr
                  key={e.id ?? `${e.order_id}-${e.executed_at}`}
                  onClick={() => openTick(e.correlation_id)}
                  className={`border-b border-[#2b3139]/50 hover:bg-[#1e2329]/50 ${
                    e.correlation_id ? 'cursor-pointer' : ''
                  }`}
                >
                  <td className="px-2 py-2 text-center">
                    <HistoryRowIndex page={page} index={i} />
                  </td>
                  <td className="px-3 py-2 text-[#848e9c] whitespace-nowrap">
                    {new Date(e.executed_at).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 font-medium">{e.symbol}</td>
                  <td className="px-3 py-2 text-[#848e9c]">
                    {e.order_id}
                    {e.synced_from_exchange && (
                      <span className="ml-1 text-[10px] text-[#f0b90b]">거래소</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {e.executed_price != null ? e.executed_price.toLocaleString() : '-'}
                  </td>
                  <td className="px-3 py-2">{e.executed_qty}</td>
                  <td className="px-3 py-2">
                    {e.notional_usdt != null ? e.notional_usdt.toLocaleString() : '-'}
                  </td>
                  <td className="px-3 py-2 text-[#848e9c]">{e.position_side}</td>
                  <td className="px-3 py-2 text-[#0ecb81]">{e.status}</td>
                </tr>
              ))}
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
      {correlationId && (
        <TickDetailModal correlationId={correlationId} onClose={closeTick} />
      )}
    </HistoryPanelFrame>
  );
};

export default ExecutionHistoryTable;
