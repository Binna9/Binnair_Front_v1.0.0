import axios from 'axios';
import { TRADING_API_BASE_URL } from '@/utils/tradingApiConfig';
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
  /** 엔진 이력 요약 (건수·승률·최근 활동) */
  getSummary: async (
    params: Omit<HistoryQueryParams, 'limit' | 'offset'> = {}
  ): Promise<HistorySummary> => {
    const response = await axios.get<HistorySummary>(
      `${TRADING_API_BASE_URL}/api/v1/history/summary`,
      { params }
    );
    return response.data;
  },

  /** 주문 내역 (order_request + 체결 요약) */
  getOrders: async (
    params: HistoryQueryParams & {
      side?: 'BUY' | 'SELL';
      fill_status?: OrderFillStatus;
    } = {}
  ): Promise<HistoryListResponse<OrderHistoryItem>> => {
    const response = await axios.get<HistoryListResponse<OrderHistoryItem>>(
      `${TRADING_API_BASE_URL}/api/v1/history/orders`,
      { params }
    );
    return response.data;
  },

  /** 체결(fill) 내역 */
  getExecutions: async (
    params: HistoryQueryParams = {}
  ): Promise<HistoryListResponse<ExecutionHistoryItem>> => {
    const response = await axios.get<HistoryListResponse<ExecutionHistoryItem>>(
      `${TRADING_API_BASE_URL}/api/v1/history/executions`,
      { params }
    );
    return response.data;
  },

  /** 포지션 내역 (OPEN/CLOSED 스냅샷) */
  getPositions: async (
    params: HistoryQueryParams & {
      status?: 'OPEN' | 'CLOSED';
      open_only?: boolean;
    } = {}
  ): Promise<HistoryListResponse<PositionHistoryItem>> => {
    const response = await axios.get<HistoryListResponse<PositionHistoryItem>>(
      `${TRADING_API_BASE_URL}/api/v1/history/positions`,
      { params }
    );
    return response.data;
  },

  /** 청산 완료 거래 (진입→청산 라운드트립) */
  getTrades: async (
    params: HistoryQueryParams & {
      exit_reason?: string;
      is_win?: boolean;
    } = {}
  ): Promise<HistoryListResponse<TradeHistoryItem>> => {
    const response = await axios.get<HistoryListResponse<TradeHistoryItem>>(
      `${TRADING_API_BASE_URL}/api/v1/history/trades`,
      { params }
    );
    return response.data;
  },

  /** 잔고/에퀴티 곡선 (시간 오름차순) */
  getEquity: async (
    params: HistoryQueryParams = {}
  ): Promise<HistoryListResponse<EquityHistoryItem>> => {
    const response = await axios.get<HistoryListResponse<EquityHistoryItem>>(
      `${TRADING_API_BASE_URL}/api/v1/history/equity`,
      { params }
    );
    return response.data;
  },

  /** 틱(판단) 상세 — correlation_id 묶음 */
  getTick: async (correlationId: string): Promise<TickDetailResponse> => {
    const response = await axios.get<TickDetailResponse>(
      `${TRADING_API_BASE_URL}/api/v1/history/tick`,
      { params: { correlation_id: correlationId } }
    );
    return response.data;
  },

  /** overview — run_id 필수, 최근 N건 일괄 */
  getOverview: async (params: {
    run_id: string;
    user_id?: string;
    symbol?: string;
    recent_limit?: number;
  }): Promise<HistoryOverviewResponse> => {
    const response = await axios.get<HistoryOverviewResponse>(
      `${TRADING_API_BASE_URL}/api/v1/history`,
      { params }
    );
    return response.data;
  },
};

export default tradingHistoryService;
