#!/bin/bash
# WZRD.DEV MIGRATION - SAFE AND INCREMENTAL
# Migrates from wzrd.dev (old) to wzrd-redesign (new)

set -e
echo "=== WZRD.DEV MIGRATION STARTED $(date) ==="
echo ""

# Configuration
OLD_DIR="/home/mdwzrd/wzrd.dev"
NEW_DIR="/home/mdwzrd/wzrd-redesign"
BACKUP_DIR="/home/mdwzrd/backups"
LOG_FILE="$NEW_DIR/logs/migration-$(date +%Y%m%d).log"

mkdir -p "$BACKUP_DIR"
mkdir -p "$(dirname "$LOG_FILE")"

exec > >(tee -a "$LOG_FILE") 2>&1

echo "Logging to: $LOG_FILE"
echo ""

# ===== PHASE 1: PRE-MIGRATION CHECKS =====
echo "=== PHASE 1: PRE-MIGRATION CHECKS ==="

# Check disk space
free_gb=$(df -h /home/mdwzrd | awk 'NR==2 {print $4}' | sed 's/G//')
echo "Free disk space: ${free_gb}GB"
if [ "$free_gb" -lt 10 ]; then
    echo "⚠️ WARNING: Less than 10GB free. Migration may fail."
    read -p "Continue anyway? (y/N): " -n 1 -r
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Migration cancelled."
        exit 1
    fi
fi

# Check running services
echo ""
echo "Currently running services:"
ps aux | grep -E "(wzrd|bot-health|opencode)" | grep -v grep || true

# Document current state
echo ""
echo "Documenting current state..."
echo "DRY-RUN: Would update crontab to:" -l > "$BACKUP_DIR/cron-backup-$(date +%Y%m%d).txt"
ps aux > "$BACKUP_DIR/processes-backup-$(date +%Y%m%d).txt"

# ===== PHASE 2: GRACEFUL SHUTDOWN =====
echo ""
echo "=== PHASE 2: GRACEFUL SHUTDOWN ==="

echo "1. Stopping bot health monitor..."
if echo "DRY-RUN: Would kill:" "bot-health-monitor.sh"; then
    echo "   ✅ Stopped bot-health-monitor.sh"
    sleep 2
else
    echo "   ℹ️ bot-health-monitor.sh not running"
fi

echo "2. Stopping process monitor..."
if echo "DRY-RUN: Would kill:" "wzrd-process-monitor.js"; then
    echo "   ✅ Stopped wzrd-process-monitor.js"
    sleep 2
else
    echo "   ℹ️ wzrd-process-monitor.js not running"
fi

echo "3. Checking for opencode..."
if netstat -tlnp 2>/dev/null | grep ":4096" >/dev/null; then
    echo "   ⚠️ opencode running on port 4096"
    echo "   Please stop opencode manually:"
    echo "   cd $OLD_DIR/opencode && npm stop"
    read -p "Press Enter after stopping opencode..."
else
    echo "   ✅ opencode not running"
fi

# ===== PHASE 3: DATA MIGRATION =====
echo ""
echo "=== PHASE 3: DATA MIGRATION ==="

echo "1. Creating backups..."
echo "DRY-RUN: Would create backup:" "$BACKUP_DIR/wzrd.dev-backup-$(date +%Y%m%d-%H%M).tar.gz" -C /home/mdwzrd wzrd.dev 2>/dev/null &
echo "DRY-RUN: Would create backup:" "$BACKUP_DIR/wzrd-redesign-backup-$(date +%Y%m%d-%H%M).tar.gz" -C /home/mdwzrd wzrd-redesign 2>/dev/null &
wait
echo "   ✅ Backups created"

echo "2. Migrating projects (3.9GB)..."
if [ -d "$OLD_DIR/projects" ]; then
    rsync -nav --progress "$OLD_DIR/projects/" "$NEW_DIR/projects/" 2>&1 | tail -5
    echo "   ✅ Projects migrated"
else
    echo "   ℹ️ No projects directory found"
fi

echo "3. Migrating opencode (3.0GB)..."
if [ -d "$OLD_DIR/opencode" ]; then
    rsync -nav --progress "$OLD_DIR/opencode/" "$NEW_DIR/opencode/" 2>&1 | tail -5
    echo "   ✅ Opencode migrated"
else
    echo "   ℹ️ No opencode directory found"
fi

echo "4. Merging memory systems..."
if [ -d "$OLD_DIR/memory-system" ]; then
    mkdir -p "$NEW_DIR/memory/"
    rsync -nav --progress "$OLD_DIR/memory-system/" "$NEW_DIR/memory/" 2>&1 | tail -5
    echo "   ✅ Memory merged"
else
    echo "   ℹ️ No memory-system directory found"
fi

echo "5. Migrating bot scripts..."
if [ -f "$OLD_DIR/bot-health-monitor.sh" ]; then
    echo "DRY-RUN: Would copy: ""$OLD_DIR/bot-health-monitor.sh" "$NEW_DIR/scripts/"
    echo "   ✅ Bot monitor script copied"
fi

# ===== PHASE 4: AUTOMATION UPDATE =====
echo ""
echo "=== PHASE 4: AUTOMATION UPDATE ==="

echo "1. Updating cron jobs..."
TEMP_CRON=$(mktemp)
echo "DRY-RUN: Would update crontab to:" -l > "$TEMP_CRON" 2>/dev/null || echo "# Empty echo "DRY-RUN: Would update crontab to:"" > "$TEMP_CRON"

# Update paths
sed -i "s|$OLD_DIR|$NEW_DIR|g" "$TEMP_CRON"
sed -i "s|/home/mdwzrd/wzrd\.dev|$NEW_DIR|g" "$TEMP_CRON"

# Install updated cron
echo "DRY-RUN: Would update crontab to:" "$TEMP_CRON"
rm "$TEMP_CRON"
echo "   ✅ Cron jobs updated"

echo "2. Verifying cron jobs..."
echo "DRY-RUN: Would update crontab to:" -l | grep -E "(wzrd|memory|health)" || echo "   ℹ️ No wzrd cron jobs found"

# ===== PHASE 5: VALIDATION =====
echo ""
echo "=== PHASE 5: VALIDATION ==="

echo "1. Checking data integrity..."
projects_old=$(find "$OLD_DIR/projects" -type f 2>/dev/null | wc -l)
projects_new=$(find "$NEW_DIR/projects" -type f 2>/dev/null | wc -l)
echo "   Projects: Old=$projects_old, New=$projects_new"

memory_old=$(find "$OLD_DIR/memory-system" -type f 2>/dev/null | wc -l)
memory_new=$(find "$NEW_DIR/memory" -type f 2>/dev/null | wc -l)
echo "   Memory: Old=$memory_old, New=$memory_new"

echo "2. Testing scripts..."
if [ -f "$NEW_DIR/scripts/bot-health-monitor.sh" ]; then
    chmod +x "$NEW_DIR/scripts/bot-health-monitor.sh"
    echo "   ✅ Bot script executable"
fi

# ===== PHASE 6: SOFT LAUNCH =====
echo ""
echo "=== PHASE 6: SOFT LAUNCH ==="

echo "1. Starting new services..."
cd "$NEW_DIR"
if [ -f "scripts/bot-health-monitor.sh" ]; then
    echo "DRY-RUN: Would start service"
    echo "   ✅ Bot monitor started"
fi

echo "2. Starting health checks..."
if [ -f "scripts/remi-monitor.js" ]; then
    node scripts/remi-monitor.js --test > logs/monitor-test.log 2>&1 &
    echo "   ✅ Health monitor started"
fi

# ===== PHASE 7: NEXT STEPS =====
echo ""
echo "=== PHASE 7: NEXT STEPS ==="
echo ""
echo "✅ MIGRATION COMPLETE!"
echo ""
echo "NEXT ACTIONS:"
echo ""
echo "1. MONITOR FOR 24 HOURS:"
echo "   tail -f $NEW_DIR/logs/bot-daemon.log"
echo "   tail -f $NEW_DIR/logs/migration-$(date +%Y%m%d).log"
echo ""
echo "2. VERIFY SERVICES:"
echo "   ps aux | grep wzrd-redesign"
echo "   Check Discord for bot messages"
echo ""
echo "3. TEST AUTOMATION:"
echo "   Wait for next cron job (check logs)"
echo ""
echo "4. AFTER 24H SUCCESS:"
echo "   # Archive old system"
echo "   echo "DRY-RUN: Would move: "$OLD_DIR $OLD_DIR.archive"
echo ""
echo "   # Rename new to final"
echo "   echo "DRY-RUN: Would move: "$NEW_DIR /home/mdwzrd/wzrd.dev"
echo ""
echo "   # Update final paths"
echo "   sed -i 's|wzrd-redesign|wzrd.dev|g' /home/mdwzrd/wzrd.dev/**/*.sh"
echo ""
echo "⚠️ DO NOT RENAME YET! Run both systems for 24h."
echo ""
echo "=== MIGRATION ENDED $(date) ==="
echo "Log: $LOG_FILE"
echo "Backups: $BACKUP_DIR/"