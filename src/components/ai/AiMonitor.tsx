import React, { useState } from 'react';

const AiMonitor: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="container mx-auto p-6 flex justify-center mt-16 min-h-[900px]">
      <div
        className="w-full max-w-[1400px] bg-white rounded-lg h-[800px] overflow-hidden relative"
        style={{
          boxShadow:
            '0 0 20px 10px rgba(0, 0, 0, 0.5), 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        }}
      >
        {/* 로딩 or 에러 표시 */}
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-white">
            <span className="text-gray-500 text-lg">🔄 로딩 중입니다...</span>
          </div>
        )}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-white">
            <span className="text-red-500 text-lg">❌ AI 모니터 연결 실패</span>
          </div>
        )}

        {/* iframe */}
        <iframe
          className="w-full h-[800px] " // ✅ 기존 h-full 대신 고정 높이
          src="http://127.0.0.1:8501/?embedded=true"
          title="AI Trade Monitoring"
          style={{
            height: '800px', // ✅ Footer 공간 고려해서 720px로 고정
            border: 'none',
            display: 'block',
          }}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          sandbox="allow-same-origin allow-scripts allow-forms"
        />
      </div>
    </div>
  );
};

export default AiMonitor;
