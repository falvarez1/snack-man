import { TILE_SIZE } from './maze.js';
import { worldToScreen, type GameState } from './game.js';

export function renderGame(ctx: CanvasRenderingContext2D, state: GameState, alpha: number): void {
  const width = state.maze.width * TILE_SIZE;
  const height = state.maze.height * TILE_SIZE;
  ctx.clearRect(0, 0, width, height);

  drawMaze(ctx, state);
  drawPellets(ctx, state);
  drawFruit(ctx, state);
  drawPlayer(ctx, state, alpha);
  drawGhosts(ctx, state, alpha);
  drawHud(ctx, state);
}

function drawMaze(ctx: CanvasRenderingContext2D, state: GameState): void {
  ctx.fillStyle = '#030714';
  ctx.fillRect(0, 0, state.maze.width * TILE_SIZE, state.maze.height * TILE_SIZE);
  ctx.fillStyle = '#1f5fff';

  for (let y = 0; y < state.maze.height; y += 1) {
    for (let x = 0; x < state.maze.width; x += 1) {
      const tile = state.maze.tiles[y * state.maze.width + x];
      if (tile === 'wall') {
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }
  }
}

function drawPellets(ctx: CanvasRenderingContext2D, state: GameState): void {
  state.pellets.forEach((spot) => {
    const [x, y] = spot.split(',').map(Number);
    ctx.beginPath();
    ctx.fillStyle = '#ffe082';
    ctx.arc(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  state.powerPellets.forEach((spot) => {
    const [x, y] = spot.split(',').map(Number);
    ctx.beginPath();
    ctx.fillStyle = '#fff176';
    ctx.arc(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, 6, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawFruit(ctx: CanvasRenderingContext2D, state: GameState): void {
  if (!state.fruit) return;
  const c = worldToScreen(state.fruit.tile);
  ctx.beginPath();
  ctx.fillStyle = '#ef5350';
  ctx.arc(c.x, c.y, 8, 0, Math.PI * 2);
  ctx.fill();
}

function drawPlayer(ctx: CanvasRenderingContext2D, state: GameState, alpha: number): void {
  const c = worldToScreen(state.player.tile);
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.rotate(alpha * 0.2);
  ctx.beginPath();
  ctx.fillStyle = '#ffeb3b';
  ctx.arc(0, 0, 10, 0.2, Math.PI * 2 - 0.2);
  ctx.lineTo(0, 0);
  ctx.fill();
  ctx.restore();
}

function drawGhosts(ctx: CanvasRenderingContext2D, state: GameState, alpha: number): void {
  state.ghosts.forEach((ghost) => {
    const c = worldToScreen(ghost.tile);
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.scale(1, 1 + Math.sin(alpha * Math.PI) * 0.02);
    ctx.fillStyle = ghost.state === 'frightened' ? '#42a5f5' : ghost.color;
    ctx.beginPath();
    ctx.arc(0, -3, 9, Math.PI, 0);
    ctx.rect(-9, -3, 18, 12);
    ctx.fill();
    ctx.restore();
  });
}

function drawHud(ctx: CanvasRenderingContext2D, state: GameState): void {
  ctx.fillStyle = '#ffffff';
  ctx.font = '16px monospace';
  ctx.fillText(`Score ${state.score.score}`, 10, 20);
  ctx.fillText(`Combo ${state.score.comboChain}`, 10, 40);
  ctx.fillText(`Time ${state.timeLeft.toFixed(1)}`, 10, 60);
  if (state.phase !== 'playing') {
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(state.message, (state.maze.width * TILE_SIZE) / 2, (state.maze.height * TILE_SIZE) / 2);
    ctx.textAlign = 'left';
  }
}
