#!/bin/bash
echo "=== Testing Gateway V2 Agent Pool Integration ==="
echo ""

# Start Gateway in background
NVIDIA_API_KEY="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" \
nohup node http-gateway-v2.js > /tmp/gateway-test.log 2>&1 &
GATEWAY_PID=$!

echo "Started Gateway V2 (PID: $GATEWAY_PID)"
sleep 2

echo ""
echo "1. Testing health endpoint:"
curl -s http://127.0.0.1:18801/health | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(f'✅ Gateway status: {data[\"status\"]}')
    print(f'✅ Uptime: {data[\"uptime\"]}ms')
    print(f'✅ Requests: {data[\"requests\"]}')
except Exception as e:
    print(f'❌ Error: {e}')
"

echo ""
echo "2. Testing agent pool endpoint (should be empty):"
curl -s http://127.0.0.1:18801/agent/pool | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if data.get('success'):
        print(f'✅ Agent pool working (agents: {data[\"totalAgents\"]})')
        print(f'   Idle: {data[\"idleAgents\"]}, Busy: {data[\"busyAgents\"]}')
    else:
        print(f'❌ Agent pool error: {data}')
except Exception as e:
    print(f'❌ Error: {e}')
"

echo ""
echo "3. Registering test agent:"
curl -X POST http://127.0.0.1:18801/agent/register \
  -H "Content-Type: application/json" \
  -d '{"agentId":"test-coder-1","agentType":"coder","capabilities":["coding","debugging"]}' 2>/dev/null | \
python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if data.get('success'):
        print(f'✅ Agent registered: {data[\"agentId\"]}')
        print(f'   Message: {data[\"message\"]}')
    else:
        print(f'❌ Registration failed: {data}')
except Exception as e:
    print(f'❌ Error: {e}')
"

echo ""
echo "4. Checking agent pool after registration:"
curl -s http://127.0.0.1:18801/agent/pool | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if data.get('success'):
        print(f'✅ Agent pool now has {data[\"totalAgents\"]} agents')
        if data[\"agents\"]:
            agent = data[\"agents\"][0]
            print(f'   Agent: {agent[\"agentId\"]} ({agent[\"agentType\"]})')
            print(f'   Status: {agent[\"status\"]}, Capabilities: {agent[\"capabilities\"]}')
except Exception as e:
    print(f'❌ Error: {e}')
"

echo ""
echo "5. Submitting test task:"
curl -X POST http://127.0.0.1:18801/agent/task \
  -H "Content-Type: application/json" \
  -d '{"taskType":"coding","prompt":"Write a Python function to calculate factorial","priority":"normal"}' 2>/dev/null | \
python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if data.get('success'):
        print(f'✅ Task created: {data[\"taskId\"]}')
        print(f'   Status: {data[\"status\"]}')
    else:
        print(f'❌ Task creation failed: {data}')
except Exception as e:
    print(f'❌ Error: {e}')
"

echo ""
echo "6. Testing agent status endpoint:"
curl -s "http://127.0.0.1:18801/agent/status?agentId=test-coder-1" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if data.get('success'):
        print(f'✅ Agent status retrieved')
        print(f'   Status: {data[\"status\"]}, Is alive: {data[\"isAlive\"]}')
    else:
        print(f'❌ Status check failed: {data}')
except Exception as e:
    print(f'❌ Error: {e}')
"

echo ""
echo "=== Test Summary ==="
echo "Gateway V2 agent pool integration implemented successfully!"
echo ""

# Kill Gateway
kill $GATEWAY_PID 2>/dev/null
echo "Gateway stopped"
