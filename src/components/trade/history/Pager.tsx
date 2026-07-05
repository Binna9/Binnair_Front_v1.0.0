import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PagerProps {
  page: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}

const Pager: React.FC<PagerProps> = ({ page, hasPrev, hasNext, onPrev, onNext }) => (
  <div className="flex-shrink-0 flex items-center justify-end gap-1 px-3 py-1.5 border-t border-[#2b3139] text-xs">
    <button
      type="button"
      onClick={onPrev}
      disabled={!hasPrev}
      className="flex items-center gap-0.5 px-2 py-1 rounded text-[#848e9c] hover:enabled:bg-[#2b3139] hover:enabled:text-[#eaecef] disabled:opacity-30"
    >
      <ChevronLeft size={14} />
      이전
    </button>
    <span className="px-2 text-[#eaecef]">{page} 페이지</span>
    <button
      type="button"
      onClick={onNext}
      disabled={!hasNext}
      className="flex items-center gap-0.5 px-2 py-1 rounded text-[#848e9c] hover:enabled:bg-[#2b3139] hover:enabled:text-[#eaecef] disabled:opacity-30"
    >
      다음
      <ChevronRight size={14} />
    </button>
  </div>
);

export default Pager;
