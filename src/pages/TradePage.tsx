import MainLayout from '@/layouts/MainLayout';
import TradeArena from '@/components/trade/TradeArena';

/** 트레이드: 전체 스크롤, 차트·포지션 영역 확대. 검은 배경 통일 */
export default function TradePage() {
  return (
    <MainLayout>
      <div className="flex flex-col flex-1 min-h-0 overflow-y-auto overflow-x-hidden -m-6 w-[calc(100%+3rem)] pt-14 bg-[#0b0e11]">
        <TradeArena />
      </div>
    </MainLayout>
  );
}
