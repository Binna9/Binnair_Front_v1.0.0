import { useEffect, useState } from 'react';
import tradingWalletService from '@/services/TradingWalletService';
import { WalletBalanceDTO } from '@/types/TradingWalletTypes';

const POLL_MS = 15000;

/**
 * 자산별 잔고(BTC/USDT/USDC 등) 목록을 REST로 폴링 조회.
 * Live WebSocket 스냅샷엔 지갑 합계만 있고 자산별 내역이 없어 별도로 보강한다.
 */
export function useWalletBalances() {
  const [balances, setBalances] = useState<WalletBalanceDTO[]>([]);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const data = await tradingWalletService.getAccountWallet();
        if (cancelled || !data.ok) return;
        setBalances(data.balances);
      } catch {
        // 다음 폴링에서 재시도
      }
    };

    poll();
    const id = window.setInterval(poll, POLL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  return balances;
}
