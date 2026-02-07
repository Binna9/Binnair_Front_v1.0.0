/**
 * 타임프레임 관련 유틸리티 함수
 */

/**
 * 타임프레임 문자열을 초 단위로 변환
 * @param timeframe 타임프레임 문자열 (예: '1m', '5m', '1h', '1d')
 * @returns 초 단위 값
 */
export function timeframeToSeconds(timeframe: string): number {
  const unit = timeframe.slice(-1); // 마지막 문자 (m, h, d)
  const value = parseInt(timeframe.slice(0, -1), 10); // 숫자 부분

  switch (unit) {
    case 'm': // 분
      return value * 60;
    case 'h': // 시간
      return value * 3600;
    case 'd': // 일
      return value * 86400;
    default:
      throw new Error(`Unknown timeframe unit: ${unit}`);
  }
}

/**
 * 현재 시간을 기준으로 다음 봉의 시작 시간 계산
 * @param timeframe 타임프레임 문자열 (예: '5m', '1h')
 * @param baseTime 기준 시간 (기본값: 현재 시간)
 * @returns 다음 봉 시작 시간 (Date 객체)
 */
export function getNextCandleStartTime(
  timeframe: string,
  baseTime: Date = new Date()
): Date {
  const seconds = timeframeToSeconds(timeframe);
  const baseTimestamp = baseTime.getTime();
  
  // UTC 기준으로 변환
  const baseUTC = new Date(baseTime.toISOString());
  const baseUTCTimestamp = baseUTC.getTime();
  
  // 봉 시작 시간 계산 (UTC 기준)
  // 예: 5분봉이면 00:00, 00:05, 00:10, ... 에 시작
  const candleStartTimestamp =
    Math.floor(baseUTCTimestamp / (seconds * 1000)) * (seconds * 1000);
  
  // 다음 봉 시작 시간
  const nextCandleStartTimestamp = candleStartTimestamp + seconds * 1000;
  
  return new Date(nextCandleStartTimestamp);
}

/**
 * 현재 시간부터 다음 봉 시작까지 남은 시간(밀리초) 계산
 * @param timeframe 타임프레임 문자열
 * @param baseTime 기준 시간 (기본값: 현재 시간)
 * @returns 남은 시간(밀리초)
 */
export function getTimeUntilNextCandle(
  timeframe: string,
  baseTime: Date = new Date()
): number {
  const nextCandleStart = getNextCandleStartTime(timeframe, baseTime);
  return nextCandleStart.getTime() - baseTime.getTime();
}

/**
 * ISO 8601 날짜 문자열을 Date 객체로 변환
 * @param isoString ISO 8601 형식 문자열
 * @returns Date 객체
 */
export function parseISO8601(isoString: string): Date {
  return new Date(isoString);
}

/**
 * Date 객체를 ISO 8601 형식 문자열로 변환 (UTC)
 * @param date Date 객체
 * @returns ISO 8601 형식 문자열 (예: '2026-02-06T00:00:00Z')
 */
export function toISO8601UTC(date: Date): string {
  return date.toISOString();
}

/**
 * 현재 시간을 기준으로 과거 N일 전 시간 계산
 * @param days 일 수
 * @returns Date 객체
 */
export function getPastDate(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * 현재 시간을 기준으로 과거 N일 전 시간을 ISO 8601 형식으로 반환
 * @param days 일 수
 * @returns ISO 8601 형식 문자열
 */
export function getPastDateISO(days: number): string {
  return toISO8601UTC(getPastDate(days));
}

/**
 * 현재 시간을 ISO 8601 형식으로 반환
 * @returns ISO 8601 형식 문자열
 */
export function getCurrentTimeISO(): string {
  return toISO8601UTC(new Date());
}

