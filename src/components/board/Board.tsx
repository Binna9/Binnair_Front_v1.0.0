import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
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
} from 'lucide-react';
import { RootState } from '@/store/store';
import {
  BoardType,
  BoardRequest,
  BoardResponse,
  PagedBoardResponse,
} from '@/types/Board';
import {
  fetchBoards,
  fetchBoardById,
  createBoard,
  updateBoard,
  deleteBoard,
} from '@/services/BoardService';
import BoardDetail from './BoardDetail'; // 추가된 상세 페이지 컴포넌트 import

// ✅ 섹션 배열 (아이콘 추가)
const sections: { id: BoardType; title: string; icon: React.ReactNode }[] = [
  { id: 'NOTICE', title: '공지사항', icon: <Bell className="w-5 h-5 mr-2" /> },
  {
    id: 'FAQ',
    title: '자주 묻는 질문',
    icon: <HelpCircle className="w-5 h-5 mr-2" />,
  },
  {
    id: 'FREE',
    title: '자유게시판',
    icon: <MessageSquare className="w-5 h-5 mr-2" />,
  },
  {
    id: 'SUGGESTION',
    title: '문의하기',
    icon: <Mail className="w-5 h-5 mr-2" />,
  },
];

export default function Board() {
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState<BoardType>('NOTICE');
  const [boards, setBoards] = useState<PagedBoardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isWriting, setIsWriting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBoardId, setCurrentBoardId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedSection, setSelectedSection] = useState<BoardType>('NOTICE');
  const [file, setFile] = useState<File | undefined>(undefined);
  const [files, setFiles] = useState<File[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);

  // 상세 페이지 관련 상태 추가
  const [isViewingDetail, setIsViewingDetail] = useState(false);
  const [currentBoard, setCurrentBoard] = useState<BoardResponse | null>(null);

  useEffect(() => {
    setCurrentPage(0); // ✅ activeSection 변경 시 페이지를 0으로 초기화
  }, [activeSection]);

  // ✅ 게시글 목록 불러오기
  useEffect(() => {
    const loadBoards = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchBoards(activeSection, currentPage);
        setBoards(data);
      } catch (err) {
        console.error('Error fetching boards:', err);
        setError('게시글을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadBoards();
  }, [activeSection, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const requireLogin = (callback: () => void) => {
    if (!accessToken) {
      alert('로그인 후 이용 가능합니다.');
      navigate('/login');
      return;
    }
    callback();
  };

  // ✅ 글쓰기 모드 토글
  const toggleWriteMode = () => {
    setIsWriting((prev) => !prev);
    setIsEditing(false);
    setTitle('');
    setContent('');
    setCurrentBoardId('');
    setSelectedSection(activeSection);
    setFiles([]);
    setFile(undefined);
    setIsViewingDetail(false); // 상세 보기 모드 해제
  };

  // ✅ 수정 모드 활성화
  const handleEdit = async (boardId: string) => {
    try {
      setLoading(true);
      // 게시글 상세 정보 가져오기
      const boardDetail = await fetchBoardById(boardId);

      // 폼 필드 설정
      setTitle(boardDetail.title);
      setContent(boardDetail.content);
      setSelectedSection(boardDetail.boardType);
      setCurrentBoardId(boardDetail.boardId);

      // 수정 모드 설정
      setIsEditing(true);
      setIsWriting(true);
      setIsViewingDetail(false); // 상세 보기 모드 해제
    } catch (err) {
      console.error('Error fetching board details:', err);
      alert('게시글 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ 게시글 삭제
  const handleDelete = async (boardId: string) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) {
      return;
    }

    try {
      setLoading(true);
      await deleteBoard(boardId);

      // 삭제 후 목록 새로고침
      const updatedBoards = await fetchBoards(activeSection);
      setBoards(updatedBoards);

      // 상세 페이지 보기 중이었다면 목록 보기로 돌아감
      setIsViewingDetail(false);

      alert('게시글이 삭제되었습니다.');
    } catch (err) {
      console.error('Error deleting board:', err);
      alert('게시글 삭제 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ 섹션 선택 변경
  const handleSectionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSection = event.target.value as BoardType;
    setSelectedSection(newSection);
  };

  // ✅ 파일 선택 핸들러
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      // 첫 번째 파일만 사용 (API는 단일 파일만 지원)
      setFile(event.target.files[0]);

      // UI 표시용 파일 배열 설정
      const selectedFiles = Array.from(event.target.files);
      setFiles(selectedFiles);
    }
  };

  // ✅ 파일 제거
  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));

    // 선택된 단일 파일이 삭제되는 경우 `file`도 업데이트
    if (files.length === 1) {
      setFile(undefined);
    }
  };

  // ✅ 글 등록/수정 함수 (API 연결)
  const handlePostSubmit = async () => {
    try {
      setLoading(true);
      // API 요청 객체 생성
      const boardRequest: BoardRequest = {
        boardType: selectedSection,
        title,
        content,
        file,
      };

      if (isEditing) {
        // 수정 API 호출
        await updateBoard(currentBoardId, boardRequest);
        alert('게시글이 성공적으로 수정되었습니다.');
      } else {
        // 등록 API 호출
        await createBoard(boardRequest);
        alert('게시글이 성공적으로 등록되었습니다.');
      }

      // 등록/수정 후 해당 섹션의 게시글 목록 다시 불러오기
      setActiveSection(selectedSection);
      const data = await fetchBoards(selectedSection);
      setBoards(data);

      // 글쓰기 모드 종료
      toggleWriteMode();
    } catch (err) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} board:`, err);
      alert(`게시글 ${isEditing ? '수정' : '등록'} 중 오류가 발생했습니다.`);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 게시글 상세 보기 기능
  const handleViewDetail = async (boardId: string) => {
    try {
      setLoading(true);
      const boardDetail = await fetchBoardById(boardId);
      setCurrentBoard(boardDetail);
      setIsViewingDetail(true);
      setIsWriting(false);
    } catch (err) {
      console.error('Error fetching board details:', err);
      alert('게시글 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ 상세 페이지에서 목록으로 돌아가기
  const handleBackToList = () => {
    setIsViewingDetail(false);
    setCurrentBoard(null);
  };

  return (
    <div className="container mx-auto p-6 flex justify-center mt-16 min-h-[900px]">
      {/* 흰색 네모 박스 */}
      <div
        className="w-full max-w-[1400px] bg-white rounded-lg flex h-auto"
        style={{
          boxShadow:
            '0 0 20px 10px rgba(0, 0, 0, 0.5), 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        }}
      >
        {/* 왼쪽 메뉴 (탭) */}
        <div className="w-1/5 border-r p-6 bg-gray-300 rounded-l-lg flex flex-col justify-between">
          <div>
            <h1 className="text-lg font-bold mb-6 text-gray-700 flex items-center">
              <Headset className="w-6 h-6 mr-2 text-gray-90" /> 고객센터
            </h1>
            <div className="flex flex-col space-y-3">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id);
                    if (isWriting) {
                      setSelectedSection(section.id);
                    }
                    // 상세 페이지 보기 중이었다면 해제
                    setIsViewingDetail(false);
                  }}
                  className={`w-full flex items-center text-left px-4 py-3 rounded-lg transition ${
                    activeSection === section.id
                      ? 'bg-zinc-500 text-white font-semibold'
                      : 'bg-zinc-100 text-gray-700 hover:bg-zinc-200'
                  }`}
                >
                  {section.icon} {section.title}
                </button>
              ))}
            </div>
          </div>

          {/* ✅ 글쓰기 버튼 */}
          {!isWriting && (
            <button
              className="px-4 py-4 bg-white text-gray-900 font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-zinc-200 transition"
              onClick={() => requireLogin(toggleWriteMode)}
              disabled={loading}
            >
              <Pencil className="w-5 h-5" /> 글 쓰기
            </button>
          )}
        </div>

        {/* ✅ 오른쪽 콘텐츠 영역 (게시글 목록 or 글쓰기 폼 or 상세 페이지) */}
        <div className="w-4/5 p-8">
          {isWriting ? (
            // ✅ 글쓰기/수정 모드일 때 (폼)
            <div className="bg-gray-100 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-6">
                {isEditing ? '게시글 수정' : '새 게시글 작성'}
              </h2>

              {/* ✅ 섹션 선택 */}
              <div className="mb-4">
                <label className="block text-gray-900 font-semibold mb-3">
                  게시판 선택
                </label>
                <select
                  value={selectedSection}
                  onChange={handleSectionChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* 제목 입력 */}
              <label className="block text-gray-900 font-semibold mb-2">
                제목
              </label>
              <input
                type="text"
                placeholder="제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 mb-4 border border-gray-300 rounded-lg"
              />
              <label className="block text-gray-900 font-semibold mb-2">
                내용
              </label>
              {/* 내용 입력 */}
              <textarea
                placeholder="내용을 입력하세요"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-3 h-40 border border-gray-300 rounded-lg"
              ></textarea>

              {/* ✅ 파일 업로드 */}
              <div className="mt-4">
                <label className="block text-gray-900 font-semibold mb-2">
                  파일 첨부
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white 
  file:bg-blue-500 file:text-white file:border-none file:px-4 file:py-2 
  file:rounded-lg file:cursor-pointer file:mr-4 file:hover:bg-blue-600"
                />
                {/* 파일 목록 */}
                {files.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {files.map((file, index) => (
                      <li
                        key={file.name || index}
                        className="flex items-center justify-between bg-gray-300 p-2 rounded-lg"
                      >
                        <span className="text-gray-800">{file.name}</span>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 transition"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex justify-between mt-4">
                {/* 취소 버튼 */}
                <button
                  onClick={() => {
                    if (window.confirm('취소하시겠습니까?')) {
                      toggleWriteMode();
                    }
                  }}
                  className="px-4 py-2 bg-zinc-500 text-white rounded-lg hover:bg-zinc-600 transition"
                  disabled={loading}
                >
                  취소
                </button>

                {/* 등록/수정 버튼 */}
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        `${isEditing ? '수정' : '등록'}하시겠습니까?`
                      )
                    ) {
                      handlePostSubmit();
                    }
                  }}
                  className="px-4 py-2 bg-zinc-300 text-white rounded-lg hover:bg-blue-600 transition"
                  disabled={loading}
                >
                  {loading ? '처리 중...' : isEditing ? '수정' : '등록'}
                </button>
              </div>
            </div>
          ) : isViewingDetail && currentBoard ? (
            // ✅ 상세 페이지 표시
            <BoardDetail
              board={currentBoard}
              onBack={handleBackToList}
              requireLogin={requireLogin}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
            />
          ) : (
            // ✅ 게시글 목록
            <>
              {loading ? (
                <p className="text-gray-600">⏳ 데이터를 불러오는 중...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : boards?.content?.length === 0 ? (
                <p className="text-gray-500">게시글이 없습니다.</p>
              ) : (
                <ul className="space-y-4">
                  {boards?.content?.map((board) => (
                    <li key={board.boardId} className="border-b pb-4">
                      <div className="flex justify-between items-start">
                        {/* 제목 클릭 시 상세 페이지 보기 */}
                        <h2
                          className="text-xl font-semibold text-gray-900 transition-all duration-400 hover:scale-[1.01] hover:font-bold hover:text-blue-500 cursor-pointer"
                          onClick={() => handleViewDetail(board.boardId)}
                        >
                          {board.title}
                        </h2>

                        {/* 수정/삭제 버튼 및 추가 정보 */}
                        <div className="flex items-center space-x-4 text-gray-600 text-sm">
                          {/* 작성자, 조회수, 좋아요 */}
                          <span>
                            {' • '}작성자 : {board.writerName}
                          </span>
                          <span>
                            {' • '}조회수 : {board.views}
                          </span>
                          <span>
                            {' • '}좋아요 : {board.likes}
                          </span>

                          {/* 수정/삭제 버튼 */}
                          <button
                            onClick={() =>
                              requireLogin(() => handleEdit(board.boardId))
                            }
                            className="text-blue-500 hover:text-blue-700 transition"
                            title="수정"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() =>
                              requireLogin(() => handleDelete(board.boardId))
                            }
                            className="text-red-500 hover:text-red-700 transition"
                            title="삭제"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* ✅ 생성 날짜 추가 (시, 분, 초) */}
                      <p className="text-gray-500 text-sm mt-1">
                        {new Date(board.createDatetime).toLocaleTimeString(
                          'ko-KR',
                          {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          }
                        )}
                      </p>
                      <p className="text-gray-800 mt-2">{board.content}</p>
                      {board.filePath && (
                        <p className="text-zinc-600 hover:text-zinc-800 mt-3">
                          📎 첨부파일
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {boards?.totalPages > 0 && (
                <div className="flex justify-center gap-2 mt-4">
                  {/* 페이지 번호 버튼만 표시 */}
                  {Array.from({ length: boards.totalPages }, (_, index) => (
                    <button
                      key={index}
                      onClick={() => handlePageChange(index)}
                      className={`px-3 py-2 rounded-md ${
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
