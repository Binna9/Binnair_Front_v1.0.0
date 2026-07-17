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
    // searchEpoch: 날짜/심볼이 같아도 Enter·검색 시 새 객체 → 목록 재조회
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      filter?.runId,
      filter?.queryParams.symbol,
      filter?.fromAt,
      filter?.toAt,
      filter?.searchEpoch,
    ]
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
