import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import MainLayout from '@/layouts/MainLayout';
import OptionsList from '@/components/ui/OptionsList';
import NoticeBoard from '@/components/board/NoticeBoard';
import SubscriptionCard from '@/components/ui/SubscriptionCard';
import PopularCard from '@/components/ui/PopularCard';

export default function MainPage() {
  const navigate = useNavigate();
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
        <div className="flex flex-col gap-16 py-16">
          {/* OptionsList 섹션 */}
          <div className="w-full">  
            <div className="w-full text-center mt-14 mb-8">
              <h2 className="text-5xl font-bold text-white mb-8 font-['Orbitron'] tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-500 flex items-center justify-center gap-3 ">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                BinnAIR Trading Solution
              </h2>
              <p className="text-lg text-white mb-4 custom-text-shadow">
                Deep Running AI와 자동화 기술이 결합된 혁신적인 트레이딩 솔루션{' '}
                <br />
                실시간 인사이트부터 전략 분석까지, 성공적인 투자를 위한 모든
                기능을 한 곳에 담았습니다.
              </p>
              <div className="flex justify-center gap-3 mt-6">
                <button
                  onClick={() => navigate('/trade')}
                  className="px-4 py-2 text-sm bg-gradient-to-r from-red-400 via-red-600 to-red-900 hover:from-red-500 hover:to-red-800 text-white font-semibold rounded-lg transition-all duration-300 flex items-center gap-1.5 shadow-lg hover:shadow-xl"
                >
                  실시간 자동 매매
                  <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => navigate('/ai-monitor')}
                  className="px-4 py-2 text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-300 flex items-center gap-1.5 shadow-lg hover:shadow-xl"
                >
                  AI 모니터링 / 학습
                  <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                </button>
              </div>
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
            } my-8`}
          >
            <div className="w-fit mr-auto text-left pl-32 mb-8">
              <h2 className="text-4xl font-bold text-white mb-3 custom-text-shadow">
                Leafy Haven: Indoor
              </h2>
              <p className="text-base text-white mb-4 custom-text-shadow">
                Transform your space into a green sanctuary with our carefully
                curated selection of indoor plants. <br></br> Each plant is
                chosen for its unique characteristics and air-purifying
                qualities.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-8">
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
          {/* 구독 플랜 섹션 (MachineCard 대체) */}
          <div
            ref={machineRef}
            className={`w-full transition-all duration-700 transform ${
              isMachineVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-20'
            } my-8`}
          >
            <div className="w-fit mx-auto text-center mb-8">
              <h2 className="text-4xl font-bold text-white mb-3 custom-text-shadow">
                트레이딩 솔루션 구독 플랜
              </h2>
              <p className="text-base text-white mb-4 custom-text-shadow">
                나에게 맞는 플랜을 선택하여 인공지능 트레이딩의 모든 혜택을
                누려보세요. <br />
                언제든지 업그레이드하거나 다운그레이드할 수 있습니다.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
              <SubscriptionCard
                title="무료 체험"
                price="무료"
                description="기본적인 기능을 체험해보세요"
                features={[
                  '기본 시장 분석 리포트',
                  '일일 거래 제안 5개',
                  '실시간 차트 접근',
                  '커뮤니티 게시판 참여',
                ]}
                buttonText="지금 시작하기"
                gradientColors="from-gray-600 to-gray-800"
                isPopular={false}
              />

              <SubscriptionCard
                title="베이직 플랜"
                price="₩29,900"
                description="더 많은 기능과 인사이트를 제공합니다"
                features={[
                  '무료 플랜의 모든 기능',
                  '일일 거래 제안 20개',
                  '기본 AI 분석 도구',
                  '백테스팅 도구 접근',
                  '이메일 알림 서비스',
                ]}
                buttonText="구독하기"
                isPopular={true}
                gradientColors="from-cyan-500 to-blue-600"
              />

              <SubscriptionCard
                title="프로 플랜"
                price="₩79,900"
                description="전문 트레이더를 위한 최고급 기능"
                features={[
                  '베이직 플랜의 모든 기능',
                  '무제한 거래 제안',
                  '고급 AI 예측 모델',
                  '자동 매매 설정',
                  '맞춤형 전략 생성',
                  '우선 기술 지원',
                ]}
                buttonText="프로로 업그레이드"
                gradientColors="from-purple-500 to-pink-600"
                isPopular={false}
              />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
