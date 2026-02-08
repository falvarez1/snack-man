import type { Direction } from './types.js';

const KEY_MAP = new Map<string, Direction>([
  ['ArrowUp', 'up'],
  ['KeyW', 'up'],
  ['ArrowDown', 'down'],
  ['KeyS', 'down'],
  ['ArrowLeft', 'left'],
  ['KeyA', 'left'],
  ['ArrowRight', 'right'],
  ['KeyD', 'right']
]);

export interface InputState {
  direction: Direction;
  startPressed: boolean;
  pausePressed: boolean;
  restartPressed: boolean;
}

export function setupInput(): InputState {
  const state: InputState = {
    direction: 'none',
    startPressed: false,
    pausePressed: false,
    restartPressed: false
  };

  window.addEventListener('keydown', (event) => {
    const dir = KEY_MAP.get(event.code);
    if (dir) {
      state.direction = dir;
    }
    if (event.code === 'Space' || event.code === 'Enter') {
      state.startPressed = true;
    }
    if (event.code === 'KeyP') {
      state.pausePressed = true;
    }
    if (event.code === 'KeyR') {
      state.restartPressed = true;
    }
  });

  return state;
}

export function pollGamepadDirection(): Direction {
  const pad = navigator.getGamepads?.()[0];
  if (!pad) {
    return 'none';
  }
  const [xAxis = 0, yAxis = 0] = pad.axes;
  if (Math.abs(xAxis) > Math.abs(yAxis) && Math.abs(xAxis) > 0.4) {
    return xAxis > 0 ? 'right' : 'left';
  }
  if (Math.abs(yAxis) > 0.4) {
    return yAxis > 0 ? 'down' : 'up';
  }
  return 'none';
}
