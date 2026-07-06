# Issue S1 — Foundation tracer: one stub game end-to-end

- **Status:** ready-for-agent
- **Blocked by:** None — can start immediately
- **Parent PRD:** `CONTEXT/docs/prd/0001-browser-games-v1.md`
- **ADR:** `CONTEXT/docs/adr/0001-browser-games-v1-architecture.md`

## What to build

Stand up the Next.js (App Router) app deployed to Vercel, with one stub game (`games/paddle/`) that proves the full vertical path:

- Build-time catalog generator that reads every `games/<slug>/game.json` manifest and emits a static catalog index. Invalid manifests fail the build with a precise error naming the offending file.
- Player Page route that loads a game's entry HTML in a sandboxed iframe (`sandbox="allow-scripts allow-pointer-lock"` — NO `allow-same-origin`) and opens a postMessage Game Adapter channel.
- Game Adapter with the fixed message-type allowlist: `READY`, `HEARTBEAT`, `SAVE_WRITE`, `SAVE_READ_RESPONSE`, `GAME_OVER`, `SCORE` (Site→Game: `SAVE_READ`, `FOCUS`). Both sides origin-check; unknown types dropped + logged.
- Device identity: random UUIDv4 in a `__bg_did` cookie (1 yr, SameSite=Lax), mirrored in localStorage. Opaque to games and ads.
- Save Slots: IndexedDB store `bg_saves`, keys `games/<slug>/saves/<slot>`, read/written only via Game Adapter. Fail-soft with a one-time toast "Saves disabled in this mode" when IndexedDB is unavailable.
- Recently-played row on the Player Page (from IndexedDB).
- "Game not responding — reload" affordance if the iframe sends no message within 5s of load or after a 10s heartbeat timeout.
- SSR catalog page listing the one game (for SEO baseline).
- Site-wide CSP header: `default-src 'self'; script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com; frame-src 'self' https://pagead2.googlesyndication.com; connect-src 'self' *.partykit.io` (no `unsafe-eval`).
- Test framework: Vitest (unit) + Playwright (e2e). The Game Adapter postMessage contract is the primary test seam — drive the Site by simulating a stub game iframe emitting allowlisted messages.

## Acceptance criteria

- [ ] Deploying `main` to Vercel builds and serves the homepage with the one stub game card visible.
- [ ] Clicking the game card opens the Player Page and the stub game renders in a sandboxed iframe within 2s p75 (INV-P4).
- [ ] First Contentful Paint on the Player Page ≤ 1.5s p75 on cable / warm cache (INV-P1).
- [ ] Catalog page TTFB ≤ 300ms p75 on Vercel edge (INV-P2).
- [ ] Game iframe has `sandbox="allow-scripts allow-pointer-lock"` and does NOT include `allow-same-origin` (INV-S1).
- [ ] Site's postMessage handler only accepts allowlisted `type` values from the deployed game origin; unknown types are dropped + logged (INV-S2).
- [ ] Save Slot keys are namespaced `games/<slug>/saves/<slot>`; the stub game cannot read another game's namespace (INV-S5).
- [ ] With IndexedDB unavailable (simulated private mode), gameplay continues, a one-time "Saves disabled in this mode" toast appears, console warning logged, no uncaught exception (INV-F4).
- [ ] A stub game that stops sending messages for 10s shows the "Game not responding — reload" affordance (INV-F3).
- [ ] A `games/<slug>/game.json` missing a required field fails the build with an error naming the offending file (INV-F5).
- [ ] Site response headers include the documented CSP with no `unsafe-eval` (INV-S7).
- [ ] `__bg_did` cookie is a UUIDv4, 1-year, SameSite=Lax, never sent to AdSense or exposed to the game iframe (INV-S4).
- [ ] Play is fully anonymous — no login prompt ever appears.
- [ ] Vitest + Playwright wired into CI; the Game Adapter contract has at least one passing test per allowlisted message type.

## Blocked by

None — can start immediately.

## Verification-command

```
npm run build && npm run test -- --run && npx playwright test --project=smoke
```

Exits 0 exactly when the build passes (catalog generation + manifest validation), unit tests pass (Game Adapter contract), and the Playwright smoke test (open Player Page, iframe boots, save round-trips, reload-fallback triggers on a frozen stub) passes.
