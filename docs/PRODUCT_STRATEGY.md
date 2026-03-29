# LeadGen GCC — Product Strategy

> Strategic context, scoring formula, pricing, GTM, and roadmap.
> Read this when making product decisions, not during feature development.

---

## Pipeline Flow

```
User clicks "Find Leads" (sector + city)
  ↓ Google Maps Places API → name, phone, website, rating, address
  ↓ Puppeteer → has digital menu? QR code? Instagram link?
  ↓ Instagram check → followers, post count, last post date
  ↓ Lead scoring → Hot / Warm / Cold
  ↓ Claude API → personalized email (uses user's uploaded materials)
  ↓ Lead appears in dashboard — status: pending_approval
  ↓ [USER] Reviews → Approve / Edit / Reject
  ↓ Approved emails send via Resend

Timeline: 50 leads processed in ~2–3 min | User time: ~20 min to review
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
  < 6 months    = 20 | 6–24 months = 15 | 2–5 years = 8 | 5+ years = 3

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

## Social Signal Priority by Sector

| Sector | Priority 1 | Priority 2 | Skip |
|---|---|---|---|
| Restaurants / Cafes | Instagram | Facebook | LinkedIn |
| Marketing Agencies | LinkedIn | Instagram | — |
| CCTV / B2B | LinkedIn | Website | Instagram |
| Food Suppliers | Website | LinkedIn | Instagram |

**Social → Email angle (restaurants):**
- No Instagram → "You're invisible on social media"
- Dormant 47 days → "Your Instagram hasn't been updated in 47 days"
- Active, 500 followers → Focus on menu pain point instead
- 10k+ followers, daily posts → Score drops (likely has agency)

---

## Data Freshness Rule

```
last_enriched_at < 30 days → serve from master_businesses instantly
last_enriched_at > 30 days → re-enrich in background, update for all users
```

---

## Social Check Cost

```
MVP — direct HTTP:   Free, works <100/day, occasional blocking risk
Scale — RapidAPI:    ~$10–49/month, reliable, handles proxies
Switch when:         First paying users arrive
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
Month 1–3:  Menumize internal testing (Doha restaurants)
Month 3–4:  5–10 free beta users (agencies + CCTV in Qatar)
Month 4–5:  First paying customers
Month 6+:   Public launch Qatar + UAE
Month 9+:   AppSumo, Saudi expansion
```

---

## Build Roadmap

```
Week 1–2:   Auth + onboarding (3 steps) + Vercel deploy   ✅ Done
Week 3–4:   Master DB + per-user leads + scraping
Week 5–6:   Lead scoring + CRM CSV upload
Week 7–8:   Claude email generation
Week 9–10:  Approval UI + Resend sending
Week 11–12: Follow-ups + pipeline dashboard
Week 13–14: Analytics + Menumize beta testing
Month 4:    First paying external customers
```

---

## Post-MVP Roadmap

```
V2: Gmail OAuth, email history, HubSpot/Zoho sync, Calendly
V3: WhatsApp API (Unifonic), SMS, platform benchmarks
V4: AI reply handling, predictive scoring, sector learning
V5: White-label, GCC business DB as product
```

---

## MVP Scope

**In:** Auth, onboarding, materials upload, Google Maps discovery, website scraping, Instagram check, CRM CSV upload, lead scoring, Claude email gen, approval UI, Resend sending, follow-ups (max 2), pipeline dashboard, basic analytics

**Out (post-MVP):** Gmail/Outlook OAuth, live CRM sync, WhatsApp, SMS, AI replies, team accounts, white-label, advanced social analytics
