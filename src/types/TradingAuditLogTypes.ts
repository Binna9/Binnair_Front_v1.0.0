/** BinnAIR Monitor API — GET /api/v1/audit-logs 응답 타입 */

export interface AuditLogDTO {
  id?: number;
  user_id: string;
  run_id: string;
  correlation_id: string;
  event: string;
  data: Record<string, unknown>;
  paper_mode: boolean;
  created_at?: string | null;
}

export interface AuditLogListResponse {
  items: AuditLogDTO[];
  count: number;
}
