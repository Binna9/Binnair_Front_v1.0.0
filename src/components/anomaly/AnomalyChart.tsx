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
  const chartsAreaRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chartWidth, setChartWidth] = useState<number>(0);
  const [layoutReady, setLayoutReady] = useState(false);
  const [viewportHeight, setViewportHeight] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerHeight : 900
  );

  type TimeRange = { left: number; right: number };
  const [viewRange, setViewRange] = useState<TimeRange | null>(null);
  const [dragRange, setDragRange] = useState<{ left: number | null; right: number | null }>({
    left: null,
    right: null,
  });
  const dragRangeRef = useRef(dragRange);
  useEffect(() => {
    dragRangeRef.current = dragRange;
  }, [dragRange]);

  // Legend 클릭으로 각 시리즈 표시/숨김 토글
  const [hiddenSeries, setHiddenSeries] = useState<Record<string, boolean>>({});
  const toggleSeries = useCallback((key: string) => {
    setHiddenSeries((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // 차트 클릭으로 “상세(툴팁) 고정”
  const [pinnedPoint, setPinnedPoint] = useState<AnomalySeriesChartPoint | null>(null);
  const didDragRef = useRef(false);

  // viewRange 변경(확대/해제/버튼/날짜) 시 차트가 “확” 바뀌는 느낌 완화: 짧은 페이드 전환
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return true;
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    return mq?.matches ?? false;
  }, []);

  const [rangeFadePhase, setRangeFadePhase] = useState<'idle' | 'out' | 'in'>('idle');
  const [rangeFadeSeq, setRangeFadeSeq] = useState(0);
  const nextViewRangeRef = useRef<TimeRange | null>(null);
  const fadeTimersRef = useRef<number[]>([]);

  const clearFadeTimers = useCallback(() => {
    fadeTimersRef.current.forEach((id) => window.clearTimeout(id));
    fadeTimersRef.current = [];
  }, []);

  const setViewRangeSmooth = useCallback(
    (next: TimeRange | null) => {
      nextViewRangeRef.current = next;

      if (prefersReducedMotion) {
        setViewRange(next);
        setRangeFadePhase('idle');
        return;
      }

      // 동일한 상태(out/in)에서 다시 눌러도 확실히 재시작되도록 seq 기반으로 트리거
      setRangeFadeSeq((s) => s + 1);
    },
    [prefersReducedMotion]
  );

  useEffect(() => {
    if (prefersReducedMotion) return;
    if (rangeFadeSeq === 0) return;

    clearFadeTimers();
    setRangeFadePhase('out');

    const outId = window.setTimeout(() => {
      setViewRange(nextViewRangeRef.current ?? null);
      setRangeFadePhase('in');

      const inId = window.setTimeout(() => {
        setRangeFadePhase('idle');
      }, 160);

      fadeTimersRef.current.push(inId);
    }, 120);

    fadeTimersRef.current.push(outId);

    return () => {
      clearFadeTimers();
    };
  }, [clearFadeTimers, prefersReducedMotion, rangeFadeSeq]);

  const applyViewRangeSmooth = useCallback(
    (next: TimeRange | null) => {
      setPinnedPoint(null);
      setDragRange({ left: null, right: null });
      setViewRangeSmooth(next);
    },
    [setViewRangeSmooth]
  );

  // 90d@5m면 포인트가 2~3만개까지 늘어 DOM 렌더링이 급격히 느려집니다.
  // 표시용으로만 다운샘플링해서 DOM 노드 수를 제한합니다(툴팁/렌더링 모두 이 표본을 사용).
  const MAX_RENDER_POINTS = 1500;

  const pointsInRange = useMemo(() => {
    if (!viewRange) return points;
    const left = Math.min(viewRange.left, viewRange.right);
    const right = Math.max(viewRange.left, viewRange.right);
    return points.filter((p) => p.t >= left && p.t <= right);
  }, [points, viewRange]);

  const datasetExtent = useMemo(() => {
    if (points.length === 0) return null;
    const tMin = points[0]?.t;
    const tMax = points[points.length - 1]?.t;
    if (!Number.isFinite(tMin) || !Number.isFinite(tMax)) return null;
    return { tMin, tMax };
  }, [points]);

  const formatDateInputValue = useCallback((t: number): string => {
    const d = new Date(t);
    const yyyy = String(d.getFullYear());
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const parseDateInputToRange = useCallback((fromYmd: string, toYmd: string) => {
    // 로컬 타임존 기준으로 하루 전체를 포함하도록 from=자정, to=해당일 23:59:59.999
    const fromParts = fromYmd.split('-').map((v) => Number(v));
    const toParts = toYmd.split('-').map((v) => Number(v));
    if (fromParts.length !== 3 || toParts.length !== 3) return null;

    const [fy, fm, fd] = fromParts;
    const [ty, tm, td] = toParts;
    if (!Number.isFinite(fy) || !Number.isFinite(fm) || !Number.isFinite(fd)) return null;
    if (!Number.isFinite(ty) || !Number.isFinite(tm) || !Number.isFinite(td)) return null;

    const from = new Date(fy, fm - 1, fd, 0, 0, 0, 0).getTime();
    const to = new Date(ty, tm - 1, td, 23, 59, 59, 999).getTime();
    if (!Number.isFinite(from) || !Number.isFinite(to)) return null;
    return { left: Math.min(from, to), right: Math.max(from, to) } satisfies TimeRange;
  }, []);

  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  // 데이터 범위가 정해지면 기본 날짜 입력값도 세팅(초기 1회 + 데이터 변경 시)
  useEffect(() => {
    if (!datasetExtent) {
      setDateFrom('');
      setDateTo('');
      return;
    }
    setDateFrom((prev) => prev || formatDateInputValue(datasetExtent.tMin));
    setDateTo((prev) => prev || formatDateInputValue(datasetExtent.tMax));
  }, [datasetExtent, formatDateInputValue]);

  // 드래그 확대/버튼/입력 등으로 viewRange가 바뀌면 날짜 input도 동기화
  useEffect(() => {
    if (!datasetExtent) return;
    const r = viewRange ?? { left: datasetExtent.tMin, right: datasetExtent.tMax };
    const left = Math.min(r.left, r.right);
    const right = Math.max(r.left, r.right);
    setDateFrom(formatDateInputValue(left));
    setDateTo(formatDateInputValue(right));
  }, [datasetExtent, formatDateInputValue, viewRange]);

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

  const findNearestDisplayPointByT = useCallback(
    (t: number): AnomalySeriesChartPoint | null => {
      if (displayPoints.length === 0) return null;
      // displayPoints는 오름차순 정렬되어 들어옵니다(buildSeriesDataset에서 정렬)
      let lo = 0;
      let hi = displayPoints.length - 1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        const mt = displayPoints[mid].t;
        if (mt === t) return displayPoints[mid];
        if (mt < t) lo = mid + 1;
        else hi = mid - 1;
      }
      // lo는 삽입 위치, 양옆 후보 중 가까운 값을 선택
      const leftIdx = Math.max(0, Math.min(displayPoints.length - 1, lo - 1));
      const rightIdx = Math.max(0, Math.min(displayPoints.length - 1, lo));
      const left = displayPoints[leftIdx];
      const right = displayPoints[rightIdx];
      return Math.abs(left.t - t) <= Math.abs(right.t - t) ? left : right;
    },
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

  useEffect(() => {
    const onResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
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

  // Recharts는 마운트 순간에 컨테이너가 “아직” 레이아웃이 안정화되지 않으면 width/height를 -1로 찍을 수 있습니다.
  // 폭이 확보된 뒤 1~2프레임 기다렸다가 차트를 마운트해서 경고를 없앱니다.
  useEffect(() => {
    if (chartWidth <= 0) {
      setLayoutReady(false);
      return;
    }

    let raf1 = 0;
    let raf2 = 0;
    raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        setLayoutReady(true);
      });
    });

    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
    };
  }, [chartWidth]);

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
      didDragRef.current = false;
      setDragRange({ left: t, right: t });
    },
    [getActiveTFromEvent]
  );

  const moveDragSelect = useCallback(
    (state: any) => {
      if (dragRange.left === null) return;
      const t = getActiveTFromEvent(state);
      if (t === null) return;
      if (t !== dragRange.left) didDragRef.current = true;
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

    didDragRef.current = true;
    const next: TimeRange = { left: Math.min(left, right), right: Math.max(left, right) };
    applyViewRangeSmooth(next);
  }, [applyViewRangeSmooth, dragRange.left, dragRange.right]);

  // 차트 클릭 시 해당 시점 “고정”, 빈 공간 클릭 시 해제
  const handleChartClick = useCallback((state: any) => {
    // 드래그로 확대 직후 발생하는 click은 무시(핀 고정 방지)
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }

    const t = getActiveTFromEvent(state);
    if (t === null) {
      setPinnedPoint(null);
      return;
    }

    // activePayload가 비어있는 경우가 있어(클릭 시점에 hover가 없을 때),
    // 시간값(activeLabel)을 기준으로 가장 가까운 포인트를 고정합니다.
    const nearest = findNearestDisplayPointByT(t);
    if (!nearest) {
      setPinnedPoint(null);
      return;
    }
    setPinnedPoint(nearest);
  }, [findNearestDisplayPointByT, getActiveTFromEvent]);

  // 차트 밖을 클릭하면 고정 해제
  useEffect(() => {
    if (!pinnedPoint) return;

    const onPointerDown = (e: PointerEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (el.contains(e.target as Node)) return;
      setPinnedPoint(null);
    };

    document.addEventListener('pointerdown', onPointerDown, { capture: true });
    return () => document.removeEventListener('pointerdown', onPointerDown, { capture: true } as any);
  }, [pinnedPoint]);

  const resetZoom = useCallback(() => {
    applyViewRangeSmooth(null);
  }, [applyViewRangeSmooth]);

  const applyViewRange = useCallback((next: TimeRange | null) => {
    applyViewRangeSmooth(next);
  }, [applyViewRangeSmooth]);

  const applyQuickRange = useCallback(
    (days: number | 'full') => {
      if (!datasetExtent) return;
      if (days === 'full') {
        applyViewRange(null);
        return;
      }

      const D = 24 * 60 * 60 * 1000;
      const right = datasetExtent.tMax;
      const left = Math.max(datasetExtent.tMin, right - days * D);
      applyViewRange({ left, right });
    },
    [applyViewRange, datasetExtent]
  );

  const onApplyDateInputs = useCallback(() => {
    if (!datasetExtent) return;
    if (!dateFrom || !dateTo) return;
    const parsed = parseDateInputToRange(dateFrom, dateTo);
    if (!parsed) return;

    const left = Math.max(datasetExtent.tMin, Math.min(parsed.left, parsed.right));
    const right = Math.min(datasetExtent.tMax, Math.max(parsed.left, parsed.right));
    if (left >= right) {
      // 같은 날만 선택한 경우도 확대가 되도록 최소 1ms라도 범위를 보장
      applyViewRange({ left, right: Math.min(datasetExtent.tMax, left + 1) });
      return;
    }

    applyViewRange({ left, right });
  }, [applyViewRange, datasetExtent, dateFrom, dateTo, parseDateInputToRange]);

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

  const pinnedVM = useMemo(() => (pinnedPoint ? buildTooltipVM(pinnedPoint) : null), [pinnedPoint]);

  const heights = useMemo(() => {
    // fullscreen: 브라우저 전체화면에서 공간을 최대 활용
    if (isFullscreen) {
      return {
        main: Math.max(360, viewportHeight - 340),
        volume: 220,
      } as const;
    }
    // 기본 화면
    return {
      main: 520,
      volume: 160,
    } as const;
  }, [isFullscreen, viewportHeight]);

  // plot area(실제 그려지는 영역)에서의 x좌표를 시간값으로 변환해 드래그 범위를 끝까지 업데이트
  const dragUpdateFromClientX = useCallback(
    (clientX: number) => {
      const leftT = dragRangeRef.current.left;
      if (leftT === null) return;
      if (!timeExtent) return;

      const el = chartsAreaRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (!Number.isFinite(rect.width) || rect.width <= 0) return;

      // ChartsView와 동일한 마진/축 폭을 기준으로 plot area 범위를 계산
      const MARGIN_LEFT = 12;
      const MARGIN_RIGHT = 90;
      const AXIS_LEFT_W = 60;
      const AXIS_RIGHT_W = 55;

      const plotLeftPx = MARGIN_LEFT + AXIS_LEFT_W;
      const plotRightPx = rect.width - MARGIN_RIGHT - AXIS_RIGHT_W;
      const plotW = Math.max(1, plotRightPx - plotLeftPx);

      const rawX = clientX - rect.left;
      const clampedX = Math.min(plotRightPx, Math.max(plotLeftPx, rawX));
      const ratio = (clampedX - plotLeftPx) / plotW;

      const t = timeExtent.tMin + ratio * (timeExtent.tMax - timeExtent.tMin);
      const nextT = Math.min(timeExtent.tMax, Math.max(timeExtent.tMin, t));

      setDragRange((prev) => {
        if (prev.left === null) return prev;
        // 움직임이 느릴 때 불필요한 렌더를 줄이기 위해 값이 같으면 업데이트하지 않음
        if (prev.right === nextT) return prev;
        return { ...prev, right: nextT };
      });
    },
    [timeExtent]
  );

  const commitDragRange = useCallback(() => {
    const left = dragRangeRef.current.left;
    const right = dragRangeRef.current.right;
    setDragRange({ left: null, right: null });

    if (left === null || right === null) return;
    if (left === right) return;

    didDragRef.current = true;
    const next: TimeRange = { left: Math.min(left, right), right: Math.max(left, right) };
    applyViewRangeSmooth(next);
  }, [applyViewRangeSmooth]);

  // 차트 영역을 벗어나도(축/여백/바깥) 드래그가 끝까지 이어지도록 전역 포인터 이벤트로 보정
  useEffect(() => {
    if (dragRange.left === null) return;

    const onPointerMove = (e: PointerEvent) => {
      dragUpdateFromClientX(e.clientX);
    };
    const onPointerUp = () => {
      commitDragRange();
    };

    window.addEventListener('pointermove', onPointerMove, { capture: true });
    window.addEventListener('pointerup', onPointerUp, { capture: true });
    window.addEventListener('pointercancel', onPointerUp, { capture: true });

    return () => {
      window.removeEventListener('pointermove', onPointerMove, { capture: true } as any);
      window.removeEventListener('pointerup', onPointerUp, { capture: true } as any);
      window.removeEventListener('pointercancel', onPointerUp, { capture: true } as any);
    };
  }, [commitDragRange, dragRange.left, dragUpdateFromClientX]);

  const ChartsView = useCallback(
    (props: { mainHeight: number; volumeHeight: number; denseLegend?: boolean }) => {
      const { mainHeight, volumeHeight } = props;

      // 두 차트의 X축 정렬을 위해 plot area(좌/우 마진)과 XAxis props를 동일하게 유지합니다.
      const commonMargin = { right: 90, left: 12 };
      const isDragging = dragRange.left !== null;
      const tooltipDisabled = isDragging || !!pinnedPoint;
      return (
        <div
          className="w-full h-full space-y-2 min-w-0 select-none"
          // 드래그 확대 중 브라우저 텍스트 선택(파란 하이라이트) 방지
          onMouseDownCapture={(e) => {
            if (e.button === 0) e.preventDefault();
          }}
          onDragStart={(e) => e.preventDefault()}
        >
          {/* 상단: 가격 + Score */}
          <div className="w-full min-w-0" style={{ height: mainHeight }}>
            <ComposedChart
              width={Math.max(1, chartWidth)}
              height={mainHeight}
              syncId="anomalySeries"
              syncMethod="value"
              data={chartData}
              margin={{ top: 16, right: commonMargin.right, left: commonMargin.left, bottom: 6 }}
              onMouseDown={startDragSelect}
              onMouseMove={moveDragSelect}
              onMouseUp={finishDragSelect}
              onClick={handleChartClick}
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

              {/* 드래그 중에는 tooltip 좌표가 0,0으로 튀는 경우가 있어 숨김 처리 */}
              <Tooltip
                content={tooltipContent as any}
                // Recharts Tooltip 기본 애니메이션(위치 이동) 때문에 “왼쪽에서 날아오는” 느낌이 날 수 있어 비활성화
                animationDuration={0}
                wrapperStyle={
                  tooltipDisabled
                    ? { display: 'none' }
                    : {
                        // wrapper 자체에 들어가는 transition/transform 애니메이션을 차단
                        transition: 'none',
                      }
                }
              />

              {/* 클릭 고정 상세 */}
              {pinnedPoint && pinnedVM ? (
                <foreignObject x={12} y={12} width={320} height={220}>
                  <div className="bg-white/95 border border-gray-200 rounded-xl p-3 shadow-lg">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs text-gray-500">
                          {new Date(pinnedVM.t).toLocaleString('ko-KR')}
                        </div>
                        <div className="mt-1 text-xs text-gray-700 tabular-nums">
                          <span className="mr-2">O {pinnedPoint.o.toFixed(2)}</span>
                          <span className="mr-2">H {pinnedPoint.h.toFixed(2)}</span>
                          <span className="mr-2">L {pinnedPoint.l.toFixed(2)}</span>
                          <span className="mr-2 font-semibold">C {pinnedPoint.c.toFixed(2)}</span>
                          <span>V {pinnedPoint.v.toLocaleString()}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="shrink-0 text-xs font-semibold text-gray-600 hover:text-gray-900"
                        onClick={() => setPinnedPoint(null)}
                        title="고정 해제"
                      >
                        닫기
                      </button>
                    </div>

                    <div className="mt-2 space-y-1">
                      {pinnedVM.rows
                        .filter((r) => visibleWindows[r.windowDays])
                        .map((r) => (
                          <div key={r.windowDays} className="text-xs flex items-center gap-2">
                            <span className="w-[36px] text-gray-600">{r.windowDays}d</span>
                            <span className="font-semibold text-gray-900 tabular-nums w-[56px]">
                              {r.score === null ? 'N/A' : r.score.toFixed(2)}
                            </span>
                            <span className="text-gray-700">
                              {r.driver ?? '-'}
                              {r.zLabel && r.zValue !== null ? (
                                <span className="ml-2 text-gray-600 tabular-nums">
                                  {r.zLabel}={r.zValue.toFixed(2)}
                                </span>
                              ) : null}
                            </span>
                          </div>
                        ))}
                    </div>

                    <div className="mt-2 text-[11px] text-gray-500">
                      차트 밖(또는 빈 공간)을 클릭하면 고정이 해제됩니다.
                    </div>
                  </div>
                </foreignObject>
              ) : null}

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
          </div>

          {/* 하단: 거래량 (상단과 같은 plot area 폭/시간축 설정) */}
          <div className="w-full min-w-0" style={{ height: volumeHeight }}>
            <BarChart
              width={Math.max(1, chartWidth)}
              height={volumeHeight}
              syncId="anomalySeries"
              syncMethod="value"
              data={chartData}
              margin={{ top: 0, right: commonMargin.right, left: commonMargin.left, bottom: 6 }}
              onMouseDown={startDragSelect}
              onMouseMove={moveDragSelect}
              onMouseUp={finishDragSelect}
              onClick={handleChartClick}
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
                <Tooltip
                  content={() => null}
                  // 상단과 동일하게 위치 이동 애니메이션 차단
                  animationDuration={0}
                  wrapperStyle={
                    tooltipDisabled
                      ? { display: 'none' }
                      : {
                          transition: 'none',
                        }
                  }
                />

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
          </div>

          {/* 클릭 가능한 설명(레전드): 여기서만 토글 */}
          <ToggleLegend />
        </div>
      );
    },
    [
      chartData,
      chartWidth,
      finalMarker?.t,
      dragRange.left,
      dragRange.right,
      handleChartClick,
      pinnedPoint,
      pinnedVM,
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
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
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

        {/* 빠른 범위 + 날짜 범위 설정 */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => applyQuickRange('full')}
              className="inline-flex items-center px-3 py-2 rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-800 shadow-sm transition-all hover:bg-gray-900 hover:text-white hover:border-gray-900 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:ring-offset-2 active:translate-y-[1px]"
              title="전체 기간"
              disabled={!datasetExtent}
            >
              Full
            </button>
            <button
              type="button"
              onClick={() => applyQuickRange(30)}
              className="inline-flex items-center px-3 py-2 rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-800 shadow-sm transition-all hover:bg-gray-900 hover:text-white hover:border-gray-900 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:ring-offset-2 active:translate-y-[1px]"
              title="최근 1개월"
              disabled={!datasetExtent}
            >
              1M
            </button>
            <button
              type="button"
              onClick={() => applyQuickRange(7)}
              className="inline-flex items-center px-3 py-2 rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-800 shadow-sm transition-all hover:bg-gray-900 hover:text-white hover:border-gray-900 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:ring-offset-2 active:translate-y-[1px]"
              title="최근 1주"
              disabled={!datasetExtent}
            >
              1W
            </button>
            <button
              type="button"
              onClick={() => applyQuickRange(1)}
              className="inline-flex items-center px-3 py-2 rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-800 shadow-sm transition-all hover:bg-gray-900 hover:text-white hover:border-gray-900 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:ring-offset-2 active:translate-y-[1px]"
              title="최근 1일"
              disabled={!datasetExtent}
            >
              1D
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
            <div className="text-xs font-semibold text-gray-600">날짜</div>
            <input
              type="date"
              value={dateFrom}
              min={datasetExtent ? formatDateInputValue(datasetExtent.tMin) : undefined}
              max={datasetExtent ? formatDateInputValue(datasetExtent.tMax) : undefined}
              onChange={(e) => setDateFrom(e.target.value)}
              onBlur={onApplyDateInputs}
              className="text-sm border border-gray-200 rounded-md px-2 py-1 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
              disabled={!datasetExtent}
            />
            <span className="text-xs text-gray-400">~</span>
            <input
              type="date"
              value={dateTo}
              min={datasetExtent ? formatDateInputValue(datasetExtent.tMin) : undefined}
              max={datasetExtent ? formatDateInputValue(datasetExtent.tMax) : undefined}
              onChange={(e) => setDateTo(e.target.value)}
              onBlur={onApplyDateInputs}
              className="text-sm border border-gray-200 rounded-md px-2 py-1 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
              disabled={!datasetExtent}
            />
            <button
              type="button"
              onClick={onApplyDateInputs}
              className="inline-flex items-center px-3 py-1.5 rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-800 transition-all hover:bg-gray-900 hover:text-white hover:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20 active:translate-y-[1px]"
              disabled={!datasetExtent || !dateFrom || !dateTo}
              title="날짜 적용"
            >
              적용
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {viewRange ? (
            <button
              type="button"
              onClick={resetZoom}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-800 shadow-sm transition-all hover:bg-gray-900 hover:text-white hover:border-gray-900 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:ring-offset-2 active:translate-y-[1px]"
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
            title={isFullscreen ? 'Full Off' : 'Full On'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            {isFullscreen ? 'Full Off' : 'Full On'}
          </button>
        </div>
      </div>

      {/*
        Recharts 경고(width/height -1) 방지:
        라우트 전환 직후 첫 프레임에 컨테이너 크기가 0/미측정일 수 있어
        실제 폭을 한 번이라도 측정한 뒤에만 차트를 마운트합니다.
      */}
      {chartWidth > 0 && layoutReady ? (
        <div
          ref={chartsAreaRef}
          className="w-full h-full"
          style={
            prefersReducedMotion
              ? undefined
              : {
                  opacity: rangeFadePhase === 'out' ? 0.18 : 1,
                  transition: 'opacity 160ms ease',
                }
          }
        >
          <ChartsView mainHeight={heights.main} volumeHeight={heights.volume} />
        </div>
      ) : (
        <div className="w-full space-y-2">
          <div
            className="w-full rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center text-sm text-gray-500"
            style={{ height: heights.main }}
          >
            차트 로딩 중...
          </div>
          <div
            className="w-full rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center text-xs text-gray-500"
            style={{ height: heights.volume }}
          >
            거래량 로딩 중...
          </div>
        </div>
      )}
    </div>
  );
};

export default AnomalyChart;

