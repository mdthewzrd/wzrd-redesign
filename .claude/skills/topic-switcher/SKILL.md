---
name: topic-switcher
title: Topic Switcher
priority: P0
description: Switch conversation topics/projects mid-session
aliases: [/topic, topic, switch-topic]
---

# Topic Switcher Skill

> Switch conversation topics and projects mid-session without restarting

---

## How It Works

**Primary Flow:**
1. User types `/topic`
2. Display all available topics with descriptions
3. User selects by name/number
4. Load topic context and continue

**Secondary Flow (Direct):**
- User can still type `/topic web-ui` for direct switch
- Agent can switch autonomously when context suggests it

---

## Usage

```bash
/topic                # Show topic selector (primary)
/topic web-ui         # Direct switch (optional)
```

---

## Behavior

### Show Topic Selector
```
User: /topic

Me:
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📁 SELECT A TOPIC (wzrd.dev)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  [1] general       💬 General purpose, questions, help
  [2] web-ui        🎨 Web UI dashboard
  [3] build         🔧 Backend, Gateway, platform
  [4] issues        🐛 Bug reports, debugging
  [5] ideas         💡 Brainstorming, planning
  [6] resources     📚 Documentation, references
  [7] inbox         📥 Continue from Telegram

  Select a topic by name or number:
```

### After Selection
```
User: web-ui
    (or: 2)

Me:
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ SWITCHED TO: web-ui (wzrd.dev)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Building the WZRD.dev web dashboard:
  • Real-time WebSocket connection
  • Streaming responses
  • Markdown + code highlighting
  • Message persistence

  Tech: Lit, TypeScript, Vite
  Code: /wzrd.dev/web-ui/

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Ready. What would you like to work on?
```

### Direct Switch (Optional)
```
User: /topic web-ui

Me: ✅ Switched to web-ui topic. Ready to work on the dashboard.
```

---

## Creating New Topics

### Quick Method
```
User: /topic new my-new-topic
    (or: Let's create a new topic for X)

Me:
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📁 CREATE NEW TOPIC
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Creating topic: my-new-topic (wzrd.dev)

  What's this topic for?
  [Brief description]

Me: [Creates file, confirms, switches to new topic]
```

### Manual Method
```bash
# Create the topic file
echo "# Topic: My New Topic

> **Purpose:** [Description]
> **Telegram:** #my-new-topic

---
" > /home/mdwzrd/wzrd.dev/context/projects/wzrd.dev/my-new-topic.md

# Then use it
/topic my-new-topic
```

---

## Managing Topics

### List All Topics
```
User: /topic list
    (or: /topic)
```

### Delete a Topic
```
User: /topic delete my-topic

Me: ⚠️ Delete topic 'my-topic'? Confirm: yes/no
```

### Rename a Topic
```
User: /topic rename old-name new-name

Me: ✅ Renamed 'old-name' to 'new-name'
```

### Agent-Initiated Switch
```
Me: "Let's continue working on the Web UI."
    [Automatically loads web-ui topic]
    [Displays brief confirmation]
```

---

## Default Project

Default project is `wzrd.dev`. Can be omitted in commands:
- `/topic web-ui` → Same as `/topic wzrd.dev web-ui`

---

## Topic Files Location

```
/wzrd.dev/context/projects/
├── wzrd.dev/
│   ├── general.md
│   ├── web-ui.md
│   ├── build.md
│   ├── issues.md
│   ├── ideas.md
│   ├── resources.md
│   └── inbox.md
└── [other projects]/
```

---

## Error Handling

### Topic Not Found
```
Me: "❌ Topic 'xyz' not found in project 'wzrd.dev'
     Available topics: general, web-ui, build, issues, ideas, resources, inbox"
```

### Project Not Found
```
Me: "❌ Project 'xyz' not found
     Available projects: wzrd.dev"
```

---

## Integration

This skill integrates with:
- **Remi agent** - Always available
- **Telegram** - #topics align with Telegram topics
- **Web UI** - Topic selector in UI

---

## Triggers

The skill activates on:
1. `/topic` command (explicit)
2. "switch to X topic" (natural language)
3. "let's continue X work" (contextual)
4. Agent decides to switch (autonomous)
