import React, { useState, useEffect } from 'react';
import {
  Bell,
  HelpCircle,
  MessageSquare,
  Mail,
  Edit,
  Trash2,
  Send,
} from 'lucide-react';
import { BoardResponse } from '@/types/Board';
import {
  CommentResponse,
  CommentRequest,
  CommentUpdateRequest,
} from '@/types/Comment';
import {
  fetchBoardById,
  createComment,
  updateComment,
  deleteComment,
} from '@/services/BoardService';
import {
  NotificationProvider,
  useNotification,
} from '@/context/NotificationContext';

type BoardDetailProps = {
  boardId: string; // 게시글 ID를 props로 받도록 변경
  onBack: () => void;
  requireLogin: (callback: () => void) => void;
  handleEdit: (boardId: string) => void;
  handleDelete: (boardId: string) => void;
};

// 게시판 타입별 아이콘 매핑
const boardTypeIcons = {
  NOTICE: <Bell className="w-5 h-5 mr-2" />,
  FAQ: <HelpCircle className="w-5 h-5 mr-2" />,
  FREE: <MessageSquare className="w-5 h-5 mr-2" />,
  SUGGESTION: <Mail className="w-5 h-5 mr-2" />,
};

const BoardDetail: React.FC<BoardDetailProps> = ({
  boardId,
  onBack,
  requireLogin,
  handleEdit,
  handleDelete,
}) => {
  // 게시글 상태 관리
  const [board, setBoard] = useState<BoardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 댓글 상태 관리
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [parentCommentId, setParentCommentId] = useState<string | null>(null);
  const notification = useNotification();

  // 게시글 조회 함수
  const loadBoard = async () => {
    setLoading(true);
    try {
      const boardData = await fetchBoardById(boardId);
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
  };

  // 컴포넌트 마운트 시 게시글 로드
  useEffect(() => {
    loadBoard();
  }, [boardId]);

  // 댓글 작성 처리
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !board) return;

    requireLogin(async () => {
      try {
        await createComment({
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
        await updateComment(commentId, { content: editedContent });

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
        await deleteComment(commentId);

        // 댓글 삭제 후 게시글 정보 새로고침
        loadBoard();
        notification.showAlert('SUCCESS', '댓글이 삭제되었습니다.');
      } catch (error) {
        console.error('댓글 삭제 중 오류 발생:', error);
        notification.showAlert('FAIL', '댓글 삭제에 실패했습니다.');
      }
    });
  };

  // 대댓글 작성 처리 (재귀 구조에서 사용)
  const handleReplySubmit = async (
    e: React.FormEvent,
    commentText: string,
    parentId: string
  ) => {
    e.preventDefault();
    if (!commentText.trim() || !board) return;

    requireLogin(async () => {
      try {
        await createComment({
          boardId: board.boardId,
          parentId: parentId,
          content: commentText,
        });

        // 댓글 추가 후 게시글 정보 새로고침
        loadBoard();
        setNewComment('');
        setParentCommentId(null);
        notification.showAlert('SUCCESS', '답글이 작성되었습니다.');
      } catch (error) {
        console.error('답글 작성 중 오류 발생:', error);
        notification.showAlert('FAIL', '답글 작성에 실패했습니다.');
      }
    });
  };

  if (loading) {
    return (
      <div className="w-full text-center py-8">게시글을 불러오는 중...</div>
    );
  }

  if (error || !board) {
    return (
      <div className="w-full">
        <button
          onClick={onBack}
          className="mb-4 px-3 py-1 bg-gray-200 text-gray-800 font-bold rounded-lg shadow-md hover:bg-gray-300 transition border"
        >
          List Back
        </button>
        <div className="bg-red-100 p-6 rounded-lg shadow-md text-center text-red-700">
          {error || '게시글을 찾을 수 없습니다.'}
        </div>
      </div>
    );
  }

  const renderComments = (comments: CommentResponse[], depth = 0) => {
    return comments.map((comment) => (
      <div key={comment.commentId} className={`ml-${depth * 4} p-2`}>
        <div
          className={`p-4 rounded-lg shadow-lg border ${
            depth > 0 ? 'bg-white' : 'bg-white'
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="font-medium">{comment.writerName}</div>
              <div className="text-xs text-gray-500">
                {new Date(comment.createDatetime).toLocaleDateString('ko-KR')}{' '}
                {new Date(comment.createDatetime).toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => requireLogin(() => startEditing(comment))}
                className="text-blue-500 hover:text-blue-700 transition"
                title="댓글 수정"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  requireLogin(() => handleCommentDelete(comment.commentId))
                }
                className="text-red-500 hover:text-red-700 transition"
                title="댓글 삭제"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {editingCommentId === comment.commentId ? (
            <div className="mt-2">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full p-2 border rounded-lg resize-none"
                rows={2}
              />
              <div className="flex justify-end mt-2 space-x-2">
                <button
                  onClick={cancelEditing}
                  className="px-3 py-1 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                >
                  취소
                </button>
                <button
                  onClick={() => submitEdit(comment.commentId)}
                  className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  disabled={!editedContent.trim()}
                >
                  수정
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-2 whitespace-pre-wrap">{comment.content}</p>
          )}

          {/* 대댓글 버튼 */}
          <button
            onClick={() =>
              setParentCommentId(
                parentCommentId === comment.commentId ? null : comment.commentId
              )
            }
            className="mt-2 text-sm text-gray-600 hover:text-blue-500"
          >
            {parentCommentId === comment.commentId
              ? '답글 숨기기'
              : '답글 달기'}
          </button>

          {/* 대댓글 입력 폼 */}
          {parentCommentId === comment.commentId && (
            <div className="mt-2 p-3 border-l-4 border-blue-300">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="답글을 작성하세요..."
                className="w-full p-2 border rounded-lg resize-none"
                rows={2}
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={(e) =>
                    handleReplySubmit(e, newComment, comment.commentId)
                  }
                  className="bg-blue-500 hover:bg-blue-600 text-white p-3 transition-all rounded-full shadow-md hover:shadow-lg active:scale-90 flex items-center justify-center mr-5"
                  disabled={!newComment.trim()}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* 재귀적으로 대댓글 렌더링 */}
          {comment.replies.length > 0 && (
            <div className="mt-2 border-l-2 border-gray-300 pl-4">
              {renderComments(comment.replies, depth + 1)}
            </div>
          )}
        </div>
      </div>
    ));
  };

  // 게시글 수정 처리 (확인창 추가)
  const handleEditWithConfirm = (id: string) => {
    requireLogin(async () => {
      const confirmed = await notification.showConfirm(
        'UPDATE',
        '게시글을 수정하시겠습니까?'
      );
      if (!confirmed) return;
      handleEdit(id);
    });
  };

  // 게시글 삭제 처리 (확인창 추가)
  const handleDeleteWithConfirm = (id: string) => {
    requireLogin(async () => {
      const confirmed = await notification.showConfirm(
        'DELETE',
        '게시글을 삭제하시겠습니까?'
      );
      if (!confirmed) return;
      handleDelete(id);
    });
  };

  return (
    <div className="w-full">
      <button
        onClick={onBack}
        className="mb-4 px-3 py-1 bg-zinc-100 text-gray-800 font-bold rounded-lg shadow-md hover:bg-zinc-200 transition"
      >
        List Back
      </button>

      <div className="bg-zinc-50 p-6 rounded-lg shadow-lg border">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            {/* 게시판 타입에 따른 아이콘 표시 */}
            {boardTypeIcons[board.boardType]}
            <span className="text-md font-medium text-gray-800">
              {board.boardType === 'NOTICE' && '공지사항'}
              {board.boardType === 'FAQ' && '자주 묻는 질문'}
              {board.boardType === 'FREE' && '자유게시판'}
              {board.boardType === 'SUGGESTION' && '문의하기'}
            </span>
          </div>

          {/* 수정 및 삭제 버튼 추가 */}
          <div className="flex space-x-2">
            <button
              onClick={() => handleEditWithConfirm(board.boardId)}
              className="text-blue-500 hover:text-blue-700 transition"
              title="수정"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleDeleteWithConfirm(board.boardId)}
              className="text-red-500 hover:text-red-700 transition"
              title="삭제"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-3">{board.title}</h1>

        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <div className="flex items-center text-gray-700 text-sm">
            <span className="font-medium">작성자: {board.writerName}</span>
            <span className="mx-2">•</span>
            <span>
              {new Date(board.createDatetime).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}{' '}
              {new Date(board.createDatetime).toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          <div className="flex items-center text-gray-600 text-sm">
            <span>조회수: {board.views}</span>
            <span className="mx-2">•</span>
            <span>좋아요: {board.likes}</span>
          </div>
        </div>

        {/* 본문 내용 */}
        <div className="min-h-[200px] mb-6 whitespace-pre-wrap">
          {board.content}
        </div>

        {/* 첨부파일 */}
        {board.filePath && (
          <div className="mt-4 p-3 bg-zinc-100 rounded-lg shadow-lg border">
            <p className="font-medium">📎 첨부파일</p>
            <a
              href={board.filePath}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {board.filePath.split('/').pop()}
            </a>
          </div>
        )}
      </div>

      {/* 댓글 섹션 */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">
          댓글 {board.comments.length > 0 ? `(${board.comments.length})` : ''}
        </h2>

        {/* 댓글 작성 폼 */}
        <form onSubmit={handleCommentSubmit} className="mb-6">
          <div className="flex items-center border rounded-lg overflow-hidden shadow-md p-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 작성하세요..."
              className="flex-grow p-3 outline-none resize-none"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleCommentSubmit(e);
                }
              }}
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white p-3 transition-all rounded-full shadow-md hover:shadow-lg active:scale-90 flex items-center justify-center mr-5"
              disabled={!newComment.trim()}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* 댓글 목록 */}
        <div className="space-y-4">
          {board.comments.length === 0 ? (
            <p className="text-center text-gray-500">
              아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
            </p>
          ) : (
            renderComments(board.comments)
          )}
        </div>
      </div>
    </div>
  );
};

export default BoardDetail;
