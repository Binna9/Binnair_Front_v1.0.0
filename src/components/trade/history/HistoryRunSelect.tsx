import React from 'react';
import { HISTORY_RUN_ALL, useHistoryFilter } from '@/context/HistoryFilterContext';

function runOptionLabel(run: {
  run_id: string;
  model_version: string;
  status: string;
}): string {
  return `${run.run_id}  ·  ${run.model_version}  ·  ${run.status}`;
}

/** 이력 API용 run_id 선택 — 히스토리/트레이드 하단 공통 */
const HistoryRunSelect: React.FC<{ className?: string; compact?: boolean }> = ({
  className = '',
  compact = false,
}) => {
  const { runId, runs, setRunId, engineLoading } = useHistoryFilter();
  const value = runId ?? HISTORY_RUN_ALL;
  const selected = runs.find((r) => r.run_id === runId);

  return (
    <div
      className={`flex min-w-[20rem] w-full max-w-[28rem] flex-col gap-1.5 rounded-lg border border-[#2b3139] bg-[#11161b] px-3 py-2 ${className}`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5e6673]">
          {compact ? 'Run' : 'Run / 모델 세션'}
        </span>
        {selected ? (
          <span
            className={`text-[10px] font-medium ${
              selected.status === 'running'
                ? 'text-[#0ecb81]'
                : selected.status === 'paused'
                  ? 'text-[#f0b90b]'
                  : 'text-[#848e9c]'
            }`}
          >
            {selected.status}
          </span>
        ) : value === HISTORY_RUN_ALL ? (
          <span className="text-[10px] text-[#848e9c]">all</span>
        ) : null}
      </div>
      <select
        aria-label="run_id 선택"
        value={value}
        disabled={engineLoading && runs.length === 0}
        onChange={(e) => setRunId(e.target.value)}
        className="w-full min-h-[2.25rem] truncate rounded-md border border-[#3a4149] bg-[#0b0e11] px-2.5 py-1.5 text-sm text-[#eaecef] outline-none focus:border-[#848e9c] disabled:opacity-60"
      >
        <option value={HISTORY_RUN_ALL}>전체 run</option>
        {runs.map((r) => (
          <option key={r.run_id} value={r.run_id}>
            {runOptionLabel(r)}
          </option>
        ))}
        {runId && !runs.some((r) => r.run_id === runId) ? (
          <option value={runId}>{runId}</option>
        ) : null}
      </select>
      {selected ? (
        <div className="truncate text-[11px] leading-snug text-[#848e9c]" title={selected.model_version}>
          {selected.model_version}
          {selected.strategy_id ? ` · ${selected.strategy_id}` : ''}
        </div>
      ) : (
        <div className="text-[11px] leading-snug text-[#5e6673]">
          {engineLoading && runs.length === 0
            ? '세션 불러오는 중…'
            : '모든 run 이력 합쳐서 보기'}
        </div>
      )}
    </div>
  );
};

export default HistoryRunSelect;
