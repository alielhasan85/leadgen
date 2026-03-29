# LeadGen GCC — Docs

> Check here first before exploring files.
> One reference doc read = full subsystem context in ~2k tokens.

---

## Reference Docs (Built Subsystems)

| Subsystem | File | Status |
|---|---|---|
| Auth & Session | [references/AUTH_SYSTEM_REFERENCE.md](references/AUTH_SYSTEM_REFERENCE.md) | ✅ Done |
| Onboarding Wizard | [references/ONBOARDING_REFERENCE.md](references/ONBOARDING_REFERENCE.md) | ✅ Done |
| Database Schema | [references/DATABASE_SCHEMA_REFERENCE.md](references/DATABASE_SCHEMA_REFERENCE.md) | ✅ Done |
| Lead Discovery | — | Phase 2 |
| Lead Scoring | — | Phase 3 |
| Email Generation | — | Phase 5 |
| Approval & Send | — | Phase 6 |
| Pipeline Dashboard | — | Phase 4 |
| Analytics | — | Phase 8 |

---

## Feature Specs (Not Yet Built)

| Feature | File |
|---|---|
| Google Maps + scraping | [todo/LEAD_DISCOVERY.md](todo/LEAD_DISCOVERY.md) |
| Lead scoring engine | [todo/LEAD_SCORING.md](todo/LEAD_SCORING.md) |
| Claude email generation | [todo/EMAIL_GENERATION.md](todo/EMAIL_GENERATION.md) |
| Campaign flow | [todo/CAMPAIGNS.md](todo/CAMPAIGNS.md) |

---

## Other Docs

| File | Purpose |
|---|---|
| [TODO.md](TODO.md) | Dev checklist — track progress |
| [PRODUCT_STRATEGY.md](PRODUCT_STRATEGY.md) | Scoring formula, pricing, GTM, roadmap |
| [guides/AI_WORKFLOW_GUIDE.md](guides/AI_WORKFLOW_GUIDE.md) | How to use this doc system |
| [guides/CODE_DOCUMENTATION_STANDARDS.md](guides/CODE_DOCUMENTATION_STANDARDS.md) | Comment/JSDoc standards |
| [guides/DOCUMENTATION_MAINTENANCE.md](guides/DOCUMENTATION_MAINTENANCE.md) | Keeping docs clean |

---

## How to Start Any Session

```
"Read docs/references/[SUBSYSTEM]_REFERENCE.md and help me [task]"
```

## End of Session Ritual

1. Mark completed tasks `[x]` in `docs/TODO.md`
2. Create or update the reference doc for what was built
3. If a whole phase completes, update `PRODUCT_STRATEGY.md` roadmap

---

**Last updated:** 2026-03-29
