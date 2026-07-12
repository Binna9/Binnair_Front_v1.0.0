export type TradingControlTier = 'basic' | 'advanced';

export interface TradingControlSchemaParam {
  key: string;
  tier: TradingControlTier;
  group: string;
  type: string;
  label: string;
  hint?: string;
  options?: string[];
}

export interface TradingControlSchemaResponse {
  params: TradingControlSchemaParam[];
  basic_keys: string[];
  advanced_keys: string[];
  env_only_keys: string[];
}

export interface TradingControlCommandStatus {
  status: 'pending' | 'done' | 'failed';
  command?: string;
  timestamp?: string;
}

export interface TradingControlStatusResponse {
  trading_enabled: boolean;
  config: Record<string, unknown>;
  config_basic: Record<string, unknown>;
  config_advanced: Record<string, unknown>;
  config_version?: number | string;
  recent_commands?: TradingControlCommandStatus[];
}
