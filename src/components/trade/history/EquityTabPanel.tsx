import React from 'react';
import { useWalletBalances } from '@/hooks/trading/useWalletBalances';
import WalletBalancesList from '@/components/trade/WalletBalancesList';
import EquityChartPanel from '@/components/trade/history/EquityChartPanel';

const formatUsdt = (value: number) =>
  value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * History 잔고 탭:
 * 1) 현재 보유 자산 (wallet API · 실지갑 연동 대비)
 * 2) 엔진 equity 곡선 (history/equity)
 */
const EquityTabPanel: React.FC = () => {
  const { balances, account, paperMode, quoteAsset, loading, error, source } =
    useWalletBalances();

  const sourceLabel =
    source === 'monitor_testnet'
      ? '현재: Monitor Testnet 지갑 · 이후 실거래소 지갑 연동 예정'
      : '연동된 거래소 지갑';

  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scroll">
      <div className="p-4 pb-2">
        <div className="rounded-lg border border-[#2b3139] bg-[#12161c]/80 p-4 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.008] hover:border-[#4a5160] hover:shadow-[0_12px_32px_rgba(0,0,0,0.45)] will-change-transform">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
            <div>
              <h3 className="text-sm font-semibold text-[#eaecef]">보유 자산</h3>
              <p className="text-[11px] text-[#848e9c] mt-0.5">{sourceLabel}</p>
            </div>
            {paperMode && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#f0b90b33] text-[#f0b90b]">
                모의거래
              </span>
            )}
          </div>

          {account && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-xs">
              <div className="rounded-md bg-[#0b0e11]/70 border border-[#2b3139] px-2.5 py-2">
                <div className="text-[#848e9c]">총 잔고</div>
                <div className="text-[#eaecef] font-semibold mt-0.5">
                  {formatUsdt(account.total_wallet_balance)}{' '}
                  <span className="text-[10px] text-[#848e9c]">{quoteAsset}</span>
                </div>
              </div>
              <div className="rounded-md bg-[#0b0e11]/70 border border-[#2b3139] px-2.5 py-2">
                <div className="text-[#848e9c]">가용</div>
                <div className="text-[#eaecef] font-semibold mt-0.5">
                  {formatUsdt(account.available_balance)}
                </div>
              </div>
              <div className="rounded-md bg-[#0b0e11]/70 border border-[#2b3139] px-2.5 py-2">
                <div className="text-[#848e9c]">미실현</div>
                <div
                  className={`font-semibold mt-0.5 ${
                    account.total_unrealized_profit >= 0
                      ? 'text-[#0ecb81]'
                      : 'text-[#f6465d]'
                  }`}
                >
                  {account.total_unrealized_profit >= 0 ? '+' : ''}
                  {formatUsdt(account.total_unrealized_profit)}
                </div>
              </div>
              <div className="rounded-md bg-[#0b0e11]/70 border border-[#2b3139] px-2.5 py-2">
                <div className="text-[#848e9c]">마진 잔고</div>
                <div className="text-[#eaecef] font-semibold mt-0.5">
                  {formatUsdt(account.total_margin_balance)}
                </div>
              </div>
            </div>
          )}

          <WalletBalancesList
            balances={balances}
            loading={loading}
            error={error}
            emptyText="표시할 보유 자산이 없습니다"
          />
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="rounded-lg border border-[#2b3139] bg-[#12161c]/80 overflow-hidden transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.008] hover:border-[#4a5160] hover:shadow-[0_12px_32px_rgba(0,0,0,0.45)] will-change-transform">
          <div className="px-4 pt-3 pb-1">
            <h3 className="text-sm font-semibold text-[#eaecef]">에퀴티 곡선</h3>
            <p className="text-[11px] text-[#848e9c] mt-0.5">
              엔진 기록 equity_usdt (기간 필터·검색 적용)
            </p>
          </div>
          <div className="min-h-[280px] flex flex-col">
            <EquityChartPanel limit={200} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquityTabPanel;
