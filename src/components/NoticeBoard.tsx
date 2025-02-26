import { useState } from 'react';
import { useNoticeBoard } from '@/hooks/useNoticeBoard';
import { XCircleIcon } from '@heroicons/react/24/solid';
import { ChevronRightIcon } from '@heroicons/react/24/solid';

const NoticeBoard = () => {
  const { notices, loading, error } = useNoticeBoard();
  const [hiddenNotices, setHiddenNotices] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState<boolean>(true); // ✅ 공지판 표시 여부

  const hideNotice = (boardId: string) => {
    setHiddenNotices((prev) => [...prev, boardId]);
  };

  // ✅ 숨겨지지 않은 공지만 필터링
  const visibleNotices = notices.filter(
    (notice) => !hiddenNotices.includes(notice.boardId)
  );

  // ✅ 공지판 닫기 버튼 클릭 시
  if (!isVisible) {
    return (
      <button
        className="fixed left-0 top-1/2 transform -translate-y-1/2 
                   bg-gray-700 text-white px-3 py-3 rounded-r-lg shadow-lg z-50
                   flex items-center justify-center w-14"
        onClick={() => setIsVisible(true)}
      >
        <ChevronRightIcon className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div
      className="fixed left-4 top-[56%] transform -translate-y-1/2 w-80 h-[600px] 
    bg-slate-300/90 border-1 border-white/80 transition-all duration-300
    shadow-2xl rounded-2xl p-5 overflow-hidden text-gray-900 z-50"
    >
      {/* ✅ 공지판 닫기 버튼 (상단 오른쪽) */}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
      >
        <XCircleIcon className="w-6 h-6" />
      </button>

      <div className="h-full overflow-auto custom-scroll mr-[-8px]">
        {/* ✅ 타이틀 (이미지로 변경 + 중앙 정렬) */}
        <div className="flex justify-center mb-4">
          <img src="/img/notice.png" alt="Notice" className="w-32 h-auto" />
        </div>

        {/* ✅ 에러 메시지 */}
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        {/* ✅ 공지사항 리스트 */}
        <ul className="space-y-3 pr-2">
          {loading ? (
            <li className="text-gray-500 text-center">📢 불러오는 중...</li>
          ) : visibleNotices.length > 0 ? (
            visibleNotices.map((notice) => (
              <li
                key={notice.boardId}
                className="relative bg-white p-4 rounded-lg shadow-md text-gray-700"
              >
                {/* ✅ 개별 공지 닫기 버튼 (각 공지 오른쪽 상단) */}
                <button
                  onClick={() => hideNotice(notice.boardId)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
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
              <span className="text-gray-900 font-bold">ilpoom</span>에 오신 걸
              환영합니다!
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default NoticeBoard;
