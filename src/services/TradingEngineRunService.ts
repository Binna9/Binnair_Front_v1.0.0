import tradingApiClient from '@/utils/tradingApiClient';
import { EngineRunDTO, EngineRunListResponse, EngineRunStatus } from '@/types/TradingEngineRunTypes';

export interface EngineRunListParams {
  user_id?: string;
  status?: EngineRunStatus;
  limit?: number;
}

export const tradingEngineRunService = {
  /** 폴링용 — 전역 오버레이 생략 */
  getEngineRuns: async (
    params: EngineRunListParams = {}
  ): Promise<EngineRunListResponse> => {
    const response = await tradingApiClient.get<EngineRunListResponse>(
      `/api/v1/engine-runs`,
      { params, skipGlobalLoading: true }
    );
    return response.data;
  },

  getEngineRun: async (runId: string, userId = 'default'): Promise<EngineRunDTO> => {
    const response = await tradingApiClient.get<EngineRunDTO>(
      `/api/v1/engine-runs/${runId}`,
      { params: { user_id: userId } }
    );
    return response.data;
  },
};

export default tradingEngineRunService;
