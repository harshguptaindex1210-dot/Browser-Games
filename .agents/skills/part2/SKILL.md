---
name: part2
description: Implementation chain - read the project's docs, pick the next unblocked issue, build it test-first, red-team it against weird inputs, failure modes, and permission edges, then write and push a handoff. Use when the user runs /part2, or wants to implement the next ready issue and leave a pushed handoff.
---

# /part2 - Implementation Chain

Orchestrate the build-and-hand-off loop. Read the plan, pick the next ready issue, implement it test-first, red-team it, then hand off and push.

## Step 1 - Read Docs And Pick The Next Issue

Read, in roughly this order:

1. The newest handoff in `CONTEXT/handoffs/`, which usually names what is done and what starts next.
2. The project glossary, domain docs, and invariants in `CONTEXT/CONTEXT.md`.
3. The issue tracker config in `CONTEXT/docs/agents/` and GitHub issues, in order.
4. The relevant PRD, plans, and ADRs in `CONTEXT/docs/adr/`.

Pick the lowest-numbered issue that is not done and whose `Blocked-by` chain is satisfied. Determine done-ness from the newest handoff, git history, and tracker state. If the latest handoff names the next issue, trust it after verifying blockers.

State which issue you picked and why before building. If nothing is unblocked, say so and stop.

## Step 2 - Lock The Gate, Then Build Test-First

First, lock the done-condition gate. Translate the issue acceptance criteria plus `/part1` invariants into one command that must exit 0. If the issue has a `Verification-command`, use it. Done means this command passes.

Set an iteration budget, default 5. If the budget is exhausted, stop and report the blocking failure.

Run `tdd` to implement the chosen issue with red-green-refactor:

- Test at the highest meaningful seam.
- Fake external dependencies using established project patterns.
- Avoid testing vendor SDK internals or render details.
- Keep the existing suite green.
- Keep typecheck and lint clean when the repo has those gates.
- Respect glossary and ADR language.
- Do not fork or duplicate domain logic; existing services are the source of truth.

## Step 3 - Red-Team The Build

Before handing off, run a separate checker that did not write the code. Use a subagent when available, or run `code-review` over the diff. The checker must attack corners, not just repeat the happy path.

Cover:

- Weird inputs: empty, null, oversized, wrong-type, malformed, duplicate, unicode or injection-like values, out-of-range values, and concurrent requests.
- Failure modes: every dependency down, slow, rate-limited, or returning bad data as named by the invariants.
- Permission boundaries: wrong user, missing or expired token, forged token, privilege escalation, cross-tenant access, and trust-edge violations.

Verify the `/part1` invariants actually hold: latency budget, failure behavior, and security boundaries. Fix failures test-first. After each fix, rerun the gate command and rerun the checker pass. Loop maker to checker until the gate is green or the budget is exhausted.

Record honest follow-ups for gaps that are genuinely out of scope.

## Step 4 - Hand Off And Push

Run `handoff` last. The handoff must record:

- Issue completed.
- What changed.
- Gate command and result.
- What the red-team pass tried and found.
- Unfixed edge cases or follow-ups.
- Next ready issue.

Write handoff and context updates under `CONTEXT/`, especially `CONTEXT/handoffs/`, `CONTEXT/CONTEXT.md`, `CONTEXT/docs/agents/`, and `CONTEXT/docs/adr/`. In this repo, `handoff` is expected to create/update the repo-local `CONTEXT/` bundle and push the handoff artifacts to GitHub when possible. `/part2` is not complete until the push succeeds, or until an auth/network blocker is reported with a recovery step.

## Rules

- Finish each step before starting the next.
- Build only the selected issue.
- Do not call the issue done by judgment; use the gate command.
- Keep maker and checker roles separate where possible.
- Never commit secrets.
