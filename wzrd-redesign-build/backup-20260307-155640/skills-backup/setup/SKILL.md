# /setup Skill - Guided Proactivity Onboarding

**Purpose:** Interactive setup workflow for configuring agent proactivity (scheduled checks, reminders, event triggers).

**When to Use:**
- User says: `/setup` or "set up proactivity"
- User says: "Configure proactivity" or "Setup my agent"

---

## Conversation Flow

### Step 1: Introduction
```
User: /setup

Agent: Let me set up your proactivity configuration. I'll ask you a few questions to understand what you want the agent to be proactive about.

Available proactive capabilities:

• Scheduled Checks (Cron Jobs)
  - Run code/commands on schedule (e.g., "every 30 minutes")
  - Check API endpoints periodically
  - Monitor specific resources

• Daily/Weekly Reminders
  - Get daily task summaries at a specific time
  - Weekly project reviews
  - Custom alerts

• Event-Based Triggers
  - Watch for file changes
  - Monitor API responses
  - React to specific events

Let's start. What would you like to configure first?
```

### Step 2: Choose Proactivity Type
```
Agent: Great! What type of proactive behavior would you like to set up?

[Choose one:]
1. Scheduled Check - Run something on a timer
2. Reminder - Get reminded about something
3. Event Trigger - React when something happens

Or you can describe what you want: "Check scanner results every hour"
```

### Step 3: Configuration (Based on Choice)

**For Scheduled Check:**
```
Agent: Got it - a scheduled check. What should I check?

What to check:
• Scanner results
• API endpoints
• Specific files or directories
• Job queue status

How often:
• Every 5 minutes
• Every 15 minutes
• Every 30 minutes
• Every hour
• Custom cron expression

What to do:
• Just notify me
• Send to Discord
• Run a specific command
• Create a task
• Send email (if configured)

What to check for: (URL or description)
```

**For Reminder:**
```
Agent: Got it - a reminder. What would you like to be reminded about?

What to remind you about:
• Incomplete tasks
• Daily task review
• New scan results
• Specific project milestone
• Code review deadline

When:
• Specific time (e.g., "9 AM every day")
• Relative time (e.g., "in 4 hours")
• Custom pattern (e.g., "before market open")

How to notify:
• Discord message
• Send to specific channel
• Create task automatically
```

**For Event Trigger:**
```
Agent: Got it - an event trigger. What should I watch for?

Watch type:
• File changes in a directory
• API endpoint responses
• Database changes
• Job queue status
• GitHub repository updates

What to watch: (path or description)
```

```

### Step 4: Notification Preferences
```
Agent: Almost done! How would you like to be notified?

Where to notify:
• Discord direct message
• Discord channel mention
• Telegram message
• Email (if configured)

When to notify:
• Immediately when triggered
• Daily digest at specific time
• Summary only (no individual alerts)

```

### Step 5: Confirmation & Save
```
Agent: Perfect! Here's your complete proactivity configuration:

**Scheduled Checks:**
[Summary of configured checks]

**Reminders:**
[Summary of configured reminders]

**Event Triggers:**
[Summary of configured triggers]

**Notifications:**
• Platform: Discord
• Method: Direct message

I've saved this to your proactivity configuration. You can:
• Check current status: "What's my proactivity setup?"
• Add new behaviors: "Add a scheduled check for..."
• Remove behaviors: "Remove the reminder for..."
• Modify settings: "Change notification method to..."

All done! Your agent is now proactive. 🚀
```

---

## Natural Language Patterns

The agent should also understand natural language requests for proactivity:

**View Current Setup:**
- "What's my proactivity setup?"
- "Show my scheduled checks"
- "Show my reminders"
- "Clear all proactivity"
- "Disable proactivity"

**Add Scheduled Check:**
- "Check scanner every 30 minutes"
- "Monitor this API endpoint every hour"
- "Watch for changes in /path/to/dir"

**Add Reminder:**
- "Remind me about tasks every morning at 9 AM"
- "Remind me about this [thing] in 2 hours"
- "Daily task review at 5 PM"

**Add Event Trigger:**
- "Watch for file changes in /path/to/scanners"
- "Notify me when this API returns an error"

**Modify Settings:**
- "Change notification to channel mentions"
- "Disable scheduled checks for tonight"

**Clear All:**
- "Clear all my proactivity configuration"
- "Remove all scheduled checks"
- "Stop all reminders"

---

## Implementation Notes

**When User Says:** `/setup`

**Agent Should:**
1. Load current proactivity configuration
2. Walk through setup steps
3. Save configuration when complete
4. Return confirmation

**API Integration:**
- Uses Gateway V2 `proactivity.*` endpoints
- `proactivity.list` - List all behaviors
- `proactivity.set` - Add new behavior
- `proactivity.remove` - Remove behavior
- `proactivity.check` - Manually trigger a check
- `proactivity.remind` - Manually send a reminder

**Memory Integration:**
- Proactivity configuration stored in `~/.claude/proactivity.md`
- Agent memory includes proactivity documentation
- Natural language patterns enable conversational setup

---

## Edge Cases

**User Cancels:**
```
User: Actually, let's cancel this.
Agent: No problem! I've cancelled the setup. Your proactivity configuration hasn't changed.
```

**Multiple Topics:**
```
User: Set up proactivity for trading
Agent: What topic should I set this up for? (general, renata, dilution, press)
User: Renata
Agent: Setting up proactivity for Renata topic...
```

**Empty Configuration:**
```
User: What's my proactivity setup?
Agent: You don't have any proactivity configured yet. Would you like to set something up?
```
