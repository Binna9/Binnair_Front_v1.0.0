import MainLayout from '@/layouts/MainLayout';
import EventProduct from '@/components/product/EventProduct';

export default function EventPage() {
  return (
    <MainLayout>
      <div className="container mx-auto p-4 relative overflow-hidden h-screen">
        <EventProduct />
      </div>
    </MainLayout>
  );
}
