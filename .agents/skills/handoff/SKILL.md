---
name: handoff
description: Compact the current Browser-Games session into a repo-local CONTEXT handoff, update the CONTEXT bundle, commit the changed CONTEXT and project artifacts, and push to GitHub. Use when the user asks for a handoff, when /part1, /part2, or /part3 finishes, or when another agent needs to continue from the current state.
---

# Handoff

Write a handoff document for the Browser-Games repo so a fresh agent can continue the work.

## Output Location

Always use the repo-local `CONTEXT/` folder. Do not create handoff or context files outside the Browser-Games repo root.

Write handoffs to `CONTEXT/handoffs/` using a clear timestamped filename:

```text
CONTEXT/handoffs/handoff-YYYY-MM-DD-HHMM.md
```

## Context Bundle

Keep all agent-readable context under `CONTEXT/`:

- `CONTEXT/AGENTS.md`
- `CONTEXT/CLAUDE.md`
- `CONTEXT/CONTEXT.md`
- `CONTEXT/CONTEXT-MAP.md`
- `CONTEXT/docs/agents/`
- `CONTEXT/docs/adr/`
- `CONTEXT/handoffs/`

If root-level `AGENTS.md`, `CLAUDE.md`, `CONTEXT.md`, `CONTEXT-MAP.md`, `docs/agents/`, or `docs/adr/` appear later, copy their useful content into the matching `CONTEXT/` path before updating context. Do not move or delete originals unless the user explicitly asks for cleanup.

## Handoff Contents

Include:

- Current objective and why it matters.
- Repository, branch, remote, and important paths.
- What changed in this session.
- Commands already run and their outcomes.
- What remains to do next.
- Known blockers, risks, or assumptions.
- Suggested skills for the next agent.

Do not duplicate large artifacts already captured elsewhere. Reference PRDs, plans, ADRs, issues, commits, and diffs by path, URL, or commit hash.

Redact API keys, passwords, tokens, credentials, secrets, and private personal data.

## Push

After writing the handoff:

1. Check git status and current branch from the Browser-Games repo root.
2. Stage only the files changed for this handoff or the completed task.
3. Commit with a concise message such as `docs: add agent handoff context`.
4. Push to the current branch's upstream.

Do not run destructive git commands, force-push, or commit secrets. If git credentials, network access, or upstream configuration blocks the push, leave the files on disk and report the exact recovery step.
