# Discord Bot Setup

Quick guide to running the WZRD Discord bot.

## Prerequisites

- Node.js 18+ installed
- Discord bot token
- Discord server with channels

## Configuration

Edit `interfaces/discord-config.yaml`:

```yaml
discord:
  bot_token: "YOUR_BOT_TOKEN_HERE"
  client_id: "YOUR_CLIENT_ID"
  guild_id: "YOUR_SERVER_ID"
  
  channels:
    general: "GENERAL_CHANNEL_ID"
    logs: "LOGS_CHANNEL_ID"
```

## Getting Credentials

1. Go to https://discord.com/developers/applications
2. Create New Application
3. Go to Bot → Add Bot
4. Copy Token (keep secret!)
5. Go to OAuth2 → General
6. Copy Client ID
7. Go to your Discord server → Right click → Copy Server ID (enable Developer Mode)

## Install Dependencies

```bash
cd /home/mdwzrd/wzrd-redesign/interfaces
npm install discord.js js-yaml
```

## Run Bot

### Test Mode (No Discord needed)

```bash
wzrd-discord test
```

Starts mock WebSocket on ws://localhost:8765

### Production Mode

```bash
export DISCORD_TOKEN="your-token-here"
wzrd-discord start
```

Or set token in config file.

## Commands

In Discord, use `!wzrd` prefix:

- `!wzrd help` - Show help
- `!wzrd topics` - List topics
- `!wzrd status` - Show bot status
- `!wzrd memory <query>` - Search topic memory

## Features

- Topic-aware conversations
- Channel ↔ Topic mapping
- Cost tracking
- Memory integration
- File upload support
- Rate limiting

## Troubleshooting

**Bot won't start:**
```bash
# Check token
grep bot_token interfaces/discord-config.yaml

# Test mode first
wzrd-discord test
```

**Not responding:**
- Check bot permissions in Discord
- Verify channel IDs in config
- Check logs: `tail logs/discord.log`

## Test WebSocket

```bash
# Install wscat
npm install -g wscat

# Connect to test server
wscat -c ws://localhost:8765

# Send test message
> {"type":"message","content":"Hello","topic":"general"}
```
