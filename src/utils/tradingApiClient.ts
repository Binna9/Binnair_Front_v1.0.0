import axios from 'axios';
import { store } from '@/store/store';
import { apiRequestFinished, apiRequestStarted } from '@/store/slices/uiSlice';
import { TRADING_API_BASE_URL } from '@/utils/tradingApiConfig';

declare module 'axios' {
  export interface AxiosRequestConfig {
    /** true면 GlobalLoadingOverlay apiInFlight 카운트에서 제외 (폴링용) */
    skipGlobalLoading?: boolean;
  }
}

/**
 * Trading Monitor API 클라이언트.
 * 전역 GlobalLoadingOverlay(apiInFlight)와 연동한다.
 * (기존 raw axios 호출은 오버레이가 뜨지 않았음)
 */
export const tradingApiClient = axios.create({
  baseURL: TRADING_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

tradingApiClient.interceptors.request.use(
  (config) => {
    if (!config.skipGlobalLoading) {
      store.dispatch(apiRequestStarted());
    }
    return config;
  },
  (error) => {
    if (!error?.config?.skipGlobalLoading) {
      store.dispatch(apiRequestFinished());
    }
    return Promise.reject(error);
  }
);

tradingApiClient.interceptors.response.use(
  (response) => {
    if (!response.config.skipGlobalLoading) {
      store.dispatch(apiRequestFinished());
    }
    return response;
  },
  (error) => {
    if (!error?.config?.skipGlobalLoading) {
      store.dispatch(apiRequestFinished());
    }
    return Promise.reject(error);
  }
);

export default tradingApiClient;
