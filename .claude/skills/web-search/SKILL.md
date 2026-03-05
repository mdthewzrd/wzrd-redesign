---
name: web-search
description: Advanced web searching, source verification, and information discovery
category: research
priority: P0
tags: [web-search, research, information-discovery, sources]
subskills:
  - search-operators
  - source-verification
  - documentation-finding
  - forum-search
---

# Web Search Skill

## Purpose
Find information quickly using advanced search techniques and verify source credibility.

## Core Principle
**"The web has all answers. Knowing how to ask is the skill."**

## CRITICAL: Rate Limiting (NON-NEGOTIABLE)

**STOP**: Before using WebSearch, you MUST track your usage. Overuse will cause system failure.

### Hard Limits (Never Exceed)

| Time Window | Max Searches | Action When Reached |
|-------------|--------------|---------------------|
| Per Task | 5 searches | Stop, consolidate results |
| Per 60 Seconds | 3 searches | Wait 30s, then continue |
| Per 5 Minutes | 10 searches | Must stop, escalate if needed |
| Per Session | 20 searches | Critical threshold - requires user approval |

### Search Optimization Strategies

Before making a new search, ask:

1. **Do I already have this information?**
   - Check previous search results
   - Review memory/context
   - Don't search for the same thing twice

2. **Can I combine multiple queries into one?**
   - Use OR operators: `term1 OR term2`
   - Use site: to target specific domains
   - Use comprehensive queries instead of narrow ones

3. **Is this search necessary?**
   - Can I answer from context?
   - Is this a known pattern I should know?
   - Would documentation be better?

4. **Am I in a loop?**
   - Similar queries = stop and consolidate
   - 3+ searches on same topic = shift strategy
   - No progress after 3 searches = escalate

### Mandatory Usage Tracking

When using WebSearch, implicitly track:
- Current task search count
- Recent search timestamps (last 60s, 5min)
- Total session searches

**Violating rate limits is a critical system error.**

## WebSearch Tool Usage

### Basic Pattern

```
User: "How do I use WebSearch?"
→ WebSearch: query with specific terms
→ Review multiple sources
→ Extract key information
→ Cite sources
```

### Advanced Search Operators

```
# Exact phrase
"machine learning tutorial"

# Exclude words
python -java -ruby

# Site-specific
site:docs.python.org async await

# File type
filetype:pdf neural network guide
filetype:md github actions

# Title search
intitle:"typescript" "generics"
intext:"error" "connection refused"

# URL search
inurl:docs API reference

# Related sites
related:reddit.com programming

# Numeric ranges
iphone price $500..$800

# Wildcard
"how to * a * in python"
```

### Time-Based Searches

```
# Past 24 hours
when:1

# Past week
when:7

# Past month
when:30

# Past year
when:365

# Custom date range
after:2024-01-01 before:2024-06-01
```

## Source Verification

### Evaluating Credibility

**High Credibility:**
- Official documentation (docs.python.org, developer.mozilla.org)
- University sources (.edu)
- Government sites (.gov)
- Established tech companies (cloud.google.com, aws.amazon.com)
- Peer-reviewed papers linked from university sites

**Medium Credibility:**
- Reputable tech blogs (dev.to, hashnode.com)
- Well-maintained GitHub READMEs
- Stack Overflow (with high score answers)

**Low Credibility:**
- Content farms (copied content, ads everywhere)
- Unknown blogs without author attribution
- Forums without voting/review system
- Outdated content (check dates)

### Verification Steps

```
1. Check source domain (official? personal? unknown?)
2. Check date (is information current?)
3. Check author (credentials? expertise?)
4. Cross-reference (do other sources agree?)
5. Check for bias (vendor-neutral? selling something?)
```

## Documentation Finding

### Official Documentation

```
# Python docs
site:docs.python.org OR site:peps.python.org

# JavaScript/Node docs
site:developer.mozilla.org javascript
site:nodejs.org OR site:github.com nodejs

# React docs
site:react.dev OR site:legacy.reactjs.org

# TypeScript
site:typescript-eslint.org
site:github.com/microsoft/TypeScript
```

### API Documentation

```
# Find API docs
"[API name]" API documentation
"[framework]" API reference

# Specific versions
"express 4.x" documentation
"react 18" hooks API
```

### Finding Tutorials

```
# Quality tutorials
"python tutorial" site:realpython.com
"javascript guide" site:javascript.info
"docker tutorial" site:docs.docker.com

# Video tutorials
"typescript" site:youtube.com playlist
```

## Forum & Community Search

### Stack Overflow

```
# Search Stack Overflow
site:stackoverflow.com "error message" python

# Filter by score
site:stackoverflow.com "oauth" score:50

# Filter by date
site:stackoverflow.com "next.js" after:2024-01-01
```

### Reddit

```
# Programming subreddits
site:reddit.com/r/programming
site:reddit.com/r/webdev
site:reddit.com/r/python
site:reddit.com/r/golang

# Get specific answers
site:reddit.com/r/typescript "generics"
```

### GitHub Discussions

```
# GitHub repo discussions
site:github.com/vercel/next.js/discussions
site:github.com/facebook/react/discussions
```

## Research Strategies

### Research Workflow

```
1. Broad Search
   → Start with general terms
   → Gather overview

2. Narrow Down
   → Add specific keywords
   → Use site: operators

3. Cross-Reference
   → Check multiple sources
   → Verify agreement

4. Go Deep
   → Follow documentation links
   → Find official examples

5. Verify Recent
   → Check publication dates
   → Ensure current info
```

### Fact-Checking

```
# Claim seems questionable?
→ Search for "[claim] myth"
→ Search for "[claim] debunk"
→ Check scientific sources (.edu, .gov)

# Technology comparison?
→ "X vs Y" comparison
→ Benchmark results
→ Real-world usage studies
```

## Search by Intent

### Learning a Technology

```
# Start with official docs
"[technology] official documentation"
"[technology] getting started"

# Then tutorials
"[technology] tutorial" site:youtube.com
"[technology] examples"

# Then best practices
"[technology] best practices"
"[technology] patterns"
```

### Solving Errors

```
# Exact error message
"Error: EADDRINUSE" nodejs

# Without quotes (better matching)
EADDRINUSE port already in use

# Add context
EADDRINUSE express 3000
```

### Finding Libraries

```
# Compare alternatives
"vs OR alternatives" [library]

# By popularity
"[language] [category] library" stars:>1000

# Recent and maintained
"[language] [category]" pushed:>2024-01-01
```

## Search Shortcuts

### Quick Answers

```
# Definitions
"define: [term]"

# Calculations
"sqrt(144)" OR "144 * 32"

# Conversions
"100 USD to EUR"
"celsius to fahrenheit"
```

### File Type Searches

```
# Find code examples
filetype:js "react component"
filetype:py "async await example"

# Find slides/PDFs
filetype:pdf "machine learning guide"
filetype:ppt "architecture"
```

## Common Search Patterns

### Finding Examples

```
# Code examples
"[language] [concept] example"
"[framework] [component] example"

# Implementation patterns
"[pattern] implementation in [language]"
"how to [task] in [language]"
```

### Troubleshooting

```
# Error + solution
"[error] fix" OR "[error] solution"
"[error] stackoverflow"

# Version-specific
"[error] [version] [framework]"
```

## Citing Sources

### Citation Format

```markdown
According to [Source Name](URL):
> "Relevant quote or key information"

Research shows that [Source](URL) indicates...
```

### Multiple Sources

```markdown
**Sources:**
- [Official Docs](url1)
- [Stack Overflow](url2)
- [Blog Post](url3)
```

## Role-Shifting

When shifting **to** web-search mode:
```
"Shifting to research mode..."
→ Formulate search query
→ Use WebSearch tool
→ Review multiple sources
→ Extract and synthesize
→ Cite sources
```

## Gold Standard Integration

### Read-Back Verification
- Verify URLs work
- Confirm quotes are accurate
- Check source credibility

### Executable Proof
- Show search results
- Demonstrate URL accessibility
- Cite specific sources

---

**"The right search query finds the right answer in seconds."**
