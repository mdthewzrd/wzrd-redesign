---
name: validation
description: Input validation, data verification, and error handling
category: validation
priority: P0
tags: [validation, verification, error-handling, data-quality]
subskills:
  - input-validation
  - data-verification
  - schema-validation
  - sanitization
---

# Validation Skill

## Purpose
Validate inputs, verify data integrity, handle errors gracefully, and prevent security issues.

## Core Principle
**"Never trust input. Validate everything. Verify assumptions. Handle the unexpected."**

## Input Validation

### String Validation
```python
import re

def validate_string(value, min_length=0, max_length=None, pattern=None):
    """Validate string input"""

    # Type check
    if not isinstance(value, str):
        raise ValueError(f"Expected string, got {type(value).__name__}")

    # Length check
    if len(value) < min_length:
        raise ValueError(f"String too short: minimum {min_length} characters")

    if max_length and len(value) > max_length:
        raise ValueError(f"String too long: maximum {max_length} characters")

    # Pattern check
    if pattern and not re.match(pattern, value):
        raise ValueError(f"String doesn't match required pattern")

    return value

# Usage
validate_string(username, min_length=3, max_length=20, pattern=r'^[a-zA-Z0-9_]+$')
```

### Email Validation
```python
import re
from typing import Optional

def validate_email(email: str) -> str:
    """Validate email address"""

    # Basic format check
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

    if not re.match(pattern, email):
        raise ValueError(f"Invalid email format: {email}")

    # Length check
    if len(email) > 254:
        raise ValueError("Email too long")

    # Check for common issues
    if '..' in email or email.startswith('.') or email.endswith('.'):
        raise ValueError("Invalid email format")

    return email.lower().strip()
```

### URL Validation
```python
from urllib.parse import urlparse

def validate_url(url: str, allowed_schemes=None) -> str:
    """Validate URL"""

    if allowed_schemes is None:
        allowed_schemes = ['http', 'https']

    try:
        result = urlparse(url)

        # Check scheme
        if result.scheme not in allowed_schemes:
            raise ValueError(f"URL scheme must be one of: {allowed_schemes}")

        # Check network location
        if not result.netloc:
            raise ValueError("URL missing domain")

        return url

    except Exception as e:
        raise ValueError(f"Invalid URL: {e}")
```

### Number Validation
```python
def validate_number(value, min_value=None, max_value=None, integer_only=False):
    """Validate numeric input"""

    # Convert to number
    try:
        if integer_only:
            number = int(value)
        else:
            number = float(value)
    except (ValueError, TypeError):
        raise ValueError(f"Invalid number: {value}")

    # Range check
    if min_value is not None and number < min_value:
        raise ValueError(f"Number below minimum: {min_value}")

    if max_value is not None and number > max_value:
        raise ValueError(f"Number above maximum: {max_value}")

    return number

# Usage
validate_number(age, min_value=0, max_value=120, integer_only=True)
validate_number(price, min_value=0, max_value=1000000)
```

### Date Validation
```python
from datetime import datetime
from dateutil.parser import parse

def validate_date(date_string, formats=None, min_date=None, max_date=None):
    """Validate date string"""

    if formats:
        # Try specific formats
        for fmt in formats:
            try:
                date = datetime.strptime(date_string, fmt)
                break
            except ValueError:
                continue
        else:
            raise ValueError(f"Date doesn't match any format: {formats}")
    else:
        # Try parsing
        try:
            date = parse(date_string)
        except Exception:
            raise ValueError(f"Invalid date: {date_string}")

    # Range check
    if min_date and date < min_date:
        raise ValueError(f"Date before minimum: {min_date}")

    if max_date and date > max_date:
        raise ValueError(f"Date after maximum: {max_date}")

    return date

# Usage
validate_date(birthdate, max_date=datetime.now())
validate_date(appointment, formats=['%Y-%m-%d', '%d/%m/%Y'])
```

## Schema Validation

### JSON Schema (Python)
```python
from jsonschema import validate, ValidationError
import json

def validate_json(data, schema):
    """Validate JSON against schema"""

    try:
        validate(instance=data, schema=schema)
        return True
    except ValidationError as e:
        raise ValueError(f"Validation failed: {e.message}")

# Example schema
user_schema = {
    "type": "object",
    "required": ["name", "email"],
    "properties": {
        "name": {
            "type": "string",
            "minLength": 1,
            "maxLength": 100
        },
        "email": {
            "type": "string",
            "format": "email"
        },
        "age": {
            "type": "number",
            "minimum": 0,
            "maximum": 120
        }
    }
}

# Usage
validate_json(user_data, user_schema)
```

### Zod (TypeScript/JavaScript)
```typescript
import { z } from 'zod';

// Define schema
const userSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().min(0).max(120).optional(),
  role: z.enum(['admin', 'user', 'guest']),
  preferences: z.object({
    newsletter: z.boolean().default(false),
    theme: z.enum(['light', 'dark']).default('light')
  }).optional()
});

// Validate
function validateUser(data: unknown) {
  try {
    const user = userSchema.parse(data);
    return { success: true, data: user };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message
        }))
      };
    }
    throw error;
  }
}

// Usage
const result = validateUser(inputData);
if (!result.success) {
  console.error('Validation errors:', result.errors);
}
```

### Yup (JavaScript)
```javascript
import * as yup from 'yup';

// Define schema
const userSchema = yup.object().shape({
  name: yup.string().required().min(1).max(100),
  email: yup.string().required().email(),
  age: yup.number().positive().integer().max(120),
  password: yup.string()
    .required()
    .min(8)
    .matches(/[A-Z]/, 'Must contain uppercase')
    .matches(/[a-z]/, 'Must contain lowercase')
    .matches(/[0-9]/, 'Must contain number'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
});

// Validate
async function validateUser(data) {
  try {
    const validData = await userSchema.validate(data, { abortEarly: false });
    return { success: true, data: validData };
  } catch (errors) {
    return {
      success: false,
      errors: errors.inner.map(e => ({ path: e.path, message: e.message }))
    };
  }
}
```

### Pydantic (Python)
```python
from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime

class User(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    age: int = Field(..., ge=0, le=120)
    role: str = Field(default='user')

    @validator('role')
    def validate_role(cls, v):
        allowed_roles = ['admin', 'user', 'guest']
        if v not in allowed_roles:
            raise ValueError(f'Role must be one of: {allowed_roles}')
        return v

    @validator('name')
    def name_must_not_contain_special_chars(cls, v):
        if not v.replace(' ', '').isalnum():
            raise ValueError('Name must not contain special characters')
        return v

# Usage
try:
    user = User(**user_data)
    print(f"Valid user: {user}")
except ValidationError as e:
    print(f"Validation errors: {e.json()}")
```

## Data Verification

### Checksum Verification
```python
import hashlib

def compute_checksum(file_path, algorithm='sha256'):
    """Compute file checksum"""

    hash_func = getattr(hashlib, algorithm)()

    with open(file_path, 'rb') as f:
        for chunk in iter(lambda: f.read(4096), b''):
            hash_func.update(chunk)

    return hash_func.hexdigest()

def verify_checksum(file_path, expected_checksum, algorithm='sha256'):
    """Verify file checksum"""

    actual = compute_checksum(file_path, algorithm)

    if actual.lower() != expected_checksum.lower():
        raise ValueError(
            f"Checksum mismatch: expected {expected_checksum}, got {actual}"
        )

    return True

# Usage
verify_checksum('download.zip', 'abc123...', 'sha256')
```

### Data Integrity Checks
```python
def verify_data_integrity(data, expected_fields=None, required_fields=None):
    """Verify data structure integrity"""

    # Check if data is dict-like
    if not hasattr(data, '__getitem__') or not hasattr(data, 'keys'):
        raise ValueError("Data must be dictionary-like")

    keys = set(data.keys())

    # Check expected fields exist (if provided)
    if expected_fields:
        expected_set = set(expected_fields)
        if not keys.issuperset(expected_set):
            missing = expected_set - keys
            raise ValueError(f"Missing expected fields: {missing}")

    # Check required fields have values
    if required_fields:
        for field in required_fields:
            if field not in keys:
                raise ValueError(f"Missing required field: {field}")
            if data[field] is None or data[field] == '':
                raise ValueError(f"Required field is empty: {field}")

    return True
```

### Reference Verification
```python
def verify_reference(data, reference_field, reference_lookup):
    """Verify that reference exists in lookup table"""

    if reference_field not in data:
        raise ValueError(f"Missing reference field: {reference_field}")

    reference_value = data[reference_field]

    if reference_value not in reference_lookup:
        raise ValueError(
            f"Invalid reference: {reference_field}={reference_value} not found"
        )

    return reference_lookup[reference_value]

# Usage
verify_reference(order_data, 'user_id', user_lookup)
```

## Sanitization

### HTML Sanitization
```python
import bleach

def sanitize_html(html_content, allowed_tags=None, allowed_attributes=None):
    """Sanitize HTML to prevent XSS"""

    if allowed_tags is None:
        allowed_tags = ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li']

    if allowed_attributes is None:
        allowed_attributes = {
            'a': ['href', 'title'],
            '*': ['class', 'id']
        }

    clean = bleach.clean(
        html_content,
        tags=allowed_tags,
        attributes=allowed_attributes,
        strip=True
    )

    return clean

# Usage
safe_html = sanitize_html(user_input)
```

### SQL Injection Prevention
```python
import re

def sanitize_sql_identifier(identifier):
    """Sanitize SQL table/column names"""

    # Only allow alphanumeric and underscore
    if not re.match(r'^[a-zA-Z_][a-zA-Z0-9_]*$', identifier):
        raise ValueError(f"Invalid SQL identifier: {identifier}")

    return identifier

# Always use parameterized queries instead!
# ❌ BAD - SQL injection risk
query = f"SELECT * FROM users WHERE name = '{user_input}'"

# ✅ GOOD - parameterized
query = "SELECT * FROM users WHERE name = ?"
cursor.execute(query, (user_input,))
```

### Path Traversal Prevention
```python
import os

def safe_path_join(base_path, user_path):
    """Safely join paths to prevent directory traversal"""

    # Clean the path
    clean_path = os.path.normpath(user_path)

    # Check for path traversal attempts
    if clean_path.startswith('..') or '/..' in clean_path or '..\\' in clean_path:
        raise ValueError("Path traversal detected")

    # Join with base
    full_path = os.path.abspath(os.path.join(base_path, clean_path))

    # Verify result is within base path
    if not full_path.startswith(os.path.abspath(base_path)):
        raise ValueError("Path outside base directory")

    return full_path

# Usage
safe_path = safe_path_join('/var/data', user_input_path)
```

## Error Handling

### Validation Error Response
```python
from typing import List, Dict

class ValidationError(Exception):
    def __init__(self, errors: List[Dict[str, str]]):
        self.errors = errors
        super().__init__(f"Validation failed with {len(errors)} errors")

    def to_dict(self):
        return {
            "error": "validation_error",
            "details": self.errors
        }

def validate_request(data, rules):
    """Validate request data against rules"""

    errors = []

    for field, rule in rules.items():
        value = data.get(field)

        # Required check
        if rule.get('required') and not value:
            errors.append({
                "field": field,
                "message": f"Field '{field}' is required"
            })
            continue

        # Skip other validations if not provided and not required
        if value is None:
            continue

        # Type check
        expected_type = rule.get('type')
        if expected_type and not isinstance(value, expected_type):
            errors.append({
                "field": field,
                "message": f"Field '{field}' must be {expected_type.__name__}"
            })
            continue

        # Custom validation
        if 'validate' in rule:
            try:
                rule['validate'](value)
            except ValueError as e:
                errors.append({
                    "field": field,
                    "message": str(e)
                })

    if errors:
        raise ValidationError(errors)

    return True

# Usage
rules = {
    'name': {'type': str, 'required': True},
    'email': {'type': str, 'required': True, 'validate': validate_email},
    'age': {'type': int, 'required': False, 'validate': lambda x: validate_number(x, min_value=0, max_value=120)}
}

try:
    validate_request(request_data, rules)
except ValidationError as e:
    return jsonify(e.to_dict()), 400
```

### Graceful Degradation
```python
def validate_with_defaults(data, rules, defaults=None):
    """Validate but use defaults for missing optional fields"""

    if defaults is None:
        defaults = {}

    validated = {}

    for field, rule in rules.items():
        if field in data:
            try:
                validated[field] = data[field]
                # Apply validation
                if 'validate' in rule:
                    rule['validate'](validated[field])
            except ValueError:
                if field in defaults:
                    validated[field] = defaults[field]
                elif not rule.get('required'):
                    validated[field] = None
                else:
                    raise
        else:
            if field in defaults:
                validated[field] = defaults[field]
            elif rule.get('required'):
                raise ValueError(f"Missing required field: {field}")

    return validated
```

## Best Practices

### 1. Validate Early
```python
# ✅ GOOD - Validate at entry point
def api_handler(request):
    data = validate_request(request.json, schema)
    # ... process validated data

# ❌ BAD - Validate late in process
def api_handler(request):
    data = request.json
    # ... some processing ...
    validate_late(data)  # Too late, damage done
```

### 2. Whitelist over Blacklist
```python
# ❌ BAD - Block specific bad characters
if '<' in text or '>' in text:
    raise ValueError("Invalid characters")

# ✅ GOOD - Allow only good characters
if not re.match(r'^[a-zA-Z0-9 ]+$', text):
    raise ValueError("Only alphanumeric and space allowed")
```

### 3. Use Established Libraries
```python
# ✅ GOOD - Use proven libraries
import bleach  # HTML sanitization
import validators  # Various validations
from pydantic import BaseModel  # Schema validation

# ❌ BAD - Roll your own crypto/validation
def my_email_validator(email):
    # Probably has edge cases you didn't consider
    pass
```

### 4. Provide Helpful Errors
```python
# ❌ BAD - Generic error
raise ValueError("Invalid input")

# ✅ GOOD - Specific error
raise ValueError(f"Email '{email}' is invalid. Must contain @ symbol")
```

## Gold Standard Integration

### Read-Back Verification
After validation:
```python
# Validate
validated_data = validate_user(input_data)

# Verify output
assert isinstance(validated_data, dict)
assert 'email' in validated_data
assert validated_data['email'] == input_data['email'].lower()
print("✅ Validation successful and verified")
```

### Executable Proof
Show validation working:
```python
# Test valid input
try:
    result = validate_user(valid_input)
    print(f"✅ Valid input accepted: {result}")
except ValidationError as e:
    print(f"❌ Should not fail: {e}")

# Test invalid input
try:
    result = validate_user(invalid_input)
    print("❌ Should have failed validation")
except ValidationError as e:
    print(f"✅ Invalid input rejected: {e.errors}")
```

---

**"Validate inputs, verify assumptions, handle errors. Your code's integrity depends on it."**
