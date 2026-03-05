---
name: discord-file-upload
description: Discord file upload capability for sending files in responses
category: integration
priority: P2
tags: [discord, file-upload, attachment, telegram]
---

# Discord File Upload Skill

## Purpose
Enable file uploads to Discord (and Telegram) directly in responses instead of pasting large code blocks.

## Core Principle
**"Don't paste code. Send files."**

## How It Works

The Discord bot detects special upload markers in responses and automatically uploads files.

### Upload Marker Format

Use one of these markers in your response:

```
📎UPLOAD:/path/to/file.py
```

or

```
[UPLOAD:/path/to/file.py]
```

### Response Format

```
Here's the Gold Standard version of your scanner:

📎UPLOAD:/home/mdwzrd/wzrd.dev/projects/edge.dev/uploads/Scanner.py

Key improvements:
- 5-stage pipeline
- Smart filtering
- Class-based architecture
```

The bot will:
1. Detect the `📎UPLOAD:` marker
2. Extract the file path
3. Upload the file to Discord
4. Send your text message with the file attachment

## File Path Resolution

The bot searches for files in these locations (in order):

1. **Explicit absolute path**: `/home/mdwzrd/wzrd.dev/projects/edge.dev/uploads/file.py`
2. **Project uploads**: `~/wzrd.dev/projects/edge.dev/uploads/file.py`
3. **Global uploads**: `~/wzrd.dev/uploads/file.py`
4. **Current directory**: `./file.py`

## Limitations

| Limitation | Value |
|------------|--------|
| Max file size | 25 MB (Discord limit) |
| Supported formats | Any (images, code, PDF, etc.) |

## Usage Examples

### Example 1: Python Code File

```markdown
Here's the scanner code:

📎UPLOAD:NewfastestScandJT_GoldStandard_v1.py

It includes:
- Class-based architecture
- 5-stage pipeline
- Smart filtering
```

### Example 2: With Full Path

```markdown
Results saved as:

📎UPLOAD:/home/mdwzrd/wzrd.dev/projects/edge.dev/uploads/results.csv

Total signals found: 42
```

### Example 3: Multiple Files

```markdown
Here are the files:

📎UPLOAD:scanner.py
📎UPLOAD:config.py
📎UPLOAD:requirements.txt

Run with: python scanner.py
```

## Role-Shifting

When shifting **to** Discord file upload mode:
```
"Using Discord file upload mode..."
→ Identify file to send
→ Verify file exists
→ Generate upload marker
→ Include marker in response
```

## Gold Standard Integration

### Read-Back Verification
- Verify the file exists before including upload marker
- Check file path is correct
- Confirm file is under 25MB

### Executable Proof
- Show the upload marker format
- Demonstrate the bot will parse and upload
- Provide the file path that will be used

### Loop Prevention
If file upload fails:
1. Check file path is correct
2. Verify file exists
3. Fall back to pasting code if needed

## Checklist

Before using Discord file upload:
- [ ] File exists at specified path
- [ ] File is under 25MB
- [ ] Upload marker format is correct
- [ ] File path is accessible to Discord bot
- [ ] Context message provided (optional but recommended)

---

**"A file is worth a thousand lines of pasted code."**
