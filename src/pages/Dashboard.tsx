import { Card } from '@/components/ui/card';

export default function Dashboard() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">📊 Statistics</Card>
        <Card className="p-4">📅 Calendar</Card>
        <Card className="p-4">📝 Tasks</Card>
      </div>
    </div>
  );
}
