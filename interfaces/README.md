# WZRD.dev Interfaces

**Multi-Channel API Layer**

---

## Overview

The interfaces layer provides multiple entry points to WZRD.dev:

1. **Discord** - Natural chat interface (primary)
2. **CLI** - Terminal power users
3. **Web** - Browser-based development
4. **API** - Programmatic access

---

## Directory Structure

```
interfaces/
├── discord-bot.ts          # Discord integration
├── discord-bot.js          # Compiled Discord bot
├── discord-config.yaml     # Discord configuration
├── cli-wrapper.ts          # CLI interface
├── cli-wrapper.js          # Compiled CLI
├── web-ui-extension.ts     # Web interface
├── web-ui-extension.js     # Compiled web
├── remi-monitor.ts         # Remi monitoring
├── remi-monitor.js         # Compiled monitor
├── sync-manager.ts        # State synchronization
├── sync-manager.js        # Compiled sync
├── key-manager.ts         # API key management
├── key-manager.js         # Compiled keys
└── optimized-pipeline.ts   # Performance pipeline
└── optimized-pipeline.js  # Compiled pipeline
```

---

## Discord Bot

### Features
- Natural conversation interface
- Mention @Remi to activate
- Thread-based project isolation
- Multi-server support
- Role-based permissions

### Configuration

Edit `discord-config.yaml`:

```yaml
discord:
  token: ${DISCORD_TOKEN}
  prefix: "@Remi"
  default_server: "your-server-id"
  permissions:
    admin_roles: ["admin", "moderator"]
    user_roles: ["developer", "engineer"]
  channels:
    general: "general-chat-id"
    projects: "projects-chat-id"
    debug: "debug-chat-id"
```

### Usage

```
@Remi create a React component
@Remi help me debug this error
@Remi research best practices
```

---

## CLI Interface

### Features
- Terminal-based development
- Scriptable commands
- Integration with shell
- Batch operations

### Commands

```bash
# Start development
wzrd dev

# Work on specific project
wzrd dev ./my-project

# Check framework status
wzrd status

# Run validation
wzrd validate ./project

# Create sandbox
wzrd sandbox create ./project

# List active sandboxes
wzrd sandbox list

# Cleanup resources
wzrd cleanup

# Framework version
wzrd --version

# Get help
wzrd --help
```

---

## Web Interface

### Features
- Browser-based development
- Real-time collaboration
- Visual project management
- Drag-and-drop operations

### Setup

```bash
# Start web server
npm run web

# Or through framework
wzrd web
```

Access at: `http://localhost:3000`

---

## Synchronization

The `sync-manager.ts` keeps state synchronized across all interfaces:

- Session management
- State sharing
- Conflict resolution
- Real-time updates

---

## API Keys

The `key-manager.ts` handles authentication:

- API key generation
- Permission management
- Rate limiting
- Audit logging

---

## Monitoring

The `remi-monitor.ts` tracks:

- Agent health
- Performance metrics
- Error tracking
- Usage statistics

---

## Development

### Adding a New Interface

1. Create `interfaces/my-interface.ts`
2. Implement the interface contract
3. Register in `sync-manager.ts`
4. Add to configuration
5. Test integration

### Interface Contract

```typescript
interface WZRDInterface {
  name: string;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  send(message: Message): Promise<void>;
  receive(handler: Handler): void;
}
```

---

## Configuration

All interfaces share configuration from:
- `conductor/context-rules.yaml`
- Environment variables
- Interface-specific configs

---

## Troubleshooting

### Discord Bot Not Responding
1. Check token in `discord-config.yaml`
2. Verify bot has permissions
3. Check server/channel IDs
4. Review logs: `logs/discord-*.log`

### CLI Not Found
```bash
# Check PATH
echo $PATH | grep wzrd-redesign

# Or run directly
./bin/wzrd --version
```

### Web Interface Not Loading
1. Check port 3000 is free
2. Verify npm dependencies
3. Check browser console
4. Review logs: `logs/web-*.log`

---

## For More Information

- **Architecture**: `ARCHITECTURE.md`
- **Discord Setup**: See Discord Developer Portal
- **CLI Reference**: `bin/wzrd --help`
- **Main Docs**: `README.md`
