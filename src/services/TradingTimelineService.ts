import tradingApiClient from '@/utils/tradingApiClient';
import { FlowTimelineListResponse } from '@/types/TradingTimelineTypes';

export interface TimelineQueryParams {
  user_id?: string;
  run_id?: string;
  symbol?: string;
  limit?: number;
}

export const tradingTimelineService = {
  getTimeline: async (
    params: TimelineQueryParams = {}
  ): Promise<FlowTimelineListResponse> => {
    const response = await tradingApiClient.get<FlowTimelineListResponse>(
      `/api/v1/flow/timeline`,
      { params }
    );
    return response.data;
  },
};

export default tradingTimelineService;
