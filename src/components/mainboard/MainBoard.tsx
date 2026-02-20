import type { MainboardModel } from './types';
import { ChangesImpactCard } from './ChangesImpactCard';
import { ExecutionTrendCard } from './ExecutionTrendCard';
import { FlowGraphCard } from './FlowGraphCard';
import { FreshnessBoardCard } from './FreshnessBoardCard';
import { KpiRow } from './KpiRow';
import { MainBoardHeader } from './MainBoardHeader';
import { TopIssuesCard } from './TopIssuesCard';

export type GoDashboard = (params?: Record<string, string>) => void;

export default function MainBoard({
  model,
  goDashboard,
}: {
  model: MainboardModel;
  goDashboard: GoDashboard;
}) {
  return (
    <div>
      <MainBoardHeader now={model.now} />

      {/* 1행: KPI 카드 6개 */}
      <KpiRow
        todayRuns={model.todayRuns}
        successRate={model.successRate}
        latestPrimary={model.latestPrimary}
        latestPrimaryLabel={model.latestPrimaryLabel}
        kpiLevels={model.kpiLevels}
      />

      {/* 2행: 데이터 흐름 요약 (전체 가로) */}
      <div className="mt-6">
        <FlowGraphCard
          systemNodes={model.systemNodes}
          flows={model.flows}
          onViewAll={() => goDashboard()}
          onNodeClick={(nodeId) => goDashboard({ focus: nodeId })}
          onEdgeClick={(flowRunId) => goDashboard({ run: flowRunId })}
        />
      </div>

      {/* 3행: 실패 TOP 5 | 지연 TOP 5 (가로 2열) */}
      <div className="mt-6">
        <TopIssuesCard
          failuresTop={model.failuresTop}
          delaysTop={model.delaysTop}
          onViewAllFailure={() => goDashboard({ tab: 'failure' })}
          onViewAllSla={() => goDashboard({ tab: 'sla' })}
          onOpenFailure={(runId) => goDashboard({ run: runId })}
          onOpenSla={(slaId) => goDashboard({ sla: slaId })}
        />
      </div>

      {/* 4행: 실행 추이 (전체 가로) */}
      <div className="mt-6">
        <ExecutionTrendCard
          executionTrend={model.executionTrend}
          onViewDetail={() => goDashboard({ tab: 'trend' })}
        />
      </div>

      {/* 5행: 최근 변경 이력 | 영향도 Top 5 (가로 2열) */}
      <div className="mt-6">
        <ChangesImpactCard
          recentChanges={model.recentChanges}
          impactTop={model.impactTop}
          onViewAllChanges={() => goDashboard({ tab: 'changes' })}
          onViewAllImpact={() => goDashboard({ tab: 'impact' })}
          onOpenChange={(changeId) => goDashboard({ change: changeId })}
          onOpenImpact={(tableName) => goDashboard({ table: tableName })}
        />
      </div>

      {/* 6행: 데이터 최신성 테이블(핵심 Mart) */}
      <FreshnessBoardCard
        freshness={model.freshness}
        onViewAll={() => goDashboard({ tab: 'freshness' })}
        onOpenTable={(tableName) => goDashboard({ table: tableName })}
      />
    </div>
  );
}

