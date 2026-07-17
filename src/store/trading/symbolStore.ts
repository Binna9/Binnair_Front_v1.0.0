import { create } from 'zustand';
import { useFuturesMarketStore } from './futuresMarketStore';

/** 심볼 메타 (헤더·차트·오더북 등 표시용) */
export interface SymbolMeta {
  symbol: string;
  base: string;
  quote: string;
  /** 한글 코인명 (예: 리플) */
  nameKo: string;
  /** 현재가 */
  lastPrice: number;
  /** 24h 변동가 */
  priceChange: number;
  /** 24h 변동률 (%) */
  priceChangePercent: number;
  markPrice: number;
  indexPrice: number;
  fundingRate: number;
  high24h: number;
  low24h: number;
  volume24h: number;
}

/** 거래 가능 심볼 목록 (드롭다운 표시용, 시세 값은 실시간 futuresMarketStore에서 가져옴) */
export const SYMBOL_LIST: { symbol: string; base: string; quote: string; nameKo: string }[] = [
  { symbol: 'BTCUSDT', base: 'BTC', quote: 'USDT', nameKo: '비트코인' },
  { symbol: 'ETHUSDT', base: 'ETH', quote: 'USDT', nameKo: '이더리움' },
  { symbol: 'SOLUSDT', base: 'SOL', quote: 'USDT', nameKo: '솔라나' },
  { symbol: 'XRPUSDT', base: 'XRP', quote: 'USDT', nameKo: '리플' },
  { symbol: 'TRXUSDT', base: 'TRX', quote: 'USDT', nameKo: '트론' },
];

interface SymbolState {
  selectedSymbol: string;
  setSelectedSymbol: (symbol: string) => void;
}

export const useSymbolStore = create<SymbolState>((set) => ({
  selectedSymbol: 'BTCUSDT',
  setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
}));

/**
 * 선택된 심볼 메타를 구독하는 훅.
 * symbol/base/quote는 정적 목록에서, 시세 값은 실시간 futuresMarketStore에서 가져와 병합한다.
 * ticker/mark 중 일부만 와도 표시 가능하게 한다 (심볼 전환 시 헤더가 통째로 사라지지 않게).
 */
export function useSymbolMeta(): SymbolMeta | undefined {
  const selectedSymbol = useSymbolStore((s) => s.selectedSymbol);
  const staticInfo = SYMBOL_LIST.find((s) => s.symbol === selectedSymbol);
  const ticker = useFuturesMarketStore((s) => s.tickers[selectedSymbol]);
  const markPrice = useFuturesMarketStore((s) => s.markPrices[selectedSymbol]);

  if (!staticInfo) return undefined;
  if (!ticker && !markPrice) return undefined;

  return {
    ...staticInfo,
    lastPrice: ticker?.lastPrice ?? markPrice?.markPrice ?? 0,
    priceChange: ticker?.priceChange ?? 0,
    priceChangePercent: ticker?.priceChangePercent ?? 0,
    high24h: ticker?.high24h ?? 0,
    low24h: ticker?.low24h ?? 0,
    volume24h: ticker?.volume24h ?? 0,
    markPrice: markPrice?.markPrice ?? ticker?.lastPrice ?? 0,
    indexPrice: markPrice?.indexPrice ?? ticker?.lastPrice ?? 0,
    fundingRate: markPrice?.fundingRate ?? 0,
  };
}
