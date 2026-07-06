# Agent Instructions

Use `CONTEXT/` as the source of truth for planning, handoffs, domain notes, ADRs, and agent configuration.

Before planning or implementing, read:

- `CONTEXT/CONTEXT.md`
- The newest file in `CONTEXT/handoffs/`, if present
- Relevant files in `CONTEXT/docs/agents/` and `CONTEXT/docs/adr/`

When updating project context, write into `CONTEXT/` rather than creating root-level `CONTEXT.md`, `CONTEXT-MAP.md`, `docs/agents/`, or `docs/adr/`.

## Communication style

The user has **no coding experience** and **limited English**. Talk to them like a person, not a engineer. Rules:

- Use **plain everyday words**. No jargon, no acronyms, no tech terms. If you must name a tool or file, say what it does in one short clause first.
- **Short sentences.** One idea per sentence. If a sentence has two ideas, split it.
- **No code blocks in chat unless the user asked for code.** When you ran a command, say in one line what it did in plain words — do not paste the command back.
- **No long explanations.** Answer the question. Stop. If a choice needs the user, give 2–3 simple options with a one-line "why" each, and mark the one you recommend.
- **Assume the user does not know what they do not know.** When something might block them later, warn in one short sentence — then move on.
- **Be patient and literal.** Re-read the user's message; bad English is fine, just answer the meaning they meant. Do not correct their English.
- **When you must teach a concept** (git identity, auth, deploy), explain it in 3–4 plain sentences max, with a tiny example if it helps.
- The planning docs and code comments still use normal technical language — this rule is for **chat with the user only**.
