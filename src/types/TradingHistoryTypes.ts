/** BinnAIR Monitor API — GET /api/v1/history/* 응답 타입 */

export interface HistorySummary {
  open_positions: number;
  orders_total: number;
  orders_filled: number;
  orders_pending: number;
  executions_total: number;
  closed_positions: number;
  closed_trades: number;
  realized_pnl_sum: number;
  latest_signal_at?: string | null;
  latest_order_at?: string | null;
  latest_execution_at?: string | null;
  latest_position_at?: string | null;
}

export type OrderFillStatus = 'PENDING' | 'FILLED' | 'REJECTED' | 'CANCELLED';

export interface OrderHistoryItem {
  id?: number;
  user_id: string;
  run_id: string;
  strategy_id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  order_type: 'MARKET' | 'LIMIT';
  quantity: number;
  price?: number | null;
  stop_price?: number | null;
  reduce_only: boolean;
  position_side: string;
  correlation_id: string;
  paper_mode: boolean;
  requested_at: string;
  order_id?: string | null;
  client_order_id?: string | null;
  fill_status: OrderFillStatus;
  filled_qty?: number | null;
  avg_fill_price?: number | null;
  executed_at?: string | null;
  created_at?: string | null;
}

export interface ExecutionHistoryItem {
  id?: number;
  user_id: string;
  order_request_id?: number | null;
  run_id: string;
  strategy_id: string;
  symbol: string;
  order_id: string;
  status: string;
  executed_price?: number | null;
  executed_qty: number;
  notional_usdt?: number | null;
  stop_price?: number | null;
  reduce_only: boolean;
  position_side: string;
  paper_mode: boolean;
  executed_at: string;
  created_at?: string | null;
}

export interface PositionHistoryItem {
  id?: number;
  user_id: string;
  run_id: string;
  strategy_id: string;
  symbol: string;
  side?: 'LONG' | 'SHORT' | null;
  quantity: number;
  avg_entry_price: number;
  tp_price?: number | null;
  sl_price?: number | null;
  status?: 'OPEN' | 'CLOSED' | null;
  unrealized_pnl: number;
  realized_pnl?: number | null;
  exit_reason?: 'TAKE_PROFIT' | 'STOP_LOSS' | 'MODEL_SELL' | null;
  exit_price?: number | null;
  opened_at?: string | null;
  closed_at?: string | null;
  duration_seconds?: number | null;
  paper_mode: boolean;
  snapshot_at: string;
  created_at?: string | null;
}

export interface TradeHistoryItem {
  trade_id: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  entry_price: number;
  exit_price: number;
  quantity: number;
  realized_pnl: number;
  pnl_pct: number;
  is_win: boolean;
  exit_reason: 'TAKE_PROFIT' | 'STOP_LOSS' | 'MODEL_SELL';
  opened_at: string;
  closed_at: string;
  hold_seconds?: number | null;
  holding_seconds?: number | null;
}

export interface HistoryListResponse<T> {
  items: T[];
  count: number;
}
