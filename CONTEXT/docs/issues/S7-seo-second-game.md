# Issue S7 — SEO + a second real game

- **Status:** ready-for-agent
- **Blocked by:** S2, S3
- **Parent PRD:** `CONTEXT/docs/prd/0001-browser-games-v1.md`

## What to build

Polish the catalog for search engines and validate it scales to a second real game:

- SSR OpenGraph + Twitter Card meta on catalog, tag, and Player Pages.
- JSON-LD `VideoGame` structured data on every Player Page.
- `sitemap.xml` + `robots.txt` generated at build time from the catalog.
- Add one real (non-stub) single-player game to `games/` to validate the catalog scaling path.
- A 500-game search-perf regression test (generated fixture) wired into CI.

## Acceptance criteria

- [ ] Every Player Page renders valid OpenGraph tags + a JSON-LD `VideoGame` block with name, genre, description (stories 19, 24).
- [ ] `sitemap.xml` lists every game and tag page; `robots.txt` allows them.
- [ ] Adding the real second game requires no Site code change — manifest + bundle only (validates INV-F5, D6).
- [ ] Search perf regression test asserts ≤ 50ms p95 over a generated 500-game fixture in CI (INV-P3 enforced beyond S3).
- [ ] At least one Playwright test asserts SSR HTML (view-source) contains the OpenGraph + JSON-LD on a Player Page.

## Blocked by

- S2 (catalog browse, Game Card, tag pages).
- S3 (search index + search perf baseline).

## Verification-command

```
npm run build && npm run test:perf -- search --fixture=500 && npx playwright test --project=seo
```

Exits 0 when the build emits sitemap + per-page meta, the 500-game search-perf test passes (INV-P3), and the SEO Playwright suite passes.
