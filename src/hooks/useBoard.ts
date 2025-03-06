import { useState, useEffect } from 'react';
import { fetchBoards } from '@/services/BoardService';
import { BoardResponse, BoardType } from '@/types/Board';

// ✅ 특정 `boardType`을 받아 데이터를 가져오는 커스텀 훅
export const useBoard = (boardType: BoardType) => {
  const [boards, setBoards] = useState<BoardResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await fetchBoards(boardType);
        setBoards(data);
      } catch (error) {
        console.error(`❌ ${boardType} 데이터를 불러오는 중 오류 발생:`, error);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [boardType]);

  // ✅ 최신순 정렬
  const sortedBoards = [...boards].sort(
    (a, b) =>
      new Date(b.createDatetime).getTime() -
      new Date(a.createDatetime).getTime()
  );

  return { boards: sortedBoards, loading, error };
};
