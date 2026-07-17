import React, { useMemo, useState } from 'react';
import { useHistoryPage } from '@/hooks/trading/useHistoryPage';
import { useHistoryQueryParams, useTickModal } from '@/hooks/trading/useHistoryQueryParams';
import tradingHistoryService from '@/services/TradingHistoryService';
import Pager from './Pager';
import TickDetailModal from './TickDetailModal';
import HistoryEmptyState from './HistoryEmptyState';
import HistoryPanelFrame from './HistoryPanelFrame';
import HistoryRowIndex from './HistoryRowIndex';
import { formatDuration, formatExitReason } from './historyLabels';

type WinFilter = '' | 'true' | 'false';
type ExitFilter = '' | 'TP' | 'SL' | 'SIGNAL';

/** 청산 완료 거래(진입→청산 1 라운드트립) */
const TradeHistoryTable: React.FC = () => {
  const query = useHistoryQueryParams();
  const { correlationId, openTick, closeTick } = useTickModal();
  const [isWin, setIsWin] = useState<WinFilter>('');
  const [exitReason, setExitReason] = useState<ExitFilter>('');

  const resetKey = useMemo(
    () => JSON.stringify({ ...query, isWin, exitReason }),
    [query, isWin, exitReason]
  );

  const { pageItems, page, hasPrev, hasNext, goPrev, goNext, totalCount, loading, error } =
    useHistoryPage(
      ({ limit, offset }) =>
        tradingHistoryService.getTrades({
          ...query,
          limit,
          offset,
          is_win: isWin === '' ? undefined : isWin === 'true',
          exit_reason: exitReason || undefined,
        }),
      resetKey
    );

  const isEmpty = !loading && !error && pageItems.length === 0;

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <div className="flex-shrink-0 flex flex-wrap items-center gap-3 px-3 py-2.5 border-b border-[#2b3139] text-xs">
        <div className="inline-flex items-center gap-2 rounded-md border border-[#2b3139] bg-[#1e2329]/70 px-2.5 py-1.5">
          <span className="text-[#b7bdc6] font-medium whitespace-nowrap pr-1.5 border-r border-[#3a4149]">
            승패
          </span>
          <div className="flex items-center gap-1">
            {(
              [
                { key: '', label: '전체' },
                { key: 'true', label: '승' },
                { key: 'false', label: '패' },
              ] as const
            ).map((o) => (
              <button
                key={o.key || 'all'}
                type="button"
                onClick={() => setIsWin(o.key)}
                className={`px-2.5 py-1 rounded ${
                  isWin === o.key
                    ? o.key === 'true'
                      ? 'bg-[#0ecb8133] text-[#0ecb81]'
                      : o.key === 'false'
                        ? 'bg-[#f6465d33] text-[#f6465d]'
                        : 'bg-[#2b3139] text-[#eaecef]'
                    : 'text-[#848e9c] hover:text-[#eaecef] hover:bg-[#2b3139]/60'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div className="hidden sm:block w-px self-stretch min-h-[28px] bg-[#3a4149]" />

        <div className="inline-flex items-center gap-2 rounded-md border border-[#2b3139] bg-[#1e2329]/70 px-2.5 py-1.5">
          <span className="text-[#b7bdc6] font-medium whitespace-nowrap pr-1.5 border-r border-[#3a4149]">
            청산 사유
          </span>
          <div className="flex items-center gap-1">
            {(
              [
                { key: '', label: '전체' },
                { key: 'TP', label: 'TP' },
                { key: 'SL', label: 'SL' },
                { key: 'SIGNAL', label: '시그널' },
              ] as const
            ).map((o) => (
              <button
                key={o.key || 'all'}
                type="button"
                onClick={() => setExitReason(o.key)}
                className={`px-2.5 py-1 rounded ${
                  exitReason === o.key
                    ? 'bg-[#2b3139] text-[#eaecef]'
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
          <HistoryEmptyState message="청산 거래 내역이 없습니다" />
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
                  <th className="px-3 py-2 font-medium">진입가</th>
                  <th className="px-3 py-2 font-medium">청산가</th>
                  <th className="px-3 py-2 font-medium">수량</th>
                  <th className="px-3 py-2 font-medium">명목</th>
                  <th className="px-3 py-2 font-medium">실현 손익</th>
                  <th className="px-3 py-2 font-medium">수익률</th>
                  <th className="px-3 py-2 font-medium">승패</th>
                  <th className="px-3 py-2 font-medium">청산 사유</th>
                  <th className="px-3 py-2 font-medium">전략</th>
                  <th className="px-3 py-2 font-medium">보유 시간</th>
                  <th className="px-3 py-2 font-medium whitespace-nowrap">청산 시각</th>
                </tr>
              </thead>
              <tbody className="text-[#eaecef]">
                {pageItems.map((t, i) => {
                  const isLong = t.side === 'LONG';
                  return (
                    <tr
                      key={t.trade_id}
                      onClick={() => openTick(t.correlation_id)}
                      className={`border-b border-[#2b3139]/50 hover:bg-[#1e2329]/50 ${
                        t.correlation_id ? 'cursor-pointer' : ''
                      }`}
                    >
                      <td className="px-2 py-2 text-center">
                        <HistoryRowIndex page={page} index={i} />
                      </td>
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
                      <td className="px-3 py-2 text-[#848e9c]">
                        {t.entry_notional_usdt != null
                          ? t.entry_notional_usdt.toLocaleString()
                          : '-'}
                      </td>
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
                        {formatExitReason(t.exit_reason)}
                      </td>
                      <td className="px-3 py-2 text-[#848e9c] truncate max-w-[100px]">
                        {t.strategy_id ?? '-'}
                      </td>
                      <td className="px-3 py-2 text-[#848e9c]">
                        {formatDuration(t.holding_seconds ?? t.hold_seconds)}
                      </td>
                      <td className="px-3 py-2 text-[#848e9c] whitespace-nowrap">
                        {new Date(t.closed_at).toLocaleString()}
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
        {correlationId && (
          <TickDetailModal correlationId={correlationId} onClose={closeTick} />
        )}
      </HistoryPanelFrame>
    </div>
  );
};

export default TradeHistoryTable;
