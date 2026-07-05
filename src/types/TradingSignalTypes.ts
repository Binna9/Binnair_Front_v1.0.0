/** BinnAIR Monitor API — GET /api/v1/signals 응답 타입 */

export interface SignalEventDTO {
  id?: number;
  user_id: string;
  run_id: string;
  strategy_id: string;
  symbol: string;
  signal_action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  price_hint?: number | null;
  correlation_id: string;
  paper_mode: boolean;
  event_at: string;
  timeframe?: string | null;
  model_version?: string | null;
  created_at?: string | null;
}

export interface SignalListResponse {
  items: SignalEventDTO[];
  count: number;
}
