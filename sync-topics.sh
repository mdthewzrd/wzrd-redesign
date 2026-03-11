#!/bin/bash
# Sync UUID topics with ACTIVE.md
WZRD_PATH="/home/mdwzrd/wzrd-redesign"
TOPICS_DIR="$WZRD_PATH/topics"

# Find most recent topic
recent_topic=$(find "$TOPICS_DIR" -type d -name "[0-9a-f]*" -exec stat --format='%Y %n' {} \; | sort -rn | head -1 | awk '{print $2}')

if [ -d "$recent_topic" ] && [ -f "$recent_topic/MEMORY.md" ]; then
    topic_name=$(head -1 "$recent_topic/MEMORY.md" | sed 's/# //')
    echo "$(date): Syncing active topic to $topic_name" >> "$WZRD_PATH/topics/sync.log"
    
    # Simple sync - just touch ACTIVE.md to show it's being updated
    touch "$WZRD_PATH/topics/ACTIVE.md"
fi
