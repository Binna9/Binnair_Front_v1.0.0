import React from 'react';
import { useSymbolStore, useSymbolMeta } from '@/store/trading/symbolStore';

const OrderBookPanel: React.FC = () => {
  const selectedSymbol = useSymbolStore((s) => s.selectedSymbol);
  const meta = useSymbolMeta();
  const midPrice = meta?.lastPrice ?? 71760.9;

  const asks = [
    { price: 71765.5, size: 1.234, sum: 88.5 },
    { price: 71764.0, size: 0.892, sum: 64.2 },
    { price: 71762.5, size: 2.1, sum: 150.7 },
  ];
  const bids = [
    { price: 71760.0, size: 0.5, sum: 35.8 },
    { price: 71758.5, size: 1.2, sum: 86.1 },
    { price: 71757.0, size: 0.8, sum: 57.4 },
  ];

  return (
    <div
      className="flex-shrink-0 flex flex-col border-b border-[#2b3139] bg-[#0b0e11] overflow-hidden"
      style={{ minHeight: '180px' }}
    >
      <div className="flex-shrink-0 grid grid-cols-3 gap-2 px-3 py-2 text-xs text-[#848e9c] border-b border-[#2b3139]">
        <span>Price (USDT)</span>
        <span className="text-right">Size (USDT)</span>
        <span className="text-right">Sum (USDT)</span>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scroll">
        <div className="space-y-0.5 px-3 py-1">
          {asks.slice().reverse().map((row, i) => (
            <div
              key={`a-${i}`}
              className="grid grid-cols-3 gap-2 text-xs text-[#f6465d]"
            >
              <span>{row.price.toLocaleString()}</span>
              <span className="text-right text-[#eaecef]">{row.size}</span>
              <span className="text-right text-[#848e9c]">{row.sum}</span>
            </div>
          ))}
        </div>
        <div className="px-3 py-1 text-center text-sm font-semibold text-[#eaecef] border-y border-[#2b3139]">
          {midPrice.toLocaleString()}
        </div>
        <div className="space-y-0.5 px-3 py-1">
          {bids.map((row, i) => (
            <div
              key={`b-${i}`}
              className="grid grid-cols-3 gap-2 text-xs text-[#0ecb81]"
            >
              <span>{row.price.toLocaleString()}</span>
              <span className="text-right text-[#eaecef]">{row.size}</span>
              <span className="text-right text-[#848e9c]">{row.sum}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderBookPanel;
