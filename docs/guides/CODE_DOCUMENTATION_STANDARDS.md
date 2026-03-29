# Code Documentation Standards

> **Guidelines for in-code comments, JSDoc, and inline documentation**

---

## 🎯 Core Principle: Self-Documenting Code First

**Priority order:**
1. **Clear naming** - Variable/function names explain purpose
2. **Type safety** - TypeScript types document contracts
3. **Inline comments** - Only for "why", not "what"
4. **JSDoc** - For public APIs and complex functions
5. **Reference docs** - For subsystem architecture

---

## ✅ When to Add Comments

### DO Comment ✅

**1. Business Logic / "Why" Decisions**
```typescript
// Debounce search to avoid hammering the database
// 300ms chosen based on user testing (feels instant)
const debouncedQuery = useDebounce(query, 300);

// Discount applies only to non-promotional items
// per business requirement from 2026-01-15
if (!item.isPromotional && item.discountPercent > 0) {
  // ...
}
```

**2. Complex Algorithms**
```typescript
/**
 * Resolves the best locale for a venue based on:
 * 1. User's requested locale (from URL)
 * 2. Venue's supported locales
 * 3. Venue's default locale
 * 4. System fallback (en)
 */
export function resolveVenueLocale(
  requestedLocale: string,
  venue: { supportedLocales: string[]; defaultLocale: string }
): string {
  // Normalize locale (e.g., "en-US" → "en")
  const normalized = normalizeLang(requestedLocale);

  // Check if venue supports requested locale
  if (venue.supportedLocales.includes(normalized)) {
    return normalized;
  }

  // Fallback to venue default
  return venue.defaultLocale;
}
```

**3. Non-Obvious Technical Decisions**
```typescript
// Use separate database connection for search
// to avoid blocking main transaction pool
const searchClient = new PrismaClient({
  datasources: {
    db: { url: process.env.SEARCH_DATABASE_URL },
  },
});

// Cache for 5 minutes (not longer due to real-time menu updates)
export const revalidate = 300;
```

**4. Workarounds / Temporary Fixes**
```typescript
// FIXME: Temporary workaround for Next.js 15 metadata bug
// Remove when upgraded to 15.1.0+ (tracking issue #12345)
export const metadata = {
  title: venue.name ?? 'Menu'
};

// HACK: Force re-render to fix hydration mismatch
// Root cause: server/client date formatting difference
// TODO: Investigate proper fix with next-intl
useEffect(() => {
  setMounted(true);
}, []);
```

**5. Security / Validation Concerns**
```typescript
// SECURITY: Never trust client-provided venueId
// Always verify user has access to this venue
const venue = await getVenueForUser(venueId, session.user.id);
if (!venue) {
  throw new Error('Unauthorized');
}

// Sanitize user input to prevent XSS
// Uses DOMPurify to strip malicious HTML
const cleanDescription = sanitize(userInput);
```

---

### DON'T Comment ❌

**1. Obvious Code (Let code speak)**
```typescript
❌ BAD:
// Set the name to the user's name
const name = user.name;

// Loop through items
items.forEach(item => {
  // Do something with item
});

✅ GOOD (no comments needed):
const userName = user.name;

items.forEach(processMenuItem);
```

**2. Redundant TypeScript Info**
```typescript
❌ BAD:
/**
 * @param venueId - The venue ID (string)
 * @param userId - The user ID (string)
 * @returns A venue object or null
 */
async function getVenue(venueId: string, userId: string): Promise<Venue | null> {
  // Types already document this!
}

✅ GOOD:
/**
 * Fetches venue if user has access, otherwise returns null.
 * Checks OWNER and STAFF roles.
 */
async function getVenueForUser(venueId: string, userId: string): Promise<Venue | null> {
  // Explains authorization logic, not just types
}
```

**3. What the Code Already Says**
```typescript
❌ BAD:
// Create a new user
const newUser = await prisma.user.create({
  data: { email, name },
});

// Return the user
return newUser;

✅ GOOD (no comments):
return await prisma.user.create({
  data: { email, name },
});
```

---

## 📝 JSDoc Standards

### Components (Client & Server)

```typescript
/**
 * Displays a menu item card in the guest app.
 *
 * Supports three variants: LIST, CARD, GRID
 * See .docs/references/MENU_ITEM_CARD_REFERENCE.md for details
 *
 * @reference .docs/references/MENU_ITEM_CARD_REFERENCE.md
 */
export function ItemCard({ item, variant, config }: ItemCardProps) {
  // Implementation
}
```

### Server Actions

```typescript
/**
 * Updates a menu item with new data.
 *
 * Validates:
 * - User has OWNER or STAFF access to venue
 * - Item belongs to venue
 * - Required fields are present
 *
 * Revalidates:
 * - /venues/[venueId]/menu
 * - Guest app menu pages for this venue
 *
 * @param itemId - UUID of item to update
 * @param data - Partial item data (only provided fields updated)
 * @returns Success/error response
 * @throws {Error} If user lacks permissions
 *
 * @example
 * const result = await updateMenuItem('item-123', {
 *   title: { en: 'Pizza', ar: 'بيتزا' }
 * });
 */
export async function updateMenuItem(
  itemId: string,
  data: Partial<UpdateItemInput>
): Promise<ActionResponse<Item>> {
  // Implementation
}
```

### Utilities / Helpers

```typescript
/**
 * Extracts localized string for given locale with smart fallback.
 *
 * Fallback order:
 * 1. Exact locale match (e.g., "en")
 * 2. Venue default locale
 * 3. First available locale
 * 4. Empty string
 *
 * @param value - LocalizedString object or plain string
 * @param locale - Target locale (e.g., "en", "ar")
 * @returns Localized text or fallback
 *
 * @example
 * toLocaleString({ en: 'Pizza', ar: 'بيتزا' }, 'ar') // "بيتزا"
 * toLocaleString({ en: 'Pizza' }, 'ar') // "Pizza" (fallback)
 * toLocaleString('Plain text', 'ar') // "Plain text" (passthrough)
 */
export function toLocaleString(
  value: LocalizedString | string | null,
  locale: string
): string {
  // Implementation
}
```

### Complex Types

```typescript
/**
 * Configuration for menu item card display.
 *
 * Controls visual appearance of item cards in guest app.
 * Set per-venue in platform branding settings.
 *
 * @see .docs/references/MENU_ITEM_CARD_REFERENCE.md
 * @see packages/types/src/design/menu-page.ts
 */
export interface ItemsLayout {
  /** Layout variant: horizontal row, side-by-side, or vertical stack */
  variant: 'LIST' | 'CARD' | 'GRID';

  /** Visual chrome: border or shadow */
  frame: 'INSET' | 'OUTLINED' | 'ELEVATED';

  /** Price color strategy */
  priceStrategy: 'accent' | 'body' | 'derivedGreen' | 'custom';

  /** Custom price color (hex) - used when priceStrategy='custom' */
  customPriceHex: string | null;

  // ... more fields
}
```

---

## 🗂️ File-Level Documentation

### Reference to Documentation

Add this at the top of complex files:

```typescript
/**
 * Menu Search Provider - React Context for guest app search
 *
 * @reference .docs/references/SEARCH_SYSTEM_REFERENCE.md
 * @architecture Context API + API Routes + PostgreSQL full-text search
 *
 * Key responsibilities:
 * - Manage search query state
 * - Debounce user input (300ms)
 * - Trigger API calls to /api/search
 * - Provide results to MenuSearchOverlay
 */

'use client';

import { createContext, useContext, useState } from 'react';
// ... rest of file
```

### Architecture Patterns

For files implementing specific patterns:

```typescript
/**
 * Venue Server Actions - Mutations for venue data
 *
 * Pattern: Server Actions (Next.js App Router)
 * Location: apps/platform/lib/actions/venue.actions.ts
 *
 * All actions follow this structure:
 * 1. Validate session (must be authenticated)
 * 2. Check permissions (must have venue access)
 * 3. Perform mutation
 * 4. Revalidate cache
 * 5. Return ActionResponse<T>
 *
 * @see CLAUDE.md - Server Actions pattern
 */

'use server';

import { auth } from '@menumize/auth';
// ... rest of file
```

---

## 🏷️ Comment Tags

Use these tags for special cases:

### TODO
```typescript
// TODO: Add pagination when item count > 50
// TODO: Implement caching layer (Redis) - ticket #234
```

### FIXME
```typescript
// FIXME: Race condition when multiple staff edit simultaneously
// FIXME: Memory leak in useEffect cleanup - investigate
```

### HACK / WORKAROUND
```typescript
// HACK: Force client-side render to avoid hydration mismatch
// Remove when Next.js fixes metadata generation bug

// WORKAROUND: Use setTimeout to defer execution
// Proper fix requires refactoring the entire component tree
```

### SECURITY
```typescript
// SECURITY: SQL injection risk - always use parameterized queries
// SECURITY: XSS prevention - sanitize before rendering user content
```

### PERFORMANCE
```typescript
// PERFORMANCE: Memoize this calculation (runs on every render)
// PERFORMANCE: Consider virtualizing this list for 1000+ items
```

### NOTE / IMPORTANT
```typescript
// NOTE: Order matters - run migrations before seeders
// IMPORTANT: Don't change this without updating Paddle webhook handler
```

---

## 🎨 Inline Comment Style

### Formatting

```typescript
// Single-line comment - sentence case, period at end.

/**
 * Multi-line comment for longer explanations.
 * Each line starts with an asterisk.
 * Use for JSDoc or detailed context.
 */

/* Avoid block comments - use // or /** */ instead */
```

### Placement

```typescript
✅ GOOD - Comment above the code it explains:
// Fetch venue including all published menus
const venue = await prisma.venue.findUnique({
  where: { id: venueId },
  include: { menus: { where: { published: true } } },
});

❌ BAD - Comment on same line (hard to read):
const venue = await prisma.venue.findUnique({ where: { id: venueId } }); // Fetch venue
```

### Grouping

```typescript
// ===== VALIDATION =====
if (!session?.user) throw new Error('Unauthorized');
if (!venueId) throw new Error('Missing venueId');

// ===== DATABASE QUERY =====
const venue = await prisma.venue.findUnique({
  where: { id: venueId },
});

// ===== RESPONSE =====
return { success: true, data: venue };
```

---

## 🔗 Referencing Documentation

### Link to Reference Docs

```typescript
/**
 * Handles search queries in guest app.
 *
 * Full architecture details:
 * @see .docs/references/SEARCH_SYSTEM_REFERENCE.md
 */
```

### Link to CLAUDE.md Sections

```typescript
/**
 * Localized string extraction with fallback.
 *
 * Follows project localization architecture:
 * @see CLAUDE.md - "Localization Architecture" section
 */
```

### Link to External Docs

```typescript
/**
 * Paddle webhook handler for subscription events.
 *
 * @see https://developer.paddle.com/webhooks/overview
 * @see .docs/references/SUBSCRIPTION_SYSTEM_REFERENCE.md
 */
```

---

## 🚫 Anti-Patterns to Avoid

### 1. Commenting Out Code
```typescript
❌ DON'T:
// const oldImplementation = () => {
//   // old code here
// }

const newImplementation = () => {
  // new code here
}

✅ DO:
// Delete old code, use git history if needed
const implementation = () => {
  // new code here
}
```

### 2. Changelog Comments
```typescript
❌ DON'T:
/**
 * Updated 2026-01-15: Added caching
 * Updated 2026-01-20: Fixed bug
 * Updated 2026-02-01: Refactored
 */

✅ DO:
// Use git history, not comments
```

### 3. Author Tags
```typescript
❌ DON'T:
// Created by John Doe on 2026-01-15
// Modified by Jane Smith on 2026-02-01

✅ DO:
// Use git blame, not comments
```

### 4. Explaining Bad Code
```typescript
❌ DON'T:
// This is confusing but it works
const x = a ? b ? c : d : e ? f : g;

✅ DO:
// Refactor the code to be self-explanatory
const result = calculateResult(a, b, c, d, e, f, g);
```

---

## 🎯 Real-World Examples

### Example 1: Server Action
```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@menumize/auth';
import { prisma } from '@menumize/database';

/**
 * Publishes a menu to make it visible in guest app.
 *
 * Requirements:
 * - User must be OWNER or STAFF of venue
 * - Menu must belong to venue
 * - Menu must have at least one section with items
 *
 * Side effects:
 * - Updates menu.published = true
 * - Updates menu.publishedAt = now
 * - Revalidates guest app pages
 * - Generates new QR codes (if first publish)
 *
 * @reference .docs/references/MENU_BUILDER_REFERENCE.md (when created)
 */
export async function publishMenu(menuId: string) {
  // Verify authentication
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Fetch menu with venue for permission check
  const menu = await prisma.menu.findUnique({
    where: { id: menuId },
    include: { venue: true, sections: { include: { items: true } } },
  });

  if (!menu) {
    return { success: false, error: 'Menu not found' };
  }

  // Check user has access to venue
  const hasAccess = await checkVenueAccess(menu.venueId, session.user.id);
  if (!hasAccess) {
    return { success: false, error: 'Forbidden' };
  }

  // Validate menu is ready to publish
  const hasContent = menu.sections.some(s => s.items.length > 0);
  if (!hasContent) {
    return { success: false, error: 'Menu must have at least one item' };
  }

  // Publish menu
  const published = await prisma.menu.update({
    where: { id: menuId },
    data: {
      published: true,
      publishedAt: new Date(),
    },
  });

  // Revalidate guest app pages
  // NOTE: Revalidates all menu pages for this venue
  // More granular revalidation would be better but requires
  // tracking which tables/contexts are active
  revalidatePath(`/${menu.venue.handle}/[context]/menu`);

  return { success: true, data: published };
}
```

### Example 2: Complex Utility
```typescript
/**
 * Resolves effective color value from configuration.
 *
 * Handles multiple color strategies:
 * - 'accent' → Uses venue accent color
 * - 'body' → Uses default text color
 * - 'derivedGreen' → Uses success color
 * - 'custom' → Uses provided hex color
 *
 * Also resolves CSS variable references (e.g., 'var(--accent)').
 *
 * @param strategy - Color strategy name
 * @param customHex - Custom color (used when strategy='custom')
 * @param accentColor - Venue's accent color
 * @returns Resolved CSS color value
 *
 * @example
 * resolveColor('accent', null, '#FF0000') // '#FF0000'
 * resolveColor('custom', '#00FF00', '#FF0000') // '#00FF00'
 * resolveColor('body', null, '#FF0000') // 'var(--foreground)'
 */
export function resolveColor(
  strategy: ColorStrategy,
  customHex: string | null,
  accentColor: string
): string {
  switch (strategy) {
    case 'accent':
      return accentColor;
    case 'custom':
      // Fallback to accent if custom not provided
      return customHex ?? accentColor;
    case 'body':
      return 'var(--foreground)';
    case 'derivedGreen':
      return 'var(--success)';
    default:
      // Exhaustive check - TypeScript ensures all cases covered
      const _exhaustive: never = strategy;
      return accentColor;
  }
}
```

---

## 📋 Checklist Before Committing

- [ ] Removed commented-out code (use git history instead)
- [ ] No TODO comments without context or ticket reference
- [ ] No obvious comments (code is self-documenting)
- [ ] JSDoc for public functions includes `@example` if non-trivial
- [ ] Complex logic has "why" comments
- [ ] Security/performance concerns are flagged
- [ ] Referenced relevant .docs files for subsystems
- [ ] No changelog or author comments (use git)

---

## 📚 Related Documentation

- [DOCUMENTATION_MAINTENANCE.md](DOCUMENTATION_MAINTENANCE.md) - Reference doc standards
- [FEATURE_DEVELOPMENT_WORKFLOW.md](FEATURE_DEVELOPMENT_WORKFLOW.md) - Development workflow
- [CLAUDE.md](../../CLAUDE.md) - Project architecture

---

**Last updated:** 2026-02-11
**Principle:** Document the "why", let the code document the "what"
