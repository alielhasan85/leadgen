# How to Use .docs Reference Files

## Purpose
The `.docs/` folder contains **token-efficient reference documentation** for specific systems in the codebase. These files help AI assistants and developers quickly understand complex subsystems without re-exploring the entire codebase.

---

## Available Documentation

### 1. SEARCH_SYSTEM_REFERENCE.md
**Use when:** Working on guest app search functionality
**Covers:**
- Search architecture (React Context + API + Database)
- File locations and responsibilities
- Database schema and indexes
- Common tasks and how-tos
- Known issues and roadmap

---

## How to Use in AI Sessions

### Starting a New Session

**Instead of:**
```
"Help me understand how search works in the guest app"
[AI explores 10+ files, uses 20k tokens]
```

**Do this:**
```
"Read .docs/SEARCH_SYSTEM_REFERENCE.md and help me [specific task]"
[AI reads one file, uses 3k tokens, has full context]
```

### Example Prompts

#### Working on Search
```
"Load context from .docs/SEARCH_SYSTEM_REFERENCE.md
then help me add rate limiting to the search API"
```

#### Debugging Search
```
"Using .docs/SEARCH_SYSTEM_REFERENCE.md as reference,
why might search results be empty for Arabic queries?"
```

#### Adding Features
```
"Reference .docs/SEARCH_SYSTEM_REFERENCE.md
and help me add search history to the overlay"
```

---

## Benefits

### For AI Assistants
- ✅ **Fast context loading** (1 file vs 10+ files)
- ✅ **Token efficient** (3k vs 20k+ tokens)
- ✅ **Structured knowledge** (no exploring needed)
- ✅ **Up-to-date architecture** (maintained by team)

### For Developers
- ✅ **Onboarding shortcut** (read one doc, understand system)
- ✅ **Quick reference** (no digging through code)
- ✅ **Common tasks** (copy-paste solutions)
- ✅ **Institutional knowledge** (captured and maintained)

---

## Maintenance Rules

### When to Update Reference Docs
- ✅ After major architecture changes
- ✅ After adding/removing key files
- ✅ After discovering important gotchas
- ✅ After completing roadmap items
- ✅ Every 3 months (routine review)

### What NOT to Put in Reference Docs
- ❌ Implementation details that change frequently
- ❌ Temporary workarounds
- ❌ Personal notes or todos
- ❌ Full code listings (use file paths instead)

### How to Update
1. Make your code changes
2. Test and verify
3. Update relevant `.docs/*.md` file
4. Update "Last Updated" date
5. Commit both code and docs together

---

## Creating New Reference Docs

### When to Create a New Doc
Create a reference doc when:
- System spans 5+ files
- Architecture is complex (multiple layers)
- New team members ask "how does X work?" repeatedly
- You're about to explain it to AI for the 3rd time

### Template Structure
```markdown
# [System Name] Reference

> **Last Updated:** YYYY-MM-DD
> **Status:** [Working/In Development/Deprecated]
> **Tech:** [Key technologies]

## Quick Reference
[File map, key concepts, 2-3 sentences]

## Architecture Flow
[Diagram or flowchart]

## Key Components
[File-by-file breakdown]

## Common Tasks
[How to do X, Y, Z]

## Known Issues
[Current limitations]

## Future Improvements
[Roadmap]

## How to Use This Reference
[Instructions for AI/humans]
```

---

## Tips for Token Efficiency

### Do ✅
- Use tables for structured data
- Use code blocks sparingly (only key snippets)
- Link to files instead of copying full code
- Use bullet points over paragraphs
- Include "Quick Reference" section at top

### Don't ❌
- Copy entire files into docs
- Write long prose explanations
- Include implementation details
- Duplicate information across docs
- Leave outdated information

---

## Examples of Good vs Bad

### ❌ Bad (Token Heavy)
```markdown
Here's the entire SearchProvider code:

[200 lines of code]

And here's the entire API endpoint:

[150 lines of code]

The search works by first checking if the query...
[5 paragraphs of explanation]
```

### ✅ Good (Token Efficient)
```markdown
## Search Provider
**File:** `apps/guest/context/menu-search.tsx`
**Purpose:** State management for search

Key exports:
- `MenuSearchProvider` - Wraps app
- `useMenuSearch()` - Hook for components

See "Common Tasks" for usage examples.
```

---

## Integration with CLAUDE.md

The main `CLAUDE.md` file contains **project-wide** conventions and architecture.

`.docs/` reference files contain **subsystem-specific** details.

**When to check CLAUDE.md:**
- Starting work on any part of the project
- Understanding overall project structure
- Learning coding conventions
- Understanding the domain model

**When to check .docs/ files:**
- Working on a specific subsystem (search, orders, etc.)
- Need detailed implementation guidance
- Looking for common tasks/patterns
- Debugging specific functionality

---

## Future Reference Docs to Create

Suggested topics for future documentation:

- [ ] **ORDER_SYSTEM_REFERENCE.md** (when order placement is built)
- [ ] **MENU_BUILDER_REFERENCE.md** (platform app menu management)
- [ ] **DESIGN_SYSTEM_REFERENCE.md** (venue branding/theming)
- [ ] **REALTIME_REFERENCE.md** (Ably integration when added)
- [ ] **PAYMENT_REFERENCE.md** (Paddle integration when added)
- [ ] **IMAGE_UPLOAD_REFERENCE.md** (media management)
- [ ] **ANALYTICS_REFERENCE.md** (tracking and dashboards)

---

*Keep this guide updated as we add more reference documentation!*
