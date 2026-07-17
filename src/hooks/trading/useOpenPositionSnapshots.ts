import { useEffect, useState } from 'react';
import tradingHistoryService from '@/services/TradingHistoryService';
import { PositionHistoryItem } from '@/types/TradingHistoryTypes';

const POLL_MS = 5000;

/**
 * 엔진이 DB에 저장한 OPEN 포지션 스냅샷(TP/SL 등)을 심볼별로 폴링 조회.
 * 거래소 실시간(WS) 포지션 데이터엔 없는 엔진 자체 TP/SL 값을 보강할 때 사용한다.
 */
export function useOpenPositionSnapshots() {
  const [bySymbol, setBySymbol] = useState<Record<string, PositionHistoryItem>>({});

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const data = await tradingHistoryService.getPositions(
          {
            open_only: true,
            limit: 100,
          },
          { skipGlobalLoading: true }
        );
        if (cancelled) return;
        setBySymbol(Object.fromEntries(data.items.map((p) => [p.symbol, p])));
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

  return bySymbol;
}
