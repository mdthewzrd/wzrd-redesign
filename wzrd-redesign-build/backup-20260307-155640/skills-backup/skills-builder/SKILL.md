---
name: skills-builder
description: Meta-skill for creating new skills following Gold Standard
category: meta
priority: P0
tags: [meta, skills, templates, gold-standard]
subskills:
  - skill-creation
  - skill-template
  - skill-validation
---

# Skills Builder (Meta-Skill)

## Purpose
Create new skills following established patterns and Gold Standard principles.

## Core Principle
**"Skills are the building blocks. Build them well, build them consistently."**

## Skill Template

Every SKILL.md file follows this structure:

```markdown
---
name: skill-name
description: Brief description of what this skill does
category: category-name
priority: P0 | P1 | P2
tags: [tag1, tag2, tag3]
subskills:
  - subskill-1
  - subskill-2
---

# Skill Name

## Purpose
One sentence explaining why this skill exists.

## Core Principle
**"A memorable quote that captures the essence."**

## [Sections...]
```

## Skill Categories

| Category | Purpose | Priority |
|----------|---------|----------|
| validation | Quality, verification | P0 |
| planning | Task breakdown, roadmaps | P0 |
| coding | Implementation | P0 |
| testing | QA, validation | P0 |
| orchestration | Coordination, role-shifting | P0 |
| context | Token management | P0 |
| documentation | Docs, guides | P1 |
| research | Investigation | P1 |
| architecture | System design | P0 |
| debugging | Troubleshooting | P0 |
| deployment | CI/CD, infrastructure | P1 |
| security | Security practices | P1 |
| meta | Skills about skills | P0 |

## Creating a New Skill

### Step 1: Define the Skill

Answer these questions:
1. What problem does this skill solve?
2. When would it be used?
3. What does an agent need to know?
4. What are the key patterns/practices?

### Step 2: Create the Directory

```bash
mkdir -p ~/.claude/skills/skill-name
```

### Step 3: Write SKILL.md

Follow the template with:
- YAML frontmatter (metadata)
- Purpose (why it exists)
- Core principle (memorable quote)
- Key sections (when to use, how to use, examples)
- Gold Standard integration
- Role-shifting pattern

### Step 4: Read-Back Verify

```bash
# Gold Standard: Read back to verify
cat ~/.claude/skills/skill-name/SKILL.md
```

### Step 5: Test the Skill

Load it in a session and verify:
- Content loads correctly
- Examples are clear
- Instructions are actionable

## Skill Quality Checklist

Before considering a skill complete:

- [ ] Clear purpose (why it exists)
- [ ] Memorable core principle
- [ ] When to use (triggers)
- [ ] How to use (instructions)
- [ ] Examples (at least 2)
- [ ] Gold Standard integration
- [ ] Role-shifting pattern (if applicable)
- [ ] Progressive disclosure (metadata first)

## Common Skill Patterns

### Skill with Modes
```markdown
## Modes

### Mode 1: X
When to use: ...
What to do: ...

### Mode 2: Y
When to use: ...
What to do: ...
```

### Skill with Steps
```markdown
## Process

1. Step one
2. Step two
3. Step three
```

### Skill with Examples
```markdown
## Examples

### Example 1: [Title]
**Input:** What was requested
**Process:** What happened
**Output:** Result
```

## Gold Standard Integration

### Read-Back Verification
After writing SKILL.md:
1. Use Read tool to verify contents
2. Confirm YAML frontmatter is valid
3. Check all examples are clear
4. Only then claim skill created

### Executable Proof
- Show skill file exists at path
- Display skill structure
- Demonstrate skill can be loaded

### Loop Prevention
If skill creation fails:
1. Check template against existing skills
2. Verify YAML frontmatter format
3. Escalate if stuck after 3 attempts

## Example: Creating This Meta-Skill

```
1. Identified need: No skill for creating skills
2. Defined scope: Template + creation process
3. Created template section
4. Added quality checklist
5. Integrated Gold Standard
6. Verified with examples
```

## Existing Skills Reference

When creating new skills, reference these for patterns:

- **gold-standard** - Validation patterns
- **orchestration** - Role-shifting patterns
- **planning** - Task breakdown patterns
- **coding** - Language coverage patterns
- **testing** - Example patterns

---

**"Good skills are built on good patterns. Use the template, follow the checklist."**
