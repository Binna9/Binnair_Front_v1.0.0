/**
 * BinnAIR Monitor/Live/Control API 접속 정보.
 *
 * - 개발: `.env.development` 의 VITE_TRADING_API_BASE_URL (권장: `/trading`)
 *         → Vite가 VITE_TRADING_API_TARGET 으로 프록시
 * - 운영: 보통 .env 없음 → 기본값 `/trading`
 *         → 호스트 nginx `/trading/` → 루프백 FastAPI
 *
 * 절대 URL(http://...)을 넣으면 프록시를 우회하고 그 주소로 직접 호출한다.
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
