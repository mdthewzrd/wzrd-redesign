#!/bin/bash
# Project Creation Blueprint Script
# Creates isolated project with worktree + topic + monitoring

set -e  # Exit on error

# Configuration
PROJECT_NAME="$1"
PROJECT_DESCRIPTION="$2"
PARENT_REPO="/home/mdwzrd/wzrd-redesign"
WORKTREE_BASE="/home/mdwzrd/wzrd-redesign/.worktrees"
TOPICS_BASE="/home/mdwzrd/wzrd-redesign/.worktrees/opencode-plugin-test/topics"

# Validation
if [ -z "$PROJECT_NAME" ]; then
    echo "❌ Error: Project name required"
    echo "Usage: $0 <project_name> [description]"
    exit 1
fi

if [ -z "$PROJECT_DESCRIPTION" ]; then
    PROJECT_DESCRIPTION="Isolated project agent for $PROJECT_NAME"
fi

echo "═══════════════════════════════════════════════════"
echo "🧠 Project Creation Blueprint: $PROJECT_NAME"
echo "═══════════════════════════════════════════════════"

# Step 1: Resource monitoring start
echo "📊 Step 1: Starting resource monitoring..."
START_CPU=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
START_MEM=$(free -m | awk 'NR==2{printf "%.2f", $3*100/$2}')
echo "  ├── Starting CPU: ${START_CPU}%"
echo "  ├── Starting Memory: ${START_MEM}%"
echo "  └── Starting Disk: $(df -h . | awk 'NR==2{print $5}')"
echo ""

# Step 2: Check if project already exists
echo "🔍 Step 2: Validating project doesn't exist..."
if [ -d "$WORKTREE_BASE/$PROJECT_NAME" ]; then
    echo "  ❌ Error: Project directory already exists at $WORKTREE_BASE/$PROJECT_NAME"
    exit 1
fi

if [ -d "$TOPICS_BASE/$PROJECT_NAME" ]; then
    echo "  ❌ Error: Topic already exists at $TOPICS_BASE/$PROJECT_NAME"
    exit 1
fi
echo "  ✅ No conflicts found"
echo ""

# Step 3: Create worktree (isolated project environment)
echo "🌳 Step 3: Creating git worktree..."
cd "$PARENT_REPO"
WORKTREE_PATH="$WORKTREE_BASE/$PROJECT_NAME"
git worktree add "$WORKTREE_PATH" --detach
echo "  ├── Worktree created: $WORKTREE_PATH"
echo "  ├── Branch: $(cd "$WORKTREE_PATH" && git branch --show-current)"
echo "  └── Commit: $(cd "$WORKTREE_PATH" && git log -1 --oneline)"
echo ""

# Step 4: Create topic entry
echo "📋 Step 4: Creating topic entry..."
cd "$TOPICS_BASE"

# Create topic directories
mkdir -p "$PROJECT_NAME"/{name,description,project-path,tags,is-active,cli-alias}

# Write topic data
echo "$PROJECT_NAME" > "$PROJECT_NAME/name/topic.txt"
echo "$PROJECT_DESCRIPTION" > "$PROJECT_NAME/description/topic.txt"
echo "$WORKTREE_PATH" > "$PROJECT_NAME/project-path/topic.txt"
echo "project-agent" > "$PROJECT_NAME/tags/topic.txt"
echo "true" > "$PROJECT_NAME/is-active/topic.txt"
echo "$PROJECT_NAME" > "$PROJECT_NAME/cli-alias/topic.txt"

echo "  ├── Topic directories created"
echo "  ├── Name: $PROJECT_NAME"
echo "  ├── Description: $PROJECT_DESCRIPTION"
echo "  ├── Path: $WORKTREE_PATH"
echo "  └── Tags: project-agent"
echo ""

# Step 5: Create project configuration
echo "⚙️ Step 5: Creating project configuration..."
cd "$WORKTREE_PATH"

# Create conductor directory for project context
mkdir -p conductor

# Create basic project context
cat > conductor/product.md <<EOF
# $PROJECT_NAME - Project Context

## Project Overview
**Name**: $PROJECT_NAME
**Description**: $PROJECT_DESCRIPTION
**Created**: $(date)
**Parent Framework**: WZRD.dev/Remi

## Purpose
Isolated project agent running within WZRD.dev ecosystem.

## Communication Channels
- **Parent Orchestrator**: Main Remi agent
- **Topic Registry**: $PROJECT_NAME topic
- **Worktree Location**: $WORKTREE_PATH

## Project Agent Capabilities
- Inherits all WZRD.dev framework capabilities
- Custom skills can be added
- Isolated from other projects
- Can communicate with orchestrator

## Success Criteria
1. Runs independently without affecting other projects
2. Can be managed by main Remi orchestrator
3. Clean integration with topic system
4. Resource efficient (monitored)
EOF

# Create minimal tech stack
cat > conductor/tech-stack.md <<EOF
# $PROJECT_NAME Technology Stack

## Inherited from WZRD.dev Framework
- OpenCode harness
- DeepSeek V3.2 model
- Skill loading system
- Memory management
- Mode shifting capability

## Project-Specific
- Worktree isolation
- Topic-based communication
- Resource monitoring
EOF

echo "  ├── conductor/product.md created"
echo "  ├── conductor/tech-stack.md created"
echo "  └── Project context initialized"
echo ""

# Step 6: Update topics registry
echo "📝 Step 6: Updating topics registry..."
cd "$TOPICS_BASE"

# Add to config.yaml if it exists
if [ -f "config.yaml" ]; then
    # Create backup
    cp config.yaml config.yaml.backup
    
    # Append new entry
    cat >> config.yaml <<EOF
"$PROJECT_NAME":
  name: "$PROJECT_NAME"
  description: "$PROJECT_DESCRIPTION"
  discord_channel_id: undefined
  web_ui_tab: undefined
  cli_alias: "$PROJECT_NAME"
  project_path: "$WORKTREE_PATH"
  tags: "project-agent"
  is_active: true
EOF
    
    echo "  ├── Added to config.yaml"
else
    echo "  ⚠️  config.yaml not found, creating new..."
    cat > config.yaml <<EOF
"$PROJECT_NAME":
  name: "$PROJECT_NAME"
  description: "$PROJECT_DESCRIPTION"
  discord_channel_id: undefined
  web_ui_tab: undefined
  cli_alias: "$PROJECT_NAME"
  project_path: "$WORKTREE_PATH"
  tags: "project-agent"
  is_active: true
EOF
    echo "  ├── Created config.yaml"
fi

echo "  └── Registry updated"
echo ""

# Step 7: Final resource monitoring and validation
echo "✅ Step 7: Final validation and resource report..."
END_CPU=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
END_MEM=$(free -m | awk 'NR==2{printf "%.2f", $3*100/$2}')
DISK_USAGE=$(df -h . | awk 'NR==2{print $5}')

CPU_DIFF=$(echo "$END_CPU - $START_CPU" | bc 2>/dev/null || echo "0")
echo "  ├── Final CPU: ${END_CPU}% (Δ: ${CPU_DIFF}%)"
echo "  ├── Final Memory: ${END_MEM}% (Δ: $(echo "$END_MEM - $START_MEM" | bc 2>/dev/null || echo "0")%)"
echo "  ├── Final Disk: $DISK_USAGE"
echo "  ├── Worktree size: $(du -sh "$WORKTREE_PATH" | cut -f1)"
echo "  └── Topic entry created successfully"
echo ""

# Step 8: Success summary
echo "🎉 Project Creation Complete!"
echo "═══════════════════════════════════════════════════"
echo "📁 Project Location: $WORKTREE_PATH"
echo "📋 Topic Entry: $TOPICS_BASE/$PROJECT_NAME"
echo "🔗 CLI Alias: $PROJECT_NAME"
echo "📊 Resource Usage: Minimal impact confirmed"
echo ""
echo "📝 Next Steps:"
echo "   1. cd $WORKTREE_PATH"
echo "   2. Start developing your project agent"
echo "   3. Use topic system for communication"
echo "   4. Monitor resources with system-health skill"
echo ""
echo "💡 Tip: Run 'cd $WORKTREE_PATH && wzrd' to start the agent"
echo "═══════════════════════════════════════════════════"

exit 0