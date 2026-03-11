---
name: platform-integration
description: Edge.dev platform integration - upload scanners, run scans, retrieve results
category: integration
priority: P0
tags: [platform, edge-dev, scanner, scan, api]
---

# Platform Integration Skill

## Purpose
Allows the agent to communicate with the Edge.dev platform backend to:
1. Upload scanner code
2. Execute scans with parameters
3. Retrieve saved scan runs and results
4. Delete scans

## Configuration

```bash
# Platform backend URL (default)
PLATFORM_BASE_URL="http://localhost:8000"

# Claude authentication token
PLATFORM_CLAUDE_TOKEN="edge_claude_dev_2024"
```

## API Endpoints

### Health Check
```bash
GET /api/health
```

### Scanner Management

**Upload Scanner**
```bash
POST /api/scanners/upload
Authorization: Bearer {PLATFORM_CLAUDE_TOKEN}
Content-Type: application/json

{
  "code": "<full Python scanner code>",
  "name": "DailyGapScanner_v31",
  "description": "Gap-up detection with D-1 filters",
  "created_by": "claude"
}
```

**List Scanners**
```bash
GET /api/scanners
```

**Get Scanner Details**
```bash
GET /api/scanners/{scanner_id}
```

**Delete Scanner**
```bash
DELETE /api/scanners/{scanner_id}
Authorization: Bearer {PLATFORM_CLAUDE_TOKEN}
```

### Scan Execution

**Run Scan**
```bash
POST /api/scans/run
Content-Type: application/json

{
  "scanner_id": "scanner_82b56ae21b06",
  "parameters": {
    "d0_start": "2024-01-01",
    "d0_end": "2024-12-31",
    "price_min": 5.0,
    "price_max": 50.0,
    "adv20_min_usd": 5000000,
    ...
  }
}
```

**Get Scan Results**
```bash
GET /api/scans/{scan_id}/results
```

### Saved Scan Runs

**List Saved Scans**
```bash
GET /api/scans?limit=50&scanner_id={optional}
```

**Delete Saved Scan**
```bash
DELETE /api/scans/{scan_id}
Authorization: Bearer {PLATFORM_CLAUDE_TOKEN}
```

## Usage Examples

### Example 1: Upload a New Scanner

```python
import requests

PLATFORM_URL = "http://localhost:8000"
CLAUDE_TOKEN = "edge_claude_dev_2024"

scanner_code = """
class DailyGapScanner_v31:
    def __init__(self, api_key: str, d0_start: str, d0_end: str):
        # ... initialization
        pass

    def run_scan(self):
        # ... scan logic
        return []
"""

response = requests.post(
    f"{PLATFORM_URL}/api/scanners/upload",
    headers={
        "Authorization": f"Bearer {CLAUDE_TOKEN}",
        "Content-Type": "application/json"
    },
    json={
        "code": scanner_code,
        "name": "DailyGapScanner_v31",
        "description": "Gap-up detection with D-1 filters",
        "created_by": "claude"
    }
)

result = response.json()
print(f"Scanner uploaded: {result['scanner_id']}")
```

### Example 2: Run a Scan

```python
import requests

PLATFORM_URL = "http://localhost:8000"

response = requests.post(
    f"{PLATFORM_URL}/api/scans/run",
    headers={"Content-Type": "application/json"},
    json={
        "scanner_id": "scanner_82b56ae21b06",
        "parameters": {
            "d0_start": "2024-01-01",
            "d0_end": "2024-12-31",
            "price_min": 5.0,
            "price_max": 50.0,
            "adv20_min_usd": 5000000
        }
    }
)

result = response.json()
print(f"Scan ID: {result['scan_id']}")
print(f"Signals found: {result['signals_found']}")
print(f"Execution time: {result['execution_time']}s")
```

### Example 3: Retrieve Scan Results

```python
import requests

PLATFORM_URL = "http://localhost:8000"
scan_id = "scan_1709065600"

response = requests.get(f"{PLATFORM_URL}/api/scans/{scan_id}/results")
result = response.json()

print(f"Scanner: {result['scanner_name']}")
print(f"Status: {result['status']}")
print(f"Signals: {len(result['signals'])}")

for signal in result['signals']:
    print(f"  {signal['ticker']}: {signal['date']} - ${signal['close']}")
```

### Example 4: List Saved Scans

```python
import requests

PLATFORM_URL = "http://localhost:8000"

response = requests.get(f"{PLATFORM_URL}/api/scans?limit=20")
result = response.json()

print(f"Total scans: {result['count']}")
for scan in result['scans']:
    print(f"  {scan['scan_id']}: {scan['scanner_name']} ({scan['signals_found']} signals)")
```

## Claude Skill Integration

When invoked via Claude Skill tool, this skill provides:

1. **Platform Connection**: Verified connection to http://localhost:8000
2. **Scanner Upload**: Upload Python scanner code with metadata
3. **Scan Execution**: Run scans with custom parameters
4. **Results Retrieval**: Fetch and display scan results
5. **Scan Management**: List, view, and delete saved scans

## Response Format

**Upload Scanner Response:**
```json
{
  "scanner_id": "scanner_82b56ae21b06",
  "name": "DailyGapScanner_v31",
  "filename": "dailygapscanner_v31_scanner_82b56ae21b06.py",
  "status": "created",
  "message": "Scanner 'DailyGapScanner_v31' uploaded successfully"
}
```

**Run Scan Response:**
```json
{
  "success": true,
  "scan_id": "scan_1709065600",
  "message": "Scan completed with 42 results",
  "results": [...],
  "execution_time": 18.5,
  "signals_found": 42
}
```

**Get Scan Results Response:**
```json
{
  "scan_id": "scan_1709065600",
  "scanner_id": "scanner_82b56ae21b06",
  "scanner_name": "DailyGapScanner_v31",
  "parameters": {...},
  "status": "completed",
  "signals": [...],
  "metrics": {
    "total_signals": 42,
    "execution_time": 18.5,
    "unique_tickers": 28
  },
  "created_at": "2024-02-27T15:30:00Z"
}
```

## Error Handling

**401 Unauthorized**: Missing or invalid Claude token
**404 Not Found**: Scanner or scan not found
**400 Bad Request**: Invalid scanner code or parameters
**500 Internal Error**: Backend processing error

## Platform UI Access

After uploading scanners or running scans, view results at:
- **Dashboard**: http://localhost:5665
- **Scan results**: Automatically loaded in the "Saved Scans" section

## Notes

- Scan runs are persisted in SQLite database at `/home/mdwzrd/wzrd.dev/projects/edge.dev/data/scans.db`
- Scanner files are stored at `/home/mdwzrd/edge.dev/scanners/`
- Claude token is currently hardcoded (use secure storage in production)
- All scan runs with status "completed" are displayed in the platform UI
