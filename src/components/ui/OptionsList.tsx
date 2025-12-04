import { useState } from 'react';
import { TrendingUp, LineChart, Bot, ShieldCheck, Award } from 'lucide-react';

const options = [
  {
    title: '실시간 시장 인사이트',
    subtitle: 'AI가 즉각적으로 시장 흐름을 포착합니다',
    icon: <TrendingUp className="text-blue-600" />,
    background: '/img/chart1.png',
  },
  {
    title: '자동화된 트레이딩 전략',
    subtitle: '검증된 알고리즘으로 정밀하게 매매를 수행합니다',
    icon: <LineChart className="text-green-600" />,
    background: '/img/chart2.png',
  },
  {
    title: 'AI 기반 가격 예측',
    subtitle: '딥러닝으로 미래 시세를 예측합니다',
    icon: <Bot className="text-purple-600" />,
    background: '/img/chart3.png',
  },
  {
    title: '리스크 관리 시스템',
    subtitle: 'AI가 자산 손실을 최소화합니다',
    icon: <ShieldCheck className="text-red-600" />,
    background: '/img/chart4.png',
  },
  {
    title: '성과 분석 리포트',
    subtitle: '수익률과 전략 성과를 한눈에 확인하세요',
    icon: <Award className="text-amber-600" />,
    background: '/img/chart5.png',
  },
];

export default function OptionsList() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, currentTarget } = event;
    const { left, width } = currentTarget.getBoundingClientRect(); // OptionsList 내부 크기 가져오기
    const sectionWidth = width / options.length;
    const newIndex = Math.floor((clientX - left) / sectionWidth);
    setActiveIndex(newIndex);
  };

  const handleMouseLeave = () => {
    setActiveIndex(0); // 마우스를 벗어나면 기본값으로 리셋
  };

  return (
    <div className="relative z-20">
      <div
        className="flex justify-center items-center h-auto w-full max-w-[60%] mx-auto"
        onMouseMove={handleMouseMove} // ✅ 이벤트를 이 div 내부에서만 감지
        onMouseLeave={handleMouseLeave} // ✅ 마우스를 벗어나면 초기화
      >
        <div className="flex space-x-1.5 w-full max-w-full h-[420px]">
          {options.map((option, index) => (
            <div
              key={index}
              className={`relative flex-grow cursor-pointer overflow-hidden transition-all duration-500 rounded-xl shadow-lg
              ${
                activeIndex === index
                  ? 'flex-[5] max-w-[500px]'
                  : 'flex-1 max-w-[110px]'
              }`}
              style={{
                backgroundImage: `url(${option.background})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="absolute inset-0 bg-opacity-30 transition-all duration-500"></div>
              <div className="absolute bottom-3 left-3 flex items-center space-x-2">
                <div className="w-8 h-8 flex items-center justify-center bg-white text-gray-800 rounded-full">
                  {option.icon}
                </div>
                <div
                  className={`text-white transition-opacity duration-500 ${
                    activeIndex === index ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <div
                    className="text-base font-bold whitespace-nowrap"
                    style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.6)' }}
                  >
                    {option.title}
                  </div>
                  <div
                    className="text-xs whitespace-nowrap"
                    style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.5)' }}
                  >
                    {option.subtitle}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
