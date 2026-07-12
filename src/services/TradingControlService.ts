import apiClient from '@/utils/apiClient';
import { TRADING_API_BASE_URL } from '@/utils/tradingApiConfig';
import type {
  TradingControlSchemaResponse,
  TradingControlStatusResponse,
} from '@/types/TradingControlTypes';

const DEFAULT_USER_ID = 'default';
const CONTROL_API_BASE_PATH = `${TRADING_API_BASE_URL}/api/v1/control`;

export const TradingControlService = {
  async getSchema() {
    const response = await apiClient.get<TradingControlSchemaResponse>(
      `${CONTROL_API_BASE_PATH}/schema`
    );
    return response.data;
  },

  async getStatus(userId = DEFAULT_USER_ID) {
    const response = await apiClient.get<TradingControlStatusResponse>(
      `${CONTROL_API_BASE_PATH}/status?user_id=${userId}`
    );
    return response.data;
  },

  async saveConfig(payload: Record<string, unknown>, userId = DEFAULT_USER_ID) {
    const response = await apiClient.put(`${CONTROL_API_BASE_PATH}/config?user_id=${userId}`, payload);
    return response.data;
  },

  async startTrading(payload: Record<string, unknown>, userId = DEFAULT_USER_ID) {
    const response = await apiClient.post(`${CONTROL_API_BASE_PATH}/start?user_id=${userId}`, payload);
    return response.data;
  },

  async stopTrading(userId = DEFAULT_USER_ID) {
    const response = await apiClient.post(`${CONTROL_API_BASE_PATH}/stop?user_id=${userId}`);
    return response.data;
  },
};

export default TradingControlService;
