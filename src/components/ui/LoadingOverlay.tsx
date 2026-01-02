import React from 'react';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * 로딩 상태를 자연스럽게 표시하는 오버레이 컴포넌트
 * 기존 콘텐츠를 유지하면서 위에 반투명 오버레이와 스피너를 표시합니다.
 */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = '데이터를 불러오는 중...',
  children,
  className = '',
}) => {
  return (
    <div className={`relative ${className}`}>
      {/* 로딩 오버레이 - 기존 콘텐츠 위에 표시 */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center transition-opacity duration-300 animate-in fade-in">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-zinc-300 border-t-zinc-600 rounded-full animate-spin"></div>
            <p className="text-gray-600 text-sm">{message}</p>
          </div>
        </div>
      )}

      {/* 콘텐츠 영역 */}
      {children}
    </div>
  );
};

