import { useState, useEffect } from 'react';
import { fetchBoards } from '@/services/BoardService';
import { PagedBoardResponse, BoardType, BoardResponse } from '@/types/Board';
import { useNotification } from '@/context/NotificationContext';

export const useNoticeBoard = (boardType: BoardType) => {
  const [boards, setBoards] = useState<PagedBoardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const notification = useNotification();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await fetchBoards(boardType);
        setBoards(data);
      } catch (error) {
        console.error(`❌ ${boardType} 데이터를 불러오는 중 오류 발생:`, error);
        notification.showAlert(
          'ERROR',
          '오류가 발생했습니다 관리자 문의 바랍니다.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [boardType]);

  // ✅ 최신순 정렬 (content 배열만 정렬)
  const sortedBoards: BoardResponse[] =
    boards?.content
      ?.slice()
      .sort(
        (a, b) =>
          new Date(b.createDatetime).getTime() -
          new Date(a.createDatetime).getTime()
      ) ?? [];

  return { boards: sortedBoards, loading, error };
};
