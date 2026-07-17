import React, { useMemo } from 'react';
import { useHistoryPage } from '@/hooks/trading/useHistoryPage';
import { useHistoryQueryParams, useTickModal } from '@/hooks/trading/useHistoryQueryParams';
import tradingHistoryService from '@/services/TradingHistoryService';
import { OrderFillStatus } from '@/types/TradingHistoryTypes';
import Pager from './Pager';
import TickDetailModal from './TickDetailModal';
import HistoryEmptyState from './HistoryEmptyState';
import HistoryPanelFrame from './HistoryPanelFrame';
import HistoryRowIndex from './HistoryRowIndex';

const FILL_STATUS_LABEL: Record<OrderFillStatus, string> = {
  PENDING: '대기중',
  FILLED: '체결완료',
  PARTIAL: '부분체결',
  REJECTED: '거부됨',
  CANCELLED: '취소됨',
};

const FILL_STATUS_COLOR: Record<OrderFillStatus, string> = {
  PENDING: 'text-[#f0b90b]',
  FILLED: 'text-[#0ecb81]',
  PARTIAL: 'text-[#f0b90b]',
  REJECTED: 'text-[#f6465d]',
  CANCELLED: 'text-[#848e9c]',
};

interface OrderHistoryTableProps {
  /** 지정하면 해당 상태만 필터 (예: 미체결 주문 = PENDING) */
  fillStatus?: OrderFillStatus;
}

const OrderHistoryTable: React.FC<OrderHistoryTableProps> = ({ fillStatus }) => {
  const query = useHistoryQueryParams();
  const { correlationId, openTick, closeTick } = useTickModal();
  const resetKey = useMemo(
    () => JSON.stringify({ ...query, fillStatus }),
    [query, fillStatus]
  );

  const { pageItems, page, hasPrev, hasNext, goPrev, goNext, totalCount, loading, error } =
    useHistoryPage(
      ({ limit, offset }) =>
        tradingHistoryService.getOrders({
          ...query,
          limit,
          offset,
          fill_status: fillStatus,
        }),
      resetKey
    );

  const isEmpty = !loading && !error && pageItems.length === 0;

  return (
    <HistoryPanelFrame loading={loading}>
      {error && !loading ? (
        <HistoryEmptyState message={error} variant="error" />
      ) : isEmpty ? (
        <HistoryEmptyState message="주문 내역이 없습니다" />
      ) : pageItems.length === 0 ? (
        <div className="flex-1 min-h-0" />
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto custom-scroll">
          <table className="w-full text-xs text-left">
            <thead className="sticky top-0 bg-[#0b0e11] text-[#848e9c] border-b border-[#2b3139]">
              <tr>
                <th className="px-2 py-2 font-medium w-12 text-center">No.</th>
                <th className="px-3 py-2 font-medium whitespace-nowrap">주문 시각</th>
                <th className="px-3 py-2 font-medium">심볼</th>
                <th className="px-3 py-2 font-medium">방향</th>
                <th className="px-3 py-2 font-medium">유형</th>
                <th className="px-3 py-2 font-medium">수량</th>
                <th className="px-3 py-2 font-medium">주문가</th>
                <th className="px-3 py-2 font-medium">체결 수량</th>
                <th className="px-3 py-2 font-medium">평균 체결가</th>
                <th className="px-3 py-2 font-medium">명목</th>
                <th className="px-3 py-2 font-medium">상태</th>
              </tr>
            </thead>
            <tbody className="text-[#eaecef]">
              {pageItems.map((o, i) => (
                <tr
                  key={o.id ?? `${o.correlation_id}-${o.requested_at}`}
                  onClick={() => openTick(o.correlation_id)}
                  className={`border-b border-[#2b3139]/50 hover:bg-[#1e2329]/50 ${
                    o.correlation_id ? 'cursor-pointer' : ''
                  }`}
                >
                  <td className="px-2 py-2 text-center">
                    <HistoryRowIndex page={page} index={i} />
                  </td>
                  <td className="px-3 py-2 text-[#848e9c] whitespace-nowrap">
                    {new Date(o.requested_at).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 font-medium">{o.symbol}</td>
                  <td
                    className={`px-3 py-2 font-medium ${
                      o.side === 'BUY' ? 'text-[#0ecb81]' : 'text-[#f6465d]'
                    }`}
                  >
                    {o.side === 'BUY' ? '매수' : '매도'}
                    {o.reduce_only && (
                      <span className="ml-1 text-[10px] text-[#848e9c]">청산</span>
                    )}
                  </td>
                  <td className="px-3 py-2">{o.order_type === 'MARKET' ? '시장가' : '지정가'}</td>
                  <td className="px-3 py-2">{o.quantity}</td>
                  <td className="px-3 py-2">{o.price != null ? o.price.toLocaleString() : '-'}</td>
                  <td className="px-3 py-2">{o.filled_qty ?? '-'}</td>
                  <td className="px-3 py-2">
                    {o.avg_fill_price != null ? o.avg_fill_price.toLocaleString() : '-'}
                  </td>
                  <td className="px-3 py-2 text-[#848e9c]">
                    {o.notional_usdt != null ? o.notional_usdt.toLocaleString() : '-'}
                  </td>
                  <td
                    className={`px-3 py-2 font-medium ${FILL_STATUS_COLOR[o.fill_status] ?? 'text-[#848e9c]'}`}
                  >
                    {FILL_STATUS_LABEL[o.fill_status] ?? o.fill_status}
                  </td>
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

export default OrderHistoryTable;
