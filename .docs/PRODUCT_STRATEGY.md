# LeadGen GCC — Product Strategy

> Strategic context, platform vision, scoring formula, pricing, GTM, and roadmap.
> Read this when making product decisions, not during feature development.

---

## What Problem This Solves

B2B sales in GCC is manual and slow. A founder selling software to restaurants spends hours
searching Google Maps, copying phone numbers, sending WhatsApp messages one by one.
This tool automates discovery, scoring, and personalized outreach — so the founder focuses
on the reply, not the search.

**Proven demand:** Menumize (Ali's restaurant QR-menu SaaS) is the first user.
The founder IS the customer. That's the strongest possible validation.

---

## Platform Structure (Sidebar Navigation)

```
Dashboard       — command center: hot leads, pending approvals, alerts
Discover        — search sector + city → scored leads with AI summary cards
My Leads        — full CRM list + company profiles + contacts
Outreach        — email approval queue, sent history, follow-up queue
Inbox           — replies + conversation threads (Phase 7+)
Campaigns       — named search runs, per-campaign metrics
Contacts        — imported CRM CSV, duplicate detection
Analytics       — reply rate, open rate, best subject lines (Phase 8)
Settings        — business profile, materials, email setup, billing, team
```

---

## Three Levels of Ambition

Build in order. Do not skip ahead.

```
Level 1 — Lead Finder (MVP, build now)
  Find businesses → score → send emails → track replies
  One user. One sector. One city. Proves the loop works.

Level 2 — Sales CRM (3–4 months)
  Company profiles with multiple contacts
  Full interaction history per company
  Manual editing of all data
  Team accounts (multiple users per business)

Level 3 — Full Sales Platform (post-revenue)
  Integrations (Gmail, HubSpot, WhatsApp)
  AI reply handling
  Quotation / deal tracking
  White-label for agencies
  GCC business database as standalone product
```

---

## Pipeline Flow

```
User creates campaign (sector + city + area + language + tone)
  ↓
Google Maps Places API → name, phone, website, rating, address, logo
  ↓
Puppeteer → has digital menu? QR code? Instagram link? contact email?
  ↓
Instagram check → followers, post count, last post date
  ↓
Lead scoring → Hot / Warm / Cold (0–100 pts)
  ↓
Claude API → AI lead summary card (2–3 line snapshot per lead)
  ↓
Lead appears in Discover view — user reviews summary cards
  ↓
User selects leads → Claude generates personalized email per lead
  ↓
Email approval queue (status: pending_approval)
  ↓
[USER] Reviews → Approve / Edit / Reject
  ↓
Approved emails send via Resend → open tracking pixel
  ↓
Reply detected → lead status updates → follow-up sequence stops
  ↓
Pipeline: Found → Contacted → Replied → Meeting → Won / Lost

Timeline: 50 leads processed in ~2–3 min | User review time: ~20 min
```

---

## AI Lead Summary Card

Every lead gets a 2–3 line AI snapshot before the user sees or approves the email.
Purpose: let the user scan 30 leads in 2 minutes and pick which to pursue.

```
Example card for a restaurant:
  "No digital menu detected. Instagram active (847 followers, last post 3 days ago).
   Opened 8 months ago. Rating 4.2★ from 94 reviews. Strong fit for Menumize."

Example card (low score):
  "Has an online ordering system (Talabat). Very active Instagram (12k followers).
   Likely already has digital tooling. Low priority."
```

---

## Lead Scoring Formula

```
Total = Digital Presence + Maturity + Reputation + Activity + Sector Fit (max 100)

Digital Presence (0–30 pts):
  No website + no social    = 30
  Website only, no social   = 20
  Both but inactive         = 10
  Fully active online       = 0

Business Maturity (0–20 pts):
  < 6 months = 20 | 6–24 months = 15 | 2–5 years = 8 | 5+ years = 3

Reputation (0–20 pts):
  < 3.5★ = 20 | 3.5–4.0 = 15 | 4.0–4.5 = 8 | 4.5+ = 3

Activity (0–10 pts):
  Active + responds = 0 | Active, no response = 5 | Dormant = 10

Sector Fit — Restaurants / Menumize (0–30 pts):
  No digital menu     = +20
  New opening <6mo    = +15
  PDF menu on site    = +15
  Multiple locations  = +10
  Price range $$+     = +10
  Has competitor tool = −30

Labels:  80–100 = Hot 🔥 | 50–79 = Warm 🟡 | <50 = Cold ❄️
```

---

## Company Profile & Contacts Model

Each company in the CRM has:
- Business details (from Google + scraping + manual overrides)
- Logo (scraped from website og:image or Google)
- Multiple contacts (people at that company — per user, private)
  - Contact fields: name, email, phone, title/designation, source
  - Source types: scraped | manual | reply | csv_import
  - One contact flagged as isPrimary (default outreach target)
- Full interaction history (emails, replies, status changes)
- Pipeline status per user

Key rule: contacts are **per-user and private**. If Menumize discovers Ahmed at
Restaurant X, a CCTV company using the same platform cannot see Ahmed's details.

---

## Smart Discovery (No Repeat Searches)

```
User searches "restaurants, Doha, Al Maaither"
  ↓
System checks master_businesses by google_place_id
  ├── Not in DB → call Google API, scrape, save, create user_lead
  ├── In DB, fresh (< 30 days) → skip API, create user_lead from cache
  ├── In DB, stale (> 30 days) → re-enrich in background, serve cache now
  └── Already in THIS user's leads → show current pipeline status (don't duplicate)
```

Cost is paid ONCE per business across all users. Same restaurant searched by
10 different users = 1 Google API call total.

---

## Social Signal Priority by Sector

| Sector | Priority 1 | Priority 2 | Skip |
|---|---|---|---|
| Restaurants / Cafes | Instagram | Facebook | LinkedIn |
| Marketing Agencies | LinkedIn | Instagram | — |
| CCTV / B2B | LinkedIn | Website | Instagram |
| Food Suppliers | Website | LinkedIn | Instagram |

**Email angle by Instagram signal (restaurants):**
- No Instagram → "You're invisible on social media"
- Dormant 47 days → "Your Instagram hasn't been updated in 47 days"
- Active, 500 followers → focus on menu pain point instead
- 10k+ followers, daily posts → score drops (likely has agency already)

---

## Data Freshness Rule

```
last_enriched_at < 30 days → serve from master_businesses instantly
last_enriched_at > 30 days → re-enrich in background, update for all users
```

---

## Pricing

| Plan | Price | Limits |
|---|---|---|
| Free Trial | $0 / 7 days | 20 leads, 5 emails |
| Starter | $49/mo | 300 leads, 1 sector, 1 city, email only |
| Growth | $99/mo | 1500 leads, 3 sectors, 3 cities, Arabic + English, follow-ups, analytics |
| Pro | $199/mo | Unlimited leads + cities, 3 users |
| Agency | $399/mo | Everything + 10 users, white-label |

---

## Unit Economics

```
100 leads via Google API:   ~$5.00
100 emails via Claude:      ~$0.30
100 sends via Resend:       $0.00
100 Instagram checks:       $0 MVP / ~$2 scale
Infrastructure:             $0–40/month

At 20 Starter customers:
  Revenue: $980/month | Costs: ~$420/month | Profit: $560/month ✅
```

---

## Go-To-Market

```
Month 1–3:  Menumize internal testing (Doha restaurants) — prove the loop
Month 3–4:  5–10 free beta users (agencies + CCTV in Qatar)
Month 4–5:  First paying customers
Month 6+:   Public launch Qatar + UAE
Month 9+:   AppSumo, Saudi expansion
```

---

## Build Roadmap

```
Phase 1:  Auth + onboarding + settings + Vercel deploy       ✅ Done
Phase 2:  Google Maps + scraping + Instagram + dedup
Phase 3:  BusinessContact model + company profile CRM
Phase 4:  Lead scoring + AI summary cards + Discover UI
Phase 5:  Claude email generation
Phase 6:  Approval UI + Resend sending
Phase 7:  Follow-ups + automation
Phase 8:  Analytics + Menumize beta test + first external users
```

---

## Post-MVP Roadmap

```
V2: Team accounts, Gmail OAuth, email history, HubSpot/Zoho sync
V3: WhatsApp API (Unifonic), quotation/deal tracking, Calendly
V4: AI reply handling, predictive scoring, sector learning
V5: White-label, GCC business DB as standalone product
```

---

## MVP Scope

**In:** Auth, onboarding, materials, Google Maps discovery, website scraping (logo + email + signals),
Instagram check, dedup, company profiles, business contacts (multiple per company),
AI lead summary cards, lead scoring, Claude email gen, approval UI, Resend sending,
follow-ups (max 2), pipeline dashboard, basic analytics

**Out (post-MVP):** Gmail/Outlook OAuth, live CRM sync, WhatsApp, SMS, AI replies,
team accounts, white-label, advanced social analytics, quotation tracking
