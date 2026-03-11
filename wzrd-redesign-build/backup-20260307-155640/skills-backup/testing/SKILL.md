---
name: testing
description: QA, test strategy, test writing, and validation
category: testing
priority: P0
tags: [testing, qa, validation, quality]
subskills:
  - test-strategy
  - test-writing
  - validation
---

# Testing Skill

## Purpose
Ensure code quality through comprehensive testing and validation strategies.

## Core Principle
**"Code without tests is broken code. We just don't know how yet."**

## Testing Pyramid

```
        ┌─────────┐
        │   E2E   │  ← Few, slow, expensive
        │  Tests  │
        └────┬────┘
             │
       ┌─────┴─────┐
       │Integration │  ← Some, medium speed
       │   Tests   │
       └─────┬─────┘
             │
        ┌────┴────┐
        │  Unit   │  ← Many, fast, cheap
        │  Tests  │
        └─────────┘
```

## Test Types

### Unit Tests
Test individual functions/components in isolation.

**When:** For every function, class, component
**Speed:** Fast (milliseconds)
**Coverage:** Aim for 80%+

```typescript
// Unit test example
describe("authenticateUser", () => {
  it("should return user for valid credentials", async () => {
    const result = await authenticateUser("user@test.com", "pass");
    expect(result.email).toBe("user@test.com");
  });

  it("should throw for invalid credentials", async () => {
    await expect(
      authenticateUser("user@test.com", "wrong")
    ).rejects.toThrow("Invalid credentials");
  });

  it("should throw for missing user", async () => {
    await expect(
      authenticateUser("missing@test.com", "pass")
    ).rejects.toThrow("User not found");
  });
});
```

### Integration Tests
Test how components work together.

**When:** For API endpoints, database operations, service interactions
**Speed:** Medium (seconds)
**Coverage:** Critical paths only

```typescript
// Integration test example
describe("POST /api/auth/login", () => {
  it("should authenticate and return token", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "password" });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });
});
```

### E2E Tests
Test full user workflows.

**When:** For critical user journeys
**Speed:** Slow (minutes)
**Coverage:** Happy path + critical errors

```typescript
// E2E test example (Playwright)
test("user can login and see dashboard", async ({ page }) => {
  await page.goto("http://localhost:3000/login");
  await page.fill("[name=email]", "user@example.com");
  await page.fill("[name=password]", "password");
  await page.click("button[type=submit]");

  await expect(page).toHaveURL(/.*dashboard/);
  await expect(page.locator("h1")).toContainText("Welcome");
});
```

## Test Strategy

### What to Test

✅ **Always Test:**
- Public API surfaces
- Business logic
- Error handling
- Edge cases (null, empty, boundary values)
- Authentication/authorization

❌ **Usually Don't Test:**
- Third-party libraries (they have their own tests)
- Getters/setters (trivial)
- UI that changes frequently (costs more than value)

### Test Structure

Use AAA pattern: **Arrange, Act, Assert**

```typescript
describe("functionName", () => {
  it("should do X when Y", () => {
    // Arrange - Set up test data
    const input = { value: 42 };

    // Act - Execute the function
    const result = processValue(input);

    // Assert - Verify the outcome
    expect(result).toBe(expected);
  });
});
```

### Test Naming

Good test names describe:
1. What is being tested
2. Under what conditions
3. What the expected outcome is

```typescript
✅ "should return user when credentials are valid"
✅ "should throw AuthError when password is incorrect"
✅ "should return empty array when user has no notifications"

❌ "test1"
❌ "it works"
❌ "user test"
```

## Test Coverage

### Target Coverage
- **Critical paths:** 100%
- **Business logic:** 90%+
- **Utilities/helpers:** 80%+
- **Overall project:** 70%+

### Measuring Coverage

```bash
# TypeScript
npm test -- --coverage

# Python
pytest --cov=. --cov-report=html

# Go
go test -coverprofile=coverage.out
go tool cover -html=coverage.out
```

## Role-Shifting

When shifting **to** QA mode:
```
"Shifting to QA mode..."
→ Review what needs testing
→ Identify test coverage gaps
→ Write missing tests
→ Verify edge cases
```

When shifting **from** QA mode:
```
"Tests complete. Coverage at 85%."
→ Report test results
→ Note any issues found
→ Suggest improvements
```

## Gold Standard Integration

### Read-Back Verification
After writing test files:
```typescript
write_file("auth.test.ts", tests)

// Verify
read_file("auth.test.ts")

// Run tests
exec("npm test -- auth.test.ts")

// Show results
console.log("✅ Tests created and passing: 15/15 passed");
```

### Executable Proof
Always show test results:
```bash
$ npm test

Test Suites: 3 passed, 3 total
Tests:       25 passed, 25 total
Snapshots:   0 total
Time:        3.456 s
Coverage:    85.4%
```

## Examples

### Example 1: Testing API Endpoint

```typescript
import request from "supertest";
import app from "../app";

describe("POST /api/users", () => {
  it("should create user with valid data", async () => {
    const response = await request(app)
      .post("/api/users")
      .send({
        email: "test@example.com",
        password: "SecurePass123!",
        name: "Test User"
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      email: "test@example.com",
      name: "Test User"
    });
    expect(response.body.password).toBeUndefined();
  });

  it("should return 400 for invalid email", async () => {
    const response = await request(app)
      .post("/api/users")
      .send({ email: "invalid", password: "pass" });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain("email");
  });
});
```

### Example 2: Testing React Component

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "./LoginForm";

describe("LoginForm", () => {
  it("should render form fields", () => {
    render(<LoginForm onSubmit={jest.fn()} />);

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
  });

  it("should call onSubmit with form data", async () => {
    const handleSubmit = jest.fn();
    const user = userEvent.setup();

    render(<LoginForm onSubmit={handleSubmit} />);

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Password"), "password");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(handleSubmit).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password"
    });
  });

  it("should show validation error for empty fields", async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={jest.fn()} />);

    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(screen.getByText("Email is required")).toBeInTheDocument();
  });
});
```

## Testing Checklist

Before considering code "done":

- [ ] Unit tests written for new functions
- [ ] Integration tests for API/services
- [ ] Edge cases covered (null, empty, invalid)
- [ ] Error paths tested
- [ ] Tests are passing
- [ ] Coverage measured and acceptable
- [ ] Manual testing done for UI changes
- [ ] Tests run in CI/CD

---

**"Testing shows the presence of bugs, not their absence. But it's better than nothing."**
