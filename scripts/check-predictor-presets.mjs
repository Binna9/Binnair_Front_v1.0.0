#!/usr/bin/env node
/** Assert predictor preset mapping (mirrors src/utils/predictorPresets.ts). */
import assert from 'node:assert/strict';

const PRESETS = {
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

function apply(values, type) {
  const p = PRESETS[type];
  const next = {
    ...values,
    predictor_type: type,
    run_id: p.run_id,
    strategy_id: p.strategy_id,
    model_version: p.model_version,
    feature_set_version: p.feature_set_version,
  };
  if (type === 'fincast') {
    next.fincast_checkpoint_path = p.fincast_checkpoint_path;
    next.fincast_repo_path = p.fincast_repo_path;
    next.fincast_backend = next.fincast_backend || p.fincast_backend;
  }
  const toKey = type === 'timesfm' ? 'timesfm_timeframe' : 'fincast_timeframe';
  const fromKey = type === 'timesfm' ? 'fincast_timeframe' : 'timesfm_timeframe';
  if (!next[toKey] && next[fromKey]) next[toKey] = next[fromKey];
  return next;
}

const out = apply({ timesfm_timeframe: '5m', fincast_timeframe: '', autopilot_enabled: true }, 'fincast');
assert.equal(out.run_id, 'prod_fincast_run');
assert.equal(out.model_version, 'fincast-1b');
assert.equal(out.fincast_checkpoint_path, '/data/models/fincast/v1.pth');
assert.equal(out.fincast_timeframe, '5m');
console.log('check-predictor-presets: ok');
