import { useEffect, useState } from 'react';
import tradingEngineRunService from '@/services/TradingEngineRunService';
import {
  EngineRunDTO,
  pickActiveEngineRun,
} from '@/types/TradingEngineRunTypes';

const POLL_MS = 15000;

/**
 * 엔진 실행 세션 폴링.
 * timesfm / fincast 등 run_id별 행이 여러 개일 수 있으므로
 * running 세션을 우선 표시한다 (없으면 최신 1건).
 */
export function useEngineRun() {
  const [run, setRun] = useState<EngineRunDTO | null>(null);
  const [runs, setRuns] = useState<EngineRunDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const data = await tradingEngineRunService.getEngineRuns({ limit: 20 });
        if (cancelled) return;
        const items = data.items ?? [];
        setRuns(items);
        setRun(pickActiveEngineRun(items));
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

  return { run, runs, loading };
}
