#!/bin/bash
# Bridge between Discord logs and WZRD job creation

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_FILE="${SCRIPT_DIR}/logs/discord-job-bridge.log"

# Monitor Discord log for new messages
tail -f "${SCRIPT_DIR}/../logs/discord.log" | while read line; do
    # Look for message patterns
    if echo "$line" | grep -q "Received message:"; then
        # Extract channel and message
        CHANNEL=$(echo "$line" | sed -n 's/.*channel: \([^,]*\).*/\1/p')
        MESSAGE=$(echo "$line" | sed -n 's/.*content: "\([^"]*\)".*/\1/p')
        
        if [ -n "$CHANNEL" ] && [ -n "$MESSAGE" ]; then
            echo "$(date): Processing Discord message from $CHANNEL: $MESSAGE" >> "$LOG_FILE"
            
            # Create job for non-command messages (not starting with !)
            if [[ ! "$MESSAGE" =~ ^! ]]; then
                TOPIC="discord-$CHANNEL: $MESSAGE"
                JOB_ID=$(python3 "${SCRIPT_DIR}/lib/db.py" save-job "$TOPIC" "discord-blueprint")
                echo "$(date): Created job $JOB_ID for Discord message" >> "$LOG_FILE"
                
                # Trigger blueprint
                "${SCRIPT_DIR}/blueprint-engine.sh" execute "$JOB_ID" "$TOPIC" "discord-$CHANNEL" &
            fi
        fi
    fi
done
