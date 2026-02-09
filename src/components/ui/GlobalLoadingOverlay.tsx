import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';

type GlobalLoadingOverlayProps = {
  /**
   * 로딩이 아주 짧게 끝날 때 “깜빡임” 방지용 지연(ms)
   * - delay 동안 로딩이 끝나면 아예 표시하지 않음
   */
  showDelayMs?: number;
  /**
   * 표시된 이후 최소 유지 시간(ms)
   * - 너무 빨리 사라져서 “튕기는” 느낌 방지
   */
  minVisibleMs?: number;
};

export const GlobalLoadingOverlay: React.FC<GlobalLoadingOverlayProps> = ({
  showDelayMs = 150,
  minVisibleMs = 450,
}) => {
  const apiInFlight = useSelector((s: RootState) => s.ui.apiInFlight);
  const routePending = useSelector((s: RootState) => s.ui.routePending);

  const rawLoading = apiInFlight > 0 || routePending;

  const [visible, setVisible] = useState(false);
  const showTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const shownAtRef = useRef<number | null>(null);

  const statusText = useMemo(() => {
    if (routePending) return '화면 전환 중...';
    if (apiInFlight > 0) return '데이터를 불러오는 중...';
    return '로딩 중...';
  }, [apiInFlight, routePending]);

  useEffect(() => {
    // 타이머 정리 유틸
    const clearTimers = () => {
      if (showTimerRef.current) window.clearTimeout(showTimerRef.current);
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
      showTimerRef.current = null;
      hideTimerRef.current = null;
    };

    clearTimers();

    if (rawLoading) {
      // delay 후에도 로딩이면 표시
      showTimerRef.current = window.setTimeout(() => {
        setVisible(true);
        shownAtRef.current = Date.now();
      }, showDelayMs);
      return () => clearTimers();
    }

    // rawLoading이 꺼졌을 때: visible이면 최소 노출 시간 보장 후 숨김
    if (!visible) return () => clearTimers();

    const shownAt = shownAtRef.current ?? Date.now();
    const elapsed = Date.now() - shownAt;
    const remain = Math.max(0, minVisibleMs - elapsed);

    hideTimerRef.current = window.setTimeout(() => {
      setVisible(false);
      shownAtRef.current = null;
    }, remain);

    return () => clearTimers();
    // visible을 dependency에 넣어야 “표시된 후” 최소 유지가 적용됨
  }, [minVisibleMs, rawLoading, showDelayMs, visible]);

  if (!visible) return null;

  return (
    // 배경은 흐리게(딤+블러) 유지, 흰색 카드(네모 박스)는 제거
    // - pointer-events-none: 로딩 중에도 화면 조작은 막지 않음
    <div className="fixed inset-0 z-[9999] bg-black/10 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
      <div className="flex items-center gap-4 drop-shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 rounded-full border-[5px] border-white/25" />
          <div className="absolute inset-0 rounded-full border-[5px] border-transparent border-t-white animate-spin" />
        </div>

        <div className="min-w-0">
          <div className="text-base font-semibold text-white leading-tight">Loading</div>
          <div className="mt-0.5 text-sm text-white/80 truncate">{statusText}</div>
          <div className="mt-3 h-1.5 w-[360px] max-w-[70vw] rounded-full bg-white/15 overflow-hidden">
            <div className="h-full w-1/3 rounded-full bg-white/60 animate-[loadingBar_1.2s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes loadingBar {
            0% { transform: translateX(-120%); }
            50% { transform: translateX(60%); }
            100% { transform: translateX(220%); }
          }
        `}
      </style>
    </div>
  );
};

