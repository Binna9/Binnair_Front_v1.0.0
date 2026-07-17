import React from 'react';
import { useEngineRun } from '@/hooks/trading/useEngineRun';
import { EngineRunStatus } from '@/types/TradingEngineRunTypes';

const STATUS_DOT: Record<EngineRunStatus, string> = {
  running: 'bg-[#0ecb81]',
  stopped: 'bg-[#848e9c]',
  error: 'bg-[#f6465d]',
};

const STATUS_LABEL: Record<EngineRunStatus, string> = {
  running: '실행 중',
  stopped: '중지됨',
  error: '오류',
};

function formatElapsed(startedAt: string): string {
  const ms = Date.now() - new Date(startedAt).getTime();
  if (ms < 0) return '방금 시작';
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}일 ${hours}시간째`;
  if (hours > 0) return `${hours}시간 ${minutes}분째`;
  return `${minutes}분째`;
}

/** 최근 엔진 실행 세션 상태 — run_id/전략/모델 버전/가동 시간을 한 줄로 표시 */
const EngineStatusBar: React.FC = () => {
  const { run, loading } = useEngineRun();

  if (loading && !run) {
    return (
      <div className="flex-shrink-0 px-4 py-2.5 text-sm text-[#848e9c] border-b border-[#2b3139]">
        엔진 상태 불러오는 중...
      </div>
    );
  }

  if (!run) {
    return (
      <div className="flex-shrink-0 px-4 py-2.5 text-sm text-[#848e9c] border-b border-[#2b3139]">
        실행 이력이 없습니다
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 flex items-center gap-4 px-4 py-2.5 text-sm border-b border-[#2b3139] overflow-x-auto custom-scroll">
      <span className="flex items-center gap-2 font-semibold text-[#eaecef] whitespace-nowrap">
        <span className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT[run.status]}`} />
        {STATUS_LABEL[run.status]}
      </span>
      <span className="text-[#b7bdc6] whitespace-nowrap">run: {run.run_id}</span>
      <span className="text-[#b7bdc6] whitespace-nowrap">전략: {run.strategy_id}</span>
      <span className="text-[#b7bdc6] whitespace-nowrap">모델: {run.model_version}</span>
      {run.paper_mode && (
        <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#f0b90b33] text-[#f0b90b] whitespace-nowrap">
          모의거래
        </span>
      )}
      {run.status === 'running' && (
        <span className="text-[#b7bdc6] whitespace-nowrap ml-auto">
          {formatElapsed(run.started_at)} 실행 중
        </span>
      )}
    </div>
  );
};

export default EngineStatusBar;
