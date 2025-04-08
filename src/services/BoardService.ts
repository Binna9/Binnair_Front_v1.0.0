import apiClient from '@/utils/apiClient';
import {
  BoardResponse,
  BoardRequest,
  BoardViewRequest,
  PagedBoardResponse,
} from '@/types/BoardTypes';
import { BoardType } from '@/types/BoardEnum';

interface PageRequest {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
}

export const boardService = {
  // 게시글 목록 조회
  getAllBoards: async (
    boardType: BoardType, // ✅ boardType 인자 추가
    pageRequest: PageRequest = {
      page: 0,
      size: 9,
      sort: 'createDatetime',
      direction: 'DESC',
    }
  ): Promise<PagedBoardResponse | null> => {
    try {
      const { page, size, sort, direction } = pageRequest;
      const response = await apiClient.get<PagedBoardResponse>('/boards', {
        params: {
          boardType,
          page,
          size,
          sort: `${sort},${direction}`, // ✅ 정렬 파라미터 형식 수정
        },
      });
      return response.data;
    } catch (error) {
      console.error('❌ 게시글 조회 실패:', error);
      return null;
    }
  },

  // ✅ 게시글 개별 조회
  getBoardById: async (boardId: string): Promise<BoardResponse | null> => {
    try {
      const response = await apiClient.get<BoardResponse>(`/boards/${boardId}`);
      return response.data;
    } catch (error) {
      console.error('❌ 게시글 조회 실패:', error);
      return null;
    }
  },

  // ✅ 게시글 생성 (파일 포함)
  createBoard: async (boardData: BoardRequest, files: File[] = []) => {
    // ✅ FormData 객체 생성
    const formData = new FormData();

    // ✅ 회원가입 데이터를 FormData에 추가
    Object.keys(boardData).forEach((key) => {
      const typedKey = key as keyof BoardRequest;
      const value = boardData[typedKey];

      // 값이 null 또는 undefined가 아닌 경우만 추가
      if (value !== undefined && value !== null) {
        formData.append(key, String(value)); // 숫자, boolean 등을 문자열로 변환
      }
    });

    // ✅ 파일 추가
    files.forEach((file) => {
      formData.append('files', file);
    });

    // ✅ 전송
    const response = await apiClient.post('/boards', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // ✅ 게시글 수정 (파일 포함)
  updateBoard: async (
    boardId: string,
    boardRequest: BoardRequest
  ): Promise<void> => {
    await apiClient.put(`/boards/${boardId}`, boardRequest);
  },

  // ✅ 게시글 삭제
  deleteBoard: async (boardId: string) => {
    await apiClient.delete(`/boards/${boardId}`);
  },

  // ✅ 게시글 좋아요 추가
  toggleLike: async (boardId: string) => {
    try {
      await apiClient.post(`/likes/${boardId}/like`);
    } catch (error) {
      console.error('❌ 게시글 좋아요 실패:', error);
      throw error;
    }
  },

  // ✅ 게시글 싫어요 추가
  toggleUnlike: async (boardId: string) => {
    try {
      await apiClient.post(`/likes/${boardId}/unlike`);
    } catch (error) {
      console.error('❌ 게시글 싫어요 실패:', error);
      throw error;
    }
  },

  // 조회수 증가
  updateViewBoard: async (boardView: BoardViewRequest) => {
    try {
      await apiClient.put(`/boards/views`, boardView, {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('❌ 조회수 증가 실패:', error);
      throw error;
    }
  },
};
