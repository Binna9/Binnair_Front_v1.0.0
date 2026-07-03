import React from 'react';
import { useSymbolStore } from '@/store/trading/symbolStore';
import { useFuturesMarketStore } from '@/store/trading/futuresMarketStore';

const OrderBookPanel: React.FC = () => {
  const selectedSymbol = useSymbolStore((s) => s.selectedSymbol);
  const orderBook = useFuturesMarketStore((s) => s.orderBooks[selectedSymbol]);
  const lastPrice = useFuturesMarketStore(
    (s) => s.tickers[selectedSymbol]?.lastPrice
  );

  const asks = orderBook?.asks ?? [];
  const bids = orderBook?.bids ?? [];

  return (
    <div
      className="flex-shrink-0 flex flex-col border-b border-[#2b3139] bg-[#0b0e11] overflow-hidden"
      style={{ minHeight: '180px' }}
    >
      <div className="flex-shrink-0 grid grid-cols-3 gap-2 px-3 py-2 text-xs text-[#848e9c] border-b border-[#2b3139]">
        <span>Price (USDT)</span>
        <span className="text-right">Size</span>
        <span className="text-right">Sum</span>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scroll">
        <div className="space-y-0.5 px-3 py-1">
          {asks.map((row, i) => (
            <div
              key={`a-${i}`}
              className="grid grid-cols-3 gap-2 text-xs text-[#f6465d]"
            >
              <span>{row.price.toLocaleString()}</span>
              <span className="text-right text-[#eaecef]">{row.size}</span>
              <span className="text-right text-[#848e9c]">
                {row.sum.toFixed(3)}
              </span>
            </div>
          ))}
        </div>
        <div className="px-3 py-1 text-center text-sm font-semibold text-[#eaecef] border-y border-[#2b3139]">
          {lastPrice != null ? lastPrice.toLocaleString() : '—'}
        </div>
        <div className="space-y-0.5 px-3 py-1">
          {bids.map((row, i) => (
            <div
              key={`b-${i}`}
              className="grid grid-cols-3 gap-2 text-xs text-[#0ecb81]"
            >
              <span>{row.price.toLocaleString()}</span>
              <span className="text-right text-[#eaecef]">{row.size}</span>
              <span className="text-right text-[#848e9c]">
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
