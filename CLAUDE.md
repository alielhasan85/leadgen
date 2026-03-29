# LeadGen GCC — AI-Powered B2B Lead Generation SaaS
> Project brief for Claude Code / Cursor IDE
> Author: Ali | Status: MVP In Planning
> Last updated: March 2026

---

## The One-Line Description

> "Find 300 potential clients this month. Automatically."

An AI-powered B2B lead generation platform that automatically finds local businesses, checks their digital presence and social activity, scores them intelligently, writes personalized outreach emails using the user's own marketing materials, and tracks the full sales pipeline — with the user confirming every message before it sends.

---

## Core Philosophy

**Three rules that govern every product decision:**

1. **User is always in control** — No email, no message, no follow-up is ever sent without explicit user approval. The AI prepares, the human decides.
2. **Build it finished, not feature-rich** — Every feature deferred is a feature that doesn't break the launch. Ship the simple version first.
3. **Prove it on Menumize first** — This tool is tested internally on Menumize (Ali's restaurant SaaS) before offered to any other business.

---

## Origin — Menumize First

This tool started as an internal need for **Menumize** — a QR menu and restaurant growth SaaS targeting GCC markets. Menumize needs a scalable way to find restaurants, avoid contacting existing customers, and send personalized outreach automatically.

The realization: every B2B business in the GCC has this exact same problem.

**Development approach:**
- Build for Menumize use case first
- Test it, break it, improve it internally
- Once proven — open to other businesses as SaaS

---

## The Automated Lead Processing Pipeline

**The user does exactly one thing — clicks "Find Leads." Everything else is automatic.**

```
User clicks "Find Leads" (defines: sector + city)
         ↓
[AUTOMATIC] Google Maps Places API
  Returns: name, phone, website, rating, reviews, address
         ↓
[AUTOMATIC] Website visit (Puppeteer)
  Checks: has digital menu? QR code? Instagram link?
         ↓
[AUTOMATIC] Instagram check (if link found)
  Gets: followers, post count, last post date
         ↓
[AUTOMATIC] Lead scoring
  Combines all signals → Hot / Warm / Cold
         ↓
[AUTOMATIC] Claude API generates personalized email
  Uses: lead data + user's uploaded PDF materials
         ↓
Lead appears in dashboard — status: pending_approval
         ↓
[USER ACTION] Reviews email → Approve / Edit / Reject
         ↓
[USER ACTION] Approved emails enter send queue
         ↓
Email sends via Resend SMTP

Timeline: 50 leads fully processed in ~2-3 minutes
User involvement: ~20 minutes to review and approve
```

---

## ⚠️ Critical Rule — User Approval Before Any Send

**This is a hard rule. It never changes. No exceptions.**

```
AI generates email
      ↓
User sees preview (subject + body)
      ↓
User: Approve / Edit / Reject
      ↓
Only approved emails send

Applies to:
  ✅ Initial outreach emails
  ✅ Follow-up sequences
  ✅ Any future channel (WhatsApp, SMS)

Every send function must verify:
  status === 'approved'
  before executing — hard gate in code
```

---

## Architecture Decision — Two-Layer Data Model

**This is the most important architectural decision in the entire app.**

### The Problem
Multiple users (Menumize, a marketing agency, a food supplier) may all want to find the same restaurant. Should the app hit Google Maps API every time? Should they share data? Should they see each other's records?

### The Solution — Two Completely Separate Layers

```
LAYER 1 — Master Business Database (Shared, Platform-Owned)
  Public information about GCC businesses
  Discovered and enriched once
  Served to all users
  No user identity attached
  Owned by the platform — this is the asset

LAYER 2 — User Lead Records (Private, Per-User)
  Each user's relationship with a business
  Their pipeline, emails, notes, scores
  Completely isolated — never visible to others
  Scoped strictly to user_id
```

### How It Works in Practice

```
Menumize searches "restaurants in Doha"
  → App checks master_businesses DB first
  → Al Waha not found yet
  → Hits Google Maps API
  → Enriches Al Waha (website, Instagram)
  → Saves to master_businesses
  → Creates private user_lead for Menumize
  → Menumize sees Al Waha in their dashboard

Marketing Agency searches "restaurants in Doha" (later)
  → App checks master_businesses DB first
  → Al Waha FOUND — already enriched
  → No Google API call needed (saves cost)
  → Creates private user_lead for Marketing Agency
  → Marketing Agency sees Al Waha in their dashboard

Result:
  Both users see Al Waha
  Neither sees the other's records
  Neither knows the other exists
  Google API only called ONCE for Al Waha
  Platform saves cost — data improves for everyone
```

### Same Business, Different Scores

The master DB holds raw data. Each user gets a score calculated for THEIR specific needs:

```
Al Waha raw data (master DB, shared):
  No digital menu: true
  Instagram followers: 890
  Last post: 47 days ago
  Google rating: 4.1

Score for Menumize (sells QR menus):
  No digital menu = +30 pts → Hot 🔥

Score for Marketing Agency (sells social media):
  Dormant Instagram = +25 pts → Hot 🔥

Score for Food Supplier:
  Active restaurant = +20 pts → Warm 🟡

Score for CCTV Company:
  It's a restaurant = +5 pts → Cold ❄️

Same data. Four different scores. Four different email angles.
```

### Data Freshness Rule

```
if (last_enriched_at < 30 days ago):
  → Serve from master DB instantly

if (last_enriched_at > 30 days ago):
  → Re-enrich in background
  → Update master DB for everyone
  → Show fresh data to current user
```

### Suppression Rule (Important)

```
User A contacts Al Waha → marked "not interested"
→ Al Waha suppressed in User A's dashboard only
→ Al Waha still appears for User B (different relationship)
→ Master DB not affected
→ Every user manages their own relationship independently
```

---

## Database Schema

### Layer 1 — Shared (Platform-Owned)

```sql
-- Master GCC business database
-- Public data only — no user info
master_businesses (
  id,
  name,
  phone,
  email,
  website,
  area,
  city,
  country,
  sector,               -- restaurant|agency|office|hotel etc
  google_place_id,      -- unique Google identifier
  google_rating,
  google_review_count,
  has_website,
  has_digital_menu,
  has_qr_code,
  instagram_username,
  instagram_followers,
  instagram_post_count,
  instagram_last_post_date,
  instagram_is_active,  -- last post < 30 days
  facebook_url,
  facebook_likes,
  linkedin_url,
  last_enriched_at,     -- when data was last refreshed
  created_at
)

-- Anonymous performance signals
-- No user identity — pure patterns
platform_signals (
  id,
  sector,
  city,
  signal_type,          -- reply|open|convert
  day_of_week,
  hour_of_day,
  subject_pattern,
  outcome,              -- true|false
  created_at
)

-- Sector benchmarks (computed from signals)
sector_benchmarks (
  id,
  sector,
  city,
  avg_reply_rate,
  avg_open_rate,
  best_day,
  best_hour,
  updated_at
)
```

### Layer 2 — Private (Per-User)

```sql
-- Users and their account
users (
  id, name, email,
  business_name, industry,
  what_they_sell,
  plan, created_at
)

-- Their uploaded marketing materials
materials (
  id, user_id,
  filename, content_extracted,
  type, uploaded_at
)

-- Their search campaigns
campaigns (
  id, user_id,
  name, business_type, city,
  status, created_at
)

-- Their private relationship with each business
user_leads (
  id,
  user_id,                  -- strict scoping
  master_business_id,       -- links to shared layer
  campaign_id,
  score,                    -- calculated for this user's sector
  score_label,              -- Hot|Warm|Cold
  status,                   -- new|approved|sent|opened|replied|meeting|closed|dead
  notes,
  is_suppressed,            -- user marked as do not contact
  created_at
)

-- Their emails to each lead
user_emails (
  id,
  user_id,
  user_lead_id,
  subject, body,
  language,                 -- en|ar
  status,                   -- draft|approved|rejected|sent
  approved_at, sent_at,
  opened_at, replied_at,
  created_at
)

-- Their follow-up sequences
user_followups (
  id,
  user_id,
  user_lead_id,
  user_email_id,
  subject, body,
  scheduled_for,
  status,                   -- pending_approval|approved|sent|cancelled
  sequence_number,          -- 1 or 2 max
  created_at
)

-- Contacts from their CRM upload
existing_contacts (
  id, user_id,
  email, name, company,
  status_in_crm,            -- customer|prospect|lost
  source_file, imported_at
)
```

---

## Social Media Checking

### What Gets Checked Automatically
For each discovered business, the app automatically checks:

```
Instagram (most important for restaurants/F&B):
  → Followers count
  → Total post count
  → Last post date
  → Days since last post
  → Is active (last post < 30 days)

Facebook:
  → Page exists
  → Page likes
  → Last post date

LinkedIn (more important for B2B sectors):
  → Company page exists
  → Employee count
  → Activity level
```

### What This Costs
```
MVP approach — direct HTTP request:
  Free
  Works at low volume (under 100/day)
  Some risk of occasional blocking
  Good enough to start

Scale approach — RapidAPI or Apify:
  ~$10-49/month
  Reliable at any volume
  They handle blocking/proxies
  Switch to this when you have paying users
```

### Social Signal Value by Sector
```
Restaurants / Cafes:
  Instagram ⭐⭐⭐⭐⭐  Check first
  Facebook  ⭐⭐⭐     Check second
  LinkedIn  ⭐         Skip

Marketing Agencies:
  LinkedIn  ⭐⭐⭐⭐⭐  Check first
  Instagram ⭐⭐⭐     Check second

CCTV / B2B Companies:
  LinkedIn  ⭐⭐⭐⭐⭐  Check first
  Website   ⭐⭐⭐⭐   Key signal
  Instagram ⭐         Skip

Food Suppliers:
  Website   ⭐⭐⭐⭐⭐  Check first
  LinkedIn  ⭐⭐⭐     Check second
```

### How Social Data Affects Email
```
Restaurant found:
  No Instagram at all:
    Email angle: "You're invisible on social media"
  
  Has Instagram, dormant 47 days:
    Email angle: "Your Instagram hasn't been 
    updated in 47 days — you're losing customers"
  
  Has Instagram, active, 500 followers:
    Email angle: Different pain point — focus on menu
  
  Has Instagram, 10k+ followers, posts daily:
    Score drops — likely has agency already
```

---

## Lead Scoring Formula

```
Total Score = Digital Presence + Maturity + Reputation + Activity + Sector Fit
Max = 100 points

Digital Presence (0-30pts):
  No website + no social    = 30
  Website only, no social   = 20
  Both but inactive         = 10
  Fully active online       = 0

Business Maturity (0-20pts):
  Under 6 months            = 20
  6-24 months               = 15
  2-5 years                 = 8
  5+ years                  = 3

Reputation Signal (0-20pts):
  Under 3.5 stars           = 20
  3.5 to 4.0                = 15
  4.0 to 4.5                = 8
  4.5+                      = 3

Activity Level (0-10pts):
  Active + responds         = 0
  Active, not responding    = 5
  Dormant                   = 10

Sector Fit — Restaurants (Menumize) (0-30pts):
  No digital menu           = +20
  New opening < 6 months    = +15
  PDF menu on website       = +15
  Multiple locations        = +10
  Price range $$ or above   = +10
  Already has competitor    = -30

Score Labels:
  80-100  = Hot 🔥
  50-79   = Warm 🟡
  Below 50 = Cold ❄️
```

---

## MVP Scope

### ✅ In Scope
- User auth + onboarding (business type, what they sell)
- Marketing materials upload (PDF/Word) — feeds AI
- Google Maps lead discovery
- Website scraping (basic presence check)
- Instagram basic check (followers, posts, last date)
- CSV/Excel CRM upload + duplicate detection
- Lead scoring + segmentation (Hot/Warm/Cold)
- Claude API email generation (English + Arabic)
- Email preview + approval UI
- SMTP email sending via Resend
- Follow-up sequences (max 2, user approves each)
- Pipeline dashboard (Found → Sent → Replied → Closed)
- Basic analytics (reply rate, open rate, conversions)
- Two-layer DB architecture (master + per-user) from day one

### ❌ Out of Scope (Post-MVP)
| Feature | When |
|---|---|
| Gmail / Outlook OAuth | V2 |
| Email history analysis | V2 |
| Live CRM sync | V2 |
| WhatsApp Business API | V3 |
| SMS outreach | V3 |
| AI reply handling | V4 |
| Team / multi-user | V2 |
| White-label | V5 |
| Advanced social analytics | V3 |
| Platform benchmarks dashboard | V3 |

---

## Tech Stack

```
Frontend:     Next.js App Router + TypeScript
UI:           shadcn/ui components + Tailwind CSS v4 utility classes
Database:     Neon PostgreSQL
ORM:          Prisma
Auth:         Auth.js v5
AI:           Claude API — claude-sonnet-4-20250514
Lead Source:  Google Maps Places API
Social Check: Direct HTTP (MVP) → RapidAPI/Apify (scale)
Web Scraping: Puppeteer (website checks)
Email:        Resend
File Parsing: pdf-parse + ExcelJS
Cron Jobs:    Vercel Cron (follow-up scheduling)
Hosting:      Vercel
```

---

## Pricing

```
Free Trial:      20 leads, 5 emails, 7 days
Starter $49/mo:  300 leads, 1 sector, 1 city, email only
Growth $99/mo:   1500 leads, 3 sectors, 3 cities,
                 Arabic + English, follow-ups, analytics
Pro $199/mo:     Unlimited leads + cities, 3 users
Agency $399/mo:  Everything + 10 users, white-label
```

---

## Unit Economics

```
Find 100 leads (Google API):   ~$5.00
Write 100 emails (Claude):     ~$0.30
Send 100 emails (Resend):      ~$0.00
Instagram checks (100):        ~$0.00 MVP / ~$2 scale
Infrastructure:                $0-40/month

At 20 Starter customers:
  Revenue:  $980/month
  Costs:    ~$420/month
  Profit:   $560/month ✅
```

---

## Go-To-Market

```
Phase 1 (Month 1-3):   Menumize internal testing
Phase 2 (Month 3-4):   5-10 free beta users
                        Target: agencies + CCTV companies Qatar
Phase 3 (Month 4-5):   First paying customers
Phase 4 (Month 6+):    Public launch Qatar + UAE
Phase 5 (Month 9+):    AppSumo, Saudi expansion
```

---

## Build Roadmap

```
Week 1-2:   Auth + onboarding + Google Maps API
Week 3-4:   Master DB architecture + per-user leads
            Website scraping + Instagram check
Week 5-6:   Lead scoring + CRM CSV upload
Week 7-8:   PDF upload + Claude email generation
Week 9-10:  Approval UI + Resend email sending
Week 11-12: Follow-up sequences + pipeline dashboard
Week 13-14: Analytics + Menumize beta testing
Month 4:    First paying external customers
```

---

## Post-MVP Roadmap

```
V2 — Integrations:
  Gmail OAuth, email history analysis,
  HubSpot/Zoho live sync, Calendly

V3 — Channels:
  WhatsApp Business API (Unifonic),
  SMS, platform benchmarks dashboard

V4 — Intelligence:
  AI reply handling, predictive scoring,
  ICP auto-refinement, sector learning

V5 — Platform:
  White-label, GCC business DB as product,
  marketplace layer (businesses find each other)
```

---

## Notes for Claude Code / Cursor

- Stack: Next.js App Router, Prisma, Neon, Auth.js v5, Claude API, Resend
- **UI: shadcn/ui + Tailwind CSS v4** — always use shadcn/ui components first; use Tailwind utility classes for layout/spacing/custom styling
- **Never use inline styles** — Tailwind classes only
- **shadcn/ui components to prefer:** Button, Input, Label, Card, Dialog, Sheet, Tabs, Select, Badge, Avatar, Separator, DropdownMenu, Form (react-hook-form + zod), Table, Skeleton, Toast/Sonner
- **RTL support:** use `dir="rtl"` on containers for Arabic content; Tailwind's `rtl:` variant for mirrored layouts
- **Two-layer DB is non-negotiable** — master_businesses (shared) + user_leads (private) from day one
- **Every user_leads query must be scoped to user_id** — no exceptions, ever
- **master_businesses is never scoped to user** — it is platform-wide
- **Sending gate:** every send function must verify `status === 'approved'` — hard check in code, no bypassing
- **Never auto-send** — follow-ups generate as `pending_approval`, user approves on next login
- **Scores are calculated per user** from shared master data — not stored in master_businesses
- Rate limit sending: max 50 emails/hour per user
- Soft delete only — archive, never hard delete
- Arabic RTL support required across all UI
- Use `claude-sonnet-4-20250514` for all AI calls
- File parsing: pdf-parse for PDFs, ExcelJS for CSV/Excel
- Instagram check: direct HTTP request in MVP, swap to RapidAPI when scaling
- Google Places: Text Search endpoint first, then Place Details for enrichment
- Cron job runs daily: finds user_followups where scheduled_for <= now AND status = pending_approval, sends notification to user
- First test scenario: Menumize finding restaurants in Doha — build and optimize this flow first
