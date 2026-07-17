import React from 'react';
import { useSymbolStore, useSymbolMeta } from '@/store/trading/symbolStore';
import SymbolSelect from '@/components/trade/SymbolSelect';

function MetaStat({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
      <span className="text-[#b7bdc6]">{label}</span>
      <span className="text-[#eaecef] font-medium tabular-nums">{value}</span>
    </span>
  );
}

const SymbolHeader: React.FC = () => {
  const { selectedSymbol, setSelectedSymbol } = useSymbolStore();
  const meta = useSymbolMeta();
  const isPositive = meta && meta.priceChange >= 0;

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2 flex-wrap h-full min-h-[52px]">
      <div className="flex items-center gap-2">
        <SymbolSelect selectedSymbol={selectedSymbol} onSelect={setSelectedSymbol} />
        <span className="text-xs text-[#eaecef]">무기한</span>
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
          <div className="flex items-center gap-4 text-xs sm:text-sm">
            <MetaStat label="Mark Price" value={meta.markPrice.toLocaleString()} />
            <MetaStat label="Index Price" value={meta.indexPrice.toLocaleString()} />
            <MetaStat
              label="Funding Rate"
              value={`${(meta.fundingRate * 100).toFixed(4)}%`}
            />
            <MetaStat label="24h High" value={meta.high24h.toLocaleString()} />
            <MetaStat label="24h Low" value={meta.low24h.toLocaleString()} />
            <MetaStat
              label="24h Vol"
              value={`${meta.volume24h.toLocaleString()} ${meta.base}`}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SymbolHeader;
