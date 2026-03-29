# LeadGen GCC — Development TODO
> Track progress here. Check boxes as you complete tasks.
> Read CLAUDE.md first for full context and architecture decisions.

---

## Phase 1 — Project Setup & Auth (Week 1)

- [x] Initialise Next.js project with TypeScript (App Router, src/ structure, ESLint, Prettier)
- [x] Set up Neon PostgreSQL + Prisma ORM (connection string, schema.prisma, migrations)
- [x] Configure Auth.js v5 (email/password + Google OAuth, session, middleware)
- [x] Build onboarding wizard — Step 1: business name + industry
- [x] Build onboarding wizard — Step 2: what they sell (plain text description)
- [ ] Build onboarding wizard — Step 3: upload marketing materials (PDF/Word)
- [ ] User settings page (update business info, change email, plan display)
- [ ] Deploy to Vercel + configure all environment variables

---

## Phase 2 — Master Business Database (Week 2–3)

- [ ] Create master_businesses table in Prisma schema (all fields including last_enriched_at)
- [ ] Google Maps Places API — Text Search endpoint (search by keyword + city)
- [ ] Google Maps Places API — Place Details endpoint (enrich each result with phone, website, etc.)
- [ ] Website scraper with Puppeteer (detect: menu, QR code, Instagram link, contact info)
- [ ] Instagram basic check — direct HTTP (followers, post count, last post date)
- [ ] Data freshness logic (if last_enriched_at > 30 days → re-enrich in background)
- [ ] Deduplication by google_place_id (update if exists, insert if new)

---

## Phase 3 — Per-User Leads & Scoring (Week 3–4)

- [ ] Create user_leads table in Prisma (user_id + master_business_id + score + status)
- [ ] Lead scoring engine — general signals (digital presence, maturity, reputation, activity)
- [ ] Lead scoring engine — sector templates (restaurants first, then agencies, CCTV, suppliers)
- [ ] CRM CSV/Excel upload using ExcelJS (extract contacts → existing_contacts table)
- [ ] Duplicate suppression (cross-reference leads vs existing_contacts, flag is_duplicate)
- [ ] Campaign creation flow (user picks sector + city + score filter → triggers discovery)

---

## Phase 4 — Lead Dashboard & Pipeline (Week 4–5)

- [ ] Leads list view (name, area, score badge, status, last activity — sortable + filterable)
- [ ] Lead detail page/drawer (full profile: Google data, website info, Instagram stats, score breakdown)
- [ ] Pipeline kanban view (Found → Sent → Opened → Replied → Meeting → Closed)
- [ ] Lead status management (manual update, log every change with timestamp)
- [ ] Lead suppression (Not interested / Wrong contact — hides from that user only)
- [ ] Search + filter UI (score, status, sector, city, campaign, date range)

---

## Phase 5 — AI Email Generation (Week 5–6)

- [ ] Marketing materials upload (pdf-parse for PDF, ExcelJS for Word/Excel → store in materials table)
- [ ] Claude API integration (claude-sonnet-4-20250514, system prompt includes user materials + lead)
- [ ] Email generation prompt (per-lead personalization: name, area, sector, Instagram stats, value prop)
- [ ] Arabic / English language toggle (per campaign, passed as instruction to Claude)
- [ ] Tone selector (Friendly / Professional / Formal — passed to Claude)
- [ ] Bulk email generation for all Hot leads in a campaign (progress indicator, stream results)

---

## Phase 6 — Approval UI & Sending (Week 7–8)

- [ ] Email approval queue UI (list of drafts: subject + body preview per lead)
- [ ] Approve / Edit / Reject actions (edit = inline editor, reject = rejected status)
- [ ] Bulk approve UI (select all → approve all with count confirmation before proceeding)
- [ ] Resend SMTP integration (configure sender, handle bounces)
- [ ] ⚠️ Send gate — hard rule: sendEmail() checks status === 'approved' before EVERY send
- [ ] Open tracking (tracking pixel → on open: update opened_at + lead status to Opened)

---

## Phase 7 — Follow-Ups & Automation (Week 9–10)

- [ ] Follow-up schedule settings (user sets wait days: 3/5/7, max 2 follow-ups per lead)
- [ ] Vercel Cron job — daily check (find leads: sent + no reply + scheduled_for <= now)
- [ ] Follow-up email generation via Claude (contextual, references original email)
- [ ] Follow-up approval queue (same UI as initial emails, status: pending_approval)
- [ ] Sequence stop logic (lead replies → cancel ALL pending follow-ups for that lead)
- [ ] Reply detection via Resend webhook (update replied_at + lead status automatically)

---

## Phase 8 — Analytics & Launch (Week 11–12)

- [ ] Analytics dashboard (reply rate, open rate, conversion rate — per campaign + overall)
- [ ] Best performing subject lines (ranked by open rate across user's campaigns)
- [ ] Anonymous platform signals (log outcome: sector + day + result, no user identity)
- [ ] Menumize internal beta test (full flow: Doha restaurants → score → generate → approve → send → track)
- [ ] Bug fixing & polish from beta test results
- [ ] First 5 external beta users (2 agencies + 2 CCTV companies + 1 food supplier in Qatar)

---

## Hard Rules — Never Break These

- [ ] Every send checks `status === 'approved'` — no exceptions
- [ ] Every DB query scoped to `user_id` — no exceptions
- [ ] Never hard delete — only soft delete / archive
- [ ] No auto-send — follow-ups are always pending_approval first
- [ ] master_businesses is never scoped to user_id — it is platform-wide
- [ ] Scores are calculated per user — never stored in master_businesses

---

## Post-MVP Backlog (Do Not Build Yet)

- [ ] Gmail / Outlook OAuth
- [ ] Email history analysis
- [ ] HubSpot / Zoho live CRM sync
- [ ] WhatsApp Business API (Unifonic)
- [ ] SMS outreach
- [ ] AI reply handling
- [ ] Team / multi-user accounts
- [ ] White-label mode
- [ ] Platform benchmark dashboard
- [ ] Advanced social analytics (engagement rate, story activity)
