import React from 'react';
import {
  Headset,
  Bell,
  HelpCircle,
  MessageSquare,
  Mail,
  Pencil,
  XCircle,
  Edit,
  Trash2,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { BoardType } from '@/types/BoardEnum';
import { useAllBoard } from '@/hooks/board/useAllBoard'; // Import the custom hook
import { useNotification } from '@/context/NotificationContext';
import BoardDetail from './BoardDetail';

// ✅ 섹션 배열 (아이콘 추가)
const sections: { id: BoardType; title: string; icon: React.ReactNode }[] = [
  {
    id: BoardType.NOTICE,
    title: '공지사항',
    icon: <Bell className="w-5 h-5 mr-2" />,
  },
  {
    id: BoardType.FAQ,
    title: '자주 묻는 질문',
    icon: <HelpCircle className="w-5 h-5 mr-2" />,
  },
  {
    id: BoardType.FREE,
    title: '자유게시판',
    icon: <MessageSquare className="w-5 h-5 mr-2" />,
  },
  {
    id: BoardType.SUGGESTION,
    title: '문의하기',
    icon: <Mail className="w-5 h-5 mr-2" />,
  },
];

export default function Board() {
  const {
    activeSection,
    boards,
    loading,
    error,
    isWriting,
    isEditing,
    title,
    content,
    selectedSection,
    files,
    currentPage,
    isViewingDetail,
    currentBoard,
    setActiveSection,
    setTitle,
    setContent,
    requireLogin,
    toggleWriteMode,
    handleEdit,
    handleDelete,
    handleSectionChange,
    handleFileChange,
    removeFile,
    handlePostSubmit,
    handlePageChange,
    handleViewDetail,
    handleToggleLike,
    handleToggleUnlike,
    handleBackToList,
  } = useAllBoard();

  const notification = useNotification();

  return (
    <div className="container mx-auto p-4 flex justify-center mt-24 min-h-[700px]">
      {/* 흰색 네모 박스 */}
      <div
        className="w-full max-w-[1200px] bg-white rounded-lg flex h-auto"
        style={{
          boxShadow:
            '0 0 20px 10px rgba(0, 0, 0, 0.5), 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        }}  
      >
        {/* 왼쪽 메뉴 (탭) */}
        <div
          className="w-1/5 border-r p-4 rounded-l-lg flex flex-col justify-between"
          style={{
            backgroundImage: "url('/img/board_image.jpg')",
            backgroundBlendMode: 'overlay',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: '0% 80%',
          }}
        >
          <div>
            <h1 className="text-base font-bold mb-4 text-white flex items-center">
              <Headset className="w-5 h-5 mr-2 text-white" /> 고객센터
            </h1>
            <div className="flex flex-col space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id);
                    if (isWriting) {
                      handleSectionChange({
                        target: { value: section.id },
                      } as React.ChangeEvent<HTMLSelectElement>);
                    }
                    // 상세 페이지 보기 중이었다면 해제
                    if (isViewingDetail) {
                      handleBackToList();
                    }
                  }}
                  className={`w-full flex items-center text-left px-3 py-2 rounded-lg transition text-sm ${
                    activeSection === section.id
                      ? 'bg-zinc-500 text-white font-semibold'
                      : 'bg-zinc-50 text-gray-900 hover:bg-zinc-300'
                  }`}
                >
                  {section.icon} {section.title}
                </button>
              ))}
            </div>
            {/* ✅ 글쓰기 버튼을 메뉴 리스트 아래(중앙)로 이동 */}
            {!isWriting && (
              <button
                className="w-full mt-8 px-3 py-3 bg-white text-gray-900 font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-zinc-200 transition text-sm"
                onClick={() => requireLogin(toggleWriteMode)}
                disabled={loading}
              >
                <Pencil className="w-4 h-4" /> 글 쓰기
              </button>
            )}
          </div>
        </div>

        {/* ✅ 오른쪽 콘텐츠 영역 (게시글 목록 or 글쓰기 폼 or 상세 페이지) */}
        <div className="w-4/5 p-6">
          {isWriting ? (
            // ✅ 글쓰기/수정 모드일 때 (폼)
            <div className="bg-zinc-50 p-4 rounded-lg shadow-lg border">
              <h2 className="text-lg font-bold mb-4">
                {isEditing ? '게시글 수정' : '새 게시글 작성'}
              </h2>

              {/* ✅ 섹션 선택 */}
              <div className="mb-3">
                <label className="block text-gray-900 font-semibold mb-2 text-sm">
                  게시판 선택
                </label>
                <select
                  value={selectedSection}
                  onChange={handleSectionChange}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                >
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* 제목 입력 */}
              <label className="block text-gray-900 font-semibold mb-1 text-sm">
                제목
              </label>
              <input
                type="text"
                placeholder="제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 mb-3 border border-gray-300 rounded-lg text-sm"
              />
              <label className="block text-gray-900 font-semibold mb-1 text-sm">
                내용
              </label>
              {/* 내용 입력 */}
              <textarea
                placeholder="내용을 입력하세요"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-2 h-32 border border-gray-300 rounded-lg text-sm"
              ></textarea>

              {/* ✅ 파일 업로드 */}
              <div className="mt-3">
                <label className="block text-gray-900 font-semibold mb-1 text-sm">
                  파일 첨부
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full p-2 border border-gray-300 rounded-lg bg-white text-sm
  file:bg-blue-500 file:text-white file:border-none file:px-3 file:py-1.5 
  file:rounded-lg file:cursor-pointer file:mr-3 file:hover:bg-blue-600 file:text-xs"
                />
                {/* 파일 목록 */}
                {files.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {files.map((file, index) => (
                      <li
                        key={file.name || index}
                        className="flex items-center justify-between bg-gray-300 p-1.5 rounded-lg text-sm"
                      >
                        <span className="text-gray-800">{file.name}</span>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 transition"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex justify-between mt-3">
                {/* 취소 버튼 */}
                <button
                  onClick={async () => {
                    const isConfirmed = await notification.showConfirm(
                      'CANCEL',
                      '취소하시겠습니까?'
                    );
                    if (isConfirmed) {
                      toggleWriteMode();
                    }
                  }}
                  className="px-3 py-1.5 bg-zinc-500 text-white rounded-lg hover:bg-zinc-600 transition text-sm"
                  disabled={loading}
                >
                  취소
                </button>
                {/* 등록/수정 버튼 */}
                <button
                  onClick={async () => {
                    const isConfirmed = await notification.showConfirm(
                      'UPDATE',
                      `${isEditing ? '수정' : '등록'}하시겠습니까?`
                    );
                    if (isConfirmed) {
                      handlePostSubmit();
                    }
                  }}
                  className="px-3 py-1.5 bg-zinc-300 text-zinc-900 rounded-lg hover:bg-zinc-500 transition text-sm"
                  disabled={loading}
                >
                  {loading ? '처리 중...' : isEditing ? '수정' : '등록'}
                </button>
              </div>
            </div>
          ) : isViewingDetail && currentBoard ? (
            // ✅ 상세 페이지 표시
            <BoardDetail
              boardId={currentBoard.boardId}
              onBack={handleBackToList}
              requireLogin={requireLogin}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              toggleLike={handleToggleLike}
              toggleUnlike={handleToggleUnlike}
            />
          ) : (
            // ✅ 게시글 목록
            <>
              {loading ? (
                <p className="text-gray-600 text-sm">⏳ 데이터를 불러오는 중...</p>
              ) : error ? (
                <p className="text-red-500 text-sm">{error}</p>
              ) : boards?.content?.length === 0 ? (
                <p className="text-gray-500 text-sm">게시글이 없습니다.</p>
              ) : (
                <ul className="space-y-3">
                  {boards?.content?.map((board) => (
                    <li key={board.boardId} className="border-b pb-3">
                      <div className="flex justify-between items-start">
                        {/* 제목 클릭 시 상세 페이지 보기 */}
                        <h2
                          className="text-lg font-semibold text-gray-900 transition-all duration-400 hover:scale-[1.01] hover:font-bold hover:text-blue-500 cursor-pointer"
                          onClick={() => handleViewDetail(board.boardId)}
                        >
                          {board.title}
                        </h2>
                        {/* 수정/삭제 버튼 및 추가 정보 */}
                        <div className="flex items-center space-x-3 text-gray-600 text-xs">
                          {/* 작성자, 조회수, 좋아요 */}
                          <span>
                            {' • '}작성자 : {board.writerName}
                          </span>
                          <span>
                            {' • '}조회수 : {board.views}
                          </span>
                          <button
                            onClick={() =>
                              requireLogin(() =>
                                handleToggleLike(board.boardId)
                              )
                            }
                            className="flex items-center space-x-1 hover:text-blue-400 transition"
                            title="좋아요"
                          >
                            <ThumbsUp
                              className={`w-4 h-4 ${
                                board.likes ? 'text-blue-400 fill-blue-400' : ''
                              }`}
                            />
                            <span>{board.likes}</span>
                          </button>
                          <button
                            onClick={() =>
                              requireLogin(() =>
                                handleToggleUnlike(board.boardId)
                              )
                            }
                            className="flex items-center space-x-1 hover:text-red-400 transition"
                            title="싫어요"
                          >
                            <ThumbsDown
                              className={`w-4 h-4 ${
                                board.unlikes ? 'text-red-400 fill-red-400' : ''
                              }`}
                            />
                            <span>{board.unlikes}</span>
                          </button>
                          {/* 수정/삭제 버튼 */}
                          <button
                            onClick={() =>
                              requireLogin(() => handleEdit(board.boardId))
                            }
                            className="text-blue-500 hover:text-blue-700 transition"
                            title="수정"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              requireLogin(() => handleDelete(board.boardId))
                            }
                            className="text-red-500 hover:text-red-700 transition"
                            title="삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* ✅ 생성 날짜 추가 (시, 분, 초) */}
                      <p className="text-gray-500 text-xs mt-1">
                        {new Date(board.createDatetime).toLocaleTimeString(
                          'ko-KR',
                          {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          }
                        )}
                      </p>
                      <p className="text-gray-800 mt-1 text-sm">{board.content}</p>
                    </li>
                  ))}
                </ul>
              )}
              {boards?.totalPages > 0 && (
                <div className="flex justify-center gap-1 mt-3">
                  {/* 페이지 번호 버튼만 표시 */}
                  {Array.from({ length: boards.totalPages }, (_, index) => (
                    <button
                      key={index}
                      onClick={() => handlePageChange(index)}
                      className={`px-2 py-1 rounded-md text-sm ${
                        currentPage === index
                          ? 'bg-zinc-500 text-white font-bold'
                          : 'bg-zinc-200 text-gray-700 hover:bg-zinc-300'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
