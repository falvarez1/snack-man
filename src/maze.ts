import type { Direction, TileType, Vec2 } from './types.js';

export const TILE_SIZE = 24;

const MAP_ROWS = [
  '###################',
  '#........#........#',
  '#.###.##.#.##.###.#',
  '#o###.##.#.##.###o#',
  '#.................#',
  '#.###.#.###.#.###.#',
  '#.....#...#.#.....#',
  '#####.### # ###.###',
  '    #.#     #.#    ',
  '#####.# ## ##.#.###',
  'T....   GGG   ....T',
  '#####.# #####.#.###',
  '    #.#       #.#  ',
  '#####.# ##### #.###',
  '#........#........#',
  '#.###.##.#.##.###.#',
  '#o..#........#..o.#',
  '###.#.#.###.#.#.###',
  '#.....#..P..#.....#',
  '###################'
];

export interface Maze {
  width: number;
  height: number;
  tiles: TileType[];
  pelletSpawns: Vec2[];
  powerPellets: Vec2[];
  playerSpawn: Vec2;
  ghostSpawn: Vec2[];
}

export function buildMaze(): Maze {
  const width = MAP_ROWS[0].length;
  const height = MAP_ROWS.length;
  const tiles: TileType[] = [];
  const pelletSpawns: Vec2[] = [];
  const powerPellets: Vec2[] = [];
  let playerSpawn = { x: 9, y: 18 };
  const ghostSpawn: Vec2[] = [];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const char = MAP_ROWS[y][x];
      if (char === '#' || char === undefined) {
        tiles.push('wall');
        continue;
      }
      if (char === 'T') {
        tiles.push('tunnel');
      } else {
        tiles.push('path');
      }
      if (char === '.' || char === 'o') {
        pelletSpawns.push({ x, y });
      }
      if (char === 'o') {
        powerPellets.push({ x, y });
      }
      if (char === 'P') {
        playerSpawn = { x, y };
      }
      if (char === 'G') {
        ghostSpawn.push({ x, y });
      }
    }
  }

  return { width, height, tiles, pelletSpawns, powerPellets, playerSpawn, ghostSpawn };
}

export function tileIndex(maze: Maze, tile: Vec2): number {
  return tile.y * maze.width + tile.x;
}

export function getTile(maze: Maze, tile: Vec2): TileType {
  const wrapped = wrapTunnel(maze, tile);
  return maze.tiles[tileIndex(maze, wrapped)] ?? 'wall';
}

export function wrapTunnel(maze: Maze, tile: Vec2): Vec2 {
  const x = (tile.x + maze.width) % maze.width;
  const y = (tile.y + maze.height) % maze.height;
  return { x, y };
}

export function nextTile(tile: Vec2, dir: Direction): Vec2 {
  switch (dir) {
    case 'up':
      return { x: tile.x, y: tile.y - 1 };
    case 'down':
      return { x: tile.x, y: tile.y + 1 };
    case 'left':
      return { x: tile.x - 1, y: tile.y };
    case 'right':
      return { x: tile.x + 1, y: tile.y };
    default:
      return tile;
  }
}
