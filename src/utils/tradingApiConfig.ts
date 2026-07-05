/** BinnAIR Monitor/Live API (읽기 전용, 인증 없음) 접속 정보 — config.yaml api.host/api.port 기본값 */
export const TRADING_API_BASE_URL =
  import.meta.env.VITE_TRADING_API_BASE_URL || 'http://127.0.0.1:8000';

export const TRADING_WS_URL =
  import.meta.env.VITE_TRADING_WS_URL ||
  `${TRADING_API_BASE_URL.replace(/^http/, 'ws')}/ws/v1/live`;
