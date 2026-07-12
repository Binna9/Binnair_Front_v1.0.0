import React, { useEffect } from 'react';
import { useSymbolStore } from '@/store/trading/symbolStore';
import { useBinanceFuturesSocket } from '@/hooks/trading/useBinanceFuturesSocket';
import { useAllSymbolsTicker } from '@/hooks/trading/useAllSymbolsTicker';
import { useLiveAccountSocket } from '@/hooks/trading/useLiveAccountSocket';
import SymbolHeader from '@/components/trade/SymbolHeader';
import ChartPanel from '@/components/trade/ChartPanel';
import OrderBookPanel from '@/components/trade/OrderBookPanel';
import TradingControlPanel from '@/components/trade/TradingControlPanel';
import WalletPanel from '@/components/trade/WalletPanel';
import PositionTabsPlaceholder from '@/components/trade/PositionTabsPlaceholder';

const DEFAULT_SYMBOL = 'BTCUSDT';

/**
 * Binance Futures 스타일 트레이딩 화면 그리드 레이아웃.
 */
const TradingLayout: React.FC = () => {
  const selectedSymbol = useSymbolStore((s) => s.selectedSymbol);
  const setSelectedSymbol = useSymbolStore((s) => s.setSelectedSymbol);

  useEffect(() => {
    setSelectedSymbol(DEFAULT_SYMBOL);
  }, [setSelectedSymbol]);

  useBinanceFuturesSocket(selectedSymbol);
  useAllSymbolsTicker();
  useLiveAccountSocket();

  return (
    <div className="trading-layout min-h-0 flex flex-col bg-[#0b0e11] text-[#eaecef]">
      {/* 상단: 심볼 바 */}
      <header className="flex-shrink-0 h-14 min-h-[56px] border-b border-[#2b3139] bg-[#0b0e11]">
        <SymbolHeader />
      </header>

      {/* 중앙: 차트·오더북·주문 — 높이 고정(75vh)해서 차트 렌더링 변동이 하단 패널을 밀지 않게 함 */}
      <div
        className="flex-shrink-0 min-w-0 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_200px_360px] gap-0 overflow-hidden"
        style={{ height: '75vh' }}
      >
        <section className="min-h-0 h-full flex flex-col border-r border-[#2b3139] overflow-hidden">
          <ChartPanel />
        </section>
        {/* 우측 왼쪽: Order Book */}
        <aside className="min-h-0 flex flex-col border-r border-[#2b3139] lg:min-w-0">
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <OrderBookPanel />
          </div>
        </aside>
        {/* 우측 오른쪽: 컨트롤 패널 */}
        <aside className="hidden min-h-0 flex-col overflow-hidden border-l border-[#2b3139] bg-[#0b0e11] lg:flex lg:min-w-[360px]">
          <TradingControlPanel />
        </aside>
      </div>

      {/* 하단: 포지션 — 고정 높이, 테이블 영역만 스크롤 */}
      <footer className="flex-shrink-0 h-[360px] flex flex-col border-t border-[#2b3139] bg-[#0b0e11] overflow-hidden">
        <div className="h-full min-h-0 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-0">
          <div className="min-h-0 overflow-hidden border-r border-[#2b3139]">
            <PositionTabsPlaceholder />
          </div>
          <aside className="min-h-0 overflow-hidden border-l border-[#2b3139]">
            <WalletPanel />
          </aside>
        </div>
      </footer>
    </div>
  );
};

export default TradingLayout;
