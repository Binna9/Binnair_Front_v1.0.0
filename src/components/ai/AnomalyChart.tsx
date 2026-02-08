import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import anomalyService from '@/services/AnomalyService';
import {
  AnomalyScoreSeriesResponse,
  AnomalyScoreSeriesRequest,
  ChartDataPoint,
  AnomalyThreshold,
  AnomalySeverity,
} from '@/types/AnomalyTypes';
import {
  timeframeToSeconds,
  getTimeUntilNextCandle,
  getNextCandleStartTime,
  toISO8601UTC,
  parseISO8601,
} from '@/utils/timeframeUtils';

interface AnomalyChartProps {
  venueId: number;
  instrumentId: number;
  timeframe: string; // 예: '5m', '1h'
  scoreVersion?: string;
  days?: number; // 조회할 일수 (기본값: 1일)
  startDate?: string; // 시작 날짜 (YYYY-MM-DD 형식, days보다 우선)
  endDate?: string; // 종료 날짜 (YYYY-MM-DD 형식, days보다 우선)
  threshold?: AnomalyThreshold; // 이상치 판단 기준
  autoRefresh?: boolean; // 자동 갱신 여부 (기본값: true)
}

/**
 * 이상탐지 차트 컴포넌트
 * 캔들(OHLCV) + 이상점수를 함께 표시하는 차트
 */
const AnomalyChart: React.FC<AnomalyChartProps> = ({
  venueId,
  instrumentId,
  timeframe,
  scoreVersion,
  days = 1,
  startDate,
  endDate,
  threshold = { score: 2.0 }, // 기본 threshold: score >= 2.0
  autoRefresh = true,
}) => {
  const [data, setData] = useState<AnomalyScoreSeriesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [nextRefreshTime, setNextRefreshTime] = useState<Date | null>(null);
  const autoRefreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef(true);

  /**
   * 응답에 포함된 windowDays 중 대표 windowDays 선택
   * - 30이 있으면 30 우선
   * - 없으면 첫 번째 값 사용
   */
  const getPrimaryWindowKey = useCallback((response: AnomalyScoreSeriesResponse): string | null => {
    const days = response?.meta?.windowDays;
    if (!Array.isArray(days) || days.length === 0) return null;

    if (days.includes(30)) return '30';
    return String(days[0]);
  }, []);

  /**
   * 서버 응답 데이터를 차트용 데이터 포인트로 변환
   */
  const transformToChartData = useCallback(
    (response: AnomalyScoreSeriesResponse): ChartDataPoint[] => {
      if (!response || !response.points || !Array.isArray(response.points)) {
        return [];
      }
      const windowKey = getPrimaryWindowKey(response);

      return response.points.map((point) => {
        const date = parseISO8601(point.ts);
        const timestamp = date.getTime();

        const score =
          windowKey && point.scores ? point.scores[windowKey] ?? null : null;
        const driver =
          windowKey && point.drivers ? point.drivers[windowKey] ?? null : null;
        const z =
          windowKey && point.z ? point.z[windowKey] ?? null : null;

        // 이상치 판단
        let isAnomaly = false;
        let anomalySeverity: AnomalySeverity = 'none';

        if (score !== null) {
          const absScore = Math.abs(score);
          if (absScore >= threshold.score) {
            isAnomaly = true;
            if (absScore >= threshold.score * 2) {
              anomalySeverity = 'high';
            } else if (absScore >= threshold.score * 1.5) {
              anomalySeverity = 'medium';
            } else {
              anomalySeverity = 'low';
            }
          }
        }

        return {
          ts: point.ts,
          timestamp,
          date,
          open: point.o,
          high: point.h,
          low: point.l,
          close: point.c,
          volume: point.v,
          score,
          zRet: z?.ret ?? null,
          zVol: z?.vol ?? null,
          zRng: z?.rng ?? null,
          driver,
          isAnomaly,
          anomalySeverity,
        };
      });
    },
    [threshold, getPrimaryWindowKey]
  );

  /**
   * API 호출 함수
   * @param toTime 조회 종료 시간 (기본값: 현재 시간)
   */
  const fetchData = useCallback(
    async (toTime?: Date) => {
      try {
        setLoading(true);
        setError(null);

        // 조회 기간 계산
        let from: string;
        let to: string;
        const now = toTime || new Date();

        // 날짜 범위가 지정된 경우 (과거 데이터 조회)
        if (startDate && endDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0); // 시작일 00:00:00
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999); // 종료일 23:59:59
          from = toISO8601UTC(start);
          to = toISO8601UTC(end);
        } else {
          // 일수 기반 계산 (실시간 모니터링)
          to = toISO8601UTC(now);
          from = toISO8601UTC(
            new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
          );
        }

        const request: AnomalyScoreSeriesRequest = {
          venueId,
          instrumentId,
          from,
          to,
          timeframe,
          scoreVersion,
        };

        const response = await anomalyService.getSeries(request);
        setData(response);
        setLastUpdateTime(new Date());
        isInitialLoadRef.current = false;

        // 다음 갱신 시간 계산
        if (autoRefresh) {
          const nextRefresh = getNextCandleStartTime(timeframe, now);
          setNextRefreshTime(nextRefresh);
        }
      } catch (err) {
        console.error('❌ 이상탐지 데이터 조회 실패:', err);
        setError(
          err instanceof Error
            ? err.message
            : '데이터를 불러오는데 실패했습니다.'
        );
      } finally {
        setLoading(false);
      }
    },
    [venueId, instrumentId, timeframe, scoreVersion, days, startDate, endDate, autoRefresh]
  );

  /**
   * 초기 데이터 로드 및 파라미터 변경 시 재로드
   */
  useEffect(() => {
    isInitialLoadRef.current = true;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueId, instrumentId, timeframe, scoreVersion, days]);

  /**
   * 자동 갱신 로직
   * autoRefresh가 활성화되고 데이터가 로드된 후에만 시작
   */
  useEffect(() => {
    // 기존 타이머 정리
    if (autoRefreshTimeoutRef.current) {
      clearTimeout(autoRefreshTimeoutRef.current);
      autoRefreshTimeoutRef.current = null;
    }

    if (!autoRefresh || !data) return;

    const scheduleNextRefresh = () => {
      const now = new Date();
      const timeUntilNext = getTimeUntilNextCandle(timeframe, now);

      // 다음 봉 시작 시간까지 대기 후 갱신
      autoRefreshTimeoutRef.current = setTimeout(() => {
        // 다음 봉 시작 시간을 기준으로 데이터 조회
        const nextCandleStart = getNextCandleStartTime(timeframe, new Date());
        fetchData(nextCandleStart).then(() => {
          // 갱신 성공 후 다음 갱신 스케줄링 (재귀 호출)
          scheduleNextRefresh();
        }).catch(() => {
          // 에러 발생 시에도 다음 갱신 스케줄링 (재시도)
          scheduleNextRefresh();
        });
      }, Math.max(timeUntilNext, 1000)); // 최소 1초 대기
    };

    // 초기 스케줄링 (데이터가 로드된 후에만 시작)
    scheduleNextRefresh();

    return () => {
      if (autoRefreshTimeoutRef.current) {
        clearTimeout(autoRefreshTimeoutRef.current);
        autoRefreshTimeoutRef.current = null;
      }
    };
    // data를 의존성에 포함하지 않아 무한 루프 방지
    // data는 초기 로드 완료 여부만 확인하는 용도
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, timeframe]);

  /**
   * 차트 데이터 변환
   */
  const chartData = useMemo(() => {
    if (!data || !data.points || !Array.isArray(data.points)) {
      return [];
    }
    return transformToChartData(data);
  }, [data, transformToChartData]);

  /**
   * X축 포맷터 (시간 표시)
   */
  const formatXAxis = (tickItem: number) => {
    const date = new Date(tickItem);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  /**
   * 툴팁 포맷터
   */
  const formatTooltip = (value: number | null, name: string) => {
    if (value === null) return ['N/A', name];
    return [value.toFixed(4), name];
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">데이터를 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-red-500">❌ {error}</div>
      </div>
    );
  }

  if (!data || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">표시할 데이터가 없습니다.</div>
      </div>
    );
  }

  const summaryWindowKey = getPrimaryWindowKey(data);
  const latestScore =
    summaryWindowKey && data.summary.latestScores
      ? data.summary.latestScores[summaryWindowKey] ?? null
      : null;
  const maxScore =
    summaryWindowKey && data.summary.maxScores
      ? data.summary.maxScores[summaryWindowKey] ?? null
      : null;

  return (
    <div className="w-full h-full">
      {/* 헤더 정보 */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              {data.meta.instrumentSymbol} ({data.meta.timeframe})
            </h3>
            <p className="text-sm text-gray-600">
              {data.meta.venueCode} • {data.meta.scoreVersion}
            </p>
          </div>
          <div className="text-right">
            {lastUpdateTime && (
              <p className="text-xs text-gray-500">
                마지막 업데이트: {lastUpdateTime.toLocaleTimeString()}
              </p>
            )}
            {nextRefreshTime && autoRefresh && (
              <p className="text-xs text-blue-600">
                다음 갱신: {nextRefreshTime.toLocaleTimeString()}
              </p>
            )}
            <p className="text-xs text-gray-500">
              데이터 포인트: {data.meta.count}개
            </p>
          </div>
        </div>
        {/* 요약 정보 */}
        {latestScore !== null && (
          <div className="mt-2 flex gap-4 text-sm">
            <span>
              최신 점수{summaryWindowKey ? `(${summaryWindowKey}d)` : ''}:{' '}
              <strong>{latestScore.toFixed(2)}</strong>
            </span>
            {maxScore !== null && (
              <span>
                최대 점수{summaryWindowKey ? `(${summaryWindowKey}d)` : ''}:{' '}
                <strong>{maxScore.toFixed(2)}</strong>
              </span>
            )}
          </div>
        )}
      </div>

      {/* 차트 */}
      <ResponsiveContainer width="100%" height={600}>
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="timestamp"
            type="number"
            scale="time"
            domain={['dataMin', 'dataMax']}
            tickFormatter={formatXAxis}
            stroke="#666"
          />
          <YAxis
            yAxisId="price"
            orientation="left"
            stroke="#2563eb"
            label={{ value: '가격', angle: -90, position: 'insideLeft' }}
          />
          <YAxis
            yAxisId="score"
            orientation="right"
            stroke="#dc2626"
            label={{ value: '이상점수', angle: 90, position: 'insideRight' }}
          />
          <Tooltip
            formatter={formatTooltip}
            labelFormatter={(label) => {
              const date = new Date(label);
              return date.toLocaleString('ko-KR');
            }}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          <Legend />

          {/* 가격 라인 (종가) */}
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="close"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            name="종가"
          />

          {/* 이상점수 라인 */}
          {chartData.some((d) => d.score !== null) && (
            <Line
              yAxisId="score"
              type="monotone"
              dataKey="score"
              stroke="#dc2626"
              strokeWidth={2}
              dot={false}
              name="이상점수"
            />
          )}

          {/* 이상치 기준선 */}
          <ReferenceLine
            yAxisId="score"
            y={threshold.score}
            stroke="#f59e0b"
            strokeDasharray="3 3"
            label={{ value: `기준: ${threshold.score}`, position: 'right' }}
          />
          <ReferenceLine
            yAxisId="score"
            y={-threshold.score}
            stroke="#f59e0b"
            strokeDasharray="3 3"
            label={{ value: `기준: -${threshold.score}`, position: 'right' }}
          />

          {/* 이상치 마커 */}
          {chartData
            .filter((d) => d.isAnomaly)
            .map((point, index) => (
              <Line
                key={`anomaly-${index}`}
                yAxisId="score"
                type="monotone"
                dataKey="score"
                data={[point]}
                stroke={
                  point.anomalySeverity === 'high'
                    ? '#dc2626'
                    : point.anomalySeverity === 'medium'
                    ? '#f59e0b'
                    : '#3b82f6'
                }
                strokeWidth={3}
                dot={{ fill: '#dc2626', r: 6 }}
                name="이상치"
              />
            ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AnomalyChart;

