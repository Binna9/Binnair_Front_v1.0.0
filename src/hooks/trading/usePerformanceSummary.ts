import { useEffect, useState } from 'react';
import tradingPerformanceService from '@/services/TradingPerformanceService';
import { PerformanceSummaryDTO } from '@/types/TradingPerformanceTypes';

const POLL_MS = 30000;

/** 성과 요약(승률·PnL·profit factor 등)을 30초 주기로 폴링 */
export function usePerformanceSummary() {
  const [summary, setSummary] = useState<PerformanceSummaryDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const data = await tradingPerformanceService.getSummary();
        if (cancelled) return;
        setSummary(data);
        setError(null);
      } catch {
        if (cancelled) return;
        setError('성과 요약을 불러오지 못했습니다.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    poll();
    const id = window.setInterval(poll, POLL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  return { summary, loading, error };
}
