import React from 'react';
import { useLiveAccountStore } from '@/store/trading/liveAccountStore';

const formatPrice = (value: number) =>
  value.toLocaleString(undefined, { maximumFractionDigits: 6 });

/** WebSocket으로 받는 현재 보유(OPEN) 포지션 — 거래소 실시간 값 */
const LivePositionsTable: React.FC = () => {
  const positionsMap = useLiveAccountStore((s) => s.positions);
  const wallet = useLiveAccountStore((s) => s.wallet);
  const lastError = useLiveAccountStore((s) => s.lastError);
  const positions = Object.values(positionsMap);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto custom-scroll">
      <table className="w-full text-xs text-left">
        <thead className="sticky top-0 bg-[#0b0e11] text-[#848e9c] border-b border-[#2b3139]">
          <tr>
            <th className="px-3 py-2 font-medium">심볼</th>
            <th className="px-3 py-2 font-medium">방향</th>
            <th className="px-3 py-2 font-medium">수량</th>
            <th className="px-3 py-2 font-medium">진입가</th>
            <th className="px-3 py-2 font-medium">마크가격</th>
            <th className="px-3 py-2 font-medium">레버리지</th>
            <th className="px-3 py-2 font-medium">마진 타입</th>
            <th className="px-3 py-2 font-medium">미실현 손익</th>
          </tr>
        </thead>
        <tbody className="text-[#eaecef]">
          {!wallet ? (
            <tr>
              <td colSpan={8} className="px-3 py-6 text-center text-[#848e9c]">
                {lastError ?? '포지션 불러오는 중...'}
              </td>
            </tr>
          ) : positions.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-3 py-6 text-center text-[#848e9c]">
                보유 중인 포지션이 없습니다
              </td>
            </tr>
          ) : (
            positions.map((pos) => {
              const isLong = pos.side ? pos.side === 'LONG' : pos.quantity >= 0;
              return (
                <tr key={pos.symbol} className="border-b border-[#2b3139]/50 hover:bg-[#1e2329]/50">
                  <td className="px-3 py-2 font-medium">{pos.symbol}</td>
                  <td
                    className={`px-3 py-2 font-medium ${
                      isLong ? 'text-[#0ecb81]' : 'text-[#f6465d]'
                    }`}
                  >
                    {isLong ? '롱' : '숏'}
                  </td>
                  <td className="px-3 py-2">{Math.abs(pos.quantity)}</td>
                  <td className="px-3 py-2">{formatPrice(pos.entry_price)}</td>
                  <td className="px-3 py-2">
                    {pos.mark_price != null ? formatPrice(pos.mark_price) : '-'}
                  </td>
                  <td className="px-3 py-2">{pos.leverage != null ? `${pos.leverage}x` : '-'}</td>
                  <td className="px-3 py-2 text-[#848e9c]">{pos.margin_type ?? '-'}</td>
                  <td
                    className={`px-3 py-2 font-medium ${
                      pos.unrealized_pnl >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'
                    }`}
                  >
                    {pos.unrealized_pnl >= 0 ? '+' : ''}
                    {pos.unrealized_pnl.toFixed(2)}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LivePositionsTable;
