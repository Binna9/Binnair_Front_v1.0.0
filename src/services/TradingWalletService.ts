import tradingApiClient from '@/utils/tradingApiClient';
import { AccountWalletResponse } from '@/types/TradingWalletTypes';

export const tradingWalletService = {
  /** testnet 지갑 — 폴링이라 전역 오버레이 생략 */
  getAccountWallet: async (): Promise<AccountWalletResponse> => {
    const response = await tradingApiClient.get<AccountWalletResponse>(
      `/api/v1/account/wallet`,
      { skipGlobalLoading: true }
    );
    return response.data;
  },
};

export default tradingWalletService;
