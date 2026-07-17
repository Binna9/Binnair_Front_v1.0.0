import React from 'react';
import { useSymbolStore } from '@/store/trading/symbolStore';
import { useFuturesMarketStore } from '@/store/trading/futuresMarketStore';

const DISPLAY_LEVELS = 8;

const OrderBookPanel: React.FC = () => {
  const selectedSymbol = useSymbolStore((s) => s.selectedSymbol);
  const orderBook = useFuturesMarketStore((s) => s.orderBooks[selectedSymbol]);
  const lastPrice = useFuturesMarketStore(
    (s) => s.tickers[selectedSymbol]?.lastPrice
  );

  const asks = (orderBook?.asks ?? []).slice(-DISPLAY_LEVELS);
  const bids = (orderBook?.bids ?? []).slice(0, DISPLAY_LEVELS);

  return (
    <div className="flex-[2] min-h-0 flex flex-col bg-[#0b0e11] overflow-hidden border-b border-[#2b3139]">
      <div className="flex-shrink-0 px-2.5 py-1.5 text-xs font-medium text-[#eaecef] border-b border-[#2b3139]">
        호가
      </div>
      <div className="flex-shrink-0 grid grid-cols-3 gap-1 px-2.5 py-1 text-xs text-[#848e9c] border-b border-[#2b3139]">
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Sum</span>
      </div>

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* 매도 8단 — 행 높이 균등 분배라 겹치지 않음 */}
        <div className="flex-1 min-h-0 grid grid-rows-8 px-2.5 content-stretch">
          {asks.map((row, i) => (
            <div
              key={`a-${i}`}
              className="grid grid-cols-3 gap-1 items-center text-xs text-[#f6465d] tabular-nums overflow-hidden"
            >
              <span className="truncate">{row.price.toLocaleString()}</span>
              <span className="text-right truncate text-[#eaecef]">{row.size}</span>
              <span className="text-right truncate text-[#848e9c]">
                {row.sum.toFixed(3)}
              </span>
            </div>
          ))}
        </div>

        <div className="flex-shrink-0 px-2.5 py-1 text-center text-sm font-semibold text-[#eaecef] border-y border-[#2b3139] tabular-nums">
          {lastPrice != null ? lastPrice.toLocaleString() : '—'}
        </div>

        {/* 매수 8단 */}
        <div className="flex-1 min-h-0 grid grid-rows-8 px-2.5 content-stretch">
          {bids.map((row, i) => (
            <div
              key={`b-${i}`}
              className="grid grid-cols-3 gap-1 items-center text-xs text-[#0ecb81] tabular-nums overflow-hidden"
            >
              <span className="truncate">{row.price.toLocaleString()}</span>
              <span className="text-right truncate text-[#eaecef]">{row.size}</span>
              <span className="text-right truncate text-[#848e9c]">
                {row.sum.toFixed(3)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderBookPanel;
