# Phase 2 Implementation Plan (Week 1)
## With Git-Based Safety System

**Status**: Starting | **Date**: March 5, 2026 |
**Branches**:
- `feature/phase2-week1` - Main work branch (safe files)
- `critical/cli-skill-mapping` - CLI wrapper updates (critical files only)
- `main` - Stable baseline (roll back anytime)

---

## 🗺️ Week 1: Skill Integration

### Days 1-2: Install Core Skills

**Branch**: `feature/phase2-week1` (SAFE)

#### Priority 1: Browser/Visual (MOST CRITICAL)
```bash
npx skills add vercel-labs/agent-browser
npx skills add browser-use/browser-use
```

#### Priority 2: Product Building
```bash
npx skills add obra/superpowers
```

#### Priority 3: Frontend Design
```bash
npx skills add vercel-labs/agent-skills --skill vercel-react-best-practices
npx skills add vercel-labs/agent-skills --skill web-design-guidelines
npx skills add wshobson/agents --skill shadcn-ui
```

**Deliverables**:
- [ ] All core skills installed
- [ ] Skills listed in new documentation
- [ ] Initial testing of skill availability

---

### Days 3-4: Configure Smart Loading

**Branch**: `feature/phase2-week1` (SAFE)

#### Task Analysis System
Create: `skills/task-analyzer.ts`
- Analyze task keywords
- Match to relevant skills
- Return skill list

#### Dynamic Skill Router
Create: `skills/dynamic-skill-router.ts`
```typescript
class DynamicSkillRouter {
  async loadSkillsForTask(task: string, mode: Mode): Promise<string[]> {
    const requiredSkills = await this.analyzeTask(task);
    const baseSkills = this.getModeSkills(mode);
    return [...new Set([...baseSkills, ...requiredSkills])];
  }
}
```

#### Mode-Skill Mapping Update
Update: `remi/SKILLS.md`
- Document new skills
- Update P0/P2 lists
- Map skills to modes

**Deliverables**:
- [ ] Task analysis system working
- [ ] Dynamic skill router implemented
- [ ] Skills documentation updated
- [ ] All files committed to feature branch

---

### Days 5-7: Validate & Document

**Branch**: Feature work continues + Critical branch for CLI

#### Integration Tests
Create: `test-phase2-skills.sh`
- Test skill loading
- Verify skill availability
- Check token usage

#### Critical File Update (Branch Switch)
**Switch to**: `critical/cli-skill-mapping`
**Modify**: `wzrd-mode`

**Changes Applied**:

1. **Line 54-89**: Replace hardcoded skills with dynamic loader
   ```bash
   # OLD: Hardcoded case statements
   # NEW: Read from skills-integration.md
   ```

2. **Line 168-186**: Update skill loading announcements
   ```bash
   # OLD: Static echo statements
   # NEW: Dynamic based on skills-integration.md
   ```

**How To Apply**:
```bash
# When ready to update CLI
git stash                    # Save feature work
git checkout critical/cli-skill-mapping
# [Edit wzrd-mode]
git add wzrd-mode
git commit -m "Phase2: Make CLI skill mappings dynamic"
git checkout feature/phase2-week1
git stash pop                # Resume feature work
```

#### Documentation
Create: `docs/phase2-week1-complete.md`
- Skill integration summary
- Testing results
- Token savings measurements
- CLI changes applied

**Deliverables**:
- [ ] Integration tests passing
- [ ] CLI updates in critical branch (committed)
- [ ] Documentation complete
- [ ] Token benchmarks recorded

---

## 🔄 Git Workflow Summary

### Normal Operation (Safe Files)
```bash
git add skills/*.ts
git commit -m "Phase2: Implement dynamic skill router"
```

### Critical File Updates (CLI Wrapper)
```bash
git stash                    # Save work
git checkout critical/cli-skill-mapping
# Edit wzrd-mode
git add wzrd-mode && git commit -m "Update skills"
git checkout feature/phase2-week1
git stash pop                # Resume
```

### Merge to Main (When Ready)
```bash
# 1. Review critical branch
git checkout main
git merge critical/cli-skill-mapping

# 2. Review feature branch
git merge feature/phase2-week1

# 3. CLI has new skill mappings on next launch!
./wzrd-mode  # Uses dynamic skill loader
```

### Safety Rollback
```bash
git checkout main
git branch -D feature/phase2-week1
git branch -D critical/cli-skill-mapping
```

---

## 📊 Success Metrics

### Week 1 Goals
- [ ] 8+ new skills installed
- [ ] Dynamic skill router working
- [ ] Integration tests passing
- [ ] Token usage maintained at 90%+ savings
- [ ] CLI uses dynamic skill loading (in critical branch)
- [ ] Documentation complete

### Testing Checklist
- [ ] Skills install without errors
- [ ] Task analysis returns correct skills
- [ ] Dynamic router integrates with mode system
- [ ] Token usage measured (before/after)
- [ ] CLI updates tested (next launch)

---

## 🚫 What NOT To Touch

### Critical Files (Only in critical branch)
- `wzrd-mode` - CLI wrapper
- `remi/SOUL.md` - My identity

### Safe Files (Feature branch only)
- `remi/SKILLS.md` - Documentation ✅
- `remi/modes/*.md` - Mode descriptions ✅
- `.claude/skills/` - Skill definitions ✅
- `skills/`, `scripts/` - New systems ✅

---

## 📋 Progress Tracking

- [ ] Day 1-2: Install core skills
- [ ] Day 3: Task analysis system
- [ ] Day 4: Dynamic skill router
- [ ] Day 5: Integration tests
- [ ] Day 6: CLI updates (critical branch)
- [ ] Day 7: Documentation + validation

---

## 🎯 Next Steps

1. **Start Day 1**: Install core skills
2. **Commit frequently**: After each milestone
3. **Don't touch critical files**: Until day 6
4. **Use branches**: Keep work isolated
5. **Test thoroughly**: Before merging to main

---

**Ready to start Week 1!** 🚀
