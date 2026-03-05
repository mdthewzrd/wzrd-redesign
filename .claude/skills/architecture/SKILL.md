---
name: architecture
description: System design, API design, and architectural decisions
category: architecture
priority: P0
tags: [architecture, design, system-design, api-design]
subskills:
  - system-design
  - api-design
  - database-design
  - technology-choices
---

# Architecture Skill

## Purpose
Design robust, scalable systems and make sound architectural decisions.

## Core Principle
**"Architecture is about trade-offs. Understand them, document them, stand by them."**

## System Design

### Design Principles

1. **Simplicity First**
   - Start simple, add complexity only when needed
   - YAGNI: You Ain't Gonna Need It
   - Premature optimization is the root of all evil

2. **Separation of Concerns**
   - Each component has one responsibility
   - Clear boundaries between layers
   - Minimal coupling between modules

3. **Fail Gracefully**
   - Design for failure
   - Graceful degradation
   - Circuit breakers for external services

### Architectural Patterns

```
┌─────────────────────────────────────────────────────────────┐
│                    Monolith (Start Here)                    │
│                                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐      │
│  │   UI    │  │  API    │  │ Business│  │  Data   │      │
│  │ Layer   │  │ Layer   │  │  Logic  │  │ Layer   │      │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘      │
│                                                             │
│  ✅ Simple to build                                         │
│  ✅ Easy to debug                                           │
│  ❌ Harder to scale later                                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Microservices (Scale Later)              │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ Service A│  │ Service B│  │ Service C│  ...             │
│  │  (API)   │  │ (Auth)   │  │  (Data)  │                  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                  │
│       │             │             │                          │
│       └─────────────┴─────────────┘                          │
│                    │                                         │
│              ┌─────┴─────┐                                  │
│              │  Gateway  │                                  │
│              └───────────┘                                  │
│                                                             │
│  ✅ Independent scaling                                     │
│  ✅ Technology diversity                                     │
│  ❌ More complex                                            │
│  ❌ Distributed transactions                                 │
└─────────────────────────────────────────────────────────────┘
```

### When to Use Each

| Situation | Recommended Approach |
|-----------|---------------------|
| New project, uncertain requirements | Monolith |
| Small team (< 10 developers) | Monolith |
| Clear domain boundaries | Microservices |
| Different scaling needs per service | Microservices |
| Multiple teams owning different parts | Microservices |

## API Design

### REST API Design

**Resource Naming:**
```
✅ GET    /users          - List users
✅ GET    /users/123      - Get specific user
✅ POST   /users          - Create user
✅ PUT    /users/123      - Update user
✅ DELETE /users/123      - Delete user
✅ GET    /users/123/posts - User's posts

❌ GET    /getUsers       - Don't use verbs
❌ GET    /user           - Use plural for collections
❌ POST   /users/123      - Don't POST to specific resources
```

**Response Format:**
```json
// Success
{
  "data": { ... },
  "meta": {
    "page": 1,
    "perPage": 20,
    "total": 100
  }
}

// Error
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": { "field": "email" }
  }
}
```

### GraphQL Design

**When to Use:**
- Complex data relationships
- Mobile clients (flexible queries)
- Multiple data sources

**Schema Pattern:**
```graphql
type User {
  id: ID!
  email: String!
  posts(first: Int, after: String): PostConnection!
}

type PostConnection {
  edges: [PostEdge!]!
  pageInfo: PageInfo!
}

type PostEdge {
  node: Post!
  cursor: String!
}
```

## Database Design

### Choosing a Database

| Database Type | When to Use |
|---------------|-------------|
| PostgreSQL | Structured data, complex queries, ACID needed |
| MySQL | Web apps, read-heavy, simpler than Postgres |
| MongoDB | Flexible schema, document storage |
| Redis | Caching, sessions, real-time |
| SQLite | Embedded, testing, single-user |

### Schema Design Principles

1. **Normalization** (3NF for relational)
   - Eliminate redundant data
   - Each fact stored once
   - Referential integrity

2. **Indexing Strategy**
   - Index columns used in WHERE clauses
   - Index foreign keys
   - Composite indexes for multi-column queries
   - Don't over-index (slows writes)

3. **Data Types**
   - Use appropriate types (INT not VARCHAR for numbers)
   - Use DECIMAL for money (not FLOAT)
   - Use TEXT sparingly (has performance cost)

### Example: User Schema

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  INDEX idx_users_email (email)
);

CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  content TEXT,
  published_at TIMESTAMPTZ,

  INDEX idx_posts_user_id (user_id),
  INDEX idx_posts_published (published_at)
);
```

## Technology Choices

### Framework Selection

| Framework | Best For | Trade-offs |
|-----------|----------|------------|
| Express | Simple APIs | Minimal, unopinionated |
| FastAPI | Python APIs | Fast, async native |
| Next.js | React apps | Full-stack, SSR |
| Django | Complex apps | Batteries included, heavy |

### When to Choose What

**Web Framework Decision Tree:**
```
Need real-time features?
├─ YES → FastAPI (Python) or Express (Node)
└─ NO → Need admin panel?
    ├─ YES → Django (Python)
    └─ NO → JavaScript preference?
        ├─ YES → Next.js (React)
        └─ NO → Express or FastAPI
```

## Role-Shifting

When shifting **to** architecture mode:
```
"Acting as architect..."
→ Analyze requirements
→ Identify constraints
→ Design system components
→ Document trade-offs
→ Present architecture for review
```

When shifting **from** architecture mode:
```
"Architecture designed. Key decisions:
→ Monolith with microservices migration path
→ PostgreSQL for data, Redis for cache
→ Next.js frontend, FastAPI backend

Shifting to [next] mode..."
```

## Gold Standard Integration

### Read-Back Verification
- Verify architecture diagrams are accurate
- Confirm all trade-offs are documented
- Check that examples work

### Executable Proof
- Show architecture documentation
- Provide working code examples
- Demonstrate patterns with real implementations

### Loop Prevention
If architecture design fails:
1. Re-evaluate requirements
2. Consider simpler approach
3. Escalate with trade-off analysis

## Examples

### Example 1: SaaS Architecture

```
Requirements:
- Multi-tenant SaaS
- Web + Mobile clients
- Real-time notifications
- Payment processing

Architecture:
┌────────────┐     ┌────────────┐
│   Next.js  │     │   Mobile   │
│   Web App  │     │   Apps    │
└─────┬──────┘     └─────┬──────┘
      │                  │
      └────────┬─────────┘
               │
        ┌──────┴──────┐
        │   Gateway   │ (API Gateway + Auth)
        └──────┬──────┘
               │
    ┌──────────┼──────────┐
    │          │          │
┌───┴───┐ ┌───┴───┐ ┌───┴────┐
│  API  │ │  Auth │ │WebSocket│
│Service│ │Service│ │ Service │
└───┬───┘ └───┬───┘ └────┬────┘
    │         │           │
    └─────────┴───────────┘
              │
       ┌──────┴──────┐
       │  PostgreSQL │
       │   (Data)    │
       └─────────────┘

Technology:
- Frontend: Next.js, React Native
- Backend: FastAPI (Python)
- Database: PostgreSQL
- Cache: Redis
- Queue: Redis + Bull
- Payments: Stripe
```

### Example 2: Trade-off Documentation

```markdown
## Decision: Monolith vs Microservices

**Chosen:** Monolith with microservices migration path

**Trade-offs:**

| Factor | Monolith | Microservices |
|--------|----------|---------------|
| Speed | ✅ Faster to build | ❌ Slower |
| Complexity | ✅ Simpler | ❌ More complex |
| Scaling | ❌ All or nothing | ✅ Per-service |
| Team | ✅ Any size | ❌ Needs coordination |
| Deployment | ✅ Single unit | ✅ Independent |

**Reasoning:**
- Small team, need speed
- Uncertain future requirements
- Can extract services later if needed
- Monolith can be split when clear boundaries emerge

**Migration Path:**
1. Start as monolith
2. Identify natural boundaries
3. Extract services as needed
4. Use API gateway for routing
```

## Architecture Checklist

Before considering architecture complete:
- [ ] Requirements analyzed
- [ ] Constraints identified
- [ ] Components designed
- [ ] Data flow documented
- [ ] Trade-offs documented
- [ ] Technology choices justified
- [ ] Scalability considered
- [ ] Security addressed

---

**"Good architecture is invisible. Bad architecture is impossible to ignore."**
