import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { useMemo } from 'react';

import type { ExecutionTrendPoint } from './types';
import { TrendingUp } from 'lucide-react';
import { SectionHeader } from './ui/SectionHeader';
import { SmallButton } from './ui/SmallButton';

export function ExecutionTrendCard({
  executionTrend,
  onViewDetail,
}: {
  executionTrend: ExecutionTrendPoint[];
  onViewDetail: () => void;
}) {
  const option: EChartsOption = useMemo(() => {
    const labels = executionTrend.map((x) => x.label);
    const success = executionTrend.map((x) => x.success);
    const fail = executionTrend.map((x) => x.fail);
    const retry = executionTrend.map((x) => x.retry);

    const gradient = (from: string, to: string) => ({
      type: 'linear' as const,
      x: 0,
      y: 0,
      x2: 0,
      y2: 1,
      colorStops: [
        { offset: 0, color: from },
        { offset: 1, color: to },
      ],
    });

    return {
      animation: true,
      animationDuration: 800,
      animationEasing: 'cubicOut',
      tooltip: {
        trigger: 'axis',
        confine: true,
        axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(15, 23, 42, 0.06)' } },
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        borderColor: 'rgba(148, 163, 184, 0.25)',
        textStyle: { color: '#e2e8f0', fontSize: 12 },
        padding: [10, 14],
        formatter: (params: any) => {
          const p = Array.isArray(params) ? params[0] : params;
          const label = p?.axisValue ?? '-';
          const items = Array.isArray(params)
            ? params.map((x: any) => ({ name: x.seriesName, value: x.value }))
            : [];
          const total = items.reduce((sum: number, i: any) => sum + (i?.value ?? 0), 0);
          const lines = [
            `<div style="font-weight:700;margin-bottom:6px;color:#f8fafc">${label}</div>`,
            ...items.map(
              (i: any) =>
                `<div style="display:flex;justify-content:space-between;gap:16px;margin-top:2px">
                  <span>${i.name}</span>
                  <span style="font-weight:600;margin-left:12px">${(i.value ?? 0).toLocaleString()}</span>
                </div>`
            ),
            `<div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(148,163,184,0.3);font-weight:700;color:#f8fafc">총 ${total.toLocaleString()}건</div>`,
          ];
          return lines.join('');
        },
      },
      legend: {
        top: 0,
        left: 0,
        itemGap: 16,
        itemWidth: 12,
        itemHeight: 12,
        itemStyle: { borderWidth: 0 },
        textStyle: { color: '#475569', fontWeight: 600, fontSize: 12 },
      },
      grid: { left: 8, right: 8, top: 42, bottom: 8, containLabel: true },
      xAxis: {
        type: 'category',
        data: labels,
        axisLabel: {
          color: '#94a3b8',
          interval: 3,
          fontSize: 11,
          fontWeight: 500,
        },
        axisLine: { lineStyle: { color: '#e2e8f0', width: 1 } },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: '#94a3b8',
          fontSize: 11,
          fontWeight: 500,
        },
        splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      series: [
        {
          name: '성공',
          type: 'bar',
          stack: 'runs',
          data: success,
          barMaxWidth: 28,
          itemStyle: {
            color: gradient('#34d399', '#059669'),
            borderRadius: [4, 4, 4, 4],
          },
          emphasis: {
            itemStyle: {
              color: gradient('#6ee7b7', '#10b981'),
              shadowBlur: 12,
              shadowColor: 'rgba(16, 185, 129, 0.35)',
            },
          },
        },
        {
          name: '실패',
          type: 'bar',
          stack: 'runs',
          data: fail,
          barMaxWidth: 28,
          itemStyle: {
            color: gradient('#f87171', '#dc2626'),
            borderRadius: [4, 4, 4, 4],
          },
          emphasis: {
            itemStyle: {
              color: gradient('#fca5a5', '#ef4444'),
              shadowBlur: 12,
              shadowColor: 'rgba(239, 68, 68, 0.35)',
            },
          },
        },
        {
          name: '재시도',
          type: 'bar',
          stack: 'runs',
          data: retry,
          barMaxWidth: 28,
          itemStyle: {
            color: gradient('#fbbf24', '#d97706'),
            borderRadius: [4, 4, 4, 4],
          },
          emphasis: {
            itemStyle: {
              color: gradient('#fcd34d', '#f59e0b'),
              shadowBlur: 12,
              shadowColor: 'rgba(245, 158, 11, 0.35)',
            },
          },
        },
      ],
    } satisfies EChartsOption;
  }, [executionTrend]);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-md">
      <SectionHeader
        icon={<TrendingUp />}
        title="실행 추이(최근 24h)"
        subtitle="시간대 반복 장애/재시도 패턴을 빠르게 확인"
        right={<SmallButton onClick={onViewDetail}>상세 보기</SmallButton>}
      />
      <div className="mt-3 h-[340px] w-full">
        <ReactECharts
          option={option}
          style={{ height: '100%', width: '100%' }}
          notMerge
          lazyUpdate
        />
      </div>
    </section>
  );
}

