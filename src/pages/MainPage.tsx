import MainLayout from '@/layouts/MainLayout';
import OptionsList from '@/components/OptionsList';
import Sidebar from '@/components/Sidebar';
import NoticeBoard from '@/components/NoticeBoard';

export default function MainPage() {
  return (
    <MainLayout>
      <div className="relative w-full max-w-5xl mx-auto">
        <h1
          className="playfair absolute top-32 left-12 text-6xl font-extrabold tracking-wide z-20
          bg-gradient-to-b from-white to-gray-400 text-transparent bg-clip-text
          drop-shadow-[8px_8px_6px_rgba(0,0,0,0.8)] shadow-[0px_4px_4px_rgba(255,255,255,0.3)]
          antialiased subpixel-antialiased"
        >
          Product
        </h1>

        <div className="mt-4">
          <OptionsList />
        </div>
        <NoticeBoard />
        <Sidebar />
      </div>
    </MainLayout>
  );
}
