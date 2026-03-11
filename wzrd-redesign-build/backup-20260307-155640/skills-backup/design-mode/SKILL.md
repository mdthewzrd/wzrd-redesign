---
name: design-mode
description: Unified design mode for Remi - greenfield (new projects) and brownfield (existing code) workflows with agent-browser visual validation
category: ui-ux
priority: P0
tags: [design, ui, ux, greenfield, brownfield, agent-browser, shadcn, tailwind, validation]
subskills:
  - design-token-extraction
  - theme-generation
  - component-generation
  - visual-validation
  - accessibility-checking
---

# Design Mode Skill

## Purpose

**Unified design mode for Remi** that handles both greenfield (new projects from scratch) and brownfield (existing codebases) workflows with agent-browser-powered visual validation.

## Core Principle

**"Design without validation is broken. Every change must be visually verified."**

---

## Architecture

```
design-mode
├── greenfield/          # New projects from scratch
│   ├── analyze-vision
│   ├── extract-tokens
│   ├── generate-theme
│   └── scaffold-components
│
└── brownfield/          # Existing codebases
    ├── analyze-existing
    ├── identify-debt
    ├── apply-updates
    └── validate-changes

SHARED SUB-SKILLS
├── visual-validator      (agent-browser + AI vision)
├── theme-generator      (Tailwind config output)
├── shadcn-generator     (Component scaffolding)
├── token-extractor      (dembrandt integration)
└── accessibility-checker (WCAG compliance)
```

---

## Greenfield Workflow

### 1. Analyze Vision
```
Input: Screenshot or design reference
↓
AI Vision Analysis (ui-vision skill)
↓
Output: Layout structure, components, colors, typography
```

### 2. Extract Design Tokens
```bash
# Extract tokens from reference site
npx dembrandt <reference-url> --format json --tokens all

# Parse output
# - colors: primary, secondary, muted, etc.
# - typography: fonts, sizes, weights
# - spacing: base unit, scale
# - borders: radius, widths
# - shadows: elevation levels
```

### 3. Generate Theme
```javascript
// Generate Tailwind config from tokens
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: extracted.primary,
        secondary: extracted.secondary,
        // ...
      },
      fontFamily: {
        sans: extracted.fonts.body,
        mono: extracted.fonts.code,
      },
      spacing: {
        xs: extracted.spacing[0],
        sm: extracted.spacing[1],
        md: extracted.spacing[2],
        lg: extracted.spacing[3],
        xl: extracted.spacing[4],
      },
      borderRadius: {
        sm: extracted.borders.radius[0],
        DEFAULT: extracted.borders.radius[1],
        lg: extracted.borders.radius[2],
      },
      boxShadow: {
        sm: extracted.shadows[0],
        DEFAULT: extracted.shadows[1],
        lg: extracted.shadows[2],
      },
    },
  },
}
```

### 4. Scaffold Components
```bash
# Generate shadcn/ui components
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add dialog
npx shadcn@latest add badge
npx shadcn@latest add table
```

---

## Brownfield Workflow

### 1. Analyze Existing Code
```bash
# Scan project structure
find src -name "*.tsx" -o -name "*.ts" | head -50

# Extract current theme
cat tailwind.config.js
cat src/app/globals.css
```

### 2. Identify Design Debt
```
Checks:
  ❌ Inconsistent colors (mix of hex, rgba, Tailwind)
  ❌ Inconsistent spacing (p-2, p-[15px], py-3)
  ❌ Missing responsive breakpoints
  ❌ No dark mode support
  ❌ Accessibility violations
  ❌ Mixed component libraries
```

### 3. Apply Design Updates
```tsx
// Replace hardcoded values with theme tokens
// Before:
<button className="bg-[#fbbf24] text-white">Click</button>

// After:
<button className="bg-primary text-primary-foreground">Click</button>
```

### 4. Validate Changes
```bash
# Use agent-browser for visual validation
agent-browser open http://localhost:5174
agent-browser snapshot
agent-browser screenshot /tmp/after-update.png
```

---

## Visual Validation Loop (Agent-Browser)

### Core Workflow

```bash
# 1. Open page
agent-browser open <url>

# 2. Get snapshot (stable element refs)
agent-browser snapshot
# Output: @e1 - Button, @e2 - Input, @e3 - Card...

# 3. Take before screenshot
agent-browser screenshot /tmp/before.png

# 4. Interact with element
agent-browser click @e1

# 5. Wait for changes
agent-browser wait @e2 3000

# 6. Take after screenshot
agent-browser screenshot /tmp/after.png

# 7. Analyze differences (UI Vision)
# Compare screenshots, identify issues

# 8. Fix if needed
# Iterate max 3 times

# 9. Final validation
agent-browser screenshot /tmp/final.png
```

### Agent-Browser Commands Reference

| Command | Description | Example |
|----------|-------------|----------|
| `open <url>` | Navigate to URL | `agent-browser open http://localhost:5174` |
| `snapshot` | Get element tree with refs | `agent-browser snapshot` |
| `click <sel>` | Click element by ref | `agent-browser click @e1` |
| `fill <sel> <text>` | Fill input | `agent-browser fill @e2 "hello"` |
| `type <sel> <text>` | Type text | `agent-browser type @e3 "world"` |
| `press <key>` | Press key | `agent-browser press "Enter"` |
| `wait <sel|ms>` | Wait for element or time | `agent-browser wait @e4 5000` |
| `screenshot [path]` | Take screenshot | `agent-browser screenshot /tmp/out.png` |
| `is visible <sel>` | Check visibility | `agent-browser is visible @e1` |
| `set viewport <w> <h>` | Set viewport | `agent-browser set viewport 1920 1080` |
| `set device <name>` | Use device preset | `agent-browser set device iPhone` |
| `get text <sel>` | Get element text | `agent-browser get text @e1` |
| `eval <js>` | Run JavaScript | `agent-browser eval "document.title"` |
| `close` | Close browser | `agent-browser close` |

---

## Design Token System

### Base Colors (WZRD.dev Theme)

| Token | Hex | Usage |
|-------|------|--------|
| `--background` | `#09090b` | Main background |
| `--surface` | `#18181b` | Cards, panels |
| `--border` | `#27272a` | Dividers, borders |
| `--foreground` | `#e5e5e5` | Primary text |
| `--muted` | `#64748b` | Secondary text |
| `--primary` | `#fbbf24` | Brand gold (accent) |
| `--primary-foreground` | `#000000` | Text on primary |
| `--secondary` | `#27272a` | Secondary backgrounds |
| `--accent` | `#27272a` | Hover states |
| `--destructive` | `#ef4444` | Error states |
| `--success` | `#10b981` | Success states |
| `--warning` | `#f59e0b` | Warning states |

### Spacing Scale (4px base)

| Token | Value | Tailwind |
|-------|--------|----------|
| `--space-1` | 4px | `p-1`, `gap-1` |
| `--space-2` | 8px | `p-2`, `gap-2` |
| `--space-3` | 12px | `p-3`, `gap-3` |
| `--space-4` | 16px | `p-4`, `gap-4` |
| `--space-5` | 20px | `p-5`, `gap-5` |
| `--space-6` | 24px | `p-6`, `gap-6` |

### Typography Scale

| Token | Value | Tailwind |
|-------|--------|----------|
| `--font-heading` | Space Grotesk | `font-sans` |
| `--font-body` | Space Grotesk | `font-sans` |
| `--font-mono` | JetBrains Mono | `font-mono` |
| `--text-h1` | 32px | `text-3xl` |
| `--text-h2` | 24px | `text-2xl` |
| `--text-h3` | 20px | `text-xl` |
| `--text-base` | 16px | `text-base` |
| `--text-sm` | 14px | `text-sm` |
| `--text-xs` | 12px | `text-xs` |

### Border Radius

| Token | Value | Tailwind |
|-------|--------|----------|
| `--radius-sm` | 4px | `rounded-sm` |
| `--radius-md` | 6px | `rounded-md` |
| `--radius-lg` | 8px | `rounded-lg` |
| `--radius-xl` | 12px | `rounded-xl` |

---

## shadcn/ui Component Templates

### Button

```tsx
import { Button } from '@/components/ui/button'

// Primary (gold accent)
<Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
  Action
</Button>

// Secondary
<Button variant="secondary">
  Cancel
</Button>

// Ghost (hover only)
<Button variant="ghost">
  Link
</Button>

// Icon button
<Button size="icon">
  <Icon className="h-4 w-4" />
</Button>
```

### Card

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'

<Card className="bg-surface border-border">
  <CardHeader>
    <CardTitle className="text-foreground">Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-muted-foreground">Content here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Input

```tsx
import { Input } from '@/components/ui/input'

<Input
  className="bg-surface border-border text-foreground placeholder:text-muted-foreground"
  placeholder="Enter text..."
/>
```

### Badge

```tsx
import { Badge } from '@/components/ui/badge'

// Success
<Badge className="bg-success/10 text-success border-success/20">
  Completed
</Badge>

// Warning
<Badge className="bg-warning/10 text-warning border-warning/20">
  In Progress
</Badge>

// Error
<Badge className="bg-destructive/10 text-destructive border-destructive/20">
  Failed
</Badge>
```

---

## Accessibility Checklist

Before claiming "done":

- [ ] Color contrast ≥ 4.5:1 (WCAG AA)
- [ ] Touch targets ≥ 44×44px
- [ ] Focus indicators visible on all interactive elements
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Labels for all inputs
- [ ] Alt text for images
- [ ] ARIA labels for icon-only buttons
- [ ] Headings in logical order (h1 → h2 → h3)
- [ ] No auto-playing media without controls
- [ ] Links have descriptive text
- [ ] Form error messages visible and clear

---

## Responsive Breakpoints

| Breakpoint | Width | Use |
|-------------|--------|------|
| `mobile` | < 640px | Single column, touch targets 44px+ |
| `tablet` | 640px - 1024px | 2 columns, simplified navigation |
| `desktop` | ≥ 1024px | Full layout, all features |
| `wide` | ≥ 1280px | Expanded content, sidebars |

### Testing Viewports

```bash
# Mobile
agent-browser set viewport 375 667

# Tablet
agent-browser set viewport 768 1024

# Desktop
agent-browser set viewport 1920 1080
```

---

## Quick Reference

### Commands

```bash
# Start frontend
cd /home/mdwzrd/wzrd.dev/web-ui-react
npm run dev

# Open in agent-browser
agent-browser open http://localhost:5174

# Get snapshot
agent-browser snapshot

# Take screenshot
agent-browser screenshot /tmp/ui.png

# Extract design tokens
npx dembrandt <url> --format json

# Add shadcn component
npx shadcn@latest add <component>
```

### File Locations

```
wzrd.dev/web-ui-react/
├── src/
│   ├── app/
│   │   └── globals.css      # Global CSS variables
│   ├── components/
│   │   └── ui/              # shadcn components
│   └── lib/
│       └── utils.ts           # cn() helper
├── tailwind.config.js          # Theme config
└── package.json
```

---

## Workflow Examples

### Example 1: Greenfield - Create New Page

```
User: "Create a settings page with profile form"

1. Analyze request → Layout: sidebar + main content, form fields
2. Extract tokens from reference (or use WZRD theme)
3. Generate Tailwind config
4. Scaffold shadcn components: card, input, button, tabs
5. Build page with components
6. Validate with agent-browser:
   - Open page
   - Get snapshot
   - Screenshot
   - Test interactions (fill inputs, click buttons)
   - Check mobile/tablet/desktop
7. Fix if needed (max 3 iterations)
8. Final validation + screenshot
```

### Example 2: Brownfield - Fix Existing Page

```
User: "The settings page layout is broken on mobile"

1. Open page in agent-browser
2. Get snapshot
3. Screenshot mobile view
4. Analyze with vision: "What's broken?"
5. Fix responsive CSS
6. Re-screenshot
7. Iterate until fixed (max 3)
8. Validate on all viewports
```

### Example 3: Update Design System

```
User: "Update the color palette to match this Figma design"

1. Upload or provide Figma screenshot
2. Analyze with vision: Extract colors
3. Generate new theme config
4. Update tailwind.config.js
5. Update globals.css variables
6. Validate: Open dashboard → screenshot
7. Check all pages for consistency
8. Finalize
```

---

## Sources

- [agent-browser Documentation](https://agent-browser.dev/)
- [agent-browser GitHub](https://github.com/vercel-labs/agent-browser)
- [agent-browser Commands](https://agent-browser.dev/commands)
- [dembrandt GitHub](https://github.com/dembrandt/dembrandt)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**"Design without validation is broken. Every change must be visually verified with agent-browser."**
