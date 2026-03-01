import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNoticeBoard } from '@/hooks/board/useNoticeBoard';
import { XCircleIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { BoardType } from '@/types/BoardEnum';

/** HTML 태그 제거 후 순수 텍스트만 반환 */
function stripHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

const NoticeBoard = () => {
  const { boards: notices, loading, error } = useNoticeBoard(BoardType.NOTICE);
  const [hiddenNotices, setHiddenNotices] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState<boolean>(true); // ✅ 공지판 표시 여부
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  const hideNotice = (boardId: string) => {
    setHiddenNotices((prev) => [...prev, boardId]);
  };

  const handleNoticeClick = (boardId: string) => {
    navigate(`/board?boardId=${boardId}`);
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop;
    setIsScrolled(scrollTop > 5); // 스크롤이 10px 이상이면 숨김
  };

  // ✅ `notices?.content`에서 필터링
  const visibleNotices =
    notices.filter((notice) => !hiddenNotices.includes(notice.boardId)) ?? [];

  return (
    <>
      {/* 열기 버튼 (닫혀 있을 때만 보임) */}
      <button
        onClick={() => setIsVisible(true)}
        className={`fixed left-0 top-1/2 -translate-y-1/2 z-30
          bg-white/90 text-gray px-2 py-2 rounded-r-lg shadow-[0_4px_10px_rgba(0,0,0,0.5)]
          flex items-center justify-center w-10
          transition-all duration-500 ease-in-out hover:scale-110 active:scale-95
          ${isVisible ? 'opacity-0 pointer-events-none translate-x-[-10px]' : 'opacity-100 translate-x-0'}`}
      >
        <ChevronRightIcon className="w-4 h-4" />
      </button>

      {/* 공지판 (열려 있을 때 보임) */}
      <div
        className={`fixed left-3 top-[56%] -translate-y-1/2 w-[250px] h-[440px] z-30
          bg-cover bg-center border border-white/50 shadow-2xl rounded-xl p-2.5 overflow-hidden text-gray-900
          transition-all duration-500 ease-in-out
          ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 pointer-events-none -translate-x-[280px]'}`}
      style={{
        backgroundImage: "url('/img/noticeboard_image.jpg')",
        backgroundPosition: '40% center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      }} // ✅ 배경 이미지 추가
    >
      {/* ✅ 공지판 닫기 버튼 (상단 오른쪽) */}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-1 right-1 text-zinc-100 hover:text-zinc-300"
      >
        <XCircleIcon className="w-5 h-5" />
      </button>

      <div
        className="h-full overflow-auto custom-scroll notice-scroll mr-[-8px]"
        onScroll={handleScroll}
      >
        {/* ✅ 타이틀 (이미지로 변경 + 중앙 정렬) */}
        <div className="flex justify-center mb-2">
          <img
            src="/img/notice.png"
            alt="Notice"
            className="w-14 h-auto filter invert"
          />
        </div>
        {/* ✅ 에러 메시지 */}
        {error && <p className="text-red-500 text-xs text-center">{error}</p>}

        {/* ✅ 공지사항 리스트 */}
        <ul className="space-y-2 pr-2">
          {loading ? (
            <li className="text-gray-500 text-center text-sm">📢 불러오는 중...</li>
          ) : visibleNotices?.length > 0 ? (
            visibleNotices.map((notice) => (
              <li
                key={notice.boardId}
                className="relative p-2 rounded-lg shadow-md text-gray-900 before:absolute before:inset-0.5 before:bg-white/95 before:rounded-lg before:-z-10 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] hover:before:bg-white"
                onClick={() => handleNoticeClick(notice.boardId)}
              >
                {/* ✅ 개별 공지 닫기 버튼 (각 공지 오른쪽 상단) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    hideNotice(notice.boardId);
                  }}
                  className="absolute top-1 right-1 text-zinc-700 hover:text-zinc-900 z-10"
                >
                  <XCircleIcon className="w-4 h-4" />
                </button>

                <strong className="block text-sm font-semibold">
                  {notice.title}
                </strong>
                <strong className="text-xs">
                  {notice.createDatetime.split('.')[0]}
                </strong>
                <p className="text-xs opacity-80 mt-0.5 line-clamp-2">{stripHtml(notice.content)}</p>
              </li>
            ))
          ) : (
            // ✅ 모든 공지가 닫히면 환영 메시지 표시
            <li className="text-center text-gray-700 font-semibold text-base mt-8">
              <span className="text-white text-lg font-bold mb-2">
                BinnAIR
              </span>
            </li>
          )}
        </ul>
      </div>
    </div>
    </>
  );
};

export default NoticeBoard;
