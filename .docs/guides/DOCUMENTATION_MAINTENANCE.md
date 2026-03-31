# Documentation Maintenance Guide

> **Goal:** Keep reference docs **token-efficient**, **current**, and **actionable**

---

## 🎯 Core Principles

### 1. **Current State Only**
- ✅ Document the **current implementation**
- ❌ Don't keep old session histories, past approaches, or "what we tried"
- ❌ Don't document bugs that are already fixed

### 2. **Actionable Information**
- ✅ Include "Common Tasks" with copy-paste examples
- ✅ Document known issues **only if still unfixed**
- ✅ Include roadmap items **only if actively planned**
- ❌ Don't list vague ideas or brainstorming notes

### 3. **Token Efficiency**
- ✅ Use tables, bullet points, and code snippets
- ✅ Link to files instead of copying full code
- ✅ Keep "Quick Reference" section at top (50-100 lines max)
- ❌ Don't include full file contents
- ❌ Don't write long prose paragraphs

---

## 📋 Reference Doc Template

```markdown
# [Subsystem] Reference

> **Last Updated:** YYYY-MM-DD
> **Status:** Production | In Development | Deprecated
> **Tech:** Key technologies used

## Quick Reference
[Essential info in 50-100 lines: file map, key concepts, usage]

## Architecture
[High-level flow diagram or description]

## Key Files
[File-by-file breakdown with line references]

## Common Tasks
### Task 1: [Specific task]
\`\`\`typescript
// Copy-paste code example
\`\`\`

### Task 2: [Another task]
\`\`\`typescript
// Copy-paste code example
\`\`\`

## Configuration
[Settings, toggles, environment variables]

## Known Issues
[ONLY unfixed issues with workarounds]

## Future Roadmap
[ONLY actively planned features - 3-5 items max]

---
**Last updated:** YYYY-MM-DD
**Status:** [Brief status note]
```

---

## 🧹 Maintenance Checklist

### After Code Changes
- [ ] Update relevant reference doc
- [ ] Remove "Known Issues" if fixed
- [ ] Update "Last Updated" date
- [ ] Update file line numbers if changed
- [ ] Commit docs + code together

### Monthly Review (or per 10 commits)
- [ ] Remove completed "Future Roadmap" items
- [ ] Delete "Session Summary" or "History" sections
- [ ] Check for outdated code examples
- [ ] Verify file paths still exist
- [ ] Consolidate duplicate information

### When Creating New Docs
- [ ] Check if similar doc already exists (consolidate instead)
- [ ] Use template above
- [ ] Keep under 500 lines if possible
- [ ] Add to `.docs/README.md` index
- [ ] Link from CLAUDE.md if major subsystem

---

## ❌ What NOT to Include

### 1. Session Histories
**Bad:**
```markdown
## Session Summary
### Session 2026-02-04
- Fixed bug X
- Improved Y
- Refactored Z

### Session 2026-02-02
- Added feature A
- Updated component B
```

**Why:** Historical logs don't help understand the **current system**. They waste tokens.

**Instead:** Document the current state. Delete session summaries after consolidating insights.

---

### 2. Fixed Issues
**Bad:**
```markdown
## Recently Fixed ✅
- Image in wrong position → Fixed
- Badges too tall → Fixed
- Spacing incorrect → Fixed
```

**Why:** If it's fixed, it's not a concern anymore. Wastes tokens.

**Instead:** Only keep in "Known Issues" if **still unfixed**.

---

### 3. Old Approaches
**Bad:**
```markdown
## Approaches We Tried
### Approach 1: Badge text pills
- Pros: Clear labels
- Cons: Too tall, visual noise
- **Replaced by:** Icon-only badges

### Approach 2: Full-width cards
- Pros: More space
- Cons: Too big on mobile
- **Replaced by:** Compact grid
```

**Why:** Past approaches are irrelevant once we've chosen the current implementation.

**Instead:** Document **only the current approach**. Archive old analysis in `archive/` folder.

---

### 4. Brainstorming / Ideas
**Bad:**
```markdown
## Future Ideas
- Maybe add animations?
- Could try dark mode?
- What if we used WebSockets?
- Should we consider GraphQL?
- Perhaps implement search filters?
[20 more vague ideas]
```

**Why:** Vague ideas aren't actionable. They clutter the doc.

**Instead:** Only include **actively planned** features (3-5 max) in "Future Roadmap".

---

### 5. Full Code Listings
**Bad:**
```markdown
## SearchProvider Component

Here's the full code:

\`\`\`typescript
[200 lines of code copied from file]
\`\`\`
```

**Why:** Wastes massive tokens. Code can change, making docs outdated.

**Instead:** Link to file with line numbers: `[SearchProvider.tsx:45-67](../path/to/file.tsx)`

---

### 6. Long Prose Explanations
**Bad:**
```markdown
The search system works by first receiving the query from the user through
the input component, which then passes it to the search provider via the
context API. The provider debounces the input to avoid making too many
requests, and then sends the query to the API endpoint which queries the
database using a full-text search implementation with PostgreSQL. The results
are then returned and displayed in the overlay component with proper formatting.
```

**Why:** Verbose, hard to scan, high token count.

**Instead:**
```markdown
## Search Flow
1. User types in `HeaderSearchInput.tsx`
2. Debounced (300ms) in `MenuSearchProvider`
3. API call to `/api/search`
4. PostgreSQL full-text search
5. Results displayed in `MenuSearchOverlay.tsx`
```

---

## ✅ What TO Include

### 1. Quick Reference (Top Section)
```markdown
## Quick Reference

**Purpose:** Search functionality in guest app
**Tech:** React Context + API Routes + PostgreSQL

### Key Files
- `apps/guest/context/menu-search.tsx` - State management
- `apps/guest/app/api/search/route.ts` - API endpoint
- `packages/ui/src/guest-UI/appBar/shared/HeaderSearchInput.tsx` - Input UI

### Usage
\`\`\`typescript
import { useMenuSearch } from '@/context/menu-search'

const { query, setQuery, results } = useMenuSearch()
\`\`\`
```

---

### 2. Architecture Diagrams
```markdown
## Architecture Flow

\`\`\`
User Input (HeaderSearchInput.tsx)
    ↓
MenuSearchProvider (context/menu-search.tsx)
    ↓ debounce 300ms
API Route (/api/search/route.ts)
    ↓
PostgreSQL Full-Text Search
    ↓
Results → MenuSearchOverlay.tsx
\`\`\`
```

---

### 3. Common Tasks with Code
```markdown
## Common Tasks

### Add Search Filter
\`\`\`typescript
// In /api/search/route.ts
const results = await prisma.$queryRaw\`
  SELECT * FROM items
  WHERE search_vector @@ plainto_tsquery(${query})
  AND category = ${filter}  // NEW: Add filter
\`
\`\`\`

### Change Debounce Time
\`\`\`typescript
// In menu-search.tsx:67
const debouncedQuery = useDebounce(query, 500)  // Changed from 300ms
\`\`\`
```

---

### 4. Current Known Issues (Unfixed Only)
```markdown
## Known Issues

**1. Arabic Search Partial Matches**
- **Issue:** Search only works for exact words, not partials
- **Workaround:** Use trigram index (planned)
- **File:** `/api/search/route.ts:34`

**2. Case Sensitivity**
- **Issue:** Search is case-sensitive for some locales
- **Workaround:** Use `LOWER()` in query
- **Fix planned:** Q2 2026
```

---

### 5. Active Roadmap (3-5 Items Max)
```markdown
## Future Roadmap

1. **Search history** - Store recent searches in localStorage (Q1 2026)
2. **Trigram matching** - Better partial word matching (Q1 2026)
3. **Search analytics** - Track popular queries (Q2 2026)
```

---

## 📂 File Organization

### references/
**Purpose:** Core subsystem documentation (permanent)
**Criteria:**
- Subsystem spans 5+ files
- Complex architecture (multiple layers)
- Frequently referenced by team/AI

**Examples:**
- `SEARCH_SYSTEM_REFERENCE.md`
- `FILTERING_SYSTEM_REFERENCE.md`
- `SUBSCRIPTION_SYSTEM_REFERENCE.md`

**Maintenance:** Update when code changes, monthly review

---

### guides/
**Purpose:** Process guides, how-tos, workflows (permanent)
**Criteria:**
- Explains **how to do something**
- Not tied to specific code files
- Useful for onboarding

**Examples:**
- `DOCUMENTATION_MAINTENANCE.md` (this file)
- `AI_WORKFLOW_GUIDE.md`
- `HOW_TO_USE_DOCS.md`

**Maintenance:** Update quarterly or when process changes

---

### archive/
**Purpose:** Completed work, historical context (rarely accessed)
**Criteria:**
- Fix documentation (bug already fixed)
- Planning docs (feature already implemented)
- Old analyses (decisions already made)
- Refactor summaries (refactor complete)
- Todo files where all tasks are `[x]`

**Examples:**
- `CACHE_INVALIDATION_FIX.md` (fix completed)
- `VENUE_PROVIDER_REFACTOR_SUMMARY.md` (refactor done)
- `DESKTOP_LAYOUT_REDESIGN.md` (design implemented)

**Todo → Archive lifecycle:**
```
todo/*.md (planning, task checklists)
  → All tasks [x] checked off
  → Move to archive/
  → Remove from FEATURE_PRIORITIES.md
  → Code is already in codebase (truth is in git)
```
**Do NOT** keep completed todo files in `todo/` — they accumulate stale state.

**Maintenance:** Archive after work complete, delete after 6 months if not referenced

---

## 🔄 Workflow: Cleaning Existing Docs

### Step 1: Identify Bloat
Read through doc and mark sections:
- 🗑️ Delete: Session histories, fixed issues, old approaches
- 📦 Archive: Implementation details now in code
- ✅ Keep: Current architecture, common tasks, known issues

### Step 2: Restructure
1. Move "Quick Reference" to top
2. Consolidate duplicate sections
3. Remove prose, use bullets/tables
4. Update file paths and line numbers
5. Delete "Session Summary" sections

### Step 3: Token Audit
- Count lines (aim for <500 for references, <200 for guides)
- Remove unnecessary code blocks
- Replace long explanations with flowcharts
- Use tables for structured data

### Step 4: Update Metadata
```markdown
> **Last Updated:** 2026-02-11
> **Status:** Production
> **Lines:** 347 (down from 943)
```

---

## 📊 Example: Before & After

### ❌ Before (Token-Heavy)
```markdown
# Menu Item Card Reference

## Session 2026-02-04
We worked on the GRID variant and made the following changes:
1. Fixed duplicate labels
2. Added dark background overlay
3. Removed calories
[500 lines of session details]

## Session 2026-02-02
We improved the CARD variant with these updates:
1. Icon-only badges
2. Play icon overlay
[300 lines of old history]

## Recently Fixed
- Image position wrong → Fixed
- Badges too tall → Fixed
[100 lines of old bugs]

## Full Code Listings
[500 lines of pasted code]

Total: 1400 lines, ~35k tokens
```

### ✅ After (Token-Efficient)
```markdown
# Menu Item Card Reference

> **Last Updated:** 2026-02-11
> **Status:** Production (CARD ✅ | GRID ✅ | LIST pending)
> **Tech:** React, Tailwind, TypeScript

## Quick Reference
- **File:** `packages/ui/src/guest-UI/items/ItemCard.tsx`
- **Variants:** LIST | CARD | GRID
- **Config:** `packages/types/src/design/menu-page.ts:136`

## Variants

### CARD (Horizontal)
- Layout: Text (left) + Image (right)
- Image: 135-145px, 4:3 ratio
- Badges: Icon-only, inline with title
- Status: ✅ Production

### GRID (Vertical)
- Layout: Image (top) + Text (bottom)
- Badges: Overlay on image with dark bg
- Status: ✅ Production

### LIST (Horizontal Wide)
- Layout: Large image + text
- Status: 🚧 Pending updates

## Common Tasks
[Copy-paste code examples]

## Known Issues
[Only unfixed issues]

## Future Roadmap
1. Order button (+)
2. Likes button (❤️)
3. Arabic layout testing

Total: 350 lines, ~8k tokens
Savings: 75% reduction in tokens
```

---

## 🎯 Success Metrics

### Token Efficiency
- **Reference docs:** <500 lines, <12k tokens
- **Guides:** <200 lines, <5k tokens
- **Quick starts:** <100 lines, <2.5k tokens

### Usefulness
- New developers can understand subsystem in <15 minutes
- AI assistants find answers without file exploration
- Common tasks have copy-paste examples

### Freshness
- "Last Updated" within 1 month for active subsystems
- No outdated file paths or line numbers
- Known issues actually still exist

---

## 🚀 Quick Commands

### Moving Files
```bash
# Move completed fix to archive
mv CACHE_INVALIDATION_FIX.md archive/

# Move reference to references folder
mv SEARCH_SYSTEM_REFERENCE.md references/

# Move guide to guides folder
mv AI_WORKFLOW_GUIDE.md guides/
```

### Finding Bloat
```bash
# Find large files (>500 lines)
find . -name "*.md" -exec wc -l {} \; | sort -rn | head

# Search for "Session" sections
grep -r "## Session" .

# Search for "Fixed" sections
grep -r "Recently Fixed" .
```

---

## 📞 Questions?

**Q: Should I delete old session histories?**
A: Yes! They don't help understand the current system. Archive them if needed, but usually delete.

**Q: What if I need historical context?**
A: Use git history (`git log`, `git blame`). Don't bloat docs with it.

**Q: How often should I update reference docs?**
A: After every significant code change. Do monthly reviews to remove bloat.

**Q: Can I add temporary planning docs?**
A: Yes, but **consolidate into main reference** after work is done. Delete the planning doc.

**Q: What's the ideal reference doc size?**
A: 300-500 lines for complex subsystems, 100-200 for simpler ones.

---

**Last updated:** 2026-03-13
**Maintained by:** Development Team
