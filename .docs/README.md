# LeadGen GCC — Docs

> Check here first before exploring files.
> One reference doc read = full subsystem context in ~2k tokens.

---

## Reference Docs (Built Subsystems)

| Subsystem | File | Status |
|---|---|---|
| Auth & Session | [references/AUTH_SYSTEM_REFERENCE.md](references/AUTH_SYSTEM_REFERENCE.md) | ✅ Done |
| Onboarding + Settings | [references/ONBOARDING_REFERENCE.md](references/ONBOARDING_REFERENCE.md) | ✅ Done |
| Database Schema | [references/DATABASE_SCHEMA_REFERENCE.md](references/DATABASE_SCHEMA_REFERENCE.md) | ✅ Done — Phase 2 schema migrated |
| App Shell (Sidebar) | [references/APP_SHELL_REFERENCE.md](references/APP_SHELL_REFERENCE.md) | ✅ Done |
| ICP Generator + Campaign Wizard | — | ✅ Done — Session 5 |
| Google Maps + Scraping + Enrichment | — | Phase 2 |
| Company Profiles + Contacts | — | Phase 3 |
| Lead Scoring (ICP-driven) + Discover UI | — | Phase 4 |
| Email Generation | — | Phase 5 |
| Approval & Send | — | Phase 6 |
| Follow-Ups | — | Phase 7 |
| Analytics | — | Phase 8 |

---

## Platform Structure (Quick Reference)

```
Sidebar:
  Dashboard → Discover → My Leads → Outreach → Inbox
  Campaigns → Contacts → Analytics → Settings
```

```
Data layers:
  Layer 0: materials, icp_templates  — per-user config (what they sell, who they target)
  Layer 1: master_businesses         — platform-wide, shared, no userId
  Layer 2: user_leads, campaigns     — per-user pipeline (always scoped to userId)
```

---

## External Services (Phase 2)

| Service | Purpose | Env Var |
|---|---|---|
| Google Maps Places API | Business discovery | `GOOGLE_MAPS_API_KEY` |
| Anthropic Claude API | ICP generation + email writing + summaries | `ANTHROPIC_API_KEY` |
| Apify | Instagram profile scraping | `APIFY_API_TOKEN` |
| QStash (Upstash) | Background enrichment job queue | `QSTASH_TOKEN`, `QSTASH_CURRENT_SIGNING_KEY`, `QSTASH_NEXT_SIGNING_KEY` |
| Resend | Email sending | `RESEND_API_KEY` |

---

## Phase 2 Build Order

```
1. ✅ Schema migration (phase2_icp_enrichment_fields)
2. ✅ Install packages (cheerio, @upstash/qstash)
3. ✅ lib/services/icp-generator.ts   — AI generates ICP from user profile + materials
4. ✅ app/(dashboard)/campaigns/      — 4-step campaign creation wizard (ICP Builder UI)
5. → campaigns/_actions/discover.ts  ← NEXT — Google Maps → master_businesses → user_leads → QStash
6.   lib/services/qstash.ts          ← publish enrichment jobs
7.   app/api/enrich/[businessId]/    ← enrichment worker called by QStash
8.   lib/services/website-scraper.ts ← fetch + Cheerio signals
9.   lib/services/apify.ts           ← Instagram via Apify
10.  lib/scoring.ts                  ← ICP-driven score engine
11.  app/(dashboard)/discover/       ← scored leads UI
```

---

## Other Docs

| File | Purpose |
|---|---|
| [TODO.md](TODO.md) | Dev checklist — track progress |
| [PRODUCT_STRATEGY.md](PRODUCT_STRATEGY.md) | Platform vision, ICP Builder, scoring, pricing, GTM |
| [guides/AI_WORKFLOW_GUIDE.md](guides/AI_WORKFLOW_GUIDE.md) | How to use this doc system |
| [guides/CODE_DOCUMENTATION_STANDARDS.md](guides/CODE_DOCUMENTATION_STANDARDS.md) | Comment/JSDoc standards |
| [guides/DOCUMENTATION_MAINTENANCE.md](guides/DOCUMENTATION_MAINTENANCE.md) | Keeping docs clean |

---

## How to Start Any Session

```
"Read .docs/references/[SUBSYSTEM]_REFERENCE.md and help me [task]"
```

## End of Session Ritual

1. Mark completed tasks `[x]` in `.docs/TODO.md`
2. Create or update the reference doc for what was built
3. Update `PRODUCT_STRATEGY.md` if any product decisions were made
4. Update `README.md` table if a new reference doc was created

---

**Last updated:** 2026-03-31 (Session 5 — ICP Generator + Campaign Wizard done, Discovery next)
