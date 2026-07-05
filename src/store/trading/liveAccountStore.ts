import { create } from 'zustand';
import {
  LiveEnvironment,
  LiveWalletSummary,
  LiveSnapshotMessage,
  LiveWalletUpdateMessage,
  LivePositionUpdateMessage,
  LivePositionClosedMessage,
  LiveOrderUpdateMessage,
  LiveMarkPriceMessage,
} from '@/types/TradingLiveTypes';

export interface LivePosition {
  symbol: string;
  side: 'LONG' | 'SHORT' | null;
  quantity: number;
  entry_price: number;
  unrealized_pnl: number;
  leverage?: number;
  margin_type?: string | null;
  mark_price?: number;
}

export interface LiveOrderFill {
  symbol: string;
  side: 'BUY' | 'SELL';
  status: string;
  order_id: string;
  executed_qty: number;
  avg_price: number;
  realized_pnl: number;
  event_at: string;
}

interface RestFallbackPayload {
  wallet: LiveWalletSummary;
  positions: LivePosition[];
  paperMode: boolean;
  quoteAsset: string;
}

const MAX_RECENT_FILLS = 20;

interface LiveAccountState {
  environment: LiveEnvironment | null;
  paperMode: boolean;
  quoteAsset: string;
  wallet: LiveWalletSummary | null;
  positions: Record<string, LivePosition>;
  recentFills: LiveOrderFill[];
  wsConnected: boolean;
  userStreamConnected: boolean;
  markPriceConnected: boolean;
  lastError: string | null;

  applySnapshot: (msg: LiveSnapshotMessage) => void;
  applyWalletUpdate: (msg: LiveWalletUpdateMessage) => void;
  applyPositionUpdate: (msg: LivePositionUpdateMessage) => void;
  applyPositionClosed: (msg: LivePositionClosedMessage) => void;
  applyOrderUpdate: (msg: LiveOrderUpdateMessage) => void;
  applyMarkPrice: (msg: LiveMarkPriceMessage) => void;
  applyRestFallback: (payload: RestFallbackPayload) => void;
  setStreamStatus: (status: {
    user_stream_connected: boolean;
    mark_price_connected: boolean;
  }) => void;
  setWsConnected: (connected: boolean) => void;
  setError: (message: string | null) => void;
}

/** BinnAIR Live WebSocket(/ws/v1/live)으로 받은 지갑·포지션·체결 상태 (연결 끊김 시 REST 폴백으로도 갱신) */
export const useLiveAccountStore = create<LiveAccountState>((set) => ({
  environment: null,
  paperMode: false,
  quoteAsset: 'USDT',
  wallet: null,
  positions: {},
  recentFills: [],
  wsConnected: false,
  userStreamConnected: false,
  markPriceConnected: false,
  lastError: null,

  applySnapshot: (msg) =>
    set({
      environment: msg.environment,
      paperMode: msg.paper_mode,
      quoteAsset: msg.quote_asset,
      wallet: msg.wallet,
      positions: Object.fromEntries(
        msg.positions.map((p) => [
          p.symbol,
          {
            symbol: p.symbol,
            side: p.side,
            quantity: p.quantity,
            entry_price: p.entry_price,
            unrealized_pnl: p.unrealized_profit,
            leverage: p.leverage,
            margin_type: p.margin_type,
          },
        ])
      ),
      userStreamConnected: msg.stream.user_stream_enabled,
      markPriceConnected: msg.stream.mark_price_enabled,
      lastError: null,
    }),

  applyWalletUpdate: (msg) =>
    set((s) => {
      if (!s.wallet) return {};
      const quote = msg.balances.find((b) => b.asset === s.quoteAsset);
      if (!quote) return {};
      return {
        wallet: { ...s.wallet, total_wallet_balance: quote.wallet_balance },
      };
    }),

  applyPositionUpdate: (msg) =>
    set((s) => ({
      positions: {
        ...s.positions,
        [msg.symbol]: {
          symbol: msg.symbol,
          side: msg.side,
          quantity: msg.quantity,
          entry_price: msg.entry_price,
          unrealized_pnl: msg.unrealized_pnl,
          margin_type: msg.margin_type,
          leverage: s.positions[msg.symbol]?.leverage,
          mark_price: s.positions[msg.symbol]?.mark_price,
        },
      },
    })),

  applyPositionClosed: (msg) =>
    set((s) => {
      if (!(msg.symbol in s.positions)) return {};
      const next = { ...s.positions };
      delete next[msg.symbol];
      return { positions: next };
    }),

  applyOrderUpdate: (msg) =>
    set((s) => ({
      recentFills: [
        {
          symbol: msg.symbol,
          side: msg.side,
          status: msg.status,
          order_id: msg.order_id,
          executed_qty: msg.executed_qty,
          avg_price: msg.avg_price,
          realized_pnl: msg.realized_pnl,
          event_at: msg.event_at,
        },
        ...s.recentFills,
      ].slice(0, MAX_RECENT_FILLS),
    })),

  applyMarkPrice: (msg) =>
    set((s) => {
      const pos = s.positions[msg.symbol];
      if (!pos) return {};
      return {
        positions: {
          ...s.positions,
          [msg.symbol]: { ...pos, mark_price: msg.mark_price },
        },
      };
    }),

  applyRestFallback: (payload) =>
    set({
      wallet: payload.wallet,
      paperMode: payload.paperMode,
      quoteAsset: payload.quoteAsset,
      positions: Object.fromEntries(payload.positions.map((p) => [p.symbol, p])),
    }),

  setStreamStatus: (status) =>
    set({
      userStreamConnected: status.user_stream_connected,
      markPriceConnected: status.mark_price_connected,
    }),

  setWsConnected: (connected) => set({ wsConnected: connected }),
  setError: (message) => set({ lastError: message }),
}));
