/** BinnAIR Live WebSocket API (ws/v1/live) 메시지 타입 */

export type LiveEnvironment = 'futures_testnet' | 'futures_mainnet' | 'paper';

export interface LiveWalletSummary {
  available_balance: number;
  total_wallet_balance: number;
  total_unrealized_profit: number;
  total_margin_balance: number;
  can_trade: boolean;
}

export interface LiveSnapshotPosition {
  symbol: string;
  side: 'LONG' | 'SHORT' | null;
  quantity: number;
  entry_price: number;
  unrealized_profit: number;
  leverage: number;
  margin_type?: string | null;
}

export interface LiveStreamInfo {
  ws_base: string;
  user_stream_enabled: boolean;
  mark_price_enabled: boolean;
  symbol?: string;
}

export interface LiveSnapshotMessage {
  type: 'snapshot';
  event_at: string;
  environment: LiveEnvironment;
  paper_mode: boolean;
  market_type: string;
  base_url: string;
  quote_asset: string;
  wallet: LiveWalletSummary;
  positions: LiveSnapshotPosition[];
  stream: LiveStreamInfo;
}

export interface LiveStreamStatusMessage {
  type: 'stream_status';
  user_stream_connected: boolean;
  mark_price_connected: boolean;
  client_count: number;
  last_error?: string | null;
}

export interface LiveWalletBalanceDelta {
  asset: string;
  wallet_balance: number;
  cross_wallet_balance: number;
  balance_change: number;
}

export interface LiveWalletUpdateMessage {
  type: 'wallet_update';
  reason: string;
  event_at: string;
  balances: LiveWalletBalanceDelta[];
}

export interface LivePositionUpdateMessage {
  type: 'position_update';
  symbol: string;
  side: 'LONG' | 'SHORT' | null;
  quantity: number;
  entry_price: number;
  unrealized_pnl: number;
  position_side: string;
  margin_type?: string | null;
  reason: string;
  event_at: string;
}

export interface LivePositionClosedMessage {
  type: 'position_closed';
  symbol: string;
  position_side: string;
  reason: string;
  event_at: string;
}

export interface LiveOrderUpdateMessage {
  type: 'order_update';
  symbol: string;
  side: 'BUY' | 'SELL';
  order_type: string;
  status: string;
  order_id: string;
  quantity: number;
  executed_qty: number;
  avg_price: number;
  reduce_only: boolean;
  realized_pnl: number;
  event_at: string;
}

export interface LiveMarkPriceMessage {
  type: 'mark_price';
  symbol: string;
  mark_price: number;
  funding_rate: number;
  event_at: string;
}

export interface LivePingMessage {
  type: 'ping';
}

export interface LiveStreamErrorMessage {
  type: 'stream_error';
  code: string;
  message: string;
}

export type LiveMessage =
  | LiveSnapshotMessage
  | LiveStreamStatusMessage
  | LiveWalletUpdateMessage
  | LivePositionUpdateMessage
  | LivePositionClosedMessage
  | LiveOrderUpdateMessage
  | LiveMarkPriceMessage
  | LivePingMessage
  | LiveStreamErrorMessage;
