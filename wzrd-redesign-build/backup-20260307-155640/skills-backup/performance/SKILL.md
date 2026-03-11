---
name: performance
description: Performance optimization, profiling, caching, and efficiency
category: performance
priority: P1
tags: [performance, optimization, profiling, caching, efficiency]
subskills:
  - profiling
  - caching
  - algorithmic-optimization
  - database-optimization
  - memory-optimization
---

# Performance Skill

## Purpose
Optimize code for speed, efficiency, and resource usage through profiling, caching, and algorithmic improvements.

## Core Principle
**"Premature optimization is the root of all evil. Profile first, optimize what matters."**

## Profiling

### Python Profiling
```python
import cProfile
import pstats
from functools import wraps

# Simple profiling
def profile_function(func):
    """Profile a function and print results"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        profiler = cProfile.Profile()
        profiler.enable()
        result = func(*args, **kwargs)
        profiler.disable()

        stats = pstats.Stats(profiler)
        stats.sort_stats('cumulative')
        stats.print_stats(20)  # Top 20 functions
        return result
    return wrapper

# Usage
@profile_function
def slow_function():
    # Your code here
    pass

# Command line profiling
# python -m cProfile -s cumulative script.py

# Memory profiling
from memory_profiler import profile

@profile
def memory_intensive_function():
    data = [i for i in range(1000000)]
    return data
```

### Node.js Profiling
```javascript
// CPU profiling
console.profile('myFunction');
myFunction();
console.profileEnd('myFunction');

// With built-in profiler
// node --prof script.js
// node --prof-process isolate-*.log > processed.txt

// Memory profiling
console.log('Memory:', process.memoryUsage());

// Snapshot at intervals
const used = process.memoryUsage();
console.log({
  rss: Math.round(used.rss / 1024 / 1024) + ' MB',
  heapTotal: Math.round(used.heapTotal / 1024 / 1024) + ' MB',
  heapUsed: Math.round(used.heapUsed / 1024 / 1024) + ' MB',
  external: Math.round(used.external / 1024 / 1024) + ' MB'
});
```

### Web Performance
```javascript
// Browser DevTools
console.time('operation');
// ... code ...
console.timeEnd('operation');

// Performance marks
performance.mark('start');
// ... code ...
performance.mark('end');
performance.measure('operation', 'start', 'end');

const measure = performance.getEntriesByName('operation')[0];
console.log(`Duration: ${measure.duration}ms`);

// Network timing
performance.getEntriesByType('resource').forEach(resource => {
  console.log(`${resource.name}: ${resource.duration}ms`);
});
```

## Caching Strategies

### Memoization
```python
from functools import lru_cache
import functools

# LRU cache for functions
@lru_cache(maxsize=128)
def expensive_function(n):
    """Cache results based on arguments"""
    # Expensive computation
    return result

# Custom memoization decorator
def memoize(func):
    cache = {}
    @functools.wraps(func)
    def wrapper(*args):
        if args not in cache:
            cache[args] = func(*args)
        return cache[args]
    return wrapper

@memoize
def fibonacci(n):
    if n < 2:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)
```

```javascript
// JavaScript memoization
function memoize(fn) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

const expensiveFunction = memoize((n) => {
  // Expensive computation
  return result;
});
```

### HTTP Caching
```python
# With requests
import requests
from requests_cache import CachedSession

# Cache for 1 hour
session = CachedSession('cache', expire_after=3600)

response = session.get('https://api.example.com/data')
# Subsequent calls use cached response

# Flask caching
from flask_caching import Cache

cache = Cache(config={'CACHE_TYPE': 'SimpleCache'})

@app.route('/api/data')
@cache.cached(timeout=60, query_string=True)
def get_data():
    return expensive_operation()
```

```javascript
// Node.js with node-cache
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 60 }); // 60 second TTL

function get(key) {
  const value = cache.get(key);
  if (value !== undefined) {
    return Promise.resolve(value);
  }
  return fetchExpensiveData(key).then(data => {
    cache.set(key, data);
    return data;
  });
}
```

### Database Query Caching
```python
# Django cache
from django.core.cache import cache

def get_user_data(user_id):
    cache_key = f'user_data_{user_id}'
    data = cache.get(cache_key)

    if data is None:
        data = User.objects.get(id=user_id)
        cache.set(cache_key, data, timeout=300)  # 5 minutes

    return data
```

## Algorithmic Optimization

### Time Complexity Patterns
```python
# ❌ O(n²) - Nested loops
def find_duplicates_slow(arr):
    duplicates = []
    for i in range(len(arr)):
        for j in range(i + 1, len(arr)):
            if arr[i] == arr[j]:
                duplicates.append(arr[i])
    return duplicates

# ✅ O(n) - Using set
def find_duplicates_fast(arr):
    seen = set()
    duplicates = set()
    for item in arr:
        if item in seen:
            duplicates.add(item)
        else:
            seen.add(item)
    return list(duplicates)
```

### Efficient Data Structures
```python
# Dictionary lookup O(1) vs List search O(n)
# ❌ Slow
users = [{'id': 1, 'name': 'John'}, {'id': 2, 'name': 'Jane'}]
user = next(u for u in users if u['id'] == 2)

# ✅ Fast
users_dict = {1: {'id': 1, 'name': 'John'}, 2: {'id': 2, 'name': 'Jane'}}
user = users_dict.get(2)

# Set membership O(1) vs List membership O(n)
# ❌ Slow
if item in large_list:  # O(n)

# ✅ Fast
if item in large_set:    # O(1)
```

### Batch Operations
```python
# ❌ Individual database queries
for user in users:
    db.execute(f"UPDATE users SET status = 'active' WHERE id = {user.id}")

# ✅ Batch operation
user_ids = [user.id for user in users]
db.execute("UPDATE users SET status = 'active' WHERE id = ANY(%s)", (user_ids,))

# Bulk insert
# ❌ Slow
for item in items:
    session.add(Item(**item))

# ✅ Fast
session.bulk_insert_mappings(Item, items)
```

## Database Optimization

### Query Optimization
```sql
-- ❌ Slow - N+1 queries
-- Get all users, then query for each user's posts

-- ✅ Fast - Single query with JOIN
SELECT u.*, p.*
FROM users u
LEFT JOIN posts p ON u.id = p.user_id;

-- ✅ Faster - Only needed columns
SELECT u.id, u.name, COUNT(p.id) as post_count
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
GROUP BY u.id, u.name;
```

### Indexing
```sql
-- Add index for frequently filtered columns
CREATE INDEX idx_users_email ON users(email);

-- Composite index for multiple columns
CREATE INDEX idx_users_status_created ON users(status, created_at);

-- Index for JOIN performance
CREATE INDEX idx_posts_user_id ON posts(user_id);

-- Check if index is used
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';
```

### Pagination
```python
# ❌ Inefficient - Fetches all rows
def get_all_users():
    return User.objects.all()  # Bad for large tables

# ✅ Efficient - Pagination
def get_users_paginated(page=1, per_page=100):
    return User.objects.limit(per_page).offset((page - 1) * per_page)

# ✅ Better - Cursor-based pagination
def get_users_cursor(last_id=None, limit=100):
    query = User.query
    if last_id:
        query = query.filter(User.id > last_id)
    return query.order_by(User.id).limit(limit).all()
```

## Memory Optimization

### Generator Patterns
```python
# ❌ List - Loads all into memory
def read_all_lines(filename):
    with open(filename) as f:
        return [line.strip() for line in f]  # All lines in memory

# ✅ Generator - Yields one at a time
def read_lines(filename):
    with open(filename) as f:
        for line in f:
            yield line.strip()

# Usage
for line in read_lines('large_file.txt'):
    process(line)  # Processes one line at a time
```

### Streaming
```python
# ❌ Loads entire file
with open('large.json', 'r') as f:
    data = json.load(f)

# ✅ Streams JSON
import ijson

with open('large.json', 'r') as f:
    for item in ijson.items(f, 'items.item'):
        process(item)
```

```javascript
// Node.js streaming
const fs = require('fs');

// ❌ Loads entire file
const data = fs.readFileSync('large.txt', 'utf-8');

// ✅ Streams line by line
const readline = require('readline');
const stream = fs.createReadStream('large.txt');

const rl = readline.createInterface({
  input: stream,
  crlfDelay: Infinity
});

for await (const line of rl) {
  processLine(line);
}
```

### Memory Profiling and Cleanup
```python
import gc
import sys

# Check memory usage
def get_size(obj, seen=None):
    """Recursively calculate object size"""
    size = sys.getsizeof(obj)
    if seen is None:
        seen = set()
    obj_id = id(obj)
    if obj_id in seen:
        return 0
    seen.add(obj_id)

    if isinstance(obj, dict):
        size += sum(get_size(k, seen) + get_size(v, seen) for k, v in obj.items())
    elif hasattr(obj, '__dict__'):
        size += get_size(obj.__dict__, seen)
    elif hasattr(obj, '__iter__') and not isinstance(obj, (str, bytes, bytearray)):
        size += sum(get_size(i, seen) for i in obj)
    return size

# Force garbage collection
gc.collect()

# Memory-efficient data types
# ❌ List of strings: ~50 bytes per string
strings = ['a', 'b', 'c', 'd', 'e']

# ✅ String intern: fewer bytes
import sys
strings = [sys.intern(s) for s in strings]
```

## Code Optimization Examples

### String Building
```python
# ❌ Slow - Creates new string each time
result = ""
for item in items:
    result += str(item)

# ✅ Fast - Uses list join
result = "".join(str(item) for item in items)

# For file writing
# ✅ Fast - Write directly
with open('output.txt', 'w') as f:
    for item in items:
        f.write(str(item))
```

### List Comprehensions vs Loops
```python
# List comprehension (faster)
squared = [x ** 2 for x in range(1000)]

# Map with lambda (slower)
squared = list(map(lambda x: x ** 2, range(1000)))

# For loop (slowest)
squared = []
for x in range(1000):
    squared.append(x ** 2)
```

### Early Exit
```python
# ❌ Checks entire list
def all_positive(numbers):
    result = True
    for n in numbers:
        if n < 0:
            result = False
    return result

# ✅ Exits early
def all_positive(numbers):
    for n in numbers:
        if n < 0:
            return False
    return True

# ✅ Even better with built-in
def all_positive(numbers):
    return all(n > 0 for n in numbers)
```

## Performance Monitoring

### Metrics Collection
```python
import time
from functools import wraps
import statistics

def measure_performance(func):
    """Measure and log function performance"""
    timings = []

    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        end = time.perf_counter()

        duration = end - start
        timings.append(duration)

        print(f"{func.__name__}: {duration * 1000:.2f}ms")

        if len(timings) >= 10:
            print(f"Stats: min={min(timings)*1000:.2f}ms, "
                  f"max={max(timings)*1000:.2f}ms, "
                  f"avg={statistics.mean(timings)*1000:.2f}ms")

        return result
    return wrapper
```

### Performance Budgets
```python
def enforce_budget(max_ms):
    """Decorator that enforces performance budget"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            start = time.perf_counter()
            result = func(*args, **kwargs)
            duration = (time.perf_counter() - start) * 1000

            if duration > max_ms:
                print(f"⚠️  {func.__name__} exceeded budget: {duration:.2f}ms > {max_ms}ms")

            return result
        return wrapper
    return decorator

@enforce_budget(max_ms=100)
def critical_function():
    pass
```

## Optimization Checklist

Before optimizing, verify:
- [ ] Profiled to identify bottlenecks
- [ ] Measured baseline performance
- [ ] Set performance targets
- [ ] Optimized critical path only
- [ ] Measured improvement
- [ ] Tested for correctness

## Gold Standard Integration

### Read-Back Verification
After optimization:
```python
# Prove performance improvement
import timeit

before = timeit.timeit(old_version, number=1000)
after = timeit.timeit(new_version, number=1000)

improvement = (before - after) / before * 100
print(f"✅ Performance improved by {improvement:.1f}%")
print(f"   Before: {before*1000:.2f}ms")
print(f"   After: {after*1000:.2f}ms")
```

### Executable Proof
Show profiling results:
```bash
$ python -m cProfile -s cumulative script.py

ncalls  tottime  percall  cumtime  percall filename:lineno(function)
  1000    0.003    0.000    0.005    0.000 optimized.py:15(fast_function)
     1    0.000    0.000    0.010    0.010 script.py:1(main)

✅ Optimization: fast_function is now 2x faster
```

---

**"Make it work, make it right, make it fast. In that order."**
