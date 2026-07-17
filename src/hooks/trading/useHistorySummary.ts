import { useEffect, useState } from 'react';
import tradingHistoryService from '@/services/TradingHistoryService';
import { HistorySummary } from '@/types/TradingHistoryTypes';
import { useHistoryFilterOptional } from '@/context/HistoryFilterContext';

const POLL_MS = 10000;

/** 이력 요약 폴링 — HistoryFilterContext가 있으면 run_id/날짜/심볼 반영 */
export function useHistorySummary(poll = true) {
  const filter = useHistoryFilterOptional();
  const [summary, setSummary] = useState<HistorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const runId = filter?.runId;
  const fromAt = filter?.fromAt;
  const toAt = filter?.toAt;
  const symbol = filter?.queryParams.symbol;

  useEffect(() => {
    let cancelled = false;

    const pollOnce = async () => {
      try {
        const data = await tradingHistoryService.getSummary({
          run_id: runId,
          from_at: fromAt,
          to_at: toAt,
          symbol,
        });
        if (!cancelled) {
          setSummary(data);
          setError(null);
        }
      } catch {
        if (!cancelled) setError('요약을 불러오지 못했습니다.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    setLoading(true);
    pollOnce();

    if (!poll) {
      return () => {
        cancelled = true;
      };
    }

    const id = window.setInterval(pollOnce, POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [runId, fromAt, toAt, symbol, poll, filter?.searchEpoch]);

  return { summary, loading, error };
}
