# LeadGen GCC — Project Structure
> Read this alongside CLAUDE.md for full context.
> This file explains the folder structure, file conventions,
> and where everything lives so Claude Code navigates efficiently.

---

## Full Folder Structure

```
leadgen-gcc/
│
├── CLAUDE.md                          # ← READ FIRST. Full project context.
├── STRUCTURE.md                       # ← This file. Navigation guide.
├── TODO.md                            # ← Dev checklist. Track progress here.
│
├── prisma/
│   └── schema.prisma                  # ← Database schema. All models here.
│
├── app/                               # Next.js App Router
│   │
│   ├── (auth)/                        # Auth routes — no sidebar/nav
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   └── layout.tsx                 # Centered card layout
│   │
│   ├── (onboarding)/                  # Onboarding wizard — separate from dashboard
│   │   ├── onboarding/
│   │   │   ├── step-1/page.tsx        # Business name + industry
│   │   │   ├── step-2/page.tsx        # What they sell (plain text)
│   │   │   └── step-3/page.tsx        # Upload materials (PDF/Word)
│   │   └── layout.tsx
│   │
│   ├── (dashboard)/                   # Main app — authenticated users only
│   │   ├── layout.tsx                 # Sidebar + topbar layout
│   │   │
│   │   ├── dashboard/
│   │   │   └── page.tsx               # Overview: stats, recent activity
│   │   │
│   │   ├── campaigns/
│   │   │   ├── page.tsx               # List all campaigns
│   │   │   ├── new/page.tsx           # Create campaign wizard
│   │   │   └── [campaignId]/
│   │   │       ├── page.tsx           # Campaign detail + leads list
│   │   │       └── settings/page.tsx  # Edit campaign config
│   │   │
│   │   ├── leads/
│   │   │   ├── page.tsx               # All leads across campaigns
│   │   │   └── [leadId]/page.tsx      # Lead detail: profile + emails + history
│   │   │
│   │   ├── pipeline/
│   │   │   └── page.tsx               # Kanban view: Found→Sent→Replied→Closed
│   │   │
│   │   ├── emails/
│   │   │   ├── page.tsx               # Approval queue: all pending emails
│   │   │   └── [emailId]/page.tsx     # Single email preview + approve/edit
│   │   │
│   │   ├── analytics/
│   │   │   └── page.tsx               # Reply rates, open rates, conversions
│   │   │
│   │   └── settings/
│   │       ├── page.tsx               # Account settings
│   │       ├── materials/page.tsx     # Manage uploaded PDF/Word files
│   │       ├── crm/page.tsx           # Upload CRM CSV export
│   │       └── billing/page.tsx       # Plan + subscription
│   │
│   ├── api/                           # API Routes
│   │   │
│   │   ├── auth/[...nextauth]/
│   │   │   └── route.ts               # Auth.js v5 handler
│   │   │
│   │   ├── campaigns/
│   │   │   ├── route.ts               # GET list, POST create
│   │   │   └── [campaignId]/
│   │   │       ├── route.ts           # GET, PATCH, DELETE
│   │   │       └── run/route.ts       # POST → trigger lead discovery
│   │   │
│   │   ├── leads/
│   │   │   ├── route.ts               # GET all leads
│   │   │   └── [leadId]/
│   │   │       ├── route.ts           # GET, PATCH status
│   │   │       └── generate-email/route.ts  # POST → Claude generates email
│   │   │
│   │   ├── emails/
│   │   │   ├── route.ts               # GET approval queue
│   │   │   └── [emailId]/
│   │   │       ├── approve/route.ts   # POST → approve email
│   │   │       ├── reject/route.ts    # POST → reject email
│   │   │       └── send/route.ts      # POST → send (checks approved status)
│   │   │
│   │   ├── followups/
│   │   │   └── [followupId]/
│   │   │       ├── approve/route.ts   # POST → approve followup
│   │   │       └── send/route.ts      # POST → send followup
│   │   │
│   │   ├── materials/
│   │   │   ├── route.ts               # POST → upload + parse PDF/Word
│   │   │   └── [materialId]/route.ts  # DELETE
│   │   │
│   │   ├── crm/
│   │   │   └── upload/route.ts        # POST → parse CSV, save existing_contacts
│   │   │
│   │   ├── tracking/
│   │   │   └── [trackingId]/route.ts  # GET → open pixel tracking
│   │   │
│   │   └── cron/
│   │       └── followups/route.ts     # GET → Vercel Cron daily job
│   │
│   ├── layout.tsx                     # Root layout: fonts, providers
│   └── globals.css
│
├── components/
│   │
│   ├── ui/                            # Base shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   ├── textarea.tsx
│   │   └── ...
│   │
│   ├── layout/                        # App chrome
│   │   ├── sidebar.tsx
│   │   ├── topbar.tsx
│   │   └── mobile-nav.tsx
│   │
│   ├── campaigns/
│   │   ├── campaign-card.tsx
│   │   ├── campaign-wizard.tsx        # Multi-step create campaign
│   │   └── campaign-status-badge.tsx
│   │
│   ├── leads/
│   │   ├── leads-table.tsx            # Sortable/filterable table
│   │   ├── lead-card.tsx              # Card variant for pipeline
│   │   ├── lead-detail.tsx            # Full lead profile drawer
│   │   ├── lead-score-badge.tsx       # HOT 🔥 / WARM 🟡 / COLD ❄️
│   │   └── lead-status-select.tsx     # Dropdown to change status
│   │
│   ├── emails/
│   │   ├── email-preview.tsx          # Subject + body preview
│   │   ├── email-editor.tsx           # Inline edit before approval
│   │   ├── approval-queue.tsx         # List of pending emails
│   │   └── bulk-approve-dialog.tsx    # Select all + confirm
│   │
│   ├── pipeline/
│   │   └── kanban-board.tsx           # Drag-and-drop pipeline
│   │
│   ├── analytics/
│   │   ├── stats-cards.tsx            # Reply rate, open rate, etc.
│   │   └── campaign-chart.tsx
│   │
│   └── onboarding/
│       ├── step-indicator.tsx
│       └── material-upload.tsx
│
├── lib/
│   │
│   ├── auth.ts                        # Auth.js v5 config (copied from Menumize)
│   ├── auth.config.ts                 # Auth providers config
│   ├── db.ts                          # Prisma client singleton
│   │
│   ├── claude.ts                      # Claude API wrapper
│   │                                  # model: claude-sonnet-4-20250514
│   │                                  # Always use this, never call API directly
│   │
│   ├── google-maps.ts                 # Google Places API wrapper
│   │                                  # textSearch() + placeDetails()
│   │
│   ├── instagram.ts                   # Instagram basic check
│   │                                  # getPublicProfile(username)
│   │                                  # Returns: followers, posts, lastPostAt
│   │
│   ├── website-scraper.ts             # Puppeteer website check
│   │                                  # scrapeWebsite(url) → signals object
│   │
│   ├── email.ts                       # Resend email sending wrapper
│   │                                  # sendEmail() — checks approved status first
│   │
│   ├── file-parser.ts                 # PDF + Excel/Word parsing
│   │                                  # parsePdf(buffer) → string
│   │                                  # parseCsv(buffer) → Contact[]
│   │
│   ├── scoring.ts                     # Lead scoring engine
│   │                                  # scoreLead(business, userIndustry) → 0-100
│   │                                  # getSectorWeights(industry) → weights object
│   │
│   └── utils.ts                       # Shared utilities
│
├── lib/actions/                       # Server Actions (mutations)
│   ├── auth.actions.ts                # login, register, resetPassword
│   ├── campaign.actions.ts            # createCampaign, runCampaign, deleteCampaign
│   ├── lead.actions.ts                # updateLeadStatus, suppressLead
│   ├── email.actions.ts              # approveEmail, rejectEmail, generateEmail
│   ├── followup.actions.ts            # approveFollowup, cancelFollowup
│   ├── material.actions.ts            # uploadMaterial, deleteMaterial
│   └── crm.actions.ts                 # importCsv, clearExistingContacts
│
├── lib/queries/                       # Read-only DB queries
│   ├── user.queries.ts                # getUser, getUserWithMaterials
│   ├── campaign.queries.ts            # getCampaigns, getCampaignWithLeads
│   ├── lead.queries.ts                # getLeads, getLeadWithEmails
│   ├── email.queries.ts               # getApprovalQueue, getEmailById
│   └── analytics.queries.ts           # getReplyRate, getOpenRate, getConversions
│
├── lib/prompts/                       # Claude prompt templates
│   ├── generate-email.ts              # Main outreach email prompt
│   ├── generate-followup.ts           # Follow-up email prompt
│   └── score-lead.ts                  # Optional AI-assisted scoring
│
├── types/
│   ├── index.ts                       # Re-exports all types
│   ├── lead.types.ts                  # LeadStatus, ScoreLabel, etc.
│   ├── campaign.types.ts
│   └── api.types.ts                   # API response shapes
│
└── middleware.ts                      # Auth.js middleware — protect dashboard routes
```

---

## Key Conventions

### Database Access
```typescript
// Always use lib/queries/ for reads
import { getLeads } from "@/lib/queries/lead.queries"

// Always use lib/actions/ for writes (Server Actions)
import { approveEmail } from "@/lib/actions/email.actions"

// Never call Prisma directly in components or pages
// Never write raw SQL
```

### The Send Gate — Non-Negotiable
```typescript
// In lib/email.ts — this check is mandatory
export async function sendEmail(emailId: string) {
  const email = await db.userEmail.findUnique({
    where: { id: emailId }
  })

  // HARD GATE — never bypass this
  if (email?.status !== "APPROVED") {
    throw new Error("Email must be APPROVED before sending")
  }

  // proceed with Resend...
}
```

### Multi-Tenancy — Every Query Scoped
```typescript
// ALWAYS include userId in every query
// NEVER query without userId scope
const leads = await db.userLead.findMany({
  where: {
    userId: session.user.id,  // ← always
    campaignId: campaignId
  }
})

// EXCEPTION: MasterBusiness is platform-wide
// It is NEVER scoped to userId
const business = await db.masterBusiness.findUnique({
  where: { googlePlaceId: placeId }
})
```

### Claude API Calls
```typescript
// Always use lib/claude.ts wrapper — never call API directly
import { generateEmail } from "@/lib/claude"

// model is always claude-sonnet-4-20250514
// prompt templates live in lib/prompts/
```

### Scoring Logic
```typescript
// lib/scoring.ts
// Score is calculated at query time for each user
// NEVER stored in MasterBusiness — always in UserLead
// Different users get different scores for same business

const score = scoreLead(masterBusiness, user.industry)
// Returns: { score: 78, label: "HOT", breakdown: {...} }
```

### Soft Delete Only
```typescript
// Never hard delete leads or emails
// Use status fields instead:
// leads: status = "DEAD" | "NOT_INTERESTED"
// emails: status = "REJECTED"
// followups: status = "CANCELLED"
```

---

## Environment Variables

```bash
# .env.local

# Database
DATABASE_URL="postgresql://..."

# Auth.js v5
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (optional — email/password is primary)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# AI
ANTHROPIC_API_KEY="..."

# Lead Discovery
GOOGLE_PLACES_API_KEY="..."

# Email Sending
RESEND_API_KEY="..."
RESEND_FROM_EMAIL="outreach@leadgengcc.com"

# Cron Security
CRON_SECRET="..."   # passed as Authorization header by Vercel Cron
```

---

## API Route Patterns

```typescript
// Protected routes check session first
import { auth } from "@/lib/auth"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  // always use session.user.id for queries
}
```

---

## Cron Job Setup (Vercel)

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/followups",
      "schedule": "0 6 * * *"
    }
  ]
}
```

The cron job at `/api/cron/followups`:
1. Finds all `UserFollowup` where `scheduledFor <= now` AND `status = PENDING_APPROVAL`
2. Notifies user (email or in-app) that follow-ups need review
3. Does NOT auto-send — only surfaces for approval

---

## Data Flow — Lead Discovery

```
POST /api/campaigns/[id]/run
  ↓
google-maps.ts → textSearch(businessType, city)
  ↓
For each result:
  Check MasterBusiness by googlePlaceId
    FOUND + enriched recently → use cached data
    NOT FOUND or stale → enrich:
      google-maps.ts → placeDetails(placeId)
      website-scraper.ts → scrapeWebsite(url)
      instagram.ts → getPublicProfile(username)
      Save/update MasterBusiness
  ↓
  Create UserLead with:
    userId = session.user.id
    masterBusinessId = business.id
    score = scoreLead(business, user.industry)
    status = "NEW"
  ↓
  Skip if:
    UserLead already exists for this user+business
    Business email found in ExistingContacts
```

---

## Data Flow — Email Generation + Send

```
POST /api/leads/[leadId]/generate-email
  ↓
Load: UserLead → MasterBusiness (full profile)
Load: User → Materials (extracted content)
  ↓
claude.ts → generateEmail(business, materials, language, tone)
  ↓
Save UserEmail with status = "DRAFT"
  ↓
User sees email in approval queue
  ↓
POST /api/emails/[emailId]/approve
  → status = "APPROVED"
  ↓
POST /api/emails/[emailId]/send
  → email.ts checks status === "APPROVED" ← hard gate
  → Resend sends email
  → status = "SENT", sentAt = now
  → UserLead status = "EMAIL_SENT"
  ↓
[Later] Tracking pixel hit
  → GET /api/tracking/[trackingId]
  → UserEmail.openedAt = now, openCount++
  → UserLead status = "OPENED"
```

---

## Module Reference — Quick Lookup

| Need to... | Go to... |
|---|---|
| Find auth config | `lib/auth.ts` + `lib/auth.config.ts` |
| Query DB | `lib/queries/[domain].queries.ts` |
| Mutate DB | `lib/actions/[domain].actions.ts` |
| Call Claude API | `lib/claude.ts` |
| Search Google Maps | `lib/google-maps.ts` |
| Check Instagram | `lib/instagram.ts` |
| Scrape a website | `lib/website-scraper.ts` |
| Send an email | `lib/email.ts` |
| Parse PDF or CSV | `lib/file-parser.ts` |
| Score a lead | `lib/scoring.ts` |
| Edit email prompts | `lib/prompts/` |
| Add a UI component | `components/ui/` |
| Add a page | `app/(dashboard)/[feature]/page.tsx` |
| Add an API endpoint | `app/api/[feature]/route.ts` |
| Add a type | `types/[domain].types.ts` |

---

## First Thing to Build

Start here — in this exact order:

```
1. prisma/schema.prisma          ← already done (see schema.prisma)
2. lib/db.ts                     ← Prisma client singleton
3. lib/auth.ts                   ← Copy from Menumize, adapt imports
4. middleware.ts                 ← Protect dashboard routes
5. app/(auth)/login/page.tsx     ← Login page
6. app/(auth)/register/page.tsx  ← Register page
7. app/(onboarding)/...          ← Onboarding wizard
8. lib/google-maps.ts            ← Places API
9. lib/scoring.ts                ← Scoring engine
10. app/(dashboard)/campaigns/   ← First real feature
```

---

## Notes on Menumize Reuse

This project is **separate** from Menumize. Do not mix them.

What was copied from Menumize:
- Auth.js v5 config pattern (`lib/auth.ts`, `lib/auth.config.ts`)
- Prisma auth models (User, Account, Session, VerificationToken, PasswordResetToken)
- Subscription + Payment models (same Paddle structure)

What was NOT copied:
- Venue, Menu, Section, Item models
- GuestIdentity, VenueGuest, LoyaltyCard
- Any restaurant-specific logic
- The monorepo structure (this is a single Next.js app)

When in doubt: if it's restaurant-related, it doesn't belong here.
