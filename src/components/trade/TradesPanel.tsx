import React from 'react';
import { useSymbolStore } from '@/store/trading/symbolStore';

const TradesPanel: React.FC = () => {
  const selectedSymbol = useSymbolStore((s) => s.selectedSymbol);
  const trades = [
    { price: 71761.0, amount: 0.12, time: '14:32:01', side: 'buy' as const },
    { price: 71760.5, amount: 0.05, time: '14:32:00', side: 'sell' as const },
    { price: 71762.0, amount: 0.28, time: '14:31:59', side: 'buy' as const },
  ];

  return (
    <div
      className="flex-shrink-0 flex flex-col border-b border-[#2b3139] bg-[#0b0e11] overflow-hidden"
      style={{ minHeight: '160px' }}
    >
      <div className="flex-shrink-0 flex gap-2 px-3 py-2 border-b border-[#2b3139]">
        <button
          type="button"
          className="text-sm font-medium text-[#eaecef] border-b-2 border-[#f0b90b] pb-1"
        >
          Trades · {selectedSymbol}
        </button>
        <button
          type="button"
          className="text-sm text-[#848e9c] hover:text-[#eaecef]"
        >
          Top Movers
        </button>
      </div>
      <div className="flex-shrink-0 grid grid-cols-3 gap-2 px-3 py-1.5 text-xs text-[#848e9c]">
        <span>Price (USDT)</span>
        <span className="text-right">Amount</span>
        <span className="text-right">Time</span>
      </div>
      <div
        className="flex-1 min-h-0 overflow-y-auto custom-scroll"
        style={{ minHeight: '80px' }}
      >
        {trades.map((t, i) => (
          <div
            key={i}
            className="grid grid-cols-3 gap-2 px-3 py-1 text-xs"
          >
            <span className={t.side === 'buy' ? 'text-[#0ecb81]' : 'text-[#f6465d]'}>
              {t.price.toLocaleString()}
            </span>
            <span className="text-right text-[#eaecef]">{t.amount}</span>
            <span className="text-right text-[#848e9c]">{t.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TradesPanel;
