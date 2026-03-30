# LeadGen GCC — Development TODO
> Track progress here. Check boxes as you complete tasks.
> Read CLAUDE.md first for full context and architecture decisions.
> Last updated: 2026-03-29 — Session 3 complete (app shell + feature-first refactor)

---

## Phase 1 — Project Setup & Auth ✅ DONE

- [x] Initialise Next.js project with TypeScript (App Router, src/ structure, ESLint, Prettier)
- [x] Set up Neon PostgreSQL + Prisma ORM (connection string, schema.prisma, migrations)
- [x] Configure Auth.js v5 (Google OAuth + magic link, session, proxy middleware)
- [x] Build onboarding wizard — Step 1+2: business name, industry, what they sell
- [x] Build onboarding wizard — Step 3: upload marketing materials (PDF/DOCX/TXT)
- [x] User settings — Materials page (`/settings/materials` — view, upload, soft-delete)
- [x] Deploy to Vercel + configure all environment variables
- [x] App shell — collapsible sidebar, user menu dropdown, sign out (`components/layout/app-sidebar.tsx`)
- [x] Scaffold pages for all sidebar sections (Discover, Leads, Outreach, Campaigns, Contacts, Analytics, Settings)
- [x] Feature-first architecture — actions/queries co-located in `_actions/` / `_queries/` per route
- [x] Codebase cleanup — `lib/db.ts`, `lib/file-parser.ts`, deleted `lib/actions/`, `lib/prisma.ts`, `block/`
- [x] User settings — Business info page (update name, industry, whatTheySell) — email field deferred to Phase 2 settings

---

## Phase 2 — Master Business Database & Enrichment

- [x] master_businesses schema defined in Prisma (all fields — done in Session 1)
- [ ] Google Maps Places API — Text Search (keyword + city → list of places)
- [ ] Google Maps Places API — Place Details (enrich each result: phone, website, hours)
- [ ] Website scraper with Puppeteer:
  - [ ] Detect: digital menu, QR code, Instagram link, online ordering
  - [ ] Extract: contact email, phone number from contact page
  - [ ] Extract: logo URL (og:image or favicon)
- [ ] Instagram basic check — direct HTTP (followers, post count, last post date)
- [ ] Deduplication by google_place_id (upsert — update if exists, insert if new)
- [ ] Data freshness logic (last_enriched_at > 30 days → re-enrich in background)
- [ ] Add logoUrl field to master_businesses schema + migration

---

## Phase 3 — Company Profiles & Contacts (CRM Foundation)

- [ ] BusinessContact model in Prisma schema:
  - userId + masterBusinessId (per-user, private)
  - name, email, phone, title/designation
  - source: "scraped" | "manual" | "reply" | "csv_import"
  - isPrimary flag (main contact for outreach)
- [ ] Auto-populate primary contact from website scraping (if email found)
- [ ] User can manually add / edit / remove contacts on a company
- [ ] When a reply comes from a new person → prompt to save as new contact
- [ ] CRM CSV/Excel upload (ExcelJS → existing_contacts table)
- [ ] Duplicate suppression (cross-reference leads vs existing_contacts)

---

## Phase 4 — Per-User Leads, Scoring & Discovery UI

- [ ] Campaign creation flow (sector + city + area + language + tone → triggers discovery)
- [ ] Lead scoring engine — general signals (digital presence, maturity, reputation, activity)
- [ ] Lead scoring engine — sector templates (restaurants first, then agencies, CCTV)
- [ ] AI lead summary card per lead (2–3 line snapshot: key signals + why it scored Hot/Warm/Cold)
- [ ] Leads list view (name, area, score badge, status, last activity — sortable + filterable)
- [ ] Lead detail drawer / company profile page:
  - [ ] Google data (rating, reviews, price level, address)
  - [ ] Website signals (has menu? QR? online order? logo)
  - [ ] Instagram signals (followers, last post, active?)
  - [ ] Score breakdown (why Hot/Warm/Cold — per signal)
  - [ ] AI lead summary card
  - [ ] Contacts section (list of contacts, add/edit/remove)
  - [ ] Interaction timeline (emails sent, replies, status changes)
- [ ] User can edit any field on a company profile (manual override)
- [ ] Pipeline kanban view (Found → Contacted → Replied → Meeting → Won / Lost)
- [ ] Lead suppression (Not interested / Wrong contact — this user only)
- [ ] Search + filter UI (score, status, sector, city, campaign, date range)

---

## Phase 5 — AI Email Generation

- [ ] Claude API integration (claude-sonnet-4-20250514 via lib/claude.ts)
- [ ] System prompt builds from: user materials + lead data + AI summary + contact name
- [ ] Email generation prompt (personalized: company name, area, sector signals, value prop)
- [ ] Arabic / English language toggle (per campaign)
- [ ] Tone selector (Friendly / Professional / Formal)
- [ ] Bulk generation for all Hot leads in a campaign (progress indicator)

---

## Phase 6 — Approval UI & Sending

- [ ] Email approval queue (drafts list: subject + body preview per lead + contact name)
- [ ] Approve / Edit inline / Reject per email
- [ ] Bulk approve UI (select all → confirm count → approve)
- [ ] Resend SMTP integration (configure sender domain, handle bounces)
- [ ] ⚠️ Send gate — sendEmail() checks status === 'approved' before EVERY send
- [ ] Open tracking (pixel → on open: update opened_at + lead status)

---

## Phase 7 — Follow-Ups & Automation

- [ ] Follow-up schedule settings (wait days: 3/5/7, max 2 per lead)
- [ ] Vercel Cron — daily check (sent + no reply + scheduled_for <= now)
- [ ] Follow-up generation via Claude (contextual, references original email)
- [ ] Follow-up approval queue (same UI, status: pending_approval)
- [ ] Sequence stop logic (lead replies → cancel ALL pending follow-ups)
- [ ] Reply detection via Resend webhook (update replied_at + status automatically)

---

## Phase 8 — Analytics & Launch

- [ ] Analytics dashboard (reply rate, open rate, conversion — per campaign + overall)
- [ ] Best performing subject lines (ranked by open rate)
- [ ] Anonymous platform signals (sector + day + outcome, no user identity)
- [ ] Menumize internal beta (Doha restaurants → full loop end-to-end)
- [ ] Bug fixing from beta results
- [ ] First 5 external beta users (2 agencies + 2 CCTV + 1 food supplier in Qatar)

---

## Hard Rules — Never Break These

- Every send checks `status === 'approved'` — no exceptions
- Every Layer 2 query scoped to `userId` — no exceptions
- Soft delete only — never `prisma.X.delete()`
- No auto-send — follow-ups always pending_approval first
- master_businesses never scoped to userId — platform-wide
- business_contacts are per-user — never shared across users
- Scores calculated per user — never stored in master_businesses

---

## Post-MVP Backlog (Do Not Build Yet)

- [ ] Multi-user team accounts (invite teammates, roles)
- [ ] Quotation / deal tracking per lead
- [ ] Inbox — full reply thread view with conversation history
- [ ] Gmail / Outlook OAuth (send from user's own domain)
- [ ] HubSpot / Zoho live CRM sync
- [ ] WhatsApp Business API outreach (Unifonic)
- [ ] AI reply handling (auto-detect intent, suggest response)
- [ ] White-label mode
- [ ] Platform benchmark dashboard (GCC sector averages)
- [ ] Advanced social analytics (engagement rate, story activity)
- [ ] Calendly / meeting booking integration
