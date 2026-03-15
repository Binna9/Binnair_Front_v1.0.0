import { create } from 'zustand';

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

/** Mock 심볼 목록 (API 연동 전) */
export const MOCK_SYMBOL_LIST: SymbolMeta[] = [
  {
    symbol: 'BTCUSDT',
    base: 'BTC',
    quote: 'USDT',
    lastPrice: 71760.9,
    priceChange: 1080.7,
    priceChangePercent: 1.52,
    markPrice: 71760.9,
    indexPrice: 71761.0,
    fundingRate: 0.0001,
    high24h: 72500.0,
    low24h: 70100.0,
    volume24h: 12345.67,
  },
  {
    symbol: 'ETHUSDT',
    base: 'ETH',
    quote: 'USDT',
    lastPrice: 3650.2,
    priceChange: -42.5,
    priceChangePercent: -1.15,
    markPrice: 3650.1,
    indexPrice: 3650.3,
    fundingRate: 0.00005,
    high24h: 3720.0,
    low24h: 3580.0,
    volume24h: 98765.43,
  },
  {
    symbol: 'SOLUSDT',
    base: 'SOL',
    quote: 'USDT',
    lastPrice: 178.5,
    priceChange: 5.2,
    priceChangePercent: 3.0,
    markPrice: 178.4,
    indexPrice: 178.6,
    fundingRate: 0.0002,
    high24h: 182.0,
    low24h: 170.0,
    volume24h: 54321.0,
  },
];

interface SymbolState {
  selectedSymbol: string;
  setSelectedSymbol: (symbol: string) => void;
}

export const useSymbolStore = create<SymbolState>((set) => ({
  selectedSymbol: 'BTCUSDT',
  setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
}));

/** 선택된 심볼 메타를 구독하는 훅 (파생 값 사용) */
export function useSymbolMeta(): SymbolMeta | undefined {
  const selectedSymbol = useSymbolStore((s) => s.selectedSymbol);
  return MOCK_SYMBOL_LIST.find((s) => s.symbol === selectedSymbol);
}
