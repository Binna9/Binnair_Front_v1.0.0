import {
  Percent,
  XCircle,
  Clock,
  CalendarClock,
  Timer,
  RefreshCw,
} from 'lucide-react';
import type { MainboardModel } from './types';
import { formatDateTimeKST, formatDurationSeconds } from './utils';
import { KpiCard } from './ui/KpiCard';

export function KpiRow({
  todayRuns,
  successRate,
  latestPrimary,
  latestPrimaryLabel,
  kpiLevels,
}: Pick<
  MainboardModel,
  | 'todayRuns'
  | 'successRate'
  | 'latestPrimary'
  | 'latestPrimaryLabel'
  | 'kpiLevels'
>) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <KpiCard
        icon={<Percent />}
        title="성공률(오늘)"
        value={`${Math.round(successRate * 1000) / 10}%`}
        subValue={`${todayRuns.success.toLocaleString()} / ${todayRuns.total.toLocaleString()}`}
        level={kpiLevels.successRate}
      />
      <KpiCard
        icon={<XCircle />}
        title="실패 건수(오늘)"
        value={todayRuns.fail.toLocaleString()}
        subValue="파이프라인/스텝 기준"
        level={kpiLevels.failures}
      />
      <KpiCard
        icon={<Clock />}
        title="지연 작업 수(SLA 위반)"
        value={todayRuns.slaBreaches.toLocaleString()}
        subValue="초과/임박 포함"
        level={kpiLevels.slaBreaches}
      />
      <KpiCard
        icon={<CalendarClock />}
        title="최신 데이터 시각"
        value={formatDateTimeKST(latestPrimary)}
        subValue={`${latestPrimaryLabel} 기준 (fallback 포함)`}
        level={kpiLevels.latestData}
      />
      <KpiCard
        icon={<Timer />}
        title="평균 실행 시간(오늘)"
        value={formatDurationSeconds(todayRuns.avgDurationSec)}
        subValue="최근 실행 평균"
        level={kpiLevels.avgDuration}
      />
      <KpiCard
        icon={<RefreshCw />}
        title="재시도 건수(오늘)"
        value={todayRuns.retries.toLocaleString()}
        subValue="재시도 합계"
        level={kpiLevels.retries}
      />
    </div>
  );
}

