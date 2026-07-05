import React from 'react';
import { useHistoryPage } from '@/hooks/trading/useHistoryPage';
import tradingHistoryService from '@/services/TradingHistoryService';
import Pager from './Pager';

const EXIT_REASON_LABEL: Record<string, string> = {
  TAKE_PROFIT: '익절(TP)',
  STOP_LOSS: '손절(SL)',
  MODEL_SELL: '모델 매도',
};

const formatDuration = (seconds?: number | null) => {
  if (seconds == null) return '-';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}분 ${s}초`;
};

const PositionHistoryTable: React.FC = () => {
  const { pageItems, page, setPage, hasPrev, hasNext, loading, error } = useHistoryPage(
    (limit) => tradingHistoryService.getPositions({ limit }),
    null
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto custom-scroll">
        <table className="w-full text-xs text-left">
          <thead className="sticky top-0 bg-[#0b0e11] text-[#848e9c] border-b border-[#2b3139]">
            <tr>
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
            {error ? (
              <tr>
                <td colSpan={13} className="px-3 py-6 text-center text-[#f6465d]">
                  {error}
                </td>
              </tr>
            ) : loading && pageItems.length === 0 ? (
              <tr>
                <td colSpan={13} className="px-3 py-6 text-center text-[#848e9c]">
                  불러오는 중...
                </td>
              </tr>
            ) : pageItems.length === 0 ? (
              <tr>
                <td colSpan={13} className="px-3 py-6 text-center text-[#848e9c]">
                  포지션 내역이 없습니다
                </td>
              </tr>
            ) : (
              pageItems.map((p) => {
                const isClosed = p.status === 'CLOSED';
                const pnl = isClosed ? p.realized_pnl : p.unrealized_pnl;
                const isLong = p.side === 'LONG';
                return (
                  <tr
                    key={p.id ?? `${p.symbol}-${p.snapshot_at}`}
                    className="border-b border-[#2b3139]/50 hover:bg-[#1e2329]/50"
                  >
                    <td className="px-3 py-2 font-medium">{p.symbol}</td>
                    <td
                      className={`px-3 py-2 font-medium ${
                        isLong ? 'text-[#0ecb81]' : 'text-[#f6465d]'
                      }`}
                    >
                      {isLong ? '롱' : '숏'}
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
                      {p.exit_reason ? EXIT_REASON_LABEL[p.exit_reason] ?? p.exit_reason : '-'}
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
              })
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

export default PositionHistoryTable;
