---
name: git
description: Version control, branching strategies, and Git workflows
category: tools
priority: P0
tags: [git, version-control, collaboration]
subskills:
  - git-basics
  - branching-strategies
  - git-advanced
  - git-workflow
---

# Git Skill

## Purpose
Manage code versions, collaborate with teams, and track changes using Git.

## Core Principle
**"Git is your time machine. Use it well, and you can always go back."**

## Essential Commands

### Daily Workflow

```bash
# Check status
git status

# Add changes
git add file.ts
git add .                    # Add all changes

# Commit
git commit -m "feat: add authentication"

# Push
git push

# Pull latest
git pull
```

### Branching

```bash
# Create branch
git branch feature/login
git checkout feature/login
# or
git checkout -b feature/login

# List branches
git branch
git branch -a                # All branches including remote

# Delete branch
git branch -d feature-login  # Local
git branch -D feature-login  # Force delete

# Push branch to remote
git push -u origin feature-login
```

### Merging

```bash
# Merge current branch
git merge feature/login

# Merge with commit
git merge --no-ff feature/login

# Abort merge
git merge --abort
```

## Branching Strategies

### Feature Branch Workflow

```
main (protected)
├── develop
│   ├── feature/auth
│   ├── feature/ui
│   └── feature/api
│
└── hotfix/critical-bug
```

```bash
# Create feature from develop
git checkout develop
git checkout -b feature/auth

# Work, commit, push
git push -u origin feature/auth

# Create PR when done
# Merge back to develop via PR
```

### Gitflow Workflow

```
main (production releases)
├── develop (integration)
│   ├── feature (new features)
│   ├── hotfix (urgent fixes)
│   └── release (release preparation)
```

```bash
# Start feature
git checkout develop
git checkout -b feature/new-stuff

# Start release
git checkout develop
git checkout -b release/v1.0

# Hotfix (from main)
git checkout main
git checkout -b hotfix/critical-bug
# Merge to main AND develop
```

## Advanced Git

### Interactive Rebase

```bash
# Rebase last 3 commits
git rebase -i HEAD~3

# Commands during rebase:
# p, pick = use commit
# r, reword = edit commit message
# e, edit = amend commit
# s, squash = combine commits
# d, drop = remove commit
```

### Bisect (Find Bug)

```bash
# Start bisect
git bisect start

# Mark bad commit
git bisect bad    # Current version is broken

# Mark good commit
git bisect good  # Known working version

# Git will checkout middle point
# Test and mark good/bad
git bisect good
git bisect bad

# Continue until found
git bisect reset
```

### Stash

```bash
# Stash changes
git stash

# Stash with message
git stash save "work in progress"

# List stashes
git stash list

# Apply stash
git stash pop
git stash apply

# Drop stash
git stash drop
```

### Reset

```bash
# Soft reset (keep changes)
git reset --soft HEAD~1

# Mixed reset (stage changes)
git reset --mixed HEAD~1

# Hard reset (LOSES CHANGES)
git reset --hard HEAD~1

# Revert commit (new commit undoing changes)
git revert HEAD~1
```

## Git Bisect for Finding Regressions

```
Bug found in v1.5
Works in v1.3

git bisect start
git bisect bad v1.5
git bisect good v1.3

# Test each version
git bisect bad    # or good
# Continue until found
git bisect reset

Result: Commit abc123 introduced the bug
```

## Git History

### Viewing History

```bash
# Log with graph
git log --graph --oneline --all

# Log with stats
git log --stat

# Specific file history
git log -- path/to/file

# Commit details
git show <commit-hash>

# Who changed what
git blame file.ts
```

### Search History

```bash
# Search commit messages
git log --grep="bug"

# Search code
git grep "functionName"
git log -S "functionName"   # Commits that changed it
```

## Common Workflows

### Undo Last Commit

```bash
# Undo commit but keep changes
git reset --soft HEAD~1

# Undo commit and lose changes
git reset --hard HEAD~1

# Proper revert (new commit)
git revert HEAD
```

### Update from Main

```bash
# From feature branch
git checkout main
git pull

# Merge back to feature
git checkout feature/login
git merge main
```

### Squash Commits

```bash
# Interactive rebase to squash
git rebase -i HEAD~4

# Mark commits to squash with 's'
# Save and exit

# Or, soft reset and recommit
git reset --soft HEAD~3
git commit -m "feat: complete feature"
```

## GitHub Integration

### Pull Requests

```bash
# Push and create PR
git push -u origin feature/login
gh pr create --title "Add login" --body "Description"

# Checkout PR locally
gh pr checkout 123
```

### Fork Workflow

```bash
# Add upstream remote
git remote add upstream https://github.com/original/repo.git

# Fetch from upstream
git fetch upstream

# Merge upstream main
git checkout main
git merge upstream/main
```

## Git Hooks

### Pre-commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Run tests
npm test
if [ $? -ne 0 ]; then
  echo "Tests failed. Aborting commit."
  exit 1
fi

# Run linter
npm run lint
```

## Troubleshooting

### Merge Conflicts

```bash
# During merge
<<<<<<< HEAD
const x = 1;
=======
const x = 2;
>>>>>>> feature-branch

# Edit file, then:
git add file.ts
git commit
```

### Undo Almost Anything

```bash
# Undo local changes
git checkout -- file.ts

# Undo all local changes
git reset --hard HEAD

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Go to specific commit
git checkout <commit-hash>
git checkout -b new-branch
```

## Role-Shifting

When shifting **to** git mode:
```
"Using git..."
→ Check status first
→ Make changes
→ Stage and commit
→ Push when ready
```

## Gold Standard Integration

### Read-Back Verification
- Verify files were added/committed correctly
- Check that push was successful
- Confirm branch is correct

### Executable Proof
- Show git status output
- Demonstrate commit was created
- Verify with git log

---

**"Git saves you from yourself. Commit often, push safely."**
