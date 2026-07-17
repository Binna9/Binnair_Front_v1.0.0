import React, { useEffect } from 'react';
import { useSymbolStore } from '@/store/trading/symbolStore';
import { useBinanceFuturesSocket } from '@/hooks/trading/useBinanceFuturesSocket';
import { useAllSymbolsTicker } from '@/hooks/trading/useAllSymbolsTicker';
import { useLiveAccountSocket } from '@/hooks/trading/useLiveAccountSocket';
import SymbolHeader from '@/components/trade/SymbolHeader';
import ChartPanel from '@/components/trade/ChartPanel';
import OrderBookPanel from '@/components/trade/OrderBookPanel';
import RecentTradesPanel from '@/components/trade/RecentTradesPanel';
import TradingControlPanel from '@/components/trade/TradingControlPanel';
import WalletPanel from '@/components/trade/WalletPanel';
import PositionTabsPlaceholder from '@/components/trade/PositionTabsPlaceholder';

const DEFAULT_SYMBOL = 'BTCUSDT';

/** 패널 카드: 라운드 + 얕은 입체감 */
const panelCard =
  'min-h-0 overflow-hidden rounded-xl border border-[#2b3139] bg-[#12161c] ' +
  'shadow-[0_6px_20px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]';

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
    <div className="trading-layout min-h-0 flex flex-col gap-2.5 p-2.5 bg-[#07090c] text-[#eaecef]">
      {/* 상단: 심볼 바 */}
      <header className={`flex-shrink-0 h-14 min-h-[56px] ${panelCard}`}>
        <SymbolHeader />
      </header>

      {/* 중앙: 차트·오더북·주문 — 높이 고정(75vh)해서 차트 렌더링 변동이 하단 패널을 밀지 않게 함 */}
      <div
        className="flex-shrink-0 min-w-0 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_200px_360px] gap-2.5"
        style={{ height: '75vh' }}
      >
        <section className={`h-full flex flex-col ${panelCard}`}>
          <ChartPanel />
        </section>
        <aside className={`flex flex-col lg:min-w-0 ${panelCard}`}>
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <OrderBookPanel />
            <RecentTradesPanel />
          </div>
        </aside>
        <aside
          className={`hidden flex-col lg:flex lg:min-w-[360px] ${panelCard}`}
        >
          <TradingControlPanel />
        </aside>
      </div>

      {/* 하단: 포지션 — 고정 높이, 테이블 영역만 스크롤 */}
      <footer className="flex-shrink-0 h-[360px]">
        <div className="h-full min-h-0 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-2.5">
          <div className={panelCard}>
            <PositionTabsPlaceholder />
          </div>
          <aside className={panelCard}>
            <WalletPanel />
          </aside>
        </div>
      </footer>
    </div>
  );
};

export default TradingLayout;
