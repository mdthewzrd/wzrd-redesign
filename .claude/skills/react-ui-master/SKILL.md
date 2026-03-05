---
name: react-ui-master
description: Master-level React UI/UX editing, validation, and debugging with shadcn/ui, Tailwind, and Playwright
category: ui-development
priority: P1
tags: [react, ui, ux, shadcn, tailwind, debugging, validation, visual-testing]
subskills:
  - react-component-editing
  - shadcn-customization
  - tailwind-styling
  - playwright-validation
  - visual-regression
  - layout-debugging
  - accessibility-testing
---

# React UI Master Skill

## Purpose
Master-level React UI/UX development, editing, validation, and debugging. Focus on shadcn/ui, Tailwind CSS, and Playwright testing.

## Core Principle
**"UI that isn't validated is broken. Test visually, not just functionally."**

## Technology Stack

### Our Stack (2026 Best Practices)
- **Framework**: Next.js 14+ (App Router)
- **UI Library**: shadcn/ui (107K+ stars, fastest growing)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Testing**: Playwright (cross-browser)
- **Icons**: Lucide React
- **Charts**: Plotly.js (react-plotly.js)

### Why shadcn/ui?
- **Ownership**: Components are copied to your project, not imported from npm
- **Customization**: Full control over styles and logic
- **Accessibility**: Built on Radix UI (WAI-ARIA compliant)
- **Dark Mode**: Native support
- **Updates**: 560K+ weekly downloads, actively maintained

## Development Workflow

### 1. Code Changes → Visual Validation
```
┌─────────────────────────────────────────────────────────────┐
│                     UI EDITING WORKFLOW                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 1. MAKE CODE CHANGES                                     │
│    └─ Edit React component / CSS / Tailwind               │
│                                                             │
│ 2. TAKE SCREENSHOT (Playwright)                            │
│    └─ npx playwright screenshot [url] [file]            │
│                                                             │
│ 3. AI VISION ANALYSIS                                      │
│    └─ Analyze layout, colors, spacing, accessibility    │
│                                                             │
│ 4. FIX IF NEEDED                                         │
│    └─ Adjust code, retake screenshot, re-analyze        │
│                                                             │
│ 5. FINAL VALIDATION                                        │
│    └─ Multiple viewports, browsers, interactions      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2. Golden Rule
**NEVER trust code changes without visual verification.**

After ANY UI change:
1. Take a screenshot
2. Verify visually
3. Test interactions
4. Check responsiveness
5. Validate accessibility

## React Component Editing

### Component Structure (Best Practice)
```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="studio-surface border-studio-border">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-studio-text mb-4">
          {title}
        </h2>
        <Button onClick={onAction} className="bg-studio-gold">
          Action
        </Button>
      </div>
    </Card>
  );
}
```

### Editing Checklist
- [ ] `use client` directive added for interactive components
- [ ] TypeScript props interface defined
- [ ] Default values for optional props
- [ ] Event handlers properly typed
- [ ] Loading states handled
- [ ] Error states handled
- [ ] Empty states handled
- [ ] Accessibility attributes (aria-*, role)
- [ ] Keyboard navigation supported

### Common Fixes

#### Fix: Missing `use client`
```typescript
// ❌ WRONG: Server component with state
export function MyComponent() {
  const [count, setCount] = useState(0);  // Error!
  return <button>{count}</button>
}

// ✅ CORRECT: Add 'use client'
'use client';
export function MyComponent() {
  const [count, setCount] = useState(0);
  return <button>{count}</button>
}
```

#### Fix: TypeScript Props
```typescript
// ❌ WRONG: No typing
export function MyComponent({ title, count }) {
  return <div>{title}: {count}</div>;
}

// ✅ CORRECT: Interface + typing
interface MyComponentProps {
  title: string;
  count?: number;  // Optional
}

export function MyComponent({ title, count = 0 }: MyComponentProps) {
  return <div>{title}: {count}</div>;
}
```

#### Fix: Event Handlers
```typescript
// ❌ WRONG: No event typing
const handleClick = (e) => {  // Error!
  console.log(e.target);
};

// ✅ CORRECT: Type the event
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  console.log(e.currentTarget);
};

// Or use generic when you don't need specific type
const handleClick = (e: React.MouseEvent) => {
  console.log(e.target);
};
```

## Tailwind CSS Styling

### Color Variables (Our Theme)
```css
/* globals.css - Studio Theme */
:root {
  --studio-bg: #0a0a0a;
  --studio-surface: #111111;
  --studio-border: #1a1a1a;
  --studio-text: #e5e5e5;
  --studio-muted: #666666;
  --studio-gold: #D4AF37;
  --studio-success: #10b981;
  --studio-warning: #f59e0b;
  --studio-danger: #ef4444;
}
```

### Using Tailwind with Custom Variables
```tsx
// ✅ Use our custom classes
<div className="studio-bg">
  <div className="studio-surface border-studio-border">
    <h1 className="text-studio-text">Title</h1>
    <p className="text-studio-muted">Description</p>
    <button className="bg-studio-gold">Button</button>
  </div>
</div>

// ❌ Don't use random colors
<div className="bg-gray-900 text-gray-100">
  {/* Hardcoded colors don't match theme */}
</div>
```

### Common Layout Patterns

#### Sidebar + Main Content
```tsx
<div className="flex h-screen">
  {/* Sidebar */}
  <div className="w-96 studio-surface border-r border-studio-border flex flex-col">
    {/* Sidebar content */}
  </div>

  {/* Main Content */}
  <div className="flex-1 overflow-y-auto studio-bg">
    {/* Main content */}
  </div>
</div>
```

#### Card Layout
```tsx
<Card className="studio-surface border-studio-border">
  <CardHeader>
    <CardTitle className="text-studio-text">Card Title</CardTitle>
    <CardDescription className="text-studio-muted">
      Card description
    </CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter>
    <Button className="bg-studio-gold">Action</Button>
  </CardFooter>
</Card>
```

#### Responsive Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive: 1 col mobile, 2 cols tablet, 3 cols desktop */}
</div>
```

### Spacing System
```tsx
// Use consistent spacing based on 4px scale
<p className="space-y-2">    {/* 8px between items */}
<p className="space-y-4">    {/* 16px between items */}
<p className="gap-2">         {/* 8px between flex items */}
<p className="gap-4">         {/* 16px between flex items */}
<p className="p-4">          {/* 16px padding */}
<p className="p-6">          {/* 24px padding */}
```

### Text Utilities
```tsx
<h1 className="text-2xl font-bold text-studio-text">    {/* 24px, bold */}
<h2 className="text-xl font-semibold text-studio-text">  {/* 20px, semibold */}
<h3 className="text-lg font-medium text-studio-text">   {/* 18px, medium */}
<p className="text-base text-studio-muted">            {/* 16px, muted */}
<p className="text-sm text-studio-muted opacity-70">   {/* 14px, more muted */}
<span className="font-mono text-studio-text">         {/* Monospace font */}
```

## shadcn/ui Customization

### Adding Components
```bash
# Add a component
npx shadcn@latest add [component-name]

# Examples
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add table
```

### Customizing Component Styles
```typescript
// shadcn components are in src/components/ui/[name].tsx

// 1. Copy the component to your project
// 2. Edit it directly - you own the code

// Example: Custom Button
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",

        // CUSTOM VARIANT: Studio Gold
        studio: "bg-studio-gold text-black hover:bg-yellow-500 shadow",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

### Using Custom Variants
```tsx
// Use your custom variant
<Button variant="studio" size="lg">
  Custom Studio Gold Button
</Button>
```

## Playwright Validation

### Setup
```bash
# Install Playwright
npm install -D @playwright/test
npx playwright install --with-deps

# Run tests
npx playwright test
```

### Basic Screenshot Test
```typescript
import { test, expect } from '@playwright/test';

test('scan page loads correctly', async ({ page }) => {
  await page.goto('http://localhost:5665/scan');

  // Wait for page to load
  await page.waitForSelector('h1');

  // Take screenshot
  await page.screenshot({ path: 'screenshots/scan-page.png' });

  // Verify elements exist
  await expect(page.locator('h1')).toHaveText('Scanners');
  await expect(page.locator('.studio-surface')).toBeVisible();
});
```

### Multiple Viewports
```typescript
const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1920, height: 1080 },
];

for (const { name, width, height } of VIEWPORTS) {
  test(`${name} viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('http://localhost:5665/scan');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `screenshots/${name}.png` });
  });
}
```

### Interaction Testing
```typescript
test('upload scanner workflow', async ({ page }) => {
  await page.goto('http://localhost:5665/scan');

  // Click upload button
  await page.click('button[title="Upload Scanner"]');

  // Wait for modal
  await expect(page.locator('[role="dialog"]')).toBeVisible();

  // Fill form
  await page.fill('input[name="code"]', 'scanner_code_here');
  await page.fill('input[name="name"]', 'Test Scanner');

  // Click upload
  await page.click('button[type="submit"]');

  // Verify success
  await expect(page.locator('text=Scan started!')).toBeVisible();
});
```

### Visual Regression Testing
```typescript
import { test, expect } from '@playwright/test';

test('visual regression', async ({ page }) => {
  await page.goto('http://localhost:5665/scan');
  await page.waitForLoadState('networkidle');

  // Compare with baseline
  await expect(page).toHaveScreenshot('scan-page.png', {
    maxDiffPixels: 100,      // Allow up to 100 different pixels
    threshold: 0.2,           // 20% difference tolerance
    animations: 'allow',       // Ignore animation differences
  });
});
```

## Layout Debugging

### Common Issues & Fixes

#### Issue: Horizontal Scroll
```tsx
// ❌ WRONG: Content overflows
<div className="w-[2000px]">  {/* Fixed width too wide */}
  {/* Content */}
</div>

// ✅ CORRECT: Responsive width
<div className="w-full max-w-7xl mx-auto">
  {/* Content */}
</div>
```

#### Issue: Sidebar Overlap
```tsx
// ❌ WRONG: No flex structure
<div className="sidebar">...</div>
<div className="main">...</div>

// ✅ CORRECT: Flex container
<div className="flex h-screen">
  <div className="w-96 flex-shrink-0">  {/* Fixed sidebar */}
    {/* Sidebar */}
  </div>
  <div className="flex-1 overflow-y-auto">  {/* Flexible main */}
    {/* Main */}
  </div>
</div>
```

#### Issue: Content Hidden
```tsx
// ❌ WRONG: No scroll
<div className="h-full">
  {/* Content may overflow */}
</div>

// ✅ CORRECT: Add overflow
<div className="h-full overflow-y-auto">
  {/* Content scrolls if needed */}
</div>
```

### Using Browser DevTools
1. **Inspect Element**: Right-click → Inspect
2. **Box Model**: Check margin, border, padding
3. **Computed Styles**: See final applied CSS
4. **Flexbox Inspector**: Check flex alignment
5. **Network Tab**: Verify API calls

## Accessibility Testing

### WCAG Checklist
- [ ] Color contrast ratio ≥ 4.5:1 (AA)
- [ ] Touch targets ≥ 44×44px
- [ ] Focus indicators visible
- [ ] Labels for all inputs
- [ ] Alt text for images
- [ ] Keyboard navigation works
- [ ] ARIA labels for icons

### Screen Reader Testing
```tsx
// ❌ WRONG: No labels
<button onClick={handleAction}>
  <Icon className="w-4 h-4" />  {/* What does this do? */}
</button>

// ✅ CORRECT: Add aria-label
<button onClick={handleAction} aria-label="Delete item">
  <Icon className="w-4 h-4" />
</button>

// Or use visually hidden text
<button onClick={handleAction}>
  <Icon className="w-4 h-4" aria-hidden="true" />
  <span className="sr-only">Delete item</span>
</button>
```

### Color Contrast
```tsx
// ✅ GOOD: High contrast
<div className="bg-studio-surface text-studio-text">  {/* #111111 vs #e5e5e5 */}
  {/* Contrast ratio: 14.6:1 (passes WCAG AAA) */}
</div>

// ❌ BAD: Low contrast
<div className="bg-gray-800 text-gray-600">  {/* Too similar */}
  {/* Contrast ratio: 1.8:1 (fails WCAG AA) */}
</div>
```

## Our UI Components Reference

### Studio Theme Colors
| Purpose | Class | Hex |
|---------|--------|------|
| Background | `studio-bg` | `#0a0a0a` |
| Surface | `studio-surface` | `#111111` |
| Border | `border-studio-border` | `#1a1a1a` |
| Text | `text-studio-text` | `#e5e5e5` |
| Muted | `text-studio-muted` | `#666666` |
| Gold (Primary) | `bg-studio-gold` / `text-studio-gold` | `#D4AF37` |
| Success | `text-green-400` | `#4ade80` |
| Warning | `text-studio-gold` | `#D4AF37` |
| Danger | `text-red-400` | `#f87171` |

### Available Components
```
src/components/ui/
├── button.tsx
├── card.tsx
├── badge.tsx
├── tabs.tsx
└── ... (more shadcn components)
```

### Available Utilities
```tsx
// Truncate long text
<div className="truncate">...</div>

// Monospace font
<div className="font-mono">...</div>

// Flex center
<div className="flex items-center justify-center">...</div>

// Gap between items
<div className="space-y-4">...</div>  {/* Vertical */}
<div className="gap-4">...</div>        {/* Horizontal */}
```

## Debugging Workflow

### 1. Identify the Issue
```
User says: "Button is broken"
↓
Take screenshot to see actual state
↓
Analyze: Is it visible? Correct color? Clickable?
↓
Check console for errors
↓
Check network for failed API calls
```

### 2. Isolate the Component
```tsx
// Test component in isolation
// Create test file: src/components/__tests__/Component.test.tsx

import { render, screen } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

test('renders correctly', () => {
  render(<MyComponent title="Test" />);
  expect(screen.getByText('Test')).toBeInTheDocument();
});
```

### 3. Fix Incremental
```
Change 1 → Test → Works? → Yes → Continue
                   ↓ No
              Revert, try Change 2
```

### 4. Verify Fixes
1. **Visual Check**: Does it look right?
2. **Interaction**: Can I click/type/scroll?
3. **Responsive**: Works on mobile/tablet/desktop?
4. **Accessibility**: Keyboard navigation? Screen reader?
5. **Cross-browser**: Chrome, Firefox, Safari?

## Plotly Chart Styling

### Dark Theme for Plotly
```tsx
<Plot
  data={chartData}
  layout={{
    paper_bgcolor: '#111111',  // studio-surface
    plot_bgcolor: '#0a0a0a',    // studio-bg
    font: {
      color: '#e5e5e5',          // studio-text
      family: 'Inter, sans-serif',
    },
    xaxis: {
      gridcolor: '#1a1a1a',      // studio-border
      tickfont: { color: '#e5e5e5' },
    },
    yaxis: {
      gridcolor: '#1a1a1a',
      tickfont: { color: '#e5e5e5' },
    },
    legend: {
      font: { color: '#e5e5e5' },
      bgcolor: 'rgba(17, 17, 17, 0.8)',
      bordercolor: '#1a1a1a',
    },
  }}
  config={{
    responsive: true,
    displayModeBar: false,
  }}
/>
```

### Fix Plotly Text Visibility
```css
/* globals.css - Ensure Plotly text is visible */
.js-plotly-plot .plotly .legendtext,
.js-plotly-plot .plotly .axis text,
.js-plotly-plot .plotly .xtick text,
.js-plotly-plot .plotly .ytick text,
.js-plotly-plot .plotly .zl tick text,
.js-plotly-plot .plotly text {
  fill: #FFFFFF !important;
  color: #FFFFFF !important;
  opacity: 1 !important;
}
```

## Gold Standard Integration

### Before Claiming "Done"
```bash
# 1. Take screenshot
npx playwright screenshot http://localhost:5665/scan /tmp/verify.png

# 2. Run component tests
npm test -- Component.test.tsx

# 3. Run Playwright tests
npx playwright test

# 4. Check for TypeScript errors
npx tsc --noEmit

# 5. Verify build
npm run build
```

### Read-Back Verification
After editing a component:
```bash
# 1. Read back the file
cat src/components/MyComponent.tsx

# 2. Verify changes
git diff src/components/MyComponent.tsx

# 3. Check imports
npx tsc --noEmit src/components/MyComponent.tsx
```

### Executable Proof
Always show:
```bash
# Test output
$ npm test
PASS  src/components/MyComponent.test.tsx
  ✓ renders correctly (15ms)
  ✓ handles click event (8ms)

$ npx playwright test
Running 3 tests
  ✓ scan page loads correctly
  ✓ upload scanner workflow
  ✓ responsive layout

All tests passed!
```

---

## Quick Reference

### Common Commands
```bash
# Start dev server
npm run dev

# Run tests
npm test

# Run Playwright
npx playwright test

# Add shadcn component
npx shadcn@latest add [component]

# Screenshot
npx playwright screenshot [url] [output]

# TypeScript check
npx tsc --noEmit

# Build
npm run build
```

### File Locations
```
edge.dev/frontend/
├── src/
│   ├── app/
│   │   ├── scan/page.tsx          # Scan page
│   │   └── globals.css              # Global styles
│   ├── components/
│   │   ├── ScannersAsProjects.tsx  # Scanner list
│   │   ├── ScannerUploadModal.tsx  # Upload modal
│   │   └── ui/                    # shadcn components
│   └── services/
│       └── platformApiService.ts    # API client
```

---

**"UI is user-facing. Every pixel matters. Validate everything."**

---

## Sources

Based on research from GitHub and 2026 development trends:

- [shadcn/ui - Official Site](https://ui.shadcn.com)
- [Playwright Documentation](https://playwright.dev)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Radix UI - Accessibility](https://www.radix-ui.com)
