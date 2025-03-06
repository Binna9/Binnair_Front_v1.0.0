import MainLayout from '@/layouts/MainLayout';
import OptionsList from '@/components/OptionsList';
import NoticeBoard from '@/components/NoticeBoard';
import MachineCard from '@/components/MachineCard';
import PopularCard from '@/components/PopularCard';

export default function MainPage() {
  return (
    <MainLayout>
      <div className="relative w-full max-w-[1800px] mx-auto flex gap-8">
        {/* ✅ 왼쪽 공지사항 (NoticeBoard) */}
        <NoticeBoard />
        {/* ✅ 중앙 콘텐츠 (OptionsList) + 오른쪽 머천카드 */}
        <div className="flex-1 flex">
          {/* ✅ 중앙 OptionsList */}
          <div className="flex-1">
            <div className="flex justify-center mt-20 mb-10 gap-16 ml-24">
              <PopularCard
                gradient="pink-blue"
                title="Hot This Month!"
                description="BinnAIR"
              />
              <PopularCard
                gradient="purple-cyan"
                title="Hot Last Month!"
                description="BinnAIR"
              />
            </div>
            <div className="ml-20">
              <OptionsList />
            </div>
          </div>

          {/* ✅ 오른쪽 MachineCard (사이드바 왼쪽) */}
          <div className="relative top-40 flex flex-col gap-6 z-20 transform -translate-x-36">
            <div className="relative">
              <div className="absolute inset-0 bg-white opacity-50 blur-2xl rounded-lg scale-105"></div>
              <MachineCard
                title="발라리안"
                description="play ground in world from VAPE"
                date="2025-02-20"
                image="https://images.unsplash.com/photo-1496979551903-46e46589a88b"
                className="relative z-10 shadow-2xl"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-white opacity-50 blur-2xl rounded-lg scale-105"></div>
              <MachineCard
                title="스페셜 에디션 후드"
                description="따뜻하고 스타일리시한 후드"
                date="2025-02-18"
                image="https://tvseriescritic.files.wordpress.com/2016/10/stranger-things-bicycle-lights-children.jpg"
                className="relative z-10 shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
