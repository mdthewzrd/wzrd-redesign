---
name: theme-generator
description: Generate Tailwind CSS theme configurations from design tokens extracted by dembrandt or manual specification
category: ui-ux
priority: P1
tags: [tailwind, theme, design-tokens, css, variables, configuration]
subskills:
  - token-parsing
  - color-palette-generation
  - typography-scaling
  - spacing-system
  - shadow-generation
---

# Theme Generator Skill

## Purpose

**Generate Tailwind CSS theme configurations** from design tokens for consistent, maintainable design systems.

## Core Principle

**"Design tokens first, implementation second. Define once, use everywhere."**

---

## Design Token Structure

### Input Format (from dembrandt or manual)

```json
{
  "colors": {
    "primary": "#fbbf24",
    "secondary": "#27272a",
    "accent": "#f59e0b",
    "foreground": "#e5e5e5",
    "muted": "#64748b",
    "background": "#09090b",
    "surface": "#18181b",
    "border": "#27272a",
    "destructive": "#ef4444",
    "success": "#10b981",
    "warning": "#f59e0b"
  },
  "typography": {
    "heading": {
      "family": "Space Grotesk",
      "weights": [700, 600, 500, 400]
    },
    "body": {
      "family": "Space Grotesk",
      "size": 16
    },
    "mono": {
      "family": "JetBrains Mono",
      "size": 14
    }
  },
  "spacing": {
    "base": 4,
    "scale": [4, 8, 12, 16, 20, 24, 32, 48]
  },
  "borders": {
    "radius": [4, 6, 8, 12],
    "width": [1, 2]
  },
  "shadows": {
    "sm": "0 1px 2px rgba(0, 0, 0, 0.05)",
    "md": "0 4px 6px rgba(0, 0, 0, 0.1)",
    "lg": "0 10px 15px rgba(0, 0, 0, 0.15)",
    "xl": "0 20px 25px rgba(0, 0, 0, 0.2)"
  }
}
```

---

## Tailwind Config Template

### Basic Template

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Generated from tokens
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: 'hsl(var(--secondary))',
        accent: 'hsl(var(--accent))',
        muted: 'hsl(var(--muted))',
        destructive: 'hsl(var(--destructive))',
        success: 'hsl(var(--success))',
        warning: 'hsl(var(--warning))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
}
```

---

## WZRD.dev Standard Theme

### CSS Variables (globals.css)

```css
:root {
  /* Colors - HSL format for Tailwind */
  --background: 240 10% 4%;
  --foreground: 0 0% 90%;

  --primary: 45 100% 50%;
  --primary-foreground: 0 0% 0%;

  --secondary: 240 10% 15%;
  --secondary-foreground: 0 0% 85%;

  --muted: 240 5% 65%;
  --accent: 45 100% 50%;

  --destructive: 0 84% 60%;
  --success: 150 50% 45%;
  --warning: 45 100% 50%;

  --border: 240 10% 15%;
  --input: 240 10% 15%;
  --ring: 240 5% 65%;

  --radius: 8px;
}

.dark {
  /* Dark mode overrides */
  --background: 240 10% 4%;
  --foreground: 0 0% 98%;
}
```

### Tailwind Config

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        // Backgrounds
        background: 'hsl(var(--background))',
        surface: '#18181b',

        // Text
        foreground: 'hsl(var(--foreground))',
        muted: 'hsl(var(--muted))',

        // Brand colors
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },

        // Semantic colors
        success: 'hsl(var(--success))',
        warning: 'hsl(var(--warning))',
        destructive: 'hsl(var(--destructive))',

        // Borders
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
      },

      // Typography
      fontFamily: {
        sans: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },

      // Border radius
      borderRadius: {
        DEFAULT: 'var(--radius)',
        sm: 'calc(var(--radius) - 4px)',
        md: 'calc(var(--radius) - 2px)',
        lg: 'var(--radius)',
      },

      // Spacing (4px base)
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
      },

      // Animation keyframes
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },

      // Animation utilities
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
      },
    },
  },
}
```

---

## Color Palette Generation

### From Design Tokens

```javascript
function generateColors(tokens) {
  return {
    background: tokens.colors.background,
    foreground: tokens.colors.foreground,
    muted: tokens.colors.muted,

    primary: {
      DEFAULT: tokens.colors.primary,
      foreground: getContrastColor(tokens.colors.primary),
    },

    // Semantic colors
    success: tokens.colors.success,
    warning: tokens.colors.warning,
    destructive: tokens.colors.destructive,

    // Borders
    border: tokens.colors.border,
    input: tokens.colors.border,

    // Surfaces
    surface: adjustBrightness(tokens.colors.background, 5),
  };
}
```

### Contrast Color Calculator

```javascript
function getContrastColor(hexColor) {
  // Calculate luminance
  const rgb = hexToRgb(hexColor);
  const luminance = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;

  // Return black or white based on luminance
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}
```

---

## Typography Scale

### Font Size Scale

| Token | Value | Tailwind | Usage |
|-------|--------|----------|--------|
| `--text-xs` | 12px | `text-xs` | Captions, labels |
| `--text-sm` | 14px | `text-sm` | Secondary text |
| `--text-base` | 16px | `text-base` | Body text |
| `--text-lg` | 18px | `text-lg` | Large text |
| `--text-xl` | 20px | `text-xl` | Subheadings |
| `--text-2xl` | 24px | `text-2xl` | Headings |
| `--text-3xl` | 30px | `text-3xl` | Page titles |

### Font Weight Scale

| Token | Value | Tailwind | Usage |
|-------|--------|----------|--------|
| `--font-light` | 300 | `font-light` | Light emphasis |
| `--font-normal` | 400 | `font-normal` | Body text |
| `--font-medium` | 500 | `font-medium` | Medium headings |
| `--font-semibold` | 600 | `font-semibold` | Important text |
| `--font-bold` | 700 | `font-bold` | Titles |

### Line Height Scale

| Token | Value | Usage |
|-------|--------|--------|
| `--leading-tight` | 1.25 | Compact text |
| `--leading-snug` | 1.375 | Dense text |
| `--leading-normal` | 1.5 | Body text |
| `--leading-relaxed` | 1.625 | Comfortable text |
| `--leading-loose` | 2 | Spaced out text |

---

## Spacing System

### Base Unit: 4px

| Tailwind | Value | Multiply | Use |
|---------|--------|----------|------|
| `p-1` / `gap-1` | 4px | 1× base | Tight spacing |
| `p-2` / `gap-2` | 8px | 2× base | Default spacing |
| `p-3` / `gap-3` | 12px | 3× base | Section spacing |
| `p-4` / `gap-4` | 16px | 4× base | Element spacing |
| `p-5` / `gap-5` | 20px | 5× base | Large spacing |
| `p-6` / `gap-6` | 24px | 6× base | Section gap |
| `p-8` / `gap-8` | 32px | 8× base | Container padding |
| `p-10` / `gap-10` | 40px | 10× base | Page padding |
| `p-12` / `gap-12` | 48px | 12× base | Section padding |

### Spacing Guidelines

```tsx
// ✅ GOOD - Consistent base
<div className="p-4 gap-4">...</div>

// ❌ BAD - Arbitrary values
<div className="p-[15px] gap-[7px]">...</div>

// ✅ GOOD - Responsive
<div className="p-4 md:p-6 lg:p-8">...</div>
```

---

## Shadow System

### Elevation Levels

| Level | Tailwind | CSS | Usage |
|-------|----------|-----|--------|
| `sm` | `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Cards, hover states |
| `md` | `shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Dropdowns, modals |
| `lg` | `shadow-lg` | `0 10px 15px rgba(0,0,0,0.15)` | Tooltips, popovers |
| `xl` | `shadow-xl` | `0 20px 25px rgba(0,0,0,0.2)` | Panels, drawers |

### Shadow with Color

```tsx
// Gold accent shadow
<div className="shadow-[0_4px_6px_rgba(251,191,36,0.15)]">
  Gold elevated card
</div>

// Success shadow
<div className="shadow-[0_4px_6px_rgba(16,185,129,0.15)]">
  Success elevated card
</div>
```

---

## Border Radius

### Radius Scale

| Token | Tailwind | Value | Usage |
|-------|----------|--------|--------|
| `--radius-sm` | `rounded-sm` | 4px | Small elements |
| `--radius-md` | `rounded-md` | 6px | Buttons, inputs |
| `--radius-lg` | `rounded-lg` | 8px | Cards, panels |
| `--radius-xl` | `rounded-xl` | 12px | Large cards |
| `--radius-2xl` | `rounded-2xl` | 16px | Hero elements |
| `--radius-full` | `rounded-full` | Circles, badges |

### Guidelines

```tsx
// ✅ GOOD - Use semantic radius
<Button className="rounded-md">Default</Button>
<Button variant="secondary" className="rounded-lg">Secondary</Button>

// ❌ BAD - Arbitrary values
<Button className="rounded-[7px]">Wrong</Button>
```

---

## Integration with Other Skills

### With design-mode

```javascript
// design-mode calls theme-generator
const tokens = extractDesignTokens(referenceUrl);
const theme = generateTheme(tokens);

// design-mode uses theme to scaffold components
scaffoldComponents(theme);

// visual-validator checks theme application
validateTheme(theme);
```

### With shadcn-generator

```bash
# Generate theme
npx theme-generator --input tokens.json --output tailwind.config.js

# Generate components with theme
npx shadcn add button card input

# Components automatically use theme colors
```

### With visual-validator

```bash
# After applying theme
agent-browser open http://localhost:5174

# Screenshot before
agent-browser screenshot /tmp/before-theme.png

# Apply theme changes
# ... code changes ...

# Screenshot after
agent-browser screenshot /tmp/after-theme.png

# Compare and fix
```

---

## Quick Reference

### Color Usage

```tsx
// Backgrounds
<div className="bg-background">Main bg</div>
<div className="bg-surface">Card bg</div>

// Text
<h1 className="text-foreground">Primary text</h1>
<p className="text-muted">Secondary text</p>

// Accents
<button className="bg-primary text-primary-foreground">Primary action</button>
<span className="text-accent">Accent text</span>

// Semantic
<Badge className="bg-success">Success</Badge>
<Badge className="bg-destructive">Error</Badge>
```

### Spacing Usage

```tsx
// Padding
<div className="p-4">16px padding</div>
<div className="p-6 md:p-8 lg:p-10">Responsive</div>

// Margin
<div className="mt-4 mb-4">16px margin</div>

// Gap (flex/grid)
<div className="gap-2">8px between items</div>
<div className="gap-4">16px between items</div>
```

### Typography Usage

```tsx
// Sizes
<h1 className="text-3xl">30px heading</h1>
<h2 className="text-2xl">24px heading</h2>
<h3 className="text-xl">20px heading</h3>
<p className="text-base">16px body</p>
<p className="text-sm">14px small</p>
<span className="text-xs">12px caption</span>

// Weights
<span className="font-light">300</span>
<span className="font-normal">400</span>
<span className="font-medium">500</span>
<span className="font-semibold">600</span>
<span className="font-bold">700</span>

// Fonts
<div className="font-sans">Body text</div>
<code className="font-mono">Code text</code>
```

### Animation Usage

```tsx
// Animate entry
<div className="animate-fade-in">Fade in</div>
<div className="animate-slide-in">Slide in</div>
<div className="animate-scale-in">Scale in</div>
```

---

## Workflow Examples

### Example 1: Generate Theme from Figma

```
1. Export Figma colors → JSON
2. Pass to theme-generator
3. Generate Tailwind config
4. Update tailwind.config.js
5. Test in browser
```

### Example 2: Extract and Generate

```bash
# Extract from existing site
npx dembrandt https://example.com --format json > tokens.json

# Generate Tailwind config
node theme-generator.js --input tokens.json --output tailwind.config.js

# Verify
agent-browser open http://localhost:5174
```

### Example 3: Create Custom Theme

```bash
# Define custom tokens
cat > custom-tokens.json << EOF
{
  "colors": {
    "primary": "#8b5cf6",
    "secondary": "#ec4899",
    "background": "#1a1a2e",
    "foreground": "#e5e5e5"
  },
  "typography": {
    "heading": {
      "family": "Inter",
      "weights": [700, 600, 500]
    },
    "body": {
      "family": "Inter",
      "size": 16
    }
  },
  "spacing": {
    "base": 4,
    "scale": [4, 8, 16, 24, 32]
  }
}
EOF

# Generate theme
npx theme-generator --input custom-tokens.json
```

---

## Sources

- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Tailwind Config Reference](https://tailwindcss.com/docs/theme)
- [dembrandt](https://github.com/dembrandt/dembrandt)
- [shadcn/ui Theming](https://ui.shadcn.com/docs/theming)
- [CSS Variables Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)

---

**"Design tokens first, implementation second. Define once, use everywhere."**
