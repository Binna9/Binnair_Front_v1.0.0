import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import { SYMBOL_LIST } from '@/store/trading/symbolStore';
import { useFuturesMarketStore } from '@/store/trading/futuresMarketStore';

interface SymbolSelectProps {
  selectedSymbol: string;
  onSelect: (symbol: string) => void;
}

/** Binance 스타일 심볼 선택 드롭다운. 티커·한글명·실시간 등락률·검색을 함께 지원한다. */
const SymbolSelect: React.FC<SymbolSelectProps> = ({ selectedSymbol, onSelect }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const tickers = useFuturesMarketStore((s) => s.tickers);
  const selected = SYMBOL_LIST.find((s) => s.symbol === selectedSymbol);

  const filteredList = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SYMBOL_LIST;
    return SYMBOL_LIST.filter(
      (s) =>
        s.symbol.toLowerCase().includes(q) ||
        s.base.toLowerCase().includes(q) ||
        s.quote.toLowerCase().includes(q) ||
        s.nameKo.toLowerCase().includes(q) ||
        s.nameKo.includes(query.trim())
    );
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery('');
      // 드롭다운 오픈 애니메이션 이후 포커스가 걸리도록 다음 tick에 실행
      const id = window.setTimeout(() => inputRef.current?.focus(), 0);
      return () => window.clearTimeout(id);
    }
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-md border bg-[#1e2329] transition-colors ${
          open ? 'border-[#f0b90b]' : 'border-[#2b3139] hover:border-[#474d57]'
        }`}
      >
        <span className="font-semibold text-sm text-[#eaecef]">
          {selected ? `${selected.base}/${selected.quote}` : selectedSymbol}
        </span>
        {selected && (
          <span className="text-xs text-[#848e9c]">{selected.nameKo}</span>
        )}
        <ChevronDown
          size={14}
          className={`text-[#848e9c] transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-72 bg-[#1e2329] border border-[#2b3139] rounded-lg shadow-xl z-[100] py-1.5 max-h-96 flex flex-col">
          <div className="px-2.5 pb-1.5 flex-shrink-0">
            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-[#0b0e11] border border-[#2b3139] focus-within:border-[#f0b90b]">
              <Search size={14} className="text-[#848e9c] shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="심볼 또는 코인명 검색 (예: XRP, 리플)"
                className="w-full bg-transparent text-sm text-[#eaecef] placeholder:text-[#5e6673] focus:outline-none"
              />
            </div>
          </div>
          <div className="px-3 py-1.5 text-[11px] text-[#848e9c] border-y border-[#2b3139] flex-shrink-0">
            무기한 선물 (USDT-M)
          </div>
          <div className="overflow-y-auto custom-scroll">
          {filteredList.length === 0 && (
            <div className="px-3 py-6 text-center text-xs text-[#848e9c]">
              검색 결과가 없습니다
            </div>
          )}
          {filteredList.map((s) => {
            const ticker = tickers[s.symbol];
            const isSelected = s.symbol === selectedSymbol;
            const isPositive = ticker ? ticker.priceChangePercent >= 0 : true;

            return (
              <button
                key={s.symbol}
                type="button"
                onClick={() => {
                  onSelect(s.symbol);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors ${
                  isSelected ? 'bg-[#2b3139]' : 'hover:bg-[#2b3139]/60'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {isSelected && <Check size={14} className="text-[#f0b90b] shrink-0" />}
                  <div className={`flex flex-col min-w-0 ${isSelected ? '' : 'pl-[22px]'}`}>
                    <span className="text-sm font-medium text-[#eaecef] truncate">
                      {s.base}
                      <span className="text-[#848e9c]">/{s.quote}</span>
                    </span>
                    <span className="text-[11px] text-[#848e9c]">{s.nameKo}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className="text-sm text-[#eaecef]">
                    {ticker ? ticker.lastPrice.toLocaleString() : '—'}
                  </span>
                  {ticker && (
                    <span
                      className={`text-[11px] ${
                        isPositive ? 'text-[#0ecb81]' : 'text-[#f6465d]'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {ticker.priceChangePercent.toFixed(2)}%
                    </span>
                  )}
                </div>
              </button>
            );
          })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SymbolSelect;
