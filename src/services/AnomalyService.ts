import apiClient from '@/utils/apiClient';
import {
  AnomalyScoreFinalRequest,
  AnomalyScoreFinalResponse,
  AnomalyScoreSeriesRequest,
  AnomalyScoreSeriesResponse,
} from '@/types/AnomalyTypes';

/**
 * 이상탐지 관련 서비스
 */
export const anomalyService = {
  /**
   * 차트용 시계열 조회 API
   * `core.candles`의 OHLCV(확정봉) + 동일 `ts`의 `core.anomaly_scores`(score/z_*)를 합쳐서 한 배열(`points`)로 내려줍니다.
   * 
   * @param request - 요청 파라미터
   * @returns 이상탐지 점수 시계열 응답
   * 
   * @example
   * ```typescript
   * const response = await anomalyService.getSeries({
   *   venueId: 1,
   *   instrumentId: 100,
   *   from: '2026-02-06T00:00:00Z',
   *   to: '2026-02-06T23:59:59Z',
   *   timeframe: '5m',
   *   scoreVersion: 'z_v1'
   * });
   * ```
   */
  getSeries: async (
    request: AnomalyScoreSeriesRequest
  ): Promise<AnomalyScoreSeriesResponse> => {
    const { venueId, instrumentId, from, to, timeframe, scoreVersion, windowDays } = request;

    const params: Record<string, string> = {
      from,
      to,
    };

    // 선택적 파라미터 추가
    if (timeframe) {
      params.timeframe = timeframe;
    }
    if (scoreVersion) {
      params.scoreVersion = scoreVersion;
    }
    if (windowDays !== undefined && windowDays !== null) {
      params.windowDays = String(windowDays);
    }

    const response = await apiClient.get<AnomalyScoreSeriesResponse>(
      `/anomaly/scores/${venueId}/${instrumentId}/series`,
      {
        params,
      }
    );

    return response.data;
  },

  /**
   * 최종 평가 API
   * windowDays 30/60/90에 대한 데이터를 종합하여 최종 평가를 수행합니다.
   *
   * @param request - 요청 파라미터
   * @returns 최종 평가 응답
   */
  getFinal: async (request: AnomalyScoreFinalRequest): Promise<AnomalyScoreFinalResponse> => {
    const { venueId, instrumentId, timeframe, scoreVersion, mode, ts } = request;

    const params: Record<string, string> = {};

    if (timeframe) {
      params.timeframe = timeframe;
    }
    if (scoreVersion) {
      params.scoreVersion = scoreVersion;
    }
    if (mode) {
      params.mode = mode;
    }
    if (ts) {
      params.ts = ts;
    }

    const response = await apiClient.get<AnomalyScoreFinalResponse>(
      `/anomaly/scores/${venueId}/${instrumentId}/final`,
      { params }
    );

    return response.data;
  },
};

export default anomalyService;

