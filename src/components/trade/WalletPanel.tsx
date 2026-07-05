import React from 'react';
import { useLiveAccountStore } from '@/store/trading/liveAccountStore';

const formatUsdt = (value: number) =>
  value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const WalletPanel: React.FC = () => {
  const wallet = useLiveAccountStore((s) => s.wallet);
  const paperMode = useLiveAccountStore((s) => s.paperMode);
  const quoteAsset = useLiveAccountStore((s) => s.quoteAsset);
  const wsConnected = useLiveAccountStore((s) => s.wsConnected);
  const lastError = useLiveAccountStore((s) => s.lastError);

  if (!wallet) {
    return (
      <div className="flex-shrink-0 border-b border-[#2b3139] bg-[#0b0e11] p-3 text-xs text-[#848e9c]">
        {lastError ?? '지갑 정보 불러오는 중...'}
      </div>
    );
  }

  const unrealized = wallet.total_unrealized_profit;

  return (
    <div className="flex-shrink-0 border-b border-[#2b3139] bg-[#0b0e11] p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-[#eaecef]">지갑 (Testnet)</span>
        <div className="flex items-center gap-1.5">
          <span
            className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded ${
              wsConnected
                ? 'bg-[#0ecb8133] text-[#0ecb81]'
                : 'bg-[#f0b90b33] text-[#f0b90b]'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                wsConnected ? 'bg-[#0ecb81]' : 'bg-[#f0b90b]'
              }`}
            />
            {wsConnected ? '실시간' : '재연결 중'}
          </span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded ${
              wallet.can_trade
                ? 'bg-[#0ecb8133] text-[#0ecb81]'
                : 'bg-[#f6465d33] text-[#f6465d]'
            }`}
          >
            {paperMode ? '모의거래' : wallet.can_trade ? '거래 가능' : '거래 불가'}
          </span>
        </div>
      </div>

      <div className="text-[11px] text-[#848e9c] mb-1">사용 가능 잔고</div>
      <div className="text-lg font-semibold text-[#eaecef] mb-2">
        {formatUsdt(wallet.available_balance)}{' '}
        <span className="text-xs text-[#848e9c]">{quoteAsset}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <div className="text-[#848e9c]">총 잔고</div>
          <div className="text-[#eaecef]">{formatUsdt(wallet.total_wallet_balance)}</div>
        </div>
        <div>
          <div className="text-[#848e9c]">미실현 손익</div>
          <div className={unrealized >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}>
            {unrealized >= 0 ? '+' : ''}
            {formatUsdt(unrealized)}
          </div>
        </div>
      </div>

      {!wsConnected && lastError && (
        <div className="mt-2 text-[10px] text-[#f6465d]">{lastError}</div>
      )}
    </div>
  );
};

export default WalletPanel;
