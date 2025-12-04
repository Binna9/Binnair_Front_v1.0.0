import {
  Bell,
  HelpCircle,
  MessageSquare,
  Mail,
  Edit,
  Trash2,
  Send,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { CommentResponse } from '@/types/CommentTypes';
import { useBoardDetail } from '@/hooks/board/useBoardDetail';

type BoardDetailProps = {
  boardId: string;
  onBack: () => void;
  requireLogin: (callback: () => void) => void;
  handleEdit: (boardId: string) => void;
  handleDelete: (boardId: string) => void;
  toggleLike: (boardId: string) => Promise<void>;
  toggleUnlike: (boardId: string) => Promise<void>;
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
  toggleLike,
  toggleUnlike,
  handleEdit,
  handleDelete,
}) => {
  const {
    board,
    loading,
    error,
    newComment,
    setNewComment,
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
    formatFileSize,
    handleFileDelete,
  } = useBoardDetail(
    boardId,
    toggleLike,
    toggleUnlike,
    requireLogin,
    handleEdit,
    handleDelete
  );

  const renderComments = (comments: CommentResponse[], depth = 0) => {
    return comments.map((comment) => (
      <div key={comment.commentId} className={`ml-${depth * 4} p-1.5`}>
        <div
          className={`p-3 rounded-lg shadow-lg border ${
            depth > 0 ? 'bg-white' : 'bg-white'
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="font-medium text-sm">{comment.writerName}</div>
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
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() =>
                  requireLogin(() => handleCommentDelete(comment.commentId))
                }
                className="text-red-500 hover:text-red-700 transition"
                title="댓글 삭제"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {editingCommentId === comment.commentId ? (
            <div className="mt-2">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full p-1.5 border rounded-lg shadow-md resize-none text-sm"
                rows={2}
              />
              <div className="flex justify-end mt-2 space-x-2">
                <button
                  onClick={cancelEditing}
                  className="px-2 py-1 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition shadow-md text-xs"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => submitEdit(comment.commentId)}
                  className="px-2 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition shadow-md text-xs"
                  disabled={!editedContent.trim()}
                >
                  ADD
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-2 whitespace-pre-wrap text-sm">{comment.content}</p>
          )}

          {/* 대댓글 버튼 */}
          <button
            onClick={() =>
              setParentCommentId(
                parentCommentId === comment.commentId ? null : comment.commentId
              )
            }
            className="mt-2 text-xs text-gray-600 hover:text-blue-500"
          >
            {parentCommentId === comment.commentId
              ? '답글 숨기기'
              : '답글 달기'}
          </button>

          {/* 대댓글 입력 폼 */}
          {parentCommentId === comment.commentId && (
            <div className="mt-2 p-2 border-l-4 border-blue-300">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="답글을 작성하세요..."
                className="w-full p-1.5 border rounded-lg resize-none text-sm"
                rows={2}
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={(e) =>
                    handleReplySubmit(e, newComment, comment.commentId)
                  }
                  className="bg-blue-500 hover:bg-blue-600 text-white p-2 transition-all rounded-full shadow-md hover:shadow-lg active:scale-90 flex items-center justify-center mr-3"
                  disabled={!newComment.trim()}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* 재귀적으로 대댓글 렌더링 */}
          {comment.replies.length > 0 && (
            <div className="mt-2 border-l-2 border-gray-300 pl-3">
              {renderComments(comment.replies, depth + 1)}
            </div>
          )}
        </div>
      </div>
    ));
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

  return (
    <div className="w-full">
      <button
        onClick={onBack}
        className="mb-3 px-2 py-1 bg-zinc-100 text-gray-800 font-bold rounded-lg shadow-md hover:bg-zinc-200 transition text-sm"
      >
        List Back
      </button>

      <div className="bg-zinc-50 p-4 rounded-lg shadow-lg border">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            {/* 게시판 타입에 따른 아이콘 표시 */}
            {boardTypeIcons[board.boardType]}
            <span className="text-sm font-medium text-gray-800">
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
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteWithConfirm(board.boardId)}
              className="text-red-500 hover:text-red-700 transition"
              title="삭제"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <h1 className="text-xl font-bold mb-2">{board.title}</h1>

        <div className="flex justify-between items-center mb-4 pb-3 border-b">
          <div className="flex items-center text-gray-700 text-xs">
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

          <div className="flex items-center space-x-3 text-gray-600 text-xs">
            <span>
              {' • '}작성자 : {board.writerName}
            </span>
            <span>
              {' • '}조회수 : {board.views}
            </span>
            <button
              onClick={() => requireLogin(() => handleToggleLike())}
              className="flex items-center space-x-1 hover:text-blue-500 transition"
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
              onClick={() => requireLogin(() => handleToggleUnlike())}
              className="flex items-center space-x-1 hover:text-red-500 transition"
              title="싫어요"
            >
              <ThumbsDown
                className={`w-4 h-4 ${
                  board.unlikes ? 'text-red-400 fill-red-400' : ''
                }`}
              />
              <span>{board.unlikes}</span>
            </button>
          </div>
        </div>

        {/* 본문 내용 */}
        <div className="min-h-[150px] mb-4 whitespace-pre-wrap text-sm">
          {board.content}
        </div>
      </div>
      {/* 첨부파일 목록 */}
      {board.files && board.files.length > 0 && (
        <div className="mt-4 p-3 bg-zinc-50 rounded-lg shadow-lg border">
          <p className="font-medium mb-2 text-sm">📎 첨부파일</p>
          {board.files.map((file, index) => (
            <div
              key={file.fileId}
              className="flex justify-between items-center p-1.5 bg-white rounded-md shadow-md mb-1"
            >
              <a
                href={`/download/${file.filePath}`} // ✅ 파일 다운로드 경로
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                {file.originalFileName} ({formatFileSize(file.fileSize)}){' '}
                {/* 파일 이름과 사이즈 */}
              </a>
              <button
                onClick={() =>
                  requireLogin(() => handleFileDelete(file.fileId))
                } // ✅ 삭제 버튼
                className="text-red-500 hover:text-red-700 transition ml-2"
                title="파일 삭제"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 댓글 섹션 */}
      <div className="mt-6">
        <h2 className="text-lg font-bold mb-3 text-sm">
          댓글 {board.comments.length > 0 ? `(${board.comments.length})` : ''}
        </h2>

        {/* 댓글 작성 폼 */}
        <form onSubmit={handleCommentSubmit} className="mb-4">
          <div className="flex items-center border rounded-lg overflow-hidden shadow-md p-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 작성하세요..."
              className="flex-grow p-2 outline-none resize-none text-sm"
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
              className="bg-blue-500 hover:bg-blue-600 text-white p-2 transition-all rounded-full shadow-md hover:shadow-lg active:scale-90 flex items-center justify-center mr-3"
              disabled={!newComment.trim()}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* 댓글 목록 */}
        <div className="space-y-3">
          {board.comments.length === 0 ? (
            <p className="text-center text-gray-500 text-sm">
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
