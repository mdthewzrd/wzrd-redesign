---
name: sql
description: Database queries, schema design, and SQL optimization
category: data
priority: P0
tags: [sql, database, postgresql, mysql, data]
subskills:
  - sql-basics
  - complex-queries
  - joins
  - optimization
---

# SQL Skill

## Purpose
Query databases efficiently and understand relational data.

## Core Principle
**"Data is useless if you can't query it. SQL is the language of data."**

## Basic Queries

### SELECT

```sql
-- All columns
SELECT * FROM users;

-- Specific columns
SELECT id, email, created_at FROM users;

-- With conditions
SELECT * FROM users WHERE active = true;
SELECT * FROM users WHERE age >= 18;

-- With ordering
SELECT * FROM users ORDER BY created_at DESC;
SELECT * FROM users ORDER BY name ASC, email DESC;

-- With limit
SELECT * FROM users LIMIT 10;
SELECT * FROM users ORDER BY created_at DESC LIMIT 5;
```

### Aggregation

```sql
-- Count
SELECT COUNT(*) FROM users;
SELECT active, COUNT(*) FROM users GROUP BY active;

-- Sum, Avg, Max, Min
SELECT SUM(amount), AVG(amount), MAX(amount), MIN(amount)
FROM transactions;

-- Group by
SELECT category, COUNT(*) as count
FROM products
GROUP BY category
ORDER BY count DESC;

-- Having (filter on aggregates)
SELECT category, COUNT(*) as count
FROM products
GROUP BY category
HAVING COUNT(*) > 10;
```

## Joins

### Inner Join

```sql
SELECT u.name, o.order_date
FROM users u
INNER JOIN orders o ON u.id = o.user_id;
```

### Left Join

```sql
SELECT u.name, o.order_date
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;
-- All users, even without orders
```

### Multiple Joins

```sql
SELECT u.name, p.name, o.quantity
FROM users u
JOIN orders o ON u.id = o.user_id
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id;
```

## Advanced Queries

### Subqueries

```sql
-- Users with more than 5 orders
SELECT * FROM users
WHERE id IN (
    SELECT user_id FROM orders
    GROUP BY user_id
    HAVING COUNT(*) > 5
);

-- Latest order per user
SELECT u.name, o.order_date, o.total
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE o.order_date = (
    SELECT MAX(order_date)
    FROM orders
    WHERE user_id = u.id
);
```

### Common Table Expressions (CTEs)

```sql
WITH user_stats AS (
    SELECT
        user_id,
        COUNT(*) as order_count,
        SUM(total) as total_spent
    FROM orders
    GROUP BY user_id
)
SELECT u.name, us.order_count, us.total_spent
FROM users u
JOIN user_stats us ON u.id = us.user_id
WHERE us.total_spent > 1000;
```

### Window Functions

```sql
-- Row numbers
SELECT
    name,
    amount,
    ROW_NUMBER() OVER (ORDER BY amount DESC) as rank
FROM transactions;

-- Running totals
SELECT
    date,
    amount,
    SUM(amount) OVER (
        ORDER BY date
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) as running_total
FROM transactions;
```

## Data Modification

### INSERT

```sql
-- Single row
INSERT INTO users (email, name) VALUES ('user@test.com', 'Test User');

-- Multiple rows
INSERT INTO users (email, name) VALUES
    ('user1@test.com', 'User 1'),
    ('user2@test.com', 'User 2');

-- From SELECT
INSERT INTO archived_users
SELECT * FROM users WHERE created_at < '2023-01-01';
```

### UPDATE

```sql
-- Single row
UPDATE users SET name = 'New Name' WHERE id = 123;

-- Multiple conditions
UPDATE orders
SET status = 'completed'
WHERE due_date < NOW()
  AND status = 'pending';

-- From other table
UPDATE users u
SET total_orders = o.count
FROM (SELECT user_id, COUNT(*) as count
        FROM orders GROUP BY user_id) o
WHERE u.id = o.user_id;
```

### DELETE

```sql
-- Specific row
DELETE FROM users WHERE id = 123;

-- With condition
DELETE FROM logs WHERE created_at < NOW() - INTERVAL '30 days';
```

## Schema Design

### Create Table

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(active);
```

### Alter Table

```sql
-- Add column
ALTER TABLE users ADD COLUMN bio TEXT;

-- Drop column
ALTER TABLE users DROP COLUMN old_column;

-- Rename column
ALTER TABLE users RENAME COLUMN name TO full_name;

-- Add constraint
ALTER TABLE users ADD CONSTRAINT check_email_length
    CHECK (LENGTH(email) > 5);
```

## Optimization

### Indexing

```sql
-- Create index
CREATE INDEX idx_users_created ON users(created_at DESC);

-- Composite index
CREATE INDEX idx_orders_user_date ON orders(user_id, order_date);

-- Partial index (PostgreSQL)
CREATE INDEX idx_users_active ON users(active)
    WHERE active = true;
```

### Query Optimization

```sql
-- ❌ BAD: Function in WHERE prevents index usage
SELECT * FROM users WHERE LOWER(email) = 'test@example.com';

-- ✅ GOOD: Store normalized data, query directly
SELECT * FROM users WHERE email = 'test@example.com';

-- ❌ BAD: Wildcard at start
SELECT * FROM users WHERE email LIKE '%@example.com';

-- ✅ GOOD: Wildcard at end only
SELECT * FROM users WHERE email LIKE 'test@%';
```

### EXPLAIN

```sql
-- Analyze query plan
EXPLAIN SELECT * FROM users WHERE email = 'test@example.com';

-- Detailed analysis
EXPLAIN ANALYZE SELECT * FROM users;
```

## Database-Specific

### PostgreSQL

```sql
-- Upsert (insert or update)
INSERT INTO users (email, name)
VALUES ('test@example.com', 'Test')
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    updated_at = NOW();

-- JSON operations
SELECT data->>'name' as name
FROM json_table;

-- Generate series
SELECT * FROM generate_series(1, 10);
```

### MySQL

```sql
-- Upsert
INSERT INTO users (email, name)
VALUES ('test@example.com', 'Test')
ON DUPLICATE KEY UPDATE
    name = VALUES(name);

-- Limit with offset
SELECT * FROM users LIMIT 10 OFFSET 20;
```

## Patterns

### Pagination

```sql
-- Page 1 (rows 1-20)
SELECT * FROM users
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;

-- Page 2 (rows 21-40)
SELECT * FROM users
ORDER BY created_at DESC
LIMIT 20 OFFSET 20;
```

### Hierarchy (Recursive CTE)

```sql
WITH RECURSIVE category_tree AS (
    SELECT id, name, parent_id, 1 as level
    FROM categories
    WHERE parent_id IS NULL

    UNION ALL

    SELECT c.id, c.name, c.parent_id, ct.level + 1
    FROM categories c
    JOIN category_tree ct ON c.parent_id = ct.id
)
SELECT * FROM category_tree;
```

## Role-Shifting

When shifting **to** SQL mode:
```
"Acting as database expert..."
→ Understand schema
→ Write efficient queries
→ Use appropriate joins
→ Optimize performance
```

## Gold Standard Integration

### Read-Back Verification
- Verify query results are correct
- Check affected row counts
- Confirm data was modified

### Executable Proof
- Show query results
- Demonstrate EXPLAIN output
- Run test queries

---

**"SQL is how you talk to data. Learn it well."**
