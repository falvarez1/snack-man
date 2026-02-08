import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMaze } from '../dist/maze.js';
import { canMove, moveCharacter } from '../dist/movement.js';

test('movement supports tunnel wrap', () => {
  const maze = buildMaze();
  const character = {
    tile: { x: 0, y: 10 },
    dir: 'left',
    nextDir: 'left',
    moveProgress: 0,
    speedTilesPerSecond: 10
  };

  assert.equal(canMove(maze, character.tile, 'left'), true);
  moveCharacter(character, maze, 0.11);
  assert.equal(character.tile.x, 18);
});
