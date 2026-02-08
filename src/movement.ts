import { getTile, nextTile, wrapTunnel } from './maze.js';
import type { Character, Direction, Vec2 } from './types.js';
import type { Maze } from './maze.js';

export function canMove(maze: Maze, tile: Vec2, dir: Direction): boolean {
  if (dir === 'none') {
    return false;
  }
  const target = wrapTunnel(maze, nextTile(tile, dir));
  return getTile(maze, target) !== 'wall';
}

export function tryBufferedTurn(character: Character, maze: Maze): void {
  if (character.nextDir === 'none') {
    return;
  }
  if (canMove(maze, character.tile, character.nextDir)) {
    character.dir = character.nextDir;
  }
}

export function moveCharacter(character: Character, maze: Maze, dt: number): void {
  tryBufferedTurn(character, maze);
  if (!canMove(maze, character.tile, character.dir)) {
    character.moveProgress = 0;
    return;
  }

  character.moveProgress += character.speedTilesPerSecond * dt;
  while (character.moveProgress >= 1) {
    character.moveProgress -= 1;
    character.tile = wrapTunnel(maze, nextTile(character.tile, character.dir));
    tryBufferedTurn(character, maze);
    if (!canMove(maze, character.tile, character.dir)) {
      character.moveProgress = 0;
      break;
    }
  }
}
