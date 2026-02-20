import type { ReactNode } from 'react';
import type { StatusLevel } from '../types';
import { StatusPill } from './StatusPill';

export function KpiCard({
  title,
  value,
  subValue,
  level,
  icon,
}: {
  title: string;
  value: string;
  subValue?: string;
  level: StatusLevel;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-md">
      <div className="flex min-w-0 items-start gap-2">
        {icon ? (
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 [&>svg]:size-4">
            {icon}
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-slate-500">{title}</div>
          <div className="mt-1">
            <StatusPill level={level} />
          </div>
          <div className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
            {value}
          </div>
          {subValue ? (
            <div className="mt-1 text-xs text-slate-500">{subValue}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

