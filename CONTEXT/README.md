# CONTEXT

This folder is the canonical home for agent-readable project context.

Use this layout:

- `CONTEXT/AGENTS.md` - shared instructions for coding agents working in this repo.
- `CONTEXT/CLAUDE.md` - Claude-specific instructions, if needed.
- `CONTEXT/CONTEXT.md` - project domain model, glossary, invariants, and current decisions.
- `CONTEXT/CONTEXT-MAP.md` - map to multiple context files if the repo becomes multi-context.
- `CONTEXT/docs/agents/` - issue tracker, triage labels, and domain-doc configuration.
- `CONTEXT/docs/adr/` - architectural decision records.
- `CONTEXT/handoffs/` - session handoffs and next-agent pointer maps.

Do not create root-level context docs for new work unless a tool explicitly requires them. Prefer adding or updating files under `CONTEXT/`.
