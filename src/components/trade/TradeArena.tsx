import React from 'react';
import TradingLayout from './TradingLayout';

/**
 * Navbar/Footer 제외 영역 전체를 쓰는 Binance Futures 스타일 트레이딩 화면.
 */
const TradeArena: React.FC = () => {
  return (
    <div className="min-w-0 w-full">
      <TradingLayout />
    </div>
  );
};

export default TradeArena;
