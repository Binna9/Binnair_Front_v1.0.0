import MainLayout from '@/layouts/MainLayout';
import AnomalyDetection from '@/components/ai/AnomalyDetection';

export default function AiMonitorPage() {
  return (
    <MainLayout>
      <AnomalyDetection />
    </MainLayout>
  );
}
