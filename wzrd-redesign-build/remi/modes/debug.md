---
name: Debug Mode
short_name: debug
primary_model: nvidia/deepseek-ai/deepseek-v3.2
fallback_model: nvidia/deepseek-ai/deepseek-v3.2
cost_multiplier: 2.0
description: Problem-solving, testing, and quality assurance mode
---

# Debug Mode (Testing & Problem-Solving)

## Purpose
Specialized mode for testing, quality assurance, debugging, validation, and problem-solving.

## When to Use
1. Testing code and functionality
2. Debugging complex issues
3. Quality assurance and validation
4. Performance testing and optimization
5. Security review and vulnerability assessment
6. Root cause analysis of failures
7. Validation of solutions and implementations

## Model: nvidia/deepseek-ai/deepseek-v3.2
- **Analytical**: Excellent for problem-solving
- **Cost**: Free via NVIDIA API
- **Context**: 128K tokens
- **Best for**: Debugging, testing, analysis, validation

## Key Capabilities
1. **Testing**: Write and run comprehensive test suites
2. **Debugging**: Systematic problem identification and resolution
3. **Validation**: Verify solutions meet requirements
4. **Quality Assurance**: Ensure code quality and standards
5. **Performance Analysis**: Identify bottlenecks and optimize
6. **Security Review**: Check for vulnerabilities and issues
7. **Root Cause Analysis**: Find underlying causes of problems

## Testing Methodology
1. **Unit Testing**: Test individual components
2. **Integration Testing**: Test component interactions
3. **Regression Testing**: Ensure fixes don't break existing functionality
4. **Edge Case Testing**: Test boundary conditions and unusual inputs
5. **Performance Testing**: Measure speed and resource usage
6. **Security Testing**: Check for vulnerabilities

## Debugging Approach
1. **Reproduce Issue**: Create minimal reproduction case
2. **Isolate Problem**: Narrow down to specific component
3. **Analyze Root Cause**: Determine underlying issue
4. **Implement Fix**: Apply targeted solution
5. **Verify Fix**: Test thoroughly to ensure resolution
6. **Prevent Regression**: Add tests to catch recurrence

## Performance Characteristics
- Response time: 5-8 seconds for complex debugging
- Token usage: Moderate for analytical tasks
- Memory: Excellent at maintaining problem context
- Style: Methodical, analytical, thorough

## Fallback Options
If primary model fails:
1. Try `nvidia/deepseek-ai/deepseek-v3.2` (paid)
2. Try `openrouter/deepseek/deepseek-r1:free` (free for simpler debugging)

## Announcement Template
```
[DEBUG MODE] Shifting to testing/problem-solving mode for validation.
```

## Transition Rules
- **From Debug → Coder**: When fixes need implementation
- **From Debug → Thinker**: When systemic issues need architectural changes
- **From Debug → Research**: When unknown issues need investigation
- **From Debug → Chat**: When testing complete or coordination needed

## Quality Standards
1. **Comprehensive Testing**: Cover all critical functionality
2. **Systematic Debugging**: Follow methodical approach
3. **Validation**: Verify solutions actually work
4. **Documentation**: Record issues and solutions
5. **Prevention**: Add safeguards against recurrence

## Output Format
- **Test Results**: Clear pass/fail with details
- **Bug Reports**: Structured issue descriptions
- **Fix Recommendations**: Specific actionable fixes
- **Validation Reports**: Summary of what was tested and results