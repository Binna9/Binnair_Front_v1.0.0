import { useState, useEffect } from 'react';
import { boardService } from '@/services/BoardService';
import { PagedBoardResponse, BoardResponse } from '@/types/BoardTypes';
import { BoardType } from '@/types/BoardEnum';
import { useNotification } from '@/context/NotificationContext';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

export const useNoticeBoard = (boardType: BoardType) => {
  const [boards, setBoards] = useState<PagedBoardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const notification = useNotification();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchData = async () => {
      // 로그인 상태가 아니면 데이터를 불러오지 않음
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await boardService.getAllBoards(boardType);
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
  }, [boardType, notification, user]);

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
