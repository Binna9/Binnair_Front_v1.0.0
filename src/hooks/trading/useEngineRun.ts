import { useEffect, useState } from 'react';
import tradingEngineRunService from '@/services/TradingEngineRunService';
import { EngineRunDTO } from '@/types/TradingEngineRunTypes';

const POLL_MS = 15000;

/** 가장 최근 엔진 실행 세션(run) 상태를 폴링 — 엔진 생존 여부·run_id·모델 버전 표시용 */
export function useEngineRun() {
  const [run, setRun] = useState<EngineRunDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const data = await tradingEngineRunService.getEngineRuns({ limit: 1 });
        if (cancelled) return;
        setRun(data.items[0] ?? null);
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

  return { run, loading };
}
