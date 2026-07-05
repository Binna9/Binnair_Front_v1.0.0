import axios from 'axios';
import { TRADING_API_BASE_URL } from '@/utils/tradingApiConfig';
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
  // 승률·PnL·수익률 등 기간 성과 요약
  getSummary: async (
    params: PerformanceSummaryParams = {}
  ): Promise<PerformanceSummaryDTO> => {
    const response = await axios.get<PerformanceSummaryDTO>(
      `${TRADING_API_BASE_URL}/api/v1/performance/summary`,
      { params }
    );
    return response.data;
  },

  // 일/주/월 단위 성과 시계열 (에쿼티 커브용)
  getPeriods: async (
    params: PerformancePeriodsParams = {}
  ): Promise<PerformancePeriodsResponse> => {
    const response = await axios.get<PerformancePeriodsResponse>(
      `${TRADING_API_BASE_URL}/api/v1/performance/periods`,
      { params }
    );
    return response.data;
  },
};

export default tradingPerformanceService;
