# Topic Architecture

**Topics = Projects | Sessions = Interfaces**

---

## Core Concept

**One Topic = Multiple Sessions**

```
Topic: wzrd-redesign
├── Discord: #general (1473755847548207198)
├── TUI: opencode-plugin-test
├── Web: Tab-1
└── Memory: topics/wzrd-redesign/
```

**Why:**
- Unified context across all interfaces
- Seamless switching between Discord/TUI/Web
- Shared memory, files, decisions
- One project = One topic

---

## Structure

### Topic Directory
```
topics/
├── wzrd-redesign/
│   ├── meta.json          # Topic metadata
│   ├── MEMORY.md          # Shared memory
│   ├── sessions/
│   │   ├── discord.json   # Discord channel mapping
│   │   ├── tui.json       # TUI session mapping
│   │   └── web.json       # Web UI tabs
│   └── data/              # Shared files
```

### Session Mapping

**Discord Channel** ```json { "type": "discord", "channel_id": "1473755847548207198", "server_id": "1473755847548207195", "topic_uuid": "wzrd-redesign" } ``` **TUI Session** ```json { "type": "tui", "worktree": "/home/mdwzrd/wzrd-redesign", "session_id": "opencode-plugin-test", "topic_uuid": "wzrd-redesign" } ``` **Web UI Tab** ```json { "type": "web", "tab_id": "tab-1", "url": "/projects/wzrd-redesign", "topic_uuid": "wzrd-redesign" } ``` --- ## How It Works 1. **User starts TUI session** → Auto-detects topic from directory 2. **User switches to Discord** → Topic context loads automatically 3. **User opens Web UI** → Same topic, same memory 4. **All sessions share:** - Memory - Files - Context - Decisions --- ## Implementation Status | Feature | Status | |---------|--------| | Topic auto-detection | ✅ Working | | Session mapping | ⚠️ Needs implementation | | Cross-interface sync | ⚠️ Needs implementation | | Memory sharing | ⚠️ Partial | --- ## Next Steps 1. Create session registry 2. Link Discord channel to topic 3. Implement context sync 4. Test cross-interface --- ## Current Mapping **Discord:** - Channel: 1473755847548207198 - Server: 1473755847548207195 - Bot: remi#7128 - Status: Online ✅ **TUI:** - Worktree: /home/mdwzrd/wzrd-redesign - Session: opencode-plugin-test - Status: Active ✅ **Link Needed:** Connect Discord channel ↔ TUI session