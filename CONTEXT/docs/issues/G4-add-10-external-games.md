# Issue G4 — Add 10 external GameDistribution games

- **Status:** ready-for-agent
- **Blocked by:** G2
- **Parent PRD:** `CONTEXT/docs/prd/0002-game-catalog-expansion.md`

## What to build

Add 10 external game manifests pointing to GameDistribution embed URLs across four genres:

- **Racing** (3 games)
- **Fighting** (2 games)
- **Clicker** (3 games)
- **Simulator** (2 games)

Each game is a manifest file only (no game code in repo):
- `games/<slug>/game.json` with `source: "external"`, `embedUrl` pointing to the GameDistribution embed, `genre`, `tags`, `title`, `description`, `thumbnail`.
- The `embedUrl` format is typically `https://html5.gamedistribution.com/<game-id>/?gd_sdk_referrer_url=https://gamedistribution.com` (exact format per GD docs).

## Acceptance criteria

- [ ] 10 external game manifests exist under `games/` with valid `embedUrl` (INV-F5).
- [ ] Each external game opens on the Player Page via the `ExternalGamePlayer` component (G2).
- [ ] Catalog lists all 10 external games after build.
- [ ] Tag/search includes external games.
- [ ] No external game code is committed to the repo (manifests only).
- [ ] Build passes; existing tests pass.
- [ ] At least one Playwright test: load an external game page, assert the embed iframe loads or shows the fallback.

## Blocked by

- G2 (ExternalGamePlayer component must exist)

## Verification-command

```
npm run gate && npx playwright test --grep "external"
```

Exits 0 when gate passes + external-game e2e tests pass.
