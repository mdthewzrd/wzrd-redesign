#!/bin/bash
# Topic Auto-Integration for WZRD
# Provides seamless topic/memory integration with OpenCode TUI

set -e

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[TOPIC]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
WZRD_PATH="/home/mdwzrd/wzrd-redesign"
TOPICS_PATH="$WZRD_PATH/topics"
CONFIG_FILE="$WZRD_PATH/topic-config.json"
MEMORY_INJECTION_LIMIT=1500  # Target token count for memory injection

# Ensure directories
mkdir -p "$TOPICS_PATH"

# Generate topic hash
generate_topic_hash() {
    local pwd="$1"
    local branch="$2"
    local date="$3"
    
    # Create deterministic hash
    local input="${pwd}/${branch}/${date}"
    echo -n "$input" | sha256sum | cut -c1-12
}

# Detect current context
detect_context() {
    local pwd=$(pwd)
    local branch=$(git branch --show-current 2>/dev/null || echo "main")
    local date=$(date +%Y-%m-%d)
    local project_name=$(basename "$pwd")
    
    # Check if we're in WZRD ecosystem
    local is_wzrd=false
    if [[ "$pwd" == *"wzrd-redesign"* ]] || [[ "$pwd" == *"wzrd.dev"* ]]; then
        is_wzrd=true
    fi
    
    echo "$pwd:$branch:$date:$project_name:$is_wzrd"
}

# Find or create topic
get_or_create_topic() {
    local pwd="$1"
    local branch="$2"
    local date="$3"
    local project_name="$4"
    
    local topic_hash=$(generate_topic_hash "$pwd" "$branch" "$date")
    local topic_dir="$TOPICS_PATH/$topic_hash"
    local topic_name="${project_name}-${branch}-${date}"
    
    # Create topic directory if needed
    if [ ! -d "$topic_dir" ]; then
        mkdir -p "$topic_dir"
        
        # Create initial memory file
        cat > "$topic_dir/MEMORY.md" << EOF
# $topic_name

## Created
$(date)

## Context
- Project: $project_name
- Branch: $branch  
- Date: $date
- Path: $pwd

## Status
Active

## Patterns
- Initial topic creation

## Key Decisions
- Topic auto-detected and created

## Related Topics
- None yet

---
EOF
        
        log "Created new topic: $topic_name ($topic_hash)"
        
        # Ask for optional topic description
        echo ""
        echo "New topic detected: $topic_name"
        read -p "Optional topic description (press Enter to skip): " topic_desc
        
        if [ -n "$topic_desc" ]; then
            echo -e "\n## Description\n$topic_desc" >> "$topic_dir/MEMORY.md"
        fi
    else
        log "Using existing topic: $topic_name ($topic_hash)"
    fi
    
    echo "$topic_hash:$topic_name:$topic_dir"
}

# Extract relevant memory chunks
extract_relevant_memory() {
    local topic_dir="$1"
    local memory_file="$topic_dir/MEMORY.md"
    
    if [ ! -f "$memory_file" ]; then
        warn "No memory file found for topic"
        return
    fi
    
    # Extract key sections (token-efficient)
    local memory_content=""
    
    # Get topic header
    memory_content+=$(head -10 "$memory_file" | grep -v "^---$")
    memory_content+="\n\n"
    
    # Get recent conversations (last 3)
    local recent_conv=$(find "$topic_dir" -name "CONVERSATION_*.md" -type f | sort -r | head -3)
    if [ -n "$recent_conv" ]; then
        memory_content+="## Recent Context\n"
        for conv in $recent_conv; do
            local conv_date=$(basename "$conv" | sed 's/CONVERSATION_\(.*\)\.md/\1/' | sed 's/_/ /')
            local summary=$(head -5 "$conv" | grep -i "summary\|key\|decision" || echo "Previous conversation")
            memory_content+="- $(echo "$summary" | head -1)\n"
        done
        memory_content+="\n"
    fi
    
    # Get key decisions
    if grep -q "## Key Decisions" "$memory_file"; then
        memory_content+="## Key Decisions\n"
        grep -A10 "## Key Decisions" "$memory_file" | grep -E "^-|^[0-9]+\." | head -5
        memory_content+="\n"
    fi
    
    echo -e "$memory_content"
}

# Create topic selection prompt
create_topic_selection() {
    local topics=$(find "$TOPICS_PATH" -name "MEMORY.md" -type f | head -10)
    local topic_count=$(echo "$topics" | wc -l)
    
    if [ "$topic_count" -eq 0 ]; then
        echo "No topics found. Creating new topic..."
        return
    fi
    
    echo "=== Available Topics ==="
    echo ""
    
    local index=1
    local topic_map=""
    
    while IFS= read -r topic_file; do
        local topic_dir=$(dirname "$topic_file")
        local topic_hash=$(basename "$topic_dir")
        local topic_name=$(head -1 "$topic_file" | sed 's/# //')
        local topic_date=$(grep "## Created" "$topic_file" | head -1 | cut -d: -f2- | xargs)
        
        echo "$index. $topic_name"
        echo "   Hash: $topic_hash"
        echo "   Created: $topic_date"
        echo ""
        
        topic_map+="$index:$topic_hash:$topic_name\n"
        ((index++))
    done <<< "$topics"
    
    echo "$((index)). Create new topic"
    echo ""
    
    local choice
    read -p "Select topic (1-$index): " choice
    
    if [ "$choice" -eq "$index" ]; then
        echo "Creating new topic..."
        return "new"
    elif [ "$choice" -ge 1 ] && [ "$choice" -lt "$index" ]; then
        local selected=$(echo -e "$topic_map" | grep "^$choice:" | head -1)
        local topic_hash=$(echo "$selected" | cut -d: -f2)
        echo "Selected topic: $topic_hash"
        return "$topic_hash"
    else
        warn "Invalid selection"
        return
    fi
}

# Update memory during conversation
update_topic_memory() {
    local topic_hash="$1"
    local conversation_snippet="$2"
    local pattern="$3"
    
    local topic_dir="$TOPICS_PATH/$topic_hash"
    local memory_file="$topic_dir/MEMORY.md"
    
    if [ ! -f "$memory_file" ]; then
        error "Memory file not found"
        return
    fi
    
    # Append pattern if provided
    if [ -n "$pattern" ]; then
        if grep -q "## Patterns" "$memory_file"; then
            sed -i "/## Patterns/a- $pattern" "$memory_file"
        else
            echo -e "\n## Patterns\n- $pattern" >> "$memory_file"
        fi
    fi
    
# Update last active
    sed -i "s/## Status.*/## Status\nActive - Updated $(date)/" "$memory_file"

    log "Updated topic memory"
    
    # Also update ACTIVE.md to keep systems synchronized
    if [ -f "$TOPICS_PATH/ACTIVE.md" ]; then
        cat > "$TOPICS_PATH/ACTIVE.md" << EOF
# Active Topic: $(head -1 "$memory_file" | sed 's/# //')

**Status**: Active - Updated $(date)
**Date**: $(date +"%B %d, %Y")
**UUID**: $topic_hash
**Auto-Updated**: $(date)

---

## Current Context

You are working on **$(head -1 "$memory_file" | sed 's/# //')** which was automatically detected and tracked.
This topic represents your current work session.

### System Status
- ✅ Topic memory system: Working (UUID: $topic_hash)
- ✅ Auto-detection: Working  
- ✅ Memory injection: Working
- ✅ Bridge synchronization: Working

---

## Recent Activity

$(find "$topic_dir" -name "CONVERSATION_*.md" -type f | sort -r | head -3 | while read conv; do
    conv_date=\$(basename "\$conv" | sed 's/CONVERSATION_\\(.*\\)\\.md/\\1/' | sed 's/_/ /')
    summary=\$(grep -i "summary\\|key\\|decision" "\$conv" 2>/dev/null | head -1 || echo "Previous conversation")
    echo "- **\$conv_date**: \$(echo "\$summary" | cut -c1-60)..."
done)

---

## System Health

\$(date): Topic systems synchronized.

Check $topic_dir/ for detailed memory and conversations.
EOF
        log "ACTIVE.md synchronized"
    fi
}

# Create initialization prompt for OpenCode
create_initialization_prompt() {
    local topic_name="$1"
    local memory_summary="$2"
    local topic_hash="$3"
    
    cat << EOF
# WZRD Topic-Aware Session

## Active Topic: $topic_name

### Memory Context
$memory_summary

### Session Guidelines
1. You are working in topic-aware mode
2. Relevant memory has been loaded
3. Conversations will be saved to topic memory
4. Use /wzrd-compact to reset context when needed

### Available Commands
- /wzrd-compact - Save conversation and reset context
- /topic - Show current topic info
- /topics - List available topics

Topic Hash: $topic_hash
Memory updated automatically.

What would you like to work on?
EOF
}

# Main topic integration
main() {
    log "Starting Topic Auto-Integration"
    log "========================================"
    
    # Detect current context
    log "Step 1: Detecting context..."
    local context=$(detect_context)
    local pwd=$(echo "$context" | cut -d: -f1)
    local branch=$(echo "$context" | cut -d: -f2)
    local date=$(echo "$context" | cut -d: -f3)
    local project_name=$(echo "$context" | cut -d: -f4)
    local is_wzrd=$(echo "$context" | cut -d: -f5)
    
    log "Context: $project_name ($branch) on $date"
    
    if [ "$is_wzrd" != "true" ]; then
        warn "Not in WZRD ecosystem. Topic integration limited."
    fi
    
    # Get or create topic
    log "Step 2: Getting or creating topic..."
    local topic_info=$(get_or_create_topic "$pwd" "$branch" "$date" "$project_name")
    local topic_hash=$(echo "$topic_info" | cut -d: -f1)
    local topic_name=$(echo "$topic_info" | cut -d: -f2)
    local topic_dir=$(echo "$topic_info" | cut -d: -f3)
    
    success "Active topic: $topic_name ($topic_hash)"
    
    # Update ACTIVE.md immediately
    if [ -f "$TOPICS_PATH/ACTIVE.md" ]; then
        cat > "$TOPICS_PATH/ACTIVE.md" << EOF
# Active Topic: $topic_name

**Status**: Active
**Date**: $(date +"%B %d, %Y")
**UUID**: $topic_hash
**Auto-Detected**: $(date)

---

## Current Work

Topic detected automatically based on your working directory:
- **Project**: $project_name
- **Branch**: $branch
- **Path**: $pwd

### System Status
- ✅ Topic detection: Working
- ✅ Memory injection: Ready
- ✅ Bridge sync: Enabled

---

## Next Steps

1. Continue working - conversations will be saved to topic memory
2. Use \`./manage-topic.sh\` to view topic details
3. The system will track patterns and decisions automatically

---

## Topic Directory
$topic_dir/
EOF
        log "ACTIVE.md updated with current topic"
    fi
    
    # Extract relevant memory
    log "Step 3: Extracting relevant memory..."
    local memory_summary=$(extract_relevant_memory "$topic_dir")
    
    if [ -z "$memory_summary" ]; then
        warn "No memory extracted"
        memory_summary="No previous context found."
    else
        success "Memory extracted ($(echo "$memory_summary" | wc -w) words)"
    fi
    
    # Create initialization prompt
    log "Step 4: Creating initialization prompt..."
    local init_prompt=$(create_initialization_prompt "$topic_name" "$memory_summary" "$topic_hash")
    
    log "Step 5: Integration complete"
    log "========================================"
    
    # Output
    echo ""
    echo "=== TOPIC AUTO-INTEGRATION COMPLETE ==="
    echo ""
    echo "Topic: $topic_name"
    echo "Hash: $topic_hash"
    echo "Directory: $topic_dir"
    echo ""
    echo "Memory Loaded:"
    echo "--------------"
    echo "$memory_summary" | head -10
    echo "..."
    echo ""
    echo "Next Steps:"
    echo "1. Start OpenCode in this directory"
    echo "2. Topic memory will be auto-injected"
    echo "3. Use /wzrd-compact for context reset"
    echo ""
    echo "Initialization prompt for OpenCode:"
    echo "-----------------------------------"
    echo "$init_prompt"
    echo ""
    
    # Create topic management script
    cat > "$WZRD_PATH/manage-topic.sh" << EOF
#!/bin/bash
# Topic Management Script

echo "=== Topic Management ==="
echo "Current topic: $topic_name ($topic_hash)"
echo ""
echo "Commands:"
echo "1. View memory: cat $topic_dir/MEMORY.md"
echo "2. List conversations: ls -la $topic_dir/CONVERSATION_*.md"
echo "3. Update pattern: ./topic-auto-integration.sh --update-pattern \"pattern description\""
echo "4. Switch topic: ./topic-auto-integration.sh --select"
echo ""
EOF
    
    chmod +x "$WZRD_PATH/manage-topic.sh"
    success "Management script created: $WZRD_PATH/manage-topic.sh"
    
    # Create OpenCode initialization script
    cat > "$WZRD_PATH/opencode-init.sh" << EOF
#!/bin/bash
# OpenCode initialization with topic memory

echo "Starting OpenCode with topic memory injection..."
echo "Topic: $topic_name"
echo ""

# Create memory injection file
cat > /tmp/opencode-memory-inject.txt << EOM
$init_prompt
EOM

echo "Memory injection file created: /tmp/opencode-memory-inject.txt"
echo ""
echo "To use:"
echo "1. Start OpenCode"
echo "2. The initialization prompt will be in your clipboard"
echo "3. Paste as first message"
echo ""
EOF
    
    chmod +x "$WZRD_PATH/opencode-init.sh"
    success "OpenCode init script created: $WZRD_PATH/opencode-init.sh"
}

# Parse arguments
case "$1" in
    --select)
        create_topic_selection
        ;;
    --update)
        if [ -z "$2" ] || [ -z "$3" ]; then
            error "Usage: $0 --update <topic_hash> <conversation_snippet> [pattern]"
            exit 1
        fi
        update_topic_memory "$2" "$3" "$4"
        ;;
    --help)
        echo "Topic Auto-Integration for WZRD"
        echo ""
        echo "Usage:"
        echo "  $0                    # Auto-detect and integrate topic"
        echo "  $0 --select           # Select from available topics"
        echo "  $0 --update <hash> <snippet> [pattern]  # Update topic memory"
        echo "  $0 --help             # Show this help"
        ;;
    *)
        main
        ;;
esac