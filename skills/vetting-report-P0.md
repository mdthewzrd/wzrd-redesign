# Phase 2 Skill Vetting Report - P0 Skills

**Date**: March 5, 2026
**Vetted By**: Remi
**Status**: IN PROGRESS - Critical P0 skills vetted

---

## 🚨 CRITICAL FINDINGS: Incompatible Skills Discovered

### HIGH PRIORITY: Remove Immediately

| Skill | Issue | Severity | Recommendation |
|-------|-------|----------|----------------|
| remote-browser | Only supports cloud browsers that spawn subagents | CRITICAL | **REMOVE** |
| subagent-driven-development | Explicitly spawns 3+ subagents per task | CRITICAL | **REMOVE** |
| dispatching-parallel-agents | Explicitly spawns multiple parallel agents | CRITICAL | **REMOVE** |

---

## 📋 Detailed Vetting Results

### Browser Automation Skills

#### 1. agent-browser
**Source**: vercel-labs/agent-browser
**Risk Level**: HIGH (external browser control)
**Value**: HIGH (visual testing, screenshot validation essential)
**Compatibility**: ✅ COMPATIBLE (no subagent spawning)

**Safety Assessment**:
- Network Access: Yes (browses external websites) - CONTROLLABLE with domain allowlist
- File System Access: Yes (saves screenshots, state) - SAFE (read-write to designated dirs)
- Process Execution: Yes (spawns browser daemon) - SAFE (playwright/chromium)
- Dynamic Code: Yes (JavaScript eval in browser context) - CONTROLLABLE
- **VERDICT**: SAFE WITH GUARDRAILS

**Value Assessment**:
- Use Case: Visual validation, screenshot testing, browser automation for E2E tests
- Frequency: High (UI testing, visual regression testing)
- Alternatives: None with equal capabilities
- **VERDICT**: KEEP (essential capability)

**Compatibility**:
- Remi Architecture: Yes (single agent, mode shifting)
- OpenCode Integration: Yes (bash tool access)
- Token Budget: Yes (controlled usage)
- **VERDICT**: COMPATIBLE

**Final Decision**: KEEP WITH RESTRICTIONS
- Require domain allowlist (`AGENT_BROWSER_ALLOWED_DOMAINS`)
- Enable content boundaries (`AGENT_BROWSER_CONTENT_BOUNDARIES=1`)
- Document security best practices

**Notes**:
- Use `--content-boundaries` to wrap page content
- Restrict with domain allowlist for safety
- Don't share credentials in plaintext (use auth vault)

---

#### 2. browser-use
**Source**: browser-use/browser-use
**Risk Level**: HIGH (browser automation with remote mode)
**Value**: HIGH (similar to agent-browser)
**Compatibility**: ⚠️ PARTIALLY INCOMPATIBLE

**Safety Assessment**:
- Network Access: Yes (browses external websites) - CONTROLLABLE
- File System Access: Yes (screenshots, cookies) - SAFE
- Process Execution: Yes (browser daemon, cloudflared tunnels) - SAFE
- Dynamic Code: Yes (JavaScript eval, Python execution) - CONTROLLABLE (in browser/session scope)
- **VERDICT**: SAFE WITH GUARDRAILS

**Value Assessment**:
- Use Case: Browser automation, similar to agent-browser
- Frequency: High (if agent-browser not available)
- Alternatives: agent-browser (preferred)
- **VERDICT**: MAYBE (redundant with agent-browser)

**Compatibility**:
- Remi Architecture: ⚠️ PARTIAL (local modes compatible, remote mode spawns subagents)
- OpenCode Integration: Yes (bash tool access)
- Token Budget: Yes (controlled usage)
- **VERDICT**: PARTIALLY COMPATIBLE - Document remote mode spawning concerns

**Final Decision**: FLAG WITH WARNINGS
- Local modes (chromium, real): COMPATIBLE
- Remote mode: INCOMPATIBLE (spawns cloud browser agents)
- Consider keeping only if agent-browser isn't sufficient

**Notes**:
- Remote mode explicitly spawns subagents via cloud API - incompatible
- Local modes work fine
- Agent-browser has better security features (content boundaries, domain allowlist)
- Recommendation: Keep agent-browser, mark browser-use as redundant

---

#### 3. remote-browser ❌ REMOVE
**Source**: browser-use/browser-use
**Risk Level**: VERY HIGH (only cloud browsers)
**Value**: LOW (only for sandboxed environments)
**Compatibility**: ❌ INCOMPATIBLE (subagent spawning)

**Safety Assessment**:
- Network Access: Yes (cloud browser API) - UNCONTROLLED
- File System Access: Yes - SAFE
- Process Execution: Yes - SAFE
- Dynamic Code: N/A
- **VERDICT**: UNSAFE (relies on external cloud service)

**Value Assessment**:
- Use Case: Remote browsers for sandboxed agents
- Frequency: None (Remi doesn't run in sandbox)
- Alternatives: agent-browser local mode
- **VERDICT**: REMOVE

**Compatibility**:
- Remi Architecture: ❌ INCOMPATIBLE (requires browser-use remote mode which spawns subagents)
- OpenCode Integration: No
- Token Budget: No (cloud API costs)
- **VERDICT**: INCOMPATIBLE

**Final Decision**: REMOVE
- Explicitly designed for sandboxed agents (different use case)
- Only works with remote browser mode (subagent spawning)
- No value for WZRD.dev (Remi isn't sandboxed)
- Redundant with agent-browser local mode

---

### Product Building Skills (obra/superpowers)

#### 4. brainstorming
**Source**: obra/superpowers
**Risk Level**: LOW (conversation/planning only)
**Value**: HIGH (essential for design and planning)
**Compatibility**: ✅ COMPATIBLE

**Safety Assessment**:
- Network Access: No
- File System Access: Yes (reads project files, writes design docs) - SAFE
- Process Execution: No
- Dynamic Code: No
- **VERDICT**: SAFE

**Value Assessment**:
- Use Case: Turn ideas into designs before implementation
- Frequency: High / Essential (gatekeeper before all creative work)
- Alternatives: Manual planning (less effective)
- **VERDICT**: KEEP (essential skill)

**Compatibility**:
- Remi Architecture: Yes (single agent mode shifting: planner mode)
- OpenCode Integration: Yes (file tools, topic-switcher)
- Token Budget: Yes
- **VERDICT**: COMPATIBLE

**Final Decision**: KEEP
- Core workflow skill for design phase
- Hard-gate prevents premature implementation
- Compatible with Remi's mode-shifting (shift to thinker mode before coding)
- Creates design docs that align with Remi's memory system

**Notes**:
- This is the skill Remi uses before entering coder mode
- Aligns perfectly with our mode-shifting ideology (think first, code second)
- Essential for maintaining high quality

---

#### 5. subagent-driven-development ❌ REMOVE
**Source**: obra/superpowers
**Risk Level**: CRITICAL (explicit subagent spawning)
**Value**: MEDIUM (workflow methodology)
**Compatibility**: ❌ INCOMPATIBLE (violates single-agent design)

**Safety Assessment**:
- Network Access: No (unless spawned agents use it)
- File System Access: Yes - SAFE
- Process Execution: N/A (spawns subagents, not processes directly)
- Dynamic Code: No
- **VERDICT**: UNSAFE (subagent spawning is incompatible with architecture)

**Value Assessment**:
- Use Case: Execute implementation plans with independent tasks
- Frequency: Would be high (if compatible)
- Alternatives: Single agent with mode shifting (our approach)
- **VERDICT**: REMOVE (incompatible methodology)

**Compatibility**:
- Remi Architecture: ❌ INCOMPATIBLE
  - Spawns implementer subagent
  - Spawns spec reviewer subagent
  - Spawns code quality reviewer subagent
  - Spawns final code reviewer subagent
  - Per task = 4 subagents minimum
- OpenCode Integration: N/A (conflicts)
- Token Budget: No (multiple agents = higher cost)
- **VERDICT**: INCOMPATIBLE

**Final Decision**: REMOVE
- Explicitly designed for multi-agent coordination
- Spawns 3-4 subagents per task
- Completely violates Remi's single-agent, mode-shifting architecture
- Our alternative: Mode shifting within one Remi agent

**Notes**:
The workflow value (spec review → quality review → final review) is valuable, but can be adapted to single-agent mode shifting:

```
Current (subagent-driven):
[Task] -> [Implementer Subagent] -> [Spec Reviewer] -> [Quality Reviewer] -> [Done]

Adapted (mode shifting):
[Task] -> [Coder Mode: Implement] -> [Coder Mode: Self-review] ->
[Debug Mode: Verify against spec] -> [Coder Mode: Fix if needed] ->
[Debug Mode: Code quality review] -> [Coder Mode: Final polish] -> [Done]
```

---

#### 6. dispatching-parallel-agents ❌ REMOVE
**Source**: obra/superpowers
**Risk Level**: CRITICAL (parallel agent spawning)
**Value**: MEDIUM (parallel debugging)
**Compatibility**: ❌ INCOMPATIBLE

**Safety Assessment**:
- Network Access: No
- File System Access: Yes - SAFE
- Process Execution: No
- Dynamic Code: No
- **VERDICT**: UNSAFE (parallel subagent spawning incompatible)

**Value Assessment**:
- Use Case: Parallel debugging of independent failures
- Frequency: Would be medium (debugging scenarios)
- Alternatives: Sequential debugging with mode shifting
- **VERDICT**: REMOVE (incompatible with single-agent design)

**Compatibility**:
- Remi Architecture: ❌ INCOMPATIBLE
  - Explicitly dispatches "one agent per problem domain"
  - Runs agents concurrently
  - Total violation of single-agent paradigm
- OpenCode Integration: N/A
- Token Budget: No (multiple agents = higher cost)
- **VERDICT**: INCOMPATIBLE

**Final Decision**: REMOVE
- Designed for parallel multi-agent execution
- Completely incompatible single-agent architecture
- We get speed through efficiency, not parallel agents
- Alternative: Use todo list to track and fix issues sequentially

**Notes**:
Adapted workflow for single agent:
- Create TodoWrite with all failure domains
- Systematically work through each with mode shifting
- [Thinker Mode] Analyze problem
- [Coder Mode] Fix it
- [Debug Mode] Verify fix
- Repeat

---

## 📊 Summary of P0 Vetting

### Safe to Keep (3 Skills)
1. ✅ agent-browser (with guardrails)
2. ✅ brainstorming (essential)
3. ⚠️ browser-use (local modes only, remote mode flagged)

### Remove Immediately (3 Skills)
1. ❌ remote-browser (incompatible - cloud browsers)
2. ❌ subagent-driven-development (incompatible - spawns subagents)
3. ❌ dispatching-parallel-agents (incompatible - spawns parallel agents)

---

## 🔄 Next Steps

1. **Document incompatibility patterns** - Any skill that:
   - Spawns subagents
   - Dispatches multiple agents
   - Requires multi-agent coordination

2. **Remove incompatible skills** from `.claude/skills/`

3. **Commit changes** with clear documentation of why skills were removed

4. **Continue vetting** P1 skills (vercel-labs/agent-skills, wshobson core patterns)

---

**Status**: P0 critical skills vetted. Ready to proceed with P1 skills.
