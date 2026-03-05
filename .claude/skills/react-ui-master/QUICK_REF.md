# React UI Master - Quick Reference

## Our Theme Colors (Studio Dark)

| Variable | Value | Use |
|----------|--------|------|
| `--studio-bg` | `#0a0a0a` | Main background |
| `--studio-surface` | `#111111` | Cards, panels, sidebar |
| `--studio-border` | `#1a1a1a` | Borders, dividers |
| `--studio-text` | `#e5e5e5` | Primary text |
| `--studio-muted` | `#666666` | Secondary text |
| `--studio-gold` | `#D4AF37` | Primary actions, accents |

## Tailwind Classes for Our Theme

```tsx
// Backgrounds
className="studio-bg"              // Main page background
className="studio-surface"          // Card/panel background
className="bg-studio-gold"          // Gold accent
className="bg-[#0a0a0a]"          // Direct color

// Text
className="text-studio-text"         // Primary text
className="text-studio-muted"        // Secondary text
className="text-studio-gold"         // Gold text

// Borders
className="border-studio-border"      // Border color

// Buttons
className="bg-studio-gold hover:bg-yellow-500 text-black"

// Status colors
className="text-green-400"           // Success
className="text-studio-gold"         // Warning/Processing
className="text-red-400"             // Error/Danger
```

## Common Layout Patterns

### Sidebar + Main Content
```tsx
<div className="flex h-screen">
  {/* Left Sidebar */}
  <div className="w-96 studio-surface border-r border-studio-border flex flex-col">
    {/* Sidebar content */}
  </div>

  {/* Right Main */}
  <div className="flex-1 overflow-y-auto studio-bg">
    {/* Main content */}
  </div>
</div>
```

### Card with Header/Content/Footer
```tsx
<div className="studio-surface border border-studio-border rounded-lg">
  {/* Header */}
  <div className="p-4 border-b border-studio-border">
    <h2 className="text-xl font-semibold text-studio-text">Title</h2>
  </div>

  {/* Content */}
  <div className="p-6">
    {/* Content */}
  </div>

  {/* Footer */}
  <div className="p-4 border-t border-studio-border flex gap-2">
    <button>Action 1</button>
    <button>Action 2</button>
  </div>
</div>
```

### Grid Layout
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive: 1, 2, or 3 columns */}
</div>
```

## Typography

```tsx
<h1 className="text-2xl font-bold text-studio-text">      {/* H1 */}
<h2 className="text-xl font-semibold text-studio-text">    {/* H2 */}
<h3 className="text-lg font-medium text-studio-text">      {/* H3 */}
<p className="text-base text-studio-text">                {/* Body */}
<p className="text-sm text-studio-muted">                {/* Small */}
<span className="font-mono text-studio-text">            {/* Code */}
```

## Spacing

```tsx
// Padding
className="p-4"     // 16px
className="p-6"     // 24px
className="px-4"    // Horizontal: 16px
className="py-2"    // Vertical: 8px

// Margins
className="m-4"     // 16px
className="mb-4"    // Bottom: 16px
className="mt-6"    // Top: 24px

// Gap (flex/grid)
className="gap-2"    // 8px
className="gap-4"    // 16px
className="space-y-4" // Vertical space: 16px
```

## Playwright Commands

```bash
# Screenshot
npx playwright screenshot [url] [output-file]

# With viewport
npx playwright screenshot [url] [output-file] --viewport-size=1920,1080

# Wait for element
npx playwright screenshot [url] [output-file] --wait-for-selector="h1"

# Full page screenshot
npx playwright screenshot [url] [output-file] --full-page

# Multiple viewports
for vp in "375,667 768,1024 1920,1080"; do
  IFS=',' read -r width height <<< "$vp"
  npx playwright screenshot $url output-${width}x${height}.png --viewport-size=${width},${height}
done
```

## shadcn/ui Commands

```bash
# Initialize shadcn/ui
npx shadcn@latest init

# Add component
npx shadcn@latest add [component-name]

# Common components
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add table
npx shadcn@latest add input
npx shadcn@latest add badge
```

## Accessibility Checklist

- [ ] All buttons have text or aria-label
- [ ] Form inputs have labels
- [ ] Color contrast ≥ 4.5:1
- [ ] Touch targets ≥ 44×44px
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Images have alt text
- [ ] Heading hierarchy correct

## Common Fixes

### Missing `use client`
```tsx
'use client';  // Add this for interactive components

export function MyComponent() {
  const [state, setState] = useState();
  return <div>{state}</div>;
}
```

### TypeScript Interface for Props
```tsx
interface ComponentProps {
  title: string;
  count?: number;        // Optional
  onClick?: () => void;  // Optional callback
}

export function MyComponent({ title, count = 0, onClick }: ComponentProps) {
  return <div>{title}: {count}</div>;
}
```

### Stop Horizontal Scroll
```tsx
// Add to globals.css
html, body {
  overflow-x: hidden;
  max-width: 100vw;
}
```

## Project Structure

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

## Debug Workflow

1. **Take screenshot** → See what's actually rendered
2. **Check console** → Look for JavaScript errors
3. **Check network** → Verify API calls succeed
4. **Inspect element** → See computed styles
5. **Fix** → Make incremental changes
6. **Retest** → Take new screenshot, compare

---

**Remember: Never trust code without visual verification.**
