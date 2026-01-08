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

  // ✅ 게시글 댓글 수 조회
  getBoardByCommentCount: async (boardId: string): Promise<number | null> => {
    try {
      const response = await apiClient.get<number | null>(`/boards/comments/${boardId}`);
      return response.data;
    } catch (error) {
      console.error('❌ 게시글 댓글 수 조회회 실패:', error);
      return null;
    }
  },

  // ✅ 게시글 생성 (파일 없이, 파일은 별도로 업로드)
  createBoard: async (boardData: BoardRequest): Promise<BoardResponse> => {
    // ✅ FormData 형식으로 게시글 생성 (백엔드가 multipart/form-data를 기대)
    const formData = new FormData();

    // ✅ boardData를 FormData에 추가
    Object.keys(boardData).forEach((key) => {
      const typedKey = key as keyof BoardRequest;
      const value = boardData[typedKey];

      // 값이 null 또는 undefined가 아닌 경우만 추가
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    // ✅ 파일 없이 게시글만 생성 (files는 required = false이므로 생략 가능)
    const response = await apiClient.post('/boards', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    // ✅ 백엔드가 ResponseEntity<Void>를 반환하므로, Location 헤더나 응답 본문 확인
    // 응답 본문이 있으면 사용, 없으면 최신 게시글 조회
    if (response.data && response.data.boardId) {
      return response.data;
    }

    // ✅ 응답 본문이 없으면 Location 헤더에서 boardId 추출 시도
    const location = response.headers?.location;
    if (location) {
      const boardId = location.split('/').pop();
      if (boardId) {
        // 생성된 게시글 조회하여 반환
        const createdBoard = await boardService.getBoardById(boardId);
        if (createdBoard) {
          return createdBoard;
        }
      }
    }

    // ✅ 헤더도 없으면 해당 타입의 최신 게시글 조회
    const boards = await boardService.getAllBoards(boardData.boardType, {
      page: 0,
      size: 1,
      sort: 'createDatetime',
      direction: 'DESC',
    });

    if (boards?.content && boards.content.length > 0) {
      return boards.content[0];
    }

    throw new Error('게시글 생성 후 조회에 실패했습니다.');
  },

  // ✅ 게시글 수정 (파일 포함)
  updateBoard: async (
    boardId: string,
    boardRequest: BoardRequest
  ): Promise<void> => {
    // ✅ FormData 객체 생성
    const formData = new FormData();

    // ✅ boardRequest 데이터를 FormData에 추가
    Object.keys(boardRequest).forEach((key) => {
      const typedKey = key as keyof BoardRequest;
      const value = boardRequest[typedKey];

      // 값이 null 또는 undefined가 아닌 경우만 추가
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    await apiClient.put(`/boards/${boardId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
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
