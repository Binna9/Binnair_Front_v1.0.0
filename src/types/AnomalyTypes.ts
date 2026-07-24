/**
 * 이상탐지 차트 시각화 관련 TypeScript 타입 정의
 * 서버 API 응답 구조 기반
 */

// ============================================================================
// 서버 API 응답 타입
// ============================================================================

/**
 * 서버에서 제공하는 이상탐지 점수 시계열 응답
 * 단일 자산(venueId/instrumentId)의 캔들(OHLCV) + 이상점수(score/z_*) 시계열 응답
 * 차트에서 동일 ts 축으로 가격/거래량/score를 함께 그리기 위한 포맷
 */
export interface AnomalyScoreSeriesResponse {
  meta: AnomalyScoreMeta;
  summary: AnomalyScoreSummary;
  points: AnomalyScorePoint[];
}

/**
 * Anomaly Score 최종 평가 API 응답
 * windowDays 30/60/90 결과를 종합한 최종 평가 결과
 */
export interface AnomalyScoreFinalResponse {
  ts: string | null; // ISO 8601 (OffsetDateTime)
  mode: string; // 예: 'consensus'
  finalScore: number | null;
  finalLevel: string | null;
  basis: string | null;
  components: AnomalyScoreFinalComponent[];
}

/**
 * 최종 평가 - 각 windowDays별 컴포넌트
 */
export interface AnomalyScoreFinalComponent {
  windowDays: number;
  score: number | null;
  driver: string | null;
  zRet: number | null;
  zVol: number | null;
  zRng: number | null;
}

/**
 * 메타데이터
 */
export interface AnomalyScoreMeta {
  venueId: number;
  venueCode: string;
  instrumentId: number;
  instrumentSymbol: string;
  venueSymbol: string;
  timeframe: string;
  scoreVersion: string;
  windowDays: number[]; // 예: [30, 60, 90]
  from: string; // ISO 8601 (OffsetDateTime)
  to: string; // ISO 8601 (OffsetDateTime)
  serverTime: string; // ISO 8601 (OffsetDateTime)
  count: number;
}

/**
 * 요약 정보
 */
export interface AnomalyScoreSummary {
  latestTs: string | null; // ISO 8601 (OffsetDateTime)
  latestScores: Record<string, number | null> | null; // key: windowDays (예: '30')
  maxScores: Record<string, number | null> | null; // key: windowDays (예: '30')
  maxScoreTs: Record<string, string | null> | null; // key: windowDays (예: '30'), value: ISO 8601
}

/**
 * 시계열 데이터 포인트 (서버 응답 원본)
 * 캔들 OHLCV + 이상점수 정보
 */
export interface AnomalyScorePoint {
  ts: string; // ISO 8601 (OffsetDateTime) - 캔들 시작 시각
  o: number; // Open (시가)
  h: number; // High (고가)
  l: number; // Low (저가)
  c: number; // Close (종가)
  v: number; // Volume (거래량)
  scores: Record<string, number | null> | null; // key: windowDays (예: '30')
  drivers: Record<string, string | null> | null; // key: windowDays (예: '30')
  z: Record<string, AnomalyScoreZ | null> | null; // key: windowDays (예: '30')
}

/**
 * windowDays별 z-score 묶음
 */
export interface AnomalyScoreZ {
  ret: number | null;
  vol: number | null;
  rng: number | null;
}

// ============================================================================
// 차트 시각화용 타입
// ============================================================================

/**
 * 이상치 심각도
 */
export type AnomalySeverity = 'none' | 'low' | 'medium' | 'high';

/**
 * 이상치 판단 기준 (Threshold)
 */
export interface AnomalyThreshold {
  score: number; // 이상 점수 기준값
  zRet?: number; // 수익률 z-score 기준값 (선택)
  zVol?: number; // 거래량 z-score 기준값 (선택)
  zRng?: number; // 변동폭 z-score 기준값 (선택)
}

/**
 * 차트용 데이터 포인트 (Recharts 호환)
 * AnomalyScorePoint를 차트 렌더링에 최적화된 형태로 변환
 */
export interface ChartDataPoint {
  // 시각 정보 (x축용)
  ts: string; // ISO 8601 원본
  timestamp: number; // Date.getTime() 변환용 (Recharts x축)
  date: Date; // Date 객체 (필요시 사용)
  
  // 캔들 데이터 (OHLCV)
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  
  // 이상점수 데이터
  score: number | null;
  zRet: number | null;
  zVol: number | null;
  zRng: number | null;
  driver: string | null;
  
  // 이상치 판단 (threshold 기반)
  isAnomaly: boolean; // 이상치 여부
  anomalySeverity: AnomalySeverity; // 이상치 심각도
}

/**
 * 차트 시각화 설정
 */
export interface AnomalyChartConfig {
  // 표시할 데이터 시리즈
  showPrice: boolean; // 가격 차트 표시
  showVolume: boolean; // 거래량 차트 표시
  showScore: boolean; // 이상점수 차트 표시
  showZRet: boolean; // 수익률 z-score 차트 표시
  showZVol: boolean; // 거래량 z-score 차트 표시
  showZRng: boolean; // 변동폭 z-score 차트 표시
  
  // 이상치 표시
  showAnomalyMarkers: boolean; // 이상치 마커 표시 여부
  anomalyThreshold: AnomalyThreshold; // 이상치 판단 기준
  
  // 차트 타입 설정
  priceChartType: 'candlestick' | 'line' | 'area'; // 가격 차트 타입
  volumeChartType: 'bar' | 'area'; // 거래량 차트 타입
  scoreChartType: 'line' | 'area'; // 점수 차트 타입
  
  // 색상 설정
  colors: {
    priceUp: string; // 상승 캔들/라인 색상
    priceDown: string; // 하락 캔들/라인 색상
    volume: string; // 거래량 색상
    score: string; // 이상점수 색상
    zRet: string; // 수익률 z-score 색상
    zVol: string; // 거래량 z-score 색상
    zRng: string; // 변동폭 z-score 색상
    anomaly: string; // 이상치 마커 색상
    anomalyLow: string; // 낮은 이상치 색상
    anomalyMedium: string; // 중간 이상치 색상
    anomalyHigh: string; // 높은 이상치 색상
  };
}

/**
 * 차트 통계 정보
 */
export interface AnomalyChartStats {
  totalPoints: number; // 전체 데이터 포인트 수
  anomalyCount: number; // 이상치 개수
  maxScore: number | null; // 최대 이상 점수
  minScore: number | null; // 최소 이상 점수
  avgScore: number | null; // 평균 이상 점수
  maxPrice: number; // 최대 가격
  minPrice: number; // 최소 가격
  maxVolume: number; // 최대 거래량
  minVolume: number; // 최소 거래량
}

/**
 * 이상탐지 차트 데이터 (완전한 시각화 데이터 구조)
 */
export interface AnomalyChartData {
  // 메타데이터
  meta: AnomalyScoreMeta;
  summary: AnomalyScoreSummary;
  
  // 차트 데이터 포인트 (변환된 형태)
  chartPoints: ChartDataPoint[];
  
  // 통계 정보
  stats: AnomalyChartStats;
  
  // 설정
  config: AnomalyChartConfig;
}

// ============================================================================
// API Request 타입
// ============================================================================

/**
 * 이상탐지 점수 시계열 요청 파라미터
 * Path Parameters: venueId, instrumentId
 * Query Parameters: from, to (필수), timeframe, scoreVersion (선택)
 */
export interface AnomalyScoreSeriesRequest {
  venueId: number; // Path Parameter
  instrumentId: number; // Path Parameter
  from: string; // ISO 8601 (OffsetDateTime) - 필수, 예: '2026-02-06T00:00:00Z' 또는 '2026-02-06T00:00:00+09:00'
  to: string; // ISO 8601 (OffsetDateTime) - 필수, 예: '2026-02-06T23:59:59Z' 또는 '2026-02-06T23:59:59+09:00'
  timeframe?: string; // 타임프레임 (선택), 예: '5m', '1h', '1d'
  scoreVersion?: string; // 점수 버전 (선택), 예: 'z_v1', 'ewmz_v1'
  windowDays?: number; // windowDays (선택), 예: 30, 60, 90
}

/**
 * 최종 평가 요청 파라미터
 * Path Parameters: venueId, instrumentId
 * Query Parameters: timeframe, scoreVersion, ts (모두 선택)
 * mode는 서버 consensus 고정 — FE에서 전달하지 않음
 */
export type AnomalyScoreFinalMode = 'consensus';

export interface AnomalyScoreFinalRequest {
  venueId: number; // Path Parameter
  instrumentId: number; // Path Parameter
  timeframe?: string; // 캔들 주기 (기본: '5m')
  scoreVersion?: string; // 점수 버전 (기본: 'z_v1')
  /** @deprecated 서버 consensus 고정. 전달하지 않음 */
  mode?: AnomalyScoreFinalMode;
  ts?: string; // ISO 8601 (OffsetDateTime) - optional, 없으면 최신 공통 ts 사용
}

// ============================================================================
// 유틸리티 타입
// ============================================================================

/**
 * 차트 데이터 변환 옵션
 */
export interface ChartDataTransformOptions {
  threshold?: AnomalyThreshold; // 이상치 판단 기준 (기본값 사용 시 생략 가능)
  timezone?: string; // 타임존 (기본값: 'UTC')
}

// ============================================================================
// 화면 렌더링(차트/툴팁/카드/마커)용 "정규화" 타입
// - Series(A): 차트 데이터셋(캔들/거래량/score 라인 3개/밴드/툴팁 원본)
// - Final(B): 현재 상태 카드 + (선택) 현재시각 마커
// ============================================================================

/**
 * 화면에서 고정적으로 다루는 windowDays 집합.
 * 서버 JSON의 key는 "30"/"60"/"90" 문자열이므로, 프론트에서 number로 normalize 후 사용.
 */
export type AnomalyWindowDays = 30 | 60 | 90;

export const ANOMALY_WINDOW_DAYS: readonly AnomalyWindowDays[] = [30, 60, 90] as const;

/**
 * driver(원인) 키 (프론트에서는 대/소문자 차이를 제거해 소문자로 통일)
 * - Series(A): 보통 "ret"/"vol"/"rng"
 * - Final(B): 보통 "RET"/"VOL"/"RNG"
 */
export type AnomalyDriverKey = 'ret' | 'vol' | 'rng';

export type AnomalyZLabel = 'zRet' | 'zVol' | 'zRng';

/**
 * Score threshold band
 * - WATCH=2, ANOMALY=3, SEVERE=5
 */
export interface AnomalyScoreBands {
  watch: number;
  anomaly: number;
  severe: number;
}

export const DEFAULT_ANOMALY_SCORE_BANDS: AnomalyScoreBands = {
  watch: 2,
  anomaly: 3,
  severe: 5,
};

/**
 * Series(A) 정규화된 1개 시점 데이터(차트 단일 x축 t로 통합)
 * - 누락/NULL은 차트에서 "끊김" 처리 가능하도록 null 유지
 */
export interface AnomalySeriesChartPoint {
  // 원본/축
  ts: string; // ISO 8601 (+09:00 포함 가능)
  t: number; // epoch ms (Date.parse(ts))

  // 캔들/거래량
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;

  // windowDays별 값(키는 number로 normalize)
  scores: Partial<Record<AnomalyWindowDays, number | null>>;
  drivers: Partial<Record<AnomalyWindowDays, AnomalyDriverKey | null>>;
  z: Partial<Record<AnomalyWindowDays, AnomalyScoreZ | null>>;
}

export interface AnomalyCandlePoint {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
}

export interface AnomalyVolumePoint {
  t: number;
  v: number;
}

export interface AnomalyScoreLinePoint {
  t: number;
  y: number | null;
}

/**
 * Series(A) -> 차트 데이터셋
 * - points는 t 오름차순 정렬 보장(서버가 보장해도 프론트에서 1회 정렬)
 */
export interface AnomalySeriesDataset {
  meta: AnomalyScoreMeta;
  summary: AnomalyScoreSummary;
  points: AnomalySeriesChartPoint[];

  // 차트용 파생 시리즈(선택적으로 사용)
  candles: AnomalyCandlePoint[];
  volumes: AnomalyVolumePoint[];
  scoreLines: Record<AnomalyWindowDays, AnomalyScoreLinePoint[]>;

  // score 기준 밴드
  scoreBands: AnomalyScoreBands;

  // 기본 표시(추천): 90만 ON
  defaultVisibleWindows: Record<AnomalyWindowDays, boolean>;

  // 마커 렌더링/범위 체크용
  extent: { tMin: number; tMax: number } | null;
}

/**
 * 툴팁: hover 시점(t/ts)의 windowDays별 요약(Driver 중심)
 * 예: 30d: 1.81 (ret, zRet=-1.81)
 */
export interface AnomalyTooltipWindowRow {
  windowDays: AnomalyWindowDays;
  score: number | null;
  driver: AnomalyDriverKey | null;
  zLabel: AnomalyZLabel | null;
  zValue: number | null;
}

export interface AnomalyTooltipVM {
  ts: string;
  t: number;
  rows: AnomalyTooltipWindowRow[]; // 30/60/90 순서 권장
}

/**
 * Final(B) 카드: components를 30/60/90 행으로 표시
 * - score + driver + (driver에 해당하는 z값만)
 */
export interface AnomalyFinalComponentRowVM {
  windowDays: AnomalyWindowDays;
  score: number | null;
  driver: AnomalyDriverKey | null;

  // Final(B)는 component에 zRet/zVol/zRng가 이미 포함되므로 화면에서 전부 표시 가능
  zRet: number | null;
  zVol: number | null;
  zRng: number | null;
}

export interface AnomalyFinalCardVM {
  ts: string | null; // ISO 8601
  t: number | null; // epoch ms
  mode: string;
  finalScore: number | null;
  finalLevel: string | null;
  basis: string | null;
  rows: AnomalyFinalComponentRowVM[]; // 30/60/90 정렬 권장
}

/**
 * Final(B) 차트 마커(선택)
 * - final.ts가 series 범위 밖이면 inRange=false로 처리(권장: 미표시)
 */
export interface AnomalyFinalMarkerVM {
  ts: string;
  t: number;
  inRange: boolean;
}

/**
 * 화면에서 바로 쓰는 통합 ViewModel
 * - 렌더링 순서: series -> 차트, final -> 카드(+마커)
 */
export interface AnomalyScreenVM {
  series: AnomalySeriesDataset;
  final: {
    card: AnomalyFinalCardVM;
    marker: AnomalyFinalMarkerVM | null;
  } | null;
}

