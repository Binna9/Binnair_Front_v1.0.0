import apiClient from '@/utils/apiClient';
import { BookmarkRequest, PagedBookmarkResponse } from '@/types/BookmarkTypes';

interface PageRequest {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
}

export const BookmarkService = {
  // 즐겨찾기 전제 조회
  getAllBookmarks: async (
    pageRequest: PageRequest = {}
  ): Promise<PagedBookmarkResponse> => {
    const {
      page = 0,
      size = 9,
      sort = 'createDatetime',
      direction = 'DESC',
    } = pageRequest;

    const response = await apiClient.get('/bookmarks', {
      params: {
        page,
        size,
        sort,
        direction,
      },
    });

    return response.data;
  },

  // 즐겨찾기 생성
  createBookmark: async (bookmarkRequest: BookmarkRequest): Promise<void> => {
    await apiClient.post('/bookmarks', bookmarkRequest);
  },

  // 즐겨찾기 삭제
  deleteBookmark: async (bookmarkId: string): Promise<void> => {
    await apiClient.delete(`/bookmarks/${bookmarkId}`);
  },
};
