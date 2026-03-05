---
name: classify-transformation
description: Classify uploaded transformation code and route to appropriate specialized transformation skill
category: transformation
priority: P0
tags: [transformation, classification, routing, scanner]
---

# Classification Skill for Transformations

## Purpose
Analyze uploaded transformation code, classify its pattern type, and route to the appropriate specialized transformation skill.

## Core Principle
**"Classify first, route smart. Never load more skill than needed."**

---

## Classification Workflow

### Step 1: Load Input Code
Read the uploaded file and store in context for analysis.

### Step 2: Detect Pattern Type

#### Model A: Column-Based Filtering
```python
# Characteristics:
# - Vectorized operations on entire DataFrame
# - No row-by-row iteration
# - Filters applied via boolean masks
# - Pattern detection done via group operations

# Example patterns:
df[df['condition']] = ...  # Boolean masking
group['column'].mean()      # Group aggregation
df[df['ema9'] > df['ema20']]  # Column comparison
```

#### Model B: Row-Iteration Pattern Detection
```python
# Characteristics:
# - Uses .iloc[] or .loc[] for row access
# - Detects patterns by iterating index
# - Requires D-1 metric alignment via .shift()
# - Accesses r0, r1, r2 directly

# Example patterns:
for i in range(2, len(df)):
    r0 = df.iloc[i]
    r1 = df.iloc[i-1]   # D-1 row
    if condition: ...
```

#### Model C: Complex Multi-Pass
```python
# Characteristics:
# - Nested loops (date search × pattern search)
# - Picks levels/significance from long lookback
# - Requires pivot/level pre-computation
# - Extremely expensive (O(n × 1000))

# Example patterns:
for d0 in dates:
    level_date = pick_level_date(m, d0, p)  # Searches 1000 days!
    sig = significance_metrics(m, level_date, d0, p)
```

### Step 3: Detect Complexity

| Indicator | Low | Medium | High |
|------------|------|--------|-------|
| File size | <200 lines | 200-400 lines | >400 lines |
| Nested loops | 0 | 1 | 2+ |
| Lookback days | <100 | 100-500 | >500 |
| Helper functions | 0-2 | 3-5 | 6+ |

### Step 4: Output Classification

Return classification in this format:

```python
{
    "pattern_type": "model-a" | "model-b" | "model-c" | "backtest" | "other",
    "complexity": "low" | "medium" | "high",
    "source_type": "daily-scanner" | "backtest" | "intraday" | "custom",
    "special_notes": ["Level-based pattern requiring pivot pre-computation", ...],
    "recommended_skill": "transform-model-b" | "transform-model-c" | ...
}
```

### Step 5: Route to Skill

Load only the appropriate transformation skill:
- `transform-model-a` for Model A patterns
- `transform-model-b` for Model B patterns
- `transform-model-c` for Model C patterns
- `transform-backtest` for backtest transformations
- `transform-scan-from-scratch` for requirements-to-code

---

## Detection Patterns

### Model A Detection
```python
# Grep patterns:
- group\[['\w]+(?:,\s*['\w]+)*\]\.(?:mean|sum|std|max|min)\(
- df\[df\['\w+'\]\s*(?:==|!=|>|<|>=|<=|&|\|)\s*...
```

### Model B Detection
```python
# Grep patterns:
- for\s+i\s+in\s+range\s*\([^)]+\):
- df\.iloc\[i(?:-\d+)?\]
- r0\s*=\s*df\.iloc\[i\]
```

### Model C Detection
```python
# Grep patterns:
- pick_level_date\s*\(
- significance_metrics\s*\(
- for\s+d0\s+in\s+.+:  # Outer loop
- timedelta\s*\([^)]*days\s*=\s*\d{3,}  # Large lookback
```

---

## Classification Output Format

After classification, use this message format:

```
Classification Complete:
  Pattern Type: Model B (Row-Iteration)
  Complexity: Medium
  Source Type: Daily Scanner
  Special Notes: D-1 metric alignment required

Routing to: transform-model-b skill
```

---

## When to Use This Skill

- **Always first** before any transformation task
- When uploaded code pattern is unknown
- When user asks to classify code
- When transformation skill is unclear

---

## Gold Standard Integration

### Read-Back Verification
- Verify classification by checking detection patterns
- Confirm recommended skill exists

### Executable Proof
- Show detection pattern matches in code
- Demonstrate complexity scoring

### Loop Prevention
If classification fails:
- Attempt 1: Use generic patterns
- Attempt 2: Ask user for clarification
- Attempt 3: Escalate with code sample

---

**"Classification is the gatekeeper. Right skill, right time, right result."**
