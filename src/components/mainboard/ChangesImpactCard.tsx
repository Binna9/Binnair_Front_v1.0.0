import { History, BarChart2 } from 'lucide-react';
import type { ChangeItem, ImpactItem } from './types';
import { formatDateTimeKST } from './utils';
import { SectionHeader } from './ui/SectionHeader';
import { SmallButton } from './ui/SmallButton';

function RecentChangesCard({
  recentChanges,
  onViewAll,
  onOpen,
}: {
  recentChanges: ChangeItem[];
  onViewAll: () => void;
  onOpen: (changeId: string) => void;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-md">
      <SectionHeader
        icon={<History />}
        title="최근 변경 이력"
        subtitle="장애의 80%는 변경 직후 발생"
        right={<SmallButton onClick={onViewAll}>전체 보기</SmallButton>}
      />
      <ul className="mt-3 space-y-2">
        {recentChanges.map((x) => (
          <li
            key={x.id}
            className="rounded-lg border border-slate-200 bg-slate-50 p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-500">
                  {x.type} · {x.by}
                </div>
                <div className="mt-1 truncate text-sm font-extrabold text-slate-900">
                  {x.target}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {formatDateTimeKST(x.at)}
                </div>
                <div className="mt-1 text-xs text-slate-700">{x.summary}</div>
              </div>
              <div className="shrink-0">
                <SmallButton onClick={() => onOpen(x.id)}>상세보기</SmallButton>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ImpactTopCard({
  impactTop,
  onViewAll,
  onOpen,
}: {
  impactTop: ImpactItem[];
  onViewAll: () => void;
  onOpen: (tableName: string) => void;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-md">
      <SectionHeader
        icon={<BarChart2 />}
        title="영향도 Top 5"
        subtitle="하위 의존/리포트 기준"
        right={<SmallButton onClick={onViewAll}>전체 보기</SmallButton>}
      />
      <ul className="mt-3 space-y-2">
        {impactTop.map((x) => (
          <li
            key={x.id}
            className="rounded-lg border border-slate-200 bg-slate-50 p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-extrabold text-slate-900">
                  {x.name}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  의존 {x.dependents} · 리포트 {x.reports} · 최근 변경{' '}
                  {formatDateTimeKST(x.lastChangeAt)}
                </div>
              </div>
              <div className="shrink-0">
                <SmallButton onClick={() => onOpen(x.name)}>분석</SmallButton>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ChangesImpactCard({
  recentChanges,
  impactTop,
  onViewAllChanges,
  onViewAllImpact,
  onOpenChange,
  onOpenImpact,
}: {
  recentChanges: ChangeItem[];
  impactTop: ImpactItem[];
  onViewAllChanges: () => void;
  onViewAllImpact: () => void;
  onOpenChange: (changeId: string) => void;
  onOpenImpact: (tableName: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <RecentChangesCard
        recentChanges={recentChanges}
        onViewAll={onViewAllChanges}
        onOpen={onOpenChange}
      />
      <ImpactTopCard
        impactTop={impactTop}
        onViewAll={onViewAllImpact}
        onOpen={onOpenImpact}
      />
    </div>
  );
}

