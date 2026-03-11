# WZRD.dev Full Framework Integration Test

## Test Objective
Verify that all 7 components work together end-to-end

## Components to Test
1. ✅ API Layer (Multi-Channel)
2. ✅ Sandbox System (Warm Dev Box Pool)
3. ✅ Agent Harness (OpenCode Fork)
4. ✅ Blueprint Engine (Predictable Workflows)
5. ✅ Rules File (Domain-Specific Context)
6. ✅ Tool Shed Meta-Layer (Skill Registry)
7. ✅ Validation Layer (Quality Gates)

## Test Scenario
Build a simple "Hello World" web app that demonstrates:
- Sandbox creation
- Skill auto-loading
- Blueprint execution
- Quality validation
- Resource monitoring
- Cleanup automation

## Test Project
**Project Name**: `wzrd-test-app`
**Type**: Simple Node.js Express app
**Features**: 
- Web server on port 3000
- `/health` endpoint
- Basic logging
- Package.json with dependencies

## Test Steps

### Phase 1: Environment Setup
1. Create test project directory
2. Initialize package.json
3. Create simple Express app
4. Add health endpoint

### Phase 2: Framework Integration
1. Create sandbox for project
2. Verify sandbox type detection
3. Check resource allocation
4. Verify registry entry created

### Phase 3: Skill Execution
1. Auto-load appropriate skills
2. Execute "create web app" blueprint
3. Verify skill execution in sandbox

### Phase 4: Quality Validation
1. Run validation pipeline
2. Check code quality
3. Verify health endpoints
4. Validate resource usage

### Phase 5: Monitoring & Cleanup
1. Monitor sandbox health
2. Check resource usage metrics
3. Execute automatic cleanup
4. Verify cleanup completed

## Expected Results
- All 7 components work together seamlessly
- Sandbox created and configured automatically
- Skills auto-loaded based on project type
- Blueprint executed predictably
- Quality gates passed
- Resources cleaned up automatically

## Success Criteria
✅ Sandbox created successfully  
✅ Skills auto-loaded appropriately  
✅ Blueprint executed without errors  
✅ Validation pipeline passed  
✅ Resource monitoring active  
✅ Cleanup completed automatically  
✅ All integration points verified