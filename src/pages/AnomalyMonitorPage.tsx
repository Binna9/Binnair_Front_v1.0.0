import MainLayout from '@/layouts/MainLayout';
import AnomalyDetection from '@/components/anomaly/AnomalyDetection';

export default function AnomalyMonitorPage() {
  return (
    <MainLayout>
      <AnomalyDetection />
    </MainLayout>
  );
}
