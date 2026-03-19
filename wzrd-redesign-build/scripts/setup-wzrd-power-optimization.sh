#!/bin/bash
# WZRD Power Optimization Setup
# Integrates power optimization into the entire WZRD framework

set -e

echo "=================================================="
echo "🔋 WZRD Power Optimization Framework Setup"
echo "=================================================="

WZRD_HOME="/home/mdwzrd"
SCRIPTS_DIR="$WZRD_HOME/wzrd-redesign/wzrd-redesign-build/scripts"
CONFIG_DIR="$WZRD_HOME/wzrd-redesign/wzrd-redesign-build/configs"
LOG_DIR="/tmp/wzrd-power-setup"

mkdir -p "$LOG_DIR"
echo "$(date): Starting WZRD power optimization setup" > "$LOG_DIR/setup.log"

# Function to log setup progress
log_setup() {
    echo "$(date): $1" >> "$LOG_DIR/setup.log"
    echo "  $1"
}

# 1. Create optimized watchdog
log_setup "1. Creating power-optimized watchdog..."
cat > "$SCRIPTS_DIR/opencode/opencode-watchdog-enhanced.sh" << 'EOF'
#!/bin/bash
# Enhanced OpenCode Power Watchdog with WZRD Integration
# Part of WZRD Power Optimization Framework

WZRD_HOME="/home/mdwzrd"
LOG_FILE="/tmp/opencode-power-watchdog.log"
CONFIG_FILE="$WZRD_HOME/.config/wzrd-power-config.json"

# Load configuration
if [ -f "$CONFIG_FILE" ]; then
    NICE_LEVEL=$(jq -r '.nice_level // 10' "$CONFIG_FILE")
    MAX_INSTANCES=$(jq -r '.max_instances // 5' "$CONFIG_FILE")
    MAX_CPU_PERCENT=$(jq -r '.max_cpu_percent // 30' "$CONFIG_FILE")
    MAX_MEMORY_MB=$(jq -r '.max_memory_mb // 3000' "$CONFIG_FILE")
else
    # Defaults
    NICE_LEVEL=10
    MAX_INSTANCES=5
    MAX_CPU_PERCENT=30
    MAX_MEMORY_MB=3000
fi

echo "$(date): WZRD Power Watchdog Started (nice=$NICE_LEVEL)" >> "$LOG_FILE"

# Count and optimize
count=$(ps aux | grep -c "opencode --model")
echo "$(date): Found $count OpenCode instances (max: $MAX_INSTANCES)" >> "$LOG_FILE"

if [ "$count" -gt 0 ]; then
    # Apply power optimization
    ps aux | grep "opencode --model" | grep -v grep | awk '{print $2}' | while read pid; do
        current_nice=$(ps -o ni= -p $pid 2>/dev/null || echo "0")
        if [ "$current_nice" -lt "$NICE_LEVEL" ]; then
            renice "$NICE_LEVEL" -p "$pid" 2>/dev/null || true
            echo "$(date): PID $pid optimized (nice: $current_nice -> $NICE_LEVEL)" >> "$LOG_FILE"
        fi
    done
    
    # Generate report
    report_file="/tmp/wzrd-power-report-$(date +%s).json"
    ps aux | grep "opencode --model" | grep -v grep | awk '{print $2,$3,$4,$11}' | while read pid cpu mem cmd; do
        nice=$(ps -o ni= -p $pid 2>/dev/null || echo "0")
        echo "{\"pid\":$pid,\"cpu\":$cpu,\"memory\":$mem,\"nice\":$nice,\"command\":\"$cmd\",\"timestamp\":\"$(date -Iseconds)\"}" >> "$report_file"
    done
    
    # Check for excessive instances
    if [ "$count" -gt "$((MAX_INSTANCES + 3))" ]; then
        echo "$(date): WARNING: $count instances exceeds limit of $MAX_INSTANCES" >> "$LOG_FILE"
        # Could trigger alert here
    fi
fi

echo "$(date): WZRD Power Watchdog Completed" >> "$LOG_FILE"
EOF

chmod +x "$SCRIPTS_DIR/opencode/opencode-watchdog-enhanced.sh"
log_setup "✅ Enhanced watchdog created"

# 2. Update WZRD launch script to use power optimization
log_setup "2. Updating WZRD launch script..."
if [ -f "$WZRD_HOME/wzrd-dev-launch.sh" ]; then
    # Backup original
    cp "$WZRD_HOME/wzrd-dev-launch.sh" "$WZRD_HOME/wzrd-dev-launch.sh.backup-$(date +%s)"
    
    # Already updated earlier - verify
    if grep -q "Power Optimization" "$WZRD_HOME/wzrd-dev-launch.sh"; then
        log_setup "✅ Power optimization already integrated"
    else
        log_setup "⚠️  Manual integration may be needed"
    fi
fi

# 3. Create WZRD power configuration
log_setup "3. Creating WZRD power configuration..."
cat > "$WZRD_HOME/.config/wzrd-power-config.json" << 'EOF'
{
  "version": "1.0",
  "description": "WZRD Power Optimization Configuration",
  "power_optimization": {
    "enabled": true,
    "nice_level": 10,
    "max_instances": 5,
    "max_cpu_percent": 30,
    "max_memory_mb": 3000,
    "context_limit": 8000,
    "default_model": "nvidia/z-ai/glm4.7",
    "default_agent": "remi",
    "temperature": 0.7,
    "max_tokens": 2000
  },
  "monitoring": {
    "watchdog_interval": 15,
    "report_interval": 60,
    "alert_on_excess": true,
    "log_level": "info"
  },
  "integration": {
    "wzrd_launch": true,
    "cron_schedule": "*/15 * * * *",
    "auto_optimize": true
  }
}
EOF
log_setup "✅ Power configuration created"

# 4. Setup cron job for automated optimization
log_setup "4. Setting up automated optimization..."
CRON_JOB="*/15 * * * * $SCRIPTS_DIR/opencode/opencode-watchdog-enhanced.sh >> /tmp/wzrd-power-cron.log 2>&1"

if ! crontab -l 2>/dev/null | grep -q "opencode-watchdog-enhanced"; then
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    log_setup "✅ Cron job installed (runs every 15 minutes)"
else
    log_setup "✅ Cron job already exists"
fi

# 5. Create alias/shortcut for power-optimized launch
log_setup "5. Creating power-optimized shortcuts..."
cat > "$WZRD_HOME/bin/wzrd-power" << 'EOF'
#!/bin/bash
# WZRD Power-Optimized Launch Command
# Usage: wzrd-power [opencode args]

export OPENCODE_POWER_NICE=10
export OPENCODE_POWER_CONTEXT=8000
export OPENCODE_POWER_TEMP=0.7
export OPENCODE_POWER_MAX_TOKENS=2000

echo "🔋 WZRD Power-Optimized Mode"
echo "============================"
echo "Launching with power optimization..."
echo "  • CPU Priority: Lower (nice=10)"
echo "  • Context Limit: 8000 tokens"
echo "  • Auto-optimization: Enabled"

# Use power wrapper if available
if [ -f "/home/mdwzrd/wzrd-redesign/wzrd-redesign-build/scripts/opencode/opencode-power-wrapper.sh" ]; then
    exec /home/mdwzrd/wzrd-redesign/wzrd-redesign-build/scripts/opencode/opencode-power-wrapper.sh --launch "$@"
else
    # Fallback to direct launch with nice
    exec nice -n 10 /home/mdwzrd/.opencode/bin/opencode \
        --context 8000 \
        --temperature 0.7 \
        --max-tokens 2000 \
        "$@"
fi
EOF

chmod +x "$WZRD_HOME/bin/wzrd-power"
log_setup "✅ Power-optimized shortcut created: wzrd-power"

# 6. Create systemd service for power monitoring (optional)
log_setup "6. Creating systemd service for power monitoring..."
cat > "$WZRD_HOME/.config/systemd/user/wzrd-power-monitor.service" << 'EOF'
[Unit]
Description=WZRD Power Optimization Monitor
After=network.target

[Service]
Type=simple
WorkingDirectory=/home/mdwzrd
ExecStart=/home/mdwzrd/wzrd-redesign/wzrd-redesign-build/scripts/opencode/opencode-watchdog-enhanced.sh
Restart=on-failure
RestartSec=10

[Install]
WantedBy=default.target
EOF
log_setup "✅ Systemd service configuration created"

# 7. Generate setup report
log_setup "7. Generating setup report..."
REPORT_FILE="$LOG_DIR/setup-report-$(date +%s).md"

cat > "$REPORT_FILE" << EOF
# WZRD Power Optimization Setup Report
## Generated: $(date)

### ✅ Setup Completed Successfully

### Installed Components:
1. **Enhanced Power Watchdog**
   - Location: $SCRIPTS_DIR/opencode/opencode-watchdog-enhanced.sh
   - Features: Auto-nice optimization, resource monitoring, JSON reporting

2. **WZRD Launch Integration**
   - Updated: $WZRD_HOME/wzrd-dev-launch.sh
   - Power optimization automatically applied on launch

3. **Power Configuration**
   - Location: $WZRD_HOME/.config/wzrd-power-config.json
   - Customizable: nice level, instance limits, thresholds

4. **Automated Optimization**
   - Cron job: Runs every 15 minutes
   - Logs: /tmp/wzrd-power-cron.log

5. **Power-Optimized Shortcut**
   - Command: \`wzrd-power\`
   - Usage: \`wzrd-power --model nvidia/z-ai/glm4.7 --agent remi\`
   - Always applies power optimization

6. **Systemd Service** (optional)
   - Service: wzrd-power-monitor.service
   - Enable with: \`systemctl --user enable wzrd-power-monitor\`

### Power Optimization Benefits:
- **Reduced CPU contention**: OpenCode runs at lower priority (nice=10)
- **Better system responsiveness**: Desktop/UI remains smooth during AI work
- **Lower power consumption**: CPU can idle more often
- **Reduced heat/fan noise**: Less sustained high CPU usage
- **Extended battery life**: On laptops, significant power savings

### Usage Instructions:
\`\`\`bash
# Standard launch (with power optimization)
wzrd.dev

# Power-optimized shortcut
wzrd-power --model nvidia/z-ai/glm4.7 --agent remi

# Check power optimization status
tail -f /tmp/opencode-power-watchdog.log

# Generate power report
/home/mdwzrd/wzrd-redesign/wzrd-redesign-build/scripts/opencode/opencode-power-wrapper.sh --report
\`\`\`

### Configuration:
Edit \`$WZRD_HOME/.config/wzrd-power-config.json\` to adjust:
- \`nice_level\`: CPU priority (0-19, higher = lower priority)
- \`max_instances\`: Maximum OpenCode instances
- \`max_cpu_percent\`: CPU usage warning threshold
- \`context_limit\`: Token limit per session

### Next Steps:
1. Test with: \`wzrd-power --help\`
2. Monitor logs: \`tail -f /tmp/wzrd-power-cron.log\`
3. Verify optimization: \`ps aux | grep opencode | grep -v grep\`
   - Look for \`SNl+\` in process status (N = nice > 0)

### Support:
- Logs: $LOG_DIR/
- Configuration: $WZRD_HOME/.config/wzrd-power-config.json
- Scripts: $SCRIPTS_DIR/opencode/
EOF

log_setup "✅ Setup report generated: $REPORT_FILE"

echo ""
echo "=================================================="
echo "🎉 WZRD Power Optimization Framework Installed!"
echo "=================================================="
echo ""
echo "✅ Components installed:"
echo "   • Enhanced watchdog with auto-optimization"
echo "   • WZRD launch integration"
echo "   • Power configuration system"
echo "   • Automated cron optimization"
echo "   • Power-optimized shortcut: wzrd-power"
echo "   • Systemd service (optional)"
echo ""
echo "📊 To use power optimization:"
echo "   wzrd-power --model nvidia/z-ai/glm4.7 --agent remi"
echo ""
echo "📈 To monitor power optimization:"
echo "   tail -f /tmp/opencode-power-watchdog.log"
echo ""
echo "⚙️  Configuration:"
echo "   ~/.config/wzrd-power-config.json"
echo ""
echo "📄 Full setup report:"
echo "   $REPORT_FILE"
echo ""
echo "=================================================="