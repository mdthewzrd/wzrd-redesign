#!/bin/bash
# WZRD Compact Workflow
# Integrates with OpenCode to provide true context reset with memory preservation

set -e

# Colors for output
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

# Configuration
WZRD_REDESIGN_PATH="/home/mdwzrd/wzrd-redesign"
TOPICS_PATH="$WZRD_REDESIGN_PATH/topics"
OPENCODE_STATE_DIR="$HOME/.local/state/opencode"
OPENCODE_PROMPT_HISTORY="$OPENCODE_STATE_DIR/prompt-history.jsonl"

# Ensure directories exist
mkdir -p "$TOPICS_PATH"
mkdir -p "$OPENCODE_STATE_DIR"

# Detect current topic
detect_topic() {
    local pwd=$(pwd)
    local git_branch=$(git branch --show-current 2>/dev/null || echo "main")
    local date=$(date +%Y-%m-%d)
    
    # Create deterministic topic hash
    local topic_input="${pwd}/${git_branch}/${date}"
    local topic_hash=$(echo -n "$topic_input" | sha256sum | cut -c1-12)
    
    local topic_name=$(basename "$pwd")-$git_branch-$date
    
    echo "$topic_hash:$topic_name"
}

# Extract conversation from OpenCode prompt history
extract_conversation() {
    if [ ! -f "$OPENCODE_PROMPT_HISTORY" ]; then
        log_warn "No OpenCode prompt history found"
        return 1
    fi
    
    # Get last 20 messages (approx)
    local messages=$(tail -20 "$OPENCODE_PROMPT_HISTORY" | jq -r '.input // empty' 2>/dev/null || \
                     grep -o '"input":"[^"]*"' "$OPENCODE_PROMPT_HISTORY" | sed 's/"input":"//g' | sed 's/"//g' | tail -20)
    
    echo "$messages"
}

# Save conversation to topic memory
save_to_topic_memory() {
    local topic_hash="$1"
    local topic_name="$2"
    local conversation="$3"
    
    local topic_dir="$TOPICS_PATH/$topic_hash"
    mkdir -p "$topic_dir"
    
    local memory_file="$topic_dir/MEMORY.md"
    local conversation_file="$topic_dir/CONVERSATION_$(date +%Y%m%d_%H%M%S).md"
    
    # Create memory file if it doesn't exist
    if [ ! -f "$memory_file" ]; then
        cat > "$memory_file" << EOF
# $topic_name

## Created
$(date)

## Status
Active

## Patterns
- [To be extracted]

## Key Decisions
- [To be extracted]

## Related Topics
- None yet

---
EOF
    fi
    
    # Save conversation
    cat > "$conversation_file" << EOF
# Conversation $(date)

## Summary
$(echo "$conversation" | head -5 | tr '\n' ' ')

## Full Conversation
\`\`\`
$conversation
\`\`\`

## Extracted Patterns
$(extract_patterns "$conversation")

## Next Actions
- Continue development
- Reference this conversation for context
EOF
    
    log_info "Saved conversation to: $conversation_file"
    log_info "Updated memory at: $memory_file"
    
    # Append to memory file
    echo -e "\n## Conversation $(date)" >> "$memory_file"
    echo "Saved to: $(basename "$conversation_file")" >> "$memory_file"
    echo "Summary: $(echo "$conversation" | head -2 | tr '\n' ' ' | cut -c1-100)..." >> "$memory_file"
}

# Extract patterns from conversation
extract_patterns() {
    local conversation="$1"
    
    local patterns=""
    
    if echo "$conversation" | grep -qi "function\|const\|let\|var\|class"; then
        patterns="$patterns\n- Code implementation"
    fi
    
    if echo "$conversation" | grep -qi "bug\|fix\|error\|issue\|problem"; then
        patterns="$patterns\n- Debugging/issue resolution"
    fi
    
    if echo "$conversation" | grep -qi "feature\|add\|implement\|create"; then
        patterns="$patterns\n- Feature development"
    fi
    
    if echo "$conversation" | grep -qi "refactor\|clean\|optimize\|improve"; then
        patterns="$patterns\n- Code optimization"
    fi
    
    if echo "$conversation" | grep -qi "test\|spec\|verify\|validation"; then
        patterns="$patterns\n- Testing/verification"
    fi
    
    # Default pattern if none detected
    if [ -z "$patterns" ]; then
        patterns="- General development"
    fi
    
    echo -e "$patterns"
}

# Create continuation prompt
create_continuation_prompt() {
    local topic_name="$1"
    local patterns="$2"
    
    local pattern_summary=$(echo "$patterns" | head -3 | sed 's/^- //g' | tr '\n' ', ' | sed 's/, $//')
    
    cat << EOF
Based on our conversation about $topic_name ($pattern_summary), continue with next steps or ask for clarification if unsure how to proceed.

[Memory context preserved. Previous conversation saved to topic memory system.]
EOF
}

# Main workflow
main() {
    log_info "Starting WZRD Compact Workflow"
    log_info "========================================"
    
    # Step 1: Detect topic
    log_info "Step 1: Detecting current topic..."
    local topic_info=$(detect_topic)
    local topic_hash=$(echo "$topic_info" | cut -d: -f1)
    local topic_name=$(echo "$topic_info" | cut -d: -f2)
    
    log_success "Topic detected: $topic_name ($topic_hash)"
    
    # Step 2: Extract conversation
    log_info "Step 2: Extracting conversation from OpenCode history..."
    local conversation=$(extract_conversation)
    
    if [ -z "$conversation" ]; then
        log_warn "No conversation found. Using empty conversation for memory."
        conversation="No conversation history available."
    else
        log_success "Extracted $(echo "$conversation" | wc -l) lines of conversation"
    fi
    
    # Step 3: Save to memory
    log_info "Step 3: Saving conversation to topic memory..."
    save_to_topic_memory "$topic_hash" "$topic_name" "$conversation"
    
    # Step 4: Extract patterns
    log_info "Step 4: Extracting patterns from conversation..."
    local patterns=$(extract_patterns "$conversation")
    log_success "Patterns extracted: $(echo "$patterns" | grep -c '^-' || echo 0) patterns"
    
    # Step 5: Create continuation prompt
    log_info "Step 5: Creating continuation prompt..."
    local continuation_prompt=$(create_continuation_prompt "$topic_name" "$patterns")
    
    log_info "Step 6: Workflow complete"
    log_info "========================================"
    
    # Output instructions
    echo ""
    echo "=== WZRD COMPACT WORKFLOW COMPLETE ==="
    echo ""
    echo "Topic: $topic_name"
    echo "Memory saved to: $TOPICS_PATH/$topic_hash/"
    echo ""
    echo "NEXT STEPS (Manual execution required):"
    echo "1. In OpenCode TUI, execute: /new"
    echo "   (This starts a fresh session with reset context)"
    echo ""
    echo "2. Use this continuation prompt:"
    echo "   \"$continuation_prompt\""
    echo ""
    echo "3. OpenCode will respond with fresh context"
    echo ""
    echo "Benefits:"
    echo "✅ Conversation saved to unified memory"
    echo "✅ TUI context reset (prevents slowdown)"
    echo "✅ Token-optimized continuation"
    echo "✅ Performance maintained over time"
    echo ""
    
    # Create automation script for next phase
    cat > "$WZRD_REDESIGN_PATH/compact-and-continue.sh" << EOF
#!/bin/bash
# Compact and continue - manual execution helper
echo "=== Compact and Continue Helper ==="
echo ""
echo "Topic: $topic_name"
echo "Memory: $TOPICS_PATH/$topic_hash/"
echo ""
echo "To execute:"
echo "1. Run '/new' in OpenCode TUI"
echo "2. Paste this prompt:"
echo ""
echo "$continuation_prompt"
echo ""
EOF
    
    chmod +x "$WZRD_REDESIGN_PATH/compact-and-continue.sh"
    
    log_success "Helper script created: $WZRD_REDESIGN_PATH/compact-and-continue.sh"
}

# Execute main workflow
main "$@"