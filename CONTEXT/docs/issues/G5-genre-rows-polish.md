# Issue G5 — Homepage genre rows + polish

- **Status:** ready-for-agent
- **Blocked by:** G3, G4
- **Parent PRD:** `CONTEXT/docs/prd/0002-game-catalog-expansion.md`

## What to build

Polish the homepage and catalog for 25 real games:

- Genre rows on the homepage: Racing, Fighting, Clicker, Simulator (each shows games matching that genre).
- Genre badges on game cards (small colored chip showing the genre).
- Genre navigation chips at the top (like the existing tag chips).
- Search works across all 25 games (local + external).
- Tag pages work for all 25 games.
- Full test pass: 42+ existing tests + new genre/search tests.

## Acceptance criteria

- [ ] Homepage shows 4 genre rows (Racing, Fighting, Clicker, Simulator) with games.
- [ ] Game cards show a genre badge.
- [ ] Genre chips navigate to a filtered view.
- [ ] Search returns results across all 25 games in ≤ 50ms p95 (INV-P3).
- [ ] Tag pages list all games matching a tag (local + external).
- [ ] All existing tests pass; new tests cover genre rows + genre badges.
- [ ] Full gate green: `npm run gate && npx playwright test`.

## Blocked by

- G3 (15 local games must be in the catalog)
- G4 (10 external games must be in the catalog)

## Verification-command

```
npm run gate && npx playwright test
```

Exits 0 when full gate + all e2e tests pass with 25 games in the catalog.
