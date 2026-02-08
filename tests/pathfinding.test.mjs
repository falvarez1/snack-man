import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMaze } from '../dist/maze.js';
import { shortestPathDir } from '../dist/pathfinding.js';

test('pathfinding returns valid first step', () => {
  const maze = buildMaze();
  const dir = shortestPathDir(maze, { x: 9, y: 18 }, { x: 8, y: 18 });
  assert.ok(['up', 'left', 'right', 'down'].includes(dir));
});
