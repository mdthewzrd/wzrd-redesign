# WZRD.dev Manual Testing Plan
## Phase 4 → Phase 5 Transition

**Goal**: Validate system is production-ready through systematic manual testing
**Estimated Time**: 2-3 hours
**Participants**: You + Me

---

## Phase 1: Core Functionality Tests (15 min)
**Focus**: Basic system operations

### 1.1 System Status
```bash
wzrd status
```
- [ ] Response received within 10ms
- [ ] Shows correct mode
- [ ] Shows memory usage
- [ ] No errors

### 1.2 Mode Switching
```bash
wzrd mode chat
wzrd mode thinker
wzrd mode coder
wzrd mode debug
wzrd mode research
```
- [ ] Each switch successful
- [ ] Confirmation message shown
- [ ] Mode persists correctly

### 1.3 Basic Query
```bash
wzrd ask "What is 2+2?"
```
- [ ] Response received
- [ ] Answer is correct (4)
- [ ] Reasonable latency (<1s)

### 1.4 File Execution
```bash
echo "console.log('test')" > /tmp/test.js
wzrd run /tmp/test.js
```
- [ ] File executes successfully
- [ ] Output shown
- [ ] No errors

**Phase 1 Complete**: ___

---

## Phase 2: Mode-Specific Tests (30 min)
**Focus**: Each mode's specialized behavior

### 2.1 Chat Mode
```bash
wzrd mode chat
wzrd ask "Tell me a joke"
```
- [ ] Casual, friendly tone
- [ ] No unnecessary technical jargon
- [ ] Quick response

### 2.2 Thinker Mode
```bash
wzrd mode thinker
wzrd ask "What are the tradeoffs between monoliths and microservices?"
```
- [ ] Structured reasoning
- [ ] Multiple perspectives considered
- [ ] Balanced analysis

### 2.3 Coder Mode
```bash
wzrd mode coder
wzrd ask "Write a Python function to sort a list"
```
- [ ] Code is syntactically correct
- [ ] Follows Python conventions
- [ ] Includes comments/docstrings
- [ ] Runnable code

### 2.4 Debug Mode
```bash
wzrd mode debug
cat > /tmp/buggy.py << 'EOF'
def divide(a, b):
    return a / b

result = divide(10, 0)
print(result)
EOF
wzrd run /tmp/buggy.py
```
- [ ] Identifies the ZeroDivisionError
- [ ] Suggests fix
- [ ] Explains root cause

### 2.5 Research Mode
```bash
wzrd mode research
wzrd ask "What are the latest trends in AI coding assistants in 2025?"
```
- [ ] Comprehensive research
- [ ] Multiple sources referenced
- [ ] Structured output

**Phase 2 Complete**: ___

---

## Phase 3: Edge Cases (20 min)
**Focus**: System resilience

### 3.1 Very Long Prompt
```bash
wzrd ask "$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | head -c 5000)"
```
- [ ] Handles gracefully
- [ ] No crash
- [ ] Appropriate response or error message

### 3.2 Empty Prompt
```bash
wzrd ask ""
```
- [ ] Handles gracefully
- [ ] No crash

### 3.3 Special Characters
```bash
wzrd ask "Test with special chars: !@#$%^&*()_+-=[]{}|;':\",./<>?"
```
- [ ] No parsing errors
- [ ] Response received

### 3.4 Multi-line Input
```bash
wzrd ask "Line 1
Line 2
Line 3"
```
- [ ] Processes all lines
- [ ] Context maintained

### 3.5 Rapid-fire Queries
```bash
for i in {1..5}; do wzrd ask "Question $i"; done
```
- [ ] All 5 responses received
- [ ] No dropped connections
- [ ] System remains responsive

**Phase 3 Complete**: ___

---

## Phase 4: Performance Tests (15 min)
**Focus**: Speed and resource usage

### 4.1 Latency Benchmark
```bash
for i in {1..10}; do
  start=$(date +%s%N)
  wzrd ask "What is $i times 2?" > /dev/null 2>&1
  end=$(date +%s%N)
  echo "Query $i: $(( (end - start) / 1000000 ))ms"
done
```
- [ ] Average latency < 600ms
- [ ] No query > 2000ms
- [ ] Consistent performance

### 4.2 Memory Usage
```bash
# Before test
free -h > /tmp/before.txt

# Run 20 queries
for i in {1..20}; do wzrd ask "Query $i"; done > /dev/null 2>&1

# After test
free -h > /tmp/after.txt

diff /tmp/before.txt /tmp/after.txt
```
- [ ] Memory usage stable
- [ ] No memory leaks
- [ ] < 100MB increase

### 4.3 Concurrent Operations
```bash
wzrd ask "Query 1" &
wzrd ask "Query 2" &
wzrd ask "Query 3" &
wait
```
- [ ] All queries complete
- [ ] No race conditions
- [ ] Results not mixed up

**Phase 4 Complete**: ___

---

## Phase 5: Quality Tests (20 min)
**Focus**: Output accuracy and relevance

### 5.1 Code Quality
```bash
wzrd mode coder
wzrd ask "Write a function to validate an email address" > /tmp/email_code.py
python3 -m py_compile /tmp/email_code.py && echo "Syntax OK" || echo "Syntax Error"
```
- [ ] Code compiles
- [ ] Follows best practices
- [ ] Handles edge cases

### 5.2 Response Relevance
```bash
wzrd ask "How do I create a Python class?"
```
- [ ] Answer is about Python classes
- [ ] Not generic or off-topic
- [ ] Actually useful

### 5.3 Context Retention
```bash
wzrd ask "My name is Alice"
wzrd ask "What is my name?"
```
- [ ] Remembers "Alice"
- [ ] Context maintained

### 5.4 Skill Selection
```bash
wzrd mode coder
wzrd ask "Create a React component"  # Should load react skill
wzrd ask "Debug this Python error"   # Should load debugging skill
```
- [ ] Appropriate skills loaded
- [ ] Skills enhance response
- [ ] No unnecessary skills

**Phase 5 Complete**: ___

---

## Phase 6: Full Flow Integration Tests (30 min)
**Focus**: End-to-end real-world scenarios

### 6.1 Development Workflow Simulation
```bash
# Create a new project
mkdir -p /tmp/test-project && cd /tmp/test-project

# Scenario: Build a simple web API
wzrd mode coder
wzrd ask "Create a simple Express.js server with one GET endpoint" > server.js

# Check the code
cat server.js

# Try to run it (if dependencies exist)
# node server.js &

# Ask for debugging if needed
wzrd mode debug
wzrd ask "The server won't start, how do I debug?"  # assuming it fails
```
- [ ] Complete workflow possible
- [ ] Multiple modes used
- [ ] Files created correctly
- [ ] Debugging assistance helpful

### 6.2 Research-to-Code Flow
```bash
wzrd mode research
wzrd ask "What are the best practices for error handling in Node.js?" > /tmp/best_practices.txt

wzrd mode coder
wzrd ask "Implement error handling middleware following these best practices: $(cat /tmp/best_practices.txt | head -20)" > /tmp/error_handler.js

# Verify the code matches recommendations
cat /tmp/error_handler.js
```
- [ ] Research output usable
- [ ] Code implements research findings
- [ ] Smooth mode transitions

### 6.3 Multi-Session Persistence
```bash
# Session 1
wzrd mode chat
wzrd ask "Remember that I'm working on Project Alpha"

# Simulate new session (check if memory persists)
wzrd mode chat
wzrd ask "What project am I working on?"
```
- [ ] Memory persists across sessions
- [ ] Context maintained

### 6.4 Stress Test: Complex Multi-Step Task
```bash
wzrd mode thinker
wzrd ask "Help me architect a simple e-commerce system. What components do I need?" > /tmp/arch.txt

wzrd mode coder
wzrd ask "Generate a basic database schema based on this: $(cat /tmp/arch.txt)" > /tmp/schema.sql

wzrd ask "Create a basic product listing API endpoint" > /tmp/api.js

# Review all files
echo "=== Architecture ===" && cat /tmp/arch.txt | head -20
echo "=== Schema ===" && cat /tmp/schema.sql | head -20
echo "=== API ===" && cat /tmp/api.js | head -20
```
- [ ] Complex task broken down
- [ ] Multiple files generated
- [ ] Components work together
- [ ] Reasonable coherence

### 6.5 Recovery Test
```bash
# Start a long operation
wzrd ask "Write a comprehensive tutorial on React hooks" &

# Interrupt it
kill %1 2>/dev/null

# System should still work
wzrd ask "Simple test"
```
- [ ] System recovers from interruption
- [ ] No corruption
- [ ] Continues working

**Phase 6 Complete**: ___

---

## Summary Checklist

| Phase | Status | Time | Notes |
|-------|--------|------|-------|
| Phase 1: Core Functionality | ⬜ | 15 min | |
| Phase 2: Mode-Specific | ⬜ | 30 min | |
| Phase 3: Edge Cases | ⬜ | 20 min | |
| Phase 4: Performance | ⬜ | 15 min | |
| Phase 5: Quality | ⬜ | 20 min | |
| Phase 6: Full Flow Integration | ⬜ | 30 min | |
| **Total** | | **2.5 hours** | |

---

## Sign-Off

**Tester**: _______________  **Date**: _______________

**Overall Assessment**:
- [ ] **PASS** - System is production-ready
- [ ] **PASS WITH NOTES** - Minor issues found
- [ ] **FAIL** - Critical issues need fixing

**Critical Issues Found**:
```
(Enter here)
```

**Recommendations**:
```
(Enter here)
```

**Ready for Phase 5 Deployment**: ⬜ Yes / ⬜ No
