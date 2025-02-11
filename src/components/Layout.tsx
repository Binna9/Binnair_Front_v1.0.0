import { Button } from '@/components/ui/button';

export default function Layout() {
  return (
    <div className="flex flex-col h-screen justify-center items-center bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800">
        React + Vite + Tailwind UI
      </h1>
      <Button variant="default" className="mt-4">
        Get Started
      </Button>
    </div>
  );
}
