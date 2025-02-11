import { Button } from '@/components/ui/button';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full h-14 bg-white/80 backdrop-blur-md shadow-md flex items-center justify-between px-6 z-50">
      <div className="text-xl font-bold">MyApp</div>
      <div className="flex space-x-4">
        <Button variant="ghost">Main</Button>
        <Button variant="ghost">*EVENT*</Button>
        <Button variant="ghost">Product</Button>
        <Button variant="ghost">장바구니</Button>
        <Button variant="ghost">고객센터</Button>
      </div>
    </nav>
  );
}
