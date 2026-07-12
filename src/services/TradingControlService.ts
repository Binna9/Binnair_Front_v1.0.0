import apiClient from '@/utils/apiClient';
import type {
  TradingControlSchemaResponse,
  TradingControlStatusResponse,
} from '@/types/TradingControlTypes';

const DEFAULT_USER_ID = 'default';

export const TradingControlService = {
  async getSchema() {
    const response = await apiClient.get<TradingControlSchemaResponse>(
      '/api/v1/control/schema'
    );
    return response.data;
  },

  async getStatus(userId = DEFAULT_USER_ID) {
    const response = await apiClient.get<TradingControlStatusResponse>(
      `/api/v1/control/status?user_id=${userId}`
    );
    return response.data;
  },

  async saveConfig(payload: Record<string, unknown>, userId = DEFAULT_USER_ID) {
    const response = await apiClient.put(`/api/v1/control/config?user_id=${userId}`, payload);
    return response.data;
  },

  async startTrading(payload: Record<string, unknown>, userId = DEFAULT_USER_ID) {
    const response = await apiClient.post(`/api/v1/control/start?user_id=${userId}`, payload);
    return response.data;
  },

  async stopTrading(userId = DEFAULT_USER_ID) {
    const response = await apiClient.post(`/api/v1/control/stop?user_id=${userId}`);
    return response.data;
  },
};

export default TradingControlService;
