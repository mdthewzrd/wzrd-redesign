---
name: github
description: GitHub search, repository navigation, and code discovery
category: github
priority: P0
tags: [github, git, open-source, code-search]
subskills:
  - github-search
  - repository-navigation
  - issues-prs
  - gist-actions
---

# GitHub Skill

## Purpose
Navigate, search, and utilize GitHub effectively for code discovery and research.

## Core Principle
**"GitHub is where code lives. Master it, and you master the world's code."**

## GitHub Search Syntax

### Basic Search

```
# Search code
github search "function authenticateUser" language:typescript

# Search repositories
github search "websocket server" stars:>1000

# Search issues
github search "bug: authentication" is:issue is:open
```

### Search Operators

| Operator | Example | Description |
|----------|---------|-------------|
| `in:name` | `api in:name` | Search repo names |
| `in:description` | `websocket in:description` | Search descriptions |
| `stars:>100` | `stars:>1000` | Minimum stars |
| `forks:true` | `forks:true` | Forked repos only |
| `language:python` | `language:python` | Language filter |
| `created:>2023` | `created:>2024-01-01` | Creation date |
| `pushed:>2024` | `pushed:>2024-01-01` | Last push |
| `user:username` | `user:torvalds` | By user |
| `org:orgname` | `org:facebook` | By organization |
| `topic:tag` | `topic:graphql` | By topic tag |

### Code Search (Advanced)

```
# Search across all code
"jwt" in:file language:typescript stars:>100

# Search in specific repo
"useState" repo:facebook/react language:typescript

# Search by path
"auth" path:src/ language:typescript

# Search by extension
"TODO" extension:md

# Exclude patterns
"debug" NOT "test" language:python
```

## Repository Navigation

### Repo Structure

```
owner/repo/
├── .github/           # GitHub-specific configs
│   ├── workflows/     # CI/CD
│   └── ISSUE_TEMPLATE/ # Issue templates
├── src/               # Source code
├── tests/             # Tests
├── docs/              # Documentation
├── README.md          # Start here
├── LICENSE            # License file
├── CONTRIBUTING.md    # How to contribute
├── package.json       # Dependencies
└── tsconfig.json      # TypeScript config
```

### Quick Access URLs

```
# Repository page
https://github.com/owner/repo

# Issues
https://github.com/owner/repo/issues

# Pull requests
https://github.com/owner/repo/pulls

# Actions/CI
https://github.com/owner/repo/actions

# Wiki
https://github.com/owner/repo/wiki

# Releases
https://github.com/owner/repo/releases
```

## Git + GitHub Commands

```bash
# Clone repository
git clone https://github.com/owner/repo.git
git clone git@github.com:owner/repo.git  # SSH

# Add remote
git remote add origin https://github.com/owner/repo.git

# Create from template (GitHub CLI)
gh repo create my-repo --template owner/template

# Fork repository
gh repo fork owner/repo

# Create issue
gh issue create --title "Bug" --body "Description"

# Create PR
gh pr create --title "Feature" --body "Description"

# View PR
gh pr view 123

# Merge PR
gh pr merge 123 --squash
```

## Issues & Pull Requests

### Issue Syntax

```markdown
## Issue Title

**Problem:** Clear description of what's wrong

**Expected:** What should happen

**Actual:** What actually happens

**Steps:**
1. Do this
2. Do that
3. See error

**Environment:**
- OS: Ubuntu 22.04
- Version: 1.2.3

**Logs:**
```
Error output here
```
```

### PR Syntax

```markdown
## Fix: Issue #123

**Changes:**
- Fixed authentication bug
- Added tests
- Updated docs

**Testing:**
- [x] Unit tests pass
- [x] Manual testing
- [x] Documentation updated

**Closes:** #123
```

### Search Issues/PRs

```
# Search in specific repo
is:issue is:open repo:owner/repo label:bug

# Search PRs
is:pr is:open author:username
is:pr is:merged review:approved
```

## Gists

### Creating Gists

```bash
# Via GitHub CLI
echo "console.log('hello')" | gh gist create -f -

# From file
gh gist create script.py --public --desc "My script"

# List gists
gh gist list

# View gist
gh gist view <gist-id>

# Clone gist
gh gist clone <gist-id>
```

## GitHub Actions

### Basic Workflow

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm test
```

### Workflow Triggers

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight
  workflow_dispatch:  # Manual trigger
```

## Topic Tags

Popular topics to explore:

```
# Discover by topic
https://github.com/topics/websocket
https://github.com/topics/graphql
https://github.com/topics/microservices
https://github.com/topics/machine-learning
https://github.com/topics/automation
```

## GitHub CLI (gh)

### Essential Commands

```bash
# Authentication
gh auth login

# Repository management
gh repo create my-repo --public --source=.
gh repo view
gh repo delete

# Issue/PR management
gh issue list
gh issue view 123
gh pr list
gh pr checks 123

# Release management
gh release list
gh release create v1.0.0 --notes "Release notes"

# Actions
gh workflow list
gh workflow run test.yml
```

## Discovery Patterns

### Finding Good Repositories

```
# By stars and recency
stars:>1000 pushed:>2024-01-01 language:typescript

# By topic and quality
topic:react stars:>5000 forks:>100

# By activity
stars:>1000 pushed:>2024-10-01 language:go

# Find alternatives to specific repo
stars:>1000 similar:owner/original-repo
```

### Finding Code Examples

```
# Implementation examples
"jwt authentication" language:go stars:>100
express websocket" language:javascript

# Specific patterns
"useMemo" "React hooks" language:typescript
"pytest fixture" language:python
```

## Role-Shifting

When shifting **to** GitHub mode:
```
"Searching GitHub..."
→ Formulate search query
→ Navigate repositories
→ Find relevant code
→ Extract patterns
```

## Gold Standard Integration

### Read-Back Verification
- Verify repo URLs work
- Confirm code examples are from actual repos
- Check that commands execute successfully

### Executable Proof
- Show search results with links
- Demonstrate clone/pull operations
- Show that code actually exists in repo

---

**"GitHub is the world's largest code repository. Learn to search it effectively."**
