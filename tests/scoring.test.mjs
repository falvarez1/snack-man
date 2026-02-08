import test from 'node:test';
import assert from 'node:assert/strict';
import { awardGhostTrain, createScoreState } from '../dist/scoring.js';

test('scoring applies chain multipliers', () => {
  const score = createScoreState();
  const first = awardGhostTrain(score, 2);
  const second = awardGhostTrain(score, 3);
  assert.equal(first, 400);
  assert.equal(second, 1200);
  assert.equal(score.score, 1600);
  assert.equal(score.maxCombo, 2);
});
