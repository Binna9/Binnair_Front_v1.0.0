import axios from 'axios';
import { TRADING_API_BASE_URL } from '@/utils/tradingApiConfig';
import { SignalListResponse } from '@/types/TradingSignalTypes';

export interface SignalQueryParams {
  user_id?: string;
  run_id?: string;
  symbol?: string;
  limit?: number;
}

export const tradingSignalService = {
  // Predictor/Strategy가 기록한 BUY/SELL/HOLD 시그널
  getSignals: async (params: SignalQueryParams = {}): Promise<SignalListResponse> => {
    const response = await axios.get<SignalListResponse>(
      `${TRADING_API_BASE_URL}/api/v1/signals`,
      { params }
    );
    return response.data;
  },
};

export default tradingSignalService;
