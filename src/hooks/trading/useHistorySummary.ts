import { useEffect, useState } from 'react';
import tradingHistoryService from '@/services/TradingHistoryService';
import { HistorySummary } from '@/types/TradingHistoryTypes';

const POLL_MS = 10000;

/** 탭 배지(미체결 주문 수, 청산 거래 수 등) 표시용 이력 요약을 10초 주기로 폴링 */
export function useHistorySummary() {
  const [summary, setSummary] = useState<HistorySummary | null>(null);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const data = await tradingHistoryService.getSummary();
        if (!cancelled) setSummary(data);
      } catch {
        // 다음 폴링에서 재시도
      }
    };

    poll();
    const id = window.setInterval(poll, POLL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  return summary;
}
