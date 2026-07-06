/**
 * BinnAIR Monitor/Live API (읽기 전용, 인증 없음) 접속 정보.
 * 운영 환경에서는 trading-api가 호스트 루프백(127.0.0.1:8001)에만 바인딩되어 있어
 * 브라우저가 직접 접근할 수 없다 — nginx의 `/trading/` 리버스 프록시(→ 127.0.0.1:8001)를
 * 거치도록 같은 origin의 상대 경로를 기본값으로 사용한다.
 */
export const TRADING_API_BASE_URL =
  import.meta.env.VITE_TRADING_API_BASE_URL || '/trading';

export const TRADING_WS_URL =
  import.meta.env.VITE_TRADING_WS_URL ||
  (() => {
    if (/^https?:/.test(TRADING_API_BASE_URL)) {
      return `${TRADING_API_BASE_URL.replace(/^http/, 'ws')}/ws/v1/live`;
    }
    // 상대 경로인 경우 WebSocket 생성자에 절대 URL이 필요하므로 현재 origin 기준으로 조립
    const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    return `${wsProtocol}://${window.location.host}${TRADING_API_BASE_URL}/ws/v1/live`;
  })();
