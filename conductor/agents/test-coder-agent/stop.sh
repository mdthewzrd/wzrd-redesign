#!/bin/bash
echo "Stopping agent: test-coder-agent"
pkill -f "agent.sh.*test-coder-agent" 2>/dev/null && echo "Agent stopped" || echo "Agent not running"
