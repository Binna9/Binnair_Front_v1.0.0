import React from 'react';
import { useHistoryPage } from '@/hooks/trading/useHistoryPage';
import tradingHistoryService from '@/services/TradingHistoryService';
import { OrderFillStatus } from '@/types/TradingHistoryTypes';
import Pager from './Pager';

const FILL_STATUS_LABEL: Record<OrderFillStatus, string> = {
  PENDING: '대기중',
  FILLED: '체결완료',
  REJECTED: '거부됨',
  CANCELLED: '취소됨',
};

const FILL_STATUS_COLOR: Record<OrderFillStatus, string> = {
  PENDING: 'text-[#f0b90b]',
  FILLED: 'text-[#0ecb81]',
  REJECTED: 'text-[#f6465d]',
  CANCELLED: 'text-[#848e9c]',
};

interface OrderHistoryTableProps {
  /** 지정하면 해당 상태만 필터 (예: 미체결 주문 = PENDING) */
  fillStatus?: OrderFillStatus;
}

const OrderHistoryTable: React.FC<OrderHistoryTableProps> = ({ fillStatus }) => {
  const { pageItems, page, setPage, hasPrev, hasNext, loading, error } = useHistoryPage(
    (limit) => tradingHistoryService.getOrders({ limit, fill_status: fillStatus }),
    fillStatus
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto custom-scroll">
        <table className="w-full text-xs text-left">
          <thead className="sticky top-0 bg-[#0b0e11] text-[#848e9c] border-b border-[#2b3139]">
            <tr>
              <th className="px-3 py-2 font-medium whitespace-nowrap">시각</th>
              <th className="px-3 py-2 font-medium">심볼</th>
              <th className="px-3 py-2 font-medium">방향</th>
              <th className="px-3 py-2 font-medium">유형</th>
              <th className="px-3 py-2 font-medium">수량</th>
              <th className="px-3 py-2 font-medium">주문가</th>
              <th className="px-3 py-2 font-medium">체결 수량</th>
              <th className="px-3 py-2 font-medium">평균 체결가</th>
              <th className="px-3 py-2 font-medium">상태</th>
            </tr>
          </thead>
          <tbody className="text-[#eaecef]">
            {error ? (
              <tr>
                <td colSpan={9} className="px-3 py-6 text-center text-[#f6465d]">
                  {error}
                </td>
              </tr>
            ) : loading && pageItems.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-3 py-6 text-center text-[#848e9c]">
                  불러오는 중...
                </td>
              </tr>
            ) : pageItems.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-3 py-6 text-center text-[#848e9c]">
                  주문 내역이 없습니다
                </td>
              </tr>
            ) : (
              pageItems.map((o) => (
                <tr
                  key={o.id ?? `${o.correlation_id}-${o.requested_at}`}
                  className="border-b border-[#2b3139]/50 hover:bg-[#1e2329]/50"
                >
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
                  </td>
                  <td className="px-3 py-2">{o.order_type === 'MARKET' ? '시장가' : '지정가'}</td>
                  <td className="px-3 py-2">{o.quantity}</td>
                  <td className="px-3 py-2">{o.price != null ? o.price.toLocaleString() : '-'}</td>
                  <td className="px-3 py-2">{o.filled_qty ?? '-'}</td>
                  <td className="px-3 py-2">
                    {o.avg_fill_price != null ? o.avg_fill_price.toLocaleString() : '-'}
                  </td>
                  <td className={`px-3 py-2 font-medium ${FILL_STATUS_COLOR[o.fill_status]}`}>
                    {FILL_STATUS_LABEL[o.fill_status]}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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

export default OrderHistoryTable;
