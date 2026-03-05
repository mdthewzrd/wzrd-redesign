---
name: api
description: REST, GraphQL, working with APIs and HTTP
category: integration
priority: P0
tags: [api, rest, graphql, http, integration]
subskills:
  - rest-api
  - graphql
  - http-methods
  - api-authentication
---

# API Skill

## Purpose
Interact with REST and GraphQL APIs, handle authentication, and debug API issues.

## Core Principle
**"APIs are how systems talk. Master them, and you can connect anything."**

## REST API Basics

### HTTP Methods

| Method | Purpose | Idempotent | Safe |
|--------|---------|------------|------|
| GET | Read | ✅ | ✅ |
| POST | Create | ❌ | ❌ |
| PUT | Update | ✅ | ❌ |
| PATCH | Partial update | ❌ | ❌ |
| DELETE | Delete | ✅ | ❌ |

### REST Patterns

```http
GET    /api/users          - List users
GET    /api/users/123      - Get specific user
POST   /api/users          - Create user
PUT    /api/users/123      - Replace user
PATCH  /api/users/123      - Update user partially
DELETE /api/users/123      - Delete user
GET    /api/users/123/posts - User's posts
```

## Making Requests

### curl

```bash
# GET request
curl https://api.example.com/users

# POST with JSON
curl -X POST https://api.example.com/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test"}'

# With headers
curl -H "Authorization: Bearer TOKEN" \
  https://api.example.com/me

# Debugging (-v)
curl -v https://api.example.com/users
```

### JavaScript (Fetch)

```javascript
// GET
const response = await fetch('https://api.example.com/users');
const users = await response.json();

// POST
const response = await fetch('https://api.example.com/users', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({email: 'test@example.com'})
});
const user = await response.json();

// PUT
const response = await fetch('https://api.example.com/users/123', {
  method: 'PUT',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({name: 'Updated Name'})
});
```

### Python (Requests)

```python
import requests

# GET
response = requests.get('https://api.example.com/users')
users = response.json()

# POST
data = {'email': 'test@example.com', 'name': 'Test'}
response = requests.post('https://api.example.com/users', json=data)
user = response.json()

# PUT with authentication
headers = {'Authorization': 'Bearer TOKEN'}
data = {'name': 'Updated Name'}
response = requests.put('https://api.example.com/users/123',
                         json=data, headers=headers)
```

## Authentication

### Bearer Token

```bash
# Set header
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  https://api.example.com/me

# JavaScript
headers = {'Authorization': `Bearer ${token}`}
```

### API Key

```bash
# Header
curl -H "X-API-Key: key_abc123" https://api.example.com/data

# Query parameter
curl "https://api.example.com/data?api_key=key_abc123"
```

### Basic Auth

```bash
# curl with -u
curl -u username:password https://api.example.com/data

# With base64 encoded
curl -H "Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=" \
  https://api.example.com/data
```

## GraphQL

### Query

```graphql
query {
  user(id: "123") {
    id
    email
    name
    posts(first: 10) {
      edges {
        node {
          id
          title
          createdAt
        }
      }
    }
  }
}
```

### Mutation

```graphql
mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    email
    name
  }
}

# Variables
{
  "input": {
    "email": "test@example.com",
    "name": "Test User"
  }
}
```

### With curl

```bash
curl -X POST https://api.example.com/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { users { id email } }"
  }'
```

## Error Handling

### Status Codes

| Code | Meaning | Common Cause |
|------|---------|--------------|
| 200 | OK | Success |
| 201 | Created | Resource created |
| 204 | No Content | Success, no data returned |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Bad/missing credentials |
| 403 | Forbidden | Valid creds, no permission |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable | Valid format, semantically wrong |
| 429 | Too Many Requests | Rate limited |
| 500 | Server Error | Server crashed |
| 502 | Bad Gateway | Upstream server issue |
| 503 | Service Unavailable | Server overloaded |

### Error Handling Patterns

```javascript
try {
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  return await response.json();
} catch (error) {
  console.error('API error:', error.message);
}
```

```python
try:
    response = requests.post(url, json=data)
    response.raise_for_status()  # Raises HTTPError for 4xx/5xx
    return response.json()
except requests.exceptions.HTTPError as e:
    print(f"HTTP error: {e}")
except requests.exceptions.RequestException as e:
    print(f"Network error: {e}")
```

## Pagination

### Offset/Limit

```http
GET /api/users?offset=20&limit=20

# Response
{
  "data": [...],
  "meta": {
    "page": 2,
    "perPage": 20,
    "total": 100
  }
}
```

### Cursor-based

```http
GET /api/users?cursor=eyJpZCI6IjEyM30KQ

# Response
{
  "data": [...],
  "meta": {
    "nextCursor": "eyJpZCI6IjEyN30=",
    "hasNext": true
  }
}
```

## Rate Limiting

### Handling Rate Limits

```javascript
async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);

      if (response.status === 429) {
        // Rate limited - wait and retry
        const retryAfter = parseInt(response.headers['retry-after']) || 60;
        console.log(`Rate limited. Waiting ${retryAfter}s...`);
        await sleep(retryAfter * 1000);
        continue;
      }

      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`Retry ${i + 1}/${retries}...`);
      await sleep(1000 * (i + 1));
    }
  }
}
```

## Webhooks

### Receiving Webhooks

```javascript
// Express.js
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = req.body;

  // Verify signature
  const expected = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');

  if (signature !== expected) {
    return res.status(401).send('Invalid signature');
  }

  // Process webhook
  console.log('Webhook received:', payload);
  res.status(200).send('OK');
});
```

## Role-Shifting

When shifting **to** API mode:
```
"Switching to API mode..."
→ Understand API documentation
→ Make requests
→ Handle responses
→ Debug errors
```

## Gold Standard Integration

### Read-Back Verification
- Verify request was successful
- Check response data structure
- Confirm error handling works

### Executable Proof
- Show API response
- Demonstrate authentication
- Test error cases

---

**"APIs connect systems. Master them, and you can integrate anything."**
