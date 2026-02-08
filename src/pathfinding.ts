import { canMove } from './movement.js';
import { nextTile, wrapTunnel } from './maze.js';
import type { Direction, Vec2 } from './types.js';
import type { Maze } from './maze.js';

const DIRECTIONS: Direction[] = ['up', 'left', 'down', 'right'];

export function shortestPathDir(maze: Maze, start: Vec2, target: Vec2): Direction {
  if (start.x === target.x && start.y === target.y) {
    return 'none';
  }

  const queue: Vec2[] = [start];
  const prev = new Map<string, { from: Vec2; dir: Direction }>();
  const seen = new Set<string>([key(start)]);

  while (queue.length) {
    const current = queue.shift()!;
    for (const dir of DIRECTIONS) {
      if (!canMove(maze, current, dir)) {
        continue;
      }
      const next = wrapTunnel(maze, nextTile(current, dir));
      const k = key(next);
      if (seen.has(k)) {
        continue;
      }
      seen.add(k);
      prev.set(k, { from: current, dir });
      if (next.x === target.x && next.y === target.y) {
        return unwindFirstDirection(prev, start, next);
      }
      queue.push(next);
    }
  }

  return 'none';
}

function unwindFirstDirection(
  prev: Map<string, { from: Vec2; dir: Direction }>,
  start: Vec2,
  end: Vec2
): Direction {
  let cursor = end;
  let entry = prev.get(key(cursor));
  while (entry && !(entry.from.x === start.x && entry.from.y === start.y)) {
    cursor = entry.from;
    entry = prev.get(key(cursor));
  }
  return entry?.dir ?? 'none';
}

function key(v: Vec2): string {
  return `${v.x},${v.y}`;
}
