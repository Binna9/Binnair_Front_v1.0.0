import tradingApiClient from '@/utils/tradingApiClient';
import { AuditLogListResponse } from '@/types/TradingAuditLogTypes';

export interface AuditLogQueryParams {
  user_id?: string;
  run_id?: string;
  limit?: number;
}

export const tradingAuditLogService = {
  getAuditLogs: async (
    params: AuditLogQueryParams = {}
  ): Promise<AuditLogListResponse> => {
    const response = await tradingApiClient.get<AuditLogListResponse>(
      `/api/v1/audit-logs`,
      { params }
    );
    return response.data;
  },
};

export default tradingAuditLogService;
