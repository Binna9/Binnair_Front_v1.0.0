#!/usr/bin/env node
import assert from 'node:assert/strict';

function pickActiveEngineRun(items) {
  if (!items?.length) return null;
  return items.find((r) => r.status === 'running') ?? items[0] ?? null;
}

const items = [
  { run_id: 'prod_timesfm_run', status: 'paused', model_version: 'timesfm-2.5-200m' },
  { run_id: 'prod_fincast_run', status: 'running', model_version: 'fincast-1b' },
];
const active = pickActiveEngineRun(items);
assert.equal(active.run_id, 'prod_fincast_run');
assert.equal(pickActiveEngineRun([{ run_id: 'a', status: 'paused' }]).run_id, 'a');
assert.equal(pickActiveEngineRun([]), null);
console.log('pickActiveEngineRun: ok');
