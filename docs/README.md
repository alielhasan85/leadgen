# LeadGen GCC — Docs

> Check here first before exploring files.
> One reference doc read = full subsystem context in ~2k tokens.

---

## Reference Docs (Built Subsystems)

| Subsystem | File | Status |
|---|---|---|
| Auth & Session | [references/AUTH_SYSTEM_REFERENCE.md](references/AUTH_SYSTEM_REFERENCE.md) | ✅ Done |
| Onboarding + Settings | [references/ONBOARDING_REFERENCE.md](references/ONBOARDING_REFERENCE.md) | ✅ Done |
| Database Schema | [references/DATABASE_SCHEMA_REFERENCE.md](references/DATABASE_SCHEMA_REFERENCE.md) | ✅ Done |
| App Shell (Sidebar) | [references/APP_SHELL_REFERENCE.md](references/APP_SHELL_REFERENCE.md) | ✅ Done |
| Google Maps + Scraping | — | Phase 2 |
| Company Profiles + Contacts | — | Phase 3 |
| Lead Scoring + Summary Cards | — | Phase 4 |
| Email Generation | — | Phase 5 |
| Approval & Send | — | Phase 6 |
| Follow-Ups | — | Phase 7 |
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

## Platform Structure (Quick Reference)

```
Sidebar:
  Dashboard → Discover → My Leads → Outreach → Inbox
  Campaigns → Contacts → Analytics → Settings
```

```
Data layers:
  Layer 1: master_businesses     — platform-wide, shared, no userId
  Layer 2a: business_contacts    — per-user, multiple per company (PLANNED)
  Layer 2b: user_leads           — per-user pipeline relationship
```

---

## Other Docs

| File | Purpose |
|---|---|
| [TODO.md](TODO.md) | Dev checklist — track progress |
| [PRODUCT_STRATEGY.md](PRODUCT_STRATEGY.md) | Platform vision, scoring, pricing, GTM, roadmap |
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
3. Update `PRODUCT_STRATEGY.md` if any product decisions were made
4. Update `README.md` table if a new reference doc was created

---

**Last updated:** 2026-03-29 (Session 3)
