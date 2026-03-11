---
name: agent-onboarding
description: Conversational agent transformation from stock Remi to custom agents
category: orchestration
priority: P1
tags: [agent-transformation, onboarding, custom-agents]
subskills:
  - vision-clarification
  - skills-planning
  - persona-design
  - agent-creation
---

# Agent Onboarding Skill

## Purpose
Guide users through transforming stock Remi into a custom AI agent through conversational onboarding.

## Core Principle
**"Great custom agents are born from clear vision, iterative refinement, and collaborative design."**

---

## What This Skill Enables

**Users can:**
- Start with stock Remi and transform into a specialized agent
- Clarify their vision through guided conversation
- Design agent capabilities (skills, personas, modes)
- Create the agent project structure automatically
- Set up communication platforms (Discord, Telegram, Web)

**The agent becomes:**
- Renata (trading, systematic backtesting, edge discovery)
- Dilution Agent (SEC filings, due diligence)
- Legal Agent (contract review, compliance)
- Research Agent (competitive analysis, market intelligence)
- Or any custom agent the user envisions

---

## Onboarding Workflow

### Phase 1: Vision Clarification

**Goal:** Understand what the user wants to build

**Questions to ask:**
1. **What's your agent's name?** (e.g., "Renata")
2. **What domain/area does it specialize in?** (e.g., "systematic trading", "legal", "medical", "finance")
3. **What's the primary purpose?** (e.g., "Master systematic trading, backtesting, and edge discovery")
4. **What problems does it solve?** (e.g., "Convert trading ideas into quantifiable strategies")
5. **Any existing documentation or resources?** (ask to share links, files, or explain)

**Document the vision in memory:**
```
## Agent Vision
Name: {name}
Domain: {domain}
Purpose: {purpose}
Problems Solved: {problems}
Resources: {links/files}
```

### Phase 2: Capability Design

**Goal:** Define what the agent can do

**Areas to explore:**

**Skills:**
- What domain-specific skills are needed?
- Which of Remi's base skills should be enhanced?
- Any new skills to create?

**Modes/Personas:**
- Does the agent need different modes?
- Example trading agent modes:
  - **Edge Discovery** - Finding new trading opportunities
  - **Backtesting** - Testing strategies
  - **Code Generator** - Writing scan/backtest code
  - **Optimization** - Improving performance

**Gold Standard:**
- Is there a domain-specific gold standard?
- Example: Systematic Trading Gold Standard for scans/backtests

**Human-in-the-Loop Points:**
- Where should the agent ask for human approval?
- Example: Before executing trades (for trading agent)
- Example: Before sharing with external parties (for research agent)

### Phase 3: Agent Creation

**Goal:** Create the agent project structure

**Use the existing manager.ts `createAgentProject` function:**

```bash
# From WZRD gateway or CLI
cd /home/mdwzrd/wzrd.dev/projects
node -e "const {createAgentProject} = require('./manager.js'); createAgentProject({ name: 'Renata', slug: 'renata', agent_purpose: '...', agent_domain: 'trading', communication_platform: 'both' })"
```

**This creates:**
- `/projects/{slug}/AGENT.md` - Agent identity
- `/projects/{slug}/project.md` - Project metadata
- `/projects/{slug}/memory/` - Agent's memory
- `/projects/{slug}/skills/` - Custom skills
- `/projects/{slug}/discord/` - Discord bot
- `/projects/{slug}/telegram/` - Telegram bot

### Phase 4: Integration Setup

**Goal:** Connect the agent to the communication platform

**For Discord:**
1. Create bot at https://discord.com/developers/applications
2. Edit `config.json` with bot token and permissions
3. Invite bot to server
4. Update Gateway routing if needed

**For Telegram:**
1. Create bot via @BotFather in Telegram
2. Edit `config.json` with bot token
3. Share pairing code with users

**Gateway Routing:**
```json
{
  "tieredRouting": {
    "routes": {
      "renata": {
        "agent": "renata",
        "workdir": "/home/mdwzrd/wzrd.dev/projects/renata",
        "memory": "/home/mdwzrd/wzrd.dev/projects/renata/memory/MEMORY.md"
      }
    }
  }
}
```

---

## ⚠️ CRITICAL: wzrd.dev Gateway V2 Integration

**All agent invocations MUST route through wzrd.dev Gateway V2 with GLM model routing.**

### Gateway V2 API Pattern

When launching or invoking custom agents, use:

```bash
POST http://127.0.0.1:18801/api/gateway/chat
Content-Type: application/json

{
  "prompt": "Agent task...",
  "agent": "{agent_name}",
  "topic": "{topic}",
  "model": "{model_from_persona}",
  "platform": "cli",
  "workdir": "{working_directory}"
}
```

### Agent Configuration Requirements

Each custom agent needs:

1. **Persona Config** (`/home/mdwzrd/wzrd.dev/remi/personas/{agent}.md`):
   ```yaml
   ---
   name: {AgentName}
   short_name: {agent-slug}
   mode_preference: {mode}
   model: glm-4.5-air  # or glm-4.5, glm-4.7
   provider: glm
   topic: {default_topic}
   ---
   ```

2. **Gateway Routing** (in Gateway config):
   ```json
   {
     "tieredRouting": {
       "routes": {
         "{agent}": {
           "agent": "{agent}",
           "workdir": "/home/mdwzrd/wzrd.dev/projects/{agent}",
           "memory": "/home/mdwzrd/wzrd.dev/projects/{agent}/memory/MEMORY.md"
         }
       }
     }
   }
   ```

### Model Routing Table

| Model | Use Case | Cost | Capability |
|-------|----------|------|------------|
| glm-4.5-air | Quick tasks, research, orchestration | Low | Fast, efficient |
| glm-4.5 | Balanced coding, analysis | Medium | Good quality |
| glm-4.7 | Deep reasoning, architecture | High | Maximum capability |

### NEVER Use Claude Code Agent Tool

**Wrong:**
```javascript
Agent({
  subagent_type: "general-purpose",
  prompt: "..."
})
```

**Right:**
```bash
curl -X POST http://127.0.0.1:18801/api/gateway/chat \
  -H "Content-Type: application/json" \
  -d '{
    "agent": "{agent_name}",
    "prompt": "...",
    "topic": "{topic}",
    "model": "glm-4.5-air"
  }'
```

### Example: Launching Renata

```bash
curl -X POST http://127.0.0.1:18801/api/gateway/chat \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Build a V31 scanner for FBO pattern",
    "agent": "renata",
    "topic": "renata-build",
    "model": "glm-4.5",
    "platform": "cli",
    "workdir": "/home/mdwzrd/wzrd.dev/projects/edge.dev"
  }'
```

**See:** `/launch` command for full details on wzrd.dev agent spawning.

### Phase 5: Verification & Refinement

**Goal:** Test and refine the agent

**Verification checklist:**
- [ ] Agent responds correctly to domain-specific questions
- [ ] Agent uses custom skills appropriately
- [ ] Agent follows domain-specific gold standard
- [ ] Human-in-the-loop points work as expected
- [ ] Memory system is functioning

**Refinement:**
- Adjust skills based on performance
- Fine-tune prompts for better domain understanding
- Add new capabilities as needs emerge

---

## Example: Renata Onboarding

### User's Request
"I want to build Renata - a trading agent. She should be a master at systematic trading, backtesting, edge discovery, indicator building, and Python coding. She should be able to take resources (docs, videos, tweets) and turn them into quantifiable strategies."

### Agent Response

**"I'd love to help you build Renata! Let's clarify the vision together."**

---

**Phase 1: Vision Clarification**

1. **Name confirmed:** Renata ✓

2. **Domain:** Systematic trading & quantitative finance ✓

3. **Primary purpose:** Transform trading ideas into quantifiable, backtestable strategies while being a master of systematic trading methodology ✓

4. **Key capabilities:**
   - Systematic trading mastery
   - Backtesting strategies
   - Edge discovery
   - Indicator building
   - Python coding for scans/backtests
   - Resource extraction (docs, videos, tweets → strategies)

5. **Gold Standard:** Systematic Trading Gold Standard (for scan building, backtesting)

---

**Phase 2: Capability Design**

**Skills needed:**
- `systematic-trading` - Core trading methodology
- `backtesting` - Strategy validation
- `edge-discovery` - Finding profitable patterns
- `indicator-building` - Creating custom indicators
- `trading-coder` - Python for scans/backtests
- `resource-extraction` - Converting resources to strategies
- `gold-standard-trading` - Systematic Trading Gold Standard

**Modes needed:**
1. **Research Mode** - Reading and understanding resources
2. **Strategy Builder** - Turning ideas into code
3. **Backtester** - Testing and validating strategies
4. **Optimizer** - Improving strategy performance
5. **Edge Hunter** - Discovering new opportunities

**Human-in-the-loop:**
- User approval before significant changes to existing strategies
- User confirmation on high-stakes optimization decisions

---

**Phase 3: Creating Renata**

"I'll now create the Renata agent project using the WZRD project manager..."

*Creates:*
- `/wzrd.dev/projects/renata/AGENT.md`
- `/wzrd.dev/projects/renata/project.md`
- `/wzrd.dev/projects/renata/memory/MEMORY.md`
- `/wzrd.dev/projects/renata/skills/`
- `/wzrd.dev/projects/renata/discord/`
- `/wzrd.dev/projects/renata/telegram/`

---

**Phase 4: Setup Instructions**

"Renata is now created! Next steps:

1. **Set up Discord bot:**
   - Create at https://discord.com/developers/applications
   - Edit `/projects/renata/discord/config.json` with your bot token
   - Invite to your server

2. **Set up Telegram bot (optional):**
   - Create via @BotFather
   - Edit `/projects/renata/telegram/config.json`

3. **Start the bot:**
   ```bash
   cd /wzrd.dev/projects/renata/discord
   ./start.sh
   ```

4. **Test Renata:**
   - Send her a trading question
   - Give her a resource to analyze
   - Ask her to build a scan"

---

**Phase 5: Verification**

"Once Renata is running, let's verify:

1. Can she answer trading questions accurately?
2. Does she follow the Systematic Trading Gold Standard?
3. Can she extract strategies from resources?
4. Are the human-in-the-loop points working?

Let me know what needs adjustment and I'll refine her accordingly!"

---

## Agent Transformation Pattern

### From Stock Remi

**Stock Remi has:**
- 37 core skills (coding, planning, testing, architecture, etc.)
- Role-shifting capabilities
- Gold Standard enforcement
- General-purpose knowledge

### To Custom Agent

**Custom agent adds:**
- **Domain-specific skills** (e.g., systematic-trading, backtesting)
- **Specialized modes/personas** (e.g., Edge Hunter, Strategy Builder)
- **Domain gold standard** (e.g., Systematic Trading Gold Standard)
- **Custom memory** (domain-specific knowledge)
- **Human-in-the-loop points** (where approval is needed)

**Custom agent keeps:**
- All base Remi capabilities
- Role-shifting architecture
- Gold Standard quality enforcement
- Communication platform integration

---

## Conversation Template

Use this when a user wants to create a custom agent:

```
I'd love to help you build a custom agent!

Let's clarify your vision together. I'll ask a few questions, and we'll iterate on the design.

---

## Phase 1: Vision Clarification

**1. What's your agent's name?**
(Examples: Renata, Dilution Agent, Legal Bot, Research Assistant)

**2. What domain does it specialize in?**
(Examples: trading, legal, medical, research, finance, engineering)

**3. What's its primary purpose?**
(One sentence: what does it DO?)

**4. What problems does it solve?**
(What's the "why" behind building this agent?)

**5. Any existing resources?**
(Share documentation, code, links, or describe what you have)

---

Once I understand your vision, I'll help you:
✅ Design the agent's capabilities (skills, modes, personas)
✅ Define the domain-specific gold standard
✅ Create the agent project structure
✅ Set up communication platforms
✅ Verify and refine based on your feedback

Let's start! 🚀
```

---

## Gold Standard Integration

### Read-Back Verification
- After creating agent files, read them back to verify structure
- Confirm AGENT.md matches the discussed vision
- Validate project.md metadata

### Executable Proof
- Show the project structure created
- Display the agent files generated
- Demonstrate bot startup (if ready)

### Loop Prevention
- If agent creation fails, analyze the error
- Retry with corrected parameters (max 3 attempts)
- Escalate with full details if persistent issues

---

## Onboarding Checklist

Before considering onboarding complete:
- [ ] Agent vision clearly documented
- [ ] Domain and purpose defined
- [ ] Skills and modes planned
- [ ] Gold standard requirements identified
- [ ] Project structure created
- [ ] Communication platform set up
- [ ] Agent tested and verified
- [ ] Human-in-the-loop points confirmed

---

## Related Skills

- `planning` - Task breakdown and roadmap
- `orchestration` - Agent coordination
- `coding` - Writing custom agent code
- `documentation` - Creating agent documentation

---

**"The best agents are built through conversation, not configuration."**
