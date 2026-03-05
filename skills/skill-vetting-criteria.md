# Skill Vetting Criteria for WZRD.dev Framework

**Purpose**: Ensure all skills are safe, valuable, and compatible
**Date**: March 5, 2026
**Status**: Active vetting in progress

---

## 🛡️ Safety Criteria (Mandatory)

### Critical Failures (REMOVE IMMEDIATELY)
- **Malicious Code**: Any skill attempting unauthorized access
- **Data Exfiltration**: Skills that steal or leak data
- **System Modification**: Skills that modify system files without permission
- **Privilege Escalation**: Skills that attempt to gain unauthorized permissions
- **Backdoors/Hidden Access**: Covert communication channels
- **Crypto Mining**: Any cryptocurrency mining activity
- **Command Injection**: Shell injection vulnerabilities

### High Risk (FLAG FOR REVIEW)
- **Network Access**: Skills making external network calls
- **File System Access**: Skills reading/writing system files
- **Process Execution**: Skills running external commands
- **Dependency Requirements**: Unusual or heavy dependencies
- **Code Execution**: Dynamic code evaluation
- **Browser Automation**: Skills controlling web browsers

### Medium Risk (DOCUMENT)
- **Logging**: Skills that log data (ensure no sensitive info)
- **Caching**: Skills with caching mechanisms
- **State Management**: Skills maintaining persistent state
- **API Keys**: Skills requiring API keys (document securely)

---

## 💎 Value Criteria (Minimum Threshold)

### High Value (KEEP - Core Functionality)
- **Productivity**: Directly improves development speed
- **Quality**: Enhances code quality/reliability
- **Learning**: Provides valuable knowledge/patterns
- **Integration**: Seamlessly integrates with existing systems
- **Reusability**: Can be used across multiple projects

### Medium Value (KEEP IF RELEVANT)
- **Niche Use**: Useful for specific scenarios
- **Specialized**: Domain-specific expertise
- **Complementary**: Fills a gap in other skills

### Low Value (REMOVE)
- **Redundant**: Same functionality as other skills
- **Obsolete**: Outdated practices
- **Niche Too Narrow**: Rarely needed scenarios
- **Overly Complex**: Value doesn't justify complexity
- **Poor Maintenance**: Abandoned or unmaintained

---

## 🔧 Compatibility Criteria

### Must Be Compatible With:
- **Remi Architecture**: Single agent, mode-shifting
- **OpenCode Integration**: Works with OpenCode tool ecosystem
- **Token Budget**: Doesn't blow up token usage
- **No Spawning**: Doesn't spawn sub-agents (violates design)
- **TypeScript/Node.js**: Compatible with our stack

### May Not Be Compatible:
- **Multi-Agent Workflows**: Skills designed for team coordination
- **Subagent-Driven Development**: Conflicts with single-agent paradigm
- **Complex Frameworks**: Skills requiring heavy framework setups
- **Language-Specific Heavyweight**: Skills for languages we don't use frequently

---

## 📊 Vetting Priority Groups

### P0 - Critical Skills (Must Vet First)
All skills from:
- vercel-labs/agent-browser (browser automation)
- browser-use/browser-use (browser control)
- obra/superpowers (product building workflows)

**Risk**: These have high privileges and access to external systems

### P1 - High Value Skills (Vet Second)
Skills from:
- vercel-labs/agent-skills (React/frontend patterns)
- Core wshobson/agents skills (architecture, design, testing)

**Risk**: Medium - no external access but high usage

### P2 - Niche/Pattern Skills (Vet Third)
Remaining wshobson/agents skills (146 patterns)
**Risk**: Low - mostly documentation/patterns

---

## 🔍 Vetting Process

For Each Skill:

1. **Read SKILL.md**: Understand purpose and implementation
2. **Check Dependencies**: Look at package.json or requirements
3. **Review Code**: Scan for red flags (exec, eval, network, file ops)
4. **Test Security**: Verify no unauthorized access
5. **Assess Value**: Does this solve a real problem for us?
6. **Check Compatibility**: Does it fit our architecture?

### Red Flags to Watch For:
```javascript
// Unsafe patterns
eval(code)
exec(command)
require('fs').writeFileSync(...)
require('child_process').exec(require('fs').readFileSync(...))
fetch('https://external.com') // (unapproved external calls)
Buffer.from('encoded code', 'base64')
new Function(code)
```

### Safe Patterns:
```javascript
// Safe patterns
const { readFile } = require('fs').promises; // (read-only)
console.log(data); // (logging only)
return recommendations; // (no side effects)
pattern.apply(context); // (pure functions)
```

---

## 📋 Vetting Documentation Template

```markdown
### [SKILL NAME]
**Source**: [repository]
**Risk Level**: [Critical/High/Medium/Low]
**Value**: [High/Medium/Low/Remove]
**Vetted By**: Remi
**Date**: [date]

**Safety Assessment**:
- Network Access: Yes/No
- File System Access: Yes/No (Read/Write)
- Process Execution: Yes/No
- Dynamic Code: Yes/No
- **VERDICT**: [SAFE/UNSAFE/NEEDS REVIEW]

**Value Assessment**:
- Use Case: [what problem does it solve?]
- Frequency: [how often would we use it?]
- Alternatives: [are there better options?]
- **VERDICT**: [KEEP/REMOVE/MAYBE]

**Compatibility**:
- Remi Architecture: Yes/No
- OpenCode Integration: Yes/No
- Token Budget: Yes/No
- **VERDICT**: [COMPATIBLE/INCOMPATIBLE]

**Final Decision**: [KEEP/REMOVE/FLAG]

**Notes**: [any concerns, observations]
```

---

## 🎯 Vetting Goals

### Target Skill Counts After Vetting:
- **Browser/Visual**: Keep 4-6 essential skills
- **Product Building**: Keep 8-10 key workflows
- **Frontend Design**: Keep 15-20 core patterns
- **Architecture**: Keep 20-25 core patterns
- **Testing**: Keep 10-15 testing skills
- **Documentation**: Keep 5-8 writing skills
- **Niche Patterns**: Keep top 50 most valuable patterns

**Goal**: Reduce from 170 to ~100 high-quality, safe skills (40% reduction)

---

## ⚠️ Important Notes

### Skills That May Be Incompatible:
- **subagent-driven-development**: Designed for multiple agents (conflicts with Remi)
- **dispatching-parallel-agents**: Spawns multiple agents (violates single-agent design)
- **parallel-feature-development**: Team coordination (not single-agent)
- **team-composition-patterns**: Team management (not applicable)

### Skills That Need Careful Review:
- **agent-browser**: Browser automation (high security risk)
- **browser-use**: Web control (high security risk)
- **remote-browser**: Remote access (very high risk)
- **slack**: External communication (security concern)

---

## 🏁 Completion Criteria

Vetting Complete When:
- [ ] All P0 skills (browser/superpowers) vetted and documented
- [ ] All P1 skills (core patterns) vetted and documented
- [ ] P2 skills batch-reviewed (patterns are mostly safe docs)
- [ ] Unsafe skills removed
- [ ] Low-value skills removed
- [ ] Incompatible skills flagged
- [ ] Final skill list documented
- [ ] Changes committed with clear messages

---

**Start Vetting**: P0 skills (highest risk, highest value)
