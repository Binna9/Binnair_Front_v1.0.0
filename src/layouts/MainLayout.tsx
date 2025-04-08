import Navbar from '@/components/main/Navbar';
import Sidebar from '@/components/main/Sidebar';
import Footer from '@/components/main/Footer';
import { useLocation } from 'react-router-dom';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { pathname } = useLocation();
  const isMonitorPage = pathname === '/ai-monitor';

  return (
    <div className="relative w-screen min-h-screen flex flex-col z-50">
      {/* 배경 이미지 */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed before:absolute before:inset-0 before:bg-black/30 z-0"
        style={{
          backgroundImage: "url('/img/MainBackGround.jpg')",
          backgroundPosition: '100% center',
        }}
      ></div>

      <Navbar />

      <div className="relative flex flex-1">
        <Sidebar />
        <main
          className={`flex-1 p-6 ${
            isMonitorPage
              ? 'overflow-y-auto' // ✅ 스크롤로 충분, 높이 고정 ❌
              : 'min-h-[1000px]'
          }`}
        >
          {children}
        </main>
      </div>

      <Footer className="mt-auto" />
    </div>
  );
}
