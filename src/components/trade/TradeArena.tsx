import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import {
  setIframeLoaded,
  setIframeError,
  setLastUrl,
} from '@/store/slices/iframeSlice';
import BaseLayout from '@/layouts/BaseLayout';

const TradeArena: React.FC = () => {
  const dispatch = useDispatch();
  const { isLoaded, hasError, lastUrl } = useSelector(
    (state: RootState) => state.iframe
  );

  useEffect(() => {
    const currentUrl = 'http://127.0.0.1:8501/?embedded=true';
    dispatch(setLastUrl(currentUrl));
  }, [dispatch]);

  useEffect(() => {
    dispatch(setIframeLoaded(false));
    dispatch(setIframeError(false));
  }, [lastUrl, dispatch]);

  return (
    <BaseLayout className="h-[850px] overflow-hidden p-0">
      <div className="relative w-full h-full">
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

        <iframe
          className="w-full border-none block"
          src={lastUrl}
          title="AI Trade Monitoring"
          style={{ height: '850px' }}
          onLoad={() => dispatch(setIframeLoaded(true))}
          onError={() => dispatch(setIframeError(true))}
          sandbox="allow-same-origin allow-scripts allow-forms"
        />
      </div>
    </BaseLayout>
  );
};

export default TradeArena;
