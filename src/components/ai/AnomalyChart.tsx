import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ComposedChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { Maximize2, Minimize2, ZoomOut } from 'lucide-react';
import {
  type AnomalyFinalMarkerVM,
  type AnomalySeriesChartPoint,
  type AnomalySeriesDataset,
  type AnomalyTooltipVM,
  type AnomalyWindowDays,
} from '@/types/AnomalyTypes';
import { buildTooltipVM } from '@/utils/anomalyTransform';

interface AnomalyChartProps {
  dataset: AnomalySeriesDataset;
  visibleWindows: Record<AnomalyWindowDays, boolean>;
  finalMarker?: AnomalyFinalMarkerVM | null;
}

const AnomalyChart: React.FC<AnomalyChartProps> = ({
  dataset,
  visibleWindows,
  finalMarker,
}) => {
  const points = dataset.points;
  const scoreBands = dataset.scoreBands;

  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chartWidth, setChartWidth] = useState<number>(0);

  type TimeRange = { left: number; right: number };
  const [viewRange, setViewRange] = useState<TimeRange | null>(null);
  const [dragRange, setDragRange] = useState<{ left: number | null; right: number | null }>({
    left: null,
    right: null,
  });

  // Legend 클릭으로 각 시리즈 표시/숨김 토글
  const [hiddenSeries, setHiddenSeries] = useState<Record<string, boolean>>({});
  const toggleSeries = useCallback((key: string) => {
    setHiddenSeries((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // 90d@5m면 포인트가 2~3만개까지 늘어 DOM 렌더링이 급격히 느려집니다.
  // 표시용으로만 다운샘플링해서 DOM 노드 수를 제한합니다(툴팁/렌더링 모두 이 표본을 사용).
  const MAX_RENDER_POINTS = 1500;

  const pointsInRange = useMemo(() => {
    if (!viewRange) return points;
    const left = Math.min(viewRange.left, viewRange.right);
    const right = Math.max(viewRange.left, viewRange.right);
    return points.filter((p) => p.t >= left && p.t <= right);
  }, [points, viewRange]);

  const displayPoints = useMemo(() => {
    const src = pointsInRange;
    if (src.length <= MAX_RENDER_POINTS) return src;
    const step = Math.ceil(src.length / MAX_RENDER_POINTS);
    const sampled: AnomalySeriesChartPoint[] = [];
    for (let i = 0; i < src.length; i += step) sampled.push(src[i]);
    const last = src[src.length - 1];
    if (sampled.length === 0 || sampled[sampled.length - 1].t !== last.t) sampled.push(last);
    return sampled;
  }, [pointsInRange]);

  const timeExtent = useMemo(() => {
    if (displayPoints.length === 0) return null;
    const tMin = displayPoints[0].t;
    const tMax = displayPoints[displayPoints.length - 1].t;
    if (!Number.isFinite(tMin) || !Number.isFinite(tMax)) return null;
    return { tMin, tMax, spanMs: Math.max(0, tMax - tMin) };
  }, [displayPoints]);

  const xAxisStyle = useMemo(() => {
    const spanMs = timeExtent?.spanMs ?? 0;
    const MIN = 60 * 1000;
    const H = 60 * MIN;
    const D = 24 * H;

    // 화면 폭에 따라 라벨 개수 자동 제한(가시성 우선)
    // - plot area 폭을 대략 추정(좌/우 마진 + y축 라벨 영역 제외)
    const estimatedPlotWidth = Math.max(320, (chartWidth || 960) - 260);
    const minLabelPx = 96; // 2줄 라벨까지 고려한 최소 간격(겹침 방지)
    const tickTarget = Math.min(10, Math.max(5, Math.floor(estimatedPlotWidth / minLabelPx)));

    // 범위가 넓을수록 날짜 중심, 좁을수록 시간 중심
    const mode: 'time' | 'dateTime' | 'date' =
      spanMs >= 21 * D ? 'date' : spanMs >= 2 * D ? 'dateTime' : 'time';

    // 2줄 라벨은 dateTime에서만 사용
    const twoLine = mode === 'dateTime';
    const axisHeight = twoLine ? 34 : 24;

    // “예쁜” 간격 후보(분/시간/일). spanMs에 맞춰 가장 가까운 상위 간격 선택
    const niceStepsMs = [
      5 * MIN,
      10 * MIN,
      15 * MIN,
      30 * MIN,
      1 * H,
      2 * H,
      3 * H,
      6 * H,
      12 * H,
      1 * D,
      2 * D,
      7 * D,
      14 * D,
      30 * D,
      60 * D,
    ];

    const ideal = spanMs > 0 ? spanMs / Math.max(1, tickTarget - 1) : 0;
    const stepMs = niceStepsMs.find((s) => s >= ideal) ?? niceStepsMs[niceStepsMs.length - 1];

    return { mode, twoLine, axisHeight, tickTarget, stepMs };
  }, [chartWidth, timeExtent]);

  const formatXAxisParts = useCallback(
    (t: number): { top: string; bottom?: string } => {
      const d = new Date(t);
      const MM = String(d.getMonth() + 1).padStart(2, '0');
      const DD = String(d.getDate()).padStart(2, '0');
      const HH = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');

      if (xAxisStyle.mode === 'date') {
        return { top: `${MM}-${DD}` };
      }
      if (xAxisStyle.mode === 'dateTime') {
        return { top: `${MM}-${DD}`, bottom: `${HH}:${mm}` };
      }
      return { top: `${HH}:${mm}` };
    },
    [xAxisStyle.mode]
  );

  const renderXAxisTick = useCallback(
    (props: any) => {
      const { x, y, payload } = props ?? {};
      const value = typeof payload?.value === 'number' ? payload.value : Number(payload?.value);
      if (!Number.isFinite(value)) return null;

      const { top, bottom } = formatXAxisParts(value);
      const fill = '#6b7280';

      return (
        <g transform={`translate(${x},${y})`}>
          <text x={0} y={0} dy={bottom ? 10 : 14} textAnchor="middle" fill={fill} fontSize={11}>
            <tspan x="0">{top}</tspan>
            {bottom ? <tspan x="0" dy="12">{bottom}</tspan> : null}
          </text>
        </g>
      );
    },
    [formatXAxisParts]
  );

  const chartData = useMemo(
    () =>
      displayPoints.map((p) => ({
        ...p,
        score30: p.scores[30] ?? null,
        score60: p.scores[60] ?? null,
        score90: p.scores[90] ?? null,
      })),
    [displayPoints]
  );

  const formattedViewRangeLabel = useMemo(() => {
    if (!viewRange) return null;
    const left = Math.min(viewRange.left, viewRange.right);
    const right = Math.max(viewRange.left, viewRange.right);
    const leftText = new Date(left).toLocaleString('ko-KR');
    const rightText = new Date(right).toLocaleString('ko-KR');
    return `${leftText} ~ ${rightText}`;
  }, [viewRange]);

  // 두 차트의 시간 축(그리드/틱)을 “경계에 정렬된 예쁜 단위”로 고정 생성
  const xTicks = useMemo(() => {
    if (!timeExtent) return undefined;
    const { tMin, tMax } = timeExtent;
    const { stepMs, tickTarget } = xAxisStyle;

    if (!Number.isFinite(stepMs) || stepMs <= 0) return undefined;

    const MIN = 60 * 1000;
    const H = 60 * MIN;
    const D = 24 * H;

    let start: number;

    // step이 하루 이상이면 “로컬 자정”에 정렬(보기 좋음)
    if (stepMs >= D) {
      const d0 = new Date(tMin);
      const midnight = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate()).getTime();
      start = midnight;
      while (start < tMin) start += stepMs;
    } else {
      // 그 외는 stepMs 격자에 정렬
      start = Math.ceil(tMin / stepMs) * stepMs;
    }

    const ticks: number[] = [];
    for (let t = start; t <= tMax; t += stepMs) ticks.push(t);

    // 양 끝은 항상 포함(축 “끝”이 안 뜨는 느낌 방지)
    ticks.unshift(tMin);
    ticks.push(tMax);

    // 중복 제거 + 정렬
    const all = Array.from(new Set(ticks)).sort((a, b) => a - b);

    // 너무 많으면 균등 간격으로 줄이기(항상 첫/마지막 포함)
    const maxCount = Math.max(2, tickTarget);
    if (all.length <= maxCount) return all;

    const first = all[0];
    const last = all[all.length - 1];
    const middle = all.slice(1, -1);
    const need = Math.max(0, maxCount - 2);
    if (need === 0) return [first, last];

    const picked: number[] = [];
    for (let i = 0; i < need; i++) {
      const idx = Math.round(((i + 1) * (middle.length + 1)) / (need + 1)) - 1;
      const t = middle[Math.min(Math.max(idx, 0), middle.length - 1)];
      if (typeof t === 'number') picked.push(t);
    }

    return Array.from(new Set([first, ...picked, last])).sort((a, b) => a - b);
  }, [timeExtent, xAxisStyle]);

  const seriesDefs = useMemo(() => {
    const defs: Array<{ key: string; label: string; color: string }> = [
      { key: 'c', label: 'Close[종가]', color: '#2563eb' },
      { key: 'v', label: '거래량(Volume)', color: 'rgba(100, 74, 74, 0.75)' },
    ];

    if (visibleWindows[30]) defs.push({ key: 'score30', label: 'Score 30d', color: '#60a5fa' });
    if (visibleWindows[60]) defs.push({ key: 'score60', label: 'Score 60d', color: '#f59e0b' });
    if (visibleWindows[90]) defs.push({ key: 'score90', label: 'Score 90d', color: '#dc2626' });

    return defs;
  }, [visibleWindows]);

  const ToggleLegend = useCallback(() => {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        {seriesDefs.map((s) => {
          const isHidden = !!hiddenSeries[s.key];
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => toggleSeries(s.key)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                isHidden
                  ? 'border-gray-200 bg-white text-gray-400 hover:bg-gray-50'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
              title={isHidden ? '표시하기' : '숨기기'}
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: isHidden ? '#d1d5db' : s.color }}
              />
              <span className={isHidden ? 'line-through' : ''}>{s.label}</span>
            </button>
          );
        })}
      </div>
    );
  }, [hiddenSeries, seriesDefs, toggleSeries]);

  useEffect(() => {
    const onFsChange = () => {
      const fsEl = document.fullscreenElement;
      setIsFullscreen(!!fsEl && fsEl === rootRef.current);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // 차트 가로폭을 측정해서 X축 tick 밀도를 자동 조정
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect?.width ?? 0;
      if (Number.isFinite(w) && w > 0) setChartWidth(w);
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }
      const el = rootRef.current;
      if (!el) return;
      await el.requestFullscreen();
    } catch (e) {
      // 브라우저 정책/권한/제스처 조건에 의해 실패할 수 있습니다.
      console.warn('Fullscreen 토글 실패:', e);
    }
  }, []);

  const getActiveTFromEvent = useCallback((state: any): number | null => {
    // Recharts 이벤트 객체에서 현재 x축(시간) 값을 최대한 안전하게 추출
    const t =
      typeof state?.activeLabel === 'number'
        ? state.activeLabel
        : typeof state?.activeLabel === 'string'
          ? Number(state.activeLabel)
          : typeof state?.activePayload?.[0]?.payload?.t === 'number'
            ? state.activePayload[0].payload.t
            : typeof state?.activePayload?.[0]?.payload?.t === 'string'
              ? Number(state.activePayload[0].payload.t)
              : null;

    if (!Number.isFinite(t as number)) return null;
    return t as number;
  }, []);

  const startDragSelect = useCallback(
    (state: any) => {
      const t = getActiveTFromEvent(state);
      if (t === null) return;
      setDragRange({ left: t, right: t });
    },
    [getActiveTFromEvent]
  );

  const moveDragSelect = useCallback(
    (state: any) => {
      if (dragRange.left === null) return;
      const t = getActiveTFromEvent(state);
      if (t === null) return;
      setDragRange((prev) => ({ ...prev, right: t }));
    },
    [dragRange.left, getActiveTFromEvent]
  );

  const finishDragSelect = useCallback(() => {
    const left = dragRange.left;
    const right = dragRange.right;
    setDragRange({ left: null, right: null });

    if (left === null || right === null) return;
    if (left === right) return; // 클릭만 한 경우는 무시

    const next: TimeRange = { left: Math.min(left, right), right: Math.max(left, right) };
    setViewRange(next);
  }, [dragRange.left, dragRange.right]);

  const resetZoom = useCallback(() => {
    setViewRange(null);
    setDragRange({ left: null, right: null });
  }, []);

  const tooltipContent = useMemo(() => {
    const TooltipView: React.FC<{
      active?: boolean;
      payload?: Array<{ payload?: AnomalySeriesChartPoint }>;
      label?: number;
    }> = ({ active, payload }) => {
      if (!active || !payload || payload.length === 0) return null;
      const p = payload[0]?.payload;
      if (!p) return null;

      const vm: AnomalyTooltipVM = buildTooltipVM(p);

      return (
        <div className="bg-white/95 border border-gray-200 rounded-md p-3 shadow-sm">
          <div className="text-xs text-gray-500 mb-2">{new Date(vm.t).toLocaleString('ko-KR')}</div>
          <div className="text-xs text-gray-700 mb-2 tabular-nums">
            <span className="mr-2">O {p.o.toFixed(2)}</span>
            <span className="mr-2">H {p.h.toFixed(2)}</span>
            <span className="mr-2">L {p.l.toFixed(2)}</span>
            <span className="mr-2 font-semibold">C {p.c.toFixed(2)}</span>
            <span>V {p.v.toLocaleString()}</span>
          </div>
          <div className="space-y-1">
            {vm.rows.map((r) => {
              const scoreText = r.score === null ? 'N/A' : r.score.toFixed(2);
              const driverText = r.driver ?? '-';
              const zText =
                r.zLabel && r.zValue !== null ? `${r.zLabel}=${r.zValue.toFixed(2)}` : '';

              return (
                <div key={r.windowDays} className="text-sm flex items-baseline gap-2">
                  <span className="w-[40px] text-gray-600">{r.windowDays}d</span>
                  <span className="font-semibold text-gray-900">{scoreText}</span>
                  <span className="text-gray-700">
                    ({driverText}
                    {zText ? (
                      <>
                        , <span className="font-semibold text-gray-900">{zText}</span>
                      </>
                    ) : null}
                    )
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    };
    return TooltipView;
  }, []);

  const heights = useMemo(() => {
    // fullscreen: 브라우저 전체화면에서 공간을 최대 활용
    if (isFullscreen) {
      return {
        main: 'calc(100vh - 340px)',
        volume: '220px',
      } as const;
    }
    // 기본 화면
    return {
      main: '520px',
      volume: '160px',
    } as const;
  }, [isFullscreen]);

  const ChartsView = useCallback(
    (props: { mainHeight: string; volumeHeight: string; denseLegend?: boolean }) => {
      const { mainHeight, volumeHeight } = props;

      // 두 차트의 X축 정렬을 위해 plot area(좌/우 마진)과 XAxis props를 동일하게 유지합니다.
      const commonMargin = { right: 90, left: 12 };
      return (
        <div className="w-full h-full space-y-2">
          {/* 상단: 가격 + Score */}
          <div className="w-full" style={{ height: mainHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                syncId="anomalySeries"
                syncMethod="value"
                data={chartData}
                margin={{ top: 16, right: commonMargin.right, left: commonMargin.left, bottom: 6 }}
                onMouseDown={startDragSelect}
                onMouseMove={moveDragSelect}
                onMouseUp={finishDragSelect}
              >
                <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                <XAxis
                  dataKey="t"
                  type="number"
                  scale="time"
                  domain={['dataMin', 'dataMax']}
                  ticks={xTicks}
                  tick={renderXAxisTick as any}
                  stroke="#6b7280"
                  minTickGap={28}
                  interval={0}
                  height={xAxisStyle.axisHeight}
                />
                <YAxis
                  yAxisId="price"
                  orientation="left"
                  stroke="#2563eb"
                  width={60}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  yAxisId="score"
                  orientation="right"
                  stroke="#dc2626"
                  width={55}
                  tick={{ fontSize: 12 }}
                />

                <Tooltip content={tooltipContent as any} />

                {/* 드래그 선택 영역(확대) */}
                {dragRange.left !== null && dragRange.right !== null && dragRange.left !== dragRange.right ? (
                  <ReferenceArea
                    x1={Math.min(dragRange.left, dragRange.right)}
                    x2={Math.max(dragRange.left, dragRange.right)}
                    yAxisId="price"
                    strokeOpacity={0.25}
                    fill="rgba(37, 99, 235, 0.12)"
                  />
                ) : null}

                <Line
                  yAxisId="price"
                  type="linear"
                  dataKey="c"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                  name="Close[종가]"
                  hide={!!hiddenSeries.c}
                />

                {visibleWindows[30] && (
                  <Line
                    yAxisId="score"
                    type="linear"
                    dataKey="score30"
                    stroke="#60a5fa"
                    strokeWidth={2}
                    dot={false}
                    connectNulls={false}
                    isAnimationActive={false}
                    name="Score 30d"
                    hide={!!hiddenSeries.score30}
                  />
                )}
                {visibleWindows[60] && (
                  <Line
                    yAxisId="score"
                    type="linear"
                    dataKey="score60"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                    connectNulls={false}
                    isAnimationActive={false}
                    name="Score 60d"
                    hide={!!hiddenSeries.score60}
                  />
                )}
                {visibleWindows[90] && (
                  <Line
                    yAxisId="score"
                    type="linear"
                    dataKey="score90"
                    stroke="#dc2626"
                    strokeWidth={2}
                    dot={false}
                    connectNulls={false}
                    isAnimationActive={false}
                    name="Score 90d"
                    hide={!!hiddenSeries.score90}
                  />
                )}

                <ReferenceLine
                  yAxisId="score"
                  y={scoreBands.watch}
                  stroke="#9ca3af"
                  strokeDasharray="4 4"
                  label={{
                    value: `● WATCH ${scoreBands.watch}`,
                    position: 'right',
                    offset: 26,
                    fill: '#6b7280',
                  }}
                />
                <ReferenceLine
                  yAxisId="score"
                  y={scoreBands.anomaly}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  label={{
                    value: `▲ ANOMALY ${scoreBands.anomaly}`,
                    position: 'right',
                    offset: 26,
                    fill: '#b45309',
                  }}
                />
                <ReferenceLine
                  yAxisId="score"
                  y={scoreBands.severe}
                  stroke="#dc2626"
                  strokeDasharray="4 4"
                  label={{
                    value: `■ SEVERE ${scoreBands.severe}`,
                    position: 'right',
                    offset: 26,
                    fill: '#b91c1c',
                  }}
                />

                {finalMarker?.t ? (
                  <ReferenceLine
                    x={finalMarker.t}
                    stroke="#111827"
                    strokeDasharray="2 2"
                    label={{ value: 'FINAL', position: 'top', fill: '#111827' }}
                  />
                ) : null}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* 하단: 거래량 (상단과 같은 plot area 폭/시간축 설정) */}
          <div className="w-full" style={{ height: volumeHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                syncId="anomalySeries"
                syncMethod="value"
                data={chartData}
                margin={{ top: 0, right: commonMargin.right, left: commonMargin.left, bottom: 6 }}
                onMouseDown={startDragSelect}
                onMouseMove={moveDragSelect}
                onMouseUp={finishDragSelect}
              >
                <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                <XAxis
                  dataKey="t"
                  type="number"
                  scale="time"
                  domain={['dataMin', 'dataMax']}
                  ticks={xTicks}
                  tick={renderXAxisTick as any}
                  stroke="#6b7280"
                  minTickGap={28}
                  interval={0}
                  height={xAxisStyle.axisHeight}
                />
                <YAxis
                  yAxisId="volume"
                  orientation="left"
                  width={60}
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                {/* 상단 차트의 오른쪽(score) Y축 폭과 동일하게 공간을 남겨 plot area를 정확히 맞춤 */}
                <YAxis
                  yAxisId="spacerRight"
                  orientation="right"
                  width={55}
                  tick={false}
                  axisLine={false}
                  tickLine={false}
                />

                {/* 하단 차트에서는 tooltip 박스를 숨기고, sync를 위해 이벤트만 유지 */}
                <Tooltip content={() => null} />

                {dragRange.left !== null && dragRange.right !== null && dragRange.left !== dragRange.right ? (
                  <ReferenceArea
                    x1={Math.min(dragRange.left, dragRange.right)}
                    x2={Math.max(dragRange.left, dragRange.right)}
                    yAxisId="volume"
                    strokeOpacity={0.2}
                    fill="rgba(100, 74, 74, 0.10)"
                  />
                ) : null}

                <Bar
                  yAxisId="volume"
                  dataKey="v"
                  fill="rgba(100, 74, 74, 0.35)"
                  stroke="rgba(100, 74, 74, 0.55)"
                  strokeWidth={0.5}
                  barSize={6}
                  isAnimationActive={false}
                  name="거래량(Volume)"
                  hide={!!hiddenSeries.v}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 클릭 가능한 설명(레전드): 여기서만 토글 */}
          <ToggleLegend />
        </div>
      );
    },
    [
      chartData,
      finalMarker?.t,
      dragRange.left,
      dragRange.right,
      xAxisStyle.axisHeight,
      renderXAxisTick,
      scoreBands.anomaly,
      scoreBands.severe,
      scoreBands.watch,
      finishDragSelect,
      hiddenSeries,
      moveDragSelect,
      startDragSelect,
      ToggleLegend,
      tooltipContent,
      visibleWindows,
      xTicks,
    ]
  );

  return (
    <div
      ref={rootRef}
      className={`w-full h-full ${isFullscreen ? 'bg-white p-4' : ''}`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-gray-900">Series Chart</div>
          <div className="text-xs text-gray-500">
            드래그해서 구간을 지정하면 해당 구간으로 확대됩니다. (표본 {displayPoints.length.toLocaleString()} / 전체 {points.length.toLocaleString()})
          </div>
          {formattedViewRangeLabel ? (
            <div className="mt-1 text-xs text-blue-700 font-semibold truncate">
              확대 구간: {formattedViewRangeLabel}
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {viewRange ? (
            <button
              type="button"
              onClick={resetZoom}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold text-gray-800"
              title="확대 해제"
            >
              <ZoomOut className="w-4 h-4" />
              확대 해제
            </button>
          ) : null}

          <button
            type="button"
            onClick={toggleFullscreen}
            aria-pressed={isFullscreen}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border text-sm font-semibold transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:ring-offset-2 active:translate-y-[1px] ${
              isFullscreen
                ? 'border-gray-900 bg-gray-900 text-white hover:bg-gray-800 hover:border-gray-800 hover:shadow-md'
                : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-900 hover:text-white hover:border-gray-900 hover:shadow-md'
            }`}
            title={isFullscreen ? '전체화면 해제' : '전체화면'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            {isFullscreen ? '전체화면 해제' : '전체화면'}
          </button>
        </div>
      </div>

      <ChartsView mainHeight={heights.main} volumeHeight={heights.volume} />
    </div>
  );
};

export default AnomalyChart;

