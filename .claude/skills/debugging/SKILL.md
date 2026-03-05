---
name: debugging
description: Debugging strategies, troubleshooting, and problem-solving
category: debugging
priority: P0
tags: [debugging, troubleshooting, problem-solving]
subskills:
  - debugging-strategies
  - common-errors
  - debugging-tools
---

# Debugging Skill

## Purpose
Systematically find, identify, and fix bugs using proven debugging strategies.

## Core Principle
**"Don't guess. Debug systematically. Verify everything."**

## Debugging Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    DEBUGGING WORKFLOW                       │
│                                                             │
│  1. REPRODUCE                                               │
│     └─ Can you make it happen consistently?                 │
│                                                             │
│  2. ISOLATE                                                 │
│     └─ What component/system is causing it?                │
│                                                             │
│  3. HYPOTHESIZE                                             │
│     └─ What do you think is wrong?                         │
│                                                             │
│  4. TEST                                                    │
│     └─ Verify your hypothesis with evidence                │
│                                                             │
│  5. FIX                                                     │
│     └─ Make the minimal change to fix the issue            │
│                                                             │
│  6. VERIFY                                                  │
│     └─ Confirm fix works and doesn't break other things    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Step 1: Reproduce the Bug

### Questions to Ask
- What steps trigger the bug?
- Is it consistent or intermittent?
- What environment does it occur in?
- What's the expected vs actual behavior?

### Create a Minimal Reproduction
```typescript
// ❌ BAD: "Login doesn't work"
// Too vague, no details

// ✅ GOOD:
// Steps to reproduce:
// 1. Go to /login
// 2. Enter email: test@example.com
// 3. Enter password: Test123!
// 4. Click "Login"
// 5. Expected: Redirect to dashboard
// 6. Actual: Shows "Invalid credentials" error
```

### If You Can't Reproduce
- Get exact steps from user
- Check environment differences
- Look at logs for error messages
- Ask for screenshots/screen recordings

## Step 2: Isolate the Problem

### Binary Search Debugging
```
System has 10 components, bug somewhere.

1. Test first half (components 1-5)
   └─ Bug present? → It's in 1-5
   └─ Bug absent? → It's in 6-10

2. Repeat until component found

✅ Efficient elimination
❌ Requires testable components
```

### Rubber Ducking
Explain the problem out loud:
- "The user sends a request to the API..."
- "The API validates the token..."
- "The token is valid so it continues..."
- "Wait, why is it validating here?"

Often you'll spot the issue while explaining.

### Add Logging Strategically
```
❌ BAD: Adding console.log everywhere

✅ GOOD: Add logs at decision points
   console.log('[Auth] Token received:', token.slice(0, 10) + '...');
   console.log('[Auth] Token valid:', isValid);
   console.log('[Auth] User found:', user ? user.id : 'null');
```

## Step 3: Form a Hypothesis

### Good Hypotheses
- Specific: "The JWT token is expiring before the request completes"
- Testable: Can be verified with evidence
- Falsifiable: Can be proven wrong

### Bad Hypotheses
- Vague: "Something is wrong with auth"
- Untestable: "It's a race condition somewhere"
- Unfalsifiable: "The code is just broken"

### Hypothesis Template
```
"I believe the bug is caused by [specific cause]
because [reasoning].

If this is true, then [expected result]
when I [test action]."
```

## Step 4: Test Your Hypothesis

### Use Your Tools

**Browser DevTools:**
```
Console: Check for JavaScript errors
Network: Check API calls, responses
Elements: Inspect DOM, CSS
Sources: Set breakpoints, step through code
```

**Node.js Debugger:**
```bash
node inspect script.js
# or
node --inspect-brk script.js
```

**Python Debugger:**
```bash
python -m pdb script.py
# or in code:
import pdb; pdb.set_trace()
```

### Verification Examples

```
Hypothesis: "Token is expiring too early"

Test: Log token expiration time
Result: Token expires in 5 minutes, request takes 2 seconds
Conclusion: ❌ Hypothesis rejected

New Hypothesis: "Token format is wrong"
Test: Compare token format with docs
Result: Missing "Bearer " prefix
Conclusion: ✅ Hypothesis confirmed
```

## Step 5: Fix the Issue

### Fix Principles
1. **Minimal Change** - Fix only what's broken
2. **Understand First** - Don't fix by coincidence
3. **Add Tests** - Prevent regression
4. **Document** - Explain the fix in comments

### Fix Example

```typescript
// ❌ BAD: Coincidental fix
// Tried changing timeout from 5000 to 10000 and it works!
// (But don't know why)

// ✅ GOOD: Understood fix
// The issue was that async operations weren't being awaited.
// Added `await` keyword and now the function properly waits
// for the promise to resolve before continuing.
async function fetchUser(id: string) {
  const response = await fetch(`/api/users/${id}`);
  return await response.json();
}
```

## Step 6: Verify the Fix

### Verification Checklist
- [ ] Bug is no longer present
- [ ] Fix doesn't break other functionality
- [ ] Edge cases are handled
- [ ] Tests added to prevent regression
- [ ] Code is committed with clear message

### Regression Testing
```typescript
// Test the fix
test('user can login with valid credentials', async () => {
  const result = await loginUser('test@example.com', 'password');
  expect(result.success).toBe(true);
});

// Test that we didn't break anything else
test('login fails with invalid credentials', async () => {
  const result = await loginUser('test@example.com', 'wrong');
  expect(result.success).toBe(false);
});
```

## Common Bug Patterns

### 1. Async/Await Issues

```typescript
// ❌ Forgetting await
async function getUser() {
  const user = fetchUser(id);  // Returns promise, not user
  return user.name;  // Error: can't read name of promise
}

// ✅ Properly awaiting
async function getUser() {
  const user = await fetchUser(id);
  return user.name;
}
```

### 2. Null/Undefined Errors

```typescript
// ❌ Not checking for null
function getEmail(user: User) {
  return user.email.toLowerCase();  // Crash if user is null
}

// ✅ Defensive programming
function getEmail(user: User | null) {
  if (!user) return null;
  return user.email.toLowerCase();
}

// ✅ Optional chaining
function getEmail(user: User | null) {
  return user?.email?.toLowerCase();
}
```

### 3. Race Conditions

```typescript
// ❌ Race condition
let counter = 0;
async function increment() {
  const current = counter;
  counter = current + 1;  // Multiple calls can overwrite
}

// ✅ Atomic operation
let counter = 0;
async function increment() {
  counter = await atomicIncrement(counter);
}
```

### 4. Memory Leaks

```typescript
// ❌ Event listener not removed
button.addEventListener('click', handler);
// If button is removed from DOM, listener stays

// ✅ Clean up
const handler = () => { ... };
button.addEventListener('click', handler);
// Later:
button.removeEventListener('click', handler);
```

## Debugging Tools

### Browser
- **Chrome DevTools** - Elements, Console, Network, Sources, Performance
- **Firefox DevTools** - Similar to Chrome
- **React DevTools** - Component tree, props, state

### Node.js
- **node --inspect** - Debug with Chrome DevTools
- **ndb** - CLI debugger
- **console.log** - Simple but effective

### Python
- **pdb** - Built-in debugger
- **ipdb** - Enhanced pdb
- **pdb++** - Even better

### General
- **Git bisect** - Find when bug was introduced
- **Logging** - Structured logs with context
- **Profiling** - Find performance issues

## Role-Shifting

When shifting **to** debugging mode:
```
"Shifting to debugging mode..."
→ Reproduce the issue
→ Isolate the cause
→ Form hypothesis
→ Test and verify
→ Fix and confirm
```

When shifting **from** debugging mode:
```
"Bug fixed. Details:
→ Issue: [description]
→ Root cause: [explanation]
→ Fix: [what was changed]
→ Verification: [tests added]

Shifting to [next] mode..."
```

## Gold Standard Integration

### Read-Back Verification
- Verify fix by reading back changed file
- Run tests to confirm fix works
- Check that no regressions introduced

### Executable Proof
- Show bug before fix (error logs, screenshots)
- Show bug after fix (working output)
- Run tests showing pass/fail before/after

### Loop Prevention
If debugging fails after 3 attempts:
1. Re-examine assumptions
2. Get fresh eyes (ask for help)
3. Consider alternative approaches
4. Escalate with full details

## Debugging Checklist

Before considering bug fixed:
- [ ] Root cause identified
- [ ] Fix implemented and tested
- [ ] Regression tests added
- [ ] No new issues introduced
- [ ] Fix documented (why it happened)
- [ ] Related issues checked

---

**"Debugging is being the detective who follows the clues until the truth is revealed."**
