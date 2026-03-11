---
name: coding
description: Code implementation across all languages and frameworks
category: coding
priority: P0
tags: [coding, implementation, languages, frameworks]
subskills:
  - test-driven-development
  - typescript
  - python
  - go
  - frontend
  - backend
---

# Coding Skill

## Purpose
Implement features, fix bugs, and write code across all languages and frameworks.

## Core Principle
**"Code that isn't tested doesn't work. Code that isn't read back wasn't written."**

## Languages & Frameworks

### TypeScript
- Node.js backend services
- Frontend with React/Vue/Svelte
- Full-stack with Next.js/Nuxt

### Python
- Backend APIs (FastAPI, Flask, Django)
- Data processing (pandas, numpy)
- Automation scripts
- Machine learning

### Go
- High-performance services
- Microservices
- Systems programming
- CLI tools

### Frontend
- React (Next.js, Remix)
- Vue (Nuxt)
- SvelteKit
- Vanilla JS when appropriate

### Backend
- REST APIs
- GraphQL
- WebSocket services
- gRPC
- Database operations

## Coding Workflow

### 1. Understand Requirements
- Clarify what needs to be built
- Identify edge cases
- Note performance constraints
- Check for security considerations

### 2. Plan the Implementation
```
Feature: X
├─ Files to create/modify
├─ Functions/components needed
├─ Data flow
├─ Error handling
└─ Testing approach
```

### 3. Write the Code
```
"Shifting to coding mode..."
→ Implement feature
→ Handle errors
→ Add logging
→ Document complex logic
```

### 4. Test
```
"Shifting to QA mode..."
→ Write tests
→ Run tests
→ Fix failures
→ Verify edge cases
```

### 5. Verify (Gold Standard)
- Read back files to verify
- Run to show it works
- Test with real inputs
- Document usage

## Code Quality Standards

### Must Have
- ✅ Clear variable/function names
- ✅ Error handling
- ✅ Comments for complex logic
- ✅ Type safety where applicable
- ✅ Tests for critical paths

### Must Not Have
- ❌ Hardcoded values (use config)
- ❌ Silent failures (log errors)
- ❌ Nested code > 4 levels (refactor)
- ❌ Functions > 50 lines (split up)
- ❌ Duplicate code (extract)

## Examples

### Example 1: TypeScript Function

```typescript
// ✅ GOOD - Clear, typed, tested
interface User {
  id: string;
  email: string;
}

/**
 * Authenticate user with email and password
 * @throws {AuthError} If credentials invalid
 */
async function authenticateUser(
  email: string,
  password: string
): Promise<User> {
  const user = await db.users.findByEmail(email);
  if (!user) {
    throw new AuthError("Invalid credentials");
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AuthError("Invalid credentials");
  }

  return user;
}

// Test
describe("authenticateUser", () => {
  it("should return user for valid credentials", async () => {
    const user = await authenticateUser("test@example.com", "password");
    expect(user.email).toBe("test@example.com");
  });

  it("should throw for invalid credentials", async () => {
    await expect(
      authenticateUser("test@example.com", "wrong")
    ).rejects.toThrow(AuthError);
  });
});
```

### Example 2: Python Service

```python
# ✅ GOOD - Type hints, error handling, tested
from dataclasses import dataclass
from typing import Optional

@dataclass
class Notification:
    user_id: str
    message: str
    priority: str = "normal"

class NotificationService:
    def __init__(self, db: Database, email_client: EmailClient):
        self.db = db
        self.email = email_client

    async def send_notification(
        self,
        notification: Notification
    ) -> bool:
        """Send notification to user. Returns True if sent."""
        try:
            user = await self.db.get_user(notification.user_id)
            if not user:
                logger.warning(f"User not found: {notification.user_id}")
                return False

            await self.email.send(
                to=user.email,
                subject=f"Notification: {notification.priority}",
                body=notification.message
            )
            return True

        except Exception as e:
            logger.error(f"Failed to send notification: {e}")
            return False
```

## Gold Standard Integration

### Read-Back Verification
After every Write/Edit:
```typescript
// Write the file
write_file("auth.ts", code)

// Read back to verify
read_file("auth.ts")

// Only then claim success
console.log("✅ auth.ts created with authenticateUser function")
```

### Executable Proof
Always show it working:
```bash
$ npm test
PASS src/auth.test.js
  ✓ authenticateUser returns user for valid credentials (15ms)
  ✓ authenticateUser throws for invalid credentials (8ms)

Tests: 2 passed, 2 failed
```

### Loop Prevention
If implementation fails 3x:
1. Check requirements
2. Verify assumptions
3. Escalate with context

## Role-Shifting

When shifting **to** coding mode:
```
"Shifting to coding mode..."
→ Focus on implementation
→ Write clean, tested code
→ Handle errors properly
→ Document complex logic
```

When shifting **from** coding mode:
```
"Code complete. Shifting to QA mode..."
→ Review implementation
→ Write tests
→ Verify edge cases
→ Document usage
```

## Subskills

### Test-Driven Development
Write tests before code when possible.

See: `coding/test-driven-development.md`

### Language-Specific Guides
Detailed guides for each language and framework.

See respective subskill files (to be created)

---

**"Code is read more than it is written. Make it readable."**
