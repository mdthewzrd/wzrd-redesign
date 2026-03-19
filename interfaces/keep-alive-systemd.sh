#!/bin/bash
# System-level keep-alive for Discord bot

echo "🔧 Creating system-level bot keep-alive..."
echo "=========================================="

# Create systemd service file
SERVICE_FILE="/etc/systemd/system/wzrdclaw-discord-bot.service"

if [ ! -f "$SERVICE_FILE" ]; then
  echo "Creating systemd service..."
  sudo bash -c "cat > $SERVICE_FILE" << EOF
[Unit]
Description=WZRDClaw Discord Bot
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/home/$USER/wzrd-redesign/interfaces
Environment="DISCORD_BOT_TOKEN=MTQ4MzA3ODA4MDUzNTk4NjE4Nw.GmiZM1.6s1YxbEOtuoxMMIJy5qy_XEhPhbHQyqWzxeAdE"
ExecStart=/usr/bin/node /home/$USER/wzrd-redesign/interfaces/wzrdclaw-discord-bot-ai.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=wzrdclaw-bot

[Install]
WantedBy=multi-user.target
EOF

  echo "✅ Service file created"
else
  echo "⚠️ Service file already exists"
fi

# Create simpler keep-alive script
KEEP_ALIVE="/home/$USER/wzrd-redesign/interfaces/keep-alive.sh"

cat > "$KEEP_ALIVE" << 'KEEPALIVE'
#!/bin/bash
# Simple keep-alive script

TOKEN="MTQ4MzA3ODA4MDUzNTk4NjE4Nw.GmiZM1.6s1YxbEOtuoxMMIJy5qy_XEhPhbHQyqWzxeAdE"
LOG_FILE="/tmp/wzrdclaw-bot-keepalive.log"

echo "=== Starting Keep-Alive Monitor ===" >> "$LOG_FILE"
echo "Time: $(date)" >> "$LOG_FILE"

while true; do
  # Check if bot process exists
  if ! ps aux | grep wzrdclaw-discord-bot-ai | grep -v grep > /dev/null; then
    echo "[$(date '+%H:%M:%S')] Bot not running, starting..." >> "$LOG_FILE"
    
    cd /home/$USER/wzrd-redesign/interfaces
    export DISCORD_BOT_TOKEN="$TOKEN"
    
    # Start bot
    nohup node wzrdclaw-discord-bot-ai.js >> /tmp/wzrdclaw-bot-output.log 2>&1 &
    BOT_PID=$!
    
    echo "[$(date '+%H:%M:%S')] Started bot with PID: $BOT_PID" >> "$LOG_FILE"
    sleep 10
    
    # Verify it started
    if ps aux | grep wzrdclaw-discord-bot-ai | grep -v grep > /dev/null; then
      echo "[$(date '+%H:%M:%S')] ✅ Bot verified running" >> "$LOG_FILE"
    else
      echo "[$(date '+%H:%M:%S')] ❌ Bot failed to start" >> "$LOG_FILE"
    fi
  else
    echo "[$(date '+%H:%M:%S')] ✅ Bot running" >> "$LOG_FILE"
  fi
  
  # Wait 60 seconds
  sleep 60
done
KEEPALIVE

chmod +x "$KEEP_ALIVE"
echo "✅ Keep-alive script created: $KEEP_ALIVE"

# Start using systemd if available, otherwise use screen
echo ""
echo "🚀 Starting bot with multiple fallbacks..."
echo "=========================================="

# Method 1: Try systemd
if command -v systemctl >/dev/null && [ -f "$SERVICE_FILE" ]; then
  echo "1. 🔧 Starting with systemd..."
  sudo systemctl daemon-reload
  sudo systemctl enable wzrdclaw-discord-bot.service
  sudo systemctl start wzrdclaw-discord-bot.service
  sleep 3
  sudo systemctl status wzrdclaw-discord-bot.service --no-pager
  echo "   Logs: sudo journalctl -u wzrdclaw-discord-bot -f"
fi

# Method 2: Start in screen session
echo ""
echo "2. 🖥️ Starting in screen session..."
SCREEN_NAME="wzrdclaw-bot"

if command -v screen >/dev/null; then
  screen -dmS "$SCREEN_NAME" bash -c "cd /home/$USER/wzrd-redesign/interfaces && export DISCORD_BOT_TOKEN=MTQ4MzA3ODA4MDUzNTk4NjE4Nw.GmiZM1.6s1YxbEOtuoxMMIJy5qy_XEhPhbHQyqWzxeAdE && node wzrdclaw-discord-bot-ai.js"
  sleep 2
  screen -ls | grep "$SCREEN_NAME"
  echo "   Attach: screen -r $SCREEN_NAME"
else
  echo "   ❌ Screen not available"
fi

# Method 3: Start keep-alive script
echo ""
echo "3. 🔄 Starting keep-alive monitor..."
nohup "$KEEP_ALIVE" > /dev/null 2>&1 &
KEEP_PID=$!
echo "   Keep-alive PID: $KEEP_PID"
echo "   Monitor logs: tail -f /tmp/wzrdclaw-bot-keepalive.log"
echo "   Bot logs: tail -f /tmp/wzrdclaw-bot-output.log"

# Method 4: Direct start
echo ""
echo "4. 🚀 Direct start (background)..."
cd /home/$USER/wzrd-redesign/interfaces
export DISCORD_BOT_TOKEN="MTQ4MzA3ODA4MDUzNTk4NjE4Nw.GmiZM1.6s1YxbEOtuoxMMIJy5qy_XEhPhbHQyqWzxeAdE"
nohup node wzrdclaw-discord-bot-ai.js > /tmp/wzrdclaw-bot-direct.log 2>&1 &
DIRECT_PID=$!
echo "   Direct PID: $DIRECT_PID"
echo "   Logs: tail -f /tmp/wzrdclaw-bot-direct.log"

echo ""
echo "🎯 Bot started with 4 fallback methods!"
echo "======================================="
echo "• Systemd service (if enabled)"
echo "• Screen session"
echo "• Keep-alive monitor"
echo "• Direct background process"
echo ""
echo "📊 Check status:"
echo "   ps aux | grep wzrdclaw-discord-bot"
echo ""
echo "📱 Check Discord:"
echo "   Bot should show as ONLINE within 30 seconds"
echo "   Send 'test' in #testing channel"
echo ""
echo "🔧 Bot will auto-restart if it disconnects"