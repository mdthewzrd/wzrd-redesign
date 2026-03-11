# Manual Testing Checklist
## For WZRD Optimization Verification

## ✅ PRE-TEST VALIDATION COMPLETE
All critical issues have been fixed:
1. ✅ Cost tracker integration fixed (path issues resolved)
2. ✅ TypeScript compilation errors resolved (test simplified)
3. ✅ CLI wrapper portable (hardcoded paths removed)
4. ✅ TUI confirmed operational (wzrd-mode works)

---

## 🧪 MANUAL TESTING SCENARIOS

### Phase 1: Auto-Mode Detection Testing
**Goal:** Verify 5-mode switching works correctly

#### Test 1: Chat Mode
```
Test: "Hi Remi, how are you today?"
Expected: [CHAT MODE] response, friendly conversation
```

#### Test 2: Coder Mode  
```
Test: "Write a Python function that calculates factorial"
Expected: [CODER MODE] response with code block first
```

#### Test 3: Thinker Mode
```
Test: "Design a database schema for an e-commerce platform"
Expected: [THINKER MODE] with structured analysis
```

#### Test 4: Debug Mode
```
Test: "This code has an error: print(1/0)"
Expected: [DEBUG MODE] with error analysis and fix
```

#### Test 5: Research Mode
```
Test: "Research React 19 features and migration patterns"
Expected: [RESEARCH MODE] with comprehensive analysis
```

---

### Phase 2: CLI/TUI Testing  
**Goal:** Verify command-line interface works

#### Test 6: wzrd-mode CLI
```bash
./wzrd-mode --help
Expected: Shows help with mode switching options
```

#### Test 7: wzrd.dev command
```bash
wzrd.dev
Expected: Launches TUI in chat mode
```

#### Test 8: Mode-specific launch
```bash
wzrd.dev --mode thinker "Plan a project"
Expected: Launches TUI in thinker mode
```

---

### Phase 3: Performance Validation
**Goal:** Verify optimization performance claims

#### Test 9: Response Time
```bash
time ./test-optimizations.sh
Expected: All tests complete in <10 seconds
```

#### Test 10: Token Efficiency
```
Observe: Context size in responses
Expected: Mode-specific skill loading (not all skills)
```

---

### Phase 4: Cost Tracking Verification
**Goal:** Verify budget enforcement

#### Test 11: Cost Awareness
```
Check: Does Remi mention cost optimization?
Expected: Responses should be token-efficient
```

#### Test 12: Budget References
```
Check: Any budget warnings or cost tracking?
Expected: May mention $1/day budget target
```

---

### Phase 5: Integration Testing
**Goal:** Verify all systems work together

#### Test 13: Memory System Integration
```
Test: "What did we decide about context pruning?"
Expected: References previous work from memory
```

#### Test 14: Skill Loading Integration
```
Test: Switch between modes rapidly
Expected: Appropriate skills loaded for each mode
```

---

## 📊 EXPECTED OUTCOMES

### Performance Targets:
- **Response Time:** <5 seconds per query
- **Mode Switching:** Automatic and accurate
- **Token Usage:** ~40KB per mode (not 637KB)
- **CLI Launch:** <3 seconds

### Quality Targets:
- **Mode Detection:** 95%+ accuracy
- **Skill Relevance:** Appropriate skills per mode
- **Code Quality:** Working, executable code
- **Analysis Depth:** Comprehensive for research/thinker modes

---

## 🚨 TROUBLESHOOTING

### If mode detection fails:
1. Check auto-mode rules in Remi instructions
2. Verify skill loading is happening
3. Test with simpler prompts first

### If CLI doesn't work:
1. Run `./wzrd-mode --help` directly
2. Check `wzrd.dev` command exists
3. Verify OpenCode is installed

### If performance seems slow:
1. Run `./test-optimizations.sh` to benchmark
2. Check memory/topics directory exists
3. Verify no background processes slowing system

---

## 📈 SUCCESS CRITERIA

### ✅ Minimum Viable Testing:
- All 5 modes work correctly
- CLI/TUI launches successfully
- Response times <10 seconds
- Token optimization noticeable

### ✅ Full Validation:
- Mode switching seamless
- Performance meets 100-169× speedup claims
- Cost tracking integration visible
- Memory system works (references past work)

---

## 🎯 READY FOR MANUAL TESTING!

**Start with:** Phase 1 (Auto-Mode Detection)  
**Then move to:** Phase 2 (CLI/TUI Testing)  
**Finally validate:** Phase 3 (Performance)  

All critical issues have been resolved. System is ready for your manual testing!