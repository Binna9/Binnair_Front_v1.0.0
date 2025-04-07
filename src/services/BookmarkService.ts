import { BookmarkResponse, BookmarkRequest, PagedBookmarkResponse } from '@/types/BookmarkTypes';
import apiClient from '@/utils/apiClient';

interface PageRequest {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
}

export const bookmarkService = {
  // 북마크 목록 조회
  getAllBookmarks: async (
    pageRequest: PageRequest = {
      page: 0,
      size: 9,
      sort: 'createDatetime',
      direction: 'DESC',
    }
  ): Promise<PagedBookmarkResponse | null> => {
    try {
      const { page, size, sort, direction } = pageRequest;
      const response = await apiClient.get<PagedBookmarkResponse>('/bookmarks', {
        params: {
          page,
          size,
          sort: `${sort},${direction}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('❌ 북마크 목록 조회 실패:', error);
      return null;
    }
  },

  // 북마크 추가
  addToBookmark: async (productId: string): Promise<void> => {
    try {
      const request: BookmarkRequest = { productId };
      await apiClient.post('/bookmarks', request);
    } catch (error) {
      console.error('❌ 북마크 추가 실패:', error);
      throw error;
    }
  },

  // 북마크 삭제
  deleteBookmarkItem: async (bookmarkId: string): Promise<void> => {
    try {
      await apiClient.delete(`/bookmarks/${bookmarkId}`);
    } catch (error) {
      console.error('❌ 북마크 삭제 실패:', error);
      throw error;
    }
  },
};

export default bookmarkService;
