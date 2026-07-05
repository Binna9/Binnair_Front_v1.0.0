/** BinnAIR Monitor API — GET /api/v1/performance/summary, /performance/periods 응답 타입 */

export interface PerformanceSummaryDTO {
  total_trades: number;
  win_count: number;
  loss_count: number;
  breakeven_count: number;
  win_rate: number;
  realized_pnl_total: number;
  avg_pnl_per_trade: number;
  avg_pnl_pct: number;
  gross_profit: number;
  gross_loss: number;
  profit_factor: number | null;
  best_trade_pnl: number | null;
  worst_trade_pnl: number | null;
  return_pct: number | null;
  reference_equity_usdt: number | null;
}

export type PerformancePeriodGranularity = 'day' | 'week' | 'month';

export interface PerformancePeriodItemDTO {
  period_start: string;
  period_label: string;
  trade_count: number;
  win_count: number;
  loss_count: number;
  win_rate: number;
  realized_pnl_sum: number;
  avg_pnl_pct: number | null;
  return_pct: number | null;
  opening_equity_usdt: number | null;
  closing_equity_usdt: number | null;
}

export interface PerformancePeriodsResponse {
  granularity: PerformancePeriodGranularity;
  items: PerformancePeriodItemDTO[];
  count: number;
}
