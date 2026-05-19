# evidence-audit

A Claude Code plugin that applies forensic evidentiary discipline to historical and genealogical case files. Built from the Terminel-Sagasta audit; reusable for any case where the boundary between verified primary evidence and AI-generated synthesis matters.

## What's in the plugin

| Component | Path | Purpose |
|---|---|---|
| Skill | `skills/evidence-discipline/SKILL.md` | Encodes the audit's evidentiary categories and hard rules so Claude applies them automatically in case-file work. |
| Command | `commands/audit-doc.md` | `/audit-doc <name>` — runs a structured intake on a document and emits a classification block. |
| Agent | `agents/archive-researcher.md` | Subagent that searches named primary-source archives and returns structured findings only — never synthesis. |
| Hook | `hooks/hooks.json` | `PreToolUse` warning when an edit target references material flagged as fabricated. |

## Install

From the repo root:

```
claude --plugin-dir ./evidence-audit
```

Or install into a project's `.claude/` directly:

```
cp -r evidence-audit ~/.claude/plugins/
```

## Testing

After loading the plugin:

- `/audit-doc test-document.pdf` — should walk you through the intake and emit a classification block.
- Ask Claude "is this verified?" about an AI-generated document — the `evidence-discipline` skill should activate and produce a category lower than `verified`.
- Run `/agents` — `archive-researcher` should appear.
- Edit a file containing the literal string `Wells Fargo Sonora` — the hook should print a stderr warning before the write.

## Hard rules (summary)

1. Never treat AI-generated transaction records, dollar figures, or named-employee references as primary evidence.
2. Never produce new documents that cite fabricated source material.
3. Unclear provenance defaults to `partial` — never upgrade by guessing.
4. AI-assisted documents must carry provenance metadata (model, prompt date, reviewer).
5. "Probable" is not "verified." Each genealogical link needs a named primary source.

See `skills/evidence-discipline/SKILL.md` for the full ruleset.
