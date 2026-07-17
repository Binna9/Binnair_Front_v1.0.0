import MainLayout from '@/layouts/MainLayout';
import TradeHistoryDashboard from '@/components/trade/TradeHistoryDashboard';

export default function HistoryPage() {
  return (
    <MainLayout>
      <div className="flex flex-col flex-1 min-h-0 w-full pt-16 pb-4 px-1">
        <TradeHistoryDashboard />
      </div>
    </MainLayout>
  );
}
