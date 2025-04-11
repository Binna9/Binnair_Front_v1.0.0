import { useEffect, useRef, useState } from 'react';
import MainLayout from '@/layouts/MainLayout';
import OptionsList from '@/components/ui/OptionsList';
import NoticeBoard from '@/components/board/NoticeBoard';
import MachineCard from '@/components/ui/MachineCard';
import PopularCard from '@/components/ui/PopularCard';

export default function MainPage() {
  const [isPopularVisible, setIsPopularVisible] = useState(false);
  const [isMachineVisible, setIsMachineVisible] = useState(false);
  const popularRef = useRef(null);
  const machineRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (popularRef.current) {
        const popularRect = popularRef.current.getBoundingClientRect();
        setIsPopularVisible(popularRect.top < window.innerHeight - 100);
      }

      if (machineRef.current) {
        const machineRect = machineRef.current.getBoundingClientRect();
        setIsMachineVisible(machineRect.top < window.innerHeight - 100);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <MainLayout>
      <div className="w-full max-w-[96rem] mx-auto">
        <NoticeBoard />
        <div className="flex flex-col gap-28 py-32">
          {/* OptionsList 섹션 */}
          <div className="w-full">
            <div className="w-fit mr-auto text-left pl-72 mb-12">
              <h2 className="text-5xl font-bold text-white mb-4 custom-text-shadow">
                Trading Solution : AI
              </h2>
              <p className="text-lg text-white mb-6 custom-text-shadow">
                Deep Running AI와 자동화 기술이 결합된 혁신적인 트레이딩 솔루션.{' '}
                <br />
                실시간 인사이트부터 전략 분석까지, 성공적인 투자를 위한 모든
                기능을 한 곳에 담았습니다.
              </p>
            </div>
            <OptionsList />
          </div>

          {/* PopularCard 섹션 */}
          <div
            ref={popularRef}
            className={`w-full transition-all duration-700 transform ${
              isPopularVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-20'
            } my-16`}
          >
            <div className="w-fit mr-auto text-left pl-72 mb-14">
              <h2 className="text-5xl font-bold text-white mb-4 custom-text-shadow">
                Leafy Haven: Indoor
              </h2>
              <p className="text-lg text-white mb-6 custom-text-shadow">
                Transform your space into a green sanctuary with our carefully
                curated selection of indoor plants. <br></br> Each plant is
                chosen for its unique characteristics and air-purifying
                qualities.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-8 sm:gap-16">
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
              <PopularCard
                gradient="pink-blue"
                title="Hot This Month!"
                description="BinnAIR"
              />
            </div>
          </div>

          {/* MachineCard 섹션 */}
          <div
            ref={machineRef}
            className={`w-full transition-all duration-700 transform ${
              isMachineVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-20'
            } my-16`}
          >
            <div className="w-fit mr-auto text-left pl-72 mb-14">
              <h2 className="text-5xl font-bold text-white mb-4 custom-text-shadow">
                Leafy Haven: Indoor
              </h2>
              <p className="text-lg text-white mb-6 custom-text-shadow">
                Transform your space into a green sanctuary with our carefully
                curated selection of indoor plants. <br></br> Each plant is
                chosen for its unique characteristics and air-purifying
                qualities.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-8">
              <div className="relative w-full sm:w-auto max-w-sm">
                <div className="absolute inset-0 bg-white opacity-50 blur-2xl rounded-lg scale-105"></div>
                <MachineCard
                  title="발라리안"
                  description="play ground in world from VAPE"
                  date="2025-02-20"
                  image="https://images.unsplash.com/photo-1496979551903-46e46589a88b"
                  className="relative z-10 shadow-2xl"
                />
              </div>
              <div className="relative w-full sm:w-auto max-w-sm mt-8 sm:mt-0">
                <div className="absolute inset-0 bg-white opacity-50 blur-2xl rounded-lg scale-105"></div>
                <MachineCard
                  title="스페셜 에디션 후드"
                  description="따뜻하고 스타일리시한 후드"
                  date="2025-02-18"
                  image="https://tvseriescritic.files.wordpress.com/2016/10/stranger-things-bicycle-lights-children.jpg"
                  className="relative z-10 shadow-2xl"
                />
              </div>
              <div className="relative w-full sm:w-auto max-w-sm">
                <div className="absolute inset-0 bg-white opacity-50 blur-2xl rounded-lg scale-105"></div>
                <MachineCard
                  title="발라리안"
                  description="play ground in world from VAPE"
                  date="2025-02-20"
                  image="https://images.unsplash.com/photo-1496979551903-46e46589a88b"
                  className="relative z-10 shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
