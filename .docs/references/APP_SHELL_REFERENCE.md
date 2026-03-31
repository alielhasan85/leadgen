# App Shell Reference

> **Last Updated:** 2026-03-29 (Session 3)
> **Status:** Production
> **Tech:** Next.js App Router, motion/react, @tabler/icons-react

---

## Quick Reference

| File | Purpose |
|---|---|
| `components/layout/app-sidebar.tsx` | Sidebar component (client) |
| `app/(dashboard)/layout.tsx` | Dashboard shell — auth guard + renders sidebar |

---

## Layout Structure

```
app/(dashboard)/layout.tsx  (server component)
  → auth guard: !session → /login | !onboarded → /signup/profile
  → renders: <AppSidebar user={...} /> + <main>{children}</main>

AppSidebar  (client component)
  → DesktopSidebar  — collapsible, 240px open / 64px collapsed
  → MobileSidebar   — hamburger → full-screen drawer
  → UserMenu        — avatar + dropdown at sidebar bottom
```

---

## Sidebar Navigation

### Primary links (always visible)
| Label | Route | Icon |
|---|---|---|
| Dashboard | `/dashboard` | `IconLayoutDashboard` |
| Discover | `/discover` | `IconSearch` |
| My Leads | `/leads` | `IconBuilding` |
| Outreach | `/outreach` | `IconMail` |

### Groups (collapsible)
| Group | Label | Route |
|---|---|---|
| Pipeline | Campaigns | `/campaigns` |
| Data | Contacts | `/contacts` |
| Reporting | Analytics | `/analytics` |
| Settings | Business Profile | `/settings/profile` |
| Settings | Materials | `/settings/materials` |
| Settings | Billing | `/settings/billing` |

---

## Scaffold Pages

All pages below exist as stubs — title + description + dashed placeholder.
Replace the placeholder with real UI when building that phase.

| Route | File | Phase |
|---|---|---|
| `/dashboard` | `app/(dashboard)/dashboard/page.tsx` | ✅ Active |
| `/discover` | `app/(dashboard)/discover/page.tsx` | Phase 2 |
| `/leads` | `app/(dashboard)/leads/page.tsx` | Phase 4 |
| `/outreach` | `app/(dashboard)/outreach/page.tsx` | Phase 6 |
| `/campaigns` | `app/(dashboard)/campaigns/page.tsx` | Phase 4 |
| `/contacts` | `app/(dashboard)/contacts/page.tsx` | Phase 3 |
| `/analytics` | `app/(dashboard)/analytics/page.tsx` | Phase 8 |
| `/settings/profile` | `app/(dashboard)/settings/profile/page.tsx` | Soon |
| `/settings/materials` | `app/(dashboard)/settings/materials/page.tsx` | ✅ Active |
| `/settings/billing` | `app/(dashboard)/settings/billing/page.tsx` | Post-MVP |

---

## AppSidebar Props

```typescript
<AppSidebar user={{ name, email, image }} />
// user is passed from layout.tsx server component (from session)
```

---

## Sidebar Behaviour

- **Collapse toggle:** hover sidebar → arrow button appears top-right
- **State persistence:** `localStorage` keys `lg-sidebar-open` + `lg-sidebar-groups`
- **Active link:** detected via `usePathname()` — highlighted with `bg-zinc-100`
- **Groups:** default state — Pipeline expanded, others collapsed

---

## User Menu (bottom of sidebar)

- Shows initials avatar + name + email (when expanded)
- Click → dropdown with: Settings, Billing, Sign out
- Sign out calls `signOut({ callbackUrl: '/login' })` from `next-auth/react`

---

## Dependencies

Both already installed — no additions needed:
- `motion` (v12+) — sidebar collapse + group animations
- `@tabler/icons-react` (v3+) — all nav icons

---

## Extending the Sidebar

To add a new nav link:
1. Add to `primaryLinks` or a `groups[].links` array in `app-sidebar.tsx`
2. Create the route page in `app/(dashboard)/[route]/page.tsx`
3. No layout changes needed

To add a new group:
1. Add entry to the `groups` array with `id`, `label`, `icon`, `links[]`
2. Add default expanded state in `useState` initial value
