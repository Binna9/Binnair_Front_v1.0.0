import { create } from 'zustand';

export interface FuturesTicker {
  lastPrice: number;
  priceChange: number;
  priceChangePercent: number;
  high24h: number;
  low24h: number;
  volume24h: number;
}

export interface FuturesMarkPrice {
  markPrice: number;
  indexPrice: number;
  fundingRate: number;
}

export interface OrderBookLevel {
  price: number;
  size: number;
  sum: number;
}

export interface OrderBookData {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
}

/** 바이낸스 선물 최근 체결 — isBuyerMaker true면 매도 주도(빨강) */
export interface RecentTrade {
  id: string;
  price: number;
  qty: number;
  time: number;
  isBuyerMaker: boolean;
}

const MAX_RECENT_TRADES = 50;

function mergeTrades(prev: RecentTrade[], incoming: RecentTrade[]): RecentTrade[] {
  const map = new Map<string, RecentTrade>();
  for (const t of prev) map.set(t.id, t);
  for (const t of incoming) map.set(t.id, t);
  return [...map.values()]
    .sort((a, b) => b.time - a.time)
    .slice(0, MAX_RECENT_TRADES);
}

interface FuturesMarketState {
  tickers: Record<string, FuturesTicker>;
  markPrices: Record<string, FuturesMarkPrice>;
  orderBooks: Record<string, OrderBookData>;
  recentTrades: Record<string, RecentTrade[]>;
  setTicker: (symbol: string, ticker: FuturesTicker) => void;
  setMarkPrice: (symbol: string, markPrice: FuturesMarkPrice) => void;
  setOrderBook: (symbol: string, orderBook: OrderBookData) => void;
  setRecentTrades: (symbol: string, trades: RecentTrade[]) => void;
  mergeRecentTrades: (symbol: string, trades: RecentTrade[]) => void;
  pushRecentTrade: (symbol: string, trade: RecentTrade) => void;
}

/** 바이낸스 선물 실시간 시세(티커/마크가격/호가/체결)를 심볼별로 보관하는 스토어 */
export const useFuturesMarketStore = create<FuturesMarketState>((set) => ({
  tickers: {},
  markPrices: {},
  orderBooks: {},
  recentTrades: {},
  setTicker: (symbol, ticker) =>
    set((s) => ({ tickers: { ...s.tickers, [symbol]: ticker } })),
  setMarkPrice: (symbol, markPrice) =>
    set((s) => ({ markPrices: { ...s.markPrices, [symbol]: markPrice } })),
  setOrderBook: (symbol, orderBook) =>
    set((s) => ({ orderBooks: { ...s.orderBooks, [symbol]: orderBook } })),
  setRecentTrades: (symbol, trades) =>
    set((s) => ({
      recentTrades: {
        ...s.recentTrades,
        [symbol]: trades.slice(0, MAX_RECENT_TRADES),
      },
    })),
  mergeRecentTrades: (symbol, trades) =>
    set((s) => ({
      recentTrades: {
        ...s.recentTrades,
        [symbol]: mergeTrades(s.recentTrades[symbol] ?? [], trades),
      },
    })),
  pushRecentTrade: (symbol, trade) =>
    set((s) => {
      const prev = s.recentTrades[symbol] ?? [];
      if (prev.some((t) => t.id === trade.id)) return s;
      return {
        recentTrades: {
          ...s.recentTrades,
          [symbol]: [trade, ...prev].slice(0, MAX_RECENT_TRADES),
        },
      };
    }),
}));
