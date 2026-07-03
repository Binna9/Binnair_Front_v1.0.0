import React from 'react';
import {
  useSymbolStore,
  useSymbolMeta,
  SYMBOL_LIST,
} from '@/store/trading/symbolStore';

const SymbolHeader: React.FC = () => {
  const { selectedSymbol, setSelectedSymbol } = useSymbolStore();
  const meta = useSymbolMeta();
  const isPositive = meta && meta.priceChange >= 0;

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2 flex-wrap h-full min-h-[52px]">
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#848e9c] whitespace-nowrap">심볼</span>
        <select
          value={selectedSymbol}
          onChange={(e) => setSelectedSymbol(e.target.value)}
          title="거래 심볼 선택"
          className="font-semibold text-[#eaecef] bg-[#1e2329] border border-[#2b3139] rounded-md px-3 py-1.5 cursor-pointer min-w-[140px] hover:border-[#848e9c] focus:border-[#f0b90b] focus:outline-none focus:ring-1 focus:ring-[#f0b90b]"
        >
          {SYMBOL_LIST.map((s) => (
            <option key={s.symbol} value={s.symbol}>
              {s.symbol}
            </option>
          ))}
        </select>
        <span className="text-xs text-[#848e9c]">Perp</span>
      </div>
      {meta && (
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-baseline gap-2">
            <span
              className={`text-xl font-semibold ${
                isPositive ? 'text-[#0ecb81]' : 'text-[#f6465d]'
              }`}
            >
              {meta.lastPrice.toLocaleString()}
            </span>
            <span className={isPositive ? 'text-[#0ecb81]' : 'text-[#f6465d]'}>
              {isPositive ? '+' : ''}
              {meta.priceChange.toLocaleString()}
            </span>
            <span className={isPositive ? 'text-[#0ecb81]' : 'text-[#f6465d]'}>
              {isPositive ? '+' : ''}
              {meta.priceChangePercent.toFixed(2)}%
            </span>
          </div>
          <div className="flex items-center gap-4 text-[#848e9c]">
            <span>Mark Price {meta.markPrice.toLocaleString()}</span>
            <span>Index Price {meta.indexPrice.toLocaleString()}</span>
            <span>Funding Rate {(meta.fundingRate * 100).toFixed(4)}%</span>
            <span>24h High {meta.high24h.toLocaleString()}</span>
            <span>24h Low {meta.low24h.toLocaleString()}</span>
            <span>24h Vol {meta.volume24h.toLocaleString()} {meta.base}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SymbolHeader;
