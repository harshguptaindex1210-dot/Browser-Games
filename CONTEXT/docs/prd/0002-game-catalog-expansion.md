# PRD — Game Catalog Expansion (Racing, Fighting, Clicker, Simulator)

- **Status:** ready-for-agent
- **Date:** 2026-07-07
- **Tracker:** GitHub issue tracker (repo: harshguptaindex1210-dot/Browser-Games)
- **ADR:** `CONTEXT/docs/adr/0002-game-catalog-expansion.md`
- **Invariants:** `CONTEXT/CONTEXT.md` § Invariants (existing INV-* + new INV-P6, INV-F7, INV-F8, INV-S8, INV-S9, INV-S10)

## Problem Statement
As a casual gamer visiting Browser-Games, I want to play real racing, fighting, clicker, and simulator games — not just stubs — so that the site feels like a smaller CrazyGames and I keep coming back. As the site owner, I want to add games quickly by mixing downloaded free games with embedded GameDistribution games, so I get to ~25 games without spending weeks sourcing and testing every one.

## Solution
Extend the existing catalog to support two game types — **Local Games** (downloaded, in-repo) and **External Games** (embedded from GameDistribution) — behind one unified browse/search/tag experience. Add a Wrapper Page for external games that provides partial saves and graceful failure handling. Source ~15 free HTML5 games for the repo and ~10 from GameDistribution across four genres: racing, fighting, clicker, simulator. Update the catalog generator, manifest schema, Player Page, CSP, and tests.

## User Stories

1. As a visitor, I want to see ~25 real games (not stubs) in the catalog, so that the site feels like a real game portal.
2. As a visitor, I want to browse racing games, so that I can find car/motorcycle games quickly.
3. As a visitor, I want to browse fighting games, so that I can find combat games quickly.
4. As a visitor, I want to browse clicker games, so that I can find idle/incremental games.
5. As a visitor, I want to browse simulator games, so that I can find simulation experiences.
6. As a visitor, I want clicking an external game to open a Wrapper Page that loads the game from GameDistribution, so that I can play it without leaving the site.
7. As a visitor, I want a loading indicator while an external game loads, so that I know something is happening.
8. As a visitor, I want a friendly "This game is unavailable right now" message if an external game fails to load, so that I'm not stuck on a blank screen.
9. As a visitor, I want my last-played timestamp saved for external games, so that they appear in my recently-played row.
10. As a visitor, I want high scores saved for external games when available, so that I can try to beat them.
11. As a visitor, I want local games to keep working exactly as before, so that the catalog expansion doesn't break existing games.
12. As a visitor, I want the same tag/search experience across both game types, so that I don't notice the difference between local and external games.
13. As the site owner, I want to add a local game by dropping a folder + manifest into `games/`, so that it appears in the catalog after the next deploy.
14. As the site owner, I want to add an external game by adding a manifest with `source: "external"` and an embed URL, so that it appears in the catalog without downloading game files.
15. As the site owner, I want the manifest to record the license of each downloaded game, so that I have a reference for takedown requests.
16. As the site owner, I want the build to fail if an external game manifest is missing the embed URL, so that broken entries never ship.
17. As a visitor, I want the site's CSP to still block unknown third-party scripts, so that embedded games can't compromise my data.
18. As a visitor, I want external game iframes isolated from the Site's cookies and storage, so that GameDistribution scripts can't read my device-id.
19. As a visitor, I want to see genre badges on game cards, so that I can tell what type of game it is at a glance.
20. As a visitor, I want the homepage to show genre rows (Racing, Fighting, Clicker, Simulator), so that I can jump straight to the genre I want.

## Implementation Decisions

- **Manifest schema extension:** add `source: "local" | "external"` (default `"local"`), `embedUrl?: string` (required when `source: "external"`), `license?: string` (for local games). Existing manifests without `source` default to `"local"` — backward compatible.
- **Catalog generator:** reads both types; validates that external manifests have `embedUrl`; emits unified `catalog.json` with the `source` field on each entry.
- **Wrapper Page:** new route `/play/[slug]` already exists — for external games, it renders a `ExternalGamePlayer` component instead of `GamePlayer`. The ExternalGamePlayer loads the embed URL in a nested iframe with `sandbox="allow-scripts allow-same-origin"`, shows a loading state, handles timeout (5s → fallback), saves last-played to IndexedDB, and captures high scores if GameDistribution exposes a callback.
- **Sandbox model:**
  - Local games: `sandbox="allow-scripts allow-pointer-lock"` (no `allow-same-origin`). Unchanged.
  - External games: the Wrapper Page (top-level) has no iframe itself; it renders a container div with a nested iframe `sandbox="allow-scripts allow-same-origin"` pointing at GameDistribution. The external game cannot reach the Site's DOM because it's in a different origin.
- **CSP update:** add `https://html5.gamedistribution.com` to `frame-src`. No change to `script-src` (GameDistribution script loads inside the iframe, not the top document).
- **Game sourcing (out of code scope):** the ~15 local games will be free HTML5 games downloaded from open-source repos / free game packs. The ~10 external games will be picked from GameDistribution's catalog. This PRD covers the code infrastructure; actual game files are added as data in the same issues.
- **Genres:** add `genre` field to manifest (separate from `tags`) — one of `racing`, `fighting`, `clicker`, `simulator`, `arcade`, `action`, `puzzle`, `strategy`. Homepage shows genre rows.

## Testing Decisions

- **Primary seam:** the catalog generator — test that it handles both `source: "local"` and `source: "external"` manifests, validates `embedUrl` for external, and emits a unified index.
- **Secondary seam:** the ExternalGamePlayer component — test that it renders a loading state, handles timeout (INV-F7), and saves last-played to IndexedDB.
- **Invariants as tests:** INV-F7 (API down fallback), INV-F8 (404 fallback), INV-S8 (external sandbox), INV-S9 (GD script isolation), INV-S10 (wrapper save boundary).
- **Existing tests:** all S1 tests must continue to pass. No regressions.

## Out of Scope

- Mobile touch controls for new games (desktop-first, D7).
- Building games from scratch — all games are sourced externally.
- Game authoring SDK or helper.
- Multiplayer for new games (S6 scope).
- Ad revenue optimization for GameDistribution games.
- Game rating/comment system.
- User accounts or cloud saves.

## Further Notes
- ADR-0002 records the local+external architecture decision.
- The actual game sourcing (finding 15 free games, picking 10 from GameDistribution) is part of the implementation issues, not a separate effort.
- This PRD builds on the S1 foundation; it does not re-litigate decisions D1–D11.
