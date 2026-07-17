import React from 'react';

interface HistoryPanelFrameProps {
  loading?: boolean;
  children: React.ReactNode;
  message?: string;
  className?: string;
}

/**
 * 히스토리 탭 콘텐츠 프레임 — 높이를 유지한 채 로딩 오버레이만 올린다.
 */
const HistoryPanelFrame: React.FC<HistoryPanelFrameProps> = ({
  loading = false,
  children,
  message = '데이터를 불러오는 중...',
  className = '',
}) => {
  return (
    <div className={`relative flex-1 min-h-0 flex flex-col overflow-hidden ${className}`}>
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0b0e11]/65 backdrop-blur-[2px] transition-opacity duration-200">
          <div className="flex flex-col items-center gap-3 drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]">
            <div className="relative h-9 w-9">
              <div className="absolute inset-0 rounded-full border-[3px] border-white/20" />
              <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#f0b90b] animate-spin" />
            </div>
            <p className="text-sm text-[#eaecef]">{message}</p>
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

export default HistoryPanelFrame;
