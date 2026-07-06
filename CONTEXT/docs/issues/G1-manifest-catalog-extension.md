# Issue G1 — Manifest + catalog extension for external games

- **Status:** ready-for-agent
- **Blocked by:** S1 (#6, done)
- **Parent PRD:** `CONTEXT/docs/prd/0002-game-catalog-expansion.md`
- **ADR:** `CONTEXT/docs/adr/0002-game-catalog-expansion.md`

## What to build

Extend the catalog to support two game types — Local and External — in one unified index:

- Add `source: "local" | "external"` field to the manifest schema (default `"local"` for backward compat).
- Add `embedUrl?: string` (required when `source: "external"`).
- Add `license?: string` and `genre?: string` fields.
- Update `validateManifest` to require `embedUrl` when `source: "external"`, and validate `genre` is one of the allowed values.
- Update the catalog generator to emit the `source` field on each catalog entry.
- Update CSP in `next.config.ts` to add `https://html5.gamedistribution.com` to `frame-src`.
- Add one test external game manifest (`games/_test-external/game.json` with `source: "external"`) to prove the path. Remove it before merging or keep it as a fixture.
- All existing S1 tests must continue to pass.

## Acceptance criteria

- [ ] Manifest schema supports `source`, `embedUrl`, `license`, `genre` fields.
- [ ] `validateManifest` rejects external manifests missing `embedUrl` with a precise error (INV-F5).
- [ ] `validateManifest` rejects invalid `genre` values.
- [ ] Catalog generator emits `source` on each entry; local games still work unchanged.
- [ ] CSP includes `https://html5.gamedistribution.com` in `frame-src` (INV-S9).
- [ ] Existing S1 tests pass; new tests cover external manifest validation + catalog generation.
- [ ] Build passes with both local and external game manifests in `games/`.

## Blocked by

- S1 (#6, done)

## Verification-command

```
npm run gate
```

Exits 0 when lint, unit tests (including new external manifest tests), and build pass.
