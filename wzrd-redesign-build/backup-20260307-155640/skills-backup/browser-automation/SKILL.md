# Browser Automation Skill

**Purpose:** Enable Claude to open browsers, capture screenshots, and validate UI work.

**Category:** testing, validation

---

## Description

This skill provides Claude with the ability to:
1. Open web browsers and navigate to URLs
2. Take screenshots of web pages
3. Wait for elements to load
4. Fill forms and interact with UI elements
5. Validate UI behavior and appearance

This is essential for validating frontend work without relying solely on user reports.

---

## Tools

### 1. Navigate to URL
```bash
browser_open "http://localhost:5665"
```
Opens a browser to the specified URL.

### 2. Take Screenshot
```bash
browser_screenshot "/tmp/screenshot.png"
```
Captures a screenshot of the current browser state.

### 3. Click Element
```bash
browser_click "#submit-button"
```
Clicks an element matching the selector.

### 4. Fill Input
```bash
browser_fill "#email-input" "user@example.com"
```
Fills an input field with text.

### 5. Wait for Element
```bash
browser_wait "#loading-spinner" --timeout 10
```
Waits up to 10 seconds for an element to appear.

---

## Implementation Notes

Uses Playwright for browser automation because it:
- Has excellent headless support
- Works well with Next.js/React SPAs
- Can capture screenshots easily
- Provides reliable element waiting

---

## Usage Pattern

```bash
# 1. Open browser to UI
browser_open "http://localhost:5665"

# 2. Wait for page to load
browser_wait "body" --timeout 5

# 3. Take screenshot to verify
browser_screenshot "/tmp/ui-check-1.png"

# 4. Check if expected elements exist
browser_wait "#scan-results-table" --timeout 5

# 5. Take final screenshot
browser_screenshot "/tmp/ui-check-final.png"
```

---

## Configuration

Browser options:
- `--headless`: Run without visible browser
- `--slowmo`: Slow down actions for visibility
- `--screenshot-path`: Default path for screenshots

---

## Example Workflows

### Validate Page Load
```bash
browser_open "http://localhost:5665/scan"
browser_wait ".scan-table"
browser_screenshot "/tmp/scan-page-loaded.png"
```

### Test Form Submission
```bash
browser_open "http://localhost:5665/scan"
browser_fill "#scanner-code" "..."
browser_click "#run-scan"
browser_wait ".results-panel"
browser_screenshot "/tmp/scan-results.png"
```

---

## Troubleshooting

**Issue:** Browser can't connect
**Fix:** Check if the service is running on the expected port

**Issue:** Elements not found
**Fix:** Use `browser_screenshot` to see what's actually rendered

**Issue:** SPA not updating
**Fix:** Increase timeout, use `browser_wait` for dynamic content
