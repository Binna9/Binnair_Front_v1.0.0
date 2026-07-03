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

interface FuturesMarketState {
  tickers: Record<string, FuturesTicker>;
  markPrices: Record<string, FuturesMarkPrice>;
  orderBooks: Record<string, OrderBookData>;
  setTicker: (symbol: string, ticker: FuturesTicker) => void;
  setMarkPrice: (symbol: string, markPrice: FuturesMarkPrice) => void;
  setOrderBook: (symbol: string, orderBook: OrderBookData) => void;
}

/** 바이낸스 선물 실시간 시세(티커/마크가격/호가)를 심볼별로 보관하는 스토어 */
export const useFuturesMarketStore = create<FuturesMarketState>((set) => ({
  tickers: {},
  markPrices: {},
  orderBooks: {},
  setTicker: (symbol, ticker) =>
    set((s) => ({ tickers: { ...s.tickers, [symbol]: ticker } })),
  setMarkPrice: (symbol, markPrice) =>
    set((s) => ({ markPrices: { ...s.markPrices, [symbol]: markPrice } })),
  setOrderBook: (symbol, orderBook) =>
    set((s) => ({ orderBooks: { ...s.orderBooks, [symbol]: orderBook } })),
}));
