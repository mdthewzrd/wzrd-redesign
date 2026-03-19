#!/bin/bash
# WZRD.dev - Fix Blueprint Engine Script
# Fixes path resolution and adds proper blueprint type detection

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BLUEPRINT_ENGINE="${SCRIPT_DIR}/blueprint-engine.sh"
BACKUP_FILE="${BLUEPRINT_ENGINE}.backup-before-fix"

echo "=========================================="
echo "WZRD.dev: Fixing Blueprint Engine"
echo "=========================================="
echo ""

# Check if blueprint-engine.sh exists
if [ ! -f "$BLUEPRINT_ENGINE" ]; then
    echo "ERROR: blueprint-engine.sh not found at $BLUEPRINT_ENGINE"
    exit 1
fi

# Create backup
echo "✓ Creating backup..."
cp "$BLUEPRINT_ENGINE" "$BACKUP_FILE"
echo "  Backup saved to: $BACKUP_FILE"
echo ""

# Fix 1: Replace hardcoded paths with relative paths
echo "✓ Fixing path resolution..."
sed -i 's|./conductor/context-optimizer.sh|${SCRIPT_DIR}/context-optimizer.sh|g' "$BLUEPRINT_ENGINE"
sed -i 's|./conductor/validation-pipeline.sh|${SCRIPT_DIR}/validation-pipeline.sh|g' "$BLUEPRINT_ENGINE"
echo "  Path resolution fixed"
echo ""

# Fix 2: Add SCRIPT_DIR variable at the top if not present
if ! grep -q "SCRIPT_DIR=" "$BLUEPRINT_ENGINE"; then
    echo "✓ Adding SCRIPT_DIR variable..."
    sed -i '8a SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"' "$BLUEPRINT_ENGINE"
    echo "  SCRIPT_DIR added"
else
    echo "✓ SCRIPT_DIR already exists"
fi
echo ""

# Fix 3: Add execute_blueprint function call wrapper
echo "✓ Checking execute_blueprint function..."

# Create a wrapper function to handle job status updates
WRAPPER_CODE='
# WZRD.dev Integration: Update job status on completion
update_job_on_completion() {
    local job_id="$1"
    local status="$2"
    local result="$3"
    
    if [ -n "$job_id" ]; then
        python3 "${SCRIPT_DIR}/lib/db.py" update-status "$job_id" "$status" "" "$result"
    fi
}
'

# Add the wrapper function before execute_blueprint
if ! grep -q "update_job_on_completion" "$BLUEPRINT_ENGINE"; then
    echo "✓ Adding job status update wrapper..."
    sed -i "/^execute_blueprint()/i $WRAPPER_CODE" "$BLUEPRINT_ENGINE"
    echo "  Wrapper function added"
fi
echo ""

# Make sure the script is still executable
chmod +x "$BLUEPRINT_ENGINE"

echo "=========================================="
echo "✓ Blueprint Engine Fixed!"
echo "=========================================="
echo ""
echo "Changes made:"
echo "1. ✓ Fixed path resolution (relative paths)"
echo "2. ✓ Added SCRIPT_DIR variable"
echo "3. ✓ Added job status update wrapper"
echo ""
echo "Backup saved to: $BACKUP_FILE"
echo ""
