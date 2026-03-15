import React from 'react';
import SymbolHeader from '@/components/trade/SymbolHeader';
import ChartPanel from '@/components/trade/ChartPanel';
import OrderBookPanel from '@/components/trade/OrderBookPanel';
import TradesPanel from '@/components/trade/TradesPanel';
import OrderEntryPlaceholder from '@/components/trade/OrderEntryPlaceholder';
import PositionTabsPlaceholder from '@/components/trade/PositionTabsPlaceholder';

/**
 * Binance Futures 스타일 트레이딩 화면 그리드 레이아웃.
 */
const TradingLayout: React.FC = () => {
  return (
    <div className="trading-layout min-h-0 flex flex-col bg-[#0b0e11] text-[#eaecef]">
      {/* 상단: 심볼 바 */}
      <header className="flex-shrink-0 h-14 min-h-[56px] border-b border-[#2b3139] bg-[#0b0e11]">
        <SymbolHeader />
      </header>

      {/* 중앙: 차트·오더북·주문 — 세로 확장, 스크롤 가능 */}
      <div
        className="flex-shrink-0 min-w-0 grid grid-cols-1 lg:grid-cols-[1fr_200px_320px] gap-0"
        style={{ minHeight: '75vh' }}
      >
        <section
          className="min-h-0 flex flex-col border-r border-[#2b3139]"
          style={{ minHeight: '280px' }}
        >
          <ChartPanel />
        </section>
        {/* 우측 왼쪽: Order Book + Trades */}
        <aside className="min-h-0 flex flex-col border-r border-[#2b3139] lg:min-w-0">
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <OrderBookPanel />
            <TradesPanel />
          </div>
        </aside>
        {/* 우측 오른쪽: 주문 패널 */}
        <aside className="min-h-0 flex flex-col lg:min-w-[280px] overflow-hidden">
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <OrderEntryPlaceholder />
          </div>
        </aside>
      </div>

      {/* 하단: 포지션 — 고정 높이, 테이블 영역만 스크롤 */}
      <footer className="flex-shrink-0 h-[360px] flex flex-col border-t border-[#2b3139] bg-[#0b0e11] overflow-hidden">
        <PositionTabsPlaceholder />
      </footer>
    </div>
  );
};

export default TradingLayout;
