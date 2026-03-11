# Validate Optimizations in TUI

## Instructions for Manual TUI Validation

**Run these commands in sequence to validate all optimizations:**

### 1. Start TUI with Validation Mode
```bash
wzrd.dev
```

### 2. Test Prompts to Use Inside TUI:

#### **Phase 1: Auto-Mode Detection**
```
"Test auto-mode detection: Write a Python function that calculates factorial"
Expected: [CODER MODE] with code block

"Test auto-mode detection: Design a database schema for e-commerce"
Expected: [THINKER MODE] with architecture analysis

"Test auto-mode detection: This code has an error: print(1/0)"
Expected: [DEBUG MODE] with error analysis

"Test auto-mode detection: Research React 19 features"
Expected: [RESEARCH MODE] with comprehensive analysis

"Test auto-mode detection: Hi Remi, how are you?"
Expected: [CHAT MODE] friendly conversation
```

#### **Phase 2: Performance Validation**
```
"Verify performance optimizations: Are we getting 100-169× speedup?"
Expected: References to ultra-fast cache, mode-specific skill loading

"Check token reduction: Are we using 40KB instead of 637KB?"
Expected: Should mention 90% token reduction
```

#### **Phase 3: Memory System Validation**
```
"Test jCodeMunch integration: Find references to cost tracking"
Expected: Semantic search results from memory system

"Verify memory topics: What topics do we have in memory?"
Expected: Should list context-management, performance-optimization, etc.
```

#### **Phase 4: Cost Tracking Validation**
```
"Check cost optimization: What's our daily budget?"
Expected: Should mention $1/day target, $0.005/day actual

"Verify budget enforcement: How are we keeping costs low?"
Expected: Should mention mode-specific skill loading, token reduction
```

#### **Phase 5: CLI/TUI Integration**
```
"Verify TUI is working with optimizations: What mode am I in?"
Expected: Should show current mode and explain optimizations
```

## ✅ Expected Results from Validation:

### 1. Mode Switching:
- Each prompt triggers correct mode ([CODER], [THINKER], etc.)
- Mode-specific responses (code, analysis, debugging, research, chat)

### 2. Performance Indicators:
- Fast response times (<5 seconds)
- References to optimizations (cache, token reduction)
- No loading of all 65+ skills per query

### 3. Integration Working:
- Memory search finds relevant context
- Cost tracking mentioned
- CLI/TUI seamless integration

### 4. Quality of Responses:
- Coder mode: Working, executable code
- Thinker mode: Structured architecture analysis  
- Debug mode: Root cause analysis + fix
- Research mode: Comprehensive, sourced information
- Chat mode: Natural, friendly conversation

## 🚨 Troubleshooting:

### If mode detection fails:
1. Check exact prompt wording
2. Look for mode indicator at start of response
3. Verify response matches expected mode type

### If performance seems slow:
1. Note response time
2. Check if all optimizations are mentioned
3. Run `wzrd.dev --health` for system status

### If integration issues:
1. Check if memory references past work
2. Verify cost tracking is mentioned
3. Ensure CLI commands work (`--help`, `--validate`)

## 📊 Validation Success Criteria:

**Minimum Viable Validation:**
- ✅ All 5 modes work correctly
- ✅ Performance optimizations mentioned
- ✅ Integration references present
- ✅ Response times reasonable (<10s)

**Full Validation:**
- ✅ Mode switching seamless and accurate
- ✅ 90% token reduction evident (not all skills loaded)
- ✅ Memory system references past work
- ✅ Cost tracking visible in responses
- ✅ All optimization claims verified

## 🎯 Ready for Validation!

**Start with:** `wzrd.dev`  
**Then use prompts above to test each optimization**

The system should now demonstrate all implemented optimizations in real-time!