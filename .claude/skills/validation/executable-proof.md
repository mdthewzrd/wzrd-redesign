---
name: executable-proof
description: Never claim something works without showing it actually working
category: validation
priority: P0
tags: [gold-standard, validation, anti-hallucination]
---

# Executable Proof Protocol

## Purpose
Ensure all claims of success are backed by actual executable proof.

## Golden Rule
"Never claim something works without executable proof"

## What Counts as Proof

### Code
✅ Actual execution with output shown:
```bash
$ python script.py
Output: Success - processed 150 files
```

✅ Test results:
```bash
$ npm test
Tests: 150 passed, 0 failed
```

### Files
✅ File path exists:
```bash
$ ls -la /home/mdwzrd/wzrd-dev/README.md
-rw-r--r-- 1 mdwzrd mdwzrd 4512 Feb 18 19:30 README.md
```

✅ File contents read back:
```python
content = read_file("/path/to/file.md")
print(f"File has {len(content)} characters")
```

### UI/Web
✅ Screenshots showing actual interface
✅ Browser console showing successful requests
✅ Network logs showing 200 OK responses

## What Does NOT Count as Proof

❌ "I created the file" (no path, no read-back)
❌ "It should work" (no execution, no output)
❌ "The code is correct" (no tests, no proof)
❌ "Configuration is set" (no verification, no evidence)
❌ "Service is running" (no status check, no logs)

## Examples

✅ CORRECT:
```python
# Create service
write_file("service.py", service_code)

# Verify file exists
read_file("service.py")

# Execute and show output
result = subprocess.run(["python", "service.py"], capture_output=True)
print(f"Service output: {result.stdout}")
print(f"Return code: {result.returncode}")

# Only then claim success
if result.returncode == 0:
    print("✅ Service started successfully")
```

❌ WRONG:
```python
# Create service
write_file("service.py", service_code)

# Claim success without proof
print("Service created and running!")  # NO EXECUTION!
```

## Hallucination Detection

### Signs of Hallucinated Work
- No file paths shown
- No execution output
- No test results
- No actual evidence
- Vague claims ("done", "complete", "working")

### Prevention
1. Always show file paths
2. Always execute code
3. Always show output
4. Always run tests
5. Always provide screenshots for UI

## Gold Standard Enforcement
If you catch yourself claiming success without proof:
1. STOP
2. Go back and verify
3. Show actual evidence
4. Only then confirm success

## Context
This skill is part of Gold Standard Pillar 5: Reliability & Validation.
See: /home/mdwzrd/claude-code-gold-standard/05-reliability-honest-validation.md
