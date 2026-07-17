import tradingApiClient from '@/utils/tradingApiClient';
import {
  PerformanceSummaryDTO,
  PerformancePeriodsResponse,
  PerformancePeriodGranularity,
} from '@/types/TradingPerformanceTypes';

export interface PerformanceSummaryParams {
  user_id?: string;
  run_id?: string;
  symbol?: string;
  from_at?: string;
  to_at?: string;
}

export interface PerformancePeriodsParams {
  user_id?: string;
  run_id?: string;
  granularity?: PerformancePeriodGranularity;
  from_date?: string;
  to_date?: string;
  limit?: number;
}

export const tradingPerformanceService = {
  getSummary: async (
    params: PerformanceSummaryParams = {}
  ): Promise<PerformanceSummaryDTO> => {
    const response = await tradingApiClient.get<PerformanceSummaryDTO>(
      `/api/v1/performance/summary`,
      { params }
    );
    return response.data;
  },

  getPeriods: async (
    params: PerformancePeriodsParams = {}
  ): Promise<PerformancePeriodsResponse> => {
    const response = await tradingApiClient.get<PerformancePeriodsResponse>(
      `/api/v1/performance/periods`,
      { params, skipGlobalLoading: true }
    );
    return response.data;
  },
};

export default tradingPerformanceService;
