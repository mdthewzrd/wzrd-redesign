#!/bin/bash
# Integrated WZRD Compact Workflow
# Combines true-compact automation with existing wzrd-compact features

set -e

# Configuration
WZRD_REDESIGN_PATH="/home/mdwzrd/wzrd-redesign"
TOPICS_PATH="$WZRD_REDESIGN_PATH/topics"
HISTORY_FILE="$HOME/.local/state/opencode/prompt-history.jsonl"
OPENCODE_CONFIG="$HOME/.config/opencode/opencode.jsonc"
CONTINUATION_PROMPT="Continue if you have next steps..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Show status
show_status() {
    echo "=== Integrated WZRD Compact Status ==="
    echo ""
    
    # Check history file
    if [ -f "$HISTORY_FILE" ]; then
        local size_bytes=$(stat -c%s "$HISTORY_FILE")
        local size_kb=$((size_bytes / 1024))
        local line_count=$(wc -l < "$HISTORY_FILE")
        
        echo "📊 Chat History:"
        echo "  Size: ${size_kb}KB"
        echo "  Lines: ${line_count}"
        echo "  Location: $HISTORY_FILE"
    else
        echo "📊 Chat History: Not found"
    fi
    
    echo ""
    
    # Check OpenCode processes
    OPENCODE_PIDS=$(ps aux | grep -i opencode | grep -v grep | grep -v "wzrd-compact" | awk '{print $2}')
    if [ -n "$OPENCODE_PIDS" ]; then
        echo "🔄 OpenCode Processes:"
        echo "  Running: Yes (PIDs: $OPENCODE_PIDS)"
    else
        echo "🔄 OpenCode Processes: Not running"
    fi
    
    echo ""
    
    # Check DCP plugin
    if [ -f "$OPENCODE_CONFIG" ] && grep -q "@tarquinen/opencode-dcp" "$OPENCODE_CONFIG"; then
        echo "🔌 DCP Plugin: Installed"
    else
        echo "🔌 DCP Plugin: Not installed"
    fi
    
    # Check autoCompact
    if [ -f "$OPENCODE_CONFIG" ] && grep -q '"autoCompact": true' "$OPENCODE_CONFIG"; then
        echo "⚡ autoCompact: Enabled"
    else
        echo "⚡ autoCompact: Disabled"
    fi
    
    echo ""
    echo "=== Available Commands ==="
    echo "/compact-status      Show this status"
    echo "/compact-manual      Manual compact & reset"
    echo "/compact-auto        Start auto-monitoring"
    echo "/compact-stats       Show detailed stats"
    echo "/compact-help        Show help"
}

# Manual compact workflow
compact_manual() {
    log_info "Starting Manual Compact Workflow..."
    
    # Step 1: Check current state
    if [ ! -f "$HISTORY_FILE" ]; then
        log_error "No chat history found"
        return 1
    fi
    
    local size_bytes=$(stat -c%s "$HISTORY_FILE")
    local size_kb=$((size_bytes / 1024))
    local line_count=$(wc -l < "$HISTORY_FILE")
    
    echo "Current chat: ${size_kb}KB, ${line_count} lines"
    echo ""
    echo "This will:"
    echo "1. Save conversation to topic memory"
    echo "2. Kill OpenCode processes"
    echo "3. Reset chat history"
    echo "4. Provide restart instructions"
    echo ""
    read -p "Continue? (y/n): " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Operation cancelled"
        return 1
    fi
    
    # Step 2: Detect topic
    local pwd=$(pwd)
    local git_branch=$(git branch --show-current 2>/dev/null || echo "main")
    local date=$(date +%Y-%m-%d)
    local topic_input="${pwd}/${git_branch}/${date}"
    local topic_hash=$(echo -n "$topic_input" | sha256sum | cut -c1-12)
    local topic_name=$(basename "$pwd")-$git_branch-$date
    local topic_dir="$TOPICS_PATH/$topic_name-$topic_hash"
    
    log_info "Topic directory: $topic_dir"
    mkdir -p "$topic_dir"
    
    # Step 3: Save conversation
    cp "$HISTORY_FILE" "$topic_dir/prompt-history-backup.jsonl"
    
    cat > "$topic_dir/MEMORY.md" << EOF
# Manual Compact Backup: $(date)

## Summary
Saved via Integrated WZRD Compact workflow.

## Stats
- Size: ${size_kb}KB
- Lines: ${line_count}
- Saved at: $(date)

## Context
Chat was manually compacted to prevent TUI slowdown.
Continue with: "$CONTINUATION_PROMPT"
EOF
    
    log_success "Conversation saved to topic"
    
    # Step 4: Kill OpenCode
    log_info "Stopping OpenCode..."
    OPENCODE_PIDS=$(ps aux | grep -i opencode | grep -v grep | grep -v "wzrd-compact" | awk '{print $2}')
    if [ -n "$OPENCODE_PIDS" ]; then
        kill $OPENCODE_PIDS 2>/dev/null || true
        sleep 2
        
        # Force kill if still running
        STILL_RUNNING=$(ps aux | grep -i opencode | grep -v grep | grep -v "wzrd-compact" | awk '{print $2}')
        if [ -n "$STILL_RUNNING" ]; then
            kill -9 $STILL_RUNNING 2>/dev/null || true
            sleep 1
        fi
        log_success "OpenCode stopped"
    fi
    
    # Step 5: Reset chat
    echo '[]' > "$HISTORY_FILE"
    log_success "Chat history reset"
    
    # Step 6: Create restart script
    local restart_script="$topic_dir/restart.sh"
    cat > "$restart_script" << EOF
#!/bin/bash
echo "=== RESTART AFTER COMPACT ==="
echo ""
echo "Run:"
echo "opencode --model nvidia/z-ai/glm4.7 --agent remi"
echo ""
echo "Then type:"
echo "\"$CONTINUATION_PROMPT\""
echo ""
echo "Backup location:"
echo "$topic_dir"
EOF
    
    chmod +x "$restart_script"
    
    log_success "Compact complete!"
    echo ""
    echo "=== NEXT STEPS ==="
    echo "1. Restart OpenCode:"
    echo "   $restart_script"
    echo ""
    echo "2. Or run manually:"
    echo "   opencode --model nvidia/z-ai/glm4.7 --agent remi"
    echo "   Then type: \"$CONTINUATION_PROMPT\""
}

# Auto-monitoring
compact_auto() {
    log_info "Starting Auto-Monitoring..."
    
    local threshold_kb=15
    local threshold_lines=40
    local check_interval=60
    
    echo "Monitoring: $HISTORY_FILE"
    echo "Threshold: ${threshold_kb}KB or ${threshold_lines} lines"
    echo "Check every: ${check_interval}s"
    echo "Press Ctrl+C to stop"
    echo ""
    
    while true; do
        if [ -f "$HISTORY_FILE" ]; then
            local size_bytes=$(stat -c%s "$HISTORY_FILE")
            local size_kb=$((size_bytes / 1024))
            local line_count=$(wc -l < "$HISTORY_FILE")
            
            echo -ne "\r[$(date +%H:%M:%S)] Size: ${size_kb}KB, Lines: ${line_count}    "
            
            if [ "$size_kb" -ge "$threshold_kb" ] || [ "$line_count" -ge "$threshold_lines" ]; then
                echo ""
                log_warn "Threshold reached! Auto-compacting..."
                
                # Auto compact
                local pwd=$(pwd)
                local git_branch=$(git branch --show-current 2>/dev/null || echo "main")
                local date=$(date +%Y-%m-%d)
                local topic_input="${pwd}/${git_branch}/${date}"
                local topic_hash=$(echo -n "$topic_input" | sha256sum | cut -c1-12)
                local topic_name=$(basename "$pwd")-$git_branch-$date
                local topic_dir="$TOPICS_PATH/$topic_name-$topic_hash"
                
                mkdir -p "$topic_dir"
                cp "$HISTORY_FILE" "$topic_dir/prompt-history-backup.jsonl"
                
                # Kill OpenCode
                OPENCODE_PIDS=$(ps aux | grep -i opencode | grep -v grep | grep -v "wzrd-compact" | awk '{print $2}')
                if [ -n "$OPENCODE_PIDS" ]; then
                    kill $OPENCODE_PIDS 2>/dev/null || true
                    sleep 2
                    STILL_RUNNING=$(ps aux | grep -i opencode | grep -v grep | grep -v "wzrd-compact" | awk '{print $2}')
                    if [ -n "$STILL_RUNNING" ]; then
                        kill -9 $STILL_RUNNING 2>/dev/null || true
                    fi
                fi
                
                # Reset chat
                echo '[]' > "$HISTORY_FILE"
                
                log_success "Auto-compact complete!"
                echo ""
                echo "=== AUTO-COMPACT TRIGGERED ==="
                echo "Backup: $topic_dir"
                echo ""
                echo "Restart OpenCode:"
                echo "opencode --model nvidia/z-ai/glm4.7 --agent remi"
                echo "Then type: \"$CONTINUATION_PROMPT\""
                
                break
            fi
        fi
        
        sleep "$check_interval"
    done
}

# Show detailed stats
compact_stats() {
    if [ -f "$HISTORY_FILE" ]; then
        local size_bytes=$(stat -c%s "$HISTORY_FILE")
        local size_kb=$((size_bytes / 1024))
        local line_count=$(wc -l < "$HISTORY_FILE")
        
        echo "=== Detailed Chat Statistics ==="
        echo ""
        echo "File: $HISTORY_FILE"
        echo "Size: ${size_bytes} bytes (${size_kb}KB)"
        echo "Lines: ${line_count}"
        echo "Last modified: $(stat -c%y "$HISTORY_FILE")"
        echo ""
        
        # Size analysis
        if [ "$size_kb" -lt 5 ]; then
            echo "📈 Size status: Small (< 5KB)"
        elif [ "$size_kb" -lt 15 ]; then
            echo "📈 Size status: Moderate (5-15KB)"
        elif [ "$size_kb" -lt 30 ]; then
            echo "⚠️ Size status: Large (15-30KB) - Consider compacting"
        else
            echo "⚠️ Size status: Very Large (> 30KB) - Recommended to compact"
        fi
        
        # Line analysis
        if [ "$line_count" -lt 20 ]; then
            echo "📊 Line status: Few messages (< 20)"
        elif [ "$line_count" -lt 40 ]; then
            echo "📊 Line status: Moderate (20-40)"
        elif [ "$line_count" -lt 60 ]; then
            echo "⚠️ Line status: Many messages (40-60) - Consider compacting"
        else
            echo "⚠️ Line status: Very many (> 60) - Recommended to compact"
        fi
        
        echo ""
        echo "=== Recommendations ==="
        if [ "$size_kb" -ge 15 ] || [ "$line_count" -ge 40 ]; then
            echo "✅ Compact now:"
            echo "   Run: $0 manual"
        else
            echo "✅ Status good - no immediate action needed"
        fi
    else
        echo "No chat history found"
    fi
}

# Show help
compact_help() {
    echo "Integrated WZRD Compact Workflow"
    echo "Combines automation with true chat reset"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  status      Show current status"
    echo "  manual      Manual compact & reset"
    echo "  auto        Start auto-monitoring"
    echo "  stats       Show detailed statistics"
    echo "  help        Show this help"
    echo ""
    echo "Features:"
    echo "  • True chat reset (like Claude's compact)"
    echo "  • Saves to topic memory"
    echo "  • Auto-monitoring with thresholds"
    echo "  • Integrated with existing workflow"
    echo ""
    echo "Thresholds (auto mode):"
    echo "  • Size: 15KB"
    echo "  • Lines: 40"
    echo ""
    echo "Example workflow:"
    echo "  1. $0 status      # Check current state"
    echo "  2. $0 manual      # Manual compact if needed"
    echo "  3. $0 auto        # Run auto-monitoring"
}

# Main
case "${1:-status}" in
    status)
        show_status
        ;;
        
    manual)
        compact_manual
        ;;
        
    auto)
        compact_auto
        ;;
        
    stats)
        compact_stats
        ;;
        
    help|--help|-h)
        compact_help
        ;;
        
    *)
        echo "Unknown command: $1"
        compact_help
        exit 1
        ;;
esac