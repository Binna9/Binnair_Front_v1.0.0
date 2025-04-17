import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import {
  setIframeLoaded,
  setIframeError,
  setLastUrl,
} from '@/store/slices/iframeSlice';

const DashBoard: React.FC = () => {
  const dispatch = useDispatch();
  const { isLoaded, hasError, lastUrl } = useSelector(
    (state: RootState) => state.iframe
  );

   useEffect(() => {
      // 컴포넌트가 마운트될 때 iframe의 URL을 Redux에 저장
      const currentUrl = 'http://127.0.0.1:8503/?embedded=true';
      dispatch(setLastUrl(currentUrl));
    }, [dispatch]);
  
    // URL이 변경될 때 iframe 상태 초기화
    useEffect(() => {
      dispatch(setIframeLoaded(false));
      dispatch(setIframeError(false));
    }, [lastUrl, dispatch]);
  
    return (
      <div className="container mx-auto p-6 flex justify-center mt-24 min-h-[900px]">
        <div
          className="w-full max-w-[1400px] bg-white rounded-lg h-[850px] overflow-hidden relative"
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
            className="w-full h-[800px]"
            src={lastUrl}
            title="AI Trade Monitoring"
            style={{
              height: '850px',
              border: 'none',
              display: 'block',
            }}
            onLoad={() => dispatch(setIframeLoaded(true))}
            onError={() => dispatch(setIframeError(true))}
            sandbox="allow-same-origin allow-scripts allow-forms"
          />
        </div>
      </div>
    );
  };
  
  export default DashBoard;