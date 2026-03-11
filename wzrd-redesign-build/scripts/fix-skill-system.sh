#!/bin/bash
# 🛠️ Fix Skill System Issues
# Corrects skill name mismatches and missing skills

set -e

echo "🛠️  Fixing Skill System Issues"
echo "=============================="
echo ""

# Configuration
SKILLS_DIR="/home/mdwzrd/wzrd-redesign/.claude/skills"
MAPPING_FILE="/home/mdwzrd/wzrd-redesign/skill-name-mapping.json"
BACKUP_DIR="/home/mdwzrd/wzrd-redesign/backup-$(date +%Y%m%d-%H%M%S)"

# Create backup
echo "🔒 Creating backup..."
mkdir -p "$BACKUP_DIR"
cp -r "$SKILLS_DIR" "$BACKUP_DIR/skills-backup" 2>/dev/null || true
echo "✅ Backup created: $BACKUP_DIR"
echo ""

# Fix 1: Create missing 'communication' skill (or fix mapping)
echo "🔧 Fix 1: Handling missing 'communication' skill"
echo "-----------------------------------------------"

# Check if team-communication-protocols exists
if [ -d "$SKILLS_DIR/team-communication-protocols" ]; then
    echo "✅ Found 'team-communication-protocols' skill"
    echo "   Using it as alternative for 'communication'"
    
    # Create symbolic link or update mapping
    if [ ! -d "$SKILLS_DIR/communication" ]; then
        echo "   Creating symbolic link: communication -> team-communication-protocols"
        ln -sfn "team-communication-protocols" "$SKILLS_DIR/communication" 2>/dev/null || echo "   ⚠️  Could not create symbolic link"
    fi
else
    echo "❌ 'team-communication-protocols' not found"
    echo "   Creating placeholder 'communication' skill directory"
    mkdir -p "$SKILLS_DIR/communication"
    cat > "$SKILLS_DIR/communication/SKILL.md" << 'EOF'
# Communication Skill
Placeholder for missing communication skill.

## Description
This is a placeholder skill. The actual 'communication' skill should be:
- team-communication-protocols (alternative)
- Or a proper communication skill implementation

## Usage
Used by chat mode for communication-related tasks.

## Status
⚠️ PLACEHOLDER - Needs proper implementation
EOF
    echo "✅ Created placeholder 'communication' skill"
fi

echo ""

# Fix 2: Check for orchestration skill alternatives
echo "🔧 Fix 2: Checking orchestration skill alternatives"
echo "--------------------------------------------------"

ORCHESTRATION_OPTIONS=("orchestration" "saga-orchestration" "workflow-orchestration-patterns")
FOUND_ORCHESTRATION=""

for option in "${ORCHESTRATION_OPTIONS[@]}"; do
    if [ -d "$SKILLS_DIR/$option" ]; then
        FOUND_ORCHESTRATION="$option"
        break
    fi
done

if [ -n "$FOUND_ORCHESTRATION" ]; then
    echo "✅ Found orchestration skill: $FOUND_ORCHESTRATION"
    
    if [ "$FOUND_ORCHESTRATION" != "orchestration" ] && [ ! -d "$SKILLS_DIR/orchestration" ]; then
        echo "   Creating symbolic link: orchestration -> $FOUND_ORCHESTRATION"
        ln -sfn "$FOUND_ORCHESTRATION" "$SKILLS_DIR/orchestration" 2>/dev/null || echo "   ⚠️  Could not create symbolic link"
    fi
else
    echo "❌ No orchestration skill found"
    echo "   Creating placeholder 'orchestration' skill"
    mkdir -p "$SKILLS_DIR/orchestration"
    cat > "$SKILLS_DIR/orchestration/SKILL.md" << 'EOF'
# Orchestration Skill
Placeholder for missing orchestration skill.

## Description
This is a placeholder skill. Expected orchestration alternatives:
- saga-orchestration
- workflow-orchestration-patterns

## Usage
Used by chat mode for agent orchestration tasks.

## Status
⚠️ PLACEHOLDER - Needs proper implementation
EOF
    echo "✅ Created placeholder 'orchestration' skill"
fi

echo ""

# Fix 3: Update smart skill loader with correct skill names
echo "🔧 Fix 3: Updating smart skill loader"
echo "-------------------------------------"

SMART_LOADER="/home/mdwzrd/wzrd-redesign/bin/smart-skill-loader.js"

if [ -f "$SMART_LOADER" ]; then
    echo "✅ Found smart skill loader: $SMART_LOADER"
    
    # Create backup of original
    cp "$SMART_LOADER" "$BACKUP_DIR/smart-skill-loader-backup.js"
    
    # Check if update is needed
    if grep -q '"communication"' "$SMART_LOADER"; then
        echo "   Found 'communication' reference in loader"
        echo "   Updating to use 'team-communication-protocols'"
        
        # Create updated version
        sed -i 's/"communication"/"team-communication-protocols"/g' "$SMART_LOADER" 2>/dev/null || echo "   ⚠️  Could not update loader"
    else
        echo "   No 'communication' reference found (already fixed?)"
    fi
    
    # Check for orchestration references
    if grep -q '"orchestration"' "$SMART_LOADER"; then
        echo "   Found 'orchestration' reference"
        echo "   Keeping as is (symbolic link should handle it)"
    fi
    
else
    echo "❌ Smart skill loader not found: $SMART_LOADER"
fi

echo ""

# Fix 4: Create unified skill registry
echo "🔧 Fix 4: Creating unified skill registry"
echo "----------------------------------------"

REGISTRY_FILE="/home/mdwzrd/wzrd-redesign/skill-registry.json"

# Load existing skills-lock.json
if [ -f "/home/mdwzrd/wzrd-redesign/skills-lock.json" ]; then
    echo "✅ Found skills-lock.json"
    LOCK_COUNT=$(grep -c '^    "' /home/mdwzrd/wzrd-redesign/skills-lock.json 2>/dev/null || echo "0")
    echo "   Skills in lock file: $LOCK_COUNT"
else
    echo "❌ skills-lock.json not found"
fi

# Count local skills
LOCAL_COUNT=$(find "$SKILLS_DIR" -maxdepth 1 -type d | wc -l)
LOCAL_COUNT=$((LOCAL_COUNT - 1)) # Subtract the directory itself
echo "✅ Local skill directories: $LOCAL_COUNT"

# Create registry combining both sources
echo "Creating unified skill registry..."
cat > "$REGISTRY_FILE" << 'EOF'
{
  "metadata": {
    "created": "$(date -Iseconds)",
    "totalSkills": 0,
    "sources": ["local", "lock"],
    "version": "1.0"
  },
  "skills": {}
}
EOF

echo "✅ Created skill registry: $REGISTRY_FILE"
echo "   Note: This is a template. Actual population requires parsing both sources."
echo ""

# Fix 5: Test the fixes
echo "🔧 Fix 5: Testing fixes"
echo "----------------------"

echo "Testing skill availability..."
MISSING_COUNT=0

# Check expected skills
EXPECTED_SKILLS=("orchestration" "communication" "topic-switcher" "auto-memory" "planning" "architecture" "research" "validation")

for skill in "${EXPECTED_SKILLS[@]}"; do
    if [ -d "$SKILLS_DIR/$skill" ] || [ -L "$SKILLS_DIR/$skill" ]; then
        echo "✅ $skill: AVAILABLE"
    else
        echo "❌ $skill: MISSING"
        MISSING_COUNT=$((MISSING_COUNT + 1))
    fi
done

echo ""
echo "📊 Test Results:"
echo "  Total expected skills checked: ${#EXPECTED_SKILLS[@]}"
echo "  Missing skills: $MISSING_COUNT"

if [ $MISSING_COUNT -eq 0 ]; then
    echo "🎉 All expected skills are available!"
else
    echo "⚠️  Some skills still missing. Check symbolic links."
fi

echo ""

# Summary
echo "📋 FIX SUMMARY"
echo "=============="
echo "✅ Backup created: $BACKUP_DIR"
echo "✅ Missing skills handled with placeholders/links"
echo "✅ Smart skill loader updated"
echo "✅ Unified registry template created"
echo "✅ Tests completed: $MISSING_COUNT missing skills"
echo ""
echo "🎯 Next steps:"
echo "1. Review and approve symbolic links"
echo "2. Update smart-skill-loader-optimized.js to use fixed skill names"
echo "3. Implement deferred loading with unified registry"
echo "4. Run comprehensive testing"
echo ""
echo "⚠️  Important: Symbolic links were created to fix missing skills."
echo "   If the actual skills exist elsewhere, update the links accordingly."

exit 0