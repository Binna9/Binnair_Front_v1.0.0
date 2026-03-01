/**
 * "지금 가장 이상한 종목 Top N" 이상 리스트 관련 타입 정의
 * 서버 API 응답 구조 기반
 */

/**
 * Top N 탭 구분
 */
export type AnomalyScoreTopTab = 'AGG' | 'VOL' | 'RNG' | 'RET';

/**
 * Top N 리스트 아이템
 */
export interface AnomalyScoreTopItem {
  rank: number;
  venueId: number;
  instrumentId: number;
  symbol: string;
  ts: string; // ISO 8601 (OffsetDateTime)
  finalLevel: string;
  finalScore: number | null;
  driver: string;
  /**
   * 탭별 핵심 지표(정렬 키).
   * - AGG: finalScore
   * - VOL: z_vol 기반 합성값
   * - RNG: z_rng 기반 합성값
   * - RET: |z_ret| 기반 합성값
   */
  metricValue: number | null;
  /**
   * Δ = metricValue(now) - metricValue(prev), prev는 deltaBars 봉 전 공통 ts.
   */
  delta: number | null;
  /**
   * RET 탭에서만 사용: UP/DOWN/MIXED/FLAT
   */
  direction?: string;
}

/**
 * Top N 공통 요청 파라미터 (top, topVol, topRng, topRet)
 */
export interface AnomalyScoreTopRequest {
  timeframe?: string;
  mode?: string; // 기본: consensus
  limit?: number; // 기본: 20
  deltaBars?: number; // 기본: 12
}

/**
 * Top N 필터 요청 파라미터 (topVol, topRng, topRet 전용)
 */
export interface AnomalyScoreTopFilterRequest extends AnomalyScoreTopRequest {
  minLevel?: string;
  driver?: string;
  minDeltaAbs?: number;
}

/**
 * "지금 가장 이상한 종목 Top N" 응답 DTO
 */
export interface AnomalyScoreTopResponse {
  timeframe: string;
  mode: string;
  /**
   * 탭 구분.
   * - AGG: 종합 이상(finalScore 기준)
   * - VOL: 거래량 이상(z_vol 기반)
   * - RNG: 변동폭 이상(z_rng 기반)
   * - RET: 급등/급락(z_ret 기반)
   */
  tab: AnomalyScoreTopTab;
  limit: number;
  deltaBars: number;
  /**
   * 대표 ts (현재 구현에서는 1위 아이템의 ts).
   * 각 종목별 최신 공통 ts는 items[].ts 를 참고하세요.
   */
  ts: string; // ISO 8601 (OffsetDateTime)
  items: AnomalyScoreTopItem[];
}
