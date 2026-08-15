/** BinnAIR Monitor API — GET /api/v1/engine-runs, /engine-runs/{run_id} 응답 타입 */

export type EngineRunStatus = 'running' | 'paused' | 'stopped' | 'error';

export interface EngineRunDTO {
  id?: number;
  user_id: string;
  run_id: string;
  strategy_id: string;
  model_version: string;
  feature_set_version: string;
  version: string;
  paper_mode: boolean;
  status: EngineRunStatus;
  started_at: string;
  stopped_at?: string | null;
  config_snapshot?: Record<string, unknown> | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface EngineRunListResponse {
  items: EngineRunDTO[];
  count: number;
}

/** 활성(running) run 우선, 없으면 목록 첫 행 */
export function pickActiveEngineRun(
  items: EngineRunDTO[] | undefined | null
): EngineRunDTO | null {
  if (!items?.length) return null;
  return items.find((r) => r.status === 'running') ?? items[0] ?? null;
}
