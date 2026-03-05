# UI Screenshot Skill

> Take screenshots of local web UI and analyze them with vision to debug layout issues

---

## Triggers

- `/screenshot` - Take a screenshot of localhost:5173 and analyze
- `/screenshot [url]` - Screenshot specific URL
- "screenshot the UI", "what does the page look like"

---

## Behavior

When invoked:

1. **Take Screenshot**
   - Use puppeteer or playwright to capture the page
   - Save to temporary file
   - Default: http://localhost:5173/

2. **Analyze with Vision**
   - Use mcp__4_5v_mcp__analyze_image tool
   - Prompt: "Describe in detail the layout structure, any visual issues, overlapping elements, broken styles, missing components, and what needs to be fixed"

3. **Report Findings**
   - List what's working
   - List what's broken
   - Suggest specific fixes

---

## Requirements

- `playwright` package installed (for screenshots)
- Local server running on localhost:5173

---

## Example Usage

```bash
User: /screenshot
Me: [Takes screenshot, analyzes it]
    "I can see the issue: the chat input is overlapping the navigation. The shell grid layout isn't being applied because..."
```

---

## Implementation Notes

If playwright isn't installed:
```bash
npm install -D playwright
npx playwright install chromium
```

Screenshot command:
```bash
npx playwright screenshot http://localhost:5173 /tmp/ui-screenshot.png
```
