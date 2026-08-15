#!/usr/bin/env node
/** Assert predictor preset + visibility (mirrors frontend utils). */
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

function resolveVisibleWhen(visibleWhen, keyOrGroupId) {
  if (visibleWhen && Object.keys(visibleWhen).length > 0) return visibleWhen;
  if (!keyOrGroupId) return undefined;
  if (keyOrGroupId === 'timesfm' || keyOrGroupId.startsWith('timesfm_')) {
    return { predictor_type: 'timesfm' };
  }
  if (keyOrGroupId === 'fincast' || keyOrGroupId.startsWith('fincast_')) {
    return { predictor_type: 'fincast' };
  }
  return undefined;
}

function matchesVisibleWhen(visibleWhen, values) {
  if (!visibleWhen) return true;
  return Object.entries(visibleWhen).every(
    ([k, expected]) => String(values[k] ?? '') === expected
  );
}

function isParamVisible(param, values) {
  const rule =
    resolveVisibleWhen(param.visible_when, param.key) ??
    resolveVisibleWhen(undefined, param.group);
  return matchesVisibleWhen(rule, values);
}

const out = apply(
  { timesfm_timeframe: '5m', fincast_timeframe: '', autopilot_enabled: true },
  'fincast'
);
assert.equal(out.run_id, 'prod_fincast_run');
assert.equal(out.model_version, 'fincast-1b');
assert.equal(out.fincast_checkpoint_path, '/data/models/fincast/v1.pth');
assert.equal(out.fincast_timeframe, '5m');

const stale = apply(
  {
    predictor_type: 'fincast',
    run_id: 'prod_timesfm_run',
    strategy_id: 'timesfm_passthrough',
    model_version: 'timesfm-2.5-200m',
  },
  'fincast'
);
assert.equal(stale.run_id, 'prod_fincast_run');
assert.equal(stale.strategy_id, 'fincast_passthrough');
assert.equal(stale.model_version, 'fincast-1b');

const fincastVals = { predictor_type: 'fincast' };
assert.equal(
  isParamVisible(
    { key: 'timesfm_horizon', group: 'timesfm', visible_when: undefined },
    fincastVals
  ),
  false
);
assert.equal(
  isParamVisible(
    { key: 'fincast_horizon', group: 'fincast', visible_when: undefined },
    fincastVals
  ),
  true
);
assert.equal(
  isParamVisible({ key: 'run_id', group: 'run', visible_when: undefined }, fincastVals),
  true
);

console.log('check-predictor-presets: ok');
