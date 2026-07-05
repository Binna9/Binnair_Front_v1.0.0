import axios from 'axios';
import { TRADING_API_BASE_URL } from '@/utils/tradingApiConfig';
import {
  HistorySummary,
  HistoryListResponse,
  OrderHistoryItem,
  ExecutionHistoryItem,
  PositionHistoryItem,
  TradeHistoryItem,
  OrderFillStatus,
} from '@/types/TradingHistoryTypes';

export interface HistoryQueryParams {
  user_id?: string;
  run_id?: string;
  symbol?: string;
  from_at?: string;
  to_at?: string;
  limit?: number;
}

export const tradingHistoryService = {
  // 엔진 이력 요약 (건수·최근 활동 시각) — 탭 배지 표시용
  getSummary: async (
    params: Omit<HistoryQueryParams, 'limit'> = {}
  ): Promise<HistorySummary> => {
    const response = await axios.get<HistorySummary>(
      `${TRADING_API_BASE_URL}/api/v1/history/summary`,
      { params }
    );
    return response.data;
  },

  // 주문 내역 (order_request + 체결 요약)
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

  // 체결(fill) 내역
  getExecutions: async (
    params: HistoryQueryParams = {}
  ): Promise<HistoryListResponse<ExecutionHistoryItem>> => {
    const response = await axios.get<HistoryListResponse<ExecutionHistoryItem>>(
      `${TRADING_API_BASE_URL}/api/v1/history/executions`,
      { params }
    );
    return response.data;
  },

  // 포지션 내역 (OPEN/CLOSED 스냅샷)
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

  // 청산 완료 거래 (진입→청산 라운드트립)
  getTrades: async (
    params: HistoryQueryParams = {}
  ): Promise<HistoryListResponse<TradeHistoryItem>> => {
    const response = await axios.get<HistoryListResponse<TradeHistoryItem>>(
      `${TRADING_API_BASE_URL}/api/v1/history/trades`,
      { params }
    );
    return response.data;
  },
};

export default tradingHistoryService;
