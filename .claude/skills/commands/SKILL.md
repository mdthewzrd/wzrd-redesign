---
name: commands
description: Command execution and loading
category: orchestration
priority: P0
tags: [commands, workflows, automation]
subskills:
  - command-loading
  - command-execution
---

# Commands Skill

## Purpose
Load and execute pre-made command workflows that combine multiple skills.

## Core Principle
**"Commands are reusable recipes. Use them, don't reinvent them."**

## What Are Commands?

Commands are pre-made recipes/workflows that combine multiple skills into reusable patterns.

Instead of asking the agent to figure out how to do something from scratch, you invoke a command and it follows a proven pattern.

**Example:**
```
Instead of: "Fix this bug"
Use: "/fix-bug"
```

## Command Location

Commands are located at: `~/.claude/commands/`

Each command is a markdown file with:
- YAML frontmatter (metadata)
- Purpose and workflow
- Step-by-step instructions
- Gold Standard integration
- Role-shifting pattern

## Available Commands

### General Purpose Commands

| Command | Purpose | Steps | Time |
|----------|---------|-------|------|
| `/fix-bug` | Fix bugs systematically | 6 | 15-45 min |
| `/add-feature` | Add new features | 7 | 1-4 hours |
| `/refactor` | Clean up existing code | 5 | 30 min - 2 hrs |
| `/test-and-deploy` | Test and deploy | 4 | 10-30 min |
| `/add-api-endpoint` | Add API endpoint | 6 | 30-90 min |
| `/quick-help` | Get quick answers | 2 | 5-10 min |

### Topic Management Commands

| Command | Purpose | Action |
|----------|---------|--------|
| `/topic-chapter "name"` | Mark new chapter in topic | Save summary, fresh start |
| `/topic-archive` | Archive current work | Save to archive, clear context |
| `/topic-summary` | Get topic summary | Show completed, in-progress, next steps |
| `/topic-reset` | Reset topic completely | Clear all context, start fresh |

## Command Execution

### How Commands Work

When a user invokes a command (e.g., `/fix-bug`):

1. **Load command file** from `~/.claude/commands/fix-bug.md`
2. **Read workflow steps** defined in the command
3. **Execute step by step**, shifting modes as needed
4. **Report progress** at each step
5. **Announce completion** with summary

### Step-by-Step Pattern

For each step in the command:
1. Announce step number and purpose
2. Shift to appropriate mode
3. Execute step
4. Report result
5. Move to next step

### Mode Announcements

Always announce mode shifts clearly:

```
[fix-bug command - Step 1/6]
Shifting to debugging mode...
→ [Action taken]
→ [Result]

[fix-bug command - Step 2/6]
Shifting to research mode...
→ [Action taken]
→ [Result]
```

## When to Use Commands

### Use Commands When:

- The task matches a defined command
- You want a systematic, proven approach
- The work is repetitive or common
- You want to ensure best practices

### Don't Use Commands When:

- The task is unique/one-time
- You need flexibility/adaptation
- The task is unclear or exploratory
- No command exists for the task

## Command Loading

### Loading a Command

When a command is invoked:

1. Read the command file from `~/.claude/commands/{command-name}.md`
2. Parse YAML frontmatter for metadata
3. Read the workflow section
4. Verify command structure is valid

### Command Structure

Each command must have:

```markdown
---
name: command-name
description: Brief description
category: category-name
estimatedTime: "X minutes - Y hours"
triggers: [list of trigger words]
steps: N
---

# Command Name

## Purpose
[Why this command exists]

## Core Principle
**"Memorable quote"**

## Workflow

### Step 1: [Name] ([Mode])
- [Actions]

[Continue for all steps...]

## Gold Standard Integration
[Validation rules]

## Example Usage
[Example]
```

## Gold Standard Integration

### Read-Back Verification
- Verify command file exists before execution
- Read back files created/modified
- Confirm all steps completed

### Executable Proof
- Show command workflow
- Report step completion
- Show final result
- Demonstrate working outcome

### Loop Prevention
If command execution fails:
1. Retry step with different approach
2. Skip step if non-critical
3. Escalate after 3 failures with full context

## Creating New Commands

### Steps to Create a Command

1. Define the purpose and workflow
2. Use the TEMPLATE.md as starting point
3. Write clear steps with mode annotations
4. Include examples
5. Add Gold Standard integration
6. Test the command

### Command Template

See: `~/.claude/commands/TEMPLATE.md`

## Agent-Specific Commands

Different agents may have specialized commands:

### Remi
- All general purpose commands
- All topic management commands

### Dilution Agent
- `/analyze-filing` - Analyze SEC filing for dilution
- `/calculate-dilution` - Calculate dilution impact
- `/find-red-flags` - Identify red flags in filings
- Topic management commands

### Renata
- `/build-strategy` - Build trading strategy from resources
- `/backtest` - Run backtest on strategy
- `/find-edges` - Search for profitable patterns
- `/optimize` - Optimize strategy parameters
- Topic management commands

## Documentation

- Commands README: `~/.claude/commands/README.md`
- Commands Guide: `/wzrd.dev/docs/COMMANDS.md`
- Topic Management: `/wzrd.dev/docs/TOPIC-MANAGEMENT.md`

## Examples

### Example 1: Fix Bug

```
User: /fix-bug
       The login is timing out

Agent: Running fix-bug command...

[Step 1/6] Reproducing bug
Shifting to debugging mode...
→ [Actions]

[Step 2/6] Isolating cause
Shifting to research mode...
→ [Actions]

[Continue through all steps...]

✅ Bug fixed!
```

### Example 2: Add Feature

```
User: /add-feature
       Add user profile page

Agent: Running add-feature command...

[Step 1/7] Clarifying Requirements
Shifting to planning mode...
→ [Actions]

[Step 2/7] Breaking Down Work
Shifting to planning mode...
→ [Actions]

[Continue through all steps...]

✅ Feature added!
```

### Example 3: Topic Chapter

```
User: /topic-chapter "Auth Complete"

Agent: Running topic-chapter command...

[Step 1/3] Summarizing Current State
Shifting to documentation mode...
→ [Actions]

[Step 2/3] Saving to Topic Memory
Shifting to documentation mode...
→ [Actions]

[Step 3/3] Starting Fresh
Shifting to orchestration mode...

✅ Chapter saved: "Auth Complete"
```

---

**"Commands = Reusable wisdom. Build once, use often."**
