import './style.css';
import { createGameState, resetRound, setPlayerDirection, updateGame } from './game.js';
import { pollGamepadDirection, setupInput } from './input.js';
import { TILE_SIZE } from './maze.js';
import { renderGame } from './render.js';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('Missing #app');
}

const state = createGameState();
const input = setupInput();

const canvas = document.createElement('canvas');
canvas.width = state.maze.width * TILE_SIZE;
canvas.height = state.maze.height * TILE_SIZE;
app.append(canvas);

const ctx = canvas.getContext('2d');
if (!ctx) throw new Error('No 2D context');

state.audio.on((event) => {
  console.debug('[audio hook]', event);
});

const STEP = 1 / 60;
let accumulator = 0;
let lastTime = performance.now() / 1000;

function frame(nowMs: number): void {
  const now = nowMs / 1000;
  let dt = now - lastTime;
  if (dt > 0.25) dt = 0.25;
  lastTime = now;
  accumulator += dt;

  handleUiFlow();

  while (accumulator >= STEP) {
    const padDir = pollGamepadDirection();
    const direction = input.direction !== 'none' ? input.direction : padDir;
    if (direction !== 'none') {
      setPlayerDirection(state, direction);
      input.direction = 'none';
    }
    updateGame(state, STEP);
    accumulator -= STEP;
  }

  renderGame(ctx!, state, accumulator / STEP);
  requestAnimationFrame(frame);
}

function handleUiFlow(): void {
  if (input.startPressed) {
    input.startPressed = false;
    if (state.phase === 'title' || state.phase === 'gameover') {
      resetRound(state);
      return;
    }
  }

  if (input.pausePressed) {
    input.pausePressed = false;
    if (state.phase === 'playing') {
      state.phase = 'paused';
      state.message = 'Paused';
    } else if (state.phase === 'paused') {
      state.phase = 'playing';
      state.message = '';
    }
  }

  if (state.phase === 'paused') {
    return;
  }

  if (input.restartPressed) {
    input.restartPressed = false;
    resetRound(state);
  }
}

requestAnimationFrame(frame);
