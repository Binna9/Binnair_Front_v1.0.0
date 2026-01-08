import { useState, useEffect, useCallback, useRef } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import {
  BoardRequest,
  BoardResponse,
  PagedBoardResponse,
  BoardViewRequest,
} from '@/types/BoardTypes';
import { BoardType } from '@/types/BoardEnum';
import { useNotification } from '@/context/NotificationContext';
import { boardService } from '@/services/BoardService';

// 게시글 내용 미리보기 컴포넌트 (3줄 제한 + 그라데이션)
export const BoardContentPreview = ({ content }: { content: string }) => {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [showGradient, setShowGradient] = useState(false);

  useEffect(() => {
    if (textRef.current) {
      // 실제 텍스트의 스크롤 높이와 클라이언트 높이를 비교
      const scrollHeight = textRef.current.scrollHeight;
      const clientHeight = textRef.current.clientHeight;
      // 스크롤이 필요하면 (텍스트가 잘렸으면) 그라데이션 표시
      setShowGradient(scrollHeight > clientHeight);
    }
  }, [content]);

  return (
    <div className="relative mt-1">
      <p
        ref={textRef}
        className="text-gray-800 text-sm line-clamp-3"
      >
        {content}
      </p>
      {showGradient && (
        <div
          className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom, transparent, rgba(255, 255, 255, 1))',
          }}
        />
      )}
    </div>
  );
};

export function useAllBoard() {
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const navigate = useNavigate();
  const notification = useNotification();

  const [activeSection, setActiveSection] = useState<BoardType>(
    BoardType.NOTICE
  );
  const [boards, setBoards] = useState<PagedBoardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isWriting, setIsWriting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBoardId, setCurrentBoardId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedSection, setSelectedSection] = useState<BoardType>(
    BoardType.NOTICE
  );
  const [, setFile] = useState<File | undefined>(undefined);
  const [files, setFiles] = useState<File[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isViewingDetail, setIsViewingDetail] = useState(false);
  const [currentBoard, setCurrentBoard] = useState<BoardResponse | null>(null);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    setCurrentPage(0); // ✅ activeSection 변경 시 페이지를 0으로 초기화
  }, [activeSection]);

  const loadBoards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await boardService.getAllBoards(activeSection, {
        page: currentPage,
        size: 9,
        sort: 'createDatetime',
        direction: 'DESC',
      });
      setBoards(data);

      // ✅ 각 게시글의 댓글 수 가져오기
      if (data?.content) {
        const counts: Record<string, number> = {};
        await Promise.all(
          data.content.map(async (board) => {
            try {
              const count = await boardService.getBoardByCommentCount(board.boardId);
              counts[board.boardId] = count ?? 0;
            } catch (err) {
              console.error(`댓글 수 조회 실패 (boardId: ${board.boardId}):`, err);
              counts[board.boardId] = 0;
            }
          })
        );
        setCommentCounts(counts);
      }
    } catch (err) {
      console.error('Error fetching boards:', err);
      setError('게시글을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [activeSection, currentPage]); // 의존성 지정

  // ✅ 게시글 목록 불러오기
  useEffect(() => {
    loadBoards();
  }, [loadBoards]);

  // 게시글 상세 정보 가져오기
  const fetchBoardById = async (boardId: string): Promise<BoardResponse> => {
    const response = await boardService.getBoardById(boardId);
    if (!response) {
      throw new Error('게시글을 찾을 수 없습니다.');
    }
    return response;
  };

  // 게시글 목록 가져오기
  const fetchBoards = async (
    boardType: BoardType
  ): Promise<PagedBoardResponse | null> => {
    return await boardService.getAllBoards(boardType, {
      page: currentPage,
      size: 9,
      sort: 'createDatetime',
      direction: 'DESC',
    });
  };

  // 게시글 삭제
  const deleteBoard = async (boardId: string): Promise<void> => {
    await boardService.deleteBoard(boardId);
  };

  // 좋아요 토글
  const toggleLike = async (boardId: string): Promise<void> => {
    await boardService.toggleLike(boardId);
  };

  // 싫어요 토글
  const toggleUnlike = async (boardId: string): Promise<void> => {
    await boardService.toggleUnlike(boardId);
  };

  // 조회수 업데이트
  const updateViewBoard = async (
    boardView: BoardViewRequest
  ): Promise<void> => {
    await boardService.updateViewBoard(boardView);
  };

  // 페이지 전환
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 로그인 페이지 전환(비로그인시)
  const requireLogin = (callback: () => void) => {
    if (!accessToken) {
      notification.showAlert('로그인', '로그인 후 이용 가능합니다.', () => {
        navigate('/login');
      });
      return;
    }
    callback();
  };

  // 삭제 컨펌
  const confirmDelete = (onConfirm: () => void) => {
    notification.showAlert('DELETE', '삭제하시겠습니까?', () => {
      onConfirm();
    });
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
      notification.showAlert(
        'ERROR',
        '게시글 정보를 불러오는 중 오류가 발생했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ 게시글 삭제
  const handleDelete = (boardId: string) => {
    confirmDelete(async () => {
      try {
        setLoading(true);
        await deleteBoard(boardId);

        // 삭제 후 목록 새로고침
        const updatedBoards = await fetchBoards(activeSection);
        setBoards(updatedBoards);

        // 상세 페이지 보기 중이었다면 목록 보기로 돌아감
        setIsViewingDetail(false);

        notification.showAlert('SUCCESS', '게시글이 삭제되었습니다.');
      } catch (err) {
        console.error('Error deleting board:', err);
        notification.showAlert('ERROR', '게시글 삭제 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    });
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
      };

      if (isEditing) {
        // 수정 API 호출
        await boardService.updateBoard(currentBoardId, boardRequest);
        notification.showAlert(
          'SUCCESS',
          '게시글이 성공적으로 수정되었습니다.'
        );
      } else {
        // 등록 API 호출
        await boardService.createBoard(boardRequest, files);
        notification.showAlert(
          'SUCCESS',
          '게시글이 성공적으로 등록되었습니다.'
        );
      }

      // 등록/수정 후 해당 섹션의 게시글 목록 다시 불러오기
      setActiveSection(selectedSection);
      const data = await fetchBoards(selectedSection);
      setBoards(data);

      // 글쓰기 모드 종료
      toggleWriteMode();
    } catch (err) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} board:`, err);
      notification.showAlert(
        'ERROR',
        `게시글 ${isEditing ? '수정' : '등록'} 중 오류가 발생했습니다.`
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ 게시글 상세 보기 기능
  const handleViewDetail = async (boardId: string) => {
    try {
      setLoading(true);
      const boardDetail = await fetchBoardById(boardId);
      await updateViewBoard({ boardId, views: boardDetail.views + 1 });
      setCurrentBoard({ ...boardDetail, views: boardDetail.views + 1 });
      setIsViewingDetail(true);
      setIsWriting(false);
    } catch (err) {
      console.error('Error fetching board details:', err);
      notification.showAlert(
        'ERROR',
        '게시글 정보를 불러오는 중 오류가 발생했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  // 좋아요 토글 핸들러
  const handleToggleLike = async (boardId: string) => {
    try {
      setLoading(true);
      await toggleLike(boardId);
      // 게시글 목록 다시 로드하여 좋아요 상태 업데이트
      await loadBoards();
    } catch (err) {
      console.error('Error toggling like:', err);
      notification.showAlert('ERROR', '좋아요 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 싫어요 토글 핸들러
  const handleToggleUnlike = async (boardId: string) => {
    try {
      setLoading(true);
      await toggleUnlike(boardId);
      // 게시글 목록 다시 로드하여 싫어요 상태 업데이트
      await loadBoards();
    } catch (err) {
      console.error('Error toggling unlike:', err);
      notification.showAlert('ERROR', '싫어요 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ 상세 페이지에서 목록으로 돌아가기
  const handleBackToList = () => {
    setIsViewingDetail(false);
    setCurrentBoard(null);
    loadBoards();
  };

  // 액션 함수들을 모아서 반환
  return {
    // 상태 변수들
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
    commentCounts,

    // 상태 설정 함수들
    setActiveSection,
    setTitle,
    setContent,

    // 액션 함수들
    loadBoards,
    handlePageChange,
    requireLogin,
    toggleWriteMode,
    handleEdit,
    handleDelete,
    handleSectionChange,
    handleFileChange,
    removeFile,
    handlePostSubmit,
    handleViewDetail,
    handleToggleLike,
    handleToggleUnlike,
    handleBackToList,
  };
}
