import { useEffect } from 'react';
import { useFuturesMarketStore } from '@/store/trading/futuresMarketStore';
import { SYMBOL_LIST } from '@/store/trading/symbolStore';

const POLL_MS = 2000;

/**
 * 심볼 목록(SYMBOL_LIST) 전체의 24h 티커를 폴링해 futuresMarketStore에 반영.
 * 선택되지 않은 심볼도 항상 최신 현재가/등락률을 갖도록 해 심볼 선택 드롭다운 등에서 사용한다.
 */
export function useAllSymbolsTicker() {
  const setTicker = useFuturesMarketStore((s) => s.setTicker);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const results = await Promise.all(
          SYMBOL_LIST.map(async ({ symbol }) => {
            const res = await fetch(
              `https://fapi.binance.com/fapi/v1/ticker/24hr?symbol=${symbol}`
            );
            if (!res.ok) return null;
            return { symbol, t: await res.json() };
          })
        );
        if (cancelled) return;

        for (const item of results) {
          if (!item) continue;
          setTicker(item.symbol, {
            lastPrice: Number(item.t.lastPrice),
            priceChange: Number(item.t.priceChange),
            priceChangePercent: Number(item.t.priceChangePercent),
            high24h: Number(item.t.highPrice),
            low24h: Number(item.t.lowPrice),
            volume24h: Number(item.t.volume),
          });
        }
      } catch {
        // 일시적 네트워크 오류는 다음 폴링에서 재시도
      }
    };

    poll();
    const id = window.setInterval(poll, POLL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [setTicker]);
}
