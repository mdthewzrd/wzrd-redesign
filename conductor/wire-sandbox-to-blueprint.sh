#!/bin/bash
# WZRD.dev - Wire Sandbox to Blueprint Integration Script
# This script automatically adds the integration code to sandbox-engine.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SANDBOX_ENGINE="${SCRIPT_DIR}/sandbox-engine.sh"
BACKUP_FILE="${SANDBOX_ENGINE}.backup-before-wiring"

echo "=========================================="
echo "WZRD.dev: Wiring Sandbox → Blueprint"
echo "=========================================="
echo ""

# Check if sandbox-engine.sh exists
if [ ! -f "$SANDBOX_ENGINE" ]; then
    echo "ERROR: sandbox-engine.sh not found at $SANDBOX_ENGINE"
    exit 1
fi

# Create backup
echo "✓ Creating backup..."
cp "$SANDBOX_ENGINE" "$BACKUP_FILE"
echo "  Backup saved to: $BACKUP_FILE"
echo ""

# Find the line with "Sandbox created successfully"
echo "✓ Searching for sandbox creation point..."
LINE_NUMBER=$(grep -n "Sandbox created successfully" "$SANDBOX_ENGINE" | head -1 | cut -d: -f1)

if [ -z "$LINE_NUMBER" ]; then
    echo "ERROR: Could not find 'Sandbox created successfully' in sandbox-engine.sh"
    echo "Manual intervention required."
    exit 1
fi

echo "  Found at line: $LINE_NUMBER"
echo ""

# Create the integration code block
INTEGRATION_CODE='
# ============================================
# WZRD.dev Integration: Create job & trigger blueprint
# ============================================
echo "Creating WZRD.dev job..."

# Get the script directory for relative paths
WZRD_SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Create job in SQLite
JOB_ID=$(python3 "${WZRD_SCRIPT_DIR}/lib/db.py" save-job "$TOPIC" "${SANDBOX_TYPE}-blueprint")
echo "Job created: $JOB_ID"

# Link sandbox to job
python3 "${WZRD_SCRIPT_DIR}/lib/db.py" link-sandbox "$JOB_ID" "$SANDBOX_ID"

# Register sandbox in database
python3 "${WZRD_SCRIPT_DIR}/lib/db.py" register-sandbox "$SANDBOX_ID" "$JOB_ID" "$PROJECT_PATH" "$SANDBOX_TYPE"

# Update job status to running
python3 "${WZRD_SCRIPT_DIR}/lib/db.py" update-status "$JOB_ID" "running"

# Trigger blueprint execution (background)
echo "Triggering blueprint..."
"${WZRD_SCRIPT_DIR}/blueprint-engine.sh" execute "$JOB_ID" "$TOPIC" "$SANDBOX_ID" &
# ============================================
'

# Insert the code after the "Sandbox created successfully" line
echo "✓ Inserting integration code..."

# Create a temporary file with the new content
awk -v line="$LINE_NUMBER" -v code="$INTEGRATION_CODE" '
NR == line {
    print $0
    print code
    next
}
{ print }
' "$SANDBOX_ENGINE" > "${SANDBOX_ENGINE}.tmp"

mv "${SANDBOX_ENGINE}.tmp" "$SANDBOX_ENGINE"

echo "  Integration code inserted successfully"
echo ""

# Make sure the script is still executable
chmod +x "$SANDBOX_ENGINE"

echo "=========================================="
echo "✓ Wiring Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Test the integration:"
echo "   ./sandbox-engine.sh create ./test-project"
echo ""
echo "2. Check if job was created:"
echo "   python3 lib/db.py list-active"
echo ""
echo "3. You should see a new job with status 'running'"
echo ""
echo "Backup saved to: $BACKUP_FILE"
echo ""
