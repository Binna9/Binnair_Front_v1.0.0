import { useEffect, useState } from 'react';
import { HistoryListResponse } from '@/types/TradingHistoryTypes';

export const HISTORY_PAGE_SIZE = 20;

/**
 * BinnAIR 이력 API는 `limit`(최근 N건)만 지원하고 offset 페이지네이션이 없다.
 * 그래서 페이지가 늘어날 때마다 limit을 page*PAGE_SIZE로 키워 다시 조회한 뒤
 * 클라이언트에서 현재 페이지 구간만 잘라서 보여준다.
 */
export function useHistoryPage<T>(
  fetchPage: (limit: number) => Promise<HistoryListResponse<T>>,
  resetKey: unknown
) {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [resetKey]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchPage(page * HISTORY_PAGE_SIZE)
      .then((res) => {
        if (cancelled) return;
        setItems(res.items);
        setError(null);
      })
      .catch(() => {
        if (cancelled) return;
        setError('내역을 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, resetKey]);

  const start = (page - 1) * HISTORY_PAGE_SIZE;
  const pageItems = items.slice(start, start + HISTORY_PAGE_SIZE);
  const hasPrev = page > 1;
  const hasNext = items.length >= page * HISTORY_PAGE_SIZE;

  return {
    pageItems,
    page,
    setPage,
    hasPrev,
    hasNext,
    loading,
    error,
  };
}
