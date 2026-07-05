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

/** 청산 완료 거래(진입→청산 1 라운드트립) — 승/패, 수익률까지 한 눈에 보여주는 거래일지 */
const TradeHistoryTable: React.FC = () => {
  const { pageItems, page, setPage, hasPrev, hasNext, loading, error } = useHistoryPage(
    (limit) => tradingHistoryService.getTrades({ limit }),
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
              <th className="px-3 py-2 font-medium">진입가</th>
              <th className="px-3 py-2 font-medium">청산가</th>
              <th className="px-3 py-2 font-medium">수량</th>
              <th className="px-3 py-2 font-medium">실현 손익</th>
              <th className="px-3 py-2 font-medium">수익률</th>
              <th className="px-3 py-2 font-medium">승패</th>
              <th className="px-3 py-2 font-medium">청산 사유</th>
              <th className="px-3 py-2 font-medium">보유 시간</th>
              <th className="px-3 py-2 font-medium whitespace-nowrap">청산 시각</th>
            </tr>
          </thead>
          <tbody className="text-[#eaecef]">
            {error ? (
              <tr>
                <td colSpan={11} className="px-3 py-6 text-center text-[#f6465d]">
                  {error}
                </td>
              </tr>
            ) : loading && pageItems.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-3 py-6 text-center text-[#848e9c]">
                  불러오는 중...
                </td>
              </tr>
            ) : pageItems.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-3 py-6 text-center text-[#848e9c]">
                  청산 거래 내역이 없습니다
                </td>
              </tr>
            ) : (
              pageItems.map((t) => {
                const isLong = t.side === 'LONG';
                return (
                  <tr
                    key={t.trade_id}
                    className="border-b border-[#2b3139]/50 hover:bg-[#1e2329]/50"
                  >
                    <td className="px-3 py-2 font-medium">{t.symbol}</td>
                    <td
                      className={`px-3 py-2 font-medium ${
                        isLong ? 'text-[#0ecb81]' : 'text-[#f6465d]'
                      }`}
                    >
                      {isLong ? '롱' : '숏'}
                    </td>
                    <td className="px-3 py-2">{t.entry_price.toLocaleString()}</td>
                    <td className="px-3 py-2">{t.exit_price.toLocaleString()}</td>
                    <td className="px-3 py-2">{t.quantity}</td>
                    <td
                      className={`px-3 py-2 font-medium ${
                        t.realized_pnl >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'
                      }`}
                    >
                      {t.realized_pnl >= 0 ? '+' : ''}
                      {t.realized_pnl.toFixed(2)}
                    </td>
                    <td
                      className={`px-3 py-2 font-medium ${
                        t.pnl_pct >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'
                      }`}
                    >
                      {t.pnl_pct >= 0 ? '+' : ''}
                      {t.pnl_pct.toFixed(2)}%
                    </td>
                    <td>
                      <span
                        className={`px-3 py-2 inline-block font-medium ${
                          t.is_win ? 'text-[#0ecb81]' : 'text-[#f6465d]'
                        }`}
                      >
                        {t.is_win ? '승' : '패'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-[#848e9c]">
                      {EXIT_REASON_LABEL[t.exit_reason] ?? t.exit_reason}
                    </td>
                    <td className="px-3 py-2 text-[#848e9c]">
                      {formatDuration(t.holding_seconds ?? t.hold_seconds)}
                    </td>
                    <td className="px-3 py-2 text-[#848e9c] whitespace-nowrap">
                      {new Date(t.closed_at).toLocaleString()}
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

export default TradeHistoryTable;
