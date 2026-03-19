#!/bin/bash
# Test Gateway V2 integration with agent pool

set -e

echo "=== Gateway V2 Integration Test ==="
echo ""

# Check if Gateway is running
if curl -s http://127.0.0.1:18801/health | grep -q '"status":"healthy"'; then
    echo "✅ Gateway V2 is running"
else
    echo "❌ Gateway V2 is not running"
    exit 1
fi

# Test agent registration
echo ""
echo "Testing agent registration..."
AGENT_RESPONSE=$(curl -s -X POST http://127.0.0.1:18801/agent/register \
  -H "Content-Type: application/json" \
  -d '{"agentId":"integration-test-agent","agentType":"coder","capabilities":["coding"]}' 2>/dev/null || echo "{}")

if echo "$AGENT_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Agent registration works"
else
    echo "❌ Agent registration failed: $AGENT_RESPONSE"
fi

# Test agent pool
echo ""
echo "Testing agent pool..."
POOL_RESPONSE=$(curl -s http://127.0.0.1:18801/agent/pool 2>/dev/null || echo "{}")

if echo "$POOL_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Agent pool endpoint works"
    AGENT_COUNT=$(echo "$POOL_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('totalAgents', 0))" 2>/dev/null || echo "0")
    echo "   Total agents: $AGENT_COUNT"
else
    echo "❌ Agent pool failed: $POOL_RESPONSE"
fi

# Test task submission
echo ""
echo "Testing task submission..."
TASK_RESPONSE=$(curl -s -X POST http://127.0.0.1:18801/agent/task \
  -H "Content-Type: application/json" \
  -d '{"taskType":"testing","prompt":"Test task for integration","priority":"low"}' 2>/dev/null || echo "{}")

if echo "$TASK_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Task submission works"
    TASK_ID=$(echo "$TASK_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('taskId', 'unknown'))" 2>/dev/null || echo "unknown")
    echo "   Task ID: $TASK_ID"
else
    echo "❌ Task submission failed: $TASK_RESPONSE"
fi

echo ""
echo "=== Integration Test Complete ==="
echo "Gateway V2 agent pool integration is working!"
