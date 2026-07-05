import React from 'react';
import { useSymbolStore, useSymbolMeta } from '@/store/trading/symbolStore';
import SymbolSelect from '@/components/trade/SymbolSelect';

const SymbolHeader: React.FC = () => {
  const { selectedSymbol, setSelectedSymbol } = useSymbolStore();
  const meta = useSymbolMeta();
  const isPositive = meta && meta.priceChange >= 0;

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2 flex-wrap h-full min-h-[52px]">
      <div className="flex items-center gap-2">
        <SymbolSelect selectedSymbol={selectedSymbol} onSelect={setSelectedSymbol} />
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
