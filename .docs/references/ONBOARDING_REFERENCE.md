# Onboarding Reference

> **Last Updated:** 2026-03-29 (Session 2)
> **Status:** Production (all 3 steps complete)
> **Tech:** Next.js App Router, Server Actions, pdf-parse, mammoth

---

## Quick Reference

**3-step wizard — all in `app/(auth)/signup/`:**

| Step | Route | File | Sets |
|---|---|---|---|
| 1 + 2 | `/signup/profile` | `profile/page.tsx` + `profile-form.tsx` | name, businessName, industry, whatTheySell |
| 3 | `/signup/materials` | `materials/page.tsx` + `upload-form.tsx` | materials table rows |
| Complete | — | `lib/actions/materials.actions.ts` | `onboarded = true` → redirect `/dashboard` |

**Gate:** `onboarded = false` until step 3 completes (or is skipped).

---

## Flow

```
New user signs in (Google or magic link)
  ↓
Auth event.createUser → ensureTrialSubscriptionForUser()
  ↓
session.user.onboarded = false → redirect to /signup/profile
  ↓
Step 1+2: /signup/profile
  User fills: name, businessName, industry, whatTheySell
  completeOnboardingAction() → saves to users table, onboarded stays false
  redirect → /signup/materials
  ↓
Step 3: /signup/materials
  User uploads PDF/DOCX/TXT (or skips)
  uploadMaterialsAction() OR skipMaterialsAction()
    → parses files → saves to materials table
    → sets onboarded = true
    → redirect → /dashboard
```

---

## Server Actions

### `completeOnboardingAction(values)` — `lib/actions/onboarding.actions.ts`

Validates and saves profile data. Does NOT set `onboarded = true`.
Redirects to `/signup/materials`.

```typescript
const result = await completeOnboardingAction({
  name: 'Ali Hassan',
  businessName: 'Menumize',
  industry: 'saas',           // enum — see below
  whatTheySell: 'QR menu...'  // min 10 chars
})
// result.error? — validation error string
```

**Industry enum:** `'marketing_agency' | 'cctv' | 'food_supplier' | 'saas' | 'restaurant' | 'other'`

### `uploadMaterialsAction(formData)` — `lib/actions/materials.actions.ts`

Accepts `FormData` with `files` field (multiple). Parses and saves. Sets `onboarded = true`.

```typescript
const formData = new FormData()
files.forEach(f => formData.append('files', f))
const result = await uploadMaterialsAction(formData)
// result.error? — partial failure message (some files failed)
// On success: redirects to /dashboard automatically
```

**File limits:** 10 MB max per file. Accepted: `.pdf`, `.docx`, `.txt`

### `skipMaterialsAction()` — `lib/actions/materials.actions.ts`

Sets `onboarded = true` and redirects to `/dashboard`. No file upload.

---

## File Parsing

| Type | Library | Field extracted |
|---|---|---|
| PDF | `pdf-parse` via `require()` | `result.text` |
| DOCX | `mammoth` via `await import()` | `result.value` (raw text) |
| TXT | `Buffer.toString('utf-8')` | raw string |

**pdf-parse import gotcha:** must use `require('pdf-parse')` not `import(...).default` — the ESM build has no default export. Use dynamic `require` in the server action.

Saved to `materials` table: `contentExtracted` (full text), `fileType`, `fileSizeBytes`, `isProcessed: true`.

---

## Page Guards

### `/signup/profile`
```typescript
const user = await prisma.user.findUnique(...)
if (user.onboarded) redirect('/dashboard')  // skip if already done
```

### `/signup/materials`
```typescript
if (!session?.user) redirect('/login')
if (session.user.onboarded) redirect('/dashboard')  // skip if already done
```

---

## Key UI Components

- `profile-form.tsx` — controlled form, `useTransition` for pending state
- `upload-form.tsx` — drag-and-drop, multi-file, file list with remove, skip button
- Both use shadcn `Card`, `Button`, `Input`, `Label`

---

## Adding More Onboarding Steps

1. Create new page in `app/(auth)/signup/[step-name]/`
2. Add server action in `lib/actions/`
3. Only the LAST step sets `onboarded = true`
4. Update `(auth)/layout.tsx` if needed

---

## Post-Onboarding: Settings

Users who skip step 3 (or want to update files) can manage materials at `/settings/materials`.

| File | Purpose |
|---|---|
| `app/(dashboard)/settings/materials/page.tsx` | Server component — loads materials, renders manager |
| `app/(dashboard)/settings/materials/materials-manager.tsx` | Client component — list, upload, soft-delete |
| `lib/actions/materials.actions.ts` | `uploadSettingsMaterialsAction()` + `deleteMaterialAction()` |

- `deletedAt` soft delete field added to `Material` model (migration `20260329170001_add_material_deleted_at`)
- All queries filter `where: { userId, deletedAt: null }`
- Dashboard shows amber banner when `materialCount === 0` with link to settings

## Future

- Onboarding progress bar (step indicator component)
- `aiSummary` field: run Claude on uploaded content to generate a short summary for use in prompts
