# LeadGen GCC — Product Strategy

> Strategic context, platform vision, ICP Builder, pricing, GTM, and roadmap.
> Read this when making product decisions, not during feature development.

---

## What Problem This Solves

B2B sales in GCC is manual and imprecise. A founder selling software, a food supplier, a marketing agency — all spend hours searching Google Maps, copying phone numbers, guessing who might be interested. They contact 100 businesses and get 3 replies because most of those 100 were never the right fit.

This tool solves both problems: **find** the right businesses automatically, and **qualify** them against your exact criteria before you ever reach out.

**Who it's for — any GCC B2B seller:**
- SaaS company (e.g. Menumize) targeting restaurants that have no digital menu
- Food/raw material supplier targeting high-volume restaurants with multiple locations
- POS company targeting retailers without a modern till system
- Digital marketing agency targeting salons with dormant Instagram, or restaurants with no online ordering
- CCTV company targeting offices and commercial buildings without visible security
- IT company targeting SMEs with outdated infrastructure signals

**The core insight:** The right leads are not whoever shows up first in Google Maps. They're the businesses that specifically match what you sell — and that match is different for every subscriber.

**Proven internal use case:** Menumize (Ali's restaurant QR-menu SaaS) is the first subscriber. The founder IS the customer. That's the strongest possible validation of the workflow.

---

## Platform Structure (Sidebar Navigation)

```
Dashboard       — command center: hot leads, pending approvals, alerts
Discover        — run campaigns → see scored leads with AI summary cards
My Leads        — full CRM list + company profiles + contacts
Outreach        — email approval queue, sent history, follow-up queue
Inbox           — replies + conversation threads (Phase 7+)
Campaigns       — named search runs with ICP, per-campaign metrics
Contacts        — imported CRM CSV, duplicate detection
Analytics       — reply rate, open rate, best subject lines (Phase 8)
Settings        — business profile, materials, email setup, billing, team
```

---

## Three Levels of Ambition

Build in order. Do not skip ahead.

```
Level 1 — Intelligent Lead Finder (MVP, build now)
  Define ICP → find matching businesses → score → contact → track replies
  One user. One sector. One city. Proves the full loop works.
  ICP Builder is core MVP — not a future feature.

Level 2 — Sales CRM (3–4 months)
  Company profiles with multiple contacts
  Full interaction history per company
  Manual editing of all data
  Team accounts (multiple users per business)

Level 3 — Full Sales Platform (post-revenue)
  Integrations (Gmail, HubSpot, WhatsApp Business API)
  AI reply handling
  Quotation / deal tracking
  White-label for agencies
  GCC business database as standalone product
```

---

## ICP Builder — The Core of the App

Before any campaign runs, the user defines their **Ideal Customer Profile (ICP)** — the exact type of business they're looking for. AI generates this from the user's own business description and marketing materials.

**Why this is the moat:**
The same sector (restaurants) means completely different targets for different subscribers:
- Menumize wants: no digital menu, $$+, 6+ months open, not on Talabat
- Food supplier wants: high volume (many reviews), multiple locations, $$+
- Marketing agency wants: dormant Instagram, no online booking, low social engagement

Sector + city is just the search scope. ICP is what makes a lead relevant.

### What the ICP contains (stored as `icpCriteria` JSON on Campaign)

```
targetDescription    — plain English summary: "Mid-high end restaurants with no digital menu"
minPriceLevel        — 1–4 (filter out cheap/low-end targets)
minReviewCount       — proxy for business size / establishment (min 20 = real business)
minRating            — filter out dying businesses (min 3.5★)
minBusinessAgeMonths — filter brand-new businesses not yet settled (min 6 months)
instagramFollowersMin — lower bound: too few = doesn't exist online
instagramFollowersMax — upper bound: too many = already has an agency or sophisticated team
mustNotHaveSignals   — hard exclusions that make a lead irrelevant:
                        e.g. ["hasDigitalMenu", "hasOnlineOrdering", "hasCompetitorTool"]
mustHaveSignals      — required signals (optional):
                        e.g. ["hasWebsite"] for subscribers who need web presence
scoringWeights       — how many points each matched/failed criterion contributes (max 100)
aiRationale          — why Claude suggested these criteria (shown to user for transparency)
```

### How AI generates the ICP

```
Input to Claude:
  user.businessName + user.whatTheySell
  + full text from user's uploaded materials (PDFs, brochures, case studies)
  + targetSector chosen for this campaign

Claude returns:
  Structured ICP JSON + plain English rationale per criterion

User sees:
  "Your ideal restaurant target: no digital menu, price level $$+,
   open 6+ months, Instagram 100–5000 followers, not on major delivery platforms.
   Here's why: [rationale per criterion]"

User can:
  Adjust numeric thresholds (sliders)
  Toggle signals on/off
  Add custom exclusions
  Save as a named template for reuse

Saved as:
  ICPTemplate — reusable across future campaigns
  Campaign.icpCriteria — the actual JSON used for this campaign's scoring
```

### ICP examples by subscriber type

| Subscriber | Target Sector | Key ICP Signals |
|---|---|---|
| Menumize (digital menu SaaS) | Restaurants | No digital menu, $$+, 6+ months, not on Talabat/Careem |
| Food supplier | Restaurants | High review count, $$+, multiple locations, high volume |
| POS company | Restaurants + Retail | No modern POS signals on site, mid-size (50+ reviews), not a chain |
| Marketing agency (salons) | Salons | Low Instagram engagement, no online booking system |
| Marketing agency (restaurants) | Restaurants | Dormant Instagram, no online ordering |
| Marketing agency (spas) | Spas | No Facebook presence, low review count |
| CCTV company | Offices / Commercial | No security signals on website, commercial address |

**Same subscriber (marketing agency) runs 3 campaigns = 3 different ICPs.** This is why ICP is per-campaign, not per-user.

---

## Pipeline Flow

```
User creates campaign (4 steps):
  Step 1: Name + language + tone
  Step 2: Target sector (restaurants / salons / offices / etc.)
  Step 3: Location (city + area from predefined list)
  Step 4: ICP Builder
    → Claude generates criteria from profile + materials + sector
    → User reviews, adjusts thresholds, toggles signals
    → User saves as template (optional): "Restaurants - No Digital Menu"
    → Confirm
  ↓
Google Maps Places API → up to 60 businesses returned
  [saves to master_businesses immediately — UI shows leads with "Enriching…"]
  ↓
QStash background job per business (outside user's request lifecycle)
  ↓
fetch + Cheerio → website signals: digital menu? QR? online order? Instagram handle? email? logo?
  ↓
Apify Instagram scraper → followers, post count, last post date (if handle found)
  ↓
ICP-driven scoring engine → reads campaign.icpCriteria → score 0–100
  Hard exclusion: mustNotHaveSignals match → score = 0 (❄️ Cold, filtered out)
  ↓
Claude API → AI lead summary card (2–3 line snapshot per lead)
  ↓
Lead appears in Discover view — scored, ranked, with AI summary
  ↓
User selects leads → chooses outreach channel:
  ├── Email → Claude generates draft → approval queue → Resend → open tracking
  └── Manual (WhatsApp / phone / LinkedIn) → system shows contact details → user marks contacted
  ↓
Pipeline: Found → Contacted → Replied → Meeting → Won / Lost

Timeline: Google Maps returns < 5s | Full enrichment per business: ~10–30s background
```

---

## ICP-Driven Scoring (replaces hardcoded formula)

Scoring is never hardcoded. It reads from `campaign.icpCriteria` at runtime.

```
Score = sum of matched criteria weights (max 100)

Hard exclusions (mustNotHaveSignals):
  Any match → score = 0, label = COLD, hidden from Hot/Warm views

Numeric thresholds (soft scoring):
  priceLevel >= minPriceLevel     → + weight
  reviewCount >= minReviewCount   → + weight
  rating >= minRating             → + weight
  businessAge >= minMonths        → + weight
  followers in [min, max] range   → + weight

Signal matches:
  mustHaveSignals all present     → + weight
  desirable signals present       → + partial weight

Labels:  80–100 = Hot 🔥 | 50–79 = Warm 🟡 | <50 = Cold ❄️
```

**Rule:** `lib/scoring.ts` always receives the campaign's `icpCriteria` as input. It never contains hardcoded weights for any sector. Hardcoded scoring is wrong for every subscriber except the one it was written for.

---

## AI Lead Summary Card

Every lead gets a 2–3 line Claude snapshot. Purpose: scan 30 leads in 2 minutes.

```
Example (Menumize subscriber, restaurant lead):
  "No digital menu detected. Instagram active (847 followers, last post 3 days ago).
   Opened 8 months ago. Rating 4.2★ from 94 reviews. Strong ICP match."

Example (marketing agency subscriber, salon lead):
  "Instagram dormant — last post 47 days ago. No online booking found.
   4.6★ with 210 reviews. Mid-size salon, active but underserved digitally."

Example (low score):
  "Already on Talabat with full online ordering. Active Instagram (12k followers).
   Likely has digital tooling covered. Excluded by your ICP."
```

---

## Outreach Channel Strategy

Outreach is not always automated email. The pipeline and scoring work the same regardless of channel.

| Channel | How it works | System role |
|---|---|---|
| Email | Draft → approve → Resend sends | Full automation |
| WhatsApp | System shows phone number + copy button | User sends manually, marks contacted |
| Phone | System shows phone number | User calls, marks contacted |
| LinkedIn | System shows LinkedIn URL | User messages, marks contacted |
| Manual | Any other channel | User logs it, marks contacted |

**Key rule:** `contactedAt` is set whenever the user marks a lead as contacted — regardless of channel. Follow-up logic reads `contactedAt`, not the channel. `outreachChannel` is logged for analytics.

---

## Smart Discovery (No Repeat Searches)

```
User runs campaign: "restaurants in Al Sadd, Doha"
  ↓
Check Campaign.searchQuery — same search in last 7 days? → show cached results, skip API
  ↓
Google Maps Text Search → up to 60 results (3 pages via next_page_token)
  ↓
For each result:
  ├── Not in master_businesses → save, create user_lead, queue enrichment
  ├── In DB, fresh (< 30 days) → skip enrichment, create user_lead from cache
  ├── In DB, stale (> 30 days) → create user_lead from cache, re-enrich in background
  └── Already in THIS user's leads (active or suppressed) → skip entirely
```

**Covering a full city:** Google Maps returns max 60 results per area search. User runs one campaign per area. Predefined area lists per city — user picks from dropdown, not free text.

**Quality gate — only save to master_businesses if:**
- Has `googlePlaceId`
- Has `name`
- NOT permanently closed
- Sector matches campaign `businessType`

**Cost:** 1 Google API call per unique business across all users. Same restaurant searched by 10 different users = 1 API call total.

---

## Deduplication (5 Layers)

```
Layer 1 — master_businesses.googlePlaceId UNIQUE
  Same business found in two searches → upsert updates, never duplicates

Layer 2 — user_leads UNIQUE(userId, masterBusinessId)
  Same user can't have two pipeline entries for the same business

Layer 3 — user_leads.isSuppressed
  "Not interested" / "Wrong contact" → hidden from ALL future campaigns, this user only

Layer 4 — master_businesses.lastEnrichedAt
  < 30 days → serve from cache, skip scraping
  > 30 days → serve cache now, re-enrich in background

Layer 5 — Campaign.searchQuery
  Same exact search in last 7 days → return cached results, skip Google Maps call
```

---

## Social Signal Priority by Sector

| Sector | Priority 1 | Priority 2 | Skip |
|---|---|---|---|
| Restaurants / Cafes | Instagram | Facebook | LinkedIn |
| Marketing Agencies | LinkedIn | Instagram | — |
| CCTV / B2B | LinkedIn | Website | Instagram |
| Food Suppliers | Website | LinkedIn | Instagram |
| Salons / Spas | Instagram | Facebook | LinkedIn |

---

## Data Freshness Rule

```
lastEnrichedAt < 30 days → serve from master_businesses instantly
lastEnrichedAt > 30 days → re-enrich in background, serve cached data immediately
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
100 Instagram checks:       $0 MVP / ~$2 scale (Apify)
Infrastructure:             $0–40/month

At 20 Starter customers:
  Revenue: $980/month | Costs: ~$420/month | Profit: $560/month ✅
```

---

## Go-To-Market

```
Month 1–3:  Menumize internal testing (Doha restaurants) — prove the full loop
Month 3–4:  5–10 free beta users (agencies + CCTV + food suppliers in Qatar)
Month 4–5:  First paying customers
Month 6+:   Public launch Qatar + UAE
Month 9+:   AppSumo, Saudi expansion
```

---

## Build Roadmap

```
Phase 1:  Auth + onboarding + settings + Vercel deploy             ✅ Done
Phase 2:  ICP Builder + Google Maps + scraping + Instagram + dedup
Phase 3:  BusinessContact model + company profile CRM
Phase 4:  Lead scoring (ICP-driven) + AI summary cards + Discover UI
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

**In:** Auth, onboarding, materials, ICP Builder (AI-generated per campaign + templates),
Google Maps discovery, website scraping (Cheerio — logo + email + signals),
Instagram check (Apify), deduplication (5 layers), company profiles, business contacts,
AI lead summary cards, ICP-driven scoring, Claude email gen, approval UI, Resend sending,
multi-channel outreach tracking, follow-ups (max 2), pipeline dashboard, basic analytics

**Out (post-MVP):** Gmail/Outlook OAuth, live CRM sync, WhatsApp API, SMS, AI replies,
team accounts, white-label, advanced social analytics, quotation tracking
