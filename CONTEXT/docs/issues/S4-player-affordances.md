# Issue S4 — Player Page affordances: favorites, share, mute, fullscreen

- **Status:** ready-for-agent
- **Blocked by:** S1
- **Parent PRD:** `CONTEXT/docs/prd/0001-browser-games-v1.md`

## What to build

Add four Player Page affordances, all wired through the Game Adapter so games stay sandboxed:

- **Favorites:** add/remove a game to a per-device favorites list (IndexedDB); favorites row on the homepage.
- **Share:** button that copies the Player Page URL to clipboard; native share sheet on supported browsers.
- **Audio mute:** site-shell mute toggle that sends `AUDIO_MUTE_CHANGED` to the game iframe; remembers preference per-device.
- **Fullscreen:** button that calls the Fullscreen API on the iframe wrapper and forwards `REQUEST_FULLSCREEN` from the game.

## Acceptance criteria

- [ ] Favorites list persists per-device (IndexedDB, `games/_meta/favorites` namespace) and renders as a homepage row.
- [ ] Share button copies the current Player Page URL to clipboard; on share-sheet-capable browsers it invokes `navigator.share`.
- [ ] Audio mute toggle sends `AUDIO_MUTE_CHANGED` to the game iframe and persists the preference per-device.
- [ ] Fullscreen button enters/exits fullscreen on the iframe wrapper; `REQUEST_FULLSCREEN` from the game is honored only after a user gesture (browser policy).
- [ ] All four affordances communicate ONLY over the Game Adapter allowlist (INV-S2); no direct DOM access from the iframe (INV-S1).
- [ ] At least one Playwright test per affordance (favorite toggle persists, share copies URL, mute toggles state, fullscreen enters).

## Blocked by

- #6