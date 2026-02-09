import {
  ANOMALY_WINDOW_DAYS,
  DEFAULT_ANOMALY_SCORE_BANDS,
  type AnomalyDriverKey,
  type AnomalyFinalCardVM,
  type AnomalyFinalComponentRowVM,
  type AnomalyFinalMarkerVM,
  type AnomalyScoreBands,
  type AnomalyScoreFinalResponse,
  type AnomalyScoreSeriesResponse,
  type AnomalyScoreZ,
  type AnomalySeriesChartPoint,
  type AnomalySeriesDataset,
  type AnomalyTooltipVM,
  type AnomalyTooltipWindowRow,
  type AnomalyWindowDays,
  type AnomalyZLabel,
} from '@/types/AnomalyTypes';

function isValidEpochMs(t: number): boolean {
  return Number.isFinite(t) && !Number.isNaN(t);
}

export function normalizeWindowDays(key: string | number): AnomalyWindowDays | null {
  const n = typeof key === 'number' ? key : Number(key);
  if (n === 30 || n === 60 || n === 90) return n;
  return null;
}

export function normalizeDriverKey(driver: string | null | undefined): AnomalyDriverKey | null {
  if (!driver) return null;
  const d = driver.trim().toLowerCase();
  if (d === 'ret' || d === 'vol' || d === 'rng') return d;
  return null;
}

export function pickZByDriver(
  z: AnomalyScoreZ | null | undefined,
  driver: AnomalyDriverKey | null
): { zLabel: AnomalyZLabel | null; zValue: number | null } {
  if (!z || !driver) return { zLabel: null, zValue: null };
  if (driver === 'ret') return { zLabel: 'zRet', zValue: z.ret ?? null };
  if (driver === 'vol') return { zLabel: 'zVol', zValue: z.vol ?? null };
  return { zLabel: 'zRng', zValue: z.rng ?? null };
}

export function buildSeriesDataset(
  response: AnomalyScoreSeriesResponse,
  options?: { scoreBands?: AnomalyScoreBands }
): AnomalySeriesDataset {
  const scoreBands = options?.scoreBands ?? DEFAULT_ANOMALY_SCORE_BANDS;

  const points: AnomalySeriesChartPoint[] = (response.points ?? [])
    .map((p): AnomalySeriesChartPoint | null => {
      const t = Date.parse(p.ts);
      if (!isValidEpochMs(t)) return null;

      const scores: AnomalySeriesChartPoint['scores'] = {};
      const drivers: AnomalySeriesChartPoint['drivers'] = {};
      const z: AnomalySeriesChartPoint['z'] = {};

      if (p.scores) {
        for (const [k, v] of Object.entries(p.scores)) {
          const wd = normalizeWindowDays(k);
          if (wd) scores[wd] = v ?? null;
        }
      }

      if (p.drivers) {
        for (const [k, v] of Object.entries(p.drivers)) {
          const wd = normalizeWindowDays(k);
          if (wd) drivers[wd] = normalizeDriverKey(v ?? null);
        }
      }

      if (p.z) {
        for (const [k, v] of Object.entries(p.z)) {
          const wd = normalizeWindowDays(k);
          if (wd) z[wd] = v ?? null;
        }
      }

      return {
        ts: p.ts,
        t,
        o: p.o,
        h: p.h,
        l: p.l,
        c: p.c,
        v: p.v,
        scores,
        drivers,
        z,
      };
    })
    .filter((x): x is AnomalySeriesChartPoint => x !== null)
    .sort((a, b) => a.t - b.t); // 오름차순 정렬 보장

  const extent =
    points.length > 0 ? { tMin: points[0].t, tMax: points[points.length - 1].t } : null;

  const candles = points.map((p) => ({ t: p.t, o: p.o, h: p.h, l: p.l, c: p.c }));
  const volumes = points.map((p) => ({ t: p.t, v: p.v }));

  const scoreLines = {
    30: points.map((p) => ({ t: p.t, y: p.scores[30] ?? null })),
    60: points.map((p) => ({ t: p.t, y: p.scores[60] ?? null })),
    90: points.map((p) => ({ t: p.t, y: p.scores[90] ?? null })),
  } satisfies Record<AnomalyWindowDays, { t: number; y: number | null }[]>;

  const defaultVisibleWindows = { 30: false, 60: false, 90: true } as const;

  return {
    meta: response.meta,
    summary: response.summary,
    points,
    candles,
    volumes,
    scoreLines,
    scoreBands,
    defaultVisibleWindows: { ...defaultVisibleWindows },
    extent,
  };
}

export function buildTooltipVM(point: AnomalySeriesChartPoint): AnomalyTooltipVM {
  const rows: AnomalyTooltipWindowRow[] = ANOMALY_WINDOW_DAYS.map((wd) => {
    const score = point.scores[wd] ?? null;
    const driver = point.drivers[wd] ?? null;
    const z = point.z[wd] ?? null;
    const { zLabel, zValue } = pickZByDriver(z, driver);
    return { windowDays: wd, score, driver, zLabel, zValue };
  });

  return { ts: point.ts, t: point.t, rows };
}

function buildFinalRows(components: AnomalyScoreFinalResponse['components']): AnomalyFinalComponentRowVM[] {
  const map = new Map<AnomalyWindowDays, AnomalyFinalComponentRowVM>();

  for (const c of components ?? []) {
    const wd = normalizeWindowDays(c.windowDays);
    if (!wd) continue;

    const driver = normalizeDriverKey(c.driver ?? null);

    map.set(wd, {
      windowDays: wd,
      score: c.score ?? null,
      driver,
      zRet: c.zRet ?? null,
      zVol: c.zVol ?? null,
      zRng: c.zRng ?? null,
    });
  }

  // 30/60/90 순서로 고정
  return ANOMALY_WINDOW_DAYS.map(
    (wd) =>
      map.get(wd) ?? {
        windowDays: wd,
        score: null,
        driver: null,
        zRet: null,
        zVol: null,
        zRng: null,
      }
  );
}

export function buildFinalCardVM(finalResponse: AnomalyScoreFinalResponse): AnomalyFinalCardVM {
  const ts = finalResponse.ts ?? null;
  const t = ts ? Date.parse(ts) : null;

  return {
    ts,
    t: t !== null && isValidEpochMs(t) ? t : null,
    mode: finalResponse.mode,
    finalScore: finalResponse.finalScore ?? null,
    finalLevel: finalResponse.finalLevel ?? null,
    basis: finalResponse.basis ?? null,
    rows: buildFinalRows(finalResponse.components),
  };
}

export function buildFinalMarkerVM(
  finalResponse: AnomalyScoreFinalResponse,
  series: AnomalySeriesDataset
): AnomalyFinalMarkerVM | null {
  if (!finalResponse.ts) return null;
  const t = Date.parse(finalResponse.ts);
  if (!isValidEpochMs(t)) return null;
  if (!series.extent) return null;

  const inRange = t >= series.extent.tMin && t <= series.extent.tMax;
  if (!inRange) return null; // 요구사항: 범위 밖이면 마커는 안 그림(권장)

  return { ts: finalResponse.ts, t, inRange };
}

