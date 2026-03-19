# Kimi K2.5 Formatting Fix

## Problem
Kimi K2.5 loses formatting (no line breaks, plain text output) after extended conversations in Research Mode.

## Root Causes
1. Context degradation over long conversations
2. System prompt erosion in extended sessions
3. Model-specific formatting quirks

## Immediate Fix: Enhanced System Prompt

Add this to the Kimi configuration:

```markdown
# Formatting Instructions (DO NOT FORGET)

## RESPONSE FORMAT RULES:
1. **ALWAYS USE PROPER MARKDOWN**: Use headings, lists, code blocks
2. **LINE BREAKS**: Add blank lines between sections
3. **CODE BLOCKS**: Use triple backticks with language specifier
4. **LISTS**: Use bullet points or numbered lists
5. **HEADINGS**: Use ## for major sections, ### for subsections

## FORMATTING TEMPLATE:

[RESEARCH MODE]
**Topic**: [Brief topic summary]

## Key Findings
- Finding 1 with details
- Finding 2 with details

## Analysis
[Properly formatted analysis with paragraphs separated by blank lines]

## Recommendations
1. Recommendation 1
2. Recommendation 2

## Code Example (if applicable)
```python
# Properly formatted code
def example():
    return "formatted"
```

## Notes
- Maintain formatting throughout entire response
- Use consistent spacing and structure
- Don't collapse paragraphs into walls of text
```

## Solution 2: Periodic Formatting Reset

Create a script that periodically reinforces formatting:

```bash
#!/bin/bash
# kimi-formatting-reset.sh
# Run every 10-15 minutes during extended Kimi sessions

echo "🔧 Reinforcing Kimi formatting rules..."
echo ""
echo "## FORMATTING REMINDER"
echo "Kimi: Please maintain proper formatting throughout this session."
echo "- Use markdown headings (##, ###)"
echo "- Add blank lines between sections"
echo "- Use code blocks with language tags"
echo "- Format lists with bullets/numbers"
echo "- Don't collapse text into paragraphs"
echo ""
```

## Solution 3: Model Configuration Adjustment

Add to OpenCode agent configuration:

```json
{
  "agent": {
    "remi-research": {
      "model": "nvidia/moonshotai/kimi-k2.5",
      "system_prompt": "You are a research assistant. Always maintain proper formatting: use markdown headings, line breaks between sections, code blocks with language tags, bullet/numbered lists. Never output plain text without formatting.",
      "temperature": 0.7,
      "max_tokens": 4000,
      "formatting_reminder_frequency": 10  // Every 10 messages
    }
  }
}
```

## Solution 4: Wrapper Script

Create `/home/mdwzrd/bin/kimi-research-formatted`:

```bash
#!/bin/bash
# Power-optimized Kimi Research Mode with formatting fix

MODEL="nvidia/moonshotai/kimi-k2.5"
CONTEXT="64000"  # Reduced from 128K to prevent degradation
TEMPERATURE="0.7"
MAX_TOKENS="4000"

echo "🔬 Kimi Research Mode (with formatting fix)"
echo "Model: $MODEL"
echo "Context: $CONTEXT tokens (reduced to prevent degradation)"
echo "Temperature: $TEMPERATURE"
echo ""

# Start with formatting reinforcement
opencode --model "$MODEL" \
  --context "$CONTEXT" \
  --temperature "$TEMPERATURE" \
  --max-tokens "$MAX_TOKENS" \
  --system-prompt "You are a research assistant. FORMATTING RULES: Always use proper markdown formatting. Use headings (##), line breaks between sections, code blocks with language tags, bullet/numbered lists. Never output plain text without formatting. Maintain these rules throughout the entire conversation." \
  "$@"
```

## Solution 5: Auto-Formatting Post-Processor

Create a Python script to fix formatting post-generation:

```python
#!/usr/bin/env python3
# kimi-auto-formatter.py
import re
import sys

def fix_kimi_formatting(text):
    """Fix Kimi formatting issues"""
    
    # Add line breaks between sections
    text = re.sub(r'(\n)(##|\*\*)', r'\1\1\2', text)
    
    # Ensure code blocks have language
    text = re.sub(r'```\s*\n', r'```python\n', text)
    
    # Add spacing after headings
    text = re.sub(r'(#+ .+?)\n', r'\1\n\n', text)
    
    # Fix collapsed paragraphs
    text = re.sub(r'\.(?=[A-Z])', r'.\n\n', text)
    
    return text

if __name__ == "__main__":
    input_text = sys.stdin.read()
    fixed_text = fix_kimi_formatting(input_text)
    print(fixed_text)
```

## Testing

Test the fix with:
```bash
# Test basic formatting
wzrd.dev --mode research "Research React best practices"

# Test with formatting wrapper
kimi-research-formatted "Research Next.js vs Remix"
```

## Monitoring

Check formatting health:
```bash
# Count line breaks in recent Kimi responses
tail -n 100 ~/.cache/opencode-conversation.log | grep -c "^$"

# Check for markdown usage
tail -n 100 ~/.cache/opencode-conversation.log | grep -c "```"
```

## Implementation Priority

1. **Immediate**: Add formatting reinforcement to system prompt
2. **Short-term**: Create wrapper script with reduced context
3. **Medium-term**: Implement auto-formatting post-processor
4. **Long-term**: Consider model switching after N tokens

## Expected Results
- Formatted responses with proper line breaks
- Consistent markdown usage
- No collapsed paragraphs
- Better readability in long sessions
```

## Related Issues
- May need to reduce context window from 128K to 64K to prevent degradation
- Consider periodic session reset after 50-100 messages
- Add formatting check to watchdog script