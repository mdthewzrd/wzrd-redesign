---
name: e2e-test
description: WZRD.dev comprehensive end-to-end testing. Launches parallel sub-agents to research codebase structure, then tests every user journey with browser automation, screenshots, UI/UX validation, and database verification. Run after implementation to validate everything before code review.
category: testing
priority: P0
tags: [e2e, testing, validation, browser, automation]
---

# WZRD.dev End-to-End Testing

## Purpose
Comprehensive E2E testing framework for WZRD.dev projects. Ensures all user journeys work correctly with visual proof and database validation.

## Core Principle
**"The point is not to be fast. The point is to be comprehensive." - Cole Medine**

## Six-Phase Workflow

### Phase 0: Pre-flight Check

#### 1. Platform Check

Verify platform compatibility:
```bash
uname -s
```
- `Linux` or `Darwin` → proceed
- Anything else → stop with error

#### 2. Frontend Check

Check for browser-accessible frontend:
```bash
# Look for package.json with dev script
ls package.json

# Look for frontend framework files
ls src/ app/ pages/ index.html
```

If no frontend found:
> "This application doesn't appear to have a browser-accessible frontend. E2E browser testing requires a UI to test."

#### 3. Testing Tool Check

Check for available testing tools (in priority order):

**Option 1: agent-browser (Preferred)**
```bash
agent-browser --version
# Install if missing:
npm install -g agent-browser
agent-browser install --with-deps
```

**Option 2: Playwright**
```bash
npx playwright --version
# Install if missing:
npm install -D playwright @playwright/test
npx playwright install --with-deps
```

**Option 3: Puppeteer**
```bash
npx puppeteer --version
# Install if missing:
npm install -D puppeteer
```

#### 4. Database Check

Check database availability:
```bash
# Check .env.example for connection strings
cat .env.example | grep -E "(DATABASE|DB_URL|POSTGRES|SQLITE)"
```

### Phase 1: Parallel Research

Launch **three parallel sub-agents** using the Task tool.

#### Sub-agent 1: Application Structure & User Journeys

> Research this codebase thoroughly. Return a structured JSON covering:
>
> ```json
> {
>   "startup": {
>     "install": "npm install",
>     "dev": "npm run dev",
>     "url": "http://localhost:3000",
>     "port": 3000
>   },
>   "authentication": {
>     "required": false,
>     "method": "none|jwt|session|oauth",
>     "test_credentials": {}
>   },
>   "routes": [
>     { "path": "/", "name": "Homepage", "description": "Landing page" }
>   ],
>   "journeys": [
>     {
>       "name": "View dashboard",
>       "steps": [
>         { "action": "navigate", "target": "/" },
>         { "action": "wait", "condition": "networkidle" }
>       ],
>       "expected": "Dashboard loads with metrics"
>     }
>   ],
>   "components": [
>     { "type": "form", "selector": "#login-form", "fields": ["email", "password"] }
>   ]
> }
> ```

#### Sub-agent 2: Database Schema & Data Flows

> Research the database layer. Return structured JSON covering:
>
> ```json
> {
>   "database": {
>     "type": "sqlite|postgres|mysql|mongodb",
>     "connection_env_var": "DATABASE_URL",
>     "connection_string_example": "postgres://user:pass@localhost:5432/db"
>   },
>   "schema": {
>     "table_name": {
>       "columns": {
>         "id": "integer primary key",
>         "name": "text not null"
>       }
>     }
>   },
>   "data_flows": [
>     {
>       "action": "create_user",
>       "tables_affected": ["users"],
>       "operation": "INSERT",
>       "validation_query": "SELECT * FROM users WHERE email = ?"
>     }
>   ]
> }
> ```

#### Sub-agent 3: Bug Hunting

> Analyze this codebase for bugs, issues, and code quality problems. Return prioritized JSON:
>
> ```json
> {
>   "critical": [
>     { "file": "src/auth.ts", "line": 42, "issue": "Missing null check on user", "fix": "Add user !== null check" }
>   ],
>   "high": [
>     { "file": "src/api.ts", "line": 15, "issue": "No error handling on fetch", "fix": "Wrap in try/catch" }
>   ],
>   "medium": [
>     { "file": "src/ui.tsx", "line": 8, "issue": "Missing loading state", "fix": "Add isLoading state" }
>   ]
> }
> ```

**Wait for all three sub-agents to complete before proceeding.**

### Phase 2: Start the Application

1. Install dependencies: `npm install` (if needed)
2. Start dev server in background: `npm run dev &`
3. Wait for server to be ready (check URL is accessible)
4. Navigate to app with testing tool
5. Take initial screenshot: `e2e-screenshots/00-initial-load.png`

### Phase 3: Create Task List

Using research results, create tasks for each user journey:

```typescript
// Example task structure
{
  subject: "Test login flow",
  description: "Navigate to login, enter credentials, submit, verify redirect",
  activeForm: "Testing login flow"
}
```

Add final task: "Responsive testing across viewports."

### Phase 4: User Journey Testing

For each task, execute comprehensive testing.

#### 4a. Browser Testing

**Using agent-browser:**
```bash
agent-browser open http://localhost:3000
agent-browser snapshot -i
agent-browser click @e1
agent-browser fill @e2 "test@example.com"
agent-browser screenshot e2e-screenshots/login/01-filled-form.png
```

**Using Playwright (TypeScript):**
```typescript
import { test, expect } from '@playwright/test';

test('login flow', async ({ page }) => {
  await page.goto('http://localhost:3000');

  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password123');

  await page.screenshot({ path: 'e2e-screenshots/login/01-filled-form.png' });

  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');

  await expect(page.locator('h1')).toContainText('Dashboard');
  await page.screenshot({ path: 'e2e-screenshots/login/02-success.png' });
});
```

**For each step:**
1. Navigate/interact
2. Wait for page to settle
3. **Take screenshot** (descriptive path)
4. **Analyze screenshot** with Read tool or ui-vision skill
5. Check console for errors
6. Verify expected content is present

#### 4b. Database Validation

After any data-modifying action:

**SQLite:**
```bash
sqlite3 database.db "SELECT * FROM users WHERE email = 'test@example.com'"
```

**Postgres:**
```bash
psql "$DATABASE_URL" -c "SELECT * FROM users WHERE email = 'test@example.com'"
```

**Verify:**
- Records created/updated as expected
- Values match UI input
- No orphaned or duplicate records

#### 4c. Issue Handling

When an issue is found:
1. **Document** what was expected vs what happened
2. **Fix the code** directly
3. **Re-run** the failing step
4. **Take new screenshot** confirming fix
5. Update bug hunt findings

#### 4d. Responsive Testing

Test key pages at multiple viewports:

| Viewport | Width | Height | Name |
|----------|-------|--------|------|
| Mobile | 375 | 667 | Mobile |
| Tablet | 768 | 1024 | Tablet |
| Desktop | 1920 | 1080 | Desktop |
| Widescreen | 2560 | 1440 | Widescreen |

At each viewport, check:
- Layout issues (overflow, broken alignment)
- Touch target sizes (minimum 44x44 on mobile)
- Content visibility
- Interaction usability

### Phase 5: Cleanup

1. Stop dev server background process
2. Close browser sessions
3. Clean up test data (if needed)
4. Verify no orphaned processes

### Phase 6: Report

#### Summary (Always Output)

```markdown
## E2E Testing Complete

**Journeys Tested:** 5
**Screenshots Captured:** 23
**Issues Found:** 7 (5 fixed, 2 remaining)

### Issues Fixed During Testing
- [Description] — [file:line]

### Remaining Issues
- [Description] — severity: [high/medium/low] — [file:line]

### Bug Hunt Findings (from code analysis)
- [Description] — severity — [file:line]

### Screenshots
All saved to: `e2e-screenshots/`
```

#### Full Report (Optional)

Ask user:
> "Would you like me to export the full testing report to a markdown file?"

If yes, create `e2e-test-report.md` with:
- Full summary with stats
- Per-journey breakdown
- All issues with details
- Database validation results
- Recommendations

## WZRD.dev Integration

### Gold Standard Workflow

Add to validation phase:

```markdown
### Validation Phase

1. **Code Review** - Review implementation for quality
2. **E2E Testing** - Run comprehensive E2E tests
3. **Documentation** - Update docs if needed
4. **Memory Update** - Extract learnings to memory
```

### PIV Loop Integration

```
Plan → Implement → Validate (E2E) → Iterate
```

## Project-Specific Patterns

### Health Monitoring (`ops/health`)

**User Journeys:**
1. Load dashboard
2. View system metrics (CPU, memory, disk, load)
3. Check health status indicators
4. Review alerts
5. View historical trends (if available)

**Validation:**
- Dashboard loads with all metrics
- Status indicators show correct colors
- Alerts trigger at correct thresholds
- Discord alerting works

### Gateway V2 (`gateway-v2`)

**User Journeys:**
1. Start Gateway
2. Connect via WebSocket
3. Send message
4. Receive response
5. Health check endpoint

**Validation:**
- Gateway starts without errors
- WebSocket connection works
- Message routing works
- Health endpoint returns 200

### Dilution Agent

**User Journeys:**
1. Query SEC filings
2. Parse filing data
3. Calculate dilution metrics
4. Return analysis

**Validation:**
- API endpoints respond correctly
- Parsing handles edge cases
- Calculations are accurate
- Error handling works

## Best Practices

### 1. Comprehensive Over Fast
- Test EVERY interaction, EVERY form, EVERY button
- Don't skip "obvious" paths
- Assume nothing works until proven

### 2. Screenshots Everywhere
- Take screenshot after every significant step
- Use descriptive file names
- Organize by journey: `e2e-screenshots/login/01-form.png`

### 3. Database Validation
- Query DB directly after data modifications
- Verify values match UI input
- Check for orphaned/duplicate records

### 4. Fix Blockers Only
- **Fix:** Critical and high-severity bugs
- **Report:** Medium and low-severity issues
- Don't spend time on minor issues during testing

### 5. Consistent Output
- Use same format every time
- JSON for data, Markdown for reports
- Makes results predictable and analyzable

## Tool Commands Reference

### agent-browser
```bash
agent-browser open <url>              # Navigate
agent-browser snapshot -i             # Get interactive elements
agent-browser click @eN               # Click element
agent-browser fill @eN "text"         # Fill field
agent-browser select @eN "option"     # Select dropdown
agent-browser press <key>            # Press key
agent-browser screenshot <path>       # Take screenshot
agent-browser set viewport W H        # Set viewport
agent-browser wait --load networkidle # Wait for load
agent-browser console                 # Check console errors
agent-browser close                   # Close browser
```

### Playwright
```typescript
page.goto(url)
page.fill(selector, text)
page.click(selector)
page.screenshot({ path })
page.waitForSelector(selector)
page.waitForURL(url)
expect(locator).toHaveText(text)
```

### Database
```bash
# SQLite
sqlite3 db.sqlite "SELECT * FROM table"

# Postgres
psql "$DATABASE_URL" -c "SELECT * FROM table"

# MySQL
mysql -u user -p database -e "SELECT * FROM table"
```

## Memory Integration

After each E2E test run, extract to memory:

```markdown
## E2E Test Results (YYYY-MM-DD)

### Project: [project-name]

### Test Summary
- Journeys tested: [count]
- Screenshots: [count]
- Issues found: [count]
- Issues fixed: [count]

### Key Findings
- [What worked well]
- [What didn't work]
- [Patterns discovered]

### Recommendations
- [What to improve]
- [What to watch for]
```

---

**"Comprehensive testing catches bugs that slip through. Every screenshot is proof of functionality."**
