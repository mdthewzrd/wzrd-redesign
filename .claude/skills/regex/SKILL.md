---
name: regex
description: Regular expressions for pattern matching, validation, and text processing
category: text-processing
priority: P1
tags: [regex, pattern-matching, validation, text-processing]
subskills:
  - pattern-matching
  - text-extraction
  - text-replacement
  - validation-patterns
---

# Regex Skill

## Purpose
Match, extract, validate, and transform text using regular expression patterns.

## Core Principle
**"Regex is a power tool. It can solve problems in one line that would take ten otherwise. It can also create problems that take ten hours to debug."**

## Regex Basics

### Character Classes
```regex
.     # Any character except newline
\d    # Digit [0-9]
\D    # Non-digit [^0-9]
\w    # Word character [a-zA-Z0-9_]
\W    # Non-word character
\s    # Whitespace [ \t\r\n\f]
\S    # Non-whitespace

[abc] # Any of a, b, c
[^abc]# Any except a, b, c
[a-z] # Any lowercase letter
[A-Z] # Any uppercase letter
[0-9] # Any digit
```

### Anchors
```regex
^     # Start of string
$     # End of string
\b    # Word boundary
\B    # Non-word boundary
```

### Quantifiers
```regex
*     # 0 or more
+     # 1 or more
?     # 0 or 1 (optional)
{n}   # Exactly n
{n,}  # n or more
{n,m} # Between n and m

*?    # 0 or more (non-greedy)
+?    # 1 or more (non-greedy)
??    # 0 or 1 (non-greedy)
{n}?  # Exactly n (non-greedy)
```

### Groups
```regex
(...) # Capturing group
(?:...)# Non-capturing group
(?=...)# Positive lookahead
(?!...)# Negative lookahead
(?<=...)# Positive lookbehind
(?<!...)# Negative lookbehind
(?|...)# Branch reset
(?>...)# Atomic group
```

### Escape Sequences
```regex
\\    # Literal backslash
\.    # Literal dot
\*    # Literal asterisk
\+    # Literal plus
\?    # Literal question mark
\[    # Literal bracket
\\]   # Literal closing bracket
\^    # Literal caret
\$    # Literal dollar sign
```

## Common Patterns

### Email Validation
```regex
# Simple email
[\w.-]+@[\w.-]+\.\w+

# More robust email
[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}

# RFC 5322 (very strict - rarely needed)
(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*
|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]
|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")
@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?
|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}
(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:
(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]
|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])
```

### URL Validation
```regex
# HTTP/HTTPS URL
https?://(?:www\.)?[\w-]+(?:\.[\w-]+)+(?:/[\w- ./?%&=]*)?

# With port
https?://(?:www\.)?[\w-]+(?:\.[\w-]+)+(?::\d+)?(?:/[\w- ./?%&=]*)?

# Any URL (including ftp, file, etc.)
[a-z]+://(?:[\w-]+(?:\.[\w-]+)+(?::\d+)?(?:/[\w- ./?%&=]*)?)?
```

### Phone Numbers
```regex
# US phone number (various formats)
\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}

# International
\+\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}

# Flexible
\+?[\d\s\-\(\)]{10,}
```

### Date/Time
```regex
# ISO 8601 date
\d{4}-\d{2}-\d{2}

# US date (MM/DD/YYYY)
\d{2}/\d{2}/\d{4}

# EU date (DD.MM.YYYY)
\d{2}\.\d{2}\.\d{4}

# Time (HH:MM:SS)
\d{2}:\d{2}:\d{2}

# Date and time
\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?
```

### Password Validation
```regex
# At least 8 characters
.{8,}

# At least 8, with uppercase, lowercase, digit
^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$

# At least 8, with uppercase, lowercase, digit, special char
^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$

# No whitespace allowed
^\S{8,}$
```

### IP Addresses
```regex
# IPv4
\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}
(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b

# IPv6 (simplified)
(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}

# Either IPv4 or IPv6
(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}
(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)
|(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}
```

### Credit Card Numbers
```regex
# Visa (starts with 4)
\b4\d{3}(?: \d{4}){2}\d{4}\b

# MasterCard (starts with 51-55)
\b5[1-5]\d{2}(?: \d{4}){2}\d{4}\b

# American Express (starts with 34 or 37)
\b3[47]\d{2}(?: \d{6})?\d{5}\b

# Any major card
\b(?:4\d{3}|5[1-5]\d{2}|3[47]\d{2})[\d\s-]{12,16}\b
```

### HTML/XML Tags
```regex
# Match any tag
<\/?[\w\s="-']+>

# Match specific tag
<(?:div|span|p)[^>]*>.*?<\/\1>

# Extract tag attributes
<(\w+)([^>]*)>

# Self-closing tag
<(\w+)([^>]*)\/>
```

### Social Security Number (SSN)
```regex
# With dashes
\d{3}-\d{2}-\d{4}

# With spaces
\d{3} \d{2} \d{4}

# Any format
\d{3}[-\s]?\d{2}[-\s]?\d{4}
```

## Python Examples

### Matching
```python
import re

# Simple match
if re.match(r'\d+', '123'):
    print("Matches")

# Search anywhere in string
if re.search(r'\d+', 'abc123def'):
    print("Found digits")

# Find all matches
matches = re.findall(r'\d+', 'a1b2c3')  # ['1', '2', '3']

# Find with positions
for match in re.finditer(r'\d+', 'a1b2c3'):
    print(match.group(), match.start(), match.end())
```

### Replacement
```python
# Simple replacement
result = re.sub(r'\d+', 'X', 'a1b2c3')  # 'aXbXcX'

# With function
def replace_fn(match):
    return str(int(match.group()) * 2)

result = re.sub(r'\d+', replace_fn, 'a1b2c3')  # 'a2b4c6'

# Count replacements
count = re.subn(r'\d+', 'X', 'a1b2c3')[1]  # 3
```

### Splitting
```python
# Split by pattern
parts = re.split(r'[,\s]+', 'a, b, c')  # ['a', 'b', 'c']

# Keep delimiters
parts = re.split(r'([,\s]+)', 'a, b, c')  # ['a', ', ', 'b', ', ', 'c']
```

### Compilation
```python
# Compile for reuse
pattern = re.compile(r'\d+')

if pattern.match('123'):
    print("Matches")

# Find all
matches = pattern.findall('a1b2c3')
```

## JavaScript Examples

### Matching
```javascript
// Test match
if (/\d+/.test('123')) {
  console.log('Matches');
}

// Find all
const matches = 'a1b2c3'.match(/\d+/g); // ['1', '2', '3']

// Find one
const match = /(\d+)/.exec('abc123def');
if (match) {
  console.log(match[0]);  // '123'
  console.log(match[1]);  // '123' (captured group)
}
```

### Replacement
```javascript
// Simple replacement
const result1 = 'a1b2c3'.replace(/\d+/g, 'X');  // 'aXbXcX'

// With function
const result2 = 'a1b2c3'.replace(/\d+/g, match => {
  return String(Number(match) * 2);
});  // 'a2b4c6'
```

## Advanced Patterns

### Balancing Groups (Recursive Matching)
```regex
# Match balanced parentheses (PCRE, .NET)
^(?:[^()]|(?R))*$

# Match nested structures
\((?:[^()]|(?R))*\)
```

### Conditional Patterns
```regex
# If/then/else (PCRE)
(?(?=pattern)then|else)

# Example: match quoted or unquoted strings
(?:"([^"]*)"|(\S+))

# Group 1 if quoted, group 2 if unquoted
```

### Lookarounds
```regex
# Positive lookahead - match "foo" only if followed by "bar"
foo(?=bar)

# Negative lookahead - match "foo" only if NOT followed by "bar"
foo(?!bar)

# Positive lookbehind - match "bar" only if preceded by "foo"
(?<=foo)bar

# Negative lookbehind - match "bar" only if NOT preceded by "foo"
(?<!foo)bar

# Example: match "test" only when between < and >
(?<=<)test(?=>)
```

### Atomic Groups
```regex
# Prevent backtracking
(?>...)

# Example: match "foo" or "foobar" but not both
(?>foo|foobar)

# Useful for performance optimization
```

## Practical Examples

### Extract All URLs from Text
```python
import re

text = "Visit https://example.com or http://test.org for info"

urls = re.findall(r'https?://[\w.-]+(?:\.[\w-]+)+(?:/[\w- ./?%&=]*)?', text)
# ['https://example.com', 'http://test.org']
```

### Remove All HTML Tags
```python
import re

html = "<p>Hello <b>world</b>!</p>"
clean = re.sub(r'<[^>]+>', '', html)
# 'Hello world!'
```

### Extract Code Blocks from Markdown
```python
import re

markdown = """
Some text.

```python
def hello():
    print("world")
```

More text.
"""

code_blocks = re.findall(r'```(\w+)\n(.*?)```', markdown, re.DOTALL)
# [('python', 'def hello():\n    print("world")')]
```

### Validate Username
```python
import re

def is_valid_username(username):
    # 3-20 characters, alphanumeric and underscore only
    pattern = r'^[a-zA-Z0-9_]{3,20}$'
    return bool(re.match(pattern, username))

is_valid_username('user_123')  # True
is_valid_username('ab')        # False (too short)
is_valid_username('user@name') # False (invalid char)
```

### Extract All Mentions
```python
import re

text = "Hey @alice and @bob, what about @charlie?"

mentions = re.findall(r'@(\w+)', text)
# ['alice', 'bob', 'charlie']
```

### Format Validation
```python
import re

def validate_zip(code):
    """Validate US ZIP code (12345 or 12345-6789)"""
    return bool(re.match(r'^\d{5}(?:-\d{4})?$', code))

def validate_hex_color(color):
    """Validate hex color (#RGB or #RRGGBB)"""
    return bool(re.match(r'^#(?:[0-9a-fA-F]{3}){1,2}$', color))

def validate_mac_address(mac):
    """Validate MAC address (XX:XX:XX:XX:XX:XX)"""
    return bool(re.match(r'^(?:[0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$', mac))
```

## Performance Tips

### Optimize Patterns
```regex
# ❌ Inefficient - catastrophic backtracking
^(a+)+$

# ✅ Efficient - atomic group or possessive quantifier
^(a++)+$      # Possessive (PCRE, Java)
^(?>a+)+      # Atomic group
```

### Use Character Classes
```regex
# ❌ Slow - alternation
[abc]|def|[xyz]

# ✅ Fast - character class
[abcdefxyz]
```

### Anchor When Possible
```regex
# ❌ Slower - searches entire string
pattern

# ✅ Faster - anchored pattern
^pattern$
```

### Be Specific
```regex
# ❌ Too generic
.*

# ✅ More specific
[^\s]*
```

## Debugging Regex

### Break Down Complex Patterns
```python
# Build pattern step by step
email = (
    r'^'                         # Start
    r'[a-zA-Z0-9._%+-]+'         # Username
    r'@'                         # @ symbol
    r'[a-zA-Z0-9.-]+'             # Domain
    r'\.'                         # Dot
    r'[a-zA-Z]{2,}'               # TLD
    r'$'                         # End
)

pattern = re.compile(email)
```

### Use Regex Debuggers
- **Online**: regex101.com, debuggex.com, regexr.com
- **Python**: `re.DEBUG` flag
```python
pattern = re.compile(r'\d+', re.DEBUG)
```

### Test Cases
```python
test_cases = [
    ('test@example.com', True),
    ('invalid', False),
    ('@example.com', False),
    ('test@', False),
]

pattern = re.compile(r'^[\w.-]+@[\w.-]+\.\w+$')
for test, expected in test_cases:
    result = bool(pattern.match(test))
    status = '✅' if result == expected else '❌'
    print(f"{status} {test}: {result}")
```

## Common Pitfalls

### Greedy vs Non-Greedy
```python
text = "<div>content1</div><div>content2</div>"

# Greedy - matches everything
re.match(r'<div>.*</div>', text)  # Matches entire string

# Non-greedy - matches first
re.match(r'<div>.*?</div>', text)  # Matches first div
```

### Forgetting to Escape
```python
# ❌ Wrong - dot matches any character
re.match(r'example.com', 'exampleXcom')  # Matches!

# ✅ Correct - escaped dot
re.match(r'example\.com', 'example.com')  # Only matches example.com
```

### Backslash Issues
```python
# Use raw strings to avoid backslash problems
pattern = r'\d+'      # ✅ Good
pattern = '\\d+'      # ❌ Hard to read
pattern = '\d+'       # ❌ Wrong (escape sequence)
```

## Gold Standard Integration

### Read-Back Verification
After creating regex:
```python
pattern = r'^\d{3}-\d{2}-\d{4}$'

# Test pattern
test_cases = ['123-45-6789', 'abc', '123-456-78901']
for test in test_cases:
    result = bool(re.match(pattern, test))
    print(f"{test}: {result}")

# Verify expectations
assert re.match(pattern, '123-45-6789')
assert not re.match(pattern, 'invalid')
print("✅ Regex pattern verified")
```

### Executable Proof
Show regex working:
```bash
$ python3 -c "import re; print(re.findall(r'\d+', 'a1b2c3'))"
['1', '2', '3']
✅ Regex extracts digits correctly
```

---

**"Regex: A language within a language. Powerful when understood, dangerous when not."**
