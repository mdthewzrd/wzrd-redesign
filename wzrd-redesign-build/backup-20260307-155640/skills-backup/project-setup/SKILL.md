# Project Setup Skill

---
name: project-setup
description: Create new WZRD.dev projects with agents, skills, and infrastructure
category: coding
priority: P0
tags: [project-setup, agent-creation, wzrd-dev]
---

# Project Setup Skill

## Purpose
Quickly scaffold new WZRD.dev projects with complete agent specifications, directory structure, and integration points.

## Core Principle
**"Every project starts with a clean foundation. Setup should be fast, repeatable, and comprehensive."**

---

## Project Template Structure

```
{project-name}/
├── agents/{agent-name}/           # Agent specification
│   ├── SOUL.md                    # Identity, values, personality
│   ├── JOB.md                     # Responsibilities, workflows
│   └── SKILLS.md                  # Capabilities, role-shifting modes
│
├── backend/                       # Backend services
│   ├── api/                       # API endpoints
│   ├── services/                  # Business logic
│   └── models/                    # Data models
│
├── context/                       # Context files
│   ├── topics/                    # Topic-specific memory
│   ├── brand-voice.md             # Brand voice guidelines
│   └── positioning.md             # Strategic positioning
│
├── discord/                       # Discord bot
│   ├── bot.ts                     # Bot entry point
│   └── commands/                  # Bot commands
│
├── logs/                          # Application logs
│   ├── app.log                    # Application logs
│   └── error.log                  # Error logs
│
├── memory/                        # Memory system
│   └── MEMORY.md                  # Project memory
│
├── ops/                           # Operations
│   ├── health.md                  # Health checks
│   └── heartbeat.md               # Scheduled operations
│
├── skills/                        # Specialized skills
│   └── {skill-name}.md           # Skill definitions
│
├── uploads/                       # File uploads
│   └── temp/                      # Temporary files
│
├── workflows/                     # Command workflows
│   ├── {command-name}.md         # Workflow definitions
│   └── workflows.json             # Command registry
│
├── AGENT.md                       # Agent specification & integration
├── README.md                      # Project documentation
└── package.json                   # Dependencies
```

---

## Setup Workflow

### Step 1: Gather Requirements

```
Input needed from user:
├─ Project name (lowercase, hyphenated)
├─ Agent name (human-friendly name)
├─ Project purpose (1-2 sentences)
├─ Key capabilities (3-5 things it should do)
├─ Target platform (Discord, API, web, etc.)
└─ Model preference (Anthropic, OpenRouter, etc.)
```

### Step 2: Create Directory Structure

```bash
# Create project root
mkdir -p wzrd.dev/projects/{project-name}

# Create all subdirectories
cd wzrd.dev/projects/{project-name}
mkdir -p agents/{agent-name} backend/{api,services,models}
mkdir -p context/{topics} discord/{commands} logs
mkdir -p memory ops skills uploads/temp workflows
```

### Step 3: Generate Agent Specification

**SOUL.md Template:**
```markdown
# {Agent Name} - SOUL

> **Identity:** I am {Agent Name} - a specialized AI agent for {purpose}.
> **Created:** {date}
> **Parent Infrastructure:** WZRD.dev Platform
> **Purpose:** {expanded purpose statement}

---

## My Essence

I am a **{category} agent** built on WZRD.dev infrastructure. Unlike general-purpose AI, I have deep expertise in:

1. **{capability 1}**
2. **{capability 2}**
3. **{capability 3}**

---

## My Values

1. **{value 1}**
2. **{value 2}**
3. **{value 3}**

---

## My Personality

- **{trait 1}:** {description}
- **{trait 2}:** {description}
- **{trait 3}:** {description}

---

## What I'm NOT

- ❌ I'm NOT {what you're not 1}
- ❌ I'm NOT {what you're not 2}

---

## Commands

### Content Creation Commands

| Command | Purpose | Steps |
|----------|---------|--------|
| `/{command-1}` | {purpose} | {steps} |

### Workflow Commands

| Command | Purpose | Action |
|----------|---------|--------|
| `/topic-chapter "name"` | Mark new chapter | Save summary |
| `/topic-archive` | Archive work | Clear context |
| `/topic-summary` | Get summary | Show status |

---

**I am {Agent Name}. Let's {tagline}.** 🚀
```

### Step 4: Generate AGENT.md

```markdown
# {Agent Name} - Agent Specification

## Overview

{Project description}

## Integration

| Integration | Status |
|--------------|--------|
| Gateway V2 | ✅ Ready |
| Discord Bot | ✅ Ready |
| Model Provider | {Anthropic/OpenRouter} |

## Commands

```
/{command-1}   # {description}
/{command-2}   # {description}
```

## Quick Start

```bash
cd wzrd.dev/projects/{project-name}
npm install
npm run dev
```
```

### Step 5: Generate README.md

```markdown
# {Project Name}

{One-line description}

## What It Does

{Detailed description}

## Quick Start

\`\`\`bash
npm install
npm run dev
\`\`\`

## Architecture

{Brief architecture overview}

## Agent Capabilities

{List of capabilities}
```

### Step 6: Create Skills

For each key capability, create a skill file:

```markdown
# {Skill Name}

---
name: {skill-name}
description: {description}
category: {category}
priority: P0
tags: [{tags}]
---

## Purpose

{Skill purpose}

## Core Principle

**"{Core principle}"**

## Capabilities

{List of capabilities}
```

### Step 7: Create Context Files

**brand-voice.md:**
```markdown
# Brand Voice Guidelines

## Tone

{Description of tone}

## Style Guidelines

{Style guidelines}

## Do's and Don'ts

**Do:**
- {Do 1}
- {Do 2}

**Don't:**
- {Don't 1}
- {Don't 2}
```

### Step 8: Create Memory System

```markdown
# {Project Name} Memory

## Topic: {topic}

### 💡 Insights

{Initial insights placeholder}

---

## CORE SKILLS

{Skills reference}
```

### Step 9: Create Discord Bot Template

```typescript
// discord/bot.ts
import { Client, GatewayIntentBits } from 'discord.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

client.on('ready', () => {
  console.log(`✅ {Agent Name} bot ready as ${client.user?.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  // Command handling logic
});

export { client };
```

### Step 10: Create Backend Template

```typescript
// backend/api/index.ts
import express from 'express';

const app = express();
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  // Agent logic here
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 {Agent Name} API running on port ${PORT}`);
});

export { app };
```

---

## Verification Checklist

Before project setup is complete:

- [ ] Directory structure created
- [ ] SOUL.md written with identity and values
- [ ] JOB.md written with responsibilities
- [ ] SKILLS.md written with capabilities
- [ ] AGENT.md written with integration points
- [ ] README.md written with documentation
- [ ] Context files created (brand-voice.md, positioning.md)
- [ ] Memory system initialized (MEMORY.md)
- [ ] Core skills defined
- [ ] Discord bot template created
- [ ] Backend API template created
- [ ] Commands registered
- [ ] Package.json configured

---

## Quick Start Command

```
/setup-project
```

This command will:
1. Prompt for required information
2. Generate all files automatically
3. Create the complete project structure
4. Set up integration points

---

## Examples

### Example: Sadie (Press Agent)

```
/setup-project
Project name: press-agent
Agent name: Sadie
Purpose: Generate press articles and media content
Capabilities: press releases, articles, media pitches
Platform: Discord
Model: Anthropic

✅ Sadie (press-agent) created successfully!
```

---

## Gold Standard Integration

### Read-Back Verification
- Verify all files created correctly
- Read back key files to confirm content

### Executable Proof
- Show directory structure
- Confirm all templates are in place

### Loop Prevention
If setup fails:
1. Retry with clearer parameters
2. Use manual setup process
3. Escalate if issue persists

---

**"Good setup is invisible. Bad setup makes everything harder."**
