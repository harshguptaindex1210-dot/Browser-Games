# Issue G2 — Wrapper Page + ExternalGamePlayer component

- **Status:** ready-for-agent
- **Blocked by:** G1
- **Parent PRD:** `CONTEXT/docs/prd/0002-game-catalog-expansion.md`

## What to build

Build the component that plays external GameDistribution games:

- New `ExternalGamePlayer` component that loads the `embedUrl` in a nested iframe with `sandbox="allow-scripts allow-same-origin"`.
- Loading state shown within 500ms of the player page rendering.
- 5s timeout: if the iframe doesn't load within 5s, show "This game is unavailable right now" with a "Try another game" link (INV-F7, INV-F8).
- Save last-played timestamp to IndexedDB (via the same Save Slot infrastructure).
- Capture high score if GameDistribution exposes a callback (via `window.addEventListener('message')` for GD-specific events). If not available, skip silently.
- The Player Page route (`/play/[slug]`) checks `game.source` — if `"external"`, renders `ExternalGamePlayer` instead of `GamePlayer`.
- External game iframe must never access the Site's cookies, localStorage, or Game Adapter (INV-S8, INV-S10).

## Acceptance criteria

- [ ] `/play/<external-slug>` renders `ExternalGamePlayer` with the embed URL in a nested iframe.
- [ ] Loading state visible within 500ms.
- [ ] If the embed fails to load within 5s, the "unavailable" message + "Try another game" link appear (INV-F7).
- [ ] Last-played timestamp saved to IndexedDB for external games.
- [ ] External iframe has `sandbox="allow-scripts allow-same-origin"` and is isolated from the Site's cookies/storage (INV-S8).
- [ ] No GameDistribution script loads in the top-level document (INV-S9).
- [ ] At least one Playwright test: load external game page, assert loading state, assert fallback on timeout.
- [ ] At least one Vitest test: ExternalGamePlayer renders with a test embed URL.
- [ ] Existing S1 tests pass (no regressions).

## Blocked by

- G1 (manifest schema must support `source: "external"` + `embedUrl`)

## Verification-command

```
npm run gate && npx playwright test --grep "external"
```

Exits 0 when gate passes + external-game e2e tests pass.
