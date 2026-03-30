# Auth System Reference

> **Last Updated:** 2026-03-29
> **Status:** Production
> **Tech:** Auth.js v5 (next-auth@5.0.0-beta.30), Google OAuth, Resend magic link, database sessions

---

## Quick Reference

**Two sign-in methods:**
- Google OAuth (`signIn('google', ...)`)
- Magic link email via Resend (`signIn('resend', ...)`)

**Session strategy:** Database sessions (not JWT) — stored in `sessions` table.

**Key files:**
| File | Purpose |
|---|---|
| `auth.ts` | Auth.js config, providers, callbacks, events |
| `app/api/auth/[...nextauth]/route.ts` | Route handler — exposes all auth endpoints |
| `proxy.ts` | Protects dashboard routes (Next.js 16 renamed middleware → proxy) |
| `lib/actions/auth.actions.ts` | `sendMagicLinkAction()` server action |
| `lib/auth/subscription.ts` | `ensureTrialSubscriptionForUser()` — called on new user |
| `types/next-auth.d.ts` | Session type augmentation |

---

## Auth Flow

```
User visits /login
  ↓
Google button → signIn('google') → Google OAuth → callback
Magic link → sendMagicLinkAction(email) → Resend email → user clicks link
  ↓
Auth.js signIn callback → check isActive (disabled check)
  ↓
Auth.js session callback → attach user.id, onboarded, isActive to session
  ↓
Auth.js events.createUser → ensureTrialSubscriptionForUser()
Auth.js events.signIn → ensureTrialSubscriptionForUser() + update lastLogin
  ↓
Redirected:
  onboarded = true  → /dashboard
  onboarded = false → /signup/profile
```

---

## Session Object

```typescript
// Access anywhere (server):
import { auth } from '@/auth'
const session = await auth()
session.user.id        // string — DB user ID
session.user.email     // string
session.user.onboarded // boolean
session.user.isActive  // boolean

// Access in client components:
import { useSession } from 'next-auth/react'
```

Session type is augmented in `types/next-auth.d.ts`.

---

## Route Handler

`app/api/auth/[...nextauth]/route.ts`:
```typescript
import { handlers } from '@/auth'
export const { GET, POST } = handlers
```

Exposes:
- `GET /api/auth/providers`
- `GET /api/auth/session`
- `GET /api/auth/callback/google`
- `POST /api/auth/signin`
- etc.

---

## Providers

### Google OAuth
```typescript
Google({
  clientId: process.env.AUTH_GOOGLE_ID!,
  clientSecret: process.env.AUTH_GOOGLE_SECRET!,
})
```
Required redirect URI: `http://localhost:3000/api/auth/callback/google`

### Resend Magic Link
```typescript
Resend({
  apiKey: process.env.RESEND_API_KEY!,
  from: 'LeadGen GCC <noreply@leadgengcc.com>',
  maxAge: 15 * 60,  // 15 minutes
})
```
Triggered via server action `sendMagicLinkAction(email)`.

---

## Session Cookie

```
Dev:  leadgen.session-token
Prod: __Host-leadgen.session-token  (Secure + __Host prefix)
```

---

## Guards

### Page-level (server component)
```typescript
const session = await auth()
if (!session?.user) redirect('/login')
if (!session.user.onboarded) redirect('/signup/profile')
```

### API route
```typescript
const session = await auth()
if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })
```

### Middleware (to be created)
`middleware.ts` at root should protect `/dashboard/*` routes using `auth()` from Auth.js.

---

## Environment Variables

```bash
AUTH_SECRET="..."             # Required — generate: node -e "require('crypto').randomBytes(32).toString('base64')"
AUTH_GOOGLE_ID="..."          # Google OAuth client ID
AUTH_GOOGLE_SECRET="..."      # Google OAuth client secret
RESEND_API_KEY="..."          # For magic link emails
NEXTAUTH_URL="http://localhost:3000"
```

---

## Auth Pages

| Route | File | Purpose |
|---|---|---|
| `/login` | `app/(auth)/login/page.tsx` | Login page — Google + magic link |
| `/login` (form) | `app/(auth)/login/login-form.tsx` | Client form component |
| `/check-email` | `app/(auth)/check-email/` | "Check your inbox" page |
| `/signup/profile` | `app/(auth)/signup/profile/page.tsx` | Onboarding step 1+2 |
| `/signup/materials` | `app/(auth)/signup/materials/page.tsx` | Onboarding step 3 |

All auth pages use the `app/(auth)/layout.tsx` — centered card layout, no nav.

---

## Known Issues / Watch Points

- `next-auth` must be `^5.0.0-beta.x` — the schema uses v5 exports (`NextAuthConfig`, `next-auth/providers/resend`)
- `OAuthAccountNotLinked` error shown when user tries Google OAuth with email that already has a magic-link account
- `auth()` is wrapped in React `cache()` as `uncachedAuth` — use `auth()` for deduplication within a request
- Next.js 16 renamed `middleware.ts` → `proxy.ts` — do not create a `middleware.ts` file
- Google OAuth redirect URI must be added in Google Cloud Console for each environment (localhost + production domain)

---

## Future

- Email/password login (not in MVP — magic link is primary)
- Account linking UI (link Google to existing magic-link account)
- Middleware-level route protection (currently handled per-page)
