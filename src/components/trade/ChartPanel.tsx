import React, { useEffect, useRef } from 'react';
import { useSymbolStore } from '@/store/trading/symbolStore';
import { mapBinancePerpToTradingView } from '@/utils/tradingViewSymbol';

const TV_SCRIPT_SRC = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';

function buildWidgetConfig(tvSymbol: string) {
  return {
    autosize: true,
    symbol: tvSymbol,
    interval: 'D',
    timezone: 'Asia/Seoul',
    theme: 'dark',
    style: '1',
    locale: 'kr',
    allow_symbol_change: false,
    hide_top_toolbar: false,
    save_image: false,
    calendar: false,
    support_host: 'https://www.tradingview.com',
  };
}

const ChartPanel: React.FC = () => {
  const selectedSymbol = useSymbolStore((s) => s.selectedSymbol);
  const tvSymbol = mapBinancePerpToTradingView(selectedSymbol);
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const widgetEl = widgetRef.current;
    if (!container || !widgetEl) return;

    const cleanup = () => {
      container.querySelectorAll('script').forEach((s) => s.remove());
      widgetEl.innerHTML = '';
    };

    // Strict Mode에서 effect가 두 번 돌 때, 다음 틱에 한 번만 마운트되도록 해서 차트 두 개 생기는 것 방지
    const tid = setTimeout(() => {
      cleanup();
      const script = document.createElement('script');
      script.src = TV_SCRIPT_SRC;
      script.async = true;
      script.type = 'text/javascript';
      script.innerHTML = JSON.stringify(buildWidgetConfig(tvSymbol));
      container.appendChild(script);
    }, 0);

    return () => {
      clearTimeout(tid);
      cleanup();
    };
  }, [tvSymbol]);

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-[#0b0e11]">
      <div
        className="flex-1 min-h-0 flex flex-col overflow-hidden bg-[#131a22]"
        style={{ minHeight: '200px' }}
      >
        <div
          ref={containerRef}
          className="tradingview-widget-container h-full w-full flex flex-col"
          style={{ minHeight: '180px' }}
        >
          <div
            ref={widgetRef}
            className="tradingview-widget-container__widget flex-1 w-full"
            style={{ minHeight: '180px' }}
          />
        </div>
      </div>
    </div>
  );
};

export default ChartPanel;
