import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { GripHorizontal, X } from 'lucide-react';
import tradingHistoryService from '@/services/TradingHistoryService';
import { TickDetailResponse } from '@/types/TradingHistoryTypes';

interface TickDetailModalProps {
  correlationId: string;
  onClose: () => void;
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-baseline gap-2 mb-1.5">
        <h3 className="text-xs font-semibold text-[#eaecef]">{title}</h3>
        {hint && <span className="text-[10px] text-[#848e9c]">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="text-[11px] text-[#848e9c] py-1">{text}</div>;
}

function JsonBlock({ data }: { data: unknown }) {
  return (
    <pre className="text-[10px] text-[#848e9c] bg-[#0b0e11] border border-[#2b3139] rounded p-2 overflow-x-auto max-h-40 custom-scroll whitespace-pre-wrap break-all">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

/** 뷰포트(모니터) 기준 중앙 + 헤더 드래그 이동. body 포탈로 렌더 */
const TickDetailModal: React.FC<TickDetailModalProps> = ({ correlationId, onClose }) => {
  const [data, setData] = useState<TickDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    tradingHistoryService
      .getTick(correlationId)
      .then((res) => {
        if (!cancelled) {
          setData(res);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) setError('틱 상세를 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [correlationId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const onHeaderPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).closest('button')) return;
      e.preventDefault();
      dragRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        origX: offset.x,
        origY: offset.y,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [offset.x, offset.y]
  );

  const onHeaderPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d || d.pointerId !== e.pointerId) return;
    setOffset({
      x: d.origX + (e.clientX - d.startX),
      y: d.origY + (e.clientY - d.startY),
    });
  }, []);

  const onHeaderPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d || d.pointerId !== e.pointerId) return;
    dragRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  }, []);

  const modal = (
    <div className="fixed inset-0 z-[10050]" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        ref={panelRef}
        className="fixed z-[10051] w-[min(42rem,calc(100vw-2rem))] max-h-[85vh] flex flex-col bg-[#1e2329] border border-[#2b3139] rounded-lg shadow-2xl overflow-hidden"
        style={{
          left: `calc(50% + ${offset.x}px)`,
          top: `calc(50% + ${offset.y}px)`,
          transform: 'translate(-50%, -50%)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex-shrink-0 flex items-center justify-between gap-2 px-4 py-3 border-b border-[#2b3139] bg-[#242a32] cursor-grab active:cursor-grabbing select-none touch-none"
          onPointerDown={onHeaderPointerDown}
          onPointerMove={onHeaderPointerMove}
          onPointerUp={onHeaderPointerUp}
          onPointerCancel={onHeaderPointerUp}
        >
          <div className="flex items-start gap-2 min-w-0">
            <GripHorizontal
              size={16}
              className="mt-0.5 flex-shrink-0 text-[#848e9c]"
              aria-hidden
            />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[#eaecef]">틱 상세</div>
              <div className="text-[11px] text-[#848e9c] truncate mt-0.5">
                correlation: {correlationId}
                {data?.run_id ? ` · run: ${data.run_id}` : ''}
                {data?.symbol ? ` · ${data.symbol}` : ''}
              </div>
              <div className="text-[10px] text-[#848e9c]/70 mt-0.5">헤더를 드래그해 이동</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded text-[#848e9c] hover:text-[#eaecef] hover:bg-[#2b3139] cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto custom-scroll px-4 py-3">
          {loading && (
            <div className="text-xs text-[#848e9c] py-8 text-center">불러오는 중...</div>
          )}
          {error && (
            <div className="text-xs text-[#f6465d] py-8 text-center">{error}</div>
          )}
          {data && !loading && (
            <>
              <Section title="시그널">
                {(data.signals?.length ?? 0) === 0 ? (
                  <Empty text="시그널 없음" />
                ) : (
                  <JsonBlock data={data.signals} />
                )}
              </Section>
              <Section title="참고 추론" hint="동일 run+symbol 최근 건 (correlation 정확 매칭 아님)">
                {(data.inferences?.length ?? 0) === 0 ? (
                  <Empty text="추론 없음" />
                ) : (
                  <JsonBlock data={data.inferences} />
                )}
              </Section>
              <Section title="주문">
                {(data.orders?.length ?? 0) === 0 ? (
                  <Empty text="주문 없음" />
                ) : (
                  <div className="space-y-1">
                    {data.orders!.map((o, i) => (
                      <div
                        key={o.id ?? i}
                        className="text-[11px] flex flex-wrap gap-x-3 gap-y-0.5 text-[#eaecef] bg-[#0b0e11] border border-[#2b3139] rounded px-2 py-1.5"
                      >
                        <span className={o.side === 'BUY' ? 'text-[#0ecb81]' : 'text-[#f6465d]'}>
                          {o.side}
                        </span>
                        <span>{o.symbol}</span>
                        <span>{o.order_type}</span>
                        <span>qty {o.quantity}</span>
                        <span className="text-[#848e9c]">{o.fill_status}</span>
                        <span className="text-[#848e9c]">
                          {new Date(o.requested_at).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Section>
              <Section title="체결">
                {(data.executions?.length ?? 0) === 0 ? (
                  <Empty text="체결 없음" />
                ) : (
                  <div className="space-y-1">
                    {data.executions!.map((e, i) => (
                      <div
                        key={e.id ?? i}
                        className="text-[11px] flex flex-wrap gap-x-3 text-[#eaecef] bg-[#0b0e11] border border-[#2b3139] rounded px-2 py-1.5"
                      >
                        <span>{e.symbol}</span>
                        <span>
                          {e.executed_price != null ? e.executed_price.toLocaleString() : '-'} ×{' '}
                          {e.executed_qty}
                        </span>
                        <span className="text-[#848e9c]">
                          {new Date(e.executed_at).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Section>
              <Section title="포지션 스냅샷" hint="동일 run+symbol 최근">
                {(data.positions?.length ?? 0) === 0 ? (
                  <Empty text="포지션 없음" />
                ) : (
                  <JsonBlock data={data.positions} />
                )}
              </Section>
              <Section title="청산">
                {(data.trades?.length ?? 0) === 0 ? (
                  <Empty text="청산 없음" />
                ) : (
                  <div className="space-y-1">
                    {data.trades!.map((t) => (
                      <div
                        key={t.trade_id}
                        className="text-[11px] flex flex-wrap gap-x-3 text-[#eaecef] bg-[#0b0e11] border border-[#2b3139] rounded px-2 py-1.5"
                      >
                        <span className={t.side === 'LONG' ? 'text-[#0ecb81]' : 'text-[#f6465d]'}>
                          {t.side}
                        </span>
                        <span
                          className={
                            t.realized_pnl >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'
                          }
                        >
                          {t.realized_pnl >= 0 ? '+' : ''}
                          {t.realized_pnl.toFixed(2)} USDT
                        </span>
                        <span className="text-[#848e9c]">{t.exit_reason}</span>
                        <span className="text-[#848e9c]">
                          {new Date(t.closed_at).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Section>
              <Section title="감사/리스크 로그">
                {(data.audit_logs?.length ?? 0) === 0 ? (
                  <Empty text="로그 없음" />
                ) : (
                  <JsonBlock data={data.audit_logs} />
                )}
              </Section>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default TickDetailModal;
