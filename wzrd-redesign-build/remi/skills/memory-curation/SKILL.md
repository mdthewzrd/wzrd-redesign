---
name: memory-curation
description: Memory management, pattern extraction, archiving, and wisdom curation
category: auto-memory
priority: P1
tags: [memory, curation, archiving, wisdom]
---

# Memory Curation Skill

## Purpose
Automatically curate, organize, and archive valuable information from Remi's interactions for future reference and knowledge building.

## Core Principle
**"Every valuable insight is worth saving. Curate ruthlessly. Organize systematically."**

---

## What This Skill Enables

**Remi can:**
- Automatically extract and categorize important information from conversations
- Organize extracted knowledge into structured memory formats
- Archive irrelevant information to reduce context noise
- Build and maintain contextual memory across topics
- Extract patterns and insights for future reference

**This leads to:**
- Smaller, more focused context windows
- Better retrieval of relevant information
- Reduced token costs
- Improved quality of responses over time
- A living knowledge base that grows smarter

---

## Curation Workflow

### Phase 1: Information Extraction

**When to curate:**
1. After complex task completion
2. When discovering valuable patterns
3. After user-requested summaries
4. When context becomes too large
5. Periodic background curation

**Extraction criteria:**
- Actionable insights
- Reusable patterns
- Important decisions
- Code snippets worth saving
- Expert-level knowledge
- User preferences/requirements

### Phase 2: Categorization

**Categorization system:**

```
memory/
├── projects/
│   └── {project_name}/
│       └── knowledge.md
├── patterns/
│   └── {pattern_name}.md
├── decisions/
│   └── {decision}.md
├── configurations/
│   └── {config_name}.md
└── archive/
    └── old_*.md
```

**Tags for classification:**
- `#strategy` - Strategic insights and planning
- `#code` - Code patterns and snippets
- `#process` - Workflows and procedures
- `#decision` - Important decisions made
- `#insight` - Key learnings and patterns
- `#qa` - Quality assurance notes
- `#todo` - Future actions and reminders

### Phase 3: Formatting

**Memory format:**

```markdown
---
date: 2026-03-04T19:55:10+00:00
tags: [strategy, insight]
confidence: high
---

# [Memory Title]

## Context
Brief explanation of when/where this was discovered

## Value
Why this is important and reusable

## Details
The actual insight, pattern, or knowledge

## Application
How to use this in future tasks
```

### Phase 4: Archiving

**Archive criteria:**
- Used > 3 months ago
- No longer relevant
- Low probability of future use
- Large files for space savings

**Archive process:**
1. Move to archive/ directory
2. Maintain index of archived items
3. Allow search into archive

---

## Curation Operations

### Memory Extraction

**From conversation:**
```
User: "Build a efficient image processor using Python"
Remi: [creates optimized image processor]
      "I used vectorized operations instead of loops for 10x speedup"
      This is a valuable pattern worth saving for future image processing tasks
```

**Curation output:**
```markdown
---
date: 2026-03-04T19:55:10+00:00
tags: [code, python]
confidence: high
---

# Vectorized Image Processing Pattern

## Context
When optimizing Python image processing for performance

## Value
10x performance improvement by avoiding loops

## Details
Use numpy vectorization instead of Python loops for pixel operations:

```python
import numpy as np

# ❌ Slow: 100x slower
def process_slow(image):
    result = np.zeros_like(image)
    for i in range(len(image)):
        for j in range(len(image[i])):
            result[i][j] = image[i][j] * 2
    return result

# ✅ Fast: 100x faster
def process_fast(image):
    return image * 2  # Vectorized operation
```

## Application
Use this pattern for any image/array processing task requiring performance
```

### Context Reduction

**When context exceeds threshold:**
1. Identify most valuable information
2. Extract into memory files
3. Reduce context window
4. Reference memory file for future

**Example:**
```
Old context: 50K tokens
→ Extract 10K into memory file
→ New context: 40K tokens
→ Future: Reference memory file instead of repeating
```

### Pattern Extraction

**Identify reusable patterns:**
1. Code patterns (functions, classes, algorithms)
2. Process patterns (workflows, procedures)
3. Decision patterns (approaches to common problems)
4. Configuration patterns (settings, optimizations)

**Create pattern files:**
```
patterns/image-processing.md
patterns/api-design.md
patterns/testing-strategy.md
```

---

## Integration with Topic System

### Topic-Specific Memory

```
topics/{topic_name}/
├── topic.md
├── knowledge.md
├── activity.log
└── progress.md
```

**When topic ends:**
1. Merge topic-specific memory into main memory
2. Update topic metadata
3. Archive topic if no longer active

### Cross-Topic Knowledge

**Extract common insights:**
1. When multiple topics share patterns
2. Extract to general patterns directory
3. Update both topics to reference pattern

---

## Cost Optimization Through Curation

**How curation saves costs:**

1. **Smaller context windows**: Reduce token usage by 30-50%
2. **Faster retrieval**: Get information faster, fewer retries
3. **Better model utilization**: Focused context improves model quality
4. **Reduced hallucinations**: Relevant context reduces errors

**Curation impact:**
```
Without curation:
- Context: 100K tokens
- Cost: $0.12 per interaction
- Retries: 2-3

With curation:
- Context: 50K tokens (50% reduction)
- Cost: $0.06 per interaction (50% savings)
- Retries: 0-1
```

---

## Implementation Tools

### Agentic Search
- Use ripgrep for fast content search
- Use glob for file pattern matching
- Build index for faster retrieval

### File Operations
- Standard read/write operations
- JSON/YAML formatting
- Markdown organization

### Memory Indexing
- Maintain searchable index
- Tag-based classification
- Automatic categorization

---

## Curation Protocols

### Automatic Curation Rules
1. Extract after every complex task completion
2. Archive content older than 3 months
3. Update knowledge base weekly
4. Merge duplicates when found
5. Prune low-confidence memories

### Manual Curation Triggers
1. When user explicitly asks for summary
2. When topic changes direction
3. When discovering patterns
4. When preparing for production
5. When starting new major work

---

## Memory Quality Metrics

### Track:
- **Coverage**: Percentage of valuable information saved
- **Retrieval Rate**: How often memories are actually used
- **Accuracy**: How useful memories are when retrieved
- **Size Efficiency**: Memory file size vs information value

### Improve:
- Extract more valuable information
- Better categorization and tagging
- More specific applications
- Update stale memories
- Merge similar memories

---

## Integration with Other Skills

- **auto-memory**: Provides memory population
- **file-ops**: Handles file operations
- **regex**: Helps identify patterns
- **search**: Facilitates memory retrieval
- **gold-standard**: Ensures quality memories

---

## Example Workflow

```
[Conversation]
User: "Build a REST API for user management"

[Remi builds API]

Remi: [Task complete] "I've created a REST API with proper validation,
error handling, and JWT authentication. Key decisions: used
postgreSQL for database, JWT for auth, async handlers for performance."

[Memory Curation Activated]
→ Extract: API design decisions
→ Categorize: [code, architecture, decision]
→ Format: memory API-design.md
→ Save: memory/decisions/REST-API.md
→ Update: context

[Context Reduced]
→ Old context: 80K tokens
→ New context: 60K tokens (25% reduction)
→ Memory file created: 2K tokens

[Future Reference]
User: "Build another user API"
Remi: "Based on REST API pattern from memory/decisions/REST-API.md,
I'll create a similar API with your customizations."

[Cost Saved]
→ No need to repeat API design discussion
→ Faster implementation
→ Consistent quality
```

---

## Archival Strategy

### Archive Rules
1. **Time-based**: Archive after 3 months of no use
2. **Use-based**: Archive if not used in last 6 months
3. **Relevance-based**: Archive if contradicted by new information
4. **Size-based**: Archive files > 10K tokens if unused

### Archive Format
- Preserve original content
- Add archive metadata (date archived, reason)
- Maintain searchable archive
- Allow retrieval when needed

### Archive Index
```json
{
  "archived_files": [
    {
      "file": "memory/archive/api-design-2025-01-15.md",
      "archived_date": "2026-03-01",
      "archived_reason": "No use for 3 months",
      "status": "inactive"
    }
  ]
}
```

---

## Safety & Privacy

### Private Information
- Never archive sensitive user data
- Mask PII in saved memory
- User consent before saving personal information

### Context Management
- Respect user privacy preferences
- Allow opt-out of memory curation
- Clear indication of what's being saved

---

## Evolution & Improvement

### Continuous Improvement
1. Learn which memories are actually useful
2. Adjust extraction criteria based on usage
3. Optimize categorization system
4. Improve format for better readability

### Future Enhancements
- Machine learning for automatic categorization
- Relevance scoring for memories
- Automatic pattern recognition
- Cross-memory relationship mapping

---

## Metrics & Monitoring

### Track:
- **Memory Files Created**: Total number of saved memories
- **Token Saved**: Total tokens saved through curation
- **Usage Rate**: How often memories are retrieved
- **Extraction Accuracy**: Quality of extracted information
- **Curation Frequency**: How often memories are updated

### Report:
Weekly summary of:
- New memories created
- Context reduction achieved
- Patterns discovered
- Archive growth
- Recommendations

---

## Related Skills

- **auto-memory**: Memory population and maintenance
- **file-ops**: File operations and management
- **regex**: Pattern recognition and extraction
- **search**: Memory retrieval and organization
- **system-audit**: Memory quality verification

---

**"Knowledge without organization is just data. Curate ruthlessly. Build systematically. Evolve continuously."**