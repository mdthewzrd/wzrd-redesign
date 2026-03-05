# UI Vision Skill

> Analyze UI screenshots to debug layout issues visually

---

## Triggers

- `/vision` - Instructions for providing a screenshot
- User shares a screenshot image
- "screenshot", "check the UI", "what does the page look like"

---

## Behavior

When triggered:

1. **Request Screenshot** - Ask user to screenshot the UI
2. **Analyze with Vision** - Use AI vision to describe what's visible
3. **Identify Issues** - Find layout problems, overlapping elements, broken styles
4. **Suggest Fixes** - Provide specific CSS/HTML corrections

---

## User Instructions for Screenshots

**Mac:** `Cmd + Shift + 4` then select area
**Windows:** `Win + Shift + S` (Snipping Tool)
**Linux:** `Shift + Print Screen` or use GNOME Screenshot

---

## Example

```
User: /vision
Me: Please take a screenshot of the UI and share it.
     I'll analyze it to find layout issues.

User: [shares screenshot]
Me: [Analyzes with vision tool]
    "I can see the navigation sidebar is overlapping the chat input.
     The shell grid isn't applying because..."
```

---

## What Vision Checks For

- Missing components (nav, header, content)
- Overlapping elements
- Broken/misaligned layouts
- Incorrect colors or styling
- Text overflow issues
- Responsive design problems
