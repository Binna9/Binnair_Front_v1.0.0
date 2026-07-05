import axios from 'axios';
import { TRADING_API_BASE_URL } from '@/utils/tradingApiConfig';
import { AuditLogListResponse } from '@/types/TradingAuditLogTypes';

export interface AuditLogQueryParams {
  user_id?: string;
  run_id?: string;
  limit?: number;
}

export const tradingAuditLogService = {
  // 리스크 거부, 포지션 청산 등 감사 이벤트
  getAuditLogs: async (
    params: AuditLogQueryParams = {}
  ): Promise<AuditLogListResponse> => {
    const response = await axios.get<AuditLogListResponse>(
      `${TRADING_API_BASE_URL}/api/v1/audit-logs`,
      { params }
    );
    return response.data;
  },
};

export default tradingAuditLogService;
