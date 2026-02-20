import { useMemo } from 'react';
import type { KpiLevels, MainboardModel } from './types';

export function useMainboardMock(): MainboardModel {
  return useMemo(() => {
    const now = new Date();

    const todayRuns = {
      total: 128,
      success: 122,
      fail: 6,
      retries: 14,
      avgDurationSec: 182,
      slaBreaches: 2,
    };

    const latest = {
      mart: new Date(now.getTime() - 18 * 60 * 1000),
      dwh: new Date(now.getTime() - 42 * 60 * 1000),
      l0: new Date(now.getTime() - 60 * 60 * 1000),
    };

    const latestPrimary = latest.mart ?? latest.dwh ?? latest.l0;
    const latestPrimaryLabel = latest.mart
      ? 'Mart(L2)'
      : latest.dwh
        ? 'DWH(L1)'
        : 'L0';

    const failuresTop = [
      {
        id: 'run-20260220-001',
        name: 'EMR Spark ETL - job_sales_agg',
        level: 'error' as const,
        startAt: new Date(now.getTime() - 95 * 60 * 1000),
        endAt: new Date(now.getTime() - 92 * 60 * 1000),
        reason: 'S3 접근 오류(403)',
      },
      {
        id: 'run-20260220-004',
        name: 'Redshift DWH(L1) - load_orders',
        level: 'error' as const,
        startAt: new Date(now.getTime() - 73 * 60 * 1000),
        endAt: new Date(now.getTime() - 72 * 60 * 1000),
        reason: 'COPY 실패: Invalid timestamp',
      },
      {
        id: 'run-20260220-009',
        name: 'Mart(L2) - mart_customer_daily',
        level: 'warn' as const,
        startAt: new Date(now.getTime() - 51 * 60 * 1000),
        endAt: new Date(now.getTime() - 45 * 60 * 1000),
        reason: '재시도 후 성공(지연)',
      },
      {
        id: 'run-20260220-012',
        name: 'Tableau Extract - refresh_sales',
        level: 'warn' as const,
        startAt: new Date(now.getTime() - 35 * 60 * 1000),
        endAt: new Date(now.getTime() - 30 * 60 * 1000),
        reason: '동시 실행 제한으로 대기',
      },
      {
        id: 'run-20260220-016',
        name: 'Iceberg L0 - snapshot_compact',
        level: 'warn' as const,
        startAt: new Date(now.getTime() - 28 * 60 * 1000),
        endAt: new Date(now.getTime() - 25 * 60 * 1000),
        reason: '스캔량 증가(파티션 편향)',
      },
    ];

    const delaysTop = [
      {
        id: 'sla-20260220-002',
        name: 'Mart(L2) - mart_sales_hourly',
        level: 'warn' as const,
        expectedMin: 12,
        actualMin: 29,
        reason: '소스 지연 + 재시도',
      },
      {
        id: 'sla-20260220-006',
        name: 'DWH(L1) - load_payments',
        level: 'warn' as const,
        expectedMin: 10,
        actualMin: 24,
        reason: 'WLM 큐 대기',
      },
      {
        id: 'sla-20260220-007',
        name: 'EMR Spark - job_sessionize',
        level: 'error' as const,
        expectedMin: 15,
        actualMin: 58,
        reason: 'executor 부족(스팟 회수)',
      },
      {
        id: 'sla-20260220-013',
        name: 'Tableau - refresh_finance',
        level: 'warn' as const,
        expectedMin: 8,
        actualMin: 19,
        reason: '추출 대상 증가',
      },
      {
        id: 'sla-20260220-015',
        name: 'Iceberg L0 - ingest_clickstream',
        level: 'warn' as const,
        expectedMin: 20,
        actualMin: 41,
        reason: '파일 수 급증(소형 파일)',
      },
    ];

    const freshness = [
      {
        table: 'mart_sales_hourly',
        lastLoadedAt: new Date(now.getTime() - 18 * 60 * 1000),
        delayMin: 6,
        rowCount: 1_245_120,
        level: 'warn' as const,
      },
      {
        table: 'mart_customer_daily',
        lastLoadedAt: new Date(now.getTime() - 26 * 60 * 1000),
        delayMin: 2,
        rowCount: 84_102,
        level: 'ok' as const,
      },
      {
        table: 'mart_inventory_daily',
        lastLoadedAt: new Date(now.getTime() - 63 * 60 * 1000),
        delayMin: 25,
        rowCount: 3_201_554,
        level: 'error' as const,
      },
      {
        table: 'mart_payments_hourly',
        lastLoadedAt: new Date(now.getTime() - 12 * 60 * 1000),
        delayMin: 0,
        rowCount: 512_882,
        level: 'ok' as const,
      },
      {
        table: 'mart_marketing_daily',
        lastLoadedAt: new Date(now.getTime() - 44 * 60 * 1000),
        delayMin: 14,
        rowCount: 91_270,
        level: 'warn' as const,
      },
      {
        table: 'mart_product_daily',
        lastLoadedAt: new Date(now.getTime() - 21 * 60 * 1000),
        delayMin: 3,
        rowCount: 18_744,
        level: 'ok' as const,
      },
      {
        table: 'mart_supplier_daily',
        lastLoadedAt: new Date(now.getTime() - 49 * 60 * 1000),
        delayMin: 17,
        rowCount: 2_113,
        level: 'warn' as const,
      },
    ];

    const executionTrend = Array.from({ length: 24 }).map((_, i) => {
      const hour = (now.getHours() - (23 - i) + 24) % 24;
      const label = `${String(hour).padStart(2, '0')}:00`;
      const base =
        hour >= 1 && hour <= 6 ? 2 : hour >= 9 && hour <= 18 ? 7 : 4;
      const success = base + (i % 3);
      const fail = i % 11 === 0 ? 2 : i % 7 === 0 ? 1 : 0;
      const retry = i % 5 === 0 ? 1 : 0;
      return { label, success, fail, retry };
    });

    const recentChanges = [
      {
        id: 'chg-20260220-001',
        at: new Date(now.getTime() - 4.2 * 60 * 60 * 1000),
        target: 'mart_sales_hourly',
        type: '스키마 변경',
        by: 'data-eng-01',
        summary: '컬럼 `discount_rate` 추가',
      },
      {
        id: 'chg-20260220-002',
        at: new Date(now.getTime() - 6.1 * 60 * 60 * 1000),
        target: 'EMR job_sessionize',
        type: '로직 변경',
        by: 'data-eng-02',
        summary: 'window 파라미터 튜닝',
      },
      {
        id: 'chg-20260220-003',
        at: new Date(now.getTime() - 9.7 * 60 * 60 * 1000),
        target: 'Redshift WLM',
        type: '설정 변경',
        by: 'ops-01',
        summary: 'ETL 큐 concurrency 조정',
      },
      {
        id: 'chg-20260220-004',
        at: new Date(now.getTime() - 11.3 * 60 * 60 * 1000),
        target: 'S3 Iceberg L0',
        type: '버전 변경',
        by: 'platform-01',
        summary: 'Iceberg catalog 패치 적용',
      },
      {
        id: 'chg-20260220-005',
        at: new Date(now.getTime() - 13.8 * 60 * 60 * 1000),
        target: 'Tableau Extract',
        type: '설정 변경',
        by: 'bi-01',
        summary: 'refresh schedule 변경(매시간)',
      },
    ];

    const impactTop = [
      {
        id: 'impact-001',
        name: 'mart_sales_hourly',
        dependents: 18,
        reports: 9,
        lastChangeAt: new Date(now.getTime() - 4.2 * 60 * 60 * 1000),
      },
      {
        id: 'impact-002',
        name: 'dwh_orders',
        dependents: 14,
        reports: 6,
        lastChangeAt: new Date(now.getTime() - 1.8 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'impact-003',
        name: 'mart_payments_hourly',
        dependents: 11,
        reports: 7,
        lastChangeAt: new Date(now.getTime() - 2.4 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'impact-004',
        name: 'l0_clickstream',
        dependents: 10,
        reports: 2,
        lastChangeAt: new Date(now.getTime() - 3.1 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'impact-005',
        name: 'mart_customer_daily',
        dependents: 9,
        reports: 5,
        lastChangeAt: new Date(now.getTime() - 1.2 * 24 * 60 * 60 * 1000),
      },
    ];

    const successRate = todayRuns.total ? todayRuns.success / todayRuns.total : 0;

    const minutesFromNow = (d: Date) => (now.getTime() - d.getTime()) / (60 * 1000);

    const kpiLevels: KpiLevels = {
      successRate:
        successRate >= 0.98
          ? ('ok' as const)
          : successRate >= 0.95
            ? ('warn' as const)
            : ('error' as const),
      failures:
        todayRuns.fail === 0
          ? ('ok' as const)
          : todayRuns.fail <= 3
            ? ('warn' as const)
            : ('error' as const),
      slaBreaches:
        todayRuns.slaBreaches === 0
          ? ('ok' as const)
          : todayRuns.slaBreaches <= 2
            ? ('warn' as const)
            : ('error' as const),
      latestData:
        minutesFromNow(latestPrimary) <= 20
          ? ('ok' as const)
          : minutesFromNow(latestPrimary) <= 45
            ? ('warn' as const)
            : ('error' as const),
      avgDuration:
        todayRuns.avgDurationSec <= 210
          ? ('ok' as const)
          : todayRuns.avgDurationSec <= 330
            ? ('warn' as const)
            : ('error' as const),
      retries:
        todayRuns.retries <= 10
          ? ('ok' as const)
          : todayRuns.retries <= 20
            ? ('warn' as const)
            : ('error' as const),
    };

    // 메인보드 "흐름 요약"이 스샷처럼 분기 구조로 보이도록 데모 데이터를 구성
    // (실데이터 연결 시 systemNodes/flows만 교체해도 UI는 그대로 유지)
    const systemNodes = [
      { id: 'mssql', name: 'MSSQL', level: 'ok' as const, x: 80, y: 120 },
      { id: 'emr', name: 'EMR Spark', level: 'warn' as const, x: 260, y: 120 },

      { id: 'l0_orders', name: 'S3 Iceberg L0 - orders', level: 'ok' as const, x: 450, y: 70 },
      {
        id: 'l0_click',
        name: 'S3 Iceberg L0 - clickstream',
        level: 'warn' as const,
        x: 450,
        y: 170,
      },
      { id: 'l0_catalog', name: 'S3 Iceberg L0 - catalog', level: 'ok' as const, x: 450, y: 270 },

      { id: 'dwh_orders', name: 'DWH(L1) - orders', level: 'warn' as const, x: 660, y: 70 },
      { id: 'dwh_behavior', name: 'DWH(L1) - behavior', level: 'error' as const, x: 660, y: 170 },
      { id: 'dwh_product', name: 'DWH(L1) - product', level: 'ok' as const, x: 660, y: 270 },

      { id: 'mart_sales', name: 'Mart(L2) - sales', level: 'ok' as const, x: 880, y: 90 },
      { id: 'mart_marketing', name: 'Mart(L2) - marketing', level: 'warn' as const, x: 880, y: 210 },

      { id: 'tableau_sales', name: 'Tableau - sales dashboards', level: 'ok' as const, x: 1080, y: 90 },
      {
        id: 'tableau_mkt',
        name: 'Tableau - marketing dashboards',
        level: 'warn' as const,
        x: 1080,
        y: 210,
      },
    ];

    const t = (m: number) => new Date(now.getTime() - m * 60 * 1000);

    const flows = [
      {
        id: 'edge-001',
        source: 'mssql',
        target: 'emr',
        lastLoadedAt: t(34),
        rowCount: 6_820_221,
        flowRunId: 'flow-20260220-001',
      },
      // 분기 1: orders
      {
        id: 'edge-010',
        source: 'emr',
        target: 'l0_orders',
        lastLoadedAt: t(29),
        rowCount: 2_950_110,
        flowRunId: 'flow-20260220-010',
      },
      {
        id: 'edge-011',
        source: 'l0_orders',
        target: 'dwh_orders',
        lastLoadedAt: t(25),
        rowCount: 2_910_554,
        flowRunId: 'flow-20260220-011',
      },
      {
        id: 'edge-012',
        source: 'dwh_orders',
        target: 'mart_sales',
        lastLoadedAt: t(20),
        rowCount: 1_345_120,
        flowRunId: 'flow-20260220-012',
      },
      {
        id: 'edge-013',
        source: 'mart_sales',
        target: 'tableau_sales',
        lastLoadedAt: t(13),
        rowCount: 612_882,
        flowRunId: 'flow-20260220-013',
      },

      // 분기 2: clickstream (이쪽을 warn/error로 보여서 병목 느낌)
      {
        id: 'edge-020',
        source: 'emr',
        target: 'l0_click',
        lastLoadedAt: t(31),
        rowCount: 3_120_000,
        flowRunId: 'flow-20260220-020',
      },
      {
        id: 'edge-021',
        source: 'l0_click',
        target: 'dwh_behavior',
        lastLoadedAt: t(27),
        rowCount: 3_090_000,
        flowRunId: 'flow-20260220-021',
      },
      {
        id: 'edge-022',
        source: 'dwh_behavior',
        target: 'mart_marketing',
        lastLoadedAt: t(22),
        rowCount: 1_120_000,
        flowRunId: 'flow-20260220-022',
      },
      {
        id: 'edge-023',
        source: 'mart_marketing',
        target: 'tableau_mkt',
        lastLoadedAt: t(16),
        rowCount: 402_000,
        flowRunId: 'flow-20260220-023',
      },

      // 분기 3: catalog → product → sales/marketing로 일부 합류(가벼운 merge 느낌)
      {
        id: 'edge-030',
        source: 'emr',
        target: 'l0_catalog',
        lastLoadedAt: t(33),
        rowCount: 750_000,
        flowRunId: 'flow-20260220-030',
      },
      {
        id: 'edge-031',
        source: 'l0_catalog',
        target: 'dwh_product',
        lastLoadedAt: t(26),
        rowCount: 742_000,
        flowRunId: 'flow-20260220-031',
      },
      {
        id: 'edge-032',
        source: 'dwh_product',
        target: 'mart_sales',
        lastLoadedAt: t(21),
        rowCount: 520_000,
        flowRunId: 'flow-20260220-032',
      },
      {
        id: 'edge-033',
        source: 'dwh_product',
        target: 'mart_marketing',
        lastLoadedAt: t(23),
        rowCount: 220_000,
        flowRunId: 'flow-20260220-033',
      },
    ];

    return {
      now,
      todayRuns,
      latestPrimary,
      latestPrimaryLabel,
      successRate,
      kpiLevels,
      systemNodes,
      flows,
      failuresTop,
      delaysTop,
      freshness,
      executionTrend,
      recentChanges,
      impactTop,
    } satisfies MainboardModel;
  }, []);
}

