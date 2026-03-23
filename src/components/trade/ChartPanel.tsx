import React, { useEffect, useRef } from 'react';
import { useSymbolStore } from '@/store/trading/symbolStore';
import { mapBinancePerpToTradingView } from '@/utils/tradingViewSymbol';

const TV_SCRIPT_SRC = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';

function buildWidgetConfig(tvSymbol: string) {
  return {
    autosize: true,
    symbol: tvSymbol,
    interval: '3',
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

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 기존 차트(iframe 포함) 완전 제거 후 새 위젯 마운트
    const mountWidget = () => {
      container.innerHTML = '';
      const widgetDiv = document.createElement('div');
      widgetDiv.className = 'tradingview-widget-container__widget flex-1 w-full';
      widgetDiv.style.minHeight = '180px';
      container.appendChild(widgetDiv);

      // TradingView 위젯: config는 src가 있는 동일 script 태그 본문에 있어야 함
      const script = document.createElement('script');
      script.src = TV_SCRIPT_SRC;
      script.async = true;
      script.type = 'text/javascript';
      script.textContent = JSON.stringify(buildWidgetConfig(tvSymbol));
      container.appendChild(script);
    };

    const tid = setTimeout(mountWidget, 0);

    return () => {
      clearTimeout(tid);
      container.innerHTML = '';
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
        />
      </div>
    </div>
  );
};

export default ChartPanel;
