---
name: part1
description: Planning chain - grill an effort against the project's docs, lock its invariants, turn it into a PRD, break it into dependency-ordered issues, then write and push a handoff. Runs grill-with-docs, invariant locking, to-prd, to-issues, and the push-capable handoff flow in sequence. Use when the user runs /part1, or wants to take a new effort, idea, feature, ADR, or spec from grilling through PRD, issues, and pushed handoff in one pass.
---

# /part1 - Planning Chain

Orchestrate the planning skills in order, carrying context forward through each step. This skill produces planning artifacts only; do not write application code.

## Before You Start

Confirm what effort you are planning. If the user named a feature, ADR, spec, or one-shot prompt, use that as the subject. If not, ask one question: "What effort am I grilling?"

Read the project's existing planning context before grilling: `CONTEXT/CONTEXT.md`, `CONTEXT/CONTEXT-MAP.md`, the newest handoff in `CONTEXT/handoffs/`, related plans, GitHub issues, and ADRs in `CONTEXT/docs/adr/`.

## Chain

1. Run `grill-with-docs`.
   Interview the user until the load-bearing decisions are resolved. Challenge the plan against the project's documented language and prior decisions. Update docs inline as terms and decisions resolve.

2. Lock invariants before writing the PRD.
   Make non-functional constraints explicit and write them into `CONTEXT/CONTEXT.md` as named, testable invariants. Cover at least:
   - Latency and performance budgets: concrete numbers, not "fast".
   - Failure modes: for each external dependency, what happens when it is down, slow, rate-limited, or returns bad data.
   - Security and permission boundaries: authz rules, trust edges, exposed data, and blast radius.

3. Run `to-prd`.
   Synthesize the grilled decisions and locked invariants into a PRD without re-interviewing. The PRD must state invariants as explicit acceptance constraints. Publish it using the project's issue tracker and "ready for agent" convention. Store repo-local planning context under `CONTEXT/`, not root-level context files.

4. Run `to-issues`.
   Break the PRD into dependency-ordered vertical tracer-bullet issues. Each issue touching an invariant must restate the relevant budget, failure mode, or boundary in acceptance criteria. Each issue must include a machine-checkable `Verification-command` that exits 0 exactly when the issue is complete.

5. Run `handoff`.
   Write a pointer-map handoff in `CONTEXT/handoffs/`: locked decisions, invariants, slice order, artifact paths, and the next issue to start. In this repo, `handoff` is expected to create/update the repo-local `CONTEXT/` bundle and push the handoff artifacts to GitHub when possible.

## Rules

- Run the steps sequentially; finish each before starting the next.
- Do not skip the invariants gate. If a latency budget, failure mode, or security boundary is unknown, resolve it with the user before `to-prd`.
- Stop and surface to the user if the effort needs a new ADR or if the issue breakdown is not approved.
- Every issue must ship a runnable `Verification-command`; an issue without one is not ready for `/part2`.
- Defer tracker format and labels to the underlying skills, but keep context docs in `CONTEXT/`: agent config in `CONTEXT/docs/agents/`, ADRs in `CONTEXT/docs/adr/`, and handoffs in `CONTEXT/handoffs/`.
- End with a short summary: PRD location, issue range, pushed commit hash, and remote branch. If push failed, report the blocker and recovery step.
