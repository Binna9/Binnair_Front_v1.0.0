import tradingApiClient from '@/utils/tradingApiClient';
import { SignalListResponse } from '@/types/TradingSignalTypes';

export interface SignalQueryParams {
  user_id?: string;
  run_id?: string;
  symbol?: string;
  limit?: number;
}

export const tradingSignalService = {
  getSignals: async (params: SignalQueryParams = {}): Promise<SignalListResponse> => {
    const response = await tradingApiClient.get<SignalListResponse>(`/api/v1/signals`, {
      params,
    });
    return response.data;
  },
};

export default tradingSignalService;
