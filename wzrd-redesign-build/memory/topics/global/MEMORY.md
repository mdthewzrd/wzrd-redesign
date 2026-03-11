# Global Memory - Project Context

## WZRD.dev Core Information

**Project**: WZRD Redesign - Complete agent system rebuild
**Goal**: Create lean, powerful baseline that covers 95% of use cases
**Philosophy**: Simple, efficient, talented - no overkill

## Phase Status
- **Phase 0**: Complete ✅ (Foundation validation)
- **Phase 1**: Complete ✅ (Core systems)
- **Phase 2**: In Progress ⏳ (Skills optimization, Week 2)
- **Phase 3**: Pending ⏳ (Manual testing)

## Key Architecture Decisions
1. **Single Agent with Mode Shifting**: Remi shifts between modes (chat, thinker, coder, debug, research)
2. **Token Optimization**: Smart skill loading, budget tracking ($1/day target)
3. **Memory System**: Unified memory with grep/ripgrep (no vector DBs)
4. **Skills**: 148 remaining after removal (down from 230)

## Current Work (March 6, 2026)
- Completing Phase 2 Week 2: Autonomy features (job scheduler, pattern extraction, user learning)
- Need to actually USE memory system (currently not integrated)

## Token Efficiency Metrics
- Average skills per query: 12.5 (8.4% of total)
- Token savings: ~92% vs loading all skills
- Estimated daily cost: $0.04-0.08 (under $1/day budget)

## Skills Strategy
- Smart loading based on task type and language
- Language detection: Python for Python tasks, JS for JS tasks
- 11 task categories for skill routing

## Files Reference
- Roadmap: `/home/mdwzrd/wzrd-redesign/FINAL_LAP_ROADMAP.md`
- Skills decisions: `/home/mdwzrd/wzrd-redesign/skills/FINAL-skills-vetting-complete.md`
- Token dashboard: `bin/token-dashboard.js`
- Smart loader: `bin/smart-skill-loader.js`

## Recent Commits
- Phase 2 Week 2: Job scheduler, pattern extraction, user preference learning implemented
- Next: Need to integrate memory system into wzrd-mode