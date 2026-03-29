# Feature Development Workflow

> **How to start any new feature using the documentation system efficiently**

---

## 🎯 Goal: Minimize Token Usage, Maximize Context Quality

When starting a new feature, use this workflow to **only load what you need**.

---

## 📋 Step-by-Step Workflow

### Step 1: Identify Feature Scope (30 seconds)

Ask yourself:
- **What am I building?** (e.g., "Order from table feature")
- **Which app(s)?** Platform, Guest, or both?
- **Is it new or modifying existing?** New feature vs enhancement

---

### Step 2: Check Documentation Index (1 minute)

**Read:** [.docs/README.md](../.docs/README.md)

Scan the **Quick Navigation** table to find relevant references:

| Your Feature | Likely References Needed |
|--------------|-------------------------|
| **Order from table** | Item Sheet, Subscriptions, (no Order ref exists yet) |
| **Menu builder** | Menu Item Cards, Filtering, Menu Page Config |
| **Search improvements** | Search System, Search Quick Start |
| **Payment integration** | Subscriptions, Feature Flags |
| **New dietary filter** | Filtering System |
| **Design customization** | Color System, Menu Page Config |

**Output:** List of 2-4 relevant reference docs (not 25!)

---

### Step 3: Load Only Relevant References (2-3 minutes)

**Instead of exploring files, tell Claude:**

```
"Read the following references and help me implement [feature]:
1. .docs/references/[REFERENCE_1].md
2. .docs/references/[REFERENCE_2].md
3. .docs/references/[REFERENCE_3].md"
```

**Example for Order Feature:**
```
"Read the following references and help me implement order from table:
1. .docs/references/ITEM_SHEET_UI_REFERENCE.md (for cart UI patterns)
2. .docs/references/SUBSCRIPTION_SYSTEM_REFERENCE.md (check feature tier access)
3. Read only the Order, OrderItem, and Table models from prisma/schema.prisma"
```

**Token usage:** ~8-12k tokens (vs 50k+ exploring files)

---

### Step 4: Create Implementation Plan (5 minutes)

With reference context loaded, ask Claude to:

```
"Based on these references, create an implementation plan for [feature].
Include:
1. Which files to create/modify
2. Database changes needed
3. Which existing patterns to follow
4. Potential issues to watch for"
```

Claude now has **targeted context** and can give you a **precise plan** without exploring 100+ files.

---

### Step 5: Implement Feature (variable time)

As you implement:
- ✅ **Refer back to references** for patterns (no re-exploration)
- ✅ **Use "Common Tasks"** sections for copy-paste examples
- ✅ **Check "Known Issues"** to avoid pitfalls
- ❌ **Don't ask Claude to re-explore** files already in references

---

### Step 6: Update Documentation (10 minutes)

After implementing:

**If you created 5+ new files or complex architecture:**
1. Create new reference doc: `.docs/references/ORDER_SYSTEM_REFERENCE.md`
2. Follow template in [DOCUMENTATION_MAINTENANCE.md](DOCUMENTATION_MAINTENANCE.md)
3. Add to `.docs/README.md` index

**If you modified existing subsystem:**
1. Update relevant reference doc
2. Update "Last Updated" date
3. Add to "Common Tasks" if useful

**If you fixed bugs during implementation:**
1. Do NOT create "FIX.md" docs
2. Update reference doc if architectural
3. Otherwise, just commit the code

---

## 🎯 Real Example: Order from Table Feature

### Traditional Approach (Token-Heavy) ❌
```
User: "Help me implement order from table"

Claude:
[Explores entire codebase]
- Reads all menu files (20k tokens) ❌ Not needed
- Reads all branding files (15k tokens) ❌ Not needed
- Reads search system (8k tokens) ❌ Not needed
- Reads filtering (5k tokens) ❌ Not needed
- Reads database schema (10k tokens) ❌ Reads ALL models
- Greps for "order" (5k tokens) ❌ Too broad
- Reads item cards (8k tokens) ⚠️ Only partly relevant

Total: ~70k tokens, 15-20 minutes
Relevant context: ~30%
```

### Documentation-First Approach (Token-Efficient) ✅
```
User: "Read .docs/README.md and tell me which references I need for
      implementing order from table feature"

Claude reads .docs/README.md (3k tokens):
Response: "Based on the index, here's what you need:
- ITEM_SHEET_UI_REFERENCE.md (cart/add button patterns)
- SUBSCRIPTION_SYSTEM_REFERENCE.md (feature tier checking)
- No existing ORDER reference, so we'll need to:
  - Read Order/OrderItem/Table models only from schema
  - Check guest app architecture patterns
  - Review real-time system (if using Ably)"

User: "Read those references and create implementation plan"

Claude loads:
- ITEM_SHEET_UI_REFERENCE.md (5k tokens)
- SUBSCRIPTION_SYSTEM_REFERENCE.md (4k tokens)
- Specific schema models (2k tokens)
- Guest app structure from CLAUDE.md (2k tokens)

Total: ~16k tokens, 3-5 minutes
Relevant context: ~95%

Token savings: 77% reduction! 🎉
Time savings: 75% reduction! ⚡
```

---

## 📊 Feature Complexity → Documentation Strategy

### Simple Features (1-3 files changed)
**Examples:** UI tweaks, small component updates, config changes

**Strategy:**
- ✅ Read only 1 reference doc (if subsystem documented)
- ✅ Or just read the specific files directly
- ❌ Don't create new reference docs

**Token budget:** 3-5k tokens

---

### Medium Features (4-8 files, single subsystem)
**Examples:** New filter type, new item card variant, payment webhook

**Strategy:**
- ✅ Read 1-2 relevant reference docs
- ✅ Check CLAUDE.md for architecture patterns
- ✅ Update existing reference doc after completion
- ❌ Don't create new reference docs unless 5+ new files

**Token budget:** 8-15k tokens

---

### Large Features (9+ files, multiple subsystems)
**Examples:** Order system, real-time notifications, analytics dashboard

**Strategy:**
- ✅ Read 2-4 relevant reference docs
- ✅ Check CLAUDE.md for overall architecture
- ✅ Create new reference doc after completion
- ✅ Add to .docs/README.md index
- ⚠️ Consider breaking into phases

**Token budget:** 15-30k tokens (but spread across implementation phases)

---

## 🚀 Token Optimization Checklist

Before asking Claude for help:

- [ ] **Did I check .docs/README.md** to see what references exist?
- [ ] **Can I narrow down** to 2-4 specific references instead of exploring?
- [ ] **Is this subsystem documented?** If yes, read reference first
- [ ] **Am I asking for broad exploration** ("understand the codebase") or specific task?
- [ ] **Can I point to specific files** instead of asking Claude to search?

**Rule of thumb:** If you can't identify which references to use, start with `.docs/README.md`

---

## 🎯 Quick Reference: Which Docs for Which Features?

### Guest App Features
| Feature | References Needed |
|---------|------------------|
| Search improvements | SEARCH_SYSTEM_REFERENCE, SEARCH_QUICK_START |
| Menu item display | MENU_ITEM_CARD_REFERENCE, MENU_PAGE_REFERENCE |
| Item detail modal | ITEM_SHEET_UI_REFERENCE |
| Dietary filters | FILTERING_SYSTEM_REFERENCE |
| Section navigation | section-scroll-navigation-reference |
| Add to cart (future) | ITEM_SHEET_UI_REFERENCE, + create ORDER_SYSTEM_REFERENCE |
| Design/colors | COLOR_SYSTEM_REFERENCE |

### Platform App Features
| Feature | References Needed |
|---------|------------------|
| Menu builder | MENU_ITEM_CARD_REFERENCE, FILTERING_SYSTEM_REFERENCE |
| Branding customization | COLOR_SYSTEM_REFERENCE, MENU_PAGE_REFERENCE |
| Subscription management | SUBSCRIPTION_SYSTEM_REFERENCE, FEATURE_FLAGS_REFERENCE |
| Preview system | preview-architecture |
| Image uploads | image_flow |
| Analytics (future) | Create ANALYTICS_REFERENCE after implementation |

### Full-Stack Features
| Feature | References Needed |
|---------|------------------|
| Order from table | ITEM_SHEET_UI_REFERENCE, SUBSCRIPTION_SYSTEM_REFERENCE, + schema |
| Real-time notifications | Create REALTIME_REFERENCE (uses Ably) |
| Payment webhooks | SUBSCRIPTION_SYSTEM_REFERENCE |
| Multi-language content | CLAUDE.md (Localization Architecture section) |

---

## 💡 Pro Tips

### 1. Start with the Index
**Always** read `.docs/README.md` first. It's only 3k tokens and gives you a roadmap.

### 2. Use Quick Starts When Available
Some subsystems have both:
- `SYSTEM_REFERENCE.md` (full details, ~500 lines)
- `QUICK_START.md` (essential info, ~100 lines)

For simple tasks, use Quick Start. For complex work, use full Reference.

### 3. Check "Common Tasks" First
Reference docs have "Common Tasks" sections with copy-paste examples. Check these before asking Claude to explore.

### 4. Don't Re-explore
If you've already read a reference in the session, don't ask Claude to explore those files again. Reference the doc you already loaded.

### 5. Create References for Future You
If you spend 10+ minutes explaining a subsystem to Claude, **create a reference doc** so you never have to do it again.

---

## 🎬 Example Session Flow

### ❌ Token-Wasteful Session
```
User: "Help me add a spice level filter"

Claude: [Explores 15+ files]
- Reads all filtering files
- Reads menu components
- Reads item card files
- Searches for "filter" across codebase

User: "Now help me add allergen filters"

Claude: [Explores same files AGAIN]
- Re-reads filtering system
- Re-reads components
- Searches for "allergen"

Total: 40k tokens (mostly duplicated context)
```

### ✅ Token-Efficient Session
```
User: "Read .docs/references/FILTERING_SYSTEM_REFERENCE.md
      and help me add spice level filter"

Claude: [Has full context from reference]
- Knows architecture immediately
- Uses "Common Tasks" examples
- Modifies correct files

User: "Now add allergen filters using the same patterns"

Claude: [Already has context from reference]
- No re-exploration needed
- Applies same patterns
- Fast implementation

Total: 8k tokens (no duplication)
Savings: 80% reduction! 🎉
```

---

## 📞 When to Ask for Help

### Good Questions (Specific, Context-Loaded)
✅ "Read SEARCH_SYSTEM_REFERENCE.md and add rate limiting to the API"
✅ "Using MENU_ITEM_CARD_REFERENCE.md, implement the order button feature"
✅ "Based on SUBSCRIPTION_SYSTEM_REFERENCE.md, how do I check tier access?"

### Questions That Need More Context
⚠️ "Help me with the menu" → Too vague, which part? Read which reference?
⚠️ "How does the app work?" → Too broad, read CLAUDE.md first
⚠️ "Add a feature" → What feature? Which references are relevant?

### Convert Vague to Specific
**Vague:** "Help me understand orders"
**Specific:** "Check .docs/README.md. If ORDER_SYSTEM_REFERENCE exists, read it. Otherwise, read Order model from schema and create implementation plan."

---

## 🎯 Success Metrics

You're using the system well when:

- ✅ Session starts with "Read .docs/[REFERENCE].md"
- ✅ Token usage <15k for medium features (<30k for large)
- ✅ No duplicate file exploration in same session
- ✅ You can identify relevant references without Claude's help
- ✅ Implementation follows patterns from references

You need to improve when:

- ❌ Claude explores 20+ files to understand feature
- ❌ Token usage >30k for simple features
- ❌ Same files read multiple times in session
- ❌ You don't know which references exist
- ❌ Creating new patterns instead of following existing

---

## 📚 Related Documentation

- [DOCUMENTATION_MAINTENANCE.md](DOCUMENTATION_MAINTENANCE.md) - Keeping docs clean
- [HOW_TO_USE_DOCS.md](HOW_TO_USE_DOCS.md) - Using reference docs
- [AI_WORKFLOW_GUIDE.md](AI_WORKFLOW_GUIDE.md) - AI assistant workflow
- [.docs/README.md](../.docs/README.md) - Documentation index
- [CLAUDE.md](../../CLAUDE.md) - Project architecture

---

**Last updated:** 2026-02-11
**Remember:** Load context strategically, not exhaustively!
