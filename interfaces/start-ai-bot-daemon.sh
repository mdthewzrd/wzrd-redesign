#!/bin/bash
# Daemon script to keep AI bot always running

echo "🤖 Starting WZRDClaw AI Bot Daemon..."
echo "====================================="

# Kill any existing instances
pkill -f wzrdclaw-discord-bot 2>/dev/null
sleep 2

# Function to check if bot is running
check_bot() {
  ps aux | grep wzrdclaw-discord-bot-ai | grep -v grep > /dev/null
  return $?
}

# Function to start bot
start_bot() {
  echo "[$(date '+%H:%M:%S')] 🚀 Starting AI bot..."
  
  cd /home/mdwzrd/wzrd-redesign/interfaces
  export DISCORD_BOT_TOKEN="MTQ4MzA3ODA4MDUzNTk4NjE4Nw.GmiZM1.6s1YxbEOtuoxMMIJy5qy_XEhPhbHQyqWzxeAdE"
  
  # Start bot with logging
  nohup node wzrdclaw-discord-bot-ai.js > /tmp/wzrdclaw-bot.log 2>&1 &
  BOT_PID=$!
  
  sleep 3
  
  if check_bot; then
    echo "[$(date '+%H:%M:%S')] ✅ Bot started (PID: $BOT_PID)"
    echo "   Logs: /tmp/wzrdclaw-bot.log"
    echo "   Status: Bot should show as ONLINE in Discord"
    return 0
  else
    echo "[$(date '+%H:%M:%S')] ❌ Bot failed to start"
    return 1
  fi
}

# Function to monitor bot
monitor_bot() {
  echo ""
  echo "🔍 Monitoring bot status..."
  echo "=========================="
  
  while true; do
    if ! check_bot; then
      echo "[$(date '+%H:%M:%S')] ⚠️ Bot not running, restarting..."
      start_bot
    fi
    
    # Show status every 30 seconds
    echo -n "[$(date '+%H:%M:%S')] "
    if check_bot; then
      echo "✅ Bot running"
    else
      echo "❌ Bot stopped"
    fi
    
    sleep 30
  done
}

# Initial start
echo ""
echo "📊 Initial Status Check:"
echo "-----------------------"

# Check WZRDClaw backend
echo -n "• WZRDClaw Backend: "
if curl -s http://localhost:7476/health > /dev/null; then
  echo "✅ Running"
else
  echo "❌ Down"
fi

# Start bot
start_bot

if [ $? -eq 0 ]; then
  echo ""
  echo "🎉 Bot Daemon Active!"
  echo "===================="
  echo "• Bot: Remi#6734 (AI mode)"
  echo "• Auto-restart: Enabled"
  echo "• Monitoring: Every 30 seconds"
  echo "• Logs: /tmp/wzrdclaw-bot.log"
  echo ""
  echo "📱 Check Discord:"
  echo "• Bot should show as ONLINE"
  echo "• Test in #testing channel"
  echo "• Should react with 👀 and type"
  echo "• Should give AI responses"
  echo ""
  echo "🔄 Starting monitor..."
  monitor_bot
else
  echo ""
  echo "❌ Failed to start bot daemon"
  echo "Check token and dependencies"
  exit 1
fi