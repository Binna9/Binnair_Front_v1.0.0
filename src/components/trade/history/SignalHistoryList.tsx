import React from 'react';
import { useHistoryPage } from '@/hooks/trading/useHistoryPage';
import tradingSignalService from '@/services/TradingSignalService';
import Pager from './Pager';

const ACTION_LABEL: Record<'BUY' | 'SELL' | 'HOLD', string> = {
  BUY: '매수',
  SELL: '매도',
  HOLD: '홀드',
};

const ACTION_COLOR: Record<'BUY' | 'SELL' | 'HOLD', string> = {
  BUY: 'text-[#0ecb81]',
  SELL: 'text-[#f6465d]',
  HOLD: 'text-[#848e9c]',
};

/** Predictor/Strategy가 판단한 BUY/SELL/HOLD 시그널 이력 */
const SignalHistoryList: React.FC = () => {
  const { pageItems, page, goPrev, goNext, hasPrev, hasNext, loading, error } = useHistoryPage(
    async ({ limit, offset }) => {
      const res = await tradingSignalService.getSignals({ limit: offset + limit });
      const sliced = (res.items ?? []).slice(offset, offset + limit);
      return {
        items: sliced,
        count: sliced.length,
        total_count: res.count ?? res.items?.length ?? 0,
        has_more: offset + sliced.length < (res.count ?? res.items?.length ?? 0),
      };
    },
    null
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto custom-scroll">
        <table className="w-full text-xs text-left">
          <thead className="sticky top-0 bg-[#0b0e11] text-[#848e9c] border-b border-[#2b3139]">
            <tr>
              <th className="px-3 py-2 font-medium whitespace-nowrap">시각</th>
              <th className="px-3 py-2 font-medium">심볼</th>
              <th className="px-3 py-2 font-medium">시그널</th>
              <th className="px-3 py-2 font-medium">신뢰도</th>
              <th className="px-3 py-2 font-medium">참고가</th>
              <th className="px-3 py-2 font-medium">타임프레임</th>
              <th className="px-3 py-2 font-medium">모델 버전</th>
            </tr>
          </thead>
          <tbody className="text-[#eaecef]">
            {error ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-[#f6465d]">
                  {error}
                </td>
              </tr>
            ) : loading && pageItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-[#848e9c]">
                  불러오는 중...
                </td>
              </tr>
            ) : pageItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-[#848e9c]">
                  시그널 이력이 없습니다
                </td>
              </tr>
            ) : (
              pageItems.map((s) => (
                <tr
                  key={s.id ?? `${s.correlation_id}-${s.event_at}`}
                  className="border-b border-[#2b3139]/50 hover:bg-[#1e2329]/50"
                >
                  <td className="px-3 py-2 text-[#848e9c] whitespace-nowrap">
                    {new Date(s.event_at).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 font-medium">{s.symbol}</td>
                  <td className={`px-3 py-2 font-medium ${ACTION_COLOR[s.signal_action]}`}>
                    {ACTION_LABEL[s.signal_action]}
                  </td>
                  <td className="px-3 py-2">{(s.confidence * 100).toFixed(1)}%</td>
                  <td className="px-3 py-2">
                    {s.price_hint != null ? s.price_hint.toLocaleString() : '-'}
                  </td>
                  <td className="px-3 py-2 text-[#848e9c]">{s.timeframe ?? '-'}</td>
                  <td className="px-3 py-2 text-[#848e9c]">{s.model_version ?? '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pager
        page={page}
        hasPrev={hasPrev}
        hasNext={hasNext}
        onPrev={goPrev}
        onNext={goNext}
      />
    </div>
  );
};

export default SignalHistoryList;
