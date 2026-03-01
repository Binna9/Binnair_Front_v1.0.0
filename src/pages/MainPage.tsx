import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import NoticeBoard from '@/components/board/NoticeBoard';
import SubscriptionCard from '@/components/ui/SubscriptionCard';
import PopularCard from '@/components/ui/PopularCard';
import AnomalyTopList from '@/components/anomaly/AnomalyTopList';

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
      {/* 가운데 어두운 그라데이션 오버레이 */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.3) 40%, transparent 80%)'
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[62rem] mx-auto px-4 overflow-visible">
        <NoticeBoard />
        <div className="flex flex-col gap-16 py-16">
          {/* 이상 리스트 4개 영역 - 흰색 카드 */}
          <div className="w-full mt-16 relative">
            <div className="w-full text-center mb-6">
              <h2 className="text-4xl font-bold text-white mb-6 font-['Orbitron'] tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-500 flex items-center justify-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10"
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
              <p className="text-base text-white/90 custom-text-shadow">
                Deep Running AI와 자동화 기술이 결합된 혁신적인 트레이딩 솔루션
              </p>
            </div>
            <div className="relative w-full">
              <AnomalyTopList />
              {/* 점수 등급 안내 - absolute로 옆에 배치, 리스트 공간 침범 안 함 */}
              <div
                className="absolute top-0 left-full rounded-lg shadow-md ml-3"
                style={{
                  width: 160,
                  padding: '16px 12px',
                  background: '#ffffff',
                  border: '1px solid rgba(0,0,0,0.08)',
                  marginTop: 0,
                }}
              >
                <div className="text-[10px] font-bold text-gray-800 mb-2 tracking-wide">
                  점수 등급 안내
                </div>
                <div className="flex flex-col gap-2">
                  {[
                    { key: 'SEVERE', fg: '#dc2626', label: '위험', desc: '5 이상' },
                    { key: 'ANOMALY', fg: '#ea580c', label: '이상', desc: '3 이상 ~ 5 미만' },
                    { key: 'WATCH', fg: '#d97706', label: '주의', desc: '2 이상 ~ 3 미만' },
                    { key: 'NORMAL', fg: '#64748b', label: '정상', desc: '2 미만' },
                  ].map(({ key, fg, label, desc }) => (
                    <div key={key} className="flex items-center gap-2">
                      <span
                        className="flex-shrink-0 rounded-sm"
                        style={{ width: 6, height: 6, background: fg }}
                      />
                      <div>
                        <div className="text-[10px] font-semibold" style={{ color: fg }}>{label}</div>
                        <div className="text-[8px] text-gray-500">{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* PopularCard 섹션 */}
          <div
            ref={popularRef}
            className={`w-full transition-all duration-700 transform ${isPopularVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-20'
              } my-8`}
          >
            <div className="w-fit mx-auto text-center mb-8">
              <p className="text-base text-white mb-4 custom-text-shadow">
                주식·코인 예측 그래프와 뉴스/이슈 위험도 지표를 한 곳에서 확인하세요.
                <br />
                실시간 데이터 업데이트와 근거 기반 스코어로 빠르게 의사결정합니다.
              </p>
              {/* 선택: 버튼 2개를 두면 전환율이 더 좋음 */}
              <div className="flex justify-center gap-3 mt-4">
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="px-5 py-2 rounded-lg bg-white/35 text-white hover:bg-white/50 backdrop-blur">
                  예측 그래프 보기
                </button>
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="px-5 py-2 rounded-lg bg-white/35 text-white hover:bg-white/50 backdrop-blur">
                  위험도 대시보드
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-8">
              <PopularCard
                gradient="pink-blue"
                title="Prediction Graphs"
                description="주식·코인 예측 + 멀티 타임프레임 시그널"
                image="/img/popular_card_01.png"
              />
              <PopularCard
                gradient="purple-cyan"
                title="News Risk Radar"
                description="뉴스/사회 이슈 크롤링 → 위험도 스코어링"
                image="/img/popular_card_02.png"
              />
              <PopularCard
                gradient="pink-blue"
                title="Today’s Snapshot"
                description="Top 위험 키워드 · 변동성 상위 종목"
                image="/img/popular_card_03.png"
              />
            </div>
          </div>
          {/* 구독 플랜 섹션 (MachineCard 대체) */}
          <div
            ref={machineRef}
            className={`w-full transition-all duration-700 transform ${isMachineVisible
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