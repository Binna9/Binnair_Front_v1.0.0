import axios from 'axios';
import { TRADING_API_BASE_URL } from '@/utils/tradingApiConfig';
import { FlowTimelineListResponse } from '@/types/TradingTimelineTypes';

export interface TimelineQueryParams {
  user_id?: string;
  run_id?: string;
  symbol?: string;
  limit?: number;
}

export const tradingTimelineService = {
  // 추론 → 시그널 → 주문 → 체결 → 포지션 → 감사 로그 통합 타임라인
  getTimeline: async (
    params: TimelineQueryParams = {}
  ): Promise<FlowTimelineListResponse> => {
    const response = await axios.get<FlowTimelineListResponse>(
      `${TRADING_API_BASE_URL}/api/v1/flow/timeline`,
      { params }
    );
    return response.data;
  },
};

export default tradingTimelineService;
