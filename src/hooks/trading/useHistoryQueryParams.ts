import { useCallback, useMemo, useState } from 'react';
import { useHistoryFilterOptional } from '@/context/HistoryFilterContext';
import { HistoryQueryParams } from '@/services/TradingHistoryService';

/** 필터 Context 또는 빈 객체에서 history query params 추출 */
export function useHistoryQueryParams(): HistoryQueryParams {
  const filter = useHistoryFilterOptional();
  return useMemo(
    () => ({
      run_id: filter?.runId,
      symbol: filter?.queryParams.symbol,
      from_at: filter?.fromAt,
      to_at: filter?.toAt,
    }),
    [filter?.runId, filter?.queryParams.symbol, filter?.fromAt, filter?.toAt]
  );
}

/** 틱 상세 모달 상태 */
export function useTickModal() {
  const [correlationId, setCorrelationId] = useState<string | null>(null);
  const openTick = useCallback((id?: string | null) => {
    if (id) setCorrelationId(id);
  }, []);
  const closeTick = useCallback(() => setCorrelationId(null), []);
  return { correlationId, openTick, closeTick };
}
