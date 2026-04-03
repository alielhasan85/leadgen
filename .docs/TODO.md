# LeadGen GCC — Development TODO
> Track progress here. Check boxes as you complete tasks.
> Read CLAUDE.md first for full context and architecture decisions.
> Last updated: 2026-03-31 — Session 5 complete (ICP Generator + Campaign Wizard built and tested end-to-end)

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

> Architecture decisions locked in Session 4 — see PRODUCT_STRATEGY.md for full detail.

### Schema changes (do first, one migration)
- [x] Add `logoUrl String?` to MasterBusiness
- [x] Add `outreachChannel String @default("email")` to UserLead (email|whatsapp|phone|linkedin|manual)
- [x] Add `contactedAt DateTime?` to UserLead
- [x] Add `searchQuery String?` to Campaign (tracks what was searched to prevent re-runs)
- [x] Add `icpTemplateId String?` to Campaign (optional link to saved template)
- [x] Add `icpCriteria Json?` to Campaign (the ICP JSON used for scoring this campaign)
- [x] New model `ICPTemplate`: id, userId, name, targetSector, criteria Json, aiRationale String, createdAt, updatedAt — index [userId]
- [x] Run: `npx prisma migrate dev --name phase2_icp_enrichment_fields`

### Infrastructure
- [x] Install packages: `cheerio` (HTML parsing) + `@upstash/qstash` (background jobs)
- [ ] Create `lib/services/qstash.ts` — thin wrapper to publish enrichment messages
- [ ] Create `app/api/enrich/[businessId]/route.ts` — worker route QStash calls per business
- [x] Sign up for QStash (Upstash free tier: 500 msg/day — enough for MVP)
- [x] Sign up for Apify (pay-per-use, ~$0.10–0.30 per 100 Instagram profiles)

### ICP Builder (runs before discovery — the core of the app)
- [x] Create `lib/services/icp-generator.ts`:
  - [x] Input: user profile (businessName, whatTheySell) + materials text + targetSector
  - [x] Calls Claude → returns structured ICP JSON + aiRationale per criterion
  - [x] Zod schema validates the output before saving
- [x] Campaign creation wizard — 4 steps:
  - [x] Step 1: Name + language + tone
  - [x] Step 2: Target sector (dropdown — restaurant, salon, office, retail, spa, etc.)
  - [x] Step 3: Location — city + area (predefined area list per city)
  - [x] Step 4: ICP Builder UI
    - [x] Show AI-generated criteria as human-readable cards with rationale
    - [x] Sliders: min price level, min reviews, min rating, follower range, min business age
    - [x] Toggle switches: must-not-have signals (digital menu, online ordering, competitor tool)
    - [x] Toggle switches: must-have signals (has website, etc.) — optional
    - [x] "Save as template" button → creates ICPTemplate record with user-chosen name
    - [x] "Load template" dropdown → populates from existing ICPTemplate
    - [x] Confirm → saves Campaign with icpCriteria JSON → triggers discovery

### Discovery (Google Maps — already has lib/services/google-maps.ts)
- [x] `searchAndEnrichPlaces()` built — Text Search + Place Details in one call
- [ ] Discovery server action triggered after campaign confirmed:
  - [ ] Build search query: `"{businessType}" in "{area}, {city}"`
  - [ ] Check Campaign.searchQuery — skip if same search run in last 7 days
  - [ ] Call `searchAndEnrichPlaces()` → upsert each result into master_businesses
  - [ ] Filter out permanently closed businesses before saving
  - [ ] Create user_leads records (skip if userId+masterBusinessId already exists)
  - [ ] Publish one QStash message per business → triggers enrichment worker
  - [ ] Return immediately — UI shows leads with "Enriching…" badge

### Website enrichment (fetch + Cheerio, no Puppeteer)
- [ ] Create `lib/services/website-scraper.ts`:
  - [ ] Detect digital menu (links with "menu", embedded Zomato/Talabat/QR widget, PDF link)
  - [ ] Detect online ordering (Talabat, Careem Food, Deliveroo, Hunger Station links)
  - [ ] Detect QR code (`<img>` alt/src containing "qr")
  - [ ] Extract Instagram handle (`<a href="instagram.com/...">` in footer/header)
  - [ ] Extract contact email (`mailto:` links or email pattern in text)
  - [ ] Extract logo (`og:image` meta tag)
  - [ ] Fallback: if site is SPA or blocks fetch → mark hasWebsite:true, skip signals silently

### Instagram enrichment (Apify)
- [ ] Create `lib/services/apify.ts` — call `apify/instagram-profile-scraper` actor
  - [ ] Input: instagramUsername extracted from website scraping
  - [ ] Output: followers, postCount, lastPostDate → update master_businesses
  - [ ] Fallback chain: website → Google Maps listing → skip (leave fields null)

### Enrichment worker
- [ ] `app/api/enrich/[businessId]/route.ts`:
  - [ ] Verify QStash signature (security — reject requests not from QStash)
  - [ ] Run website scraper → update master_businesses signals
  - [ ] If instagramUsername found → call Apify → update Instagram fields
  - [ ] Update master_businesses.lastEnrichedAt
  - [ ] Trigger ICP-driven scoring: read campaign.icpCriteria → calculate score → update user_leads.score + scoreLabel
  - [ ] Hard exclusion: if any mustNotHaveSignal matches → score = 0, label = COLD

### Deduplication (5 layers)
- [ ] Layer 1: master_businesses.googlePlaceId UNIQUE — already in schema ✅
- [ ] Layer 2: user_leads UNIQUE(userId, masterBusinessId) — already in schema ✅
- [ ] Layer 3: user_leads.isSuppressed — already in schema ✅ (hide suppressed from all future searches)
- [ ] Layer 4: lastEnrichedAt < 30 days → skip scraping, serve from cache
- [ ] Layer 5: Campaign.searchQuery dedup — skip if same search run in last 7 days

### Contact channel tracking (not always email)
- [ ] UserLead shows phone number with "Copy" button for WhatsApp/phone outreach
- [ ] UserLead shows LinkedIn URL if available
- [ ] "Mark as Contacted" action — user logs manual outreach (sets contactedAt + status)
- [ ] outreachChannel logged per lead — email | whatsapp | phone | linkedin | manual

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

- [ ] Campaign creation flow — UI only (4-step wizard built in Phase 2, Phase 4 adds polish + campaign list view)
- [ ] Lead scoring engine `lib/scoring.ts` — reads campaign.icpCriteria, never hardcoded weights
- [ ] Hard exclusion logic: mustNotHaveSignals match → score = 0 regardless of other signals
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
