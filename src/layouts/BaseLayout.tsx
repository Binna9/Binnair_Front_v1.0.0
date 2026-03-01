import { ReactNode } from 'react';

interface BaseLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * 게시판/설정 레이아웃과 동일한 크기(max-w-[1300px])의 흰색 기본 레이아웃.
 * 어디서든 재사용 가능한 빈 컨테이너.
 */
export default function BaseLayout({ children, className = '' }: BaseLayoutProps) {
  return (
    <div className="container mx-auto p-4 flex justify-center mt-24 min-h-[700px]">
      <div
        className={`w-full max-w-[1300px] bg-white rounded-lg flex flex-col overflow-hidden ${className}`}
        style={{
          boxShadow:
            '0 0 20px 10px rgba(0, 0, 0, 0.5), 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
