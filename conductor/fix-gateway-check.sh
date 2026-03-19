#!/bin/bash
# Quick fix for Gateway health check

# Test Gateway directly
echo "Testing Gateway V2 health endpoint..."
curl -s http://127.0.0.1:18801/health | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if 'status' in data:
        print(f'Gateway status: {data[\"status\"]}')
        print(f'Uptime: {data[\"uptime\"]}ms')
        print(f'Requests: {data[\"requests\"]}')
        print(f'Sessions: {data[\"sessions\"][\"totalSessions\"]}')
        print('✅ Gateway is healthy')
    else:
        print('❌ Gateway response missing status field')
except Exception as e:
    print(f'❌ Error: {e}')
"

# Test agent pool
echo ""
echo "Testing agent pool endpoint..."
curl -s http://127.0.0.1:18801/agent/pool | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if 'agents' in data:
        count = len(data['agents'])
        print(f'Active agents: {count}')
        for agent in data['agents']:
            print(f'  - {agent[\"agentId\"]} ({agent[\"agentType\"]}) - {agent[\"status\"]}')
    else:
        print('Agent pool response:', json.dumps(data, indent=2))
except Exception as e:
    print(f'❌ Error: {e}')
"
