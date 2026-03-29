# Database Schema Reference

> **Last Updated:** 2026-03-29
> **Status:** Production — all tables migrated to Neon
> **Tech:** Prisma 7.6, Neon PostgreSQL (Frankfurt / eu-central-1), @prisma/adapter-neon

---

## Quick Reference

**Two-layer architecture — core design decision:**

| Layer | Table(s) | Scope | Purpose |
|---|---|---|---|
| Layer 1 | `master_businesses`, `platform_signals` | Platform-wide | Shared business data — discovered once, served to all users |
| Layer 2 | `user_leads`, `user_emails`, `user_followups`, `campaigns`, `materials`, `existing_contacts` | Per-user (`userId`) | Each user's private relationship with businesses |

**Rule:** `master_businesses` is NEVER scoped to `userId`. Every other query MUST include `where: { userId }`.

---

## Connection Setup

### `prisma.config.ts` (CLI / migrations)
```typescript
// Uses DATABASE_URL_UNPOOLED (direct connection)
import { defineConfig } from 'prisma/config'
import { config } from 'dotenv'
config({ path: '.env' })

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: { url: process.env.DATABASE_URL_UNPOOLED },
})
```

### `lib/prisma.ts` (runtime singleton)
```typescript
// Uses DATABASE_URL (pooled via Neon serverless)
import { PrismaNeon } from '@prisma/adapter-neon'
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
export const prisma = new PrismaClient({ adapter })
```

### Environment Variables
```bash
DATABASE_URL="postgresql://...@ep-...-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
DATABASE_URL_UNPOOLED="postgresql://...@ep-....c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require"
```

`.env` — read by Prisma CLI. `.env.local` — read by Next.js at runtime. Both have the same DB URLs.

---

## Schema — Layer 1 (Platform-Owned)

### `master_businesses`
Shared GCC business data. Never scoped to a user.

| Key Field | Type | Notes |
|---|---|---|
| `id` | String | cuid() |
| `googlePlaceId` | String UNIQUE | Deduplication key |
| `name`, `sector`, `city`, `country` | String | Core identity |
| `phone`, `email`, `website` | String? | Contact |
| `googleRating`, `googleReviewCount` | Float/Int? | Reputation signals |
| `hasDigitalMenu`, `hasQrCode`, `hasOnlineOrder` | Boolean | Website signals |
| `instagramFollowers`, `instagramLastPostAt`, `instagramIsActive` | Mixed? | Social signals |
| `lastEnrichedAt` | DateTime? | Freshness — re-enrich if >30 days |

Indexes: `[city, sector]`, `[sector, lastEnrichedAt]`, `[googlePlaceId]`

### `platform_signals`
Anonymous outcome data. No userId ever stored here.

---

## Schema — Layer 2 (Per-User)

### `users`
| Key Field | Notes |
|---|---|
| `id`, `email`, `name` | Core identity |
| `businessName`, `industry`, `whatTheySell` | Collected in onboarding step 1+2 |
| `onboarded` | false until step 3 completes |
| `plan` | FREE / STARTER / GROWTH / PRO / AGENCY |
| `role` | USER / ADMIN |

### `campaigns`
User's search run — defines sector + city + filters.
`status`: DRAFT → RUNNING → COMPLETED / PAUSED

### `user_leads`
Private relationship between a user and a `master_business`.

| Key Field | Notes |
|---|---|
| `userId` | Always present — strict scoping |
| `masterBusinessId` | Links to shared layer |
| `score` (0-100), `scoreLabel` (HOT/WARM/COLD) | Calculated per user — not in master |
| `status` | NEW → EMAIL_DRAFT → EMAIL_APPROVED → EMAIL_SENT → OPENED → REPLIED → MEETING → CLOSED_WON / CLOSED_LOST |
| `isSuppressed` | User-level do-not-contact — does NOT affect other users |

Unique constraint: `[userId, masterBusinessId]` — one record per user+business.

### `user_emails`
AI-generated emails. **Hard gate:** `status` must be `'APPROVED'` before sending.

`status`: DRAFT → APPROVED / REJECTED → SENT → BOUNCED

### `user_followups`
Follow-up sequences. Max 2 per lead (enforced in app logic).

`status`: PENDING_APPROVAL → APPROVED → SENT / CANCELLED

Cron query: `where: { scheduledFor: { lte: now }, status: 'PENDING_APPROVAL' }`

### `materials`
Uploaded PDF/DOCX/TXT files. `contentExtracted` = full parsed text used in AI prompts.

### `existing_contacts`
Imported from user's CRM CSV. Used for deduplication — skip leads whose email is here.

---

## Auth Models (Auth.js v5)

`users`, `accounts`, `sessions`, `verification_tokens`, `password_reset_tokens`

Standard Auth.js Prisma adapter pattern. `sessions` table holds DB sessions (not JWT).

---

## Billing Models

`subscriptions`, `payments` — Paddle structure (copied from Menumize). Not active in MVP.

---

## Common Queries

### Scoped lead query (always include userId)
```typescript
const leads = await prisma.userLead.findMany({
  where: { userId: session.user.id, campaignId },
  include: { masterBusiness: true },
})
```

### Master business lookup (never scope to user)
```typescript
const business = await prisma.masterBusiness.findUnique({
  where: { googlePlaceId: placeId },
})
```

### Data freshness check
```typescript
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
const isStale = !business.lastEnrichedAt || business.lastEnrichedAt < thirtyDaysAgo
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

# Apply existing migrations to prod
npx prisma migrate deploy

# Regenerate client after schema change
npx prisma generate
```

Migration files live in `prisma/migrations/`. First migration: `20260329145814_init`.

---

## Soft Delete Rule

Never use `prisma.X.delete()`. Use status fields:
- Leads: `status = 'CLOSED_LOST'` or `isSuppressed = true`
- Emails: `status = 'REJECTED'`
- Follow-ups: `status = 'CANCELLED'`
