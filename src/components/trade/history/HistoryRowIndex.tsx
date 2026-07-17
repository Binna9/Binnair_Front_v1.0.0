import React from 'react';
import { HISTORY_PAGE_SIZE } from '@/hooks/trading/useHistoryPage';

interface HistoryRowIndexProps {
  page: number;
  index: number;
  /** 페이지 크기 (기본 HISTORY_PAGE_SIZE) */
  pageSize?: number;
}

/**
 * 목록 행 시퀀스 — 페이지 offset 반영.
 * 단순 1,2,3 대신 #01 형태의 타이포 뱃지.
 */
const HistoryRowIndex: React.FC<HistoryRowIndexProps> = ({
  page,
  index,
  pageSize = HISTORY_PAGE_SIZE,
}) => {
  const seq = (page - 1) * pageSize + index + 1;
  const label = String(seq).padStart(2, '0');

  return (
    <span
      className="inline-flex items-center justify-center min-w-[2.25rem] px-1.5 py-0.5 rounded border border-[#2b3139] bg-[#12161c] text-[11px] font-semibold tabular-nums tracking-wide text-[#b7bdc6]"
      title={`${seq}번째`}
    >
      <span className="text-[#f0b90b]/80 mr-0.5 text-[10px] font-bold">#</span>
      {label}
    </span>
  );
};

export default HistoryRowIndex;
