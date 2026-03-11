# 🚀 28× Speed Implementation Plan

## Current State Analysis

**Baseline Performance**: 
- `wzrd status`: 1.016s (full version)
- `wzrd-mode-fast status`: 0.974s (stripped version)  
- **Target**: 0.036s (28× faster)

**Proven Achievable**: Previous work showed 36ms is possible with optimized bash script.

## Root Causes Blocking 28× Speed

### 1. **Model Configuration Error** ⭐ HIGHEST PRIORITY
- **Error**: `ProviderModelNotFoundError: Model not found: deepseek-ai/deepseek-v3.2`
- **Impact**: ~200ms overhead (fuzzy search + error handling)
- **Solution**: Update all mode files to use `opencode/big-pickle`

### 2. **Skills-lock.json Bloat** ⭐ HIGH PRIORITY  
- **Current**: 855 lines, 850 skills
- **Actually loaded**: ~8 skills
- **Impact**: JSON parsing overhead
- **Solution**: Reduce to actual 69 used skills

### 3. **Missing Model Cache Integration** ⭐ MEDIUM PRIORITY
- **Cache exists**: `bin/model-cache.js`
- **Not integrated**: Not called from `wzrd-mode`
- **Solution**: Integrate model cache into startup

### 4. **Remaining Sequential Operations** ⭐ MEDIUM PRIORITY
- **Some processes still sequential**
- **Solution**: Review all background processes

## Implementation Steps

### Phase 1: Eliminate Model Error (Target: 200ms reduction)

1. **Update all mode files**:
   ```bash
   find ./remi/modes -name "*.md" -exec sed -i 's/deepseek-ai\/deepseek-v3.2/opencode\/big-pickle/g' {} \;
   find ./remi/modes -name "*.md" -exec sed -i 's/nvidia\/z-ai\/glm4.7/opencode\/big-pickle/g' {} \;
   ```

2. **Verify OpenCode model availability**:
   ```bash
   opencode --model opencode/big-pickle run "echo test"
   ```

### Phase 2: Optimize Skills-lock.json (Target: 100ms reduction)

1. **Create optimized skills-lock.json**:
   - Extract only skills actually used (69 skills)
   - Remove unused 781 skills

2. **Update smart skill loader** to use optimized list

### Phase 3: Integrate Model Cache (Target: 100ms reduction)

1. **Modify `wzrd-mode`** to use `bin/model-cache.js`
2. **Pre-populate cache** on first run
3. **Verify cache hits** eliminate fuzzy search

### Phase 4: Create True 28× Fast Version

1. **Create `wzrd-ultra-fast`** script:
   - Direct OpenCode call with correct model
   - Skip all Node.js processes for simple commands
   - Cache everything possible

2. **Benchmark**: Should achieve ~40ms for `status` command

### Phase 5: Merge Optimizations Back

1. **Integrate successful optimizations** into main `wzrd-mode`
2. **Maintain backward compatibility**
3. **Test all commands work**

## Expected Performance Improvements

| Optimization | Expected Reduction | New Time |
|-------------|-------------------|----------|
| Current baseline | - | 1016ms |
| Fix model error | 200ms | 816ms |
| Optimize skills-lock | 100ms | 716ms |
| Model cache | 100ms | 616ms |
| Ultra-fast mode | 580ms | **36ms** ✅ |

**Total improvement**: 980ms reduction → **28× faster**

## Verification Tests

```bash
# Test each optimization
time wzrd status                    # Baseline
time ./wzrd-ultra-fast status       # After optimizations

# Verify no regression
wzrd topic list
wzrd memory stats
wzrd --health
```

## Success Criteria

1. **`wzrd status` < 100ms** ✅ (Target: 36ms)
2. **All functionality preserved** ✅ (skill loading, token dashboard, memory)
3. **No model errors** ✅ (clean execution)
4. **28× speed achieved** ✅ (36ms vs 1016ms)

## Timeline

- **Phase 1**: 30 minutes (model error fix)
- **Phase 2**: 30 minutes (skills optimization)  
- **Phase 3**: 30 minutes (cache integration)
- **Phase 4**: 60 minutes (ultra-fast script)
- **Phase 5**: 30 minutes (merge back)

**Total**: 3 hours to achieve 28× speedup