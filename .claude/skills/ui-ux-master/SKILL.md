---
name: ui-ux-master
description: Master-level UI/UX design and validation with Vercel agent-browser
category: ui-ux
priority: P0
tags: [ui, ux, design, agent-browser, browser, testing, shadcn, react, plotly, vercel]
subskills:
  - ui-ux-testing
  - shadcn-components
  - plotly-charts
  - responsive-design
  - accessibility
---

# UI/UX Master Skill

## Purpose

Master-level UI/UX design, development, and validation with real browser testing using **Vercel agent-browser**. This skill enables:
- Real-time frontend visibility through AI-optimized browser automation
- Component-level testing with shadcn/ui
- Chart validation with Plotly.js
- Responsive design verification
- Accessibility testing
- Visual regression testing

## Core Principle

**"Real visibility = real results. Always test what you build before claiming it works."**

---

## Tech Stack

### Frontend Frameworks
- **React 18+** with TypeScript
- **Next.js 14+** (App Router)
- **shadcn/ui** (Radix UI + Tailwind CSS)

### UI Libraries
- **shadcn/ui** - Copy-paste components, fully customizable
- **Radix UI** - Unstyled, accessible primitives
- **Tailwind CSS** - Utility-first styling

### Data Visualization
- **Plotly.js** - Interactive charts
- **react-plotly.js** - React wrapper for Plotly

### Browser Automation
- **Vercel agent-browser** - AI-optimized browser automation
  - Snapshot-based references (@e1, @e2)
  - 90% fewer tokens than Playwright
  - Designed specifically for AI agents

---

## Vercel Agent-Browser Complete Guide

### Installation

```bash
# Check if installed
command -v agent-browser && echo "Installed" || echo "Not installed"

# Install globally
npm install -g agent-browser

# Install Chromium (one-time ~160-300MB download)
agent-browser install

# Verify installation
agent-browser --help
```

### Core Commands

| Command | Description | Example |
|---------|-------------|----------|
| **Navigation** | | |
| `open <url>` | Navigate to URL | `agent-browser open http://localhost:5665` |
| `back` | Go back in history | `agent-browser back` |
| `forward` | Go forward | `agent-browser forward` |
| `reload` | Reload page | `agent-browser reload` |
| **Interaction** | | |
| `snapshot` | Get element tree with refs | `agent-browser snapshot` |
| `click <sel>` | Click element | `agent-browser click @e1` |
| `dblclick <sel>` | Double-click | `agent-browser dblclick @e1` |
| `type <sel> <text>` | Type text into element | `agent-browser type @e2 "hello"` |
| `fill <sel> <text>` | Clear and fill | `agent-browser fill @e3 "value"` |
| `press <key>` | Press key | `agent-browser press "Enter"` |
| `hover <sel>` | Hover over element | `agent-browser hover @e1` |
| `check <sel>` | Check checkbox | `agent-browser check @e4` |
| `uncheck <sel>` | Uncheck checkbox | `agent-browser uncheck @e4` |
| `select <sel> <val>` | Select dropdown | `agent-browser select @e5 "Option 1"` |
| **Scrolling** | | |
| `scroll <dir> [px]` | Scroll page | `agent-browser scroll down 500` |
| `scrollintoview <sel>` | Scroll element into view | `agent-browser scrollintoview @e1` |
| **Wait** | | |
| `wait <sel|ms>` | Wait for element or time | `agent-browser wait @e1` or `wait 2000` |
| **Information** | | |
| `get text <sel>` | Get element text | `agent-browser get text @e1` |
| `get url` | Get current URL | `agent-browser get url` |
| `get value <sel>` | Get input value | `agent-browser get value @e2` |
| `get count <selector>` | Count elements | `agent-browser get count "button"` |
| **State Checking** | | |
| `is visible <sel>` | Check visibility | `agent-browser is visible @e1` |
| `is enabled <sel>` | Check if enabled | `agent-browser is enabled @e2` |
| **Output** | | |
| `screenshot [path]` | Take screenshot | `agent-browser screenshot /tmp/ui.png` |
| `pdf <path>` | Save as PDF | `agent-browser pdf report.pdf` |
| **JavaScript** | | |
| `eval <js>` | Run JavaScript | `agent-browser eval "document.title"` |
| **Browser Control** | | |
| `set viewport <w> <h>` | Set viewport size | `agent-browser set viewport 1920 1080` |
| `set device <name>` | Set device preset | `agent-browser set device iPhone` |
| `close` | Close browser | `agent-browser close` |

### Snapshot-Based References

Agent-browser uses stable element references instead of CSS selectors:

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

**Advantages over CSS selectors:**
- ✅ Stable across layout changes
- ✅ AI-friendly (natural references)
- ✅ No complex selector strings
- ✅ 90% fewer tokens needed

### Complete Testing Workflow

```bash
# 1. Start frontend (in another terminal)
cd /home/mdwzrd/wzrd.dev/projects/edge.dev/frontend
npm run dev

# 2. Open browser and navigate
agent-browser open http://localhost:5665/scan

# 3. Get snapshot to find element references
agent-browser snapshot

# 4. Verify element exists
agent-browser is visible @e1

# 5. Get element text/value
agent-browser get text @e1

# 6. Take initial screenshot
agent-browser screenshot /tmp/before.png

# 7. Interact with element
agent-browser click @e1

# 8. Wait for result
agent-browser wait @e2 5000

# 9. Take after screenshot
agent-browser screenshot /tmp/after.png

# 10. Verify result
agent-browser get text @e2

# 11. Close browser
agent-browser close
```

---

## Edge.dev Design System

### Color Palette (Zinc + Gold/Amber)

#### Zinc Scale (Backgrounds, Text, Borders)
```
Color      Hex         Usage
─────────────────────────────────────────────────────────
zinc-50    #fafafa    Lightest backgrounds
zinc-100   #f4f4f5    Subtle backgrounds
zinc-200   #e4e4e7    Card borders
zinc-300   #d4d4d8    Subtle text
zinc-400   #a1a1aa    Secondary text
zinc-500   #71717a    Muted text
zinc-600   #52525b    Primary text
zinc-700   #3f3f46    Borders, inputs
zinc-800   #27272a    Cards, backgrounds
zinc-900   #18181b    Dark cards
zinc-950   #09090b    Primary background (main)
```

#### Accent Colors (Gold/Amber + Status)
```
Color        Hex         Usage
─────────────────────────────────────────────────────────
amber-400    #fbbf24    Hover states, highlights
amber-500    #f59e0b    Primary actions (brand gold)
amber-600    #d97706    Pressed states

emerald-400  #34d399    Success states, completed scans
emerald-500  #10b981    Primary success color
red-400      #f87171    Error states, failed scans
red-500      #ef4444    Danger actions
```

### Typography Scale
```tsx
// Headings
<h1 className="text-3xl font-bold text-zinc-100">Title</h1>
<h2 className="text-2xl font-semibold text-zinc-100">Subtitle</h2>
<h3 className="text-xl font-medium text-zinc-200">Section</h3>

// Body text
<p className="text-base text-zinc-400">Body text</p>
<p className="text-sm text-zinc-500">Secondary text</p>
<p className="text-xs text-zinc-500">Muted text</p>
```

### Spacing & Sizing
```
Padding/Margin:                  Border Radius:
p-1 = 4px     p-6 = 24px     rounded-sm = 2px
p-2 = 8px     p-8 = 32px     rounded   = 4px
p-3 = 12px    p-12 = 48px     rounded-lg = 8px
p-4 = 16px    p-16 = 64px     rounded-xl = 12px
p-5 = 20px                      rounded-2xl = 16px

gap-2 = 8px    gap-4 = 16px   gap-6 = 24px
```

### Utility Classes Reference
```tsx
// Background
bg-zinc-950          // Main background
bg-zinc-900/50        // Semi-transparent card
bg-zinc-800           // Elevated background

// Text colors
text-zinc-100         // Primary text
text-zinc-400         // Secondary text
text-amber-500        // Brand gold text
text-emerald-500      // Success text

// Borders
border border-zinc-800              // Dark borders
border border-zinc-700              // Light borders
border-b border-zinc-800/50        // Subtle bottom border

// Effects
hover:bg-zinc-800                 // Hover background
hover:text-amber-400              // Hover text
focus:ring-2 focus:ring-amber-500   // Focus ring
transition-all duration-200       // Smooth transitions
```

---

## shadcn/ui Components

### Setup
```bash
# Initialize shadcn/ui (one-time)
npx shadcn@latest init

# Add components as needed
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add table
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add tabs
npx shadcn@latest add badge
```

### Button Component
```tsx
import { Button } from '@/components/ui/button'

// Primary action (gold)
<Button className="bg-amber-500 hover:bg-amber-600 text-zinc-900 font-medium">
  Run Scan
</Button>

// Secondary action
<Button variant="secondary" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
  Cancel
</Button>

// Icon button
<Button size="icon" className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300">
  <Upload className="h-4 w-4" />
</Button>

// With icon
<Button className="bg-amber-500 hover:bg-amber-600 text-zinc-900">
  <Play className="mr-2 h-4 w-4" />
  Run Scan
</Button>
```

### Card Component
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

<Card className="bg-zinc-900/30 border-zinc-800 hover:border-zinc-700 transition-colors">
  <CardHeader>
    <CardTitle className="text-zinc-100">Scanner Name</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-zinc-400">Scanner description here</p>
  </CardContent>
</Card>
```

### Input Component
```tsx
import { Input } from '@/components/ui/input'

<Input
  className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
  placeholder="Search scanners..."
/>
```

### Badge Component (Status Indicators)
```tsx
import { Badge } from '@/components/ui/badge'

// Completed (success)
<Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
  Completed
</Badge>

// Running (in-progress)
<Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">
  Running
</Badge>

// Failed (error)
<Badge className="bg-red-500/10 text-red-400 border-red-500/20">
  Failed
</Badge>
```

### Table Component
```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

<Table className="border-zinc-800">
  <TableHeader>
    <TableRow className="border-b border-zinc-800 hover:bg-zinc-800/50">
      <TableHead className="text-zinc-400">Ticker</TableHead>
      <TableHead className="text-zinc-400">Date</TableHead>
      <TableHead className="text-zinc-400">Signal</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {results.map(row => (
      <TableRow key={row.id} className="border-b border-zinc-800/50">
        <TableCell className="text-zinc-100">{row.ticker}</TableCell>
        <TableCell className="text-zinc-400">{row.date}</TableCell>
        <TableCell className="text-amber-500">{row.signal}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

## Layout Patterns

### Main Layout (Sidebar + Content)
```tsx
<div className="flex min-h-screen bg-zinc-950">
  {/* Sidebar - fixed width 384px */}
  <aside className="w-96 border-r border-zinc-800 bg-zinc-900/50">
    <div className="p-6">
      <h1 className="text-xl font-semibold text-zinc-100">Scanners</h1>
    </div>

    {/* Scanner list */}
    <div className="space-y-2 p-4">
      {scanners.map(scanner => (
        <Card key={scanner.id} className="...">
          {/* Scanner content */}
        </Card>
      ))}
    </div>
  </aside>

  {/* Main content - flexible */}
  <main className="flex-1 overflow-auto">
    <div className="p-6">
      {/* Scan results, charts, etc. */}
    </div>
  </main>
</div>
```

### Scanner Card Pattern
```tsx
<Card className="bg-zinc-900/30 border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer">
  <div className="p-4 space-y-3">
    {/* Header with name + status */}
    <div className="flex items-center justify-between">
      <h3 className="font-semibold text-zinc-100">{scanner.name}</h3>
      <Badge variant="outline" className={getStatusColor(scanner.status)}>
        {scanner.status}
      </Badge>
    </div>

    {/* Metadata */}
    <div className="flex items-center gap-4 text-sm">
      <span className="text-zinc-500">
        <Database className="h-3 w-3 inline mr-1" />
        {scanner.signals_found} signals
      </span>
      <span className="text-zinc-500">
        <Clock className="h-3 w-3 inline mr-1" />
        {formatTime(scanner.last_run)}
      </span>
    </div>

    {/* Actions */}
    <div className="flex gap-2">
      <Button size="sm" variant="secondary">Edit</Button>
      <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-zinc-900">
        <Play className="h-3 w-3 mr-1" />
        Run
      </Button>
    </div>
  </div>
</Card>
```

### Empty State Pattern
```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <Database className="h-16 w-16 text-zinc-700 mb-4" />
  <h3 className="text-lg font-medium text-zinc-300 mb-2">No scans found</h3>
  <p className="text-sm text-zinc-500 max-w-md">
    Upload a scanner and run it to see results here.
  </p>
  <Button className="mt-6 bg-amber-500 hover:bg-amber-600 text-zinc-900">
    <Upload className="mr-2 h-4 w-4" />
    Upload Scanner
  </Button>
</div>
```

---

## Plotly.js Chart Styling

### Dark Theme Configuration
```tsx
import { PlotData } from 'react-plotly.js'

const layout = {
  dragmode: 'pan',
  showlegend: false,

  // X-axis (dates)
  xaxis: {
    autorange: true,
    type: 'date',
    gridcolor: '#2a2a2a',           // zinc-900
    tickfont: { color: '#71717a' },    // zinc-500
    rangeslider: { visible: false },
  },

  // Y-axis (price)
  yaxis: {
    autorange: true,
    type: 'linear',
    gridcolor: '#2a2a2a',
    tickfont: { color: '#71717a' },
    side: 'right',
  },

  // Y-axis 2 (volume)
  yaxis2: {
    autorange: true,
    type: 'linear',
    gridcolor: '#2a2a2a',
    tickfont: { color: '#71717a' },
    showticklabels: false,
    overlaying: 'y',
  },

  // Margins and background
  margin: { l: 0, r: 60, t: 10, b: 40 },
  plot_bgcolor: '#09090b',            // zinc-950
  paper_bgcolor: 'transparent',
}

const config = {
  displayModeBar: false,
  responsive: true,
}
```

### Candlestick Trace
```tsx
const candlestick: PlotData = {
  x: chartData.x,
  open: chartData.open,
  high: chartData.high,
  low: chartData.low,
  close: chartData.close,
  type: 'candlestick',
  name: symbol,

  // Green candles
  increasing: {
    line: { color: '#34d399' },      // emerald-400
    fillcolor: '#34d399',
  },

  // Red candles
  decreasing: {
    line: { color: '#f87171' },      // red-400
    fillcolor: '#f87171',
  },

  hoverinfo: 'x+y',
}
```

### Volume Trace
```tsx
const volume: PlotData = {
  x: chartData.x,
  y: chartData.volume,
  type: 'bar',
  name: 'Volume',

  marker: {
    color: chartData.close.map((close, i) => {
      if (i === 0) return '#666666'
      return close >= chartData.open[i]
        ? 'rgba(52, 211, 153, 0.3)'   // emerald-400 with opacity
        : 'rgba(248, 113, 113, 0.3)'  // red-400 with opacity
    }),
  },

  yaxis: 'y2',
  hoverinfo: 'x+y',
}
```

---

## Real Data Integration (Replace Mock Data)

### Current State: Mock Data

The current `chartData.ts` generates mock data:

```typescript
// ❌ CURRENT: Mock data generation
export function generateMockChartData(symbol: string, days: number = 90): ChartData {
  // Generates fake OHLC data...
}
```

### Solution: Real Polygon.io API

```typescript
// ✅ NEW: Real data from Polygon.io

// utils/polygonData.ts

export interface PolygonBar {
  t: number;  // timestamp in ms
  o: number;  // open
  h: number;  // high
  l: number;  // low
  c: number;  // close
  v: number;  // volume
}

export async function fetchPolygonData(
  symbol: string,
  startDate: string,
  endDate: string,
  multiplier: number = 1,
  timespan: string = 'day'
): Promise<PolygonBar[]> {
  const API_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY || 'Fm7brz4s23eSocDErnL68cE7wspz2K1I';
  const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${startDate}/${endDate}?adjusted=true&sort=asc&apiKey=${API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data.results) return [];

  return data.results.map((r: any) => ({
    t: r.t,
    o: r.o,
    h: r.h,
    l: r.l,
    c: r.c,
    v: r.v
  }));
}

// Convert PolygonBar to ChartData format
export function polygonToChartData(bars: PolygonBar[]): ChartData {
  return {
    x: bars.map(b => new Date(b.t).toISOString()),
    open: bars.map(b => b.o),
    high: bars.map(b => b.h),
    low: bars.map(b => b.l),
    close: bars.map(b => b.c),
    volume: bars.map(b => b.v),
  };
}
```

### Using Real Data in Component

```typescript
// app/scan/page.tsx

import { fetchPolygonData, polygonToChartData } from '@/utils/polygonData';

function ScanPage() {
  const [chartData, setChartData] = useState<ChartData>({
    x: [], open: [], high: [], low: [], close: [], volume: []
  });

  const loadRealData = async (symbol: string) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);

    try {
      const bars = await fetchPolygonData(
        symbol,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      if (bars.length > 0) {
        setChartData(polygonToChartData(bars));
        console.log(`✅ Loaded ${bars.length} bars for ${symbol}`);
      } else {
        console.warn(`⚠️ No data found for ${symbol}`);
      }
    } catch (error) {
      console.error(`❌ Error fetching data for ${symbol}:`, error);
    }
  };

  useEffect(() => {
    loadRealData('SPY');
  }, []);

  return (
    <EdgeChart
      symbol="SPY"
      data={chartData}
      timeframe="1d"
      onTimeframeChange={() => {}}
    />
  );
}
```

---

## Responsive Design Patterns

### Breakpoints (Tailwind)
```tsx
// Mobile first approach
<div className="
  p-4           // Mobile: 16px
  sm:p-6        // Tablet+: 24px
  md:p-8        // Desktop: 32px
">
```

### Grid Layouts
```tsx
// Responsive grid
<div className="
  grid
  grid-cols-1      // Mobile: 1 column
  md:grid-cols-2   // Tablet: 2 columns
  lg:grid-cols-3   // Desktop: 3 columns
  gap-4            // 16px gap
">
  {items.map(item => <Card key={item.id}>{item}</Card>)}
</div>
```

### Sidebar Layout (Responsive)
```tsx
<div className="flex min-h-screen">
  {/* Sidebar - hidden on mobile, visible on md+ */}
  <aside className="
    hidden md:block
    w-96
    border-r border-zinc-800
  ">
    {/* Sidebar content */}
  </aside>

  {/* Main content - full width on mobile, flex-1 on md+ */}
  <main className="flex-1">
    {/* Main content */}
  </main>
</div>
```

---

## Agent-Browser Testing Examples

### Example 1: Validate Scanner Upload
```bash
# 1. Open page
agent-browser open http://localhost:5665/scan

# 2. Get snapshot to find upload button
agent-browser snapshot

# Assuming upload button is @e1 and file input is @e2

# 3. Verify upload button exists and is visible
agent-browser is visible @e1
agent-browser get text @e1
# Output: "Upload Scanner"

# 4. Upload a file (assuming @e2 is file input)
agent-browser upload @e2 /path/to/scanner.py

# 5. Take screenshot after upload
agent-browser screenshot /tmp/after-upload.png

# 6. Verify scanner appeared in list
agent-browser snapshot

# Close
agent-browser close
```

### Example 2: Validate Scan Execution
```bash
# 1. Open page
agent-browser open http://localhost:5665/scan

# 2. Get snapshot
agent-browser snapshot

# Assuming run button is @e1, date inputs are @e2 and @e3

# 3. Set date range
agent-browser fill @e2 "2025-01-01"
agent-browser fill @e3 "2025-12-31"

# 4. Click run button
agent-browser click @e1

# 5. Wait for results (up to 60 seconds)
agent-browser wait "@e4" 60000  # Wait for results table @e4

# 6. Take screenshot
agent-browser screenshot /tmp/scan-results.png

# 7. Get results count
agent-browser get count "tbody tr"

# 8. Close
agent-browser close
```

### Example 3: Validate Chart Display
```bash
# 1. Open data explorer
agent-browser open http://localhost:5665/data-explorer

# 2. Get snapshot
agent-browser snapshot

# Assuming chart container is @e1, date picker is @e2

# 3. Verify chart is visible
agent-browser is visible @e1

# 4. Change symbol via date picker (if interactive)
agent-browser fill @e2 "AAPL"

# 5. Wait for chart to update
agent-browser wait 2000

# 6. Take screenshot
agent-browser screenshot /tmp/chart-update.png

# 7. Get chart data via JavaScript
agent-browser eval "window.Plotly.getChartDiv().data"

# 8. Close
agent-browser close
```

### Example 4: Responsive Testing
```bash
# Test mobile view (375px)
agent-browser set viewport 375 667
agent-browser open http://localhost:5665/scan
agent-browser screenshot /tmp/mobile-view.png
agent-browser close

# Test tablet view (768px)
agent-browser set viewport 768 1024
agent-browser open http://localhost:5665/scan
agent-browser screenshot /tmp/tablet-view.png
agent-browser close

# Test desktop view (1920px)
agent-browser set viewport 1920 1080
agent-browser open http://localhost:5665/scan
agent-browser screenshot /tmp/desktop-view.png
agent-browser close
```

---

## Common Issues and Debugging

### Issue: Element Not Found
```bash
# Take screenshot to see current state
agent-browser screenshot /tmp/debug.png

# Get full snapshot to see all elements
agent-browser snapshot

# Check if element exists via CSS selector
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
agent-browser eval "document.querySelector('[data-testid=\"submit\"]').click()"

# Check if element is covered
agent-browser screenshot /tmp/coverage.png
```

### Issue: Page Not Loading
```bash
# Open and wait
agent-browser open http://localhost:5665

# Wait for specific element
agent-browser wait "h1" 10000

# Check URL
agent-browser get url

# Check page title
agent-browser eval "document.title"

# Take screenshot
agent-browser screenshot /tmp/page-load.png

# Check console for errors
agent-browser console
```

---

## Accessibility Testing

### Checklist
Before marking UI as complete:

- [ ] All interactive elements have visible focus states
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Buttons have descriptive labels
- [ ] Form inputs have associated labels
- [ ] Images have alt text
- [ ] Headings are in logical order (h1, h2, h3...)
- [ ] No auto-playing media without controls
- [ ] Links have descriptive text (not "click here")

### Testing with Agent-Browser
```bash
# Test keyboard navigation
agent-browser keyboard press "Tab"
agent-browser screenshot /tmp/tab-1.png
agent-browser keyboard press "Tab"
agent-browser screenshot /tmp/tab-2.png

# Test form submission with Enter
agent-browser fill @e1 "value"
agent-browser keyboard press "Enter"

# Check focus styles
agent-browser focus @e1
agent-browser screenshot /tmp/focus-state.png

# Get all interactive elements
agent-browser eval "document.querySelectorAll('button, a, input').length"
```

---

## Sources & References

### Vercel Agent-Browser
- [GitHub Repository](https://github.com/vercel-labs/agent-browser)
- [Commands Documentation](https://agent-browser.dev/commands)
- [Skills Documentation](https://github.com/vercel-labs/agent-browser/blob/main/skills/agent-browser/SKILL.md)

### Design Resources
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [awesome-shadcn-ui](https://github.com/birobirobiro/awesome-shadcn-ui)
- [awesome-react](https://github.com/enaqx/awesome-react)
- [awesome-react-components](https://github.com/brillout/awesome-react-components)

### Chart Libraries
- [Plotly.js Documentation](https://plotly.com/javascript/)
- [react-plotly.js](https://plotly.com/javascript/react/)

### Styling & UI
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- [Lucide Icons](https://lucide.dev/)

---

## Quick Reference

### Agent-Browser Commands
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
agent-browser scroll down 500

# Control
agent-browser close
```

### Development Commands
```bash
# Next.js
cd /home/mdwzrd/wzrd.dev/projects/edge.dev/frontend
npm run dev          # Start dev server (port 5665)
npm run build         # Build for production
npm run start         # Start production server

# shadcn/ui
npx shadcn@latest add <component>

# Backend
cd /home/mdwzrd/wzrd.dev/projects/edge.dev/backend
python3 main.py       # Start FastAPI server (port 8000)
```

---

**"Real visibility = real results. Test what you build with agent-browser before claiming it works."**
