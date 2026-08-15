import React, { useEffect, useRef, useState } from 'react';
import { Search, RotateCcw, CalendarDays } from 'lucide-react';
import { DatePreset, useHistoryFilter } from '@/context/HistoryFilterContext';
import HistoryRunSelect from '@/components/trade/history/HistoryRunSelect';

const PRESETS: { key: DatePreset; label: string }[] = [
  { key: 'today', label: '오늘' },
  { key: '7d', label: '7일' },
  { key: '30d', label: '30일' },
  { key: 'all', label: '전체' },
];

function splitYmd(value: string): { y: string; m: string; d: string } {
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return { y: m[1], m: m[2], d: m[3] };
  return { y: '', m: '', d: '' };
}

function clampMonth(raw: string): string {
  if (raw.length < 2) return raw;
  const n = Math.min(12, Math.max(1, Number(raw)));
  return String(n).padStart(2, '0');
}

function clampDay(year: string, month: string, raw: string): string {
  if (raw.length < 2) return raw;
  const y = Number(year) || 2000;
  const m = Number(month) || 1;
  const max = new Date(y, m, 0).getDate();
  const n = Math.min(max, Math.max(1, Number(raw)));
  return String(n).padStart(2, '0');
}

const segClass =
  'bg-transparent text-center text-sm text-[#eaecef] tabular-nums outline-none placeholder:text-[#5e6673]';

/** YYYY · MM · DD 칸 분리 입력 — Tab/자동이동, 캘린더 겸용 */
const DateField: React.FC<{
  value: string;
  onChange: (v: string) => void;
  ariaLabel: string;
}> = ({ value, onChange, ariaLabel }) => {
  const pickerRef = useRef<HTMLInputElement>(null);
  const yRef = useRef<HTMLInputElement>(null);
  const mRef = useRef<HTMLInputElement>(null);
  const dRef = useRef<HTMLInputElement>(null);

  const parts = splitYmd(value);
  const [y, setY] = useState(parts.y);
  const [m, setM] = useState(parts.m);
  const [d, setD] = useState(parts.d);

  // 외부(프리셋/캘린더/초기화)에서 value가 바뀌면 칸 동기화
  useEffect(() => {
    const next = splitYmd(value);
    setY(next.y);
    setM(next.m);
    setD(next.d);
  }, [value]);

  const emitIfComplete = (ny: string, nm: string, nd: string) => {
    if (!ny && !nm && !nd) {
      onChange('');
      return;
    }
    if (ny.length === 4 && nm.length === 2 && nd.length === 2) {
      const mm = clampMonth(nm);
      const dd = clampDay(ny, mm, nd);
      onChange(`${ny}-${mm}-${dd}`);
    }
  };

  const openPicker = () => {
    const el = pickerRef.current;
    if (!el) return;
    try {
      el.showPicker?.();
    } catch {
      el.click();
    }
  };

  const onYear = (raw: string) => {
    const v = raw.replace(/\D/g, '').slice(0, 4);
    setY(v);
    if (v.length === 4) {
      mRef.current?.focus();
      mRef.current?.select();
    }
    emitIfComplete(v, m, d);
  };

  const onMonth = (raw: string) => {
    const v = raw.replace(/\D/g, '').slice(0, 2);
    setM(v);
    if (v.length === 2) {
      const clamped = clampMonth(v);
      setM(clamped);
      dRef.current?.focus();
      dRef.current?.select();
      emitIfComplete(y, clamped, d);
      return;
    }
    emitIfComplete(y, v, d);
  };

  const onDay = (raw: string) => {
    const v = raw.replace(/\D/g, '').slice(0, 2);
    setD(v);
    if (v.length === 2) {
      const clamped = clampDay(y, m.length === 2 ? clampMonth(m) : m, v);
      setD(clamped);
      emitIfComplete(y, m.length === 2 ? clampMonth(m) : m, clamped);
      return;
    }
    emitIfComplete(y, m, v);
  };

  const onSegKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    which: 'y' | 'm' | 'd'
  ) => {
    if (e.key === 'Enter') return; // 상위에서 검색
    if (e.key === 'Backspace') {
      const el = e.currentTarget;
      if (el.value === '' || (el.selectionStart === 0 && el.selectionEnd === 0)) {
        e.preventDefault();
        if (which === 'd') {
          mRef.current?.focus();
          mRef.current?.select();
        } else if (which === 'm') {
          yRef.current?.focus();
          yRef.current?.select();
        }
      }
    }
  };

  const pickerValue = /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : '';

  return (
    <div
      className="inline-flex items-center gap-0.5 bg-[#1e2329] border border-[#2b3139] rounded-md px-1.5 py-1 focus-within:border-[#848e9c]"
      aria-label={ariaLabel}
    >
      <input
        ref={yRef}
        type="text"
        inputMode="numeric"
        aria-label={`${ariaLabel} 연`}
        placeholder="YYYY"
        value={y}
        onChange={(e) => onYear(e.target.value)}
        onKeyDown={(e) => onSegKeyDown(e, 'y')}
        onFocus={(e) => e.currentTarget.select()}
        className={`${segClass} w-[3.2rem]`}
        maxLength={4}
      />
      <span className="text-[#5e6673] text-xs select-none">-</span>
      <input
        ref={mRef}
        type="text"
        inputMode="numeric"
        aria-label={`${ariaLabel} 월`}
        placeholder="MM"
        value={m}
        onChange={(e) => onMonth(e.target.value)}
        onKeyDown={(e) => onSegKeyDown(e, 'm')}
        onFocus={(e) => e.currentTarget.select()}
        className={`${segClass} w-[1.7rem]`}
        maxLength={2}
      />
      <span className="text-[#5e6673] text-xs select-none">-</span>
      <input
        ref={dRef}
        type="text"
        inputMode="numeric"
        aria-label={`${ariaLabel} 일`}
        placeholder="DD"
        value={d}
        onChange={(e) => onDay(e.target.value)}
        onKeyDown={(e) => onSegKeyDown(e, 'd')}
        onFocus={(e) => e.currentTarget.select()}
        className={`${segClass} w-[1.7rem]`}
        maxLength={2}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label={`${ariaLabel} 캘린더`}
        onClick={openPicker}
        className="ml-0.5 p-0.5 rounded text-[#848e9c] hover:text-[#eaecef]"
      >
        <CalendarDays size={14} />
      </button>
      <input
        ref={pickerRef}
        type="date"
        value={pickerValue}
        onChange={(e) => onChange(e.target.value)}
        className="pointer-events-none absolute opacity-0 w-0 h-0 overflow-hidden"
        tabIndex={-1}
        aria-hidden
      />
    </div>
  );
};

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
    resetFilters,
  } = useHistoryFilter();

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      applySearch();
    }
  };

  return (
    <div
      className="flex-shrink-0 border-b border-[#2b3139] px-4 py-3 text-sm"
      onKeyDown={onKeyDown}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
        <HistoryRunSelect className="lg:max-w-[26rem] lg:shrink-0" />

        <div
          className="hidden w-px shrink-0 self-stretch bg-[#2b3139] lg:block"
          aria-hidden
        />

        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2.5 rounded-lg border border-[#2b3139]/bg-[#0b0e11]/40 px-3 py-2">
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
            <DateField value={fromDate} onChange={setFromDate} ariaLabel="시작일" />
            <span className="text-sm">~</span>
            <DateField value={toDate} onChange={setToDate} ariaLabel="종료일" />
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

          <button
            type="button"
            onClick={resetFilters}
            title="활성 run + 7일 기본값으로 초기화"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md border border-[#3a4149] bg-[#1e2329] text-[#eaecef] text-sm font-medium transition-all duration-200 ease-out hover:border-[#848e9c] hover:bg-[#2b3139] hover:scale-105 active:scale-100"
          >
            <RotateCcw size={15} strokeWidth={2.25} />
            초기화
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryDateFilterBar;
