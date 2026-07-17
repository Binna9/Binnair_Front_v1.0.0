import React from 'react';

interface HistoryEmptyStateProps {
  message: string;
  variant?: 'muted' | 'error';
}

/** 테이블/패널 콘텐츠 영역 정중앙 빈 상태 */
const HistoryEmptyState: React.FC<HistoryEmptyStateProps> = ({
  message,
  variant = 'muted',
}) => (
  <div className="flex-1 min-h-0 flex items-center justify-center px-4">
    <p
      className={`text-sm text-center ${
        variant === 'error' ? 'text-[#f6465d]' : 'text-[#848e9c]'
      }`}
    >
      {message}
    </p>
  </div>
);

export default HistoryEmptyState;
