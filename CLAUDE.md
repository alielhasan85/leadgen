# LeadGen GCC — Claude Code Context
> Last updated: 2026-03-29 | Status: MVP In Development
> **Start here:** Read `docs/README.md` for the full reference system.

---

## What This Is

AI-powered B2B lead generation SaaS for GCC markets. Finds local businesses via Google Maps, scores them, writes personalized outreach emails using the user's marketing materials, and manages the full pipeline — with the user approving every email before it sends.

**Built for Menumize first** (Ali's restaurant SaaS in Qatar), then opened to other B2B businesses.

---

## Hard Rules — Never Break These

```
1. Every send checks status === 'approved' — no exceptions, ever
2. Every user_leads query must include where: { userId } — no exceptions
3. master_businesses is NEVER scoped to userId — it is platform-wide
4. Never auto-send — follow-ups generate as 'pending_approval'
5. Soft delete only — never prisma.X.delete()
6. Scores live in user_leads — never stored in master_businesses
```

---

## Two-Layer Architecture (Core Design)

```
Layer 1 — master_businesses (platform-wide, shared)
  Public GCC business data. Discovered once, served to all users.
  No userId. Never filtered by user.

Layer 2 — user_leads (private, per-user)
  Each user's relationship with a business.
  Always scoped to userId. Never visible to other users.
  Score calculated per user from Layer 1 data.
```

Same business → different scores for different users (Menumize scores "no digital menu" high; CCTV company scores it low).

---

## Tech Stack

```
Framework:  Next.js 16 App Router + TypeScript
UI:         shadcn/ui + Tailwind CSS v4 (no inline styles)
Database:   Neon PostgreSQL (Frankfurt) + Prisma 7
Auth:       Auth.js v5 (next-auth@beta)
AI:         Claude API — claude-sonnet-4-20250514
Maps:       Google Places API (Text Search + Place Details)
Scraping:   Puppeteer (website signals)
Social:     Direct HTTP MVP → RapidAPI at scale
Email:      Resend
Parsing:    pdf-parse (PDF) + mammoth (DOCX) + ExcelJS (CSV)
Cron:       Vercel Cron (follow-up scheduling)
Hosting:    Vercel
```

---

## Coding Rules

- **UI:** shadcn/ui components first — Button, Input, Card, Dialog, Sheet, Tabs, Select, Badge, Table, Skeleton, Sonner
- **RTL:** `dir="rtl"` on containers for Arabic; Tailwind `rtl:` variant for mirrored layouts
- **DB reads:** always in `lib/queries/` — never call Prisma directly in pages/components
- **DB writes:** always in `lib/actions/` as Server Actions
- **Rate limit:** max 50 emails/hour per user
- **AI:** always use `claude-sonnet-4-20250514` — never call Anthropic API directly, use `lib/claude.ts`

---

## Project Reference Docs

Full architecture, schemas, and feature specs live in `docs/`:

```
docs/
├── README.md                    ← Index — start here each session
├── TODO.md                      ← Dev checklist — track progress here
├── PRODUCT_STRATEGY.md          ← Scoring formula, pricing, GTM, roadmap
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
