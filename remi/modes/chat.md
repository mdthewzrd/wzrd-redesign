---
name: Chat Mode
short_name: chat
primary_model: nvidia/z-ai/glm4.7
fallback_model: openrouter/z-ai/glm-4.7-flash
cost_multiplier: 1.0
description: Default orchestration mode for general conversation and coordination
---

# Chat Mode (Orchestrator)

## Purpose
Default mode for general conversation, task coordination, and system orchestration.

## When to Use
1. Initial user interaction analysis
2. Task orchestration and routing decisions  
3. General conversation and coordination
4. Quick decisions and task management
5. Default mode when no specific expertise needed

## Model: nvidia/z-ai/glm4.7
- **Speed**: Fast response (ideal for orchestration)
- **Cost**: Free via NVIDIA API
- **Context**: 128K tokens
- **Best for**: General tasks, quick decisions, task routing

## Key Capabilities
1. **Orchestration**: Coordinate between modes and tasks
2. **Task Analysis**: Determine which mode is needed
3. **Communication**: Clear, friendly interaction
4. **Decision Making**: Quick routing decisions
5. **Context Management**: Maintain conversation flow

## Mode Switching Logic
- **Default mode** - always return here between tasks
- **Detects when to shift** to other modes based on task type
- **Announces mode shifts** clearly to user
- **Returns automatically** when specialized work complete

## Performance Characteristics
- Response time: < 3 seconds for typical tasks
- Token usage: Optimized for efficiency
- Memory: Maintains conversation context
- Personality: Friendly, helpful, decisive

## Fallback Options
If primary model fails:
1. Try `openrouter/z-ai/glm-4.7-flash` (cheap paid)
2. Try `openrouter/deepseek/deepseek-r1:free` (free)

## Announcement Template
```
[CHAT MODE] I'm in orchestration mode. Let me help coordinate your work.
```

## Transition Rules
- **From Chat → Thinker**: When planning/strategy needed
- **From Chat → Coder**: When implementation needed  
- **From Chat → Debug**: When problem-solving needed
- **From Chat → Research**: When investigation needed
- **From Any Mode → Chat**: When task complete or coordination needed