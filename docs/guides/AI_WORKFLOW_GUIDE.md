# AI Workflow Guide

> Standard workflow for every session on LeadGen GCC.

---

## The Golden Rule

**Check `docs/` BEFORE exploring files.** One reference doc = full context in 30 seconds.

---

## Three-Tier Doc System

| Type | Location | Update when |
|---|---|---|
| Dev checklist | `docs/TODO.md` | Mark `[x]` end of every session |
| Architecture snapshots | `docs/references/*.md` | Code structure changes (new files, schema, endpoints) |
| Product strategy + roadmap | `docs/PRODUCT_STRATEGY.md` | A whole phase/week completes |

---

## Starting a Session

```
"Read docs/README.md, then docs/references/[SUBSYSTEM]_REFERENCE.md
 and help me [specific task]"
```

If no reference doc exists yet for the subsystem — explore normally, then create one after.

---

## End of Session Ritual

1. Mark completed tasks `[x]` in `docs/TODO.md`
2. Create or update `docs/references/[SUBSYSTEM]_REFERENCE.md`
3. If a phase completes → update roadmap in `PRODUCT_STRATEGY.md`

### What NOT to update
- Reference files when only UI tweaks changed (no architecture change)
- PRODUCT_STRATEGY.md mid-feature (only on phase completion)

---

## When to Create a New Reference Doc

Create when a subsystem:
- Spans 3+ files
- Has been explained to AI more than once
- Has non-obvious rules or gotchas

Template: see `docs/guides/DOCUMENTATION_MAINTENANCE.md`

---

## What Belongs Where

| Content | Goes in |
|---|---|
| Critical rules, tech stack | `CLAUDE.md` |
| Subsystem architecture, file map, queries | `docs/references/` |
| Feature spec not yet built | `docs/todo/` |
| Pricing, GTM, scoring formula, roadmap | `docs/PRODUCT_STRATEGY.md` |
| Dev task checklist | `docs/TODO.md` |
