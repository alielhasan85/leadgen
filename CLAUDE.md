# LeadGen GCC — Claude Code Context
> Last updated: 2026-03-29 | Status: MVP In Development
> **Start here:** Read `.docs/README.md` for the full reference system.

---

## What This Is

AI-powered B2B lead generation SaaS for GCC markets. Finds local businesses via Google Maps,
scores them for relevance to the user's product, writes personalized outreach emails using the
user's own marketing materials, and manages the full sales pipeline — with the user approving
every email before it sends.

**Primary use case:** Menumize (Ali's restaurant QR-menu SaaS in Qatar) uses this internally
to find Doha restaurants that don't yet have a digital menu and approach them automatically.

**SaaS potential:** Any GCC B2B business (agencies, CCTV, food suppliers) can use this once
the core loop is proven. GCC is underserved — no Arabic-first, region-aware competitor exists.

---

## Hard Rules — Never Break These

```
1. Every send checks status === 'approved' — no exceptions, ever
2. Every Layer 2 query must include where: { userId } — no exceptions
3. master_businesses is NEVER scoped to userId — it is platform-wide
4. business_contacts are per-user — never shared across users
5. Never auto-send — follow-ups generate as 'pending_approval'
6. Soft delete only — never prisma.X.delete()
7. Scores live in user_leads — never stored in master_businesses
```

---

## Data Architecture (Three Layers)

```
Layer 1 — master_businesses (platform-wide, shared)
  Public GCC business data. Discovered once, served to all users.
  No userId. Never filtered by user.
  Fields: Google Maps data, website signals, Instagram signals, logoUrl

Layer 2a — business_contacts (per-user, multiple per company)  ← PLANNED
  People at a company that this user has discovered or added.
  userId + masterBusinessId. Private — never shared.
  Fields: name, email, phone, title/designation, source, isPrimary

Layer 2b — user_leads (per-user pipeline relationship)
  This user's pipeline status with a specific company.
  userId + masterBusinessId. Score + status + all emails/followups.

Rule: Same company → different contacts for different users (private discovery)
Rule: Same company → different scores for different users (sector-specific scoring)
```

---

## Platform Structure (Sidebar)

```
Dashboard       — overview, hot leads, pending approvals, amber banners
Discover        — search sector + city → scored leads with summary cards
My Leads        — full CRM list, filters, lead detail drawer + company profile
Outreach        — approval queue, sent history, follow-up queue
Inbox           — replies, conversation threads (future)
Campaigns       — named search runs, performance per campaign
Contacts        — imported CRM CSV, deduplication
Analytics       — reply rate, open rate, best subject lines (future)
Settings        — business profile, materials, email setup, billing, team
```

---

## Tech Stack

```
Framework:  Next.js 16 App Router + TypeScript
UI:         shadcn/ui + Tailwind CSS v4 (no inline styles)
Database:   Neon PostgreSQL (Frankfurt) + Prisma 7
Auth:       Auth.js v5 (next-auth@beta)
AI:         Claude API — claude-sonnet-4-20250514
Maps:       Google Places API (Text Search + Place Details)
Scraping:   Puppeteer (website signals, logo, contact email)
Social:     Direct HTTP MVP → RapidAPI at scale
Email:      Resend
Parsing:    pdf-parse (PDF) + mammoth (DOCX) + ExcelJS (CSV)
Cron:       Vercel Cron (follow-up scheduling)
Hosting:    Vercel
```

---

## Code Architecture — Feature-First

Every feature is self-contained in its route folder. Code only moves to `/lib` if 2+ features use it.

```
Feature code  → lives with the feature route
  _actions/   → Server Actions for that feature only   (mutations)
  _components/ → UI components for that feature only
  _queries/   → DB reads for that feature only

Shared code   → lives in /lib (truly shared only)
  lib/db.ts          → Prisma client singleton
  lib/file-parser.ts → PDF/DOCX/TXT parsing (used by 2+ features)
  lib/utils.ts       → tiny helpers (cn, etc.)
  lib/auth/          → auth utilities (subscription, etc.)
  lib/services/      → external API wrappers (Claude, Google Maps, Resend, Instagram)
  lib/scoring.ts     → lead scoring engine (used by multiple features)

API Routes    → only for external callers
  /api/auth/  → Auth.js handler
  /api/cron/  → Vercel cron jobs
  /api/track/ → open-tracking pixel
  /api/webhooks/ → Resend reply webhook
```

**Rule:** If a Server Action can handle it, never create an API route for it.

**Every Server Action must:**
1. Call `auth()` and verify session
2. Scope all DB queries to `session.user.id`
3. Call `revalidatePath()` after mutations that affect the UI

## Coding Rules

- **UI:** shadcn/ui components first — Button, Input, Card, Dialog, Sheet, Tabs, Select, Badge, Table, Skeleton, Sonner
- **RTL:** `dir="rtl"` on containers for Arabic; Tailwind `rtl:` variant for mirrored layouts
- **Rate limit:** max 50 emails/hour per user
- **AI:** always use `claude-sonnet-4-20250514` — never call Anthropic API directly, use `lib/services/claude.ts`

---

## Project Reference Docs

Full architecture, schemas, and feature specs live in `docs/`:

```
docs/
├── README.md                    ← Index — start here each session
├── TODO.md                      ← Dev checklist — track progress here
├── PRODUCT_STRATEGY.md          ← Platform vision, scoring, pricing, GTM, roadmap
├── references/
│   ├── AUTH_SYSTEM_REFERENCE.md
│   ├── ONBOARDING_REFERENCE.md
│   └── DATABASE_SCHEMA_REFERENCE.md
├── guides/
│   ├── AI_WORKFLOW_GUIDE.md
│   ├── CODE_DOCUMENTATION_STANDARDS.md
│   └── DOCUMENTATION_MAINTENANCE.md
└── todo/                        ← Feature specs not yet started
```

**How to use:** At the start of any session working on a specific subsystem:
```
"Read docs/references/[SUBSYSTEM]_REFERENCE.md and help me [task]"
```


