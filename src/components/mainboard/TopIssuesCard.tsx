import type { DelayItem, FailureItem } from './types';
import { formatDateTimeKST } from './utils';
import { AlertTriangle, Clock } from 'lucide-react';
import { SectionHeader } from './ui/SectionHeader';
import { SmallButton } from './ui/SmallButton';
import { StatusPill } from './ui/StatusPill';

function FailureTopCard({
  failuresTop,
  onViewAll,
  onOpen,
}: {
  failuresTop: FailureItem[];
  onViewAll: () => void;
  onOpen: (runId: string) => void;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-md">
      <SectionHeader
        icon={<AlertTriangle />}
        title="실패 TOP 5"
        subtitle="운영자가 바로 들어가는 액션 영역"
        right={<SmallButton onClick={onViewAll}>전체 보기</SmallButton>}
      />
      <ul className="mt-3 space-y-2">
        {failuresTop.map((x) => (
          <li
            key={x.id}
            className="rounded-lg border border-slate-200 bg-slate-50 p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-slate-900">
                  {x.name}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {formatDateTimeKST(x.startAt)} ~ {formatDateTimeKST(x.endAt)}
                </div>
                <div className="mt-1 text-xs font-semibold text-slate-700">
                  원인: <span className="font-normal">{x.reason}</span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <StatusPill level={x.level} />
                <div className="mt-2">
                  <SmallButton onClick={() => onOpen(x.id)}>상세보기</SmallButton>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function DelayTopCard({
  delaysTop,
  onViewAll,
  onOpen,
}: {
  delaysTop: DelayItem[];
  onViewAll: () => void;
  onOpen: (slaId: string) => void;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-md">
      <SectionHeader
        icon={<Clock />}
        title="지연 TOP 5"
        subtitle="SLA 위반/임박 작업"
        right={<SmallButton onClick={onViewAll}>전체 보기</SmallButton>}
      />
      <ul className="mt-3 space-y-2">
        {delaysTop.map((x) => (
          <li
            key={x.id}
            className="rounded-lg border border-slate-200 bg-slate-50 p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-slate-900">
                  {x.name}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  예상 {x.expectedMin}m · 실제 {x.actualMin}m · 초과{' '}
                  <span className="font-semibold text-slate-700">
                    {Math.max(0, x.actualMin - x.expectedMin)}m
                  </span>
                </div>
                <div className="mt-1 text-xs font-semibold text-slate-700">
                  원인: <span className="font-normal">{x.reason}</span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <StatusPill level={x.level} />
                <div className="mt-2">
                  <SmallButton onClick={() => onOpen(x.id)}>상세보기</SmallButton>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function TopIssuesCard({
  failuresTop,
  delaysTop,
  onViewAllFailure,
  onViewAllSla,
  onOpenFailure,
  onOpenSla,
}: {
  failuresTop: FailureItem[];
  delaysTop: DelayItem[];
  onViewAllFailure: () => void;
  onViewAllSla: () => void;
  onOpenFailure: (runId: string) => void;
  onOpenSla: (slaId: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <FailureTopCard
        failuresTop={failuresTop}
        onViewAll={onViewAllFailure}
        onOpen={onOpenFailure}
      />
      <DelayTopCard
        delaysTop={delaysTop}
        onViewAll={onViewAllSla}
        onOpen={onOpenSla}
      />
    </div>
  );
}

