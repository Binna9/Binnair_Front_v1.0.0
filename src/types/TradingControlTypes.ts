export type TradingControlTier = 'basic' | 'advanced';

export interface TradingControlSchemaParam {
  key: string;
  tier: TradingControlTier;
  group: string;
  type: string;
  label: string;
  hint?: string;
  options?: string[];
  min?: number;
  max?: number;
  example?: string;
  /** 폼 값과 일치할 때만 표시 (예: { predictor_type: "fincast" }) */
  visible_when?: Record<string, string>;
}

export interface TradingControlSchemaGroup {
  id: string;
  label: string;
  visible_when?: Record<string, string>;
}

export interface TradingControlSchemaResponse {
  params: TradingControlSchemaParam[];
  groups?: TradingControlSchemaGroup[];
  basic_keys: string[];
  advanced_keys: string[];
  env_only_keys: string[];
}

export interface TradingControlCommandStatus {
  status: 'pending' | 'done' | 'failed';
  command?: string;
  timestamp?: string;
}

export interface TradingControlEngineRun {
  status?: 'running' | 'paused' | 'stopped' | 'error' | string;
  run_id?: string;
}

export interface TradingControlStatusResponse {
  trading_enabled: boolean;
  config: Record<string, unknown>;
  config_basic: Record<string, unknown>;
  config_advanced: Record<string, unknown>;
  config_version?: number | string;
  recent_commands?: TradingControlCommandStatus[];
  engine_run?: TradingControlEngineRun;
}
