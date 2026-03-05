# WZRD.dev Skills Audit Framework

**Goal**: Reduce 170 skills to the essential, valuable core with no overlap
**Date**: March 5, 2026
**Strategy**: Systematic vetting by category

---

## 🔒 Immediate Removals (Incompatible with Single-Agent Architecture)

```bash
# Remove these first - they explicitly spawn subagents or require multi-agent systems
rm -rf .agents/skills/subagent-driven-development
rm -rf .agents/skills/dispatching-parallel-agents
rm -rf .agents/skills/remote-browser
rm -rf .agents/skills/browser-use

# Remove symlinks in .claude/skills/
rm -f .claude/skills/subagent-driven-development
rm -f .claude/skills/dispatching-parallel-agents
rm -f .claude/skills/remote-browser
rm -f .claude/skills/browser-use
```

**Reason**: These skills are designed for multi-agent coordination, not single-agent mode shifting.

---

## 🎯 Keep (Single Essential Per Category)

### Browser/Visual
- ✅ KEEP: agent-browser (single, essential browser automation)

### Product Building (adapt for mode-shifting)
- ✅ KEEP: brainstorming (essential design gatekeeper)
- ✅ KEEP: systematic-debugging (debug methodology)
- ✅ KEEP: writing-plans (implementation planning)
- ✅ KEEP: executing-plans (single-agent execution)
- ✅ KEEP: test-driven-development (TDD methodology)
- ✅ KEEP: verification-before-completion (quality gates)

❌ REMOVE obra/superpowers that spawn subagents (already removed)
❌ REMOVE redundant ones (assessing duplicates)

---

## 📊 Vetting Process for Remaining Skills

For each skill group, I'll:

1. **List all skills** in the category
2. **Identify overlaps** (multiple skills solving same problem)
3. **Choose the best one** (most comprehensive, best-maintained, most compatible)
4. **Document removed skills** with reasoning

### Categories to Audit

1. **Frontend/React** (20+ skills) - Keep top 3-5 most valuable
2. **Architecture/Patterns** (15+ skills) - Keep core 8-10 patterns
3. **Testing** (10+ skills) - Keep essential testing skills
4. **Python** (15+ skills) - Keep only if we use Python heavily
5. **JavaScript/TypeScript** (8+ skills) - Keep key patterns
6. **DevOps/Kubernetes** (10+ skills) - What do we need?
7. **Database** (5+ skills) - Keep relevant ones
8. **AI/LLM** (8+ skills) - Keep LLM patterns we use
9. **Security** (5+ skills) - Keep security patterns
10. **Documentation/Writing** (5+ skills) - Keep writing skills
11. **Mobile/iOS/Android** (3 skills) - Do we need mobile?
12. **Web Components** (1 skill) - Is this relevant?
13. **Design/UI** (8+ skills) - Keep design patterns
14. **Git/Workflows** (5+ skills) - Keep git patterns
15. **Monitoring/Observability** (5+ skills) - Keep monitoring
16. **Performance Optimization** (5+ skills) - Keep optimization
17. **Deployment/CI/CD** (5+ skills) - Keep deployment patterns
18. **Authentication/Security** (5+ skills) - Keep auth patterns
19. **Project Management/Startups** (5+ skills) - Do we need?
20. **Crypto/Web3** (3 skills) - Do we need?
21. **Reverse Engineering** (3 skills) - Do we need?
22. **Game Development** (2 skills) - Do we need?
23. **Accessibility** (1 skill) - Keep for accessibility
24. **API Design** (1 skill) - Keep if we build APIs
25. **Data Analysis/ML** (5+ skills) - If we do data work

---

## 🎯 Target Final Count

Initial: 170 skills
Target: 60-80 skills (50-55% reduction)

Breakdown:
- Browser/Visual: 1 (agent-browser)
- Product Building: 6 (superpowers adapted)
- Frontend/React: 5-8
- Architecture: 8-10
- Testing: 5-6
- TypeScript/JS: 4-5
- Design/UI: 3-4
- Git/Workflows: 3-4
- Python: 0-2 (if needed)
- Other niche: ~20-25

---

## 📋 Documentation

Every removal must be documented:

```markdown
### [SKILL NAME] - REMOVED
**Category**: [category]
**Reason**: [concise reason]
**Alternative**: [what skill replaces it]
```

---

