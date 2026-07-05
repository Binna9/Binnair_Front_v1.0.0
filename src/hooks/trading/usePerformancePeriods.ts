import { useEffect, useState } from 'react';
import tradingPerformanceService from '@/services/TradingPerformanceService';
import { PerformancePeriodItemDTO } from '@/types/TradingPerformanceTypes';

const POLL_MS = 30000;
const DAYS = 30;

/** 최근 N일 일별 성과(에쿼티 커브·PnL 차트용)를 30초 주기로 폴링 */
export function usePerformancePeriods() {
  const [items, setItems] = useState<PerformancePeriodItemDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const data = await tradingPerformanceService.getPeriods({
          granularity: 'day',
          limit: DAYS,
        });
        if (cancelled) return;
        setItems(data.items);
      } catch {
        // 다음 폴링에서 재시도
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

  return { items, loading };
}
