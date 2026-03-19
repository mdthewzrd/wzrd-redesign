#!/bin/bash
echo "Stopping agent: real-integrated-agent"
pkill -f "agent.sh.*real-integrated-agent" 2>/dev/null && echo "Agent stopped" || echo "Agent not running"
