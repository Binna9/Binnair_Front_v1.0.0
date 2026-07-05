import axios from 'axios';
import { TRADING_API_BASE_URL } from '@/utils/tradingApiConfig';
import { EngineRunDTO, EngineRunListResponse, EngineRunStatus } from '@/types/TradingEngineRunTypes';

export interface EngineRunListParams {
  user_id?: string;
  status?: EngineRunStatus;
  limit?: number;
}

export const tradingEngineRunService = {
  getEngineRuns: async (
    params: EngineRunListParams = {}
  ): Promise<EngineRunListResponse> => {
    const response = await axios.get<EngineRunListResponse>(
      `${TRADING_API_BASE_URL}/api/v1/engine-runs`,
      { params }
    );
    return response.data;
  },

  getEngineRun: async (runId: string, userId = 'default'): Promise<EngineRunDTO> => {
    const response = await axios.get<EngineRunDTO>(
      `${TRADING_API_BASE_URL}/api/v1/engine-runs/${runId}`,
      { params: { user_id: userId } }
    );
    return response.data;
  },
};

export default tradingEngineRunService;
