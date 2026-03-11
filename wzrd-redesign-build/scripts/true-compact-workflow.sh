#!/bin/bash
# True Compact Workflow for WZRD.dev
# Enhanced version that actually resets chat like Claude's compact

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

# Ensure directories exist
mkdir -p "$TOPICS_PATH"
mkdir -p "$(dirname "$HISTORY_FILE")"

# Detect current topic
detect_topic() {
    local pwd=$(pwd)
    local git_branch=$(git branch --show-current 2>/dev/null || echo "main")
    local date=$(date +%Y-%m-%d)
    
    # Create deterministic topic hash
    local topic_input="${pwd}/${git_branch}/${date}"
    local topic_hash=$(echo -n "$topic_input" | sha256sum | cut -c1-12)
    
    local topic_name=$(basename "$pwd")-$git_branch-$date
    local topic_dir="$TOPICS_PATH/$topic_name-$topic_hash"
    
    echo "$topic_dir"
}

# Save conversation to topic memory
save_conversation_to_topic() {
    local topic_dir="$1"
    
    log_info "Saving conversation to topic memory..."
    
    mkdir -p "$topic_dir"
    
    if [ -f "$HISTORY_FILE" ]; then
        # Copy history file
        cp "$HISTORY_FILE" "$topic_dir/prompt-history-backup.jsonl"
        
        # Get conversation stats
        local size_bytes=$(stat -c%s "$HISTORY_FILE")
        local size_kb=$((size_bytes / 1024))
        local line_count=$(wc -l < "$HISTORY_FILE")
        
        # Create memory file
        cat > "$topic_dir/MEMORY.md" << EOF
# Conversation Backup: $(date)

## Summary
Saved conversation before chat reset via True Compact Workflow.

## Stats
- Size: ${size_kb}KB
- Lines: ${line_count}
- Saved at: $(date)

## Contents
The full conversation is available in \`prompt-history-backup.jsonl\`.

## Context
This conversation was automatically archived when the chat was reset
to prevent TUI slowdown. The chat continues with:
"$CONTINUATION_PROMPT"

## Related Files
- prompt-history-backup.jsonl: Raw conversation history
EOF
        
        log_success "Conversation saved to: $topic_dir"
        return 0
    else
        log_warn "No history file to save"
        return 1
    fi
}

# Kill OpenCode processes safely
kill_opencode_processes() {
    log_info "Looking for OpenCode processes..."
    
    # Find OpenCode processes
    OPENCODE_PIDS=$(ps aux | grep -i opencode | grep -v grep | grep -v "true-compact" | grep -v "wzrd-compact" | awk '{print $2}')
    
    if [ -n "$OPENCODE_PIDS" ]; then
        log_warn "Found OpenCode PIDs: $OPENCODE_PIDS"
        
        # Send SIGTERM first (graceful)
        kill $OPENCODE_PIDS 2>/dev/null || true
        sleep 2
        
        # Check if still running
        STILL_RUNNING=$(ps aux | grep -i opencode | grep -v grep | grep -v "true-compact" | grep -v "wzrd-compact" | awk '{print $2}')
        if [ -n "$STILL_RUNNING" ]; then
            log_warn "OpenCode still running, sending SIGKILL"
            kill -9 $STILL_RUNNING 2>/dev/null || true
            sleep 1
        fi
        
        log_success "OpenCode processes terminated"
    else
        log_info "No OpenCode processes found"
    fi
}

# Reset chat history
reset_chat_history() {
    log_info "Resetting chat history..."
    
    # Create fresh history file
    echo '[]' > "$HISTORY_FILE"
    
    # Also backup related state files
    STATE_DIR=$(dirname "$HISTORY_FILE")
    local timestamp=$(date +%s)
    for file in "$STATE_DIR"/kv.json "$STATE_DIR"/model.json; do
        if [ -f "$file" ]; then
            cp "$file" "$file.backup-$timestamp" 2>/dev/null || true
        fi
    done
    
    log_success "Chat history reset"
}

# Create restart script
create_restart_script() {
    local topic_dir="$1"
    local restart_script="$topic_dir/restart.sh"
    
    cat > "$restart_script" << EOF
#!/bin/bash
# Restart OpenCode after True Compact
# Generated: $(date)

echo "🚀 Restarting OpenCode after chat reset"
echo ""

echo "=== CONTINUATION ==="
echo "Type this prompt when OpenCode starts:"
echo ""
echo "  \"$CONTINUATION_PROMPT\""
echo ""
echo "=== COMMAND ==="
echo "opencode --model nvidia/z-ai/glm4.7 --agent remi"
echo ""
echo "=== NOTES ==="
echo "- Previous conversation saved to: $topic_dir"
echo "- Chat history has been reset"
echo "- Continue with your work"
EOF
    
    chmod +x "$restart_script"
    echo "$restart_script"
}

# Show current stats
show_stats() {
    if [ -f "$HISTORY_FILE" ]; then
        local size_bytes=$(stat -c%s "$HISTORY_FILE")
        local size_kb=$((size_bytes / 1024))
        local line_count=$(wc -l < "$HISTORY_FILE")
        
        echo "=== Current Chat Stats ==="
        echo "Size: ${size_kb}KB"
        echo "Lines: ${line_count}"
        echo ""
        
        # Recommendations
        if [ "$size_kb" -gt 15 ]; then
            echo "⚠ Warning: Chat size > 15KB (may cause slowdown)"
        fi
        
        if [ "$line_count" -gt 40 ]; then
            echo "⚠ Warning: Line count > 40 (consider resetting)"
        fi
    else
        echo "No chat history found"
    fi
}

# Main workflow
run_true_compact() {
    log_info "Starting True Compact Workflow..."
    log_info "Goal: Reset chat like Claude's compact (save & clear)"
    
    # Check if we should proceed
    if [ -f "$HISTORY_FILE" ]; then
        local size_bytes=$(stat -c%s "$HISTORY_FILE")
        local size_kb=$((size_bytes / 1024))
        
        echo "Current chat size: ${size_kb}KB"
        read -p "Reset chat and save to topic memory? (y/n): " -n 1 -r
        echo ""
        
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Operation cancelled"
            return 1
        fi
    fi
    
    # Detect topic directory
    TOPIC_DIR=$(detect_topic)
    log_info "Topic directory: $TOPIC_DIR"
    
    # Step 1: Save conversation
    save_conversation_to_topic "$TOPIC_DIR"
    
    # Step 2: Kill OpenCode
    kill_opencode_processes
    
    # Step 3: Reset chat
    reset_chat_history
    
    # Step 4: Create restart instructions
    RESTART_SCRIPT=$(create_restart_script "$TOPIC_DIR")
    
    log_success "True Compact Workflow Complete!"
    echo ""
    echo "=== NEXT STEPS ==="
    echo "1. Run the restart script:"
    echo "   $RESTART_SCRIPT"
    echo ""
    echo "2. Or manually:"
    echo "   opencode --model nvidia/z-ai/glm4.7 --agent remi"
    echo "   Then type: \"$CONTINUATION_PROMPT\""
    echo ""
    echo "3. Your conversation is saved at:"
    echo "   $TOPIC_DIR"
    
    return 0
}

# Automated monitoring version
run_auto_compact() {
    log_info "Starting Auto Compact Monitoring..."
    
    # Configuration
    local threshold_kb=15
    local threshold_lines=40
    local check_interval=60
    
    echo "Monitoring: $HISTORY_FILE"
    echo "Threshold: ${threshold_kb}KB or ${threshold_lines} lines"
    echo "Check interval: ${check_interval}s"
    echo ""
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
                log_warn "Threshold reached! (${size_kb}KB >= ${threshold_kb}KB or ${line_count} >= ${threshold_lines})"
                
                # Auto-compact
                TOPIC_DIR=$(detect_topic)
                save_conversation_to_topic "$TOPIC_DIR"
                kill_opencode_processes
                reset_chat_history
                
                RESTART_SCRIPT=$(create_restart_script "$TOPIC_DIR")
                
                log_success "Auto-compact triggered!"
                echo ""
                echo "=== AUTO-COMPACT COMPLETE ==="
                echo "Restart script: $RESTART_SCRIPT"
                echo "Topic backup: $TOPIC_DIR"
                echo ""
                
                # Exit monitoring
                break
            fi
        else
            echo -ne "\r[$(date +%H:%M:%S)] Waiting for chat history...    "
        fi
        
        sleep "$check_interval"
    done
}

# Show help
show_help() {
    echo "True Compact Workflow for WZRD.dev"
    echo "Actually resets chat like Claude's compact (saves & clears)"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  compact      Run true compact workflow (interactive)"
    echo "  auto         Start auto-monitoring (reset when threshold)"
    echo "  stats        Show current chat statistics"
    echo "  help         Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 compact    # Save & reset chat manually"
    echo "  $0 auto       # Monitor and auto-reset"
    echo "  $0 stats      # Check current chat size"
    echo ""
    echo "Features:"
    echo "  • Saves conversation to topic memory"
    echo "  • Kills OpenCode processes"
    echo "  • Resets chat history"
    echo "  • Provides restart instructions"
    echo "  • Auto-monitoring with thresholds"
    echo ""
    echo "Thresholds:"
    echo "  • Size: 15KB"
    echo "  • Lines: 40"
}

# Main
case "${1:-help}" in
    compact)
        run_true_compact
        ;;
        
    auto)
        run_auto_compact
        ;;
        
    stats)
        show_stats
        ;;
        
    help|--help|-h)
        show_help
        ;;
        
    *)
        echo "Unknown command: $1"
        show_help
        exit 1
        ;;
esac