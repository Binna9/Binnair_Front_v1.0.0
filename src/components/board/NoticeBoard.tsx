import { useState } from 'react';
import { useBoard } from '@/hooks/useBoard'; // ✅ useBoard 사용
import { XCircleIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

const NoticeBoard = () => {
  const { boards: notices, loading, error } = useBoard('NOTICE'); // ✅ 공지사항 데이터 가져오기
  const [hiddenNotices, setHiddenNotices] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState<boolean>(true); // ✅ 공지판 표시 여부
  const [isScrolled, setIsScrolled] = useState(false);

  const hideNotice = (boardId: string) => {
    setHiddenNotices((prev) => [...prev, boardId]);
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop;
    setIsScrolled(scrollTop > 5); // 스크롤이 10px 이상이면 숨김
  };

  // ✅ `notices?.content`에서 필터링
  const visibleNotices =
    notices.filter((notice) => !hiddenNotices.includes(notice.boardId)) ?? [];

  // ✅ 공지판 닫기 버튼 클릭 시
  if (!isVisible) {
    return (
      <button
        className="fixed left-0 top-1/2 transform -translate-y-1/2
             bg-white/90 text-gray px-3 py-3 rounded-r-lg shadow-[0_4px_10px_rgba(0,0,0,0.5)]
             flex items-center justify-center w-14 
             transition-transform duration-300 hover:scale-110 active:scale-95"
        onClick={() => setIsVisible(true)}
      >
        <ChevronRightIcon className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div
      className="fixed left-4 top-[56%] transform -translate-y-1/2 w-80 h-[600px] 
      bg-cover bg-center border border-white/50 transition-all duration-300
      shadow-2xl rounded-2xl p-5 overflow-hidden text-gray-900 z-30"
      style={{
        backgroundImage: "url('/img/noticeboard_image.jpg')",
        backgroundPosition: '100% center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      }} // ✅ 배경 이미지 추가
    >
      {!isScrolled && (
        <span className="absolute top-2 left-3 text-white text-md font-semibold transition-opacity duration-300">
          공지사항
        </span>
      )}
      {/* ✅ 공지판 닫기 버튼 (상단 오른쪽) */}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 text-zinc-100 hover:text-zinc-300"
      >
        <XCircleIcon className="w-6 h-6" />
      </button>

      <div
        className="h-full overflow-auto custom-scroll notice-scroll mr-[-8px]"
        onScroll={handleScroll}
      >
        {/* ✅ 타이틀 (이미지로 변경 + 중앙 정렬) */}
        <div className="flex justify-center mb-4">
          <img
            src="/img/notice.png"
            alt="Notice"
            className="w-24 h-auto filter invert"
          />
        </div>
        {/* ✅ 에러 메시지 */}
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        {/* ✅ 공지사항 리스트 */}
        <ul className="space-y-3 pr-2">
          {loading ? (
            <li className="text-gray-500 text-center">📢 불러오는 중...</li>
          ) : visibleNotices?.length > 0 ? (
            visibleNotices.map((notice) => (
              <li
                key={notice.boardId}
                className="relative p-4 rounded-lg shadow-md text-gray-900 before:absolute before:inset-0 before:bg-white/70 before:rounded-lg before:-z-10"
              >
                {/* ✅ 개별 공지 닫기 버튼 (각 공지 오른쪽 상단) */}
                <button
                  onClick={() => hideNotice(notice.boardId)}
                  className="absolute top-2 right-2 text-zinc-700 hover:text-zinc-900"
                >
                  <XCircleIcon className="w-5 h-5" />
                </button>

                <strong className="block text-lg font-semibold">
                  {notice.title}
                </strong>
                <strong className="text-sm">
                  {notice.createDatetime.split('.')[0]}
                </strong>
                <p className="text-sm opacity-80 mt-1">{notice.content}</p>
              </li>
            ))
          ) : (
            // ✅ 모든 공지가 닫히면 환영 메시지 표시
            <li className="text-center text-gray-700 font-semibold text-lg mt-10">
              <span className="text-white text-2xl font-bold mb-3">
                BinnAIR
              </span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default NoticeBoard;
