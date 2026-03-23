import { useLocation } from 'react-router-dom';
import Navbar from '@/components/main/Navbar';
import Sidebar from '@/components/main/Sidebar';
import Footer from '@/components/main/Footer';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const location = useLocation();
  const isTradePage = location.pathname === '/trade';

  return (
    <div className="relative w-screen min-h-screen flex flex-col z-50">
      {/* 배경 이미지 */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed before:absolute before:inset-0 before:bg-black/15 z-0"
        style={{
          backgroundImage: "url('/img/MainBackGround.jpg')",
          backgroundPosition: '100% center',
        }}
      ></div>

      <Navbar />

      <div className="relative flex flex-1 min-h-0">
        {!isTradePage && <Sidebar />}
        <main className="flex-1 flex flex-col min-h-0 p-6">
          {children}
        </main>
      </div>

      {!isTradePage && <Footer className="mt-auto flex-shrink-0" />}
    </div>
  );
}
