#!/bin/bash
# Agent startup script for sandbox

set -e

AGENT_DIR="$(cd "$(dirname "$0")" && pwd)"
SANDBOX_PATH="$(dirname "$AGENT_DIR")"
CONFIG_FILE="$AGENT_DIR/agent-config.yaml"

# Load configuration using Python yaml module
AGENT_ID=$(python3 -c "
import yaml, sys
with open('$CONFIG_FILE') as f:
    data = yaml.safe_load(f)
    print(data.get('agent', {}).get('id', ''))
")
BLUEPRINT=$(python3 -c "
import yaml, sys
with open('$CONFIG_FILE') as f:
    data = yaml.safe_load(f)
    print(data.get('blueprint_execution', {}).get('blueprint', ''))
")

echo "Starting agent $AGENT_ID for blueprint: $BLUEPRINT"
echo "Sandbox path: $SANDBOX_PATH"
echo "Started at: $(date)"

# Update status using Python
python3 -c "
import yaml, sys
with open('$CONFIG_FILE', 'r') as f:
    data = yaml.safe_load(f)

if 'blueprint_execution' not in data:
    data['blueprint_execution'] = {}
    
data['blueprint_execution']['started_at'] = '$(date)'
data['blueprint_execution']['status'] = 'running'

with open('$CONFIG_FILE', 'w') as f:
    yaml.dump(data, f, default_flow_style=False)
"

# Navigate to sandbox
cd "$SANDBOX_PATH"

# Load OpenCode/Claude agent environment
# This is where we'd integrate with OpenCode runtime
export WZRD_AGENT_ID="$AGENT_ID"
export WZRD_SANDBOX_PATH="$SANDBOX_PATH"
export WZRD_BLUEPRINT="$BLUEPRINT"

# For now, simulate agent startup
echo "Agent environment ready"
echo "Would launch OpenCode agent here..."
echo "Agent ID: $AGENT_ID"
echo "Press Ctrl+C to stop"

# Simulate agent running
while true; do
    echo "[$(date)] Agent $AGENT_ID active in $SANDBOX_PATH"
    sleep 60
done
