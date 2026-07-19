/** Redis Writer 스냅샷 기반 anomaly 실시간 REST 공통 상수/헬퍼 */

/** series / final / top 권장 폴링 주기 (1~3초) */
export const ANOMALY_POLL_INTERVAL_MS = 2000;

/**
 * Writer가 Redis에 올리는 score timeframe (anomaly.score.timeframe).
 * UI에서 선택하지 않음 — 서버 스냅샷 키와 동일해야 함.
 */
export const ANOMALY_SCORE_TIMEFRAME = '5m';

/** Writer series retention(기본 30일)에 맞춘 FE 조회 구간 */
export const ANOMALY_SERIES_LOOKBACK_DAYS = 30;

/** 서버 워밍업(Writer 미준비) 에러 코드 */
export const ANOMALY_NOT_READY_CODE = 'error.anomaly.realtime.not_ready';

/** 응답 ts가 이 시간 이상 동일하면 "실시간 지연"으로 표시 */
export const ANOMALY_STALE_THRESHOLD_MS = 30_000;

export const ANOMALY_WARMING_MESSAGE = '시세 준비 중';

function readErrorPayload(error: unknown): Record<string, unknown> | null {
  if (!error || typeof error !== 'object') return null;
  const response = (error as { response?: { data?: unknown } }).response;
  const data = response?.data;
  if (!data || typeof data !== 'object') return null;
  return data as Record<string, unknown>;
}

/** 응답 body에서 anomaly 에러 코드 추출 */
export function getAnomalyErrorCode(error: unknown): string | null {
  const data = readErrorPayload(error);
  if (!data) return null;

  const candidates = [data.error, data.code, data.message, data.msg];
  for (const c of candidates) {
    if (typeof c === 'string' && c.includes('anomaly.realtime')) {
      return c;
    }
  }

  const nested = data.error;
  if (nested && typeof nested === 'object') {
    const code = (nested as { code?: unknown }).code;
    if (typeof code === 'string') return code;
  }

  return typeof data.error === 'string' ? data.error : null;
}

export function getAnomalyHttpStatus(error: unknown): number | null {
  if (!error || typeof error !== 'object') return null;
  const status = (error as { response?: { status?: number } }).response?.status;
  return typeof status === 'number' ? status : null;
}

/** HTTP 503 + error.anomaly.realtime.not_ready */
export function isAnomalyNotReady(error: unknown): boolean {
  const status = getAnomalyHttpStatus(error);
  if (status !== 503) return false;
  const code = getAnomalyErrorCode(error);
  if (code === ANOMALY_NOT_READY_CODE) return true;
  // code 필드가 없는 503도 Writer 워밍업으로 간주 (anomaly 경로에서만 호출)
  return code == null || String(code).includes('not_ready');
}

export function isAnomalyRequestUrl(url: unknown): boolean {
  return typeof url === 'string' && url.includes('/anomaly');
}

export function getAnomalyErrorMessage(error: unknown): string {
  if (isAnomalyNotReady(error)) return ANOMALY_WARMING_MESSAGE;

  const data = readErrorPayload(error);
  if (data) {
    if (typeof data.message === 'string' && data.message.trim()) return data.message;
    if (typeof data.error === 'string' && data.error.trim()) return data.error;
    if (typeof data.msg === 'string' && data.msg.trim()) return data.msg;
  }

  if (error instanceof Error && error.message) return error.message;
  return '데이터를 불러오는데 실패했습니다.';
}

/** 서버 ts가 threshold 이상 변하지 않으면 stale */
export function isAnomalyTsStale(
  serverTs: string | null | undefined,
  firstSeenAtMs: number | null,
  nowMs = Date.now(),
  thresholdMs = ANOMALY_STALE_THRESHOLD_MS
): boolean {
  if (!serverTs || firstSeenAtMs == null) return false;
  return nowMs - firstSeenAtMs >= thresholdMs;
}
