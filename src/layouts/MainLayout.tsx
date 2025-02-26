import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-screen min-h-screen flex flex-col z-50">
      {/* 배경 이미지 */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-[url('/img/MainBackGround.jpg')] 
        before:absolute before:inset-0 before:bg-black/10 z-0"
      ></div>

      {/* 네비게이션 바 */}
      <Navbar />

      {/* ✅ 메인 컨텐츠 구조 */}
      <div className="relative flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>

      {/* ✅ 푸터가 항상 하단에 있도록 설정 */}
      <Footer />
    </div>
  );
}
