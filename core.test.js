import test from 'node:test';
import assert from 'node:assert/strict';
import { RAW_ORDERS, audit, prepare } from './core.js';

test('audit finds each deliberate quality issue', () => {
  const issues = audit();
  assert.equal(issues.filter(r => r.flags.includes('Duplicate ID')).length, 1);
  assert.equal(issues.filter(r => r.flags.includes('Missing region')).length, 1);
  assert.equal(issues.filter(r => r.flags.includes('Invalid revenue')).length, 2);
  assert.equal(issues.filter(r => r.flags.includes('Inconsistent channel')).length, 2);
});
test('all corrections produce a traceable valid summary', () => {
  const result = prepare(RAW_ORDERS, { dedupe: true, invalidRevenue: true, missingRegion: true, channel: true });
  assert.equal(result.kept.length, 9);
  assert.equal(result.excluded.length, 3);
  assert.equal(result.usableCount, 9);
  assert.equal(result.total, 7300);
  assert.deepEqual(result.byChannel, { Web: 3400, Store: 3900 });
  assert.equal(result.kept.find(r => r.id === 'A104').region, 'Unknown');
});
test('uncorrected variants remain visible instead of silently changing source data', () => {
  const result = prepare();
  assert.equal(result.kept.length, 12);
  assert.equal(result.excluded.length, 0);
  assert.equal(result.byChannel[' web '], 700);
  assert.equal(result.byChannel.WEB, undefined); // invalid revenue row is excluded from numeric summary
});
