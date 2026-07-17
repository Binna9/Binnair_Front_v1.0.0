import tradingApiClient from '@/utils/tradingApiClient';
import {
  HistorySummary,
  HistoryListResponse,
  HistoryOverviewResponse,
  OrderHistoryItem,
  ExecutionHistoryItem,
  PositionHistoryItem,
  TradeHistoryItem,
  EquityHistoryItem,
  TickDetailResponse,
  OrderFillStatus,
} from '@/types/TradingHistoryTypes';

export interface HistoryQueryParams {
  user_id?: string;
  run_id?: string;
  symbol?: string;
  from_at?: string;
  to_at?: string;
  limit?: number;
  offset?: number;
}

export const tradingHistoryService = {
  /** 엔진 이력 요약 — 폴링용이라 전역 오버레이 생략 */
  getSummary: async (
    params: Omit<HistoryQueryParams, 'limit' | 'offset'> = {}
  ): Promise<HistorySummary> => {
    const response = await tradingApiClient.get<HistorySummary>(
      `/api/v1/history/summary`,
      { params, skipGlobalLoading: true }
    );
    return response.data;
  },

  getOrders: async (
    params: HistoryQueryParams & {
      side?: 'BUY' | 'SELL';
      fill_status?: OrderFillStatus;
    } = {}
  ): Promise<HistoryListResponse<OrderHistoryItem>> => {
    const response = await tradingApiClient.get<HistoryListResponse<OrderHistoryItem>>(
      `/api/v1/history/orders`,
      { params }
    );
    return response.data;
  },

  getExecutions: async (
    params: HistoryQueryParams = {}
  ): Promise<HistoryListResponse<ExecutionHistoryItem>> => {
    const response = await tradingApiClient.get<HistoryListResponse<ExecutionHistoryItem>>(
      `/api/v1/history/executions`,
      { params }
    );
    return response.data;
  },

  getPositions: async (
    params: HistoryQueryParams & {
      status?: 'OPEN' | 'CLOSED';
      open_only?: boolean;
    } = {},
    options?: { skipGlobalLoading?: boolean }
  ): Promise<HistoryListResponse<PositionHistoryItem>> => {
    const response = await tradingApiClient.get<HistoryListResponse<PositionHistoryItem>>(
      `/api/v1/history/positions`,
      { params, skipGlobalLoading: options?.skipGlobalLoading }
    );
    return response.data;
  },

  getTrades: async (
    params: HistoryQueryParams & {
      exit_reason?: string;
      is_win?: boolean;
    } = {}
  ): Promise<HistoryListResponse<TradeHistoryItem>> => {
    const response = await tradingApiClient.get<HistoryListResponse<TradeHistoryItem>>(
      `/api/v1/history/trades`,
      { params }
    );
    return response.data;
  },

  getEquity: async (
    params: HistoryQueryParams = {}
  ): Promise<HistoryListResponse<EquityHistoryItem>> => {
    const response = await tradingApiClient.get<HistoryListResponse<EquityHistoryItem>>(
      `/api/v1/history/equity`,
      { params }
    );
    return response.data;
  },

  getTick: async (correlationId: string): Promise<TickDetailResponse> => {
    const response = await tradingApiClient.get<TickDetailResponse>(
      `/api/v1/history/tick`,
      { params: { correlation_id: correlationId } }
    );
    return response.data;
  },

  getOverview: async (params: {
    run_id: string;
    user_id?: string;
    symbol?: string;
    recent_limit?: number;
  }): Promise<HistoryOverviewResponse> => {
    const response = await tradingApiClient.get<HistoryOverviewResponse>(
      `/api/v1/history`,
      { params }
    );
    return response.data;
  },
};

export default tradingHistoryService;
