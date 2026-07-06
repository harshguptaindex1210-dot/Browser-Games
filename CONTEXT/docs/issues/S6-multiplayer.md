# Issue S6 — Multiplayer game via PartyKit

- **Status:** ready-for-agent
- **Blocked by:** S1
- **Parent PRD:** `CONTEXT/docs/prd/0001-browser-games-v1.md`

## What to build

Ship one turn-based multiplayer game using PartyKit:

- One multiplayer game under `games/<slug>/` whose manifest sets `multiplayer: true` and declares its PartyKit room.
- "Create room" flow returns a room code ≥ 64 bits (URL-safe); "Join" flow accepts a code.
- PartyKit room is the source of truth for game state; clients predict locally and reconcile on server update.
- Reconnect: "Reconnecting…" banner within 2s of socket drop; backoff 1s, 2s, 5s, 10s; then "Match ended".
- Room expiry: rooms expire 30 minutes after creation; expired rooms reject joins with a clear message.

## Acceptance criteria

- [ ] Creating a room returns a code with ≥ 64 bits of entropy; guessing is infeasible (INV-S6).
- [ ] A connection presenting no/invalid room code is rejected by the PartyKit room (INV-S6).
- [ ] A message sent in room A is never delivered to room B (no cross-room leakage) (INV-S6).
- [ ] Rooms older than 30 minutes reject join/create-rejoin (INV-S6, story 23).
- [ ] On socket drop, the Player Page shows "Reconnecting…" within 2s, retries on the documented backoff, and never loses already-rendered local game state (INV-F2).
- [ ] Round-trip latency for a turn action ≤ 120ms p95 same-region (INV-P5).
- [ ] The multiplayer game runs in the same sandboxed iframe as single-player games; it reaches PartyKit only via the Game Adapter + the documented `connect-src *.partykit.io` in CSP (INV-S1, INV-S7).
- [ ] At least one PartyKit in-process test covers create/join/leave/expiry/no-leak; one Playwright test covers the reconnect banner.

## Blocked by

- #6