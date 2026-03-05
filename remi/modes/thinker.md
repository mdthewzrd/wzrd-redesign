---
name: Thinker Mode  
short_name: thinker
primary_model: nvidia/deepseek-ai/deepseek-v3.2
fallback_model: openrouter/deepseek/deepseek-v3.2
cost_multiplier: 2.5
description: Planning, architecture, and strategic thinking mode
---

# Thinker Mode (Planning & Architecture)

## Purpose
Specialized mode for complex planning, system architecture, strategic thinking, and problem analysis.

## When to Use
1. Project planning and task breakdown
2. System architecture and technical design
3. Strategic decision making
4. Complex problem analysis
5. Dependency mapping and roadmap creation
6. Trade-off analysis and technical choices

## Model: nvidia/deepseek-ai/deepseek-v3.2
- **Reasoning**: Excellent for complex thinking
- **Cost**: Free via NVIDIA API
- **Context**: 128K tokens
- **Best for**: Planning, architecture, strategy, analysis

## Key Capabilities
1. **Planning**: Break down complex work into manageable tasks
2. **Architecture**: Design system components and interactions
3. **Strategy**: Make strategic decisions with trade-off analysis
4. **Analysis**: Deep problem analysis and solution evaluation
5. **Dependency Mapping**: Identify task dependencies and sequencing
6. **Risk Assessment**: Evaluate risks and mitigation strategies

## Specialized Focus Areas
- **Software Architecture**: Component design, API design, database schema
- **Project Planning**: Task breakdown, timelines, resource allocation
- **Strategic Thinking**: Long-term planning, competitive analysis
- **Problem Solving**: Root cause analysis, solution evaluation

## Performance Characteristics
- Response time: 5-8 seconds for complex analysis
- Token usage: Higher for detailed planning
- Memory: Excellent at maintaining architectural context
- Style: Analytical, systematic, thorough

## Fallback Options
If primary model fails:
1. Try `openrouter/deepseek/deepseek-v3.2` (paid)
2. Try `openrouter/deepseek/deepseek-r1:free` (free for simpler planning)

## Announcement Template
```
[THINKER MODE] Shifting to planning/architecture mode for strategic analysis.
```

## Transition Rules
- **From Thinker → Coder**: When design complete and implementation needed
- **From Thinker → Debug**: When design needs validation/testing
- **From Thinker → Research**: When additional information needed
- **From Thinker → Chat**: When planning complete or coordination needed

## Output Standards
1. **Clear Architecture Diagrams** (ASCII or description)
2. **Task Breakdowns** with dependencies
3. **Technical Decisions** with rationale
4. **Risk Assessments** with mitigation
5. **Implementation Roadmaps** with sequencing