import axios from 'axios';
import { AccountWalletResponse } from '@/types/TradingWalletTypes';
import { TRADING_API_BASE_URL } from '@/utils/tradingApiConfig';

export const tradingWalletService = {
  // testnet 지갑 + 엔진 sizing 진단 조회
  getAccountWallet: async (): Promise<AccountWalletResponse> => {
    const response = await axios.get<AccountWalletResponse>(
      `${TRADING_API_BASE_URL}/api/v1/account/wallet`
    );
    return response.data;
  },
};

export default tradingWalletService;
