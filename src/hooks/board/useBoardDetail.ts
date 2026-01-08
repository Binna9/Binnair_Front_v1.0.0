import { fileService } from './../../services/FileService';
import { commentService } from './../../services/CommentService';
import { boardService } from './../../services/BoardService';
import { useState, useEffect, useCallback } from 'react';
import { BoardResponse } from '@/types/BoardTypes';
import { CommentResponse } from '@/types/CommentTypes';
import { useNotification } from '@/context/NotificationContext';

export const useBoardDetail = (
  boardId: string,
  toggleLike: (boardId: string) => Promise<void>,
  toggleUnlike: (boardId: string) => Promise<void>,
  requireLogin: (callback: () => void) => void,
  handleEdit: (boardId: string) => void,
  handleDelete: (boardId: string) => void
) => {
  // 게시글 상태 관리
  const [board, setBoard] = useState<BoardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 댓글 상태 관리
  const [newComment, setNewComment] = useState('');
  const [newReplyComment, setNewReplyComment] = useState<Record<string, string>>({});
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [parentCommentId, setParentCommentId] = useState<string | null>(null);
  // 메세지
  const notification = useNotification();

  // 게시글 조회 함수
  const loadBoard = useCallback(async () => {
    setLoading(true);
    try {
      const boardData = await boardService.getBoardById(boardId);
      if (boardData) {
        setBoard(boardData);
        setError(null);
      } else {
        setError('게시글을 불러올 수 없습니다.');
      }
    } catch (err) {
      setError('게시글 조회 중 오류가 발생했습니다.');
      console.error('게시글 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  // 좋아요 토글 핸들러
  const handleToggleLike = async () => {
    requireLogin(async () => {
      try {
        setLoading(true);
        await toggleLike(boardId);
        // 게시글 정보 다시 로드하여 좋아요 상태 업데이트
        await loadBoard();
      } catch (err) {
        console.error('좋아요 처리 중 오류:', err);
        notification.showAlert('FAIL', '좋아요 처리 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    });
  };

  // 싫어요 토글 핸들러
  const handleToggleUnlike = async () => {
    requireLogin(async () => {
      try {
        setLoading(true);
        await toggleUnlike(boardId);
        // 게시글 정보 다시 로드하여 싫어요 상태 업데이트
        await loadBoard();
      } catch (err) {
        console.error('싫어요 처리 중 오류:', err);
        notification.showAlert('FAIL', '싫어요 처리 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    });
  };

  // 컴포넌트 마운트 시 게시글 로드
  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  // 댓글 작성 처리
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !board) return;

    requireLogin(async () => {
      try {
        await commentService.createComment({
          boardId: board.boardId,
          parentId: parentCommentId,
          content: newComment,
        });

        // 댓글 추가 후 게시글 정보 새로고침
        loadBoard();
        setNewComment('');
        setParentCommentId(null);
        notification.showAlert('SUCCESS', '댓글이 작성되었습니다.');
      } catch (error) {
        console.error('댓글 작성 중 오류 발생:', error);
        notification.showAlert('FAIL', '댓글 작성에 실패했습니다.');
      }
    });
  };

  // 댓글 수정 모드 활성화
  const startEditing = (comment: CommentResponse) => {
    setEditingCommentId(comment.commentId);
    setEditedContent(comment.content);
  };

  // 댓글 수정 취소
  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditedContent('');
  };

  // 댓글 수정 제출
  const submitEdit = async (commentId: string) => {
    if (!editedContent.trim()) return;

    requireLogin(async () => {
      const confirmed = await notification.showConfirm(
        'UPDATE',
        '댓글을 수정하시겠습니까?'
      );
      if (!confirmed) return;

      try {
        await commentService.updateComment(commentId, {
          content: editedContent,
        });

        // 댓글 수정 후 게시글 정보 새로고침
        loadBoard();
        setEditingCommentId(null);
        notification.showAlert('SUCCESS', '댓글이 수정되었습니다.');
      } catch (error) {
        console.error('댓글 수정 중 오류 발생:', error);
        notification.showAlert('FAIL', '댓글 수정에 실패했습니다.');
      }
    });
  };

  // 댓글 삭제
  const handleCommentDelete = async (commentId: string) => {
    requireLogin(async () => {
      const confirmed = await notification.showConfirm(
        'DELETE',
        '댓글을 삭제하시겠습니까?'
      );
      if (!confirmed) return;

      try {
        await commentService.deleteComment(commentId);

        // 댓글 삭제 후 게시글 정보 새로고침
        loadBoard();
        notification.showAlert('SUCCESS', '댓글이 삭제되었습니다.');
      } catch (error) {
        console.error('댓글 삭제 중 오류 발생:', error);
        notification.showAlert('FAIL', '댓글 삭제에 실패했습니다.');
      }
    });
  };

  // 대댓글 작성 처리
  const handleReplySubmit = async (
    e: React.FormEvent,
    commentText: string,
    parentId: string
  ) => {
    e.preventDefault();
    if (!commentText.trim() || !board) return;

    requireLogin(async () => {
      try {
        await commentService.createComment({
          boardId: board.boardId,
          parentId: parentId,
          content: commentText,
        });

        // 댓글 추가 후 게시글 정보 새로고침
        loadBoard();
        setNewReplyComment((prev) => {
          const updated = { ...prev };
          delete updated[parentId];
          return updated;
        });
        setParentCommentId(null);
        notification.showAlert('SUCCESS', '답글이 작성되었습니다.');
      } catch (error) {
        console.error('답글 작성 중 오류 발생:', error);
        notification.showAlert('FAIL', '답글 작성에 실패했습니다.');
      }
    });
  };

  // 게시글 수정 처리 (확인창 추가)
  const handleEditWithConfirm = (boardId: string) => {
    requireLogin(async () => {
      const confirmed = await notification.showConfirm(
        'UPDATE',
        '게시글을 수정하시겠습니까?'
      );
      if (!confirmed) return;

      handleEdit(boardId);
    });
  };

  // 게시글 삭제 처리 (확인창 추가)
  const handleDeleteWithConfirm = (boardId: string) => {
    requireLogin(async () => {
      const confirmed = await notification.showConfirm(
        'DELETE',
        '게시글을 삭제하시겠습니까?'
      );
      if (!confirmed) return;

      handleDelete(boardId);
    });
  };

  // 파일 크기를 읽기 쉬운 형식으로 변환하는 함수
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 파일 다운로드 함수
  const handleFileDownload = async (fileId: string, fileName: string) => {
    requireLogin(async () => {
      try {
        await fileService.downloadFile(fileId, fileName);
      } catch (error) {
        console.error('파일 다운로드 오류:', error);
        notification.showAlert('FAIL', '파일 다운로드에 실패했습니다.');
      }
    });
  };

  return {
    board,
    loading,
    error,
    newComment,
    setNewComment,
    newReplyComment,
    setNewReplyComment,
    editingCommentId,
    editedContent,
    setEditedContent,
    parentCommentId,
    setParentCommentId,
    handleToggleLike,
    handleToggleUnlike,
    handleCommentSubmit,
    startEditing,
    cancelEditing,
    submitEdit,
    handleCommentDelete,
    handleReplySubmit,
    handleEditWithConfirm,
    handleDeleteWithConfirm,
    loadBoard,
    formatFileSize,
    handleFileDownload,
  };
};
