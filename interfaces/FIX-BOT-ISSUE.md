# FIX: Discord Bot Showing Offline

## **Root Cause**
Token `YOUR_DISCORD_BOT_TOKEN_HERE

## **Symptoms**
- ✅ Bot can login (`Remi#6734`)
- ❌ Shows as "offline" in Discord
- ❌ May not receive messages
- ❌ Presence API calls fail

## **Required Fix**

### **1. GET NEW BOT TOKEN**
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Find application `1483078080535986187` (your bot)
3. Go to "Bot" section
4. Click "Reset Token"
5. Copy **NEW token**

### **2. RE-INVITE BOT WITH CORRECT SCOPES**
Create new invite URL with:
```
https://discord.com/oauth2/authorize?client_id=1483078080535986187&permissions=8&scope=bot%20applications.commands
```

Required scopes:
- `bot` - Basic bot functionality
- `applications.commands` - Slash commands
- `messages.read` - Read messages
- `messages.write` - Send messages
- `guilds` - Server access

### **3. VERIFY BOT PERMISSIONS IN SERVER**
1. Server Settings → Integrations → Bots
2. Find "Remi" bot
3. Ensure all permissions enabled:
   - Send Messages
   - Read Message History  
   - Add Reactions
   - Use Slash Commands

### **4. UPDATE CODE WITH NEW TOKEN**
Replace in all bot files:
```javascript
const token = "YOUR_DISCORD_BOT_TOKEN_HERE";
```

## **Files to Update**
1. `/home/mdwzrd/wzrd-redesign/interfaces/wzrdclaw-discord-bot-*.js`
2. Any script using `DISCORD_BOT_TOKEN` environment variable

## **Quick Test After Fix**
```bash
# Stop all bots
pkill -f node

# Start with new token
cd /home/mdwzrd/wzrd-redesign/interfaces
export DISCORD_BOT_TOKEN="NEW_TOKEN_HERE"
node simple-keepalive-bot.js
```

## **Expected Result**
- ✅ Bot shows as **ONLINE** in Discord
- ✅ Responds to messages in `#testing`
- ✅ Shows "WZRDClaw Assistant" activity
- ✅ Reacts with 👀 emoji

## **If Still Offline**
1. Discord may need 5-10 minutes to update presence
2. Try kicking and re-inviting bot
3. Check Discord status page for API issues
4. Verify bot isn't rate-limited

---

**The code is working** - bot logs in successfully. **The token/authorization is the problem.** Get new token from Discord Developer Portal.