import React from 'react';
import { Search } from 'lucide-react';
import { DatePreset, useHistoryFilter } from '@/context/HistoryFilterContext';

const PRESETS: { key: DatePreset; label: string }[] = [
  { key: 'today', label: '오늘' },
  { key: '7d', label: '7일' },
  { key: '30d', label: '30일' },
  { key: 'all', label: '전체' },
];

const HistoryDateFilterBar: React.FC = () => {
  const {
    symbol,
    setSymbol,
    fromDate,
    toDate,
    setFromDate,
    setToDate,
    preset,
    setPreset,
    applySearch,
    runId,
    engineLoading,
  } = useHistoryFilter();

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      applySearch();
    }
  };

  return (
    <div
      className="flex-shrink-0 flex flex-wrap items-center gap-2.5 px-4 py-3 border-b border-[#2b3139] text-sm"
      onKeyDown={onKeyDown}
    >
      <div className="flex items-center gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setPreset(p.key)}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              preset === p.key
                ? 'bg-[#2b3139] text-[#eaecef]'
                : 'text-[#848e9c] hover:text-[#eaecef] hover:bg-[#1e2329]'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 text-[#848e9c]">
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="bg-[#1e2329] border border-[#2b3139] rounded-md px-2.5 py-1.5 text-sm text-[#eaecef] outline-none focus:border-[#848e9c]"
        />
        <span className="text-sm">~</span>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="bg-[#1e2329] border border-[#2b3139] rounded-md px-2.5 py-1.5 text-sm text-[#eaecef] outline-none focus:border-[#848e9c]"
        />
      </div>

      <input
        type="text"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
        placeholder="심볼 (예: XRPUSDT)"
        className="w-40 bg-[#1e2329] border border-[#2b3139] rounded-md px-2.5 py-1.5 text-sm text-[#eaecef] placeholder:text-[#848e9c] outline-none focus:border-[#848e9c]"
      />

      <button
        type="button"
        onClick={applySearch}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#f0b90b] text-[#0b0e11] text-sm font-semibold transition-all duration-200 ease-out hover:bg-[#f8d12f] hover:scale-105 hover:shadow-[0_4px_14px_rgba(240,185,11,0.35)] active:scale-100"
      >
        <Search size={15} strokeWidth={2.5} />
        검색
      </button>

      <span className="ml-auto text-xs text-[#848e9c] truncate max-w-[220px]">
        {engineLoading && !runId
          ? 'run 조회 중...'
          : runId
            ? `run: ${runId}`
            : 'run 없음'}
      </span>
    </div>
  );
};

export default HistoryDateFilterBar;
