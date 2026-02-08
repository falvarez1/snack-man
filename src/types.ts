export type Vec2 = { x: number; y: number };

export type Direction = 'none' | 'up' | 'down' | 'left' | 'right';

export type TileType = 'wall' | 'path' | 'tunnel';

export type GhostState = 'scatter' | 'chase' | 'frightened' | 'eaten';

export interface Character {
  tile: Vec2;
  dir: Direction;
  nextDir: Direction;
  moveProgress: number;
  speedTilesPerSecond: number;
}

export interface Ghost extends Character {
  id: number;
  color: string;
  state: GhostState;
  home: Vec2;
  respawnTimer: number;
  trainIndex: number;
}

export interface Fruit {
  tile: Vec2;
  value: number;
  ttl: number;
}

export type GamePhase = 'title' | 'playing' | 'paused' | 'gameover';
