export interface ScoreState {
  score: number;
  comboChain: number;
  maxCombo: number;
}

export function createScoreState(): ScoreState {
  return { score: 0, comboChain: 0, maxCombo: 0 };
}

export function awardPellet(state: ScoreState): void {
  state.score += 10;
}

export function awardPowerPellet(state: ScoreState): void {
  state.score += 50;
  state.comboChain = 0;
}

export function awardGhostTrain(state: ScoreState, trainCount: number): number {
  state.comboChain += 1;
  state.maxCombo = Math.max(state.maxCombo, state.comboChain);
  const points = 200 * trainCount * state.comboChain;
  state.score += points;
  return points;
}

export function awardFruit(state: ScoreState, value: number): void {
  state.score += value;
}
