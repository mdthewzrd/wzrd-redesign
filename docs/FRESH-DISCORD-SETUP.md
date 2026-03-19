# Fresh Discord Bot Setup

**Complete step-by-step guide**

---

## Step 1: Create Discord Application

1. Go to https://discord.com/developers/applications
2. Click **"New Application"** (blue button)
3. Name it: **"WZRD Dev"**
4. Click **Create**

---

## Step 2: Get Client ID

1. In your new app, click **OAuth2** on left sidebar
2. Look for **Client ID** at top 
3. Copy this number (save it somewhere) 1481348544920289396
4. **This is your CLIENT_ID**

---

## Step 3: Create Bot User

1. Click **Bot** on left sidebar
2. Click **"Add Bot"** (blue button)
3. Click **Yes, do it!**
4. Under **Token**, click **Reset Token**
5. Copy the new token (starts with MT...)
6. **This is your BOT_TOKEN** (keep secret!) YOUR_DISCORD_BOT_TOKEN_HERE.GzCr-J.b2zfJHq1Ij1a6Zr7LTnuQETTny21eIaRlmr_fM 

---

## Step 4: Get Server ID

1. Open Discord in browser
2. Go to your server
3. Right-click server name
4. Click **"Copy Server ID"** (need Developer Mode on)
5. **This is your GUILD_ID** 1473755847548207195

**Enable Developer Mode:**
- User Settings → Advanced → Developer Mode ON

---

## Step 5: Update Config

Edit file:
```bash
nano /home/mdwzrd/wzrd-redesign/interfaces/discord-config.yaml
```

Update these lines:
```yaml
discord:
  bot_token: "YOUR_BOT_TOKEN_HERE"     # From Step 3
  client_id: "YOUR_CLIENT_ID_HERE"      # From Step 2
  guild_id: "YOUR_GUILD_ID_HERE"        # From Step 4
```

---

## Step 6: Invite Bot to Server

1. In Discord Developer Portal, click **OAuth2** → **URL Generator**
2. Under **Scopes**, check **bot**
3. Under **Bot Permissions**, check:
   - Send Messages
   - Read Message History
   - View Channels
4. Copy the **Generated URL**
5. Open URL in browser
6. Select your server
7. Click **Authorize**
8. Complete CAPTCHA

---

## Step 7: Get Channel IDs

1. In Discord, right-click your channel
2. Click **"Copy Channel ID"**
3. Update config:

```yaml
channels:
  general: "YOUR_GENERAL_CHANNEL_ID"
  logs: "YOUR_LOGS_CHANNEL_ID"
```

---

## Step 8: Test Bot

```bash
# Start bot
cd /home/mdwzrd/wzrd-redesign
wzrd-discord start
```

**Expected output:**
```
[WZRD-DISCORD] Starting Discord bot...
Bot logged in as: WZRD Dev#1234
Connected to: Your Server
Topic-aware mode: Enabled
```

---

## Step 9: Test in Discord

In your Discord channel:
```
!wzrd help
```

Bot should reply with commands list.

---

## Troubleshooting

**Bot won't start:**
```bash
# Check token format
grep bot_token interfaces/discord-config.yaml
# Should be: bot_token: "MT..."

# Check dependencies
ls interfaces/node_modules/discord.js
```

**Not responding:**
- Bot has correct permissions?
- Channel IDs correct?
- Check logs: `tail logs/discord.log`

**Can't find IDs:**
- Developer Mode enabled?
- Right-clicking correct elements?

---

## Quick Reference

| What | Where |
|------|-------|
| Client ID | OAuth2 → General |
| Bot Token | Bot → Reset Token |
| Server ID | Right-click server name |
| Channel ID | Right-click channel |
| Invite URL | OAuth2 → URL Generator |

---

## Security

**Never commit your token to git!**

Config file is in `.gitignore` but double-check:
```bash
grep -E "(bot_token|client_secret)" interfaces/discord-config.yaml
```

**If token leaks:**
1. Go to Discord Developer Portal
2. Bot → Reset Token
3. Update config with new token
4. Restart bot

---

## Done!

Bot should be:
- ✅ Online in Discord
- ✅ Responding to commands
- ✅ Connected to topics

Next: Test with `!wzrd status`
