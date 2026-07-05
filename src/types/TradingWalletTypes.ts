/** BinnAIR Monitor API — GET /api/v1/account/wallet 응답 타입 */

export interface WalletBalanceDTO {
  asset: string;
  balance: number;
  cross_wallet_balance: number;
  available_balance: number;
  max_withdraw_amount: number;
}

export interface WalletAccountDTO {
  total_wallet_balance: number;
  total_unrealized_profit: number;
  total_margin_balance: number;
  available_balance: number;
  max_withdraw_amount: number;
  can_trade: boolean;
  can_deposit: boolean;
  can_withdraw: boolean;
}

export interface WalletSizingResultDTO {
  quantity: number;
  notional_usdt: number;
  reason: string;
  is_valid: boolean;
}

export interface WalletEngineDiagnosticsDTO {
  available_balance: number;
  effective_equity: number;
  equity_source: string;
  sizing_result: WalletSizingResultDTO;
  can_create_order: boolean;
  sample_sizing_price: number;
}

/**
 * 거래소(testnet) 선물 포지션 — 백엔드가 Binance Futures `/fapi/v2/positionRisk`를
 * 그때그때 실시간 조회해 정규화한 값 (positionAmt != 0 인 것만 포함).
 */
export interface WalletPositionDTO {
  symbol: string;
  position_side?: string | null;
  position_amt: number;
  entry_price: number;
  unrealized_profit: number;
  leverage: number;
  margin_type?: string | null;
}

export interface AccountWalletResponse {
  ok: boolean;
  paper_mode: boolean;
  market_type?: string;
  quote_asset?: string;
  base_url: string;
  balances: WalletBalanceDTO[];
  account: WalletAccountDTO;
  positions: WalletPositionDTO[];
  engine_diagnostics: WalletEngineDiagnosticsDTO;
  error?: string | null;
}
