/** BinnAIR Monitor API — GET /api/v1/history/* 응답 타입 */

export interface HistorySummary {
  engine_status?: string | null;
  open_positions: number;
  orders_total: number;
  orders_filled: number;
  orders_pending: number;
  orders_missing_db_execution?: number;
  executions_total: number;
  closed_positions: number;
  closed_trades: number;
  realized_pnl_sum: number;
  wins?: number;
  losses?: number;
  win_rate?: number | null;
  latest_signal_at?: string | null;
  latest_order_at?: string | null;
  latest_execution_at?: string | null;
  latest_position_at?: string | null;
}

export type OrderFillStatus =
  | 'PENDING'
  | 'FILLED'
  | 'PARTIAL'
  | 'REJECTED'
  | 'CANCELLED';

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
  notional_usdt?: number | null;
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
  correlation_id?: string | null;
  synced_from_exchange?: boolean;
  created_at?: string | null;
}

export type PositionExitReason =
  | 'TAKE_PROFIT'
  | 'STOP_LOSS'
  | 'MODEL_SELL'
  | 'TP'
  | 'SL'
  | 'SIGNAL'
  | string;

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
  exit_reason?: PositionExitReason | null;
  exit_price?: number | null;
  opened_at?: string | null;
  closed_at?: string | null;
  duration_seconds?: number | null;
  paper_mode: boolean;
  snapshot_at: string;
  created_at?: string | null;
}

export type TradeExitReason =
  | 'TAKE_PROFIT'
  | 'STOP_LOSS'
  | 'MODEL_SELL'
  | 'TP'
  | 'SL'
  | 'SIGNAL'
  | string;

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
  exit_reason: TradeExitReason;
  opened_at: string;
  closed_at: string;
  hold_seconds?: number | null;
  holding_seconds?: number | null;
  strategy_id?: string | null;
  correlation_id?: string | null;
  entry_notional_usdt?: number | null;
  position_snapshot_id?: number | null;
  paper_mode?: boolean;
  run_id?: string;
}

export interface EquityHistoryItem {
  snapshot_at: string;
  snapshot_date?: string;
  equity_usdt: number;
  cumulative_realized_pnl?: number | null;
  source?: string | null;
  paper_mode?: boolean;
  run_id?: string;
  symbol?: string | null;
}

export interface HistoryListResponse<T> {
  items: T[];
  count: number;
  total_count?: number;
  offset?: number;
  limit?: number;
  has_more?: boolean;
}

export interface TickDetailResponse {
  correlation_id: string;
  run_id?: string | null;
  symbol?: string | null;
  signals?: unknown[];
  inferences?: unknown[];
  orders?: OrderHistoryItem[];
  executions?: ExecutionHistoryItem[];
  positions?: PositionHistoryItem[];
  trades?: TradeHistoryItem[];
  audit_logs?: unknown[];
}

export interface HistoryOverviewResponse {
  summary: HistorySummary;
  orders: OrderHistoryItem[];
  executions: ExecutionHistoryItem[];
  positions: PositionHistoryItem[];
  trades: TradeHistoryItem[];
  equity: EquityHistoryItem[];
}
