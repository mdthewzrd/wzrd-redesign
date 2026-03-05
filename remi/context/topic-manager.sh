#!/bin/bash

# Enhanced Remi Topic Management System
# Phase 0: Track multiple topics in parallel with state synchronization

TOPICS_DIR="/home/mdwzrd/wzrd-redesign/topics"
CONTEXT_DIR="/home/mdwzrd/wzrd-redesign/remi/context"
LOG_DIR="/home/mdwzrd/wzrd-redesign/logs"

# Create directories if they don't exist
mkdir -p "$TOPICS_DIR"
mkdir -p "$CONTEXT_DIR"
mkdir -p "$LOG_DIR"

# Function to create a new topic
create_topic() {
    local topic_name="$1"
    local description="${2:-New topic}"
    local category="${3:-general}"
    local timestamp=$(date -Iseconds)
    
    # Sanitize topic name for filename
    local safe_name=$(echo "$topic_name" | sed 's/[^a-zA-Z0-9_-]/-/g' | tr -s '-' | head -c 50)
    
    # Create topic directory
    local topic_dir="$TOPICS_DIR/$safe_name"
    mkdir -p "$topic_dir"
    
    # Create topic metadata
    cat > "$topic_dir/topic.md" << TOPIC_EOF
---
topic_name: $topic_name
safe_name: $safe_name
description: $description
category: $category
created: $timestamp
status: active
last_active: $timestamp
---

# Topic: $topic_name

## Description
$description

## State
- Status: Active
- Active Since: $timestamp
- Last Updated: $timestamp

## Notes
(Topic-specific notes and progress)

## Progress Tracking
- Initial setup completed
TOPIC_EOF
    
    # Create context file
    touch "$CONTEXT_DIR/${safe_name}.context"
    
    # Create activity log
    touch "$topic_dir/activity.log"
    
    echo "Created topic: $topic_name ($safe_name)"
    echo "$(date -Iseconds)|create_topic|$topic_name|$safe_name" >> "$LOG_DIR/topic-manager.log"
    
    return 0
}

# Function to get active topics
list_topics() {
    if [ ! -d "$TOPICS_DIR" ] || [ -z "$(ls -A $TOPICS_DIR 2>/dev/null)" ]; then
        echo "No topics found"
        return 1
    fi
    
    echo "=== Active Topics ==="
    echo ""
    
    for topic_dir in "$TOPICS_DIR"/*/; do
        if [ -f "$topic_dir/topic.md" ]; then
            local topic_name
            topic_name=$(grep "^topic_name:" "$topic_dir/topic.md" | cut -d':' -f2- | xargs)
            local safe_name
            safe_name=$(grep "^safe_name:" "$topic_dir/topic.md" | cut -d':' -f2- | xargs)
            local status
            status=$(grep "^status:" "$topic_dir/topic.md" | cut -d':' -f2- | xargs)
            local last_active
            last_active=$(grep "^last_active:" "$topic_dir/topic.md" | cut -d':' -f2- | xargs)
            
            echo "• $topic_name ($safe_name)"
            echo "  Status: $status | Last Active: $last_active"
        fi
    done
}

# Function to get topic details
get_topic() {
    local topic_name="$1"
    
    # Find topic by safe name
    local topic_dir=""
    for tdir in "$TOPICS_DIR"/*/; do
        if [ -f "$tdir/topic.md" ]; then
            local t_name
            t_name=$(grep "^safe_name:" "$tdir/topic.md" | cut -d':' -f2- | xargs)
            if [ "$t_name" = "$topic_name" ] || [ "$(grep "^topic_name:" "$tdir/topic.md" | cut -d':' -f2- | xargs)" = "$topic_name" ]; then
                topic_dir="$tdir"
                break
            fi
        fi
    done
    
    if [ -z "$topic_dir" ] || [ ! -f "$topic_dir/topic.md" ]; then
        echo "Topic not found: $topic_name"
        return 1
    fi
    
    echo "=== Topic Details: $topic_name ==="
    cat "$topic_dir/topic.md"
    echo ""
    echo "---"
    echo ""
    
    if [ -f "$topic_dir/activity.log" ]; then
        echo "=== Recent Activity ==="
        tail -20 "$topic_dir/activity.log"
    fi
}

# Function to update topic state
update_topic() {
    local topic_name="$1"
    local state_field="$2"
    local state_value="${3:-}"
    local timestamp=$(date -Iseconds)
    
    # Find topic
    local topic_dir=""
    for tdir in "$TOPICS_DIR"/*/; do
        if [ -f "$tdir/topic.md" ]; then
            local t_name
            t_name=$(grep "^safe_name:" "$tdir/topic.md" | cut -d':' -f2- | xargs)
            if [ "$t_name" = "$topic_name" ] || [ "$(grep "^topic_name:" "$tdir/topic.md" | cut -d':' -f2- | xargs)" = "$topic_name" ]; then
                topic_dir="$tdir"
                break
            fi
        fi
    done
    
    if [ -z "$topic_dir" ] || [ ! -f "$topic_dir/topic.md" ]; then
        echo "Topic not found: $topic_name"
        return 1
    fi
    
    # Update the topic.md file
    if [ -n "$state_field" ] && [ -n "$state_value" ]; then
        # Update specific field
        if grep -q "^$state_field:" "$topic_dir/topic.md"; then
            sed -i "s/^$state_field:.*$/$state_field: $state_value/" "$topic_dir/topic.md"
        else
            echo "$state_field: $state_value" >> "$topic_dir/topic.md"
        fi
    fi
    
    # Update last_active
    sed -i "s/^last_active:.*/last_active: $timestamp/" "$topic_dir/topic.md"
    
    # Update status to active
    sed -i "s/^status:.*/status: active/" "$topic_dir/topic.md"
    
    # Log activity
    echo "$(date -Iseconds)|update|$topic_name|$state_field=${state_value:-"[value]"}" >> "$topic_dir/activity.log"
    echo "$(date -Iseconds)|update|$topic_name" >> "$LOG_DIR/topic-manager.log"
    
    echo "Updated topic: $topic_name"
    return 0
}

# Function to add topic note
add_topic_note() {
    local topic_name="$1"
    local note="$2"
    
    # Find topic
    local topic_dir=""
    for tdir in "$TOPICS_DIR"/*/; do
        if [ -f "$tdir/topic.md" ]; then
            local t_name
            t_name=$(grep "^safe_name:" "$tdir/topic.md" | cut -d':' -f2- | xargs)
            if [ "$t_name" = "$topic_name" ] || [ "$(grep "^topic_name:" "$tdir/topic.md" | cut -d':' -f2- | xargs)" = "$topic_name" ]; then
                topic_dir="$tdir"
                break
            fi
        fi
    done
    
    if [ -z "$topic_dir" ] || [ ! -f "$topic_dir/topic.md" ]; then
        echo "Topic not found: $topic_name"
        return 1
    fi
    
    local timestamp=$(date -Iseconds)
    
    # Add to Notes section
    sed -i "/^## Notes/a ## Note $(date +%Y-%m-%d) $timestamp\n\n$note\n" "$topic_dir/topic.md"
    
    # Also add to activity log
    echo "Note: $note" >> "$topic_dir/activity.log"
    
    echo "Added note to topic: $topic_name"
}

# Function to search topics
search_topics() {
    local query="$1"
    
    echo "=== Search Results for: '$query' ==="
    echo ""
    
    local matches=0
    local topic_dir
    local content
    local topic_name
    local status
    
    for topic_dir in "$TOPICS_DIR"/*/; do
        if [ -f "$topic_dir/topic.md" ]; then
            content=$(cat "$topic_dir/topic.md")
            if echo "$content" | grep -i -q "$query"; then
                topic_name=$(grep "^topic_name:" "$topic_dir/topic.md" | cut -d':' -f2- | xargs)
                status=$(grep "^status:" "$topic_dir/topic.md" | cut -d':' -f2- | xargs)
                echo "• $topic_name (Status: $status)"
                matches=$((matches + 1))
            fi
        fi
    done
    
    echo ""
    echo "Found $matches matching topics"
}

# Function to show statistics
stats() {
    echo "=== Topic Manager Statistics ==="
    echo ""
    
    local topic_dir
    local total_count=0
    local active_count=0
    local last_active
    local topic_name
    
    for topic_dir in "$TOPICS_DIR"/*/; do
        if [ -f "$topic_dir/topic.md" ]; then
            total_count=$((total_count + 1))
            if grep -q "^status: active" "$topic_dir/topic.md"; then
                active_count=$((active_count + 1))
            fi
        fi
    done
    
    echo "Total topics: $total_count"
    echo "Active topics: $active_count"
    echo ""
    
    # Show recently updated topics
    if [ $total_count -gt 0 ]; then
        echo "Recently Updated Topics:"
        for topic_dir in "$TOPICS_DIR"/*/; do
            if [ -f "$topic_dir/topic.md" ]; then
                last_active=$(grep "^last_active:" "$topic_dir/topic.md" | cut -d':' -f2- | xargs)
                topic_name=$(grep "^topic_name:" "$topic_dir/topic.md" | cut -d':' -f2- | xargs)
                echo "  • $topic_name - $last_active"
            fi
        done
    fi
}

# Main command handler
case "$1" in
    "create")
        if [ -n "$2" ]; then
            create_topic "$2" "${3:-New topic}" "${4:-general}"
        else
            echo "Usage: $0 create <topic_name> [description] [category]"
            echo "Categories: general, coding, research, projects, strategy"
        fi
        ;;
    "list")
        list_topics
        ;;
    "get")
        if [ -n "$2" ]; then
            get_topic "$2"
        else
            echo "Usage: $0 get <topic_name>"
        fi
        ;;
    "update")
        if [ -n "$2" ] && [ -n "$3" ]; then
            update_topic "$2" "$3" "${4:-}"
        else
            echo "Usage: $0 update <topic_name> <field> [value]"
        fi
        ;;
    "note")
        if [ -n "$2" ]; then
            add_topic_note "$2" "${3:-}"
        else
            echo "Usage: $0 note <topic_name> [note_text]"
        fi
        ;;
    "search")
        if [ -n "$2" ]; then
            search_topics "$2"
        else
            echo "Usage: $0 search <query>"
        fi
        ;;
    "stats")
        stats
        ;;
    "test")
        echo "Testing topic management system..."
        echo ""
        echo "1. Creating test topic..."
        create_topic "phase0-implementation" "Testing topic management" "general"
        echo ""
        echo "2. Listing all topics..."
        list_topics
        echo ""
        echo "3. Getting topic details..."
        get_topic "phase0-implementation"
        echo ""
        echo "4. Updating topic state..."
        update_topic "phase0-implementation" "progress" "0 of 6 tasks completed"
        echo ""
        echo "5. Adding topic note..."
        add_topic_note "phase0-implementation" "Testing topic note functionality"
        echo ""
        echo "6. Searching for topics..."
        search_topics "implementation"
        echo ""
        echo "7. Show topic statistics..."
        stats
        ;;
    *)
        echo "Enhanced Remi Topic Management System"
        echo "Phase 0: Multi-topic tracking with state synchronization"
        echo ""
        echo "Usage: $0 {create|list|get|update|note|search|stats|test}"
        echo ""
        echo "Commands:"
        echo "  create <name> [desc] [cat]     Create new topic"
        echo "  list                           List all active topics"
        echo "  get <name>                     Get topic details"
        echo "  update <name> <field> [val]    Update topic state"
        echo "  note <name> [text]             Add topic note"
        echo "  search <query>                 Search topics"
        echo "  stats                          Show statistics"
        echo "  test                           Run test scenario"
        ;;
esac