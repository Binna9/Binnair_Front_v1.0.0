import { useState, useEffect } from 'react';
import { BookmarkResponse } from '@/types/BookmarkTypes';
import bookmarkService from '@/services/BookmarkService';

export const useBookmark = () => {
  const [bookmarkItems, setBookmarkItems] = useState<BookmarkResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);

  // 북마크 목록 가져오기
  const fetchBookmarkItems = async (page = 0) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await bookmarkService.getAllBookmarks({
        page,
        size: 9,
        sort: 'createDatetime',
        direction: 'DESC',
      });

      if (response) {
        setBookmarkItems(response.content);
        setTotalPages(response.totalPages);
        setCurrentPage(response.number);
      }
    } catch (error) {
      console.error('❌ 북마크 목록 조회 실패:', error);
      setError('북마크 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 북마크 추가
  const addToBookmark = async (productId: string) => {
    setError(null);
    try {
      await bookmarkService.addToBookmark(productId);
      await fetchBookmarkItems(currentPage);
    } catch (error) {
      console.error('❌ 북마크 추가 실패:', error);
      setError('북마크 추가에 실패했습니다.');
      throw error;
    }
  };

  // 북마크 삭제
  const deleteBookmarkItem = async (bookmarkId: string) => {
    setError(null);
    try {
      await bookmarkService.deleteBookmarkItem(bookmarkId);
      await fetchBookmarkItems(currentPage);
    } catch (error) {
      console.error('❌ 북마크 삭제 실패:', error);
      setError('북마크 삭제에 실패했습니다.');
      throw error;
    }
  };

  // 북마크 존재 여부 확인
  const isBookmarked = (productId: string) => {
    return bookmarkItems.some((item) => item.productId === productId);
  };

  // 북마크 토글
  const toggleBookmark = async (productId: string) => {
    const existingBookmark = bookmarkItems.find(
      (item) => item.productId === productId
    );

    if (existingBookmark) {
      await deleteBookmarkItem(existingBookmark.bookmarkId);
    } else {
      await addToBookmark(productId);
    }
  };

  // 페이지 변경
  const handlePageChange = (page: number) => {
    fetchBookmarkItems(page);
  };

  // 컴포넌트 마운트 시 북마크 목록 가져오기
  useEffect(() => {
    fetchBookmarkItems();
  }, []);

  return {
    bookmarkItems,
    isLoading,
    error,
    totalPages,
    currentPage,
    fetchBookmarkItems,
    addToBookmark,
    deleteBookmarkItem,
    isBookmarked,
    toggleBookmark,
    handlePageChange,
  };
}; 