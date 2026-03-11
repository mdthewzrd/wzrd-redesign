# Persona Selector System

## Overview
Dynamic persona switching system for optimized model usage based on task type. Each persona uses a specific LLM model with appropriate cost/performance characteristics.

## Primary Personas

### 1. **remi-base** (GLM 4.7 Flash)
- **Usage**: 50-60% of tasks
- **Cost**: $0.0008/$0.001 per 1K tokens
- **Best for**: General tasks, orchestration, quick responses

### 2. **coder-pro** (Qwen3 Coder 32B)
- **Usage**: 20-30% of tasks
- **Cost**: $0.0024/$0.0072 per 1K tokens
- **Best for**: Complex coding, refactoring, debugging

### 3. **research-deep** (DeepSeek V3.2)
- **Usage**: 10-20% of tasks
- **Cost**: $0.002/$0.006 per 1K tokens
- **Best for**: Deep research, complex analysis, strategy

## Selection Algorithm

### Step 1: Analyze Task
```yaml
Task Analysis:
  - Type: coding/research/general
  - Complexity: simple/medium/complex
  - Duration: quick/deep
  - Domain: specific/general
```

### Step 2: Determine Persona
```python
def select_persona(task_type, complexity):
    if task_type == "coding" and complexity in ["medium", "complex"]:
        return "coder-pro"
    elif task_type == "research" and complexity in ["medium", "complex"]:
        return "research-deep"
    elif task_type == "strategy" or task_type == "planning":
        return "research-deep"
    else:
        return "remi-base"
```

### Step 3: Apply Cost Guardrails
```python
def should_use_persona(persona, task_importance, budget_remaining):
    persona_cost = persona_cost_multipliers[persona]
    estimated_tokens = estimate_token_usage(task)
    estimated_cost = (estimated_tokens / 1000) * persona_cost
    
    if estimated_cost > (budget_remaining * 0.1):  # Don't use >10% of remaining budget
        return "remi-base"  # Fallback to base model
    return persona
```

## Cost Multipliers
- `remi-base`: 1.0x (baseline)
- `coder-pro`: 3.0x (coding tasks worth extra cost)
- `research-deep`: 2.5x (research tasks worth extra cost)

## Daily Budget Management
- **Total daily budget**: $1.00
- **Base model allocation**: $0.50 (50% of budget)
- **Specialized model allocation**: $0.50 (50% split between coding/research)
- **Emergency reserve**: $0.05 (5% for critical tasks)

## Task Type Detection

### Coding Tasks (→ coder-pro)
- File creation/modification with code
- Refactoring existing code
- Debugging complex issues
- Algorithm implementation
- Database operations
- API development

### Research Tasks (→ research-deep)
- Complex problem analysis
- Strategic planning
- Market/competitor research
- Data analysis and interpretation
- Architectural decisions
- Deep learning tasks

### General Tasks (→ remi-base)
- File operations
- Simple Q&A
- Task orchestration
- Basic planning
- Documentation
- Quick lookups

## Switching Protocol

### Automatic Switching
1. Detect task type from first 3-5 messages
2. Estimate complexity based on user request depth
3. Apply persona selection algorithm
4. Switch persona at conversation boundary

### Manual Override
Users can specify persona:
- `@coder` → Use coder-pro persona
- `@research` → Use research-deep persona  
- `@base` → Use remi-base persona

### Performance Monitoring
- Track response times by persona
- Monitor cost per interaction
- Log persona selection accuracy
- Adjust algorithm based on performance

## Implementation Notes

### Conversation Boundaries
- Persona switches occur at natural conversation breaks
- Maintain context across persona switches when needed
- Clear persona identification in responses

### Cost Optimization
- Use base model for routine tasks
- Only upgrade when clear benefit expected
- Monitor cumulative costs in real-time
- Fallback to base model when budget constrained

### Error Handling
- If persona unavailable, default to base
- If model error, retry with base persona
- Log all persona switches for debugging