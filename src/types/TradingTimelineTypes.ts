/** BinnAIR Monitor API — GET /api/v1/flow/timeline 응답 타입 */

export type FlowEventType =
  | 'inference'
  | 'signal'
  | 'order_request'
  | 'order_execution'
  | 'position'
  | 'audit';

export interface FlowTimelineItemDTO {
  event_type: FlowEventType;
  event_at: string;
  run_id: string;
  symbol?: string | null;
  summary: string;
  correlation_id?: string | null;
  payload: Record<string, unknown>;
}

export interface FlowTimelineListResponse {
  items: FlowTimelineItemDTO[];
  count: number;
}
