import apiClient from '@/utils/apiClient';
import {
  AnomalyScoreFinalRequest,
  AnomalyScoreFinalResponse,
  AnomalyScoreSeriesRequest,
  AnomalyScoreSeriesResponse,
} from '@/types/AnomalyTypes';
import type {
  AnomalyScoreTopRequest,
  AnomalyScoreTopFilterRequest,
  AnomalyScoreTopResponse,
} from '@/types/AnomalyListTypes';

type AnomalyRequestOptions = {
  signal?: AbortSignal;
};

/** 실시간 폴링은 전역 로딩 오버레이에서 제외 */
const POLL_REQUEST = { skipGlobalLoading: true } as const;

/**
 * 이상탐지 REST 서비스.
 * 백엔드 Writer가 Redis 스냅샷을 갱신하며, FE는 기존 REST URL만 폴링한다.
 * POST /anomaly/scores/detect 는 410 Gone — 호출하지 않는다.
 */
export const anomalyService = {
  /**
   * 차트용 시계열 (Redis series 스냅샷)
   */
  getSeries: async (
    request: AnomalyScoreSeriesRequest,
    options?: AnomalyRequestOptions
  ): Promise<AnomalyScoreSeriesResponse> => {
    const { venueId, instrumentId, from, to, timeframe, scoreVersion, windowDays } = request;

    const params: Record<string, string> = {
      from,
      to,
    };

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
        signal: options?.signal,
        ...POLL_REQUEST,
      }
    );

    return response.data;
  },

  /**
   * 최종 평가 배지 (Redis final 스냅샷)
   */
  getFinal: async (
    request: AnomalyScoreFinalRequest,
    options?: AnomalyRequestOptions
  ): Promise<AnomalyScoreFinalResponse> => {
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
      { params, signal: options?.signal, ...POLL_REQUEST }
    );

    return response.data;
  },

  /**
   * 지금 가장 이상한 종목 Top N (종합 이상, finalScore 기준)
   */
  getTop: async (
    request?: AnomalyScoreTopRequest,
    options?: AnomalyRequestOptions
  ): Promise<AnomalyScoreTopResponse> => {
    const params = buildTopParams(request);
    const response = await apiClient.get<AnomalyScoreTopResponse>('/anomaly/scores/top', {
      params,
      signal: options?.signal,
      ...POLL_REQUEST,
    });
    return response.data;
  },

  /**
   * 거래량 이상 Top N (z_vol 기반 정렬)
   */
  getTopVol: async (
    request?: AnomalyScoreTopFilterRequest,
    options?: AnomalyRequestOptions
  ): Promise<AnomalyScoreTopResponse> => {
    const params = buildTopFilterParams(request);
    const response = await apiClient.get<AnomalyScoreTopResponse>('/anomaly/scores/top/vol', {
      params,
      signal: options?.signal,
      ...POLL_REQUEST,
    });
    return response.data;
  },

  /**
   * 변동폭 이상 Top N (z_rng 기반 정렬)
   */
  getTopRng: async (
    request?: AnomalyScoreTopFilterRequest,
    options?: AnomalyRequestOptions
  ): Promise<AnomalyScoreTopResponse> => {
    const params = buildTopFilterParams(request);
    const response = await apiClient.get<AnomalyScoreTopResponse>('/anomaly/scores/top/rng', {
      params,
      signal: options?.signal,
      ...POLL_REQUEST,
    });
    return response.data;
  },

  /**
   * 급등/급락 Top N (|z_ret| 기반 정렬 + direction)
   */
  getTopRet: async (
    request?: AnomalyScoreTopFilterRequest,
    options?: AnomalyRequestOptions
  ): Promise<AnomalyScoreTopResponse> => {
    const params = buildTopFilterParams(request);
    const response = await apiClient.get<AnomalyScoreTopResponse>('/anomaly/scores/top/ret', {
      params,
      signal: options?.signal,
      ...POLL_REQUEST,
    });
    return response.data;
  },
};

function buildTopParams(request?: AnomalyScoreTopRequest): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  if (request?.timeframe) params.timeframe = request.timeframe;
  if (request?.mode) params.mode = request.mode;
  if (request?.limit != null) params.limit = request.limit;
  if (request?.deltaBars != null) params.deltaBars = request.deltaBars;
  return params;
}

function buildTopFilterParams(
  request?: AnomalyScoreTopFilterRequest
): Record<string, string | number> {
  const params = buildTopParams(request);
  if (request?.minLevel) params.minLevel = request.minLevel;
  if (request?.driver) params.driver = request.driver;
  if (request?.minDeltaAbs != null) params.minDeltaAbs = request.minDeltaAbs;
  return params;
}

export default anomalyService;
