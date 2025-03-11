import MainLayout from '@/layouts/MainLayout';
import EventProduct from '@/components/product/EventProduct'; // EventProduct 경로에 맞게 수정

export default function EventPage() {
  return (
    <MainLayout>
      <div className="container mx-auto p-4 relative overflow-hidden h-screen">
        <EventProduct />
      </div>
    </MainLayout>
  );
}
