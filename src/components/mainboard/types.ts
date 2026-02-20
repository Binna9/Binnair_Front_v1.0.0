export type StatusLevel = 'ok' | 'warn' | 'error';

export interface TodayRuns {
  total: number;
  success: number;
  fail: number;
  retries: number;
  avgDurationSec: number;
  slaBreaches: number;
}

export interface KpiLevels {
  successRate: StatusLevel;
  failures: StatusLevel;
  slaBreaches: StatusLevel;
  latestData: StatusLevel;
  avgDuration: StatusLevel;
  retries: StatusLevel;
}

export interface SystemNode {
  id: string;
  name: string;
  level: StatusLevel;
  x: number;
  y: number;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  lastLoadedAt: Date;
  rowCount: number;
  flowRunId: string;
}

export interface FailureItem {
  id: string;
  name: string;
  level: StatusLevel;
  startAt: Date;
  endAt: Date;
  reason: string;
}

export interface DelayItem {
  id: string;
  name: string;
  level: StatusLevel;
  expectedMin: number;
  actualMin: number;
  reason: string;
}

export interface FreshnessItem {
  table: string;
  lastLoadedAt: Date;
  delayMin: number;
  rowCount: number;
  level: StatusLevel;
}

export interface ExecutionTrendPoint {
  label: string; // e.g. "13:00"
  success: number;
  fail: number;
  retry: number;
}

export interface ChangeItem {
  id: string;
  at: Date;
  target: string;
  type: string;
  by: string;
  summary: string;
}

export interface ImpactItem {
  id: string;
  name: string;
  dependents: number;
  reports: number;
  lastChangeAt: Date;
}

export interface MainboardModel {
  now: Date;
  todayRuns: TodayRuns;

  latestPrimary: Date;
  latestPrimaryLabel: string;

  successRate: number; // 0~1
  kpiLevels: KpiLevels;

  systemNodes: SystemNode[];
  flows: FlowEdge[];

  failuresTop: FailureItem[];
  delaysTop: DelayItem[];

  freshness: FreshnessItem[];
  executionTrend: ExecutionTrendPoint[];

  recentChanges: ChangeItem[];
  impactTop: ImpactItem[];
}

