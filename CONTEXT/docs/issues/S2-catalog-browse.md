# Issue S2 — Catalog browsing: tags + homepage rows

- **Status:** ready-for-agent
- **Blocked by:** S1
- **Parent PRD:** `CONTEXT/docs/prd/0001-browser-games-v1.md`

## What to build

Build catalog browsing on top of S1's foundation:

- Homepage with rows: Featured (curated flag in manifest) and Recently Played (from IndexedDB).
- Game Card component rendering title, thumbnail, tags, controls badge (mouse/keyboard), and a play affordance.
- Tag pages at `/tag/<tag>` listing every game whose manifest carries that tag.
- Tag navigation on the homepage (chip list of all tags).
- At least 3 stub games in `games/` so rows/pages have content.

## Acceptance criteria

- [ ] Homepage renders Featured and Recently Played rows; Recently Played populates from playing a game in the same device.
- [ ] Game Card shows title, thumbnail, tags, and controls badge; clicking opens the Player Page (S1 route).
- [ ] `/tag/<tag>` SSR page lists exactly the games carrying that tag.
- [ ] Tag chips on homepage navigate to the matching tag page.
- [ ] Catalog pages remain SSR; TTFB ≤ 300ms p75 on Vercel edge (INV-P2).
- [ ] Adding a third stub game (folder + manifest) requires no code change in the Site — it appears in the catalog after the next build (INV-F5 enforced).
- [ ] Catalog browsing has at least one Playwright e2e test per page (home, tag, card→player).

## Blocked by

- #6