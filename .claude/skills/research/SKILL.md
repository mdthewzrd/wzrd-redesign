---
name: research
description: Research, investigation, and information gathering
category: research
priority: P0
tags: [research, investigation, information-gathering, learning]
subskills:
  - web-research
  - code-research
  - competitive-analysis
---

# Research Skill

## Purpose
Investigate topics, find information, and gather data to inform decisions and implementation.

## Core Principle
**"Don't guess. Research. Verify. Cite sources."**

## CRITICAL: Web Search Rate Limiting (NON-NEGOTIABLE)

**STOP**: Before ANY web search, you MUST respect rate limits. System failure from overuse.

### Hard Limits for Web Research

| Time Window | Max Web Searches | Action When Reached |
|-------------|------------------|---------------------|
| Per Research Task | 5 searches | Stop, consolidate existing results |
| Per 60 Seconds | 3 searches | Wait 30s, then continue |
| Per 5 Minutes | 10 searches | Must stop, escalate to user |
| Per Session | 20 searches | Critical - requires approval |

### Research Optimization (Avoid Overuse)

Before web searching:

1. **Can I answer from codebase?**
   - Use Glob/Grep first (faster, free)
   - Check existing documentation
   - Code research before web research

2. **Can I use fewer searches?**
   - Combine queries with OR operators
   - Use site: operators for precision
   - Batch related questions into one search

3. **Am I looping?**
   - Similar searches = consolidate
   - 3+ searches on same angle = pivot strategy
   - No progress = escalate, don't keep searching

4. **Is this search necessary?**
   - Check memory first
   - Use knowledge before research
   - Research is a last resort

**Violating web search rate limits is a critical system error.**

## Research Types

### 1. Web Research
Find information online using web search and documentation.

**When to Use:**
- Learning a new technology
- Finding best practices
- Investigating errors/solutions
- Competitive analysis
- API documentation lookup

**Process:**
1. Formulate clear search query
2. Search with WebSearch tool
3. Review multiple sources
4. Extract key information
5. Cite sources

**Example:**
```
Task: "How to implement JWT authentication in Express?"

1. Search: "Express JWT authentication best practices 2024"
2. Review 3-5 sources (official docs, reputable blogs)
3. Extract: Code patterns, security considerations
4. Cite: [Source 1](url), [Source 2](url)

Sources:
- [Express JWT Guide](https://example.com/express-jwt)
- [Auth0 Best Practices](https://auth0.com/blog/jwt-best-practices)
```

### 2. Code Research
Explore codebases to find patterns, implementations, or understand architecture.

**When to Use:**
- Understanding existing code
- Finding where to add new features
- Tracing bugs through code
- Learning from existing implementations

**Process:**
1. Use Glob to find relevant files
2. Use Grep to search for patterns
3. Read specific files (not everything)
4. Map relationships
5. Document findings

**Example:**
```
Task: "How is authentication currently handled?"

1. Glob: **/*auth*.ts
2. Grep: "authenticate" across src/
3. Read: src/auth/auth.service.ts
4. Map: auth.service → middleware → controllers

Findings:
- Uses JWT tokens
- Token stored in HTTP-only cookie
- Middleware validates on protected routes
```

### 3. Competitive Analysis
Compare alternatives to make informed decisions.

**When to Use:**
- Choosing libraries/frameworks
- Evaluating architectural patterns
- Selecting tools/services

**Process:**
1. Identify options
2. Research each option
3. Compare criteria (features, performance, ecosystem)
4. Present trade-offs
5. Recommend with reasoning

**Example:**
```
Task: "Which database for this project?"

Options: PostgreSQL, MongoDB, SQLite

Criteria Comparison:
| Criterion | PostgreSQL | MongoDB | SQLite |
|-----------|-----------|---------|--------|
| Schema | Structured | Flexible | Structured |
| Scaling | Excellent | Good | Limited |
| Complexity | Medium | Low | Very Low |
| Use Case | Production | Prototype | Testing |

Recommendation: PostgreSQL for production
```

## Research Principles

### 1. Verify Sources
- Prefer official documentation
- Cross-reference multiple sources
- Check publication dates (prefer recent)
- Be skeptical of blogs (look for credibility)

### 2. Cite Sources
Always provide sources for research findings:

```markdown
According to [Express Documentation](https://expressjs.com/):
> "Express is a minimal and flexible Node.js web application framework"

Research from [source](url) shows that...
```

### 3. Distinguish Fact vs Opinion
- **Fact:** Can be verified, objective
- **Opinion:** Subjective, debatable

```
✅ "The library has 50k weekly downloads" (fact from npm)
✅ "Many developers recommend this for small projects" (opinion from articles)
❌ "This is the best library" (unsupported opinion)
```

### 4. Stay Focused
- Research with clear purpose
- Don't go down rabbit holes
- Set time limits
- Summarize findings

## Research Workflow

### 1. Define the Question
What are you trying to answer?
- Be specific
- Break down complex questions
- Identify what information you need

### 2. Choose Research Method
- Web search → External information
- Code search → Internal codebase
- Competitive → Compare options

### 3. Gather Information
- Use appropriate tools
- Collect from multiple sources
- Take notes on findings
- Track sources

### 4. Synthesize Findings
- Organize by theme
- Identify patterns
- Note contradictions
- Form conclusions

### 5. Present Results
- Clear summary
- Supporting evidence
- Source citations
- Recommendations if applicable

## Role-Shifting

When shifting **to** research mode:
```
"Shifting to research mode..."
→ Clarify what needs research
→ Search for information
→ Verify sources
→ Present findings with citations
```

When shifting **from** research mode:
```
"Research complete. Here's what I found:
→ Summary of findings
→ Key sources
→ Recommendations

Shifting to [next] mode..."
```

## Gold Standard Integration

### Read-Back Verification
- Verify research notes are accurate
- Confirm sources are correctly cited
- Check that findings address the question

### Executable Proof
- Show search results with sources
- Demonstrate code patterns found
- Cite specific documentation

### Loop Prevention
If research fails:
1. Refine search query
2. Try different sources
3. Escalate if information not found

## Examples

### Example 1: Web Research

```
Task: "Best practices for error handling in TypeScript 2024"

1. Search: "TypeScript error handling best practices 2024"

2. Sources Found:
   - [TypeScript Deep Dive](https://effectivetypescript.com/)
   - [Error Handling Guide](https://github.com/goldbergyoni/nodebestpractices)

3. Findings:
   - Use Error subtypes for different error types
   - Never throw non-Error objects
   - Use error codes for programmatic handling
   - Log errors with context

4. Summary with citations
```

### Example 2: Code Research

```
Task: "Where is user data validated?"

1. Grep: "validate.*user" across src/

2. Found in:
   - src/auth/validators.ts (user input validation)
   - src/user/user.service.ts (business logic validation)
   - src/middleware/validation.ts (request validation)

3. Read: src/auth/validators.ts
   → Uses Zod schema validation
   → Validates email format, password strength

4. Map: User creation flow
   Request → middleware → validators → service → database

5. Findings documented
```

### Example 3: Competitive Analysis

```
Task: "Which testing framework for this React project?"

Options: Jest, Vitest, Playwright

Comparison:

| Feature | Jest | Vitest | Playwright |
|---------|------|--------|------------|
| Unit Tests | ✅ | ✅ | ❌ |
| Component Tests | ✅ | ✅ | ✅ |
| E2E Tests | ❌ | ❌ | ✅ |
| Speed | Medium | Fast | Slow |
| Setup | Built-in (CRA) | Simple | Medium |

Recommendation:
- Use Vitest for unit/component tests (faster, native ESM)
- Use Playwright for E2E tests (cross-browser)

Sources:
- [Vitest Docs](https://vitest.dev/)
- [Playwright Docs](https://playwright.dev/)
```

## Research Checklist

Before considering research complete:
- [ ] Question clearly answered
- [ ] Multiple sources consulted
- [ ] Sources cited
- [ ] Findings synthesized
- [ ] Contradictions noted
- [ ] Recommendations (if applicable)

---

**"Good research is finding the right answers. Great research is asking the right questions."**
