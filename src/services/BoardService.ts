import apiClient from '@/utils/apiClient';
import {
  BoardType,
  BoardResponse,
  BoardRequest,
  BoardView,
  PagedBoardResponse,
} from '@/types/Board';
import {
  CommentRequest,
  CommentResponse,
  CommentUpdateRequest,
} from '@/types/Comment';
import { Asterisk } from 'lucide-react';

// ✅ 게시글 목록 조회
export const fetchBoards = async (
  boardType: BoardType,
  page: number = 0,
  size: number = 8
): Promise<PagedBoardResponse | null> => {
  try {
    const response = await apiClient.get<PagedBoardResponse>(
      `/boards?boardType=${boardType}&page=${page}&size=${size}`
    );

    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    console.error('❌ 게시글 조회 실패:', error);
  }

  return null;
};

// ✅ 게시글 개별 조회
export const fetchBoardById = async (
  boardId: string
): Promise<BoardResponse | null> => {
  try {
    const response = await apiClient.get<BoardResponse>(`/boards/${boardId}`);
    return response.data;
  } catch (error) {
    console.error('❌ 게시글 조회 실패:', error);
    return null;
  }
};

// ✅ 게시글 생성 (파일 포함)
export const createBoard = async ({
  boardType,
  title,
  content,
  file,
}: BoardRequest) => {
  const formData = new FormData();

  formData.append('boardType', boardType);
  formData.append('title', title);
  formData.append('content', content);

  if (file) {
    formData.append('file', file);
  }

  await apiClient.post('/boards', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// ✅ 게시글 수정 (파일 포함)
export const updateBoard = async (
  boardId: string,
  boardRequest: BoardRequest
) => {
  const formData = new FormData();

  // ✅ 기본 게시글 정보 추가
  formData.append('boardType', boardRequest.boardType);
  formData.append('title', boardRequest.title);
  formData.append('content', boardRequest.content);

  // ✅ 파일 추가 (옵션)
  if (boardRequest.file) {
    formData.append('file', boardRequest.file);
  }

  await apiClient.put(`/boards/${boardId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// 조회수 증가
export const updateViewBoard = async (boardView: BoardView) => {
  try {
    await apiClient.put(`/boards/views`, boardView, {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ 조회수 증가 실패:', error);
    throw error;
  }
};

// ✅ 게시글 삭제
export const deleteBoard = async (boardId: string) => {
  await apiClient.delete(`/boards/${boardId}`);
};

// ✅ 댓글 생성
export const createComment = async (commentRequest: CommentRequest) => {
  try {
    await apiClient.post('/comments', commentRequest);
  } catch (error) {
    console.error('❌ 댓글 작성 실패:', error);
  }
};

// ✅ 댓글 수정
export const updateComment = async (
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
};

// ✅ 댓글 삭제
export const deleteComment = async (commentId: string) => {
  try {
    await apiClient.delete(`/comments/${commentId}`);
  } catch (error) {
    console.error('❌ 댓글 삭제 실패:', error);
  }
};

export const toggleLike = async (boardId: string) => {
  try {
    await apiClient.post(`/likes/${boardId}/like`);
  } catch (error) {
    console.error('❌ 게시글 좋아요 실패:', error);
    throw error;
  }
};

// ✅ 게시글 싫어요 추가
export const toggleUnlike = async (boardId: string) => {
  try {
    await apiClient.post(`/likes/${boardId}/unlike`);
  } catch (error) {
    console.error('❌ 게시글 싫어요 실패:', error);
    throw error;
  }
};
