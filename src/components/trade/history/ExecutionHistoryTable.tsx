import React from 'react';
import { useHistoryPage } from '@/hooks/trading/useHistoryPage';
import tradingHistoryService from '@/services/TradingHistoryService';
import Pager from './Pager';

const ExecutionHistoryTable: React.FC = () => {
  const { pageItems, page, setPage, hasPrev, hasNext, loading, error } = useHistoryPage(
    (limit) => tradingHistoryService.getExecutions({ limit }),
    null
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto custom-scroll">
        <table className="w-full text-xs text-left">
          <thead className="sticky top-0 bg-[#0b0e11] text-[#848e9c] border-b border-[#2b3139]">
            <tr>
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
            {error ? (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-[#f6465d]">
                  {error}
                </td>
              </tr>
            ) : loading && pageItems.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-[#848e9c]">
                  불러오는 중...
                </td>
              </tr>
            ) : pageItems.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-[#848e9c]">
                  체결 내역이 없습니다
                </td>
              </tr>
            ) : (
              pageItems.map((e) => (
                <tr
                  key={e.id ?? `${e.order_id}-${e.executed_at}`}
                  className="border-b border-[#2b3139]/50 hover:bg-[#1e2329]/50"
                >
                  <td className="px-3 py-2 text-[#848e9c] whitespace-nowrap">
                    {new Date(e.executed_at).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 font-medium">{e.symbol}</td>
                  <td className="px-3 py-2 text-[#848e9c]">{e.order_id}</td>
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

export default ExecutionHistoryTable;
