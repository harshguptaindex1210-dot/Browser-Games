# Browser-Games — Project Context

## What this is
A self-hosted browser-games portal (CrazyGames-style catalog, single-player-first) where every game lives in this repo and runs inside a sandboxed iframe on a Next.js site. Anonymous play, per-device persistence, tag/search discovery, one turn-based multiplayer game in v1.

## Ubiquitous Language
- **Game** — a self-contained HTML5 bundle living under `games/<slug>/`, played in a sandboxed iframe.
- **Local Game** — a Game whose code lives in this repo under `games/<slug>/`. Talks to the Site via the Game Adapter.
- **External Game** — a Game whose code is embedded from a third-party API (GameDistribution). Loaded in a nested iframe inside a Wrapper Page.
- **Wrapper Page** — a Site-rendered page that wraps an External Game in a thin frame, providing partial Game Adapter support (last-played, high-score capture) without the embedded game needing postMessage.
- **Catalog** — the build-time index of all Games (Local + External), generated from each game's `game.json` manifest.
- **Manifest** (`game.json`) — per-game metadata: slug, title, tags, controls, multiplayer flag, entry HTML, source type (local/external), embed URL (for external), license.
- **Game Adapter** — the postMessage contract the Site uses to talk to a Game's iframe (device-id, save-slot read/write, game-over event, score).
- **Device** — an anonymous browser identified by a generated `device-id` cookie + localStorage record.
- **Save Slot** — per-game, per-device persisted state (progress, high score, settings) in IndexedDB.
- **Site** — the Next.js app shell that renders the catalog, search, and game player page.
- **Player Page** — the route that loads one Game's iframe and wires the Game Adapter.
- **Multiplayer Room** — a PartyKit room hosting one match of the v1 multiplayer game; identified by a room code.
- **Ad Slot** — a reserved, sandboxed placement fed by Google AdSense; degrades to a no-op house ad when AdSense is unavailable.

## Current Decisions
- **D1 — Self-hosted games.** All game code lives in this repo under `games/<slug>/`. No third-party gameplay embeds. (2026-07-06)
- **D2 — Next.js full-stack on Vercel.** SSR for catalog/SEO, API routes for catalog/search/device-sync, Vercel hosting. (2026-07-06)
- **D3 — Anonymous + device-local persistence.** No accounts. Device identified by a cookie + localStorage device-id. Saves in IndexedDB. Data loss on browser-data clear is acceptable for v1. (2026-07-06)
- **D4 — Small-product scale target.** Hundreds of games, thousands of concurrent users. (2026-07-06)
- **D5 — Free + ads via Google AdSense.** Ad Slot component, degrades to house ad on fill failure / ad-block. (2026-07-06)
- **D6 — Repo-as-catalog.** Adding a game = commit `games/<slug>/` + manifest, then redeploy. No admin UI. (2026-07-06)
- **D7 — Desktop-first.** Responsive shell, but games target mouse/keyboard. Mobile-play is best-effort, not guaranteed. (2026-07-06)
- **D8 — Tags + free-text search.** Static catalog index built at build time; search runs client-side over the index. (2026-07-06)
- **D9 — One turn-based multiplayer game in v1.** Motto is single-player; multiplayer is one shipped example plus a clean seam for more. (2026-07-06)
- **D10 — Iframe sandbox per game.** Each Game loads in a sandboxed iframe; Site ↔ Game comms via postMessage Game Adapter. (2026-07-06)
- **D11 — PartyKit for multiplayer transport.** Serverless websockets for the v1 multiplayer game. (2026-07-06)
- **D12 — Mix of local + external games.** ~15 downloaded open-source/free HTML5 games in the repo + ~10 embedded from GameDistribution API. (2026-07-07)
- **D13 — GameDistribution as embed provider.** Free HTML5 game API with revenue-share ads. External Games load via GameDistribution embed URL. (2026-07-07)
- **D14 — Wrapper Page for external game saves.** External Games can't use postMessage (cross-domain). A Wrapper Page loads the embed in a nested iframe and provides partial saves (last-played, high-score capture via GameDistribution callbacks if available). (2026-07-07)
- **D15 — License permissive.** Downloaded games may not have clear licenses. Each manifest records a `license` field; the site operator accepts the risk of takedown requests. (2026-07-07)
- **D16 — Genres: racing, fighting, clicker, simulator.** ~25 games across these four genres. (2026-07-07)

## Invariants

### Performance budgets
- **INV-P1 — First Contentful Paint on Player Page ≤ 1.5s p75** on a cable connection (Vercel edge, warm cache). The game iframe `<script>` may stream after FCP.
- **INV-P2 — Catalog page TTFB ≤ 300ms p75** on Vercel edge (SSR, no DB).
- **INV-P3 — Client-side search returns ≤ 50ms p95** for ≤ 500-game catalog, cold.
- **INV-P4 — Game iframe boot (entry HTML → first paint) ≤ 2s p75** for the heaviest v1 game bundle (≤ 2 MB gzipped).
- **INV-P5 — PartyKit round-trip latency ≤ 120ms p95** for the multiplayer game on the same region.

### Failure modes
- **INV-F1 — AdSense down / blocked / unfilled.** Ad Slot must render a house ad (static SVG, no network) within 500ms of the slot being marked unfilled. No layout shift, no JS error.
- **INV-F2 — PartyKit room unreachable / disconnect.** Player Page must show a non-blocking "Reconnecting…" banner within 2s of the socket dropping, auto-retry with backoff (1s, 2s, 5s, 10s, then "Match ended"), and never lose already-rendered local game state.
- **INV-F3 — Game iframe crash / unresponsive.** Player Page must show a "Game not responding — reload" affordance if the iframe has not sent any postMessage within 5s of load or after a heartbeat timeout of 10s.
- **INV-F4 — IndexedDB unavailable (private mode / quota).** Save Slot writes must fail soft: log a console warning, surface a one-time toast "Saves disabled in this mode", and gameplay must continue unaffected.
- **INV-F5 — Catalog manifest invalid at build.** A game with a missing/invalid `game.json` must fail the build with a precise error naming the offending file, never silently ship a broken catalog.
- **INV-F6 — Vercel deploy region down.** Out of scope for v1 (single-region). Document as known limitation.

### Security & permission boundaries
- **INV-S1 — Game iframe sandbox.** Every game iframe runs with `sandbox="allow-scripts allow-pointer-lock"` and WITHOUT `allow-same-origin`. A game must not be able to read the Site's cookies, localStorage, or DOM.
- **INV-S2 — Game Adapter allowlist.** The Site's postMessage handler only accepts messages whose `origin` matches the deployed game origin and whose `type` is in a fixed allowlist (`READY`, `SAVE_WRITE`, `SAVE_READ_RESPONSE`, `GAME_OVER`, `HEARTBEAT`). Unknown types are dropped + logged.
- **INV-S3 — Ad Slot isolation.** AdSense script loads in its own sandboxed iframe; the Ad Slot must never have access to Save Slot, device-id, or Game Adapter channels.
- **INV-S4 — Device-id is opaque.** The device-id is a random UUIDv4, never derived from fingerprintable signals (IP, UA). It is treated as pseudonymous — never exposed to games or ads, only to the Game Adapter over the sandboxed channel.
- **INV-S5 — Save Slot namespacing.** Save Slot keys are namespaced `games/<slug>/saves/<slot>`; a game can only read/write its own namespace via the Game Adapter. Direct IndexedDB access from inside the sandboxed iframe is blocked by INV-S1.
- **INV-S6 — PartyKit authz.** A Multiplayer Room only accepts connections presenting a valid room code; room codes are unguessable (≥ 64 bits) and expire 30 minutes after creation. No cross-room message leakage.
- **INV-S7 — Content-Security-Policy.** Site CSP: default-src 'self'; script-src 'self' 'unsafe-inline' (game bundles need it) https://pagead2.googlesyndication.com; frame-src 'self' https://pagead2.googlesyndication.com; connect-src 'self' *.partykit.io. No `unsafe-eval`.

### Game catalog expansion invariants
- **INV-P6 — External game embed load ≤ 3s p75.** GameDistribution games may be heavier than local games. The Wrapper Page must show a loading state within 500ms, and the game must paint within 3s p75 or show a "Game taking long to load" notice.
- **INV-F7 — GameDistribution API down / slow.** If the embed URL fails to load within 5s, the Wrapper Page must show a friendly "This game is unavailable right now" message with a "Try another game" link. No blank screen.
- **INV-F8 — GameDistribution returns bad game / 404.** If the embed returns a 404 or error page, the Wrapper Page must detect it (via load timeout or error event) and show the same fallback as INV-F7.
- **INV-S8 — External game sandbox.** External game iframes get `sandbox="allow-scripts allow-same-origin"` (needed for GameDistribution to function). They are loaded in a nested iframe inside the Wrapper Page, which itself is sandboxed without `allow-same-origin`. The external game can never reach the Site's cookies, localStorage, or Game Adapter.
- **INV-S9 — GameDistribution script isolation.** The GameDistribution loader script runs inside the nested iframe only. It must never be loaded in the top-level Site document. CSP `frame-src` must include `https://html5.gamedistribution.com`.
- **INV-S10 — Wrapper Page save boundary.** The Wrapper Page can only save: (a) last-played timestamp, (b) high score if GameDistribution exposes it via a callback. The Wrapper Page must never save arbitrary state from the external game.
