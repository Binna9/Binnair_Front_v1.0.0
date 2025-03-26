import { CommentRequest, CommentUpdateRequest } from '@/types/CommentTypes';
import apiClient from '@/utils/apiClient';

export const commentService = {
  // ✅ 댓글 생성
  createComment: async (commentRequest: CommentRequest) => {
    try {
      await apiClient.post('/comments', commentRequest);
    } catch (error) {
      console.error('❌ 댓글 작성 실패:', error);
    }
  },

  // ✅ 댓글 수정
  updateComment: async (
    commentId: string,
    CommentUpdateRequest: CommentUpdateRequest
  ) => {
    try {
      await apiClient.put(`/comments/${commentId}`, CommentUpdateRequest, {
        headers: { 'Content-Type': 'application/json' }, // 문자열을 전송할 경우 필요
      });
    } catch (error) {
      console.error('❌ 댓글 수정 실패:', error);
    }
  },

  // ✅ 댓글 삭제
  deleteComment: async (commentId: string) => {
    try {
      await apiClient.delete(`/comments/${commentId}`);
    } catch (error) {
      console.error('❌ 댓글 삭제 실패:', error);
    }
  },
};
