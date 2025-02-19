import { useState } from 'react';
import { useNoticeBoard } from '@/hooks/useNoticeBoard';
import { XCircleIcon } from '@heroicons/react/24/solid';

const NoticeBoard = () => {
  const { notices, loading, error } = useNoticeBoard();
  const [hiddenNotices, setHiddenNotices] = useState<string[]>([]);

  const hideNotice = (boardId: string) => {
    setHiddenNotices((prev) => [...prev, boardId]);
  };

  // ✅ 숨겨지지 않은 공지만 필터링
  const visibleNotices = notices.filter(
    (notice) => !hiddenNotices.includes(notice.boardId)
  );

  return (
    <div
      className="fixed left-4 top-1/2 transform -translate-y-1/2 w-80 h-[600px] 
      bg-gray-300/90 border-2 border-white/80 transition-all duration-300
      shadow-2xl rounded-2xl p-5 overflow-auto text-gray-900 custom-scroll"
    >
      {/* ✅ 타이틀 (이미지로 변경 + 중앙 정렬) */}
      <div className="flex justify-center mb-4">
        <img src="/img/notice.png" alt="Notice" className="w-32 h-auto" />
      </div>

      {/* ✅ 에러 메시지 */}
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      {/* ✅ 공지사항 리스트 */}
      <ul className="space-y-3">
        {loading ? (
          <li className="text-gray-500 text-center">📢 불러오는 중...</li>
        ) : visibleNotices.length > 0 ? (
          visibleNotices.map((notice) => (
            <li
              key={notice.boardId}
              className="relative bg-white p-4 rounded-lg shadow-md text-gray-700"
            >
              {/* ✅ 공지 개별 닫기 버튼 (오른쪽 상단) */}
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
  );
};

export default NoticeBoard;
