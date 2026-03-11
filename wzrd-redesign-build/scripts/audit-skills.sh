#!/bin/bash
# Skills Audit Script - Rapid categorization and decision making
set -e

# Categories of skills to focus on
ESSENTIAL_CATEGORIES=(
    "react|frontend|design|typescript|javascript"
    "architecture|patterns|api"
    "testing|debug|quality"
    "git|workflow"
    "llm|ai|embedding|rag"
    "optimization|performance"
)

# Skills we know we're keeping
KEEP_SKILLS=(
    "agent-browser"
    "brainstorming"
    "systematic-debugging"
    "writing-plans"
    "executing-plans"
    "test-driven-development"
    "verification-before-completion"
)

# Skills we know we're removing (incompatible)
REMOVE_SKILLS=(
    "browser-use"
    "remote-browser"
    "subagent-driven-development"
    "dispatching-parallel-agents"
)

echo "=== WZRD.dev Skills Audit ==="
echo ""
echo "Total skills: $(ls -d .agents/skills/*/ 2>/dev/null | wc -l)"
echo ""
echo "=== Processing Categories ==="

for pattern in "${ESSENTIAL_CATEGORIES[@]}"; do
    echo ""
    echo "--- Category: $pattern ---"
    ls -d .agents/skills/*/ 2>/dev/null | xargs basename | grep -Ei "$pattern" | head -10
done
