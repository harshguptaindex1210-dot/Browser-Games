# PRD — Browser-Games v1

- **Status:** ready-for-agent
- **Date:** 2026-07-06
- **Tracker:** GitHub issue tracker (repo: harshguptaindex1210-dot/Browser-Games). Filing pending `gh` install — see handoff blocker.
- **ADR:** `CONTEXT/docs/adr/0001-browser-games-v1-architecture.md`
- **Invariants:** `CONTEXT/CONTEXT.md` § Invariants (INV-P*, INV-F*, INV-S*)

## Problem Statement

As a casual web gamer, I want to open a website, pick from a catalog of HTML5 games, and play instantly in my browser without signing up — and have my progress remembered on this device next time — so that I can kill time with quick games and not lose my saves. As the site owner, I want to add new games by dropping a folder into the repo, so the catalog grows without an admin UI.

## Solution

A Next.js (App Router) site deployed on Vercel that renders a tag-based catalog with free-text search, and a Player Page that loads each game in a sandboxed iframe via a postMessage **Game Adapter**. Games are self-contained HTML5 bundles living under `games/<slug>/`, each with a `game.json` manifest. Play is anonymous; a device-id cookie + IndexedDB Save Slots persist progress per-device. One turn-based multiplayer game ships in v1 over PartyKit. Display ads run via Google AdSense in an isolated Ad Slot that degrades to a house ad.

## User Stories

1. As a visitor, I want to land on a homepage that shows featured/popular games, so that I can pick something to play immediately.
2. As a visitor, I want to browse games by tag (e.g., puzzle, action, arcade), so that I can find a genre I like.
3. As a visitor, I want to free-text search the catalog, so that I can find a named game or a tag quickly.
4. As a visitor, I want a game card to show title, thumbnail, tags, and controls (mouse/keyboard), so that I know what I'm clicking.
5. As a visitor, I want clicking a game card to open the Player Page and start the game, so that I can play with no friction.
6. As a player, I want my progress in a game to be saved on this device automatically, so that closing and reopening resumes where I left off.
7. As a player, I want my high scores to persist on this device, so that I can try to beat them.
8. As a player, I want a "recently played" row on the homepage, so that I can jump back into games I played.
9. As a player, I want a "favorites" list I can add/remove games to, so that I can find games I liked again.
10. As a player, I want to see a "Game not responding — reload" affordance if a game freezes, so that I'm never stuck.
11. As a player of the v1 multiplayer game, I want to create a room and share a code, so that a friend can join.
12. As a player of the v1 multiplayer game, I want to join a room by code, so that I can play with a friend.
13. As a player of the v1 multiplayer game, I want a "Reconnecting…" banner if my connection drops, so that I'm not confused by frozen state.
14. As a player, I want the site to work on my desktop browser with mouse/keyboard, so that the controls match the game.
15. As a player, I want to not be asked to sign up, so that I can play anonymously.
16. As a player, I want the site to feel fast (catalog opens instantly, game starts quickly), so that I don't bounce.
17. As a player, I want a share button on a game's page, so that I can send a game to a friend.
18. As a player, I want a "Saves disabled in this mode" toast if IndexedDB is unavailable (private mode), so that I understand why my progress isn't saving.
19. As the site owner, I want to add a game by creating `games/<slug>/` with the game bundle + `game.json`, so that it appears in the catalog after the next deploy.
20. As the site owner, I want a build to fail with a precise error if a game's manifest is invalid, so that I never ship a broken catalog.
21. As the site owner, I want the catalog index to be generated at build time, so that catalog pages are fast and SEO-friendly.
22. As the site owner, I want the Ad Slot to fall back to a house ad when AdSense is unfilled or blocked, so that the layout never breaks.
23. As the site owner, I want the v1 multiplayer game to expire rooms after 30 minutes, so that abandoned rooms don't leak.
24. As a search engine crawler, I want SSR catalog pages with proper meta + structured data, so that games are discoverable via Google.
25. As a player on a slow connection, I want the catalog shell to paint before the game iframe finishes loading, so that the site feels responsive.
26. As a player, I want to mute game audio from the site shell, so that I don't have to find the mute button inside each game.
27. As a player, I want a fullscreen button on the Player Page, so that I can immerse in a game.
28. As a player, I want the site's CSP to block unknown third-party scripts, so that a malicious game can't exfiltrate my data.

## Implementation Decisions

- **Stack:** Next.js (App Router) on Vercel. No database in v1.
- **Catalog:** Build-time step reads every `games/<slug>/game.json` and emits a static catalog index consumed by SSR catalog pages and a client-side search index.
- **Game Adapter (postMessage contract):** fixed message-type allowlist — `READY`, `HEARTBEAT`, `SAVE_WRITE`, `SAVE_READ_RESPONSE`, `GAME_OVER`, `SCORE`, `REQUEST_FULLSCREEN`, `AUDIO_MUTE`. Site→Game messages: `SAVE_READ`, `AUDIO_MUTE_CHANGED`, `FOCUS`. Origin-checked on both sides.
- **Sandbox:** every game iframe uses `sandbox="allow-scripts allow-pointer-lock"` (no `allow-same-origin`).
- **Device identity:** random UUIDv4 stored in a cookie (`__bg_did`, 1 year, SameSite=Lax) and mirrored in localStorage for resilience; opaque to games and ads.
- **Save Slots:** IndexedDB store `bg_saves` with keys `games/<slug>/saves/<slot>`; reads/writes only via Game Adapter. Fail-soft on unavailable.
- **Player Page:** loads game entry HTML in sandboxed iframe, opens Game Adapter channel, shows recently played + favorites above the iframe (from IndexedDB).
- **Multiplayer (v1, one game):** PartyKit room per match; room code ≥ 64 bits, 30-min expiry; room state is the source of truth, client predicts + reconciles.
- **Ad Slot:** isolated sandboxed iframe loading AdSense; on no-fill/blocked, renders a static SVG house ad; never shares channels with Game Adapter or Save Slots.
- **CSP:** `default-src 'self'; script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com; frame-src 'self' https://pagead2.googlesyndication.com; connect-src 'self' *.partykit.io`. No `unsafe-eval`.
- **Discovery:** tags (from manifest) + client-side full-text search over the static index (e.g., FlexSearch or Lunr — picked at implementation time).
- **SSR/SEO:** catalog pages, tag pages, and Player Page are SSR with OpenGraph + JSON-LD `VideoGame` per game.
- **Desktop-first:** layout responsive; games target mouse/keyboard; mobile play is best-effort.

## Testing Decisions

- **What makes a good test:** test external behavior through stable seams, never implementation details. Prefer one high seam over many.
- **Primary seam (highest):** the Game Adapter postMessage contract. Tests drive the Site by simulating a game iframe that emits the allowlisted messages, and assert the Site's observable behavior (Save Slot writes, recently-played update, score display, reconnect banner). This single seam covers catalog, player page, saves, ads fallback, and multiplayer client logic without touching game internals.
- **Secondary seam (only where the high seam can't reach):** PartyKit room logic is tested via a PartyKit in-process server (provided by `partykit` test utilities) — join/leave, room-code validation, 30-min expiry, no cross-room leakage.
- **Build-time seam:** catalog generation has a unit test that feeds it malformed/valid manifests and asserts the build fails precisely vs. emits the expected index.
- **Invariants as tests:** every INV-* in `CONTEXT/CONTEXT.md` is covered by at least one test (e.g., INV-P3 → search perf test with a 500-game fixture; INV-F1 → Ad Slot no-fill fallback; INV-S1 → iframe has no `allow-same-origin`; INV-S2 → unknown message type dropped + logged).
- **Prior art:** none — fresh repo. The test framework will be chosen in the first issue (Vitest + Playwright recommended for unit + e2e).
- **Out of scope for tests:** real AdSense fill, real PartyKit region latency, cross-browser private-mode matrix.

## Out of Scope

- Accounts, login, cross-device sync, cloud backup.
- Admin UI / CMS — adding a game is a commit.
- Mobile-optimized gameplay (responsive shell only).
- Multiple multiplayer games — one ships; the seam is left clean.
- Recommendation engine, play-history-based personalization.
- Payments, premium tier, subscriptions.
- Multi-region failover.
- Game ratings/comments/social features.
- Game authoring tooling or game-hosting SDK (the Game Adapter contract is documented, but no authoring helper ships in v1).

## Further Notes

- All invariants in `CONTEXT/CONTEXT.md` are acceptance constraints for this PRD; issues touching them restate the relevant invariant.
- ADR-0001 records the architectural decisions; supersede it before deviating.
- The PRD is intentionally one big effort; `/to-issues` will split it into tracer-bullet slices.
