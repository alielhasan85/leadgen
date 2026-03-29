# AI Workflow Guide - Using Reference Docs

> **For Humans & AI:** This is the standard workflow for working on any part of the codebase

---

## 🎯 The Golden Rule

**ALWAYS check `.docs/` for reference documentation BEFORE exploring files**

---

## 🔑 The Three-Tier Doc System

Understanding which file to update and why:

| Doc Type | Purpose | Update trigger | Update sequence |
|----------|---------|----------------|-----------------|
| `todo/*.md` | Task checklists + feature specs | End of session: mark `[x]`, archive when done | **First** |
| `references/*.md` | Architecture snapshot (current state) | When code structure changes (new files, endpoints, schema) | **Second** |
| `FEATURE_PRIORITIES.md` | Roadmap + phase milestones | When a phase or week completes | **Third** |

**Why this order matters:**
- Todo files are the source of truth for *what got done* — mark them first
- Reference files reflect *how the code is structured now* — update after knowing what changed
- Priority file reflects *where you are in the roadmap* — update last once you know what's complete

---

## 🏁 End of Session Ritual

**Always end a session by running this prompt (copy-paste and fill in):**

```
End of session. Please:
1. Mark completed tasks as [x] in [TODO_FILE] based on what we built today
2. If [TODO_FILE] is 100% complete, move it to .docs/archive/
3. Update [REFERENCE_FILE] to reflect: [brief description of architecture changes]
4. Update FEATURE_PRIORITIES.md — mark [week/phase] status as done
```

**Real example:**
```
End of session. Please:
1. Mark completed tasks as [x] in .docs/todo/LIVE_FLOOR_VIEW.md (Phase 1 tasks done)
2. Move LIVE_FLOOR_VIEW.md to .docs/archive/ if Phase 1 is 100% done
3. Update .docs/references/LIVE_FLOOR_REFERENCE.md — added latestIntentId, IMAGE shape fix, role gating
4. Update FEATURE_PRIORITIES.md — Live Floor Phase 1 is complete
```

### Decision tree: Which reference file to update?

```
Did we change code in a subsystem?
  ↓ YES
Does a reference file exist for it in .docs/references/?
  ├─ YES → Update it (architecture, key files, known issues)
  └─ NO  → Create one if subsystem has 5+ files (else skip)

Did we complete a todo checklist item?
  ↓ YES
Mark it [x] in the todo file.
Is the todo file now 100% complete?
  ├─ YES → Move to .docs/archive/ + remove from FEATURE_PRIORITIES.md checklist
  └─ NO  → Leave in .docs/todo/

Did a whole phase/week complete?
  ↓ YES → Update FEATURE_PRIORITIES.md — mark week as ✅, update status snapshot
```

### What NOT to update (common mistakes)

| Situation | Wrong action | Right action |
|-----------|-------------|--------------|
| Bug fixed during session | Add "Fixed X" to reference | Nothing — bugs that are fixed don't belong in docs |
| Tried an approach, abandoned it | Document the failed approach | Nothing — only document current state |
| Session ended mid-feature | Write session summary | Just mark progress in todo `[x]` items done so far |
| Reference file growing long | Add more detail | Audit: remove history/prose, convert to tables/bullets. **Length follows content need — no hard cap. A complex subsystem (20+ files) may need 600+ lines; a simple one needs 150.** |

---

## 📋 Standard Workflow

### Starting ANY Task

```
┌─────────────────────────────────────────┐
│  User: "Help me work on [SUBSYSTEM]"   │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Step 1: Check if .docs/[NAME]_*.md     │
│          exists for that subsystem      │
└─────────────────────────────────────────┘
                  ↓
        ┌─────────┴─────────┐
        │                   │
   [YES EXISTS]        [NO DOESN'T EXIST]
        │                   │
        ↓                   ↓
┌─────────────┐      ┌──────────────────┐
│ Read ref    │      │ Explore files    │
│ doc FIRST   │      │ normally         │
│             │      │                  │
│ ~3k tokens  │      │ Create ref doc   │
│ 30 seconds  │      │ after if needed  │
└─────────────┘      └──────────────────┘
        │                   │
        └─────────┬─────────┘
                  ↓
        ┌─────────────────┐
        │  Do the work    │
        └─────────────────┘
```

---

## 🗺️ Subsystem Name Mapping

| User Says | Check For | Example |
|-----------|-----------|---------|
| "search" | `SEARCH_SYSTEM_REFERENCE.md` or `SEARCH_QUICK_START.md` | ✅ Exists |
| "item sheet" | `ITEM_SHEET_UI_REFERENCE.md` | ✅ Exists (user mentioned) |
| "menu builder" | `MENU_BUILDER_REFERENCE.md` | ❓ Check .docs/ |
| "orders" | `ORDER_SYSTEM_REFERENCE.md` | ❓ Check .docs/ |
| "design system" | `DESIGN_SYSTEM_REFERENCE.md` | ❓ Check .docs/ |
| "authentication" | `AUTH_REFERENCE.md` | ❓ Check .docs/ |

---

## 💬 Example Conversations

### ✅ CORRECT Workflow

**Scenario: User wants to add feature to search**

```
User: "I want to add autocomplete to the search"

AI: "Let me check for search reference docs..."
    → Finds: .docs/SEARCH_SYSTEM_REFERENCE.md
    → Reads it (~3k tokens)

AI: "I've loaded the search system reference. I can see:
     - Search provider is in apps/guest/context/menu-search.tsx
     - API endpoint is apps/guest/app/api/search/route.ts
     - Autocomplete is on the roadmap (Phase 3)

     To add autocomplete, we need to:
     1. Modify MenuSearchProvider to track partial matches
     2. Add autocomplete API endpoint
     3. Update MenuSearchOverlay to show suggestions

     Should I proceed with this approach?"

User: "Yes, let's do it"

[Total tokens to get context: ~3k]
[Time to context: 30 seconds]
```

---

### ❌ WRONG Workflow (Don't Do This)

**Scenario: Same task, but not using reference**

```
User: "I want to add autocomplete to the search"

AI: "Let me explore the search system..."
    → Reads apps/guest/context/menu-search.tsx
    → Reads apps/guest/components/search/MenuSearchOverlay.tsx
    → Reads apps/guest/app/api/search/route.ts
    → Reads packages/ui/src/guest-UI/appBar/shared/HeaderSearchInput.tsx
    → Reads apps/guest/components/bridges/MenuAppBarBridge.tsx
    → Searches for "search" in codebase
    → Reads database schema
    → ... 10+ files later ...

AI: "I've explored the search system. To add autocomplete..."

[Total tokens to get context: ~20k+]
[Time to context: 5-10 minutes]
[Context might be incomplete or miss important details]
```

---

## 🎯 Quick Reference: When to Use Which Doc

### For Quick Tasks (Bug fixes, small changes)
```
"Read .docs/[SUBSYSTEM]_QUICK_START.md and [task]"
```
- Loads essentials only (~1k tokens)
- Fast context
- Good for: Fixes, tweaks, minor additions

### For Major Work (New features, refactors)
```
"Read .docs/[SUBSYSTEM]_REFERENCE.md and [task]"
```
- Loads complete architecture (~3-5k tokens)
- Full understanding
- Good for: Features, major changes, learning

### For Learning (Onboarding, understanding)
```
"Explain the [subsystem] architecture using .docs/[SUBSYSTEM]_REFERENCE.md"
```
- Educational context
- Complete picture
- Good for: Team onboarding, documentation

---

## 📊 Token Comparison Table

| Scenario | Without Ref Docs | With Ref Docs | Savings |
|----------|------------------|---------------|---------|
| **Understanding search** | 20k tokens, 10 min | 3k tokens, 30 sec | 85% ⬇️ |
| **Bug fix in item sheet** | 15k tokens, 8 min | 2k tokens, 20 sec | 87% ⬇️ |
| **Add feature to orders** | 25k tokens, 15 min | 4k tokens, 1 min | 84% ⬇️ |
| **Understanding auth flow** | 18k tokens, 12 min | 3k tokens, 40 sec | 83% ⬇️ |

**Average savings: ~85% tokens, ~90% time**

---

## 🛠️ Creating New Reference Docs

### When to Create

Create a reference doc when:
- ✅ Subsystem spans **5+ files**
- ✅ Has **multiple layers** (UI → State → API → DB)
- ✅ Team members ask **"how does X work?"** repeatedly
- ✅ You're explaining to AI for the **3rd time**

### Template to Use

```markdown
# [Subsystem Name] Reference

> **Last Updated:** YYYY-MM-DD
> **Status:** Working/In Development
> **Tech:** Key technologies

## Quick Reference
[File map, key concepts, 1-2 sentences]

## Architecture Flow
[Diagram or bullet flow]

## Key Files
[File-by-file breakdown]

## Common Tasks
[How-tos with code examples]

## Known Issues
[Current limitations]

## Roadmap
[Future improvements]
```

See `.docs/HOW_TO_USE_DOCS.md` for full template and guidelines.

---

## 🎓 Teaching AI the Pattern

### First Interaction (Teach)
```
User: "Read CLAUDE.md. Notice the section about checking .docs/ first.
       From now on, ALWAYS check .docs/ before exploring files."

AI: "Understood! I'll always check .docs/ for reference documentation
     before exploring the codebase. This saves tokens and time."
```

### Every Subsequent Task
```
User: "Help me with [subsystem]"

AI: "Let me check .docs/ for reference documentation..."
    [Checks .docs/]
    [Loads reference if exists OR explores files if not]
```

---

## 🏆 Success Metrics

You know the system is working when:

✅ AI **always** checks `.docs/` first
✅ Token usage for common tasks **drops by 80%+**
✅ Context loading takes **seconds not minutes**
✅ AI has **complete understanding** on first try
✅ Team onboarding is **faster** (read docs, not code)

---

## 📝 Maintenance Checklist

### End of Session (Every Session)

**Step 1 — Todo files (do first)**
- [ ] Mark completed tasks `[x]` in the relevant `todo/*.md` file
- [ ] If todo file is 100% done → `mv` it to `.docs/archive/`
- [ ] If a todo file has been superseded by a master plan → update cross-links

**Step 2 — Reference files (if architecture changed)**
- [ ] New files/components created → add to Key Files table in reference
- [ ] New DB fields/models → update schema section in reference
- [ ] New API endpoints → add to reference
- [ ] Known issues resolved → remove from Known Issues section
- [ ] Update "Last Updated" date

**Step 3 — Feature Priorities (if phase milestone reached)**
- [ ] Mark completed week/phase as `✅` in FEATURE_PRIORITIES.md
- [ ] Update "Current Status Snapshot"
- [ ] Move current active work up to "NOW" section if a phase shifted

**What does NOT need updating:**
- Reference files when only UI polish changed (no architecture change)
- FEATURE_PRIORITIES.md when mid-feature (only update when a whole phase/week completes)
- Todo files with session summaries — mark `[x]` only, no prose history

### After Making Code Changes

- [ ] Does this affect a documented subsystem?
- [ ] If yes, update the relevant `.docs/*.md` file
- [ ] Update "Last Updated" date in the reference doc
- [ ] Commit code + docs together

### Monthly Review

- [ ] Check if any subsystems need new reference docs
- [ ] Update roadmap sections in existing docs
- [ ] Remove outdated information
- [ ] Add newly discovered gotchas/tips

---

## 🎯 Summary: The 3 Rules

1. **CHECK .docs/ FIRST** - Before exploring any subsystem
2. **USE Quick Start** - For simple tasks (saves more tokens)
3. **MAINTAIN DOCS** - Update when code changes

**Follow these rules = 85% token savings + 90% time savings**

---

## 📞 Quick Commands for AI

Copy-paste these in your prompts:

```bash
# For search work
"Read .docs/SEARCH_QUICK_START.md and [task]"

# For item sheet work
"Read .docs/ITEM_SHEET_UI_REFERENCE.md and [task]"

# For new subsystem (check first)
"Check if .docs/ has a reference for [subsystem]. If yes, read it. If no, explore files."

# For learning
"Using .docs/[SUBSYSTEM]_REFERENCE.md, explain how [feature] works"
```

---

*This workflow is designed to maximize efficiency and minimize token waste. Always follow it!*
