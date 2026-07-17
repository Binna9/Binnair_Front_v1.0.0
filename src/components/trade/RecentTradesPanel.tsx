import React from 'react';
import { useSymbolStore } from '@/store/trading/symbolStore';
import {
  RecentTrade,
  useFuturesMarketStore,
} from '@/store/trading/futuresMarketStore';

const EMPTY_TRADES: RecentTrade[] = [];
const VISIBLE_TRADES = 10;

function formatTime(ms: number) {
  const d = new Date(ms);
  return d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

/** 오더북 아래 — 호가 공간 확보를 위해 세로 비중을 낮춤 */
const RecentTradesPanel: React.FC = () => {
  const selectedSymbol = useSymbolStore((s) => s.selectedSymbol);
  const rows = useFuturesMarketStore(
    (s) => s.recentTrades[selectedSymbol] ?? EMPTY_TRADES
  );
  const visible = rows.slice(0, VISIBLE_TRADES);

  return (
    <div className="flex-[0.7] min-h-0 max-h-[32%] flex flex-col bg-[#0b0e11] overflow-hidden">
      <div className="flex-shrink-0 px-2.5 py-1 text-[11px] font-medium text-[#eaecef] border-b border-[#2b3139]">
        최근 체결
      </div>
      <div className="flex-shrink-0 grid grid-cols-3 gap-1 px-2.5 py-0.5 text-[11px] text-[#848e9c] border-b border-[#2b3139]">
        <span>Price</span>
        <span className="text-right">Qty</span>
        <span className="text-right">Time</span>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scroll">
        {visible.length === 0 ? (
          <div className="px-2.5 py-2 text-center text-[11px] text-[#848e9c]">
            체결 수신 중...
          </div>
        ) : (
          <div className="px-2.5 py-0.5">
            {visible.map((t) => {
              const buy = !t.isBuyerMaker;
              return (
                <div
                  key={t.id}
                  className="grid grid-cols-3 gap-1 text-[11px] leading-[17px] tabular-nums"
                >
                  <span className={buy ? 'text-[#0ecb81]' : 'text-[#f6465d]'}>
                    {t.price.toLocaleString()}
                  </span>
                  <span className="text-right text-[#eaecef]">
                    {t.qty.toLocaleString(undefined, {
                      maximumFractionDigits: 4,
                    })}
                  </span>
                  <span className="text-right text-[#848e9c]">
                    {formatTime(t.time)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentTradesPanel;
