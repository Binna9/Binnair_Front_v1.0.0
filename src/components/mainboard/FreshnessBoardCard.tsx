import { Database } from 'lucide-react';
import type { FreshnessItem } from './types';
import { formatDateTimeKST } from './utils';
import { SectionHeader } from './ui/SectionHeader';
import { SmallButton } from './ui/SmallButton';
import { StatusPill } from './ui/StatusPill';

export function FreshnessBoardCard({
  freshness,
  onViewAll,
  onOpenTable,
}: {
  freshness: FreshnessItem[];
  onViewAll: () => void;
  onOpenTable: (tableName: string) => void;
}) {
  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-md">
      <SectionHeader
        icon={<Database />}
        title="데이터 최신성 보드(핵심 Mart)"
        subtitle="테이블 전체 나열 대신 핵심 5~10개만"
        right={<SmallButton onClick={onViewAll}>전체 보기</SmallButton>}
      />

      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr className="text-left text-xs font-extrabold text-slate-600">
              <th className="whitespace-nowrap border-b border-slate-200 bg-white py-2 pr-4">
                테이블명
              </th>
              <th className="whitespace-nowrap border-b border-slate-200 bg-white py-2 pr-4">
                마지막 적재시각
              </th>
              <th className="whitespace-nowrap border-b border-slate-200 bg-white py-2 pr-4">
                지연(분)
              </th>
              <th className="whitespace-nowrap border-b border-slate-200 bg-white py-2 pr-4">
                마지막 row count
              </th>
              <th className="whitespace-nowrap border-b border-slate-200 bg-white py-2 pr-4">
                상태
              </th>
              <th className="whitespace-nowrap border-b border-slate-200 bg-white py-2">
                액션
              </th>
            </tr>
          </thead>
          <tbody className="text-sm text-slate-900">
            {freshness.map((x) => (
              <tr key={x.table} className="hover:bg-slate-50">
                <td className="whitespace-nowrap border-b border-slate-100 py-3 pr-4 font-semibold">
                  {x.table}
                </td>
                <td className="whitespace-nowrap border-b border-slate-100 py-3 pr-4 text-slate-700">
                  {formatDateTimeKST(x.lastLoadedAt)}
                </td>
                <td className="whitespace-nowrap border-b border-slate-100 py-3 pr-4">
                  <span
                    className={`font-semibold ${
                      x.delayMin === 0
                        ? 'text-emerald-700'
                        : x.delayMin <= 10
                          ? 'text-amber-700'
                          : 'text-rose-700'
                    }`}
                  >
                    {x.delayMin.toLocaleString()}
                  </span>
                </td>
                <td className="whitespace-nowrap border-b border-slate-100 py-3 pr-4 text-slate-700">
                  {x.rowCount.toLocaleString()}
                </td>
                <td className="whitespace-nowrap border-b border-slate-100 py-3 pr-4">
                  <StatusPill level={x.level} />
                </td>
                <td className="whitespace-nowrap border-b border-slate-100 py-3">
                  <SmallButton onClick={() => onOpenTable(x.table)}>
                    상세보기
                  </SmallButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

