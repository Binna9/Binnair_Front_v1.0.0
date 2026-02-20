import { Clock, LayoutDashboard } from 'lucide-react';
import type { MainboardModel } from './types';
import { formatDateTimeKST } from './utils';

export function MainBoardHeader({ now }: Pick<MainboardModel, 'now'>) {
  return (
    <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-4 overflow-hidden rounded-xl border border-slate-200/90 bg-gradient-to-br from-slate-100 via-slate-50 to-white p-5 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.1),0_2px_6px_-2px_rgba(0,0,0,0.08),inset_0_1px_0_0_rgba(255,255,255,0.8)]">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-slate-300 via-slate-400 to-slate-300" />
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-slate-300 via-slate-400 to-slate-300" />
      <div className="flex items-end justify-start self-end">
        <div
          className="text-[10px] leading-relaxed text-slate-600 opacity-40"
          aria-hidden
        >
          <div>데이터스트림즈(주)</div>
          <div>Meta Data Oriented Service Architecture</div>
          <div>© 2025 DataStreams</div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-slate-200/80 bg-white/90 shadow-[0_1px_3px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,1)]">
          <LayoutDashboard className="size-6 text-slate-600" strokeWidth={1.75} />
        </div>
        <span className="bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent sm:text-3xl">
          Quality Data Info Board
        </span>
      </div>
      <div className="flex items-center justify-end gap-1.5 text-sm text-slate-500">
        <Clock className="size-4 shrink-0 text-slate-500" strokeWidth={1.75} />
        <span>
          기준 시각:{' '}
          <span className="font-semibold text-slate-700">{formatDateTimeKST(now)}</span>
        </span>
      </div>
    </div>
  );
}

