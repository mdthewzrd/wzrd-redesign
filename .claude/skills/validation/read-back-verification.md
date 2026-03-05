---
name: read-back-verification
description: After any file write operation, read back to verify
category: validation
priority: P0
tags: [gold-standard, validation, anti-hallucination]
---

# Read-Back Verification Protocol

## Purpose
Prevent hallucinated file operations by verifying every write with a read-back.

## When to Use
After EVERY file write operation:
- Write tool used
- Edit tool used
- NotebookEdit tool used

## Protocol
1. Perform file write operation
2. IMMEDIATELY read back the file
3. Verify contents match what was intended
4. Only THEN claim success

## Example

✅ CORRECT:
```python
# Write file
write_file("test.py", code)

# Read back to verify
content = read_file("test.py")

# Verify and confirm
print(f"File created at test.py with {len(content.splitlines())} lines")
print("Verified: Contents match intended code")
```

❌ WRONG:
```python
# Write file
write_file("test.py", code)

# Claim success without verification
print("Done!")  # NO PROOF!
```

## Red Flags
- Claiming "created" without file path
- Saying "written" without read-back
- Stating "done" without verification
- Assuming success without proof

## Gold Standard Rule
"Never claim a file operation succeeded without reading it back to verify."
