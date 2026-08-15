import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { useEngineRun } from '@/hooks/trading/useEngineRun';
import { EngineRunDTO, pickActiveEngineRun } from '@/types/TradingEngineRunTypes';
import {
  dateToFromAt,
  dateToToAt,
  daysAgoDateInput,
  normalizeDateInput,
  todayDateInput,
} from '@/utils/historyDateUtils';

export type DatePreset = 'today' | '7d' | '30d' | 'all' | 'custom';

/** 전체 run (API에 run_id 미전달) */
export const HISTORY_RUN_ALL = '';

export interface HistoryFilterState {
  runId: string | undefined;
  runs: EngineRunDTO[];
  setRunId: (runId: string) => void;
  /** 입력 중인(미적용) 값 */
  symbol: string;
  fromDate: string;
  toDate: string;
  preset: DatePreset;
  /** API에 실제로 쓰이는 적용된 값 */
  fromAt: string | undefined;
  toAt: string | undefined;
  /** 검색할 때마다 증가 — 값이 같아도 재조회 트리거 */
  searchEpoch: number;
  setSymbol: (v: string) => void;
  setPreset: (p: DatePreset) => void;
  setFromDate: (v: string) => void;
  setToDate: (v: string) => void;
  setDateRange: (from: string, to: string) => void;
  /** 검색 버튼 / Enter — draft → applied 반영 후 API 재조회 */
  applySearch: () => void;
  /** 7일 기본값 + 심볼 비움으로 초기화 후 즉시 적용 */
  resetFilters: () => void;
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
  const { run, runs, loading: engineLoading } = useEngineRun();
  const initial = enableDateFilter ? applyPreset('7d') : { from: '', to: '' };
  const initialPreset: DatePreset = enableDateFilter ? '7d' : 'all';

  // draft (UI)
  const [preset, setPresetState] = useState<DatePreset>(initialPreset);
  const [fromDate, setFromDateState] = useState(initial.from);
  const [toDate, setToDateState] = useState(initial.to);
  const [symbol, setSymbol] = useState('');

  // applied (API)
  const [appliedFromDate, setAppliedFromDate] = useState(initial.from);
  const [appliedToDate, setAppliedToDate] = useState(initial.to);
  const [appliedSymbol, setAppliedSymbol] = useState('');
  const [searchEpoch, setSearchEpoch] = useState(0);

  /** undefined = 아직 엔진 run 목록 대기 / '' = 전체 / 그 외 = 선택 run */
  const [selectedRunId, setSelectedRunId] = useState<string | undefined>(undefined);
  const [runTouched, setRunTouched] = useState(false);

  // 사용자 미선택 시 활성(running) run으로 기본 바인딩
  useEffect(() => {
    if (runTouched) return;
    const fallback = pickActiveEngineRun(runs)?.run_id ?? run?.run_id;
    if (fallback) setSelectedRunId(fallback);
  }, [runs, run, runTouched]);

  const setRunId = useCallback((id: string) => {
    setRunTouched(true);
    setSelectedRunId(id === HISTORY_RUN_ALL ? HISTORY_RUN_ALL : id);
    setSearchEpoch((n) => n + 1);
  }, []);

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
    const from = normalizeDateInput(fromDate) || fromDate.trim();
    const to = normalizeDateInput(toDate) || toDate.trim();
    if (from !== fromDate) setFromDateState(from);
    if (to !== toDate) setToDateState(to);
    setAppliedFromDate(from);
    setAppliedToDate(to);
    setAppliedSymbol(symbol);
    setSearchEpoch((n) => n + 1);
  }, [fromDate, toDate, symbol]);

  const resetFilters = useCallback(() => {
    setRunTouched(false);
    const active = pickActiveEngineRun(runs)?.run_id ?? run?.run_id;
    setSelectedRunId(active);
    if (!enableDateFilter) {
      setSymbol('');
      setAppliedSymbol('');
      setSearchEpoch((n) => n + 1);
      return;
    }
    const range = applyPreset('7d');
    setPresetState('7d');
    setFromDateState(range.from);
    setToDateState(range.to);
    setSymbol('');
    setAppliedFromDate(range.from);
    setAppliedToDate(range.to);
    setAppliedSymbol('');
    setSearchEpoch((n) => n + 1);
  }, [enableDateFilter, runs, run]);

  const fromAt = enableDateFilter
    ? dateToFromAt(normalizeDateInput(appliedFromDate) || appliedFromDate || undefined)
    : undefined;
  const toAt = enableDateFilter
    ? dateToToAt(normalizeDateInput(appliedToDate) || appliedToDate || undefined)
    : undefined;

  const runId =
    selectedRunId === HISTORY_RUN_ALL ? undefined : selectedRunId || undefined;

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
      runs,
      setRunId,
      symbol,
      fromDate,
      toDate,
      preset,
      fromAt,
      toAt,
      searchEpoch,
      setSymbol,
      setPreset,
      setFromDate,
      setToDate,
      setDateRange,
      applySearch,
      resetFilters,
      queryParams,
      engineLoading,
    }),
    [
      runId,
      runs,
      setRunId,
      symbol,
      fromDate,
      toDate,
      preset,
      fromAt,
      toAt,
      searchEpoch,
      setPreset,
      setFromDate,
      setToDate,
      setDateRange,
      applySearch,
      resetFilters,
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
