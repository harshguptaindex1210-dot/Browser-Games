---
name: part3
description: Review-and-fix loop closer - read the latest handoff and diff, review the completed work against the PRD, issues, tests, invariants, and project docs, fix any defects test-first, verify the gate, then write and push a final handoff. Use when the user runs /part3, or wants to close a recently built issue with an independent review, fixes, and pushed context.
---

# /part3 - Review And Fix Loop Closer

Orchestrate the final quality loop after `/part2`. Review the latest work, fix what is broken, verify the gate, and leave the repo with a pushed handoff.

## Step 1 - Reconstruct The Work

Read:

1. The newest handoff in `CONTEXT/handoffs/`.
2. The issue that `/part2` claims was completed.
3. The relevant PRD, issue acceptance criteria, `Verification-command`, invariants in `CONTEXT/CONTEXT.md`, and ADRs in `CONTEXT/docs/adr/`.
4. The current git diff and recent commits.

State what you believe was completed, which gate command defines done, and what risks the latest handoff already called out.

If there is no completed issue to review, say so and stop.

## Step 2 - Review Against The Contract

Run an independent review. Prefer `code-review` when available; otherwise perform a code-review pass yourself. Lead with defects, regressions, missing tests, broken invariants, unclear boundaries, or mismatch with the issue.

Check:

- The implementation satisfies every acceptance criterion.
- The `Verification-command` is present and meaningful.
- Tests cover the behavior at the right seam.
- Failure modes match the locked invariants.
- Permission and data boundaries are enforced.
- The implementation did not introduce unrelated refactors or hidden scope.
- Documentation and handoff updates match the actual behavior.

If no issues are found, still run the gate command before closing.

## Step 3 - Fix Test-First

For each real defect:

1. Add or update a failing test that demonstrates the problem.
2. Make the smallest code change that fixes it.
3. Rerun the focused test.
4. Rerun the full gate command.

Use an iteration budget, default 5. If the budget is exhausted, stop and report the exact remaining failure.

Do not fix unrelated issues unless they block the gate or violate the selected issue's invariants. Record them as follow-ups instead.

## Step 4 - Close The Loop

When the gate is green, run `handoff` last. The handoff must record:

- Reviewed issue and artifacts.
- Review findings.
- Fixes made.
- Gate command and result.
- Remaining follow-ups.
- Whether the issue is now closed/ready to close.
- Next ready issue, if any.

Write final handoff and context updates under `CONTEXT/`, especially `CONTEXT/handoffs/`, `CONTEXT/CONTEXT.md`, `CONTEXT/docs/agents/`, and `CONTEXT/docs/adr/`. In this repo, `handoff` is expected to create/update the repo-local `CONTEXT/` bundle and push the handoff artifacts to GitHub when possible. `/part3` is not complete until the push succeeds, or until an auth/network blocker is reported with a recovery step.

## Rules

- Be stricter than `/part2`; this skill closes the loop.
- Prefer evidence from tests, diffs, and docs over author intent.
- Keep fixes scoped to the reviewed issue.
- Never commit secrets.
- End with a short summary: reviewed issue, fixes, gate result, pushed commit hash, and remote branch. If push failed, report the blocker.
