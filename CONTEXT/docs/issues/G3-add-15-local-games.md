# Issue G3 — Add 15 local games (racing, fighting, clicker, simulator)

- **Status:** ready-for-agent
- **Blocked by:** G1
- **Parent PRD:** `CONTEXT/docs/prd/0002-game-catalog-expansion.md`

## What to build

Source and add 15 free HTML5 games to `games/` across four genres:

- **Racing** (4 games): car racing, motorcycle, drift, drag.
- **Fighting** (4 games): street fighter-style, boxing, martial arts, wrestling.
- **Clicker** (4 games): idle/incremental games.
- **Simulator** (3 games): any simulation games (driving sim, farming sim, flight sim, etc.)

Each game gets:
- A folder under `games/<slug>/` with the game's HTML/JS/CSS assets.
- A `game.json` manifest with `source: "local"`, correct `slug`, `title`, `description`, `tags`, `controls`, `entry`, `thumbnail`, `genre`, and `license` fields.
- A `thumbnail.svg` (can be a simple placeholder if the game doesn't include one).

Games must:
- Load and run inside the sandboxed iframe (`allow-scripts allow-pointer-lock`, no `allow-same-origin`).
- Send at least `READY` and `HEARTBEAT` via the Game Adapter (or be wrapped in a thin adapter script if they don't natively support postMessage).
- Not exceed 2 MB gzipped per game (INV-P4).

## Acceptance criteria

- [ ] 15 game folders exist under `games/` with valid manifests.
- [ ] Each manifest passes `validateManifest` (INV-F5).
- [ ] Each game loads in the Player Page sandboxed iframe without errors.
- [ ] Each game sends READY + HEARTBEAT (or has a wrapper that does).
- [ ] Catalog lists all 15 games after build.
- [ ] Each game's bundle is ≤ 2 MB gzipped (INV-P4).
- [ ] Build passes; existing tests pass.
- [ ] At least one Playwright smoke test: load a random local game, assert iframe renders.

## Blocked by

- G1 (manifest schema must support `genre` field)

## Verification-command

```
npm run gate && npx playwright test --grep "local game"
```

Exits 0 when gate passes + local-game e2e smoke test passes.
