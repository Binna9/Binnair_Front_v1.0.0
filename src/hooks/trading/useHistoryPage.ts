import { useCallback, useEffect, useState } from 'react';
import { HistoryListResponse } from '@/types/TradingHistoryTypes';

export const HISTORY_PAGE_SIZE = 20;

export interface HistoryPageParams {
  limit: number;
  offset: number;
}

/**
 * 서버 offset 페이지네이션 (`limit` + `offset` + `has_more` / `total_count`).
 */
export function useHistoryPage<T>(
  fetchPage: (params: HistoryPageParams) => Promise<HistoryListResponse<T>>,
  resetKey: unknown
) {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<T[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [resetKey]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const offset = (page - 1) * HISTORY_PAGE_SIZE;

    fetchPage({ limit: HISTORY_PAGE_SIZE, offset })
      .then((res) => {
        if (cancelled) return;
        setItems(res.items ?? []);
        const itemCount = res.items?.length ?? 0;
        const total = res.total_count ?? res.count ?? itemCount;
        setTotalCount(total);
        setHasMore(
          res.has_more ??
            (res.total_count != null
              ? offset + itemCount < res.total_count
              : itemCount >= HISTORY_PAGE_SIZE)
        );
        setError(null);
      })
      .catch(() => {
        if (cancelled) return;
        setError('내역을 불러오지 못했습니다.');
        setItems([]);
        setTotalCount(0);
        setHasMore(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, resetKey]);

  const hasPrev = page > 1;
  const hasNext = hasMore;

  const goPrev = useCallback(() => setPage((p) => Math.max(1, p - 1)), []);
  const goNext = useCallback(() => setPage((p) => p + 1), []);

  return {
    pageItems: items,
    page,
    setPage,
    hasPrev,
    hasNext,
    goPrev,
    goNext,
    totalCount,
    loading,
    error,
  };
}
