import { create } from 'zustand';
import { useFuturesMarketStore } from './futuresMarketStore';

/** 심볼 메타 (헤더·차트·오더북 등 표시용) */
export interface SymbolMeta {
  symbol: string;
  base: string;
  quote: string;
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
export const SYMBOL_LIST: { symbol: string; base: string; quote: string }[] = [
  { symbol: 'BTCUSDT', base: 'BTC', quote: 'USDT' },
  { symbol: 'ETHUSDT', base: 'ETH', quote: 'USDT' },
  { symbol: 'SOLUSDT', base: 'SOL', quote: 'USDT' },
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
 * 실시간 값이 아직 도착하지 않았으면 시세 필드는 undefined로 두어 로딩 중임을 구분할 수 있게 한다.
 */
export function useSymbolMeta(): SymbolMeta | undefined {
  const selectedSymbol = useSymbolStore((s) => s.selectedSymbol);
  const staticInfo = SYMBOL_LIST.find((s) => s.symbol === selectedSymbol);
  const ticker = useFuturesMarketStore((s) => s.tickers[selectedSymbol]);
  const markPrice = useFuturesMarketStore((s) => s.markPrices[selectedSymbol]);

  if (!staticInfo || !ticker || !markPrice) return undefined;

  return {
    ...staticInfo,
    ...ticker,
    ...markPrice,
  };
}
