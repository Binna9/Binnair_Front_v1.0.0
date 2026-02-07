import React, { useState } from 'react';
import AnomalyChart from './AnomalyChart';
import { AnomalyThreshold } from '@/types/AnomalyTypes';
import { Activity, History } from 'lucide-react';

type TabMode = 'realtime' | 'history';

/**
 * 이상탐지 메인 컴포넌트
 * 실시간 모니터링 및 과거 데이터 조회
 */
const AnomalyDetection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabMode>('realtime');
  const [venueId] = useState(1); // 기본값, 추후 props나 설정에서 받아올 수 있음
  const [instrumentId] = useState(100); // 기본값, 추후 props나 설정에서 받아올 수 있음
  const [timeframe, setTimeframe] = useState('5m');
  const [scoreVersion] = useState('z_v1'); // 기본값
  
  // 실시간 탭 설정
  const [realtimeDays, setRealtimeDays] = useState(1);
  const [realtimeThreshold, setRealtimeThreshold] = useState<AnomalyThreshold>({ score: 2.0 });
  
  // 조회 탭 설정
  const [historyStartDate, setHistoryStartDate] = useState<string>('');
  const [historyEndDate, setHistoryEndDate] = useState<string>('');
  const [historyThreshold, setHistoryThreshold] = useState<AnomalyThreshold>({ score: 2.0 });

  // 날짜 초기화 (기본값: 오늘부터 7일 전)
  React.useEffect(() => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    
    setHistoryEndDate(today.toISOString().split('T')[0]);
    setHistoryStartDate(weekAgo.toISOString().split('T')[0]);
  }, []);

  return (
    <div className="container mx-auto p-4 flex justify-center mt-24 min-h-[700px]">
      {/* 메인 컨테이너 */}
      <div
        className="w-full max-w-[1400px] bg-white rounded-lg flex flex-col h-auto"
        style={{
          boxShadow:
            '0 0 20px 10px rgba(0, 0, 0, 0.5), 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        }}
      >
        {/* 헤더 영역 */}
        <div className="relative px-4 py-3 bg-gradient-to-r from-gray-600 via-gray-800 to-gray-700 rounded-t-lg">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full blur-2xl"></div>

          <div className="relative z-10">
            <div className="flex items-center space-x-2.5 mb-1.5">
              <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Activity className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  이상탐지
                </h1>
                <p className="mt-0.5 text-blue-100/90 text-xs">
                  실시간 이상점수 모니터링 및 과거 데이터 조회
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 네비게이션 탭 */}
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('realtime')}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === 'realtime'
                  ? 'bg-gray-800 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>실시간 모니터링</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === 'history'
                  ? 'bg-gray-800 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <History className="w-4 h-4" />
              <span>과거 데이터 조회</span>
            </button>
          </div>
        </div>

        {/* 콘텐츠 영역 */}
        <div className="p-6">
            {/* 실시간 모니터링 콘텐츠 */}
            {activeTab === 'realtime' && (
              <div className="space-y-6">
              {/* 설정 패널 */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* 타임프레임 선택 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      타임프레임
                    </label>
                    <select
                      value={timeframe}
                      onChange={(e) => setTimeframe(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="1m">1분</option>
                      <option value="5m">5분</option>
                      <option value="15m">15분</option>
                      <option value="30m">30분</option>
                      <option value="1h">1시간</option>
                      <option value="4h">4시간</option>
                      <option value="1d">1일</option>
                    </select>
                  </div>

                  {/* 조회 기간 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      조회 기간 (일)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={realtimeDays}
                      onChange={(e) => setRealtimeDays(parseInt(e.target.value, 10))}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* 이상치 기준 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      이상치 기준 (Score)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={realtimeThreshold.score}
                      onChange={(e) =>
                        setRealtimeThreshold({ ...realtimeThreshold, score: parseFloat(e.target.value) })
                      }
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* 자동 갱신 정보 */}
                  <div className="flex items-end">
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3 w-full">
                      <p className="text-xs text-blue-600 font-medium">자동 갱신 활성화</p>
                      <p className="text-xs text-blue-500 mt-1">
                        {timeframe}마다 자동 갱신
                      </p>
                    </div>
                  </div>
                </div>
              </div>

                {/* 차트 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <AnomalyChart
                    venueId={venueId}
                    instrumentId={instrumentId}
                    timeframe={timeframe}
                    scoreVersion={scoreVersion}
                    days={realtimeDays}
                    threshold={realtimeThreshold}
                    autoRefresh={true}
                  />
                </div>
              </div>
            )}

            {/* 과거 데이터 조회 콘텐츠 */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                {/* 조회 설정 패널 */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* 타임프레임 선택 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        타임프레임
                      </label>
                      <select
                        value={timeframe}
                        onChange={(e) => setTimeframe(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="1m">1분</option>
                        <option value="5m">5분</option>
                        <option value="15m">15분</option>
                        <option value="30m">30분</option>
                        <option value="1h">1시간</option>
                        <option value="4h">4시간</option>
                        <option value="1d">1일</option>
                      </select>
                    </div>

                    {/* 시작 날짜 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        시작 날짜
                      </label>
                      <input
                        type="date"
                        value={historyStartDate}
                        onChange={(e) => setHistoryStartDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* 종료 날짜 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        종료 날짜
                      </label>
                      <input
                        type="date"
                        value={historyEndDate}
                        onChange={(e) => setHistoryEndDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* 이상치 기준 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        이상치 기준 (Score)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={historyThreshold.score}
                        onChange={(e) =>
                          setHistoryThreshold({ ...historyThreshold, score: parseFloat(e.target.value) })
                        }
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 차트 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  {historyStartDate && historyEndDate ? (
                    <AnomalyChart
                      venueId={venueId}
                      instrumentId={instrumentId}
                      timeframe={timeframe}
                      scoreVersion={scoreVersion}
                      startDate={historyStartDate}
                      endDate={historyEndDate}
                      threshold={historyThreshold}
                      autoRefresh={false}
                    />
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      시작 날짜와 종료 날짜를 선택해주세요.
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AnomalyDetection;

