import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { useEngineRun } from '@/hooks/trading/useEngineRun';
import {
  dateToFromAt,
  dateToToAt,
  daysAgoDateInput,
  todayDateInput,
} from '@/utils/historyDateUtils';

export type DatePreset = 'today' | '7d' | '30d' | 'all' | 'custom';

export interface HistoryFilterState {
  runId: string | undefined;
  /** 입력 중인(미적용) 값 */
  symbol: string;
  fromDate: string;
  toDate: string;
  preset: DatePreset;
  /** API에 실제로 쓰이는 적용된 값 */
  fromAt: string | undefined;
  toAt: string | undefined;
  setSymbol: (v: string) => void;
  setPreset: (p: DatePreset) => void;
  setFromDate: (v: string) => void;
  setToDate: (v: string) => void;
  setDateRange: (from: string, to: string) => void;
  /** 검색 버튼 / Enter — draft → applied 반영 후 API 재조회 */
  applySearch: () => void;
  queryParams: {
    run_id?: string;
    symbol?: string;
    from_at?: string;
    to_at?: string;
  };
  engineLoading: boolean;
}

const HistoryFilterContext = createContext<HistoryFilterState | null>(null);

function applyPreset(preset: DatePreset): { from: string; to: string } {
  const to = todayDateInput();
  switch (preset) {
    case 'today':
      return { from: to, to };
    case '7d':
      return { from: daysAgoDateInput(6), to };
    case '30d':
      return { from: daysAgoDateInput(29), to };
    case 'all':
      return { from: '', to: '' };
    default:
      return { from: daysAgoDateInput(6), to };
  }
}

interface HistoryFilterProviderProps {
  children: React.ReactNode;
  /** false면 날짜 필터 없이 run_id만 (트레이드 하단 탭용) */
  enableDateFilter?: boolean;
}

export const HistoryFilterProvider: React.FC<HistoryFilterProviderProps> = ({
  children,
  enableDateFilter = true,
}) => {
  const { run, loading: engineLoading } = useEngineRun();
  const initial = enableDateFilter ? applyPreset('7d') : { from: '', to: '' };
  const initialPreset: DatePreset = enableDateFilter ? '7d' : 'all';

  // draft (UI)
  const [preset, setPresetState] = useState<DatePreset>(initialPreset);
  const [fromDate, setFromDateState] = useState(initial.from);
  const [toDate, setToDateState] = useState(initial.to);
  const [symbol, setSymbol] = useState('');

  // applied (API) — 초기값은 draft와 동일하게 한 번 적용
  const [appliedFromDate, setAppliedFromDate] = useState(initial.from);
  const [appliedToDate, setAppliedToDate] = useState(initial.to);
  const [appliedSymbol, setAppliedSymbol] = useState('');

  const setPreset = useCallback((p: DatePreset) => {
    setPresetState(p);
    if (p !== 'custom') {
      const range = applyPreset(p);
      setFromDateState(range.from);
      setToDateState(range.to);
    }
  }, []);

  const setFromDate = useCallback((v: string) => {
    setPresetState('custom');
    setFromDateState(v);
  }, []);

  const setToDate = useCallback((v: string) => {
    setPresetState('custom');
    setToDateState(v);
  }, []);

  const setDateRange = useCallback((from: string, to: string) => {
    setPresetState('custom');
    setFromDateState(from);
    setToDateState(to);
  }, []);

  const applySearch = useCallback(() => {
    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
    setAppliedSymbol(symbol);
  }, [fromDate, toDate, symbol]);

  const fromAt = enableDateFilter
    ? dateToFromAt(appliedFromDate || undefined)
    : undefined;
  const toAt = enableDateFilter ? dateToToAt(appliedToDate || undefined) : undefined;
  const runId = run?.run_id;

  const queryParams = useMemo(
    () => ({
      run_id: runId,
      symbol: appliedSymbol.trim() || undefined,
      from_at: fromAt,
      to_at: toAt,
    }),
    [runId, appliedSymbol, fromAt, toAt]
  );

  const value = useMemo<HistoryFilterState>(
    () => ({
      runId,
      symbol,
      fromDate,
      toDate,
      preset,
      fromAt,
      toAt,
      setSymbol,
      setPreset,
      setFromDate,
      setToDate,
      setDateRange,
      applySearch,
      queryParams,
      engineLoading,
    }),
    [
      runId,
      symbol,
      fromDate,
      toDate,
      preset,
      fromAt,
      toAt,
      setPreset,
      setFromDate,
      setToDate,
      setDateRange,
      applySearch,
      queryParams,
      engineLoading,
    ]
  );

  return (
    <HistoryFilterContext.Provider value={value}>{children}</HistoryFilterContext.Provider>
  );
};

export function useHistoryFilter(): HistoryFilterState {
  const ctx = useContext(HistoryFilterContext);
  if (!ctx) {
    throw new Error('useHistoryFilter must be used within HistoryFilterProvider');
  }
  return ctx;
}

/** Provider 밖(또는 선택적)에서 안전하게 사용 */
export function useHistoryFilterOptional(): HistoryFilterState | null {
  return useContext(HistoryFilterContext);
}
