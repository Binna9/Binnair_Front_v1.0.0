/** predictor_type 전환 시 run/model/경로 일괄 프리셋 (운영 Docker 경로 기준) */

export type PredictorType = 'timesfm' | 'fincast';

export type PredictorPreset = {
  run_id: string;
  strategy_id: string;
  model_version: string;
  feature_set_version: string;
  /** FinCast만 — TimesFM 전환 시에는 건드리지 않음 */
  fincast_checkpoint_path?: string;
  fincast_repo_path?: string;
  fincast_backend?: string;
};

export const PREDICTOR_PRESETS: Record<PredictorType, PredictorPreset> = {
  timesfm: {
    run_id: 'prod_timesfm_run',
    strategy_id: 'timesfm_passthrough',
    model_version: 'timesfm-2.5-200m',
    feature_set_version: 'price-history-v1',
  },
  fincast: {
    run_id: 'prod_fincast_run',
    strategy_id: 'fincast_passthrough',
    model_version: 'fincast-1b',
    feature_set_version: 'price-history-v1',
    fincast_checkpoint_path: '/data/models/fincast/v1.pth',
    fincast_repo_path: '/opt/fincast/src',
    fincast_backend: 'cpu',
  },
};

function isPredictorType(v: unknown): v is PredictorType {
  return v === 'timesfm' || v === 'fincast';
}

/** 활성 모델 캔들 주기를 상대 필드로 복사 (비어 있을 때) */
function syncTimeframe(
  next: Record<string, unknown>,
  predictor: PredictorType
): void {
  const fromKey = predictor === 'timesfm' ? 'fincast_timeframe' : 'timesfm_timeframe';
  const toKey = predictor === 'timesfm' ? 'timesfm_timeframe' : 'fincast_timeframe';
  const current = next[toKey];
  if (current === undefined || current === null || current === '') {
    const other = next[fromKey];
    if (other !== undefined && other !== null && other !== '') {
      next[toKey] = other;
    }
  }
}

/**
 * predictor_type 변경 시 run_id / model_version / FinCast 경로 등을 프리셋으로 덮어씀.
 * timeframe는 서로 비어 있으면 동기화.
 */
export function applyPredictorPreset(
  values: Record<string, unknown>,
  predictorType: unknown
): Record<string, unknown> {
  if (!isPredictorType(predictorType)) {
    return { ...values, predictor_type: predictorType };
  }

  const preset = PREDICTOR_PRESETS[predictorType];
  const next: Record<string, unknown> = {
    ...values,
    predictor_type: predictorType,
    run_id: preset.run_id,
    strategy_id: preset.strategy_id,
    model_version: preset.model_version,
    feature_set_version: preset.feature_set_version,
  };

  if (predictorType === 'fincast') {
    next.fincast_checkpoint_path =
      preset.fincast_checkpoint_path ?? next.fincast_checkpoint_path;
    next.fincast_repo_path = preset.fincast_repo_path ?? next.fincast_repo_path;
    if (!next.fincast_backend) {
      next.fincast_backend = preset.fincast_backend;
    }
  }

  syncTimeframe(next, predictorType);
  return next;
}
