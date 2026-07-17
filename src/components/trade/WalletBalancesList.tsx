import React from 'react';
import { WalletBalanceDTO } from '@/types/TradingWalletTypes';
import AssetIcon from '@/components/trade/AssetIcon';
import { sortWalletBalances } from '@/hooks/trading/useWalletBalances';

const formatAmount = (value: number) => {
  if (Math.abs(value) >= 1000) {
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  if (Math.abs(value) >= 1) {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
  }
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  });
};

interface WalletBalancesListProps {
  balances: WalletBalanceDTO[];
  loading?: boolean;
  error?: string | null;
  /** compact: 트레이드 사이드 패널용 */
  dense?: boolean;
  emptyText?: string;
  sourceLabel?: string;
}

/**
 * 자산별 잔고 목록 (아이콘 포함).
 * History 잔고 탭 · Trade WalletPanel 공통.
 * 실지갑 연동 후에도 balances DTO만 맞으면 그대로 사용.
 */
const WalletBalancesList: React.FC<WalletBalancesListProps> = ({
  balances,
  loading = false,
  error = null,
  dense = false,
  emptyText = '보유 자산이 없습니다',
  sourceLabel,
}) => {
  const rows = sortWalletBalances(balances);
  const iconSize = dense ? 18 : 22;
  const rowPad = dense ? 'py-1.5' : 'py-2.5';
  const textSize = dense ? 'text-xs' : 'text-sm';

  if (loading && rows.length === 0) {
    return (
      <div className={`${textSize} text-[#848e9c] py-4 text-center`}>자산 불러오는 중...</div>
    );
  }

  if (error && rows.length === 0) {
    return (
      <div className={`${textSize} text-[#f6465d] py-4 text-center`}>{error}</div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className={`${textSize} text-[#848e9c] py-4 text-center`}>{emptyText}</div>
    );
  }

  return (
    <div>
      {sourceLabel && (
        <div className="text-[10px] text-[#848e9c] mb-2">{sourceLabel}</div>
      )}
      <ul className="divide-y divide-[#2b3139]/70">
        {rows.map((b) => (
          <li
            key={b.asset}
            className={`flex items-center gap-2.5 ${rowPad} ${textSize}`}
          >
            <AssetIcon asset={b.asset} size={iconSize} />
            <div className="min-w-0 flex-1">
              <div className="font-medium text-[#eaecef] truncate">{b.asset}</div>
              {!dense && (
                <div className="text-[11px] text-[#848e9c]">
                  지갑 {formatAmount(b.balance)}
                </div>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-[#eaecef] font-medium tabular-nums">
                {formatAmount(b.available_balance)}
              </div>
              <div className="text-[10px] text-[#848e9c]">가용</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WalletBalancesList;
