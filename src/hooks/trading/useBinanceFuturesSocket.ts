import { useEffect } from 'react';
import {
  RecentTrade,
  useFuturesMarketStore,
} from '@/store/trading/futuresMarketStore';

const DEPTH_LEVELS = 8;
const TICKER_POLL_MS = 2000;
const TRADES_POLL_MS = 2000;
const RECENT_TRADES_LIMIT = 40;

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

function mapRestTrades(
  rows: Array<{
    id: number;
    price: string;
    qty: string;
    time: number;
    isBuyerMaker: boolean;
  }>
): RecentTrade[] {
  return [...rows].reverse().map((t) => ({
    id: `t-${t.id}`,
    price: Number(t.price),
    qty: Number(t.qty),
    time: t.time,
    isBuyerMaker: Boolean(t.isBuyerMaker),
  }));
}

/**
 * 선택된 심볼의 바이낸스 선물 실시간 데이터.
 * 호가(depth) / 체결(trade) / 마크가격을 분리 구독·폴링해 심볼 전환 시에도 안정적으로 갱신.
 */
export function useBinanceFuturesSocket(symbol: string) {
  const setMarkPrice = useFuturesMarketStore((s) => s.setMarkPrice);
  const setOrderBook = useFuturesMarketStore((s) => s.setOrderBook);
  const mergeRecentTrades = useFuturesMarketStore((s) => s.mergeRecentTrades);
  const pushRecentTrade = useFuturesMarketStore((s) => s.pushRecentTrade);

  // 호가 depth
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
        try {
          const data = JSON.parse(event.data) as { a?: unknown; b?: unknown };
          setOrderBook(symbol, {
            asks: buildOrderBookSide(data.a, DEPTH_LEVELS).reverse(),
            bids: buildOrderBookSide(data.b, DEPTH_LEVELS),
          });
        } catch {
          // ignore
        }
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

  // 최근 체결 trade WS
  useEffect(() => {
    if (!symbol) return;

    const lower = symbol.toLowerCase();
    let cancelled = false;
    let socket: WebSocket | null = null;
    let reconnectTimer: number | undefined;

    const connect = () => {
      if (cancelled) return;

      socket = new WebSocket(`wss://fstream.binance.com/ws/${lower}@trade`);

      socket.onmessage = (event: MessageEvent<string>) => {
        if (cancelled) return;
        try {
          const t = JSON.parse(event.data) as {
            t: number;
            p: string;
            q: string;
            T?: number;
            E?: number;
            m: boolean;
          };
          pushRecentTrade(symbol, {
            id: `t-${String(t.t)}`,
            price: Number(t.p),
            qty: Number(t.q),
            time: Number(t.T ?? t.E),
            isBuyerMaker: Boolean(t.m),
          });
        } catch {
          // ignore
        }
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
  }, [symbol, pushRecentTrade]);

  // 최근 체결 REST 폴링
  useEffect(() => {
    if (!symbol) return;

    let cancelled = false;

    const pull = async () => {
      try {
        const res = await fetch(
          `https://fapi.binance.com/fapi/v1/trades?symbol=${symbol}&limit=${RECENT_TRADES_LIMIT}`
        );
        if (cancelled || !res.ok) return;
        const rows = await res.json();
        if (!Array.isArray(rows)) return;
        mergeRecentTrades(symbol, mapRestTrades(rows));
      } catch {
        // 다음 폴링에서 재시도
      }
    };

    pull();
    const id = window.setInterval(pull, TRADES_POLL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [symbol, mergeRecentTrades]);

  // 마크/인덱스/펀딩 — 심볼 바뀌면 즉시 1회 + 폴링
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
        // 다음 폴링에서 재시도
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
