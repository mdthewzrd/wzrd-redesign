# Blueprint Creation

## Description
Create, manage, and evolve workflow blueprints for repeatable, predictable agentic engineering. Capture patterns from ad-hoc work and convert them into systematic workflows.

## When to Use
- After completing a task that might be repeated
- When establishing standardized workflows
- To improve consistency and quality
- When onboarding new patterns
- To reduce "running in circles" situations

## Blueprint Structure

### Required Components
1. **Metadata**: name, version, description, tags
2. **Trigger**: When to activate this blueprint
3. **Phases**: Step-by-step execution flow
4. **Validation**: Quality gates at each phase
5. **Resources**: Skills, tools, token budgets needed
6. **Output**: Expected results and success criteria

### Blueprint Types
- **feature_implementation**: Build new functionality
- **bug_fixing**: Debug and fix issues
- **research**: Investigate and analyze
- **planning**: Design and architect
- **refactoring**: Improve existing code
- **testing**: Validate and verify
- **documentation**: Create guides
- **deployment**: Release to production

## Process

### Step 1: Capture Pattern (During/After Work)
```
When you notice:
- Doing similar steps repeatedly
- Following a consistent process
- Could delegate this to another agent
- Want consistency across sessions

Then create a blueprint.
```

### Step 2: Define Trigger
- Keywords that activate the blueprint
- Context conditions (project type, mode, etc.)
- Preconditions that must be met

### Step 3: Map Phases
- Break work into logical phases
- Define entry/exit criteria for each
- Specify tools needed per phase
- Set token budgets per phase

### Step 4: Add Validation
- Pre-execution: Can we do this?
- Mid-execution: Are we on track?
- Post-execution: Did we succeed?

### Step 5: Document & Test
- Save to `conductor/blueprint-engine.yaml`
- Test with a real task
- Iterate based on results
- Share with team

## Quick Blueprint Template

```yaml
blueprint_name:
  description: "What this blueprint does"
  trigger:
    keywords: ["keyword1", "keyword2"]
    context: { mode: "coding", project_type: "nodejs" }
  phases:
    - name: "phase_one"
      description: "What happens in this phase"
      steps:
        - id: "step_1"
          description: "First thing to do"
          tools: ["tool1", "tool2"]
          validation: "pre_execution"
        - id: "step_2"
          description: "Second thing"
          tools: ["tool3"]
          validation: "mid_execution"
      exit_criteria: "How we know phase is complete"
  resources:
    skills: ["skill1", "skill2"]
    token_budget: 15000
    time_estimate: "10 minutes"
  validation_gates:
    - "pre_execution"
    - "post_execution"
  output:
    artifacts: ["file1", "file2"]
    success_criteria: "How we know blueprint succeeded"
```

## Examples

### Creating from Scratch
```
User: "I want to standardize how we review code"
Agent: "I'll create a code review blueprint..."

Result: code_review blueprint with:
- Phase 1: Understand changes
- Phase 2: Check patterns
- Phase 3: Validate quality
- Phase 4: Document findings
```

### Evolving from Experience
```
After fixing 5 bugs with similar process:
- Capture the pattern
- Document the steps
- Add validation checks
- Create bug_fixing blueprint
```

## Best Practices

### Do
- Start simple, add complexity as needed
- Use real work to inform blueprints
- Test before sharing
- Document why, not just what
- Make validation criteria measurable

### Don't
- Over-engineer initially
- Create blueprints for one-off tasks
- Skip validation gates
- Ignore failure modes
- Forget to iterate

## Integration

### With Conductor
- Blueprints stored in `conductor/blueprint-engine.yaml`
- Auto-loaded by framework
- Mode detection triggers appropriate blueprint

### With Tool Shed
- Blueprints reference skills from tool shed
- Skills validate blueprint requirements
- Tool discovery enhances blueprints

### With Validation
- Each phase has validation gates
- Pre/mid/post execution checks
- Quality gates ensure standards

## Proactive Discovery

Remi should proactively suggest creating blueprints when:
1. **Pattern detected**: Similar requests 3+ times
2. **Complex workflow**: Multi-step process emerges
3. **Quality issues**: Inconsistent results
4. **Delegation needed**: Could hand off to another agent
5. **Documentation gap**: Tribal knowledge not captured

### Discovery Questions
- "Would you like me to create a blueprint for this workflow?"
- "I've noticed we do this often - should we standardize it?"
- "This pattern could help other agents - capture it?"
- "Want to make this process repeatable?"

## Maintenance

### Review Cadence
- Weekly: Check which blueprints were used
- Monthly: Review success rates
- Quarterly: Archive unused blueprints
- As needed: Update based on feedback

### Metrics
- Usage frequency
- Success rate
- Time saved vs ad-hoc
- User satisfaction

## Files

- **Location**: `conductor/blueprint-engine.yaml`
- **Schema**: `conductor/blueprint-schema.yaml`
- **Generated**: `logs/blueprint-*.log`
- **Registry**: Tracked in conductor context
