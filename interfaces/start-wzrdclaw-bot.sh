#!/bin/bash
# Start WZRDClaw Discord Bot

echo "=== Starting WZRDClaw Discord Bot ==="
echo ""

echo "📊 Current Status:"
echo "------------------"
echo "1. WZRDClaw Backend:"
curl -s http://localhost:7476/health | jq -r '"   Status: " + .status + " | Tools: " + (.toolCount|tostring)' || echo "   ❌ Backend not reachable"

echo ""
echo "2. Discord Bot Token:"
echo "   App ID: 1483078080535986187"
echo "   Token: MTQ4MzA3ODA4MDUzNTk4NjE4Nw.GmiZM1.6s1YxbEOtuoxMMIJy5qy_XEhPhbHQyqWzxeAdE"

echo ""
echo "3. Channel Mappings:"
echo "   • #framework (1481800155220148296)"
echo "   • #topics (1481800251806580757)"
echo "   • #web-ui (1481800276330418279)"
echo "   • #docs (1481800409478725652)"
echo "   • #wzrd-redesign (1481800346253660290)"
echo "   • #general (1481800429523308624)"
echo "   • #testing (1481800445465723012)"

echo ""
echo "🚀 Starting Bot..."
echo "----------------"

# Stop any existing bot
pkill -f "discord-bot-simple.js" 2>/dev/null
sleep 1

# Start WZRDClaw bot
cd /home/mdwzrd/wzrd-redesign/interfaces
export DISCORD_BOT_TOKEN="MTQ4MzA3ODA4MDUzNTk4NjE4Nw.GmiZM1.6s1YxbEOtuoxMMIJy5qy_XEhPhbHQyqWzxeAdE"

node wzrdclaw-discord-bot-integrated.js 2>&1 &
BOT_PID=$!

sleep 3

echo ""
echo "📋 Verification:"
echo "----------------"
echo "1. Bot Process:"
ps aux | grep wzrdclaw-discord-bot-integrated | grep -v grep || echo "   ❌ Bot not running"

echo ""
echo "2. Test Backend Connection:"
curl -s http://localhost:7476/health | jq -r '"   ✅ Backend: " + .status' || echo "   ❌ Backend check failed"

echo ""
echo "3. Discord Bot Status:"
echo "   App ID: 1483078080535986187"
echo "   Should show as ONLINE in Discord"

echo ""
echo "🎯 Testing Instructions:"
echo "----------------------"
echo "1. Go to Discord"
echo "2. Check if bot shows as ONLINE"
echo "3. Send message in #testing channel:"
echo "   • \"help\" - Should show WZRDClaw tools"
echo "   • \"status\" - Should show backend status"
echo "   • \"bash ls\" - Should execute command"

echo ""
echo "📝 Logs:"
echo "-------"
echo "Check bot output in terminal"
echo "Or check: /home/mdwzrd/wzrd-redesign/logs/discord-debug.log"

echo ""
echo "✅ Bot startup complete!"