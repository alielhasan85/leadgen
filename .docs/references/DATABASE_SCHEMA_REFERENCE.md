# Database Schema Reference

> **Last Updated:** 2026-03-31
> **Status:** Production — all tables migrated to Neon (migration: phase2_icp_enrichment_fields)
> **Tech:** Prisma 7.6, Neon PostgreSQL (Frankfurt / eu-central-1), @prisma/adapter-neon

---

## Quick Reference

**Three-layer architecture:**

| Layer | Table(s) | Scope | Purpose |
|---|---|---|---|
| Layer 0 | `materials`, `icp_templates` | Per-user | User config — what they sell, who they target |
| Layer 1 | `master_businesses`, `platform_signals` | Platform-wide | Shared business data — discovered once, served to all users |
| Layer 2 | `user_leads`, `user_emails`, `user_followups`, `campaigns`, `existing_contacts` | Per-user (`userId`) | Each user's private pipeline and outreach |

**Hard rules:**
- `master_businesses` is NEVER scoped to `userId`
- Every Layer 2 query MUST include `where: { userId }`
- Scoring ALWAYS reads from `campaign.icpCriteria` — never hardcoded weights
- Soft delete only — never `prisma.X.delete()`

---

## Connection Setup

### `prisma.config.ts` (CLI / migrations)
```typescript
// Uses DATABASE_URL_UNPOOLED (direct connection) for migrate commands only
import { defineConfig } from 'prisma/config'
import { config } from 'dotenv'
config({ path: '.env.local' }) // loads local env for CLI use

export default defineConfig({
  schema: 'prisma/schema.prisma',
  ...(process.env.DATABASE_URL_UNPOOLED && {
    datasource: { url: process.env.DATABASE_URL_UNPOOLED },
  }),
})
```

### `lib/db.ts` (runtime singleton)
```typescript
// Uses DATABASE_URL (pooled via Neon serverless)
import { PrismaNeon } from '@prisma/adapter-neon'
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
export const prisma = new PrismaClient({ adapter })
```

### Environment Variables
```bash
DATABASE_URL="postgresql://...@ep-...-pooler...neon.tech/neondb?sslmode=require&channel_binding=require"
DATABASE_URL_UNPOOLED="postgresql://...@ep-....neon.tech/neondb?sslmode=require"
```

`.env.local` — read by both Next.js runtime and Prisma CLI (after prisma.config.ts fix).

---

## Schema — Layer 0 (User Config)

### `materials`
Uploaded PDF/DOCX/TXT files. Claude reads `contentExtracted` when generating ICP criteria and outreach emails.

| Key Field | Type | Notes |
|---|---|---|
| `userId` | String | Scoped to user |
| `originalName` | String | User-facing filename |
| `fileType` | String | "pdf" \| "docx" \| "txt" |
| `contentExtracted` | String (Text) | Full parsed text — used in AI prompts |
| `fileSizeBytes` | Int? | For display |
| `aiSummary` | String? (Text) | Optional Claude-generated summary |
| `deletedAt` | DateTime? | Soft delete — always filter `where: { deletedAt: null }` |

### `icp_templates`
**NEW in Phase 2.** Reusable Ideal Customer Profile templates. AI generates these from user profile + materials + target sector. User adjusts and saves with a name. Campaigns copy their chosen template into `campaign.icpCriteria`.

| Key Field | Type | Notes |
|---|---|---|
| `userId` | String | Per-user — private |
| `name` | String | "Restaurants - No Digital Menu" |
| `targetSector` | String | "restaurant" \| "salon" \| "office" \| ... |
| `criteria` | Json | Full ICP JSON (see shape below) |
| `aiRationale` | String (Text) | Claude's explanation per criterion |

**ICP criteria JSON shape** (defined in `lib/services/icp-generator.ts`, validated with Zod):
```typescript
{
  targetDescription: string        // "Mid-high end restaurants with no digital menu"
  minPriceLevel: number            // 1–4
  minReviewCount: number           // proxy for business size
  minRating: number                // filter dying businesses
  minBusinessAgeMonths: number     // filter brand-new businesses
  instagramFollowersMin: number
  instagramFollowersMax: number
  mustNotHaveSignals: string[]     // ["hasDigitalMenu", "hasOnlineOrdering"]
  mustHaveSignals: string[]        // [] or ["hasWebsite"]
  scoringWeights: Record<string, number>  // signal → points
  aiRationale: string
}
```

Indexes: `[userId]`, `[userId, targetSector]`

---

## Schema — Layer 1 (Platform-Owned, Shared)

### `master_businesses`
Shared GCC business data. One record per real-world business. Never scoped to a user. Costs (Google API, Instagram check) paid ONCE per business across the platform.

| Key Field | Type | Notes |
|---|---|---|
| `googlePlaceId` | String UNIQUE | Deduplication key — upsert on this |
| `name`, `sector`, `city`, `country` | String | Core identity |
| `phone`, `email`, `website` | String? | Contact info |
| `googleRating`, `googleReviewCount` | Float/Int? | Reputation signals |
| `googlePriceLevel` | Int? | 1 ($) to 4 ($$$$) |
| `hasWebsite`, `hasDigitalMenu`, `hasQrCode`, `hasOnlineOrder` | Boolean | Website signals (Cheerio scraper) |
| `logoUrl` | String? | **NEW** — og:image from website |
| `instagramUsername` | String? | Extracted from website footer |
| `instagramFollowers`, `instagramPostCount` | Int? | From Apify |
| `instagramLastPostAt`, `instagramIsActive` | DateTime?/Boolean? | Activity signals |
| `facebookUrl`, `linkedinUrl` | String? | Other social |
| `lastEnrichedAt` | DateTime? | Re-enrich if >30 days old |
| `enrichVersion` | Int | Bump to force re-enrichment |

Indexes: `[city, sector]`, `[sector, lastEnrichedAt]`, `[googlePlaceId]`

### `platform_signals`
Anonymous aggregate outcome data. NEVER store userId or any identifying info here.

---

## Schema — Layer 2 (Per-User, Private)

### `users`
| Key Field | Notes |
|---|---|
| `businessName`, `industry`, `whatTheySell` | Collected in onboarding — Claude reads these for ICP generation |
| `onboarded` | false until onboarding step 3 completes |
| `plan` | FREE / STARTER / GROWTH / PRO / AGENCY |

### `campaigns`
A named search run. Defines target sector, location, and ICP criteria. One campaign = many UserLeads.

| Key Field | Type | Notes |
|---|---|---|
| `businessType` | String | Target sector: "restaurant" \| "salon" \| ... |
| `city`, `area` | String | Search scope |
| `language`, `tone` | String | For generated emails |
| `searchQuery` | String? | **NEW** — exact Google Maps query, e.g. `"restaurants in Al Sadd, Doha"`. Prevents re-running same search within 7 days |
| `icpTemplateId` | String? | **NEW** — which saved template was used as starting point |
| `icpCriteria` | Json? | **NEW** — live ICP JSON used for scoring. Copied from template at creation — template edits don't affect this campaign |
| `status` | String | DRAFT → RUNNING → COMPLETED / PAUSED |
| `leadsFound`, `leadsScored` | Int | Discovery progress counters |
| `followupDays`, `maxFollowups` | Int | Follow-up schedule defaults |

### `user_leads`
Each user's private pipeline entry for a business. One per user per business (unique constraint).

| Key Field | Type | Notes |
|---|---|---|
| `userId` | String | Always present — strict scoping |
| `masterBusinessId` | String | Links to shared layer 1 |
| `campaignId` | String? | Which campaign discovered this lead |
| `score` | Int (0–100) | **ICP-driven** — reads `campaign.icpCriteria`, never hardcoded |
| `scoreLabel` | String | "HOT" \| "WARM" \| "COLD" |
| `aiSummary` | String? | **NEW** — Claude's 2–3 line summary card for this lead |
| `status` | String | Pipeline stage (see below) |
| `outreachChannel` | String | **NEW** — "email" \| "whatsapp" \| "phone" \| "linkedin" \| "manual" |
| `contactedAt` | DateTime? | **NEW** — set on any channel, not just email |
| `isSuppressed` | Boolean | This user never wants to see this business again |
| `notes` | String? | Private user notes |

**`status` values (pipeline stages only — email-specific states are on `user_emails`):**
```
NEW             → just discovered, enrichment may be in progress
CONTACTED       → user has reached out via any channel
OPENED          → email was opened (tracked via pixel)
REPLIED         → lead replied to any outreach
MEETING         → meeting booked or confirmed
CLOSED_WON      → converted to customer
CLOSED_LOST     → decided not to pursue
NOT_INTERESTED  → lead said no
WRONG_CONTACT   → wrong business or unreachable
```

Unique constraint: `[userId, masterBusinessId]`
Indexes: `[userId, status]`, `[userId, scoreLabel]`, `[userId, campaignId]`, `[campaignId]`

### `user_emails`
AI-generated outreach emails. **Hard gate: `status` must be `'APPROVED'` before `sendEmail()` is called.**

`status`: DRAFT → APPROVED / REJECTED → SENT → BOUNCED

### `user_followups`
Scheduled follow-up sequence. Max 2 per lead (app logic). Auto-cancelled when lead replies.

`status`: PENDING_APPROVAL → APPROVED → SENT / CANCELLED / REJECTED

Cron query: `where: { scheduledFor: { lte: now }, status: 'APPROVED' }`

Unique constraint: `[userLeadId, sequenceNumber]` — one slot per position

### `existing_contacts`
Imported from user's CRM CSV. Used for deduplication — never contact someone already here.

---

## Common Queries

### Scoped lead query (always include userId)
```typescript
const leads = await prisma.userLead.findMany({
  where: { userId: session.user.id, campaignId, isSuppressed: false },
  include: { masterBusiness: true },
  orderBy: { score: 'desc' },
})
```

### Master business upsert (deduplication)
```typescript
await prisma.masterBusiness.upsert({
  where: { googlePlaceId: place.placeId },
  create: { ...placeData },
  update: { ...placeData, updatedAt: new Date() },
})
```

### Data freshness check
```typescript
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
const isStale = !business.lastEnrichedAt || business.lastEnrichedAt < thirtyDaysAgo
```

### ICP template usage in scoring
```typescript
// Always read from campaign — never use hardcoded weights
const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } })
const icp = campaign.icpCriteria as ICPCriteria
const score = calculateScore(business, icp)
```

### Send gate (mandatory before every send)
```typescript
const email = await prisma.userEmail.findUnique({ where: { id: emailId } })
if (email?.status !== 'APPROVED') throw new Error('Email must be APPROVED before sending')
```

---

## Migrations

```bash
# Create and apply new migration
npx prisma migrate dev --name [description]

# Apply to production
npx prisma migrate deploy

# Regenerate client after schema change
npx prisma generate
```

Migration files live in `prisma/migrations/`.
- First migration: `20260329_init`
- Phase 2 migration: `phase2_icp_enrichment_fields` — added logoUrl, aiSummary, outreachChannel, contactedAt, searchQuery, icpCriteria, icpTemplateId, ICPTemplate model

**Vercel build:** `package.json` build script runs `prisma generate && next build`.

---

## Soft Delete Rule

Never use `prisma.X.delete()`. Use status or flag fields:
- Materials: `deletedAt = new Date()`
- Leads: `isSuppressed = true` or `status = 'CLOSED_LOST'`
- Emails: `status = 'REJECTED'`
- Follow-ups: `status = 'CANCELLED'`
