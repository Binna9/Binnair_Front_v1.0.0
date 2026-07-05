import React from 'react';
import { useHistoryPage } from '@/hooks/trading/useHistoryPage';
import tradingTimelineService from '@/services/TradingTimelineService';
import { FlowEventType, FlowTimelineItemDTO } from '@/types/TradingTimelineTypes';
import Pager from './Pager';

const EVENT_ICON: Record<FlowEventType, string> = {
  inference: '🤖',
  signal: '📊',
  order_request: '📝',
  order_execution: '✅',
  position: '📈',
  audit: '⚠️',
};

const EVENT_LABEL: Record<FlowEventType, string> = {
  inference: 'TimesFM 추론',
  signal: '시그널',
  order_request: '주문 요청',
  order_execution: '체결',
  position: '포지션',
  audit: '감사/리스크',
};

/** 이벤트 성격에 따라 요약 텍스트 색상을 결정 (BUY/체결/익절→green, SELL/손절→red, 리스크거부→orange) */
function getSummaryColor(item: FlowTimelineItemDTO): string {
  const p = item.payload ?? {};
  if (item.event_type === 'signal') {
    const action = p.signal_action;
    if (action === 'BUY') return 'text-[#0ecb81]';
    if (action === 'SELL') return 'text-[#f6465d]';
    return 'text-[#848e9c]';
  }
  if (item.event_type === 'audit') {
    const event = typeof p.event === 'string' ? p.event : '';
    if (event.includes('risk_rejected')) return 'text-[#f0b90b]';
    return 'text-[#eaecef]';
  }
  if (item.event_type === 'position') {
    const exitReason = p.exit_reason;
    if (exitReason === 'STOP_LOSS') return 'text-[#f6465d]';
    if (exitReason === 'TAKE_PROFIT' || exitReason === 'MODEL_SELL') return 'text-[#0ecb81]';
    return 'text-[#eaecef]';
  }
  if (item.event_type === 'order_execution') return 'text-[#0ecb81]';
  return 'text-[#eaecef]';
}

/** 추론→시그널→주문→체결→포지션→감사 로그를 시간순으로 합친 매매 흐름 타임라인 */
const FlowTimelineList: React.FC = () => {
  const { pageItems, page, setPage, hasPrev, hasNext, loading, error } = useHistoryPage(
    (limit) => tradingTimelineService.getTimeline({ limit }),
    null
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto custom-scroll">
        {error ? (
          <div className="px-3 py-6 text-center text-xs text-[#f6465d]">{error}</div>
        ) : loading && pageItems.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-[#848e9c]">불러오는 중...</div>
        ) : pageItems.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-[#848e9c]">
            타임라인 이벤트가 없습니다
          </div>
        ) : (
          <ul>
            {pageItems.map((item, i) => (
              <li
                key={`${item.correlation_id ?? 'na'}-${item.event_at}-${i}`}
                className="flex items-start gap-2 px-3 py-2 border-b border-[#2b3139]/50 hover:bg-[#1e2329]/50"
              >
                <span className="text-sm leading-5 shrink-0">{EVENT_ICON[item.event_type]}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[11px] text-[#848e9c]">
                    <span>{EVENT_LABEL[item.event_type]}</span>
                    {item.symbol && <span>· {item.symbol}</span>}
                    <span className="whitespace-nowrap">
                      {new Date(item.event_at).toLocaleString()}
                    </span>
                  </div>
                  <div className={`text-xs mt-0.5 truncate ${getSummaryColor(item)}`}>
                    {item.summary}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Pager
        page={page}
        hasPrev={hasPrev}
        hasNext={hasNext}
        onPrev={() => setPage((p) => p - 1)}
        onNext={() => setPage((p) => p + 1)}
      />
    </div>
  );
};

export default FlowTimelineList;
