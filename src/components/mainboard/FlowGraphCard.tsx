import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { GitBranch } from 'lucide-react';
import { useMemo, useState } from 'react';

import type { FlowEdge, StatusLevel, SystemNode } from './types';
import { formatDateTimeKST, statusColor, statusLabel } from './utils';
import { SectionHeader } from './ui/SectionHeader';
import { SmallButton } from './ui/SmallButton';

export function FlowGraphCard({
  systemNodes,
  flows,
  onViewAll,
  onNodeClick,
  onEdgeClick,
}: {
  systemNodes: SystemNode[];
  flows: FlowEdge[];
  onViewAll: () => void;
  onNodeClick: (nodeId: string) => void;
  onEdgeClick: (flowRunId: string) => void;
}) {
  const [selection, setSelection] = useState<
    | null
    | { kind: 'node'; id: string; name: string; level: StatusLevel }
    | {
        kind: 'edge';
        flowRunId: string;
        sourceId: string;
        targetId: string;
        sourceName: string;
        targetName: string;
        lastLoadedAtText: string;
        rowCountText: string;
      }
  >(null);

  const option: EChartsOption = useMemo(() => {
    const safeLog10 = (v: number) => Math.log10(Math.max(1, v));
    const rowCounts = flows.map((f) => f.rowCount);
    const minLog = rowCounts.length ? Math.min(...rowCounts.map(safeLog10)) : 0;
    const maxLog = rowCounts.length ? Math.max(...rowCounts.map(safeLog10)) : 1;

    const widthFromRowCount = (rowCount: number) => {
      if (!Number.isFinite(rowCount) || rowCount <= 0) return 2;
      if (minLog === maxLog) return 4;
      const t = (safeLog10(rowCount) - minLog) / (maxLog - minLog); // 0~1
      return Math.round((2 + t * 5) * 10) / 10; // 2.0~7.0
    };

    const badgeText = (level: StatusLevel) =>
      level === 'ok' ? 'OK' : level === 'warn' ? 'WARN' : 'FAIL';
    const badgeKey = (level: StatusLevel) =>
      level === 'ok' ? 'okBadge' : level === 'warn' ? 'warnBadge' : 'errorBadge';

    const nodeById = new Map(systemNodes.map((n) => [n.id, n]));
    const xs = systemNodes.map((n) => n.x);
    const ys = systemNodes.map((n) => n.y);
    const minX = xs.length ? Math.min(...xs) : 0;
    const maxX = xs.length ? Math.max(...xs) : 1000;
    const minY = ys.length ? Math.min(...ys) : 0;
    const maxY = ys.length ? Math.max(...ys) : 300;
    const padXLeft = 80;
    const padXRight = 160;
    const padY = 70;

    const gradient = (from: string, to: string) => ({
      type: 'linear',
      x: 0,
      y: 0,
      x2: 1,
      y2: 0,
      colorStops: [
        { offset: 0, color: from },
        { offset: 1, color: to },
      ],
    });

    const inCount = new Map<string, number>();
    const outCount = new Map<string, number>();
    for (const f of flows) {
      inCount.set(f.target, (inCount.get(f.target) ?? 0) + 1);
      outCount.set(f.source, (outCount.get(f.source) ?? 0) + 1);
    }

    const nodeSeriesData = systemNodes.map((n) => ({
      id: n.id,
      name: n.id, // 클릭/식별용(표시 텍스트는 rawName)
      rawName: n.name,
      level: n.level,
      value: [n.x, n.y],
      in: inCount.get(n.id) ?? 0,
      out: outCount.get(n.id) ?? 0,
      symbol: 'circle',
      symbolSize: 16,
      itemStyle: {
        color: statusColor(n.level),
        borderColor: '#ffffff',
        borderWidth: 3,
        shadowColor: 'rgba(2, 6, 23, 0.12)',
        shadowBlur: 10,
        shadowOffsetY: 6,
      },
      label: {
        show: true,
        position: 'right',
        distance: 12,
        color: '#0f172a',
        fontWeight: 800,
        lineHeight: 16,
        formatter: (p: any) => {
          const rawName = p?.data?.rawName ?? p?.name ?? '-';
          const level = (p?.data?.level ?? 'ok') as StatusLevel;
          return `${rawName}\n{${badgeKey(level)}|${badgeText(level)}}`;
        },
        rich: {
          okBadge: {
            color: '#064e3b',
            fontSize: 10,
            fontWeight: 900,
            padding: [2, 6, 2, 6],
            backgroundColor: '#d1fae5',
            borderColor: '#6ee7b7',
            borderWidth: 1,
            borderRadius: 999,
          },
          warnBadge: {
            color: '#78350f',
            fontSize: 10,
            fontWeight: 900,
            padding: [2, 6, 2, 6],
            backgroundColor: '#ffedd5',
            borderColor: '#fdba74',
            borderWidth: 1,
            borderRadius: 999,
          },
          errorBadge: {
            color: '#7f1d1d',
            fontSize: 10,
            fontWeight: 900,
            padding: [2, 6, 2, 6],
            backgroundColor: '#ffe4e6',
            borderColor: '#fda4af',
            borderWidth: 1,
            borderRadius: 999,
          },
        },
      },
    }));

    const lineSeriesData = flows
      .map((e) => {
        const s = nodeById.get(e.source);
        const t = nodeById.get(e.target);
        if (!s || !t) return null;
        const from = statusColor(s.level);
        const to = statusColor(t.level);
        const width = widthFromRowCount(e.rowCount);

        return {
          flowRunId: e.flowRunId,
          sourceId: s.id,
          targetId: t.id,
          sourceName: s.name,
          targetName: t.name,
          lastLoadedAtText: `최근 ${formatDateTimeKST(e.lastLoadedAt)}`,
          rowCountText: `건수 ${e.rowCount.toLocaleString()}`,
          coords: [
            [s.x, s.y],
            [t.x, t.y],
          ],
          lineStyle: {
            width,
            opacity: 0.65,
            curveness: 0.35,
            color: gradient(from, to) as any,
          },
          emphasis: {
            lineStyle: {
              opacity: 0.95,
              width: Math.max(2, width + 1.5),
            },
          },
        };
      })
      .filter(Boolean);

    return {
      animation: true,
      animationDuration: 600,
      animationDurationUpdate: 600,
      animationEasingUpdate: 'cubicOut',
      labelLayout: { moveOverlap: 'shiftY' },
      grid: { left: 0, right: 100, top: 0, bottom: 0, containLabel: false },
      xAxis: {
        type: 'value',
        show: false,
        min: minX - padXLeft,
        max: maxX + padXRight,
      },
      yAxis: {
        type: 'value',
        show: false,
        min: minY - padY,
        max: maxY + padY,
      },
      dataZoom: [
        { type: 'inside', xAxisIndex: 0, filterMode: 'none' },
        { type: 'inside', yAxisIndex: 0, filterMode: 'none' },
      ],
      tooltip: {
        trigger: 'item',
        confine: true,
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        borderColor: 'rgba(148, 163, 184, 0.25)',
        textStyle: { color: '#e2e8f0' },
        formatter: (params: any) => {
          if (params?.seriesType === 'scatter') {
            const level = params?.data?.level as StatusLevel | undefined;
            return [
              `<div style="font-weight:700;margin-bottom:4px;">${params.data?.rawName ?? params.name}</div>`,
              `<div>상태: <b>${level ? statusLabel(level) : '-'}</b></div>`,
              `<div>연결: <b>IN ${params?.data?.in ?? 0}</b> · <b>OUT ${params?.data?.out ?? 0}</b></div>`,
              `<div style="opacity:0.9">클릭/호버: 아래 상세 패널 표시</div>`,
            ].join('');
          }
          if (params?.seriesType === 'lines') {
            const d = params?.data ?? {};
            return [
              `<div style="font-weight:700;margin-bottom:4px;">적재 요약</div>`,
              `<div>경로: <b>${d.sourceName ?? '-'} → ${d.targetName ?? '-'}</b></div>`,
              `<div>최근 적재: <b>${d.lastLoadedAtText ?? '-'}</b></div>`,
              `<div>적재 건수: <b>${d.rowCountText ?? '-'}</b></div>`,
              `<div style="opacity:0.9">클릭/호버: 아래 상세 패널 표시</div>`,
            ].join('');
          }
          return '';
        },
      },
      series: [
        {
          name: 'flows',
          type: 'lines',
          coordinateSystem: 'cartesian2d',
          z: 1,
          data: lineSeriesData as any,
          effect: {
            show: true,
            period: 3.2,
            trailLength: 0.28,
            symbol: 'circle',
            symbolSize: 6,
            color: 'rgba(15, 23, 42, 0.9)',
          },
          lineStyle: {
            opacity: 0.65,
            curveness: 0.35,
          },
        },
        {
          name: 'nodes',
          type: 'scatter',
          coordinateSystem: 'cartesian2d',
          z: 2,
          data: nodeSeriesData as any,
          emphasis: {
            itemStyle: { shadowBlur: 16, shadowOffsetY: 10 },
          },
        },
      ],
    } satisfies EChartsOption;
  }, [flows, systemNodes]);

  return (
    <section className="overflow-visible rounded-xl border border-slate-200 bg-white p-4 shadow-md">
      <SectionHeader
        icon={<GitBranch />}
        title="데이터 흐름 요약(현재 상태 지도)"
        subtitle="점(노드) + 흐르는 라인으로 경로/병목을 직관적으로"
        right={<SmallButton onClick={onViewAll}>전체 흐름 보기</SmallButton>}
      />
      <div className="mt-3 h-[340px] w-full overflow-visible">
        <ReactECharts
          option={option}
          style={{ height: '100%', width: '100%' }}
          notMerge
          lazyUpdate
          onEvents={{
            click: (params: any) => {
              if (params?.seriesType === 'scatter') {
                const id = String(params?.data?.id ?? params?.data?.name ?? params?.name);
                const rawName = String(params?.data?.rawName ?? params?.name ?? id);
                const level = (params?.data?.level ?? 'ok') as StatusLevel;
                setSelection({ kind: 'node', id, name: rawName, level });
                return;
              }
              if (params?.seriesType === 'lines') {
                const d = params?.data ?? {};
                const runId = String(d.flowRunId ?? d.id ?? '');
                if (!runId) return;
                setSelection({
                  kind: 'edge',
                  flowRunId: runId,
                  sourceId: String(d.sourceId ?? ''),
                  targetId: String(d.targetId ?? ''),
                  sourceName: String(d.sourceName ?? '-'),
                  targetName: String(d.targetName ?? '-'),
                  lastLoadedAtText: String(d.lastLoadedAtText ?? '-'),
                  rowCountText: String(d.rowCountText ?? '-'),
                });
              }
            },
            mouseover: (params: any) => {
              if (params?.seriesType === 'scatter') {
                const id = String(params?.data?.id ?? params?.data?.name ?? params?.name);
                const rawName = String(params?.data?.rawName ?? params?.name ?? id);
                const level = (params?.data?.level ?? 'ok') as StatusLevel;
                setSelection({ kind: 'node', id, name: rawName, level });
                return;
              }
              if (params?.seriesType === 'lines') {
                const d = params?.data ?? {};
                const runId = String(d.flowRunId ?? d.id ?? '');
                if (!runId) return;
                setSelection({
                  kind: 'edge',
                  flowRunId: runId,
                  sourceId: String(d.sourceId ?? ''),
                  targetId: String(d.targetId ?? ''),
                  sourceName: String(d.sourceName ?? '-'),
                  targetName: String(d.targetName ?? '-'),
                  lastLoadedAtText: String(d.lastLoadedAtText ?? '-'),
                  rowCountText: String(d.rowCountText ?? '-'),
                });
              }
            },
          }}
        />
      </div>

      <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
        {!selection ? (
          <div className="text-sm text-slate-600">
            점(노드) 또는 선(흐름)을 클릭하면 여기에서 상세가 표시됩니다.
          </div>
        ) : selection.kind === 'node' ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-extrabold text-slate-900">
                {selection.name}
              </div>
              <div className="mt-1 text-xs text-slate-600">
                상태: <span className="font-semibold">{statusLabel(selection.level)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <SmallButton onClick={() => setSelection(null)}>선택 해제</SmallButton>
              <SmallButton onClick={() => onNodeClick(selection.id)}>시스템 상세</SmallButton>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-extrabold text-slate-900">
                {selection.sourceName} → {selection.targetName}
              </div>
              <div className="mt-1 text-xs text-slate-600">
                {selection.lastLoadedAtText} · {selection.rowCountText}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <SmallButton onClick={() => setSelection(null)}>선택 해제</SmallButton>
              <SmallButton onClick={() => onEdgeClick(selection.flowRunId)}>
                실행 상세
              </SmallButton>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span className="font-semibold text-slate-700">노드 상태</span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block size-2 rounded-full bg-emerald-500" />
          정상
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block size-2 rounded-full bg-amber-500" />
          경고
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block size-2 rounded-full bg-rose-500" />
          장애
        </span>
        <span className="ml-auto hidden sm:inline">
          점/선 클릭 → 아래 상세 패널 · 버튼으로 상세 화면 이동
        </span>
      </div>
    </section>
  );
}

