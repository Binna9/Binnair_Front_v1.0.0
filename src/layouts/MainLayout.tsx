import Navbar from '@/components/Navbar';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-screen h-screen">
      <div className="absolute inset-0 bg-cover bg-center bg-[url('/img/MainBackGround.jpg')] before:absolute before:inset-0 before:bg-black/10 z-0"></div>
      <Navbar />
      <div className="relative flex h-full">
        <main className="flex-1 p-6 z-10">{children}</main>
      </div>
    </div>
  );
}
