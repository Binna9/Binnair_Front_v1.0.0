import { useState, useEffect } from 'react';
import apiClient from '@/utils/apiClient';
import { NoticeBoardResponse } from '@/types/Board';

// ✅ 공지사항 데이터를 가져오는 커스텀 훅
export const useNoticeBoard = () => {
  const [notices, setNotices] = useState<NoticeBoardResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotices = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get<NoticeBoardResponse[]>(
          '/boards?boardType=NOTICE'
        );
        setNotices(response.data);
      } catch (error) {
        console.error('❌ 공지사항을 불러오는 중 오류 발생:', error);
        setError('공지사항을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  // ✅ 최신순 정렬 (날짜 변환 후 비교)
  const sortedNotices = [...notices].sort(
    (a, b) =>
      new Date(b.createDatetime).getTime() -
      new Date(a.createDatetime).getTime()
  );

  return { notices: sortedNotices, loading, error };
};
