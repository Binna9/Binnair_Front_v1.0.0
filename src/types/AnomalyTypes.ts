export type AnomalyTimeframe =
  | '1m'
  | '3m'
  | '5m'
  | '15m'
  | '30m'
  | '1h'
  | '4h'
  | '1d'
  | (string & {});

export type AnomalyScoreVersion = string;

export interface AnomalyScoreSeriesRequest {
  venueId: number;
  instrumentId: number;
  from: string; // ISO string
  to: string; // ISO string
  timeframe?: AnomalyTimeframe;
  scoreVersion?: AnomalyScoreVersion;
  windowDays?: number;
}

export interface AnomalyScorePoint {
  ts: string; // ISO string (확정봉 timestamp)
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  score?: number;
  // 다양한 score/z_* 확장을 대비
  [key: string]: unknown;
}

export interface AnomalyScoreSeriesResponse {
  venueId: number;
  instrumentId: number;
  timeframe?: AnomalyTimeframe;
  scoreVersion?: AnomalyScoreVersion;
  windowDays?: number;
  points: AnomalyScorePoint[];
}

export interface AnomalyScoreFinalRequest {
  venueId: number;
  instrumentId: number;
  timeframe?: AnomalyTimeframe;
  scoreVersion?: AnomalyScoreVersion;
  mode?: 'strict' | 'balanced' | 'lenient' | (string & {});
  ts?: string; // 기준 timestamp(선택)
}

export interface AnomalyScoreFinalResponse {
  venueId: number;
  instrumentId: number;
  ts?: string;
  timeframe?: AnomalyTimeframe;
  scoreVersion?: AnomalyScoreVersion;
  mode?: string;
  score?: number;
  grade?: 'ok' | 'warn' | 'error' | (string & {});
  summary?: string;
  detail?: Record<string, unknown>;
}

