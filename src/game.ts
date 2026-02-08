import { AudioBus } from './audio.js';
import { buildMaze, TILE_SIZE } from './maze.js';
import { moveCharacter } from './movement.js';
import { shortestPathDir } from './pathfinding.js';
import {
  awardFruit,
  awardGhostTrain,
  awardPellet,
  awardPowerPellet,
  createScoreState,
  type ScoreState
} from './scoring.js';
import type { Direction, Fruit, GamePhase, Ghost, GhostState, Vec2 } from './types.js';

const CHASE_SCATTER_PATTERN = [
  { mode: 'scatter' as const, duration: 7 },
  { mode: 'chase' as const, duration: 20 },
  { mode: 'scatter' as const, duration: 7 },
  { mode: 'chase' as const, duration: 20 },
  { mode: 'scatter' as const, duration: 5 },
  { mode: 'chase' as const, duration: 999 }
];

const ROUND_TIME = 180;
const FRIGHTENED_TIME = 6;

export interface GameState {
  phase: GamePhase;
  maze: ReturnType<typeof buildMaze>;
  player: {
    tile: Vec2;
    dir: Direction;
    nextDir: Direction;
    moveProgress: number;
    speedTilesPerSecond: number;
  };
  ghosts: Ghost[];
  pellets: Set<string>;
  powerPellets: Set<string>;
  fruit: Fruit | null;
  score: ScoreState;
  timeLeft: number;
  elapsed: number;
  frightenedTimer: number;
  modeTimer: number;
  modeIndex: number;
  speedMultiplier: number;
  audio: AudioBus;
  message: string;
}

export function createGameState(): GameState {
  const maze = buildMaze();
  const pellets = new Set(maze.pelletSpawns.map((v) => key(v)));
  const powerPellets = new Set(maze.powerPellets.map((v) => key(v)));
  const audio = new AudioBus();

  return {
    phase: 'title',
    maze,
    player: {
      tile: { ...maze.playerSpawn },
      dir: 'left',
      nextDir: 'left',
      moveProgress: 0,
      speedTilesPerSecond: 6
    },
    ghosts: maze.ghostSpawn.slice(0, 4).map((spawn, id) => ({
      id,
      tile: { ...spawn },
      dir: 'left',
      nextDir: 'left',
      moveProgress: 0,
      speedTilesPerSecond: 5,
      color: ['#ff4d4d', '#64b5f6', '#ffb74d', '#ce93d8'][id] ?? '#fff',
      state: 'scatter',
      home: { ...spawn },
      respawnTimer: 0,
      trainIndex: id + 1
    })),
    pellets,
    powerPellets,
    fruit: null,
    score: createScoreState(),
    timeLeft: ROUND_TIME,
    elapsed: 0,
    frightenedTimer: 0,
    modeTimer: 0,
    modeIndex: 0,
    speedMultiplier: 1,
    audio,
    message: 'Press Enter or Space to Start'
  };
}

export function resetRound(state: GameState): void {
  const fresh = createGameState();
  state.phase = 'playing';
  state.player = fresh.player;
  state.ghosts = fresh.ghosts;
  state.pellets = fresh.pellets;
  state.powerPellets = fresh.powerPellets;
  state.fruit = null;
  state.score = createScoreState();
  state.timeLeft = ROUND_TIME;
  state.elapsed = 0;
  state.modeTimer = 0;
  state.modeIndex = 0;
  state.frightenedTimer = 0;
  state.speedMultiplier = 1;
  state.message = '';
}

export function setPlayerDirection(state: GameState, direction: Direction): void {
  state.player.nextDir = direction;
}

export function updateGame(state: GameState, dt: number): void {
  if (state.phase !== 'playing') {
    return;
  }

  state.elapsed += dt;
  state.timeLeft = Math.max(0, ROUND_TIME - state.elapsed);
  updateSpeedPhase(state);

  if (state.timeLeft <= 0) {
    state.phase = 'gameover';
    state.message = 'Time Up! Press R to Restart';
    state.audio.emit('gameOver');
    return;
  }

  advanceModeTimer(state, dt);

  if (state.frightenedTimer > 0) {
    state.frightenedTimer = Math.max(0, state.frightenedTimer - dt);
    if (state.frightenedTimer <= 0) {
      state.ghosts.forEach((ghost) => {
        if (ghost.state === 'frightened') {
          ghost.state = currentMode(state);
        }
      });
    }
  }

  state.player.speedTilesPerSecond = 6.4 * state.speedMultiplier;
  moveCharacter(state.player, state.maze, dt);
  consumePellets(state);
  maybeSpawnFruit(state);
  moveGhosts(state, dt);
  handleFruitPickup(state);
  handleCollisions(state);

  if (state.pellets.size === 0) {
    state.phase = 'gameover';
    state.message = 'Clear! Press R to Play Again';
  }
}

function updateSpeedPhase(state: GameState): void {
  const previous = state.speedMultiplier;
  if (state.timeLeft <= 45) {
    state.speedMultiplier = 1.35;
  } else if (state.timeLeft <= 90) {
    state.speedMultiplier = 1.2;
  } else {
    state.speedMultiplier = 1;
  }
  if (previous !== state.speedMultiplier) {
    state.audio.emit('phaseShift');
  }
}

function advanceModeTimer(state: GameState, dt: number): void {
  const mode = CHASE_SCATTER_PATTERN[state.modeIndex] ?? CHASE_SCATTER_PATTERN.at(-1)!;
  state.modeTimer += dt;
  if (state.modeTimer >= mode.duration) {
    state.modeTimer = 0;
    state.modeIndex = Math.min(state.modeIndex + 1, CHASE_SCATTER_PATTERN.length - 1);
    state.audio.emit('phaseShift');
  }
}

function currentMode(state: GameState): GhostState {
  return CHASE_SCATTER_PATTERN[state.modeIndex]?.mode ?? 'chase';
}

function consumePellets(state: GameState): void {
  const playerKey = key(state.player.tile);
  if (state.pellets.delete(playerKey)) {
    awardPellet(state.score);
    state.audio.emit('pellet');
  }
  if (state.powerPellets.delete(playerKey)) {
    awardPowerPellet(state.score);
    state.frightenedTimer = FRIGHTENED_TIME;
    state.ghosts.forEach((ghost) => {
      if (ghost.state !== 'eaten') {
        ghost.state = 'frightened';
      }
    });
    state.audio.emit('powerUp');
  }
}

function maybeSpawnFruit(state: GameState): void {
  if (state.fruit) {
    state.fruit.ttl -= 1 / 60;
    if (state.fruit.ttl <= 0) {
      state.fruit = null;
    }
    return;
  }

  const remainingRatio = state.pellets.size / state.maze.pelletSpawns.length;
  if (remainingRatio < 0.7 && remainingRatio > 0.68) {
    state.fruit = { tile: { x: 9, y: 10 }, value: 200, ttl: 12 };
  } else if (remainingRatio < 0.35 && remainingRatio > 0.33) {
    state.fruit = { tile: { x: 9, y: 10 }, value: 500, ttl: 12 };
  }
}

function moveGhosts(state: GameState, dt: number): void {
  state.ghosts.forEach((ghost, index) => {
    if (ghost.state === 'eaten') {
      ghost.respawnTimer -= dt;
      const dir = shortestPathDir(state.maze, ghost.tile, ghost.home);
      ghost.nextDir = dir;
      ghost.speedTilesPerSecond = 9;
      moveCharacter(ghost, state.maze, dt);
      if (ghost.respawnTimer <= 0 || key(ghost.tile) === key(ghost.home)) {
        ghost.state = currentMode(state);
      }
      return;
    }

    const base = ghost.state === 'frightened' ? 4.1 : 5.2;
    ghost.speedTilesPerSecond = base * state.speedMultiplier;
    ghost.nextDir = decideGhostDirection(state, ghost, index);
    moveCharacter(ghost, state.maze, dt);
  });
}

function decideGhostDirection(state: GameState, ghost: Ghost, index: number): Direction {
  if (ghost.state === 'frightened') {
    const options: Direction[] = ['up', 'left', 'down', 'right'];
    return options[Math.floor((state.elapsed * 100 + index * 7) % options.length)] ?? 'left';
  }
  const target = ghostTarget(state, ghost, index);
  return shortestPathDir(state.maze, ghost.tile, target);
}

function ghostTarget(state: GameState, _ghost: Ghost, index: number): Vec2 {
  const mode = currentMode(state);
  if (mode === 'scatter') {
    return [
      { x: 1, y: 1 },
      { x: state.maze.width - 2, y: 1 },
      { x: 1, y: state.maze.height - 2 },
      { x: state.maze.width - 2, y: state.maze.height - 2 }
    ][index] ?? { x: 1, y: 1 };
  }

  const trailTarget = state.ghosts[index - 1]?.tile;
  if (trailTarget) {
    return trailTarget;
  }
  return state.player.tile;
}

function handleCollisions(state: GameState): void {
  state.ghosts.forEach((ghost) => {
    if (distanceSq(state.player.tile, ghost.tile) > 0) {
      return;
    }
    if (ghost.state === 'frightened') {
      ghost.state = 'eaten';
      ghost.respawnTimer = 3;
      const points = awardGhostTrain(state.score, ghost.trainIndex);
      state.message = `Chain +${points}`;
      state.audio.emit('ghostEat');
    } else if (ghost.state !== 'eaten') {
      state.phase = 'gameover';
      state.message = 'Caught! Press R to Restart';
      state.audio.emit('gameOver');
    }
  });
}

function handleFruitPickup(state: GameState): void {
  if (!state.fruit) {
    return;
  }
  if (distanceSq(state.player.tile, state.fruit.tile) === 0) {
    awardFruit(state.score, state.fruit.value);
    state.audio.emit('fruit');
    state.fruit = null;
  }
}

function distanceSq(a: Vec2, b: Vec2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

function key(v: Vec2): string {
  return `${v.x},${v.y}`;
}

export function worldToScreen(tile: Vec2): Vec2 {
  return { x: tile.x * TILE_SIZE + TILE_SIZE / 2, y: tile.y * TILE_SIZE + TILE_SIZE / 2 };
}
