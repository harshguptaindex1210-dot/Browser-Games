# Issue S3 — Free-text search

- **Status:** ready-for-agent
- **Blocked by:** S2
- **Parent PRD:** `CONTEXT/docs/prd/0001-browser-games-v1.md`

## What to build

Add client-side free-text search over the catalog:

- Build-time emission of a search index from the catalog (titles, tags, slugs, descriptions).
- Search bar in the site shell; results page at `/search?q=<query>` (SSR shell, client-rendered results).
- Search engine chosen at implementation time (FlexSearch or Lunr recommended — pick one).

## Acceptance criteria

- [ ] Typing a query returns matching games ranked by relevance across title/tag/description.
- [ ] Search returns results in ≤ 50ms p95 for a 500-game fixture (INV-P3). The fixture is generated for the perf test only.
- [ ] Empty query shows all games; no-match shows a friendly empty state.
- [ ] Search index is built at build time and shipped as a static asset (no runtime catalog scan).
- [ ] At least one Vitest test asserts result ordering for a known fixture; one Playwright test asserts the search UX end-to-end.

## Blocked by

- S2 (catalog + Game Card must exist to render results).

## Verification-command

```
npm run build && npm run test -- --run search && npm run test:perf -- search
```

Exits 0 when the build ships the search index, search unit tests pass, and the search perf test asserts ≤50ms p95 over the 500-game fixture (INV-P3).
