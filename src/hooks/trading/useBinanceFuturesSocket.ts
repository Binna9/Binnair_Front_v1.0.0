import { useEffect } from 'react';
import { useFuturesMarketStore } from '@/store/trading/futuresMarketStore';

const DEPTH_LEVELS = 10;
const TICKER_POLL_MS = 2000;

function buildOrderBookSide(levels: unknown, count: number) {
  const rows = (Array.isArray(levels) ? levels : [])
    .slice(0, count)
    .map((level) => {
      const [price, qty] = level as [string, string];
      return { price: Number(price), size: Number(qty) };
    });

  let running = 0;
  return rows.map((row) => {
    running += row.size;
    return { ...row, sum: running };
  });
}

/**
 * 선택된 심볼의 바이낸스 선물 실시간 데이터를 futuresMarketStore에 반영.
 * - 호가(depth20): WebSocket 구독 (정상 동작 확인됨)
 * - 마크가격/펀딩비: `@markPrice` WS 스트림이 메시지를 보내지 않아 REST(`/fapi/v1/premiumIndex`) 폴링으로 대체
 * - 현재가/24h 통계(ticker)는 심볼 목록 전체를 다루는 `useAllSymbolsTicker`가 담당
 */
export function useBinanceFuturesSocket(symbol: string) {
  const setMarkPrice = useFuturesMarketStore((s) => s.setMarkPrice);
  const setOrderBook = useFuturesMarketStore((s) => s.setOrderBook);

  useEffect(() => {
    if (!symbol) return;

    const lower = symbol.toLowerCase();
    let cancelled = false;
    let socket: WebSocket | null = null;
    let reconnectTimer: number | undefined;

    const connect = () => {
      if (cancelled) return;

      socket = new WebSocket(
        `wss://fstream.binance.com/ws/${lower}@depth20@100ms`
      );

      socket.onmessage = (event: MessageEvent<string>) => {
        if (cancelled) return;

        let data: { a?: unknown; b?: unknown };
        try {
          data = JSON.parse(event.data);
        } catch {
          return;
        }

        setOrderBook(symbol, {
          asks: buildOrderBookSide(data.a, DEPTH_LEVELS).reverse(),
          bids: buildOrderBookSide(data.b, DEPTH_LEVELS),
        });
      };

      socket.onclose = () => {
        if (cancelled) return;
        reconnectTimer = window.setTimeout(connect, 1000);
      };

      socket.onerror = () => {
        socket?.close();
      };
    };

    connect();

    return () => {
      cancelled = true;
      window.clearTimeout(reconnectTimer);
      if (socket) {
        socket.onopen = null;
        socket.onmessage = null;
        socket.onerror = null;
        socket.onclose = null;
        if (
          socket.readyState === WebSocket.OPEN ||
          socket.readyState === WebSocket.CONNECTING
        ) {
          socket.close(1000, 'client');
        }
      }
    };
  }, [symbol, setOrderBook]);

  useEffect(() => {
    if (!symbol) return;

    let cancelled = false;

    const poll = async () => {
      try {
        const markRes = await fetch(
          `https://fapi.binance.com/fapi/v1/premiumIndex?symbol=${symbol}`
        );
        if (cancelled || !markRes.ok) return;

        const m = await markRes.json();
        setMarkPrice(symbol, {
          markPrice: Number(m.markPrice),
          indexPrice: Number(m.indexPrice),
          fundingRate: Number(m.lastFundingRate),
        });
      } catch {
        // 일시적 네트워크 오류는 다음 폴링에서 재시도
      }
    };

    poll();
    const id = window.setInterval(poll, TICKER_POLL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [symbol, setMarkPrice]);
}
