import { useEffect, useRef } from 'react';
import { ANOMALY_POLL_INTERVAL_MS } from '@/utils/anomalyRealtime';

type UseAnomalyPollingOptions = {
  enabled?: boolean;
  intervalMs?: number;
  /** mount/deps 변경 시 즉시 1회 실행 (기본 true) */
  immediate?: boolean;
};

/**
 * Anomaly Redis 스냅샷 REST 폴링.
 * - 탭 hidden이면 fetch skip
 * - 이전 요청은 AbortSignal로 취소
 * - in-flight 중이면 다음 틱으로 미룸 (요청 적체 방지)
 */
export function useAnomalyPolling(
  fetcher: (signal: AbortSignal) => void | Promise<void>,
  deps: readonly unknown[],
  options: UseAnomalyPollingOptions = {}
): void {
  const {
    enabled = true,
    intervalMs = ANOMALY_POLL_INTERVAL_MS,
    immediate = true,
  } = options;

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let abortController: AbortController | null = null;
    let inFlight = false;

    const scheduleNext = () => {
      if (cancelled) return;
      if (timeoutId != null) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        void run();
      }, intervalMs);
    };

    const run = async () => {
      if (cancelled) return;

      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        scheduleNext();
        return;
      }

      if (inFlight) {
        scheduleNext();
        return;
      }

      abortController?.abort();
      abortController = new AbortController();
      const { signal } = abortController;

      inFlight = true;
      try {
        await fetcherRef.current(signal);
      } catch {
        // 에러는 fetcher/화면에서 처리. 폴링은 계속.
      } finally {
        inFlight = false;
        if (!cancelled) scheduleNext();
      }
    };

    const onVisibility = () => {
      if (cancelled) return;
      if (document.visibilityState === 'visible') {
        void run();
      }
    };

    document.addEventListener('visibilitychange', onVisibility);

    if (immediate) {
      void run();
    } else {
      scheduleNext();
    }

    return () => {
      cancelled = true;
      abortController?.abort();
      if (timeoutId != null) clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, intervalMs, immediate, ...deps]);
}
