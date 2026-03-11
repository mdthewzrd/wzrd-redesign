---
name: visual-validator
description: Agent-browser powered visual validation for UI changes with AI vision analysis
category: ui-ux
priority: P0
tags: [agent-browser, validation, visual-testing, ui-ux, accessibility, responsive]
subskills:
  - screenshot-capture
  - element-detection
  - diff-analysis
  - accessibility-check
---

# Visual Validator Skill

## Purpose

**AI-powered visual validation** using Vercel's agent-browser for automated UI testing with screenshot comparison and AI vision analysis.

## Core Principle

**"Visual change without verification is a bug. Every UI change must be screenshot-validated."**

---

## Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    VISUAL VALIDATION LOOP                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. OPEN PAGE                                                   │
│     agent-browser open <url>                                      │
│                                                                   │
│  2. GET SNAPSHOT (stable element refs)                              │
│     agent-browser snapshot                                          │
│     Output: @e1, @e2, @e3, ...                              │
│                                                                   │
│  3. TAKE BEFORE SCREENSHOT                                       │
│     agent-browser screenshot /tmp/before.png                         │
│                                                                   │
│  4. PERFORM ACTION                                               │
│     agent-browser click @e1                                       │
│     OR agent-browser fill @e2 "text"                               │
│                                                                   │
│  5. WAIT FOR CHANGES                                              │
│     agent-browser wait @e3 3000                                  │
│     OR agent-browser wait 2000                                      │
│                                                                   │
│  6. TAKE AFTER SCREENSHOT                                        │
│     agent-browser screenshot /tmp/after.png                          │
│                                                                   │
│  7. ANALYZE DIFF (AI Vision)                                   │
│     Compare screenshots                                      │
│     Identify issues                                             │
│     Suggest fixes                                                │
│                                                                   │
│  8. FIX IF NEEDED (max 3 iterations)                              │
│     Edit code                                                   │
│     Re-screenshot                                                │
│     Re-analyze                                                  │
│                                                                   │
│  9. FINAL VALIDATION                                              │
│     agent-browser screenshot /tmp/final.png                           │
│     agent-browser close                                              │
│                                                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Agent-Browser Commands

### Navigation

| Command | Description | Example |
|----------|-------------|----------|
| `open <url>` | Navigate to URL | `agent-browser open http://localhost:5174` |
| `back` | Go back in history | `agent-browser back` |
| `forward` | Go forward | `agent-browser forward` |
| `reload` | Reload page | `agent-browser reload` |

### Interaction

| Command | Description | Example |
|----------|-------------|----------|
| `snapshot` | Get element tree with refs | `agent-browser snapshot` |
| `click <sel>` | Click element by ref | `agent-browser click @e1` |
| `dblclick <sel>` | Double-click | `agent-browser dblclick @e1` |
| `fill <sel> <text>` | Clear and fill | `agent-browser fill @e2 "hello"` |
| `type <sel> <text>` | Type text | `agent-browser type @e2 "world"` |
| `press <key>` | Press key | `agent-browser press "Enter"` |
| `hover <sel>` | Hover over element | `agent-browser hover @e1` |
| `check <sel>` | Check checkbox | `agent-browser check @e4` |
| `uncheck <sel>` | Uncheck checkbox | `agent-browser uncheck @e4` |
| `select <sel> <val>` | Select dropdown | `agent-browser select @e5 "Option 1"` |

### Scrolling

| Command | Description | Example |
|----------|-------------|----------|
| `scroll <dir> [px]` | Scroll page | `agent-browser scroll down 500` |
| `scrollintoview <sel>` | Scroll element into view | `agent-browser scrollintoview @e1` |

### Waiting

| Command | Description | Example |
|----------|-------------|----------|
| `wait <sel|ms>` | Wait for element or time | `agent-browser wait @e1 5000` |
| `wait 2000` | Wait 2 seconds | `agent-browser wait 2000` |

### Information

| Command | Description | Example |
|----------|-------------|----------|
| `get text <sel>` | Get element text | `agent-browser get text @e1` |
| `get url` | Get current URL | `agent-browser get url` |
| `get value <sel>` | Get input value | `agent-browser get value @e2` |
| `get count <selector>` | Count elements | `agent-browser get count "button"` |

### State Checking

| Command | Description | Example |
|----------|-------------|----------|
| `is visible <sel>` | Check visibility | `agent-browser is visible @e1` |
| `is enabled <sel>` | Check if enabled | `agent-browser is enabled @e2` |

### Output

| Command | Description | Example |
|----------|-------------|----------|
| `screenshot [path]` | Take screenshot | `agent-browser screenshot /tmp/ui.png` |
| `pdf <path>` | Save as PDF | `agent-browser pdf report.pdf` |

### JavaScript

| Command | Description | Example |
|----------|-------------|----------|
| `eval <js>` | Run JavaScript | `agent-browser eval "document.title"` |

### Browser Control

| Command | Description | Example |
|----------|-------------|----------|
| `set viewport <w> <h>` | Set viewport size | `agent-browser set viewport 1920 1080` |
| `set device <name>` | Set device preset | `agent-browser set device iPhone` |
| `close` | Close browser | `agent-browser close` |

---

## Snapshot-Based References

### How It Works

Agent-browser uses **stable element references** instead of CSS selectors:

```bash
# Get snapshot - shows all interactive elements with refs
$ agent-browser snapshot

Output:
@e1 - Button: "Upload Scanner" [visible, enabled]
@e2 - Input: placeholder="Search scanners..." [visible, enabled]
@e3 - Link: text="View Results" [visible, enabled]
@e4 - Button: "Run Scan" [visible, enabled]

# Use refs to interact - they stay stable even if layout changes
agent-browser click @e1  # Upload button
agent-browser fill @e2 "AAPL"  # Search input
agent-browser click @e4  # Run scan
```

### Advantages Over CSS Selectors

- ✅ Stable across layout changes
- ✅ AI-friendly (natural references)
- ✅ No complex selector strings
- ✅ 90% fewer tokens needed

---

## Testing Workflows

### Example 1: Validate Scanner Upload

```bash
# 1. Open page
agent-browser open http://localhost:5174/scan

# 2. Get snapshot to find upload button
agent-browser snapshot
# Output: @e1 - Button: "Upload Scanner", @e2 - File input

# 3. Verify upload button exists
agent-browser is visible @e1
agent-browser get text @e1
# Output: "Upload Scanner"

# 4. Upload a file
agent-browser upload @e2 /path/to/scanner.py

# 5. Take screenshot after upload
agent-browser screenshot /tmp/after-upload.png

# 6. Verify scanner appeared in list
agent-browser snapshot
# Look for new scanner card

# 7. Close
agent-browser close
```

### Example 2: Validate Form Submission

```bash
# 1. Open page
agent-browser open http://localhost:5174/settings

# 2. Get snapshot
agent-browser snapshot
# Output: @e1 - Name input, @e2 - Email input, @e3 - Save button

# 3. Fill form
agent-browser fill @e1 "John Doe"
agent-browser fill @e2 "john@example.com"

# 4. Click submit
agent-browser click @e3

# 5. Wait for success message
agent-browser wait "@e4" 5000

# 6. Take screenshot
agent-browser screenshot /tmp/form-submit.png

# 7. Verify success
agent-browser get text @e4
# Output: "Settings saved!"

# 8. Close
agent-browser close
```

### Example 3: Responsive Testing

```bash
# Test mobile view
agent-browser set viewport 375 667
agent-browser open http://localhost:5174
agent-browser screenshot /tmp/mobile.png

# Test tablet view
agent-browser set viewport 768 1024
agent-browser open http://localhost:5174
agent-browser screenshot /tmp/tablet.png

# Test desktop view
agent-browser set viewport 1920 1080
agent-browser open http://localhost:5174
agent-browser screenshot /tmp/desktop.png

# Close
agent-browser close
```

### Example 4: Interactive Element Test

```bash
# 1. Open page
agent-browser open http://localhost:5174

# 2. Get snapshot
agent-browser snapshot
# Output: @e1 - Button, @e2 - Modal container

# 3. Verify button is enabled
agent-browser is enabled @e1

# 4. Click button
agent-browser click @e1

# 5. Wait for modal
agent-browser wait @e2 3000

# 6. Verify modal is visible
agent-browser is visible @e2

# 7. Take screenshot
agent-browser screenshot /tmp/modal-test.png

# 8. Close modal (if button @e3)
agent-browser click @e3

# 9. Verify modal closed
agent-browser is visible @e2
# Should be false

# 10. Close
agent-browser close
```

---

## AI Vision Analysis

### Screenshot Comparison Prompt

```text
Compare these two UI screenshots (before and after). Provide:

1. Layout Changes:
   - What moved/changed position?
   - Any alignment issues?
   - Responsive issues?

2. Color Changes:
   - Any color differences?
   - Contrast issues?
   - Missing/styled elements?

3. Typography:
   - Font size changes?
   - Missing text?
   - Truncated text?

4. Interactive Elements:
   - Are all buttons visible?
   - Are inputs working?
   - Any broken interactions?

5. Accessibility:
   - Focus indicators visible?
   - Touch targets adequate?
   - Color contrast OK?

6. Specific Issues Found:
   - List each problem with location
   - Suggest specific CSS fixes

Format as structured JSON.
```

### Element Detection Prompt

```text
Analyze this UI screenshot. Provide:

1. Interactive Elements:
   - Buttons (position, text, state)
   - Inputs (position, placeholder, type)
   - Links (position, text)
   - Dropdowns (position, options)
   - Modals (position, content)
   - Checkboxes/Radios (position, state)

2. Layout Structure:
   - Header (content, height)
   - Sidebar (content, width)
   - Main content (sections)
   - Footer (content)

3. Typography:
   - Headings (h1, h2, h3) with sizes/weights
   - Body text with font/size
   - Any text issues (overflow, missing)

4. Visual Issues:
   - Overlapping elements
   - Truncated content
   - Missing borders/backgrounds
   - Alignment problems
   - Spacing inconsistencies

Format as JSON with coordinates where possible.
```

---

## Device Presets

| Preset | Width | Height | Description |
|---------|--------|---------|-------------|
| `iPhone` | 375 | 667 | Mobile portrait |
| `iPhone landscape` | 667 | 375 | Mobile landscape |
| `iPad` | 768 | 1024 | Tablet portrait |
| `iPad landscape` | 1024 | 768 | Tablet landscape |
| `Desktop` | 1920 | 1080 | Standard desktop |
| `Wide` | 2560 | 1440 | Wide screen |

---

## Common Issues & Debugging

### Issue: Element Not Found

```bash
# Take screenshot to see current state
agent-browser screenshot /tmp/debug.png

# Get full snapshot
agent-browser snapshot

# Check if element exists via JS
agent-browser eval "document.querySelector('button').textContent"

# Count elements
agent-browser get count "button"
agent-browser get count "input"
```

### Issue: Element Not Visible

```bash
# Scroll element into view
agent-browser scrollintoview @e1

# Wait for element to appear
agent-browser wait @e1 5000

# Check visibility
agent-browser is visible @e1

# Check if hidden via CSS
agent-browser eval "window.getComputedStyle(document.querySelector('button')).display"
```

### Issue: Element Not Clickable

```bash
# Try focusing first
agent-browser focus @e1

# Then click
agent-browser click @e1

# Or use JavaScript click
agent-browser eval "document.querySelector('button').click()"

# Check if element is covered
agent-browser screenshot /tmp/coverage.png
```

### Issue: Page Not Loading

```bash
# Open and wait
agent-browser open http://localhost:5174

# Wait for specific element
agent-browser wait "h1" 10000

# Check URL
agent-browser get url

# Check page title
agent-browser eval "document.title"

# Take screenshot
agent-browser screenshot /tmp/page-load.png
```

---

## Accessibility Checks

### Visual Checks

- [ ] Color contrast ≥ 4.5:1 (WCAG AA)
- [ ] Focus indicators visible on all interactive elements
- [ ] Touch targets ≥ 44×44px
- [ ] Text is readable (no truncated, no overflow)
- [ ] No color-only information

### Keyboard Navigation

```bash
# Test Tab navigation
agent-browser press "Tab"
agent-browser screenshot /tmp/tab-1.png

agent-browser press "Tab"
agent-browser screenshot /tmp/tab-2.png

# Test form submission with Enter
agent-browser fill @e1 "value"
agent-browser press "Enter"

# Test Escape to close modals
agent-browser press "Escape"
```

### Screen Reader Compatibility

```bash
# Check ARIA labels
agent-browser eval "
  Array.from(document.querySelectorAll('button, a, input'))
    .map(el => ({
      tag: el.tagName,
      ariaLabel: el.getAttribute('aria-label'),
      ariaHidden: el.getAttribute('aria-hidden'),
    }))
"
```

---

## Integration with design-mode

### From greenfield-mode

```
1. Design token extraction → Generate theme → Scaffold components
2. For each component:
   - Open in agent-browser
   - Screenshot
   - Validate visually
   - Fix issues if found
3. Full page validation:
   - Open page
   - Test all interactions
   - Validate responsive (3 viewports)
4. Final screenshot as baseline
```

### From brownfield-mode

```
1. Analyze existing code → Apply design updates
2. For each change:
   - Open page in agent-browser
   - Screenshot before
   - Apply change
   - Screenshot after
   - Analyze diff
   - Fix if needed
3. Full regression test:
   - Test all modified pages
   - Check for visual regressions
4. Document changes
```

---

## Quick Reference

### Commands

```bash
# Navigation
agent-browser open <url>
agent-browser back | forward | reload

# Interaction
agent-browser snapshot
agent-browser click @e1
agent-browser fill @e2 "text"
agent-browser press "Enter"

# Output
agent-browser screenshot /tmp/out.png
agent-browser get text @e1
agent-browser get url

# State
agent-browser is visible @e1
agent-browser wait @e1 5000

# Viewport
agent-browser set viewport 1920 1080
agent-browser set device iPhone

# Control
agent-browser close
```

### Workflow Patterns

```bash
# Before/After Pattern
agent-browser open <url>
agent-browser screenshot /tmp/before.png
# ... make changes ...
agent-browser screenshot /tmp/after.png
# ... analyze diff ...

# Multi-Viewport Pattern
agent-browser set viewport 375 667
agent-browser screenshot /tmp/mobile.png
agent-browser set viewport 1920 1080
agent-browser screenshot /tmp/desktop.png

# Element Test Pattern
agent-browser snapshot
# Find element @e1
agent-browser is visible @e1
agent-browser click @e1
agent-browser wait @e2 3000
agent-browser screenshot /tmp/result.png
```

---

## Sources

- [agent-browser Documentation](https://agent-browser.dev/)
- [agent-browser GitHub](https://github.com/vercel-labs/agent-browser)
- [agent-browser Commands](https://agent-browser.dev/commands)
- [ui-vision Skill](/home/mdwzrd/.claude/skills/ui-vision/SKILL.md)

---

**"Visual change without verification is a bug. Every UI change must be screenshot-validated with agent-browser."**
