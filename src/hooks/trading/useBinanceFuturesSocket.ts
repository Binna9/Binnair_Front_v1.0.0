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
  // REST는 오래된→최신. UI는 최신 위.
  return [...rows].reverse().map((t) => ({
    id: `t-${t.id}`,
    price: Number(t.price),
    qty: Number(t.qty),
    time: t.time,
    isBuyerMaker: Boolean(t.isBuyerMaker),
  }));
}

/**
 * 선택된 심볼의 바이낸스 선물 실시간 데이터를 futuresMarketStore에 반영.
 * - 호가 + 체결: combined stream 1개 (depth20 + trade)
 * - 최근 체결: REST 폴링 병합(현행화 보장) + WS 즉시 반영
 * - 마크가격/펀딩비: REST premiumIndex 폴링
 */
export function useBinanceFuturesSocket(symbol: string) {
  const setMarkPrice = useFuturesMarketStore((s) => s.setMarkPrice);
  const setOrderBook = useFuturesMarketStore((s) => s.setOrderBook);
  const mergeRecentTrades = useFuturesMarketStore((s) => s.mergeRecentTrades);
  const pushRecentTrade = useFuturesMarketStore((s) => s.pushRecentTrade);

  // 호가 + 최근 체결 combined WebSocket
  useEffect(() => {
    if (!symbol) return;

    const lower = symbol.toLowerCase();
    let cancelled = false;
    let socket: WebSocket | null = null;
    let reconnectTimer: number | undefined;

    const connect = () => {
      if (cancelled) return;

      // trade = 개별 체결(현행화에 유리). aggTrade보다 id/필드가 REST와 맞추기 쉬움
      const streams = `${lower}@depth20@100ms/${lower}@trade`;
      socket = new WebSocket(
        `wss://fstream.binance.com/stream?streams=${streams}`
      );

      socket.onmessage = (event: MessageEvent<string>) => {
        if (cancelled) return;

        let msg: { stream?: string; data?: Record<string, unknown> };
        try {
          msg = JSON.parse(event.data);
        } catch {
          return;
        }

        const stream = msg.stream ?? '';
        const data = msg.data;
        if (!data) return;

        if (stream.includes('@depth')) {
          setOrderBook(symbol, {
            asks: buildOrderBookSide(data.a, DEPTH_LEVELS).reverse(),
            bids: buildOrderBookSide(data.b, DEPTH_LEVELS),
          });
          return;
        }

        if (stream.includes('@trade')) {
          pushRecentTrade(symbol, {
            id: `t-${String(data.t)}`,
            price: Number(data.p),
            qty: Number(data.q),
            time: Number(data.T ?? data.E),
            isBuyerMaker: Boolean(data.m),
          });
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
  }, [symbol, setOrderBook, pushRecentTrade]);

  // 최근 체결 REST 폴링 — WS가 끊겨도 목록이 갱신되도록 merge
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
