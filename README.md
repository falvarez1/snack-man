# Snack-Man CE-DX

Arcade game prototype inspired by Pac-Man Championship Edition DX pacing, built with **TypeScript + Canvas**.

## Features

- Tile-based maze graph with pellet + power pellet placement.
- Buffered player turning, tunnel wrap movement, and fixed timestep simulation.
- Ghost modes: scatter/chase/frightened/eaten with respawn behavior.
- CE-DX-inspired systems:
  - Train-style ghost targeting.
  - Chain combo scoring when eating frightened ghosts.
  - Dynamic fruit/item spawns by pellet thresholds.
  - Speed-up phases and phase transition audio hooks.
- UX flow: title, pause/resume (`P`), game over, restart (`R`).
- Controls: Arrow Keys / WASD + optional gamepad axis input.
- Audio event bus hooks for pellet/power-up/ghost/phase/game-over.

## Run (dev)

```bash
npm run dev
```

This starts a small local server at `http://localhost:5173` and recompiles TypeScript on source changes.

## Build

```bash
npm run build
```

## Preview build

```bash
npm run preview
```

## Quality gates

```bash
npm run lint
npm run test
```

## Gameplay notes

- Press `Enter` or `Space` to start.
- Eat power pellets to frighten ghosts, then chain ghost captures for multipliers.
- Grab spawned fruit in the center lane for bonus points.
- Round ends when time expires or all pellets are cleared.
