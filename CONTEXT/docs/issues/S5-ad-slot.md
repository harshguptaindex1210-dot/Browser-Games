# Issue S5 — Ad Slot (AdSense + house ad fallback)

- **Status:** ready-for-agent
- **Blocked by:** S1
- **Parent PRD:** `CONTEXT/docs/prd/0001-browser-games-v1.md`

## What to build

Add an isolated Ad Slot component:

- Sandboxed iframe loading Google AdSense (`https://pagead2.googlesyndication.com`).
- No-fill / blocked / ad-skipped detection; on no-fill, render a static SVG house ad (no network).
- Ad Slot is rendered on the Player Page above the game and on the homepage sidebar (positions TBD at impl, must not cause layout shift).
- AdSense script loads only after user consent cookie (basic GDPR-friendly gate) OR a documented default-on for v1 with a cookie-based opt-out — pick one and document in the issue.

## Acceptance criteria

- [ ] Ad Slot loads in its own sandboxed iframe; it never has access to Save Slots, device-id, or the Game Adapter channel (INV-S3).
- [ ] When AdSense is unfilled, blocked (ad-blocker), or fails to load within 500ms of slot-ready, the slot renders the static SVG house ad with no layout shift (INV-F1).
- [ ] CSP allows AdSense script/frame sources (INV-S7); no other third-party scripts are permitted.
- [ ] Ad Slot never reads or sends the device-id (INV-S4).
- [ ] At least one Playwright test simulates ad-block (blocked host) and asserts the house ad renders within 500ms with no CLS.
- [ ] At least one Vitest test asserts the Ad Slot iframe has no `allow-same-origin`.

## Blocked by

- #6