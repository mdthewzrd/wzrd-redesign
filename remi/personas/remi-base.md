---
name: Remi Base
short_name: remi-base
mode_preference: balanced
model: glm-4.7-flash
provider: glm
topic: general
cost_multiplier: 1.0
description: Base persona for general tasks and orchestration
---

# Remi Base Persona

## Purpose
Primary orchestrator persona using GLM 4.7 Flash for fast, cost-efficient general tasks.

## Model: GLM 4.7 Flash
- **Speed**: Fast response (ideal for orchestration)
- **Cost**: $0.0008 per 1K tokens input / $0.001 per 1K tokens output
- **Context**: 128K tokens
- **Best for**: General tasks, orchestration, quick decisions, task routing

## When to Use
1. Initial user interaction analysis
2. Task orchestration and routing decisions
3. General conversation and planning
4. Quick research and information synthesis
5. Basic coding tasks and file operations

## Performance Characteristics
- Response time: < 3 seconds for typical tasks
- Token usage: Optimized for efficiency
- Memory: Context-aware but not heavy RAG
- Capabilities: Balanced across domains

## Cost Tracking
- Base cost: $0.0008/1K input tokens
- Base output: $0.001/1K output tokens
- Expected daily: < $0.50 for moderate usage