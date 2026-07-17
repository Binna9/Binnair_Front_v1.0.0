import { useEffect, useState } from 'react';
import tradingWalletService from '@/services/TradingWalletService';
import {
  AccountWalletResponse,
  WalletBalanceDTO,
} from '@/types/TradingWalletTypes';

export type WalletSource = 'monitor_testnet' | 'linked_exchange';

export interface WalletBalancesState {
  /** 데이터 출처 — 이후 linked_exchange 로 전환 예정 */
  source: WalletSource;
  balances: WalletBalanceDTO[];
  account: AccountWalletResponse['account'] | null;
  paperMode: boolean;
  quoteAsset: string;
  loading: boolean;
  error: string | null;
  refreshedAt: number | null;
}

const POLL_MS = 15000;

/**
 * 지갑 자산 목록.
 * 지금은 Monitor `/account/wallet`(testnet)만 사용.
 * 실지갑 연동 시 이 훅 내부 fetch만 바꾸면 UI(WalletBalancesList)는 재사용 가능.
 */
export function useWalletBalances(pollMs = POLL_MS): WalletBalancesState {
  const [balances, setBalances] = useState<WalletBalanceDTO[]>([]);
  const [account, setAccount] = useState<AccountWalletResponse['account'] | null>(null);
  const [paperMode, setPaperMode] = useState(false);
  const [quoteAsset, setQuoteAsset] = useState('USDT');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshedAt, setRefreshedAt] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const data = await tradingWalletService.getAccountWallet();
        if (cancelled) return;
        if (!data.ok) {
          setError(data.error ?? '지갑을 불러오지 못했습니다.');
          return;
        }
        setBalances(data.balances ?? []);
        setAccount(data.account ?? null);
        setPaperMode(Boolean(data.paper_mode));
        setQuoteAsset(data.quote_asset ?? 'USDT');
        setError(null);
        setRefreshedAt(Date.now());
      } catch {
        if (!cancelled) setError('지갑을 불러오지 못했습니다.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    poll();
    const id = window.setInterval(poll, pollMs);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [pollMs]);

  return {
    source: 'monitor_testnet',
    balances,
    account,
    paperMode,
    quoteAsset,
    loading,
    error,
    refreshedAt,
  };
}

/** 잔고 0 제외 후 가용잔고 큰 순 */
export function sortWalletBalances(balances: WalletBalanceDTO[]): WalletBalanceDTO[] {
  return [...balances]
    .filter((b) => (b.balance ?? 0) > 0 || (b.available_balance ?? 0) > 0)
    .sort((a, b) => (b.available_balance ?? 0) - (a.available_balance ?? 0));
}
