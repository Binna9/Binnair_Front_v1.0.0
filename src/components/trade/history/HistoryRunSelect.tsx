import React from 'react';
import { HISTORY_RUN_ALL, useHistoryFilter } from '@/context/HistoryFilterContext';

const selectClass =
  'max-w-[min(100%,280px)] bg-[#1e2329] border border-[#2b3139] rounded-md px-2.5 py-1.5 text-sm text-[#eaecef] outline-none focus:border-[#848e9c]';

function runOptionLabel(run: {
  run_id: string;
  model_version: string;
  status: string;
}): string {
  return `${run.run_id} · ${run.model_version} (${run.status})`;
}

/** 이력 API용 run_id 선택 — 히스토리/트레이드 하단 공통 */
const HistoryRunSelect: React.FC<{ className?: string; compact?: boolean }> = ({
  className = '',
  compact = false,
}) => {
  const { runId, runs, setRunId, engineLoading } = useHistoryFilter();
  const value = runId ?? HISTORY_RUN_ALL;

  return (
    <label className={`inline-flex items-center gap-1.5 text-[#848e9c] ${className}`}>
      {!compact && <span className="text-xs whitespace-nowrap">run</span>}
      <select
        aria-label="run_id 선택"
        value={value}
        disabled={engineLoading && runs.length === 0}
        onChange={(e) => setRunId(e.target.value)}
        className={selectClass}
      >
        <option value={HISTORY_RUN_ALL}>전체 run</option>
        {runs.map((r) => (
          <option key={r.run_id} value={r.run_id}>
            {runOptionLabel(r)}
          </option>
        ))}
        {/* 목록에 아직 없는 선택값 유지 */}
        {runId && !runs.some((r) => r.run_id === runId) ? (
          <option value={runId}>{runId}</option>
        ) : null}
      </select>
    </label>
  );
};

export default HistoryRunSelect;
