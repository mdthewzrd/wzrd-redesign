---
name: documentation
description: API docs, guides, README, and technical writing
category: documentation
priority: P1
tags: [documentation, writing, guides, api-docs]
subskills:
  - api-docs
  - readme
  - technical-writing
---

# Documentation Skill

## Purpose
Create clear, comprehensive documentation that helps users and developers understand and use the code.

## Core Principle
**"Code that isn't documented doesn't exist. No one can use what they can't understand."**

## Documentation Types

### 1. README.md
The entry point for your project.

**Must Include:**
- Project title and one-line description
- What it does
- Why it exists (problem it solves)
- Quick start / installation
- Usage examples
- Contributing guidelines
- License

```markdown
# Project Name

Short description of what this project does.

## What It Does

Clear explanation of the problem it solves.

## Quick Start

\`\`\`bash
npm install
npm start
\`\`\`

## Usage

\`\`\`typescript
import { thing } from 'project';

thing.doSomething();
\`\`\`

## Contributing

We welcome contributions! See CONTRIBUTING.md.

## License

MIT
```

### 2. API Documentation
Document all public APIs, functions, and classes.

**For TypeScript:**
```typescript
/**
 * Authenticates a user with email and password.
 *
 * @param email - The user's email address
 * @param password - The user's password
 * @returns Promise that resolves to the authenticated user
 * @throws {AuthError} If credentials are invalid
 * @example
 * ```ts
 * const user = await authenticateUser('user@example.com', 'pass');
 * console.log(user.id);
 * ```
 */
async function authenticateUser(
  email: string,
  password: string
): Promise<User>
```

**For Python:**
```python
def authenticate_user(email: str, password: str) -> User:
    """
    Authenticate a user with email and password.

    Args:
        email: The user's email address
        password: The user's password

    Returns:
        The authenticated User object

    Raises:
        AuthError: If credentials are invalid

    Example:
        >>> user = authenticate_user('user@example.com', 'pass')
        >>> print(user.id)
    """
    pass
```

### 3. Code Comments
Explain WHY, not WHAT.

**❌ Bad (tells you nothing):**
```typescript
// Set x to 5
let x = 5;

// Call the function
authenticateUser(email, password);
```

**✅ Good (explains why):**
```typescript
// Max retry attempts before giving up (prevents infinite loops)
const MAX_RETRIES = 5;

// Authenticate before accessing protected resources
// Throws AuthError which is handled by the error boundary
const user = await authenticateUser(email, password);
```

### 4. Guides and Tutorials
Step-by-step instructions for common tasks.

**Structure:**
1. Prerequisites (what you need before starting)
2. Goal (what you'll accomplish)
3. Steps (numbered, clear, actionable)
4. Result (what you should have)
5. Next steps (where to go from here)

```markdown
# How to Add Authentication

## Prerequisites
- Node.js 18+
- An existing project

## Goal
Add email/password authentication to your app.

## Steps

1. Install dependencies
\`\`\`bash
npm install bcrypt jsonwebtoken
\`\`\`

2. Create user model
\`\`\`typescript
interface User {
  id: string;
  email: string;
  passwordHash: string;
}
\`\`\`

3. ... (more steps)

## Result
Users can now register and login.

## Next Steps
Add password reset, role-based access, etc.
```

### 5. Changelog
Track changes over time.

```markdown
# Changelog

## [2.0.0] - 2024-02-19
### Added
- User authentication
- Password reset flow

### Changed
- Improved error handling
- Updated dependencies

### Fixed
- Fixed memory leak in websocket handler

## [1.0.0] - 2024-01-15
### Added
- Initial release
```

## Documentation Principles

### 1. Know Your Audience
- **Users:** Want to know how to use it
- **Developers:** Want to know how it works and how to contribute
- **Future You:** Want to remember what you built

### 2. Be Concise
- Get to the point
- Use examples over explanations
- Remove fluff

### 3. Keep It Current
- Update docs when code changes
- Remove outdated information
- Version your docs if you have breaking changes

### 4. Show, Don't Just Tell
- Provide working examples
- Include code snippets
- Add screenshots for UI

## Documentation Checklist

Before considering documentation "done":

- [ ] README.md exists and is complete
- [ ] All public APIs are documented
- [ ] Complex functions have JSDoc/docstrings
- [ ] Installation instructions work
- [ ] Usage examples are tested
- [ ] Contributing guidelines exist
- [ ] Changelog is maintained
- [ ] Links in docs work

## Role-Shifting

When shifting **to** documentation mode:
```
"Shifting to documentation mode..."
→ Review what needs documenting
→ Write clear explanations
→ Add examples
→ Verify all links work
```

When shifting **from** documentation mode:
```
"Documentation complete. Added README, API docs, and examples."
→ Summarize what was documented
→ Note any gaps found
→ Suggest improvements
```

## Gold Standard Integration

### Read-Back Verification
After writing documentation:
```markdown
write_file("README.md", readme)

// Verify content is correct
read_file("README.md")

// Test that examples work
exec("npm run example")

// Only then claim complete
console.log("✅ README.md created with tested examples");
```

### Executable Proof
Show that documentation works:
```bash
# Follow the README instructions
$ npm install
$ npm start
Server running on http://localhost:3000

# Examples in docs actually work
$ node examples/basic-usage.js
Output: Success!
```

## Examples

### Example 1: Complete README

```markdown
# wzrd.dev

Autonomous AI platform with Gold Standard enforcement.

## What It Does

WZRD.dev is a skills-based AI agent platform that:
- Enforces Gold Standard validation rules
- Manages 4-layer memory system
- Coordinates agent communication
- Integrates with Telegram for remote access

## Quick Start

\`\`\`bash
# Install dependencies
npm install

# Start the gateway
npm run start

# Start Telegram bot
python telegram/telegram_bot.py
\`\`\`

## Usage

\`\`\`typescript
import { Gateway } from '@wzrd/gateway';

const gateway = new Gateway({
  port: 18790,
  goldStandard: true
});

await gateway.start();
\`\`\`

## Project Structure

\`\`\`
wzrd.dev/
├── gateway/        # Main gateway service
├── telegram/       # Telegram bot
├── agents/         # Agent specifications
├── memory/         # Memory system
└── docs/          # Documentation
\`\`\`

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## License

MIT
```

### Example 2: API Documentation

```markdown
# Authentication API

## POST /api/auth/register

Register a new user account.

### Request

\`\`\`json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
\`\`\`

### Response (201 Created)

\`\`\`json
{
  "id": "usr_123abc",
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2024-02-19T10:30:00Z"
}
\`\`\`

### Errors

| Code | Description |
|------|-------------|
| 400 | Invalid email format |
| 409 | Email already registered |
| 422 | Password too weak |
```

## Documentation Tools

- **TypeScript:** TypeDoc, JSDoc
- **Python:** Sphinx, pydoc
- **Go:** godoc
- **General:** MkDocs, Docusaurus, GitBook

---

**"The best documentation is no documentation at all (because the code is self-explanatory). The second best is clear, concise, current docs."**
