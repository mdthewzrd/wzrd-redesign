---
name: ui-screenshot
description: UI screenshot capture, visual testing, and screenshot comparison
category: ui-testing
priority: P1
tags: [screenshot, visual-testing, ui, testing]
subskills:
  - screenshot-capture
  - visual-regression
  - screenshot-comparison
  - cross-browser-screenshots
---

# UI Screenshot Skill

## Purpose
Capture screenshots for visual testing, documentation, and regression detection.

## Core Principle
**"A screenshot is worth a thousand bug reports. Visual differences can catch what unit tests miss."**

## Screenshot Capture

### Playwright (Cross-Browser)
```typescript
import { chromium, firefox, webkit } from 'playwright';

// Single screenshot
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('https://example.com');
await page.screenshot({ path: 'screenshot.png' });
await browser.close();

// Full page screenshot
await page.screenshot({
  path: 'full-page.png',
  fullPage: true
});

// Specific element
const element = await page.$('.hero-section');
await element.screenshot({ path: 'hero.png' });

// Multiple browsers
for (const browserType of [chromium, firefox, webkit]) {
  const browser = await browserType.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  await page.screenshot({
    path: `${browserType.name()}-screenshot.png`
  });
  await browser.close();
}
```

### Puppeteer
```javascript
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');

  // Basic screenshot
  await page.screenshot({ path: 'screenshot.png' });

  // Full page
  await page.screenshot({
    path: 'full-page.png',
    fullPage: true
  });

  // With custom viewport
  await page.setViewport({ width: 1920, height: 1080 });
  await page.screenshot({ path: 'desktop-1920.png' });

  await browser.close();
})();
```

### Selenium (Python)
```python
from selenium import webdriver
from selenium.webdriver.common.by import By

# Basic screenshot
driver = webdriver.Chrome()
driver.get('https://example.com')
driver.save_screenshot('screenshot.png')

# Full page screenshot (with JS)
def full_page_screenshot(driver, file_path):
    # Get total page height
    total_height = driver.execute_script(
        "return document.body.scrollHeight"
    )

    # Set window size
    driver.set_window_size(1920, total_height)

    # Save screenshot
    driver.save_screenshot(file_path)

full_page_screenshot(driver, 'full-page.png')

# Element screenshot
element = driver.find_element(By.ID, 'hero')
element.screenshot('element.png')

driver.quit()
```

### Nightmare (Node.js - Lightweight)
```javascript
const Nightmare = require('nightmare');

const screenshot = await Nightmare({ show: false })
  .goto('https://example.com')
  .screenshot('screenshot.png')
  .evaluate(() => document.title)
  .end();
```

## Visual Regression Testing

### Playwright with PixelMatch
```typescript
import { test, expect } from '@playwright/test';

test('visual regression test', async ({ page }) => {
  await page.goto('https://example.com');

  // Take screenshot and compare with baseline
  await expect(page).toHaveScreenshot('homepage.png');

  // With specific options
  await expect(page).toHaveScreenshot('homepage.png', {
    maxDiffPixels: 100,
    threshold: 0.2,
    animations: 'allow'
  });

  // Element screenshot
  const hero = page.locator('.hero');
  await expect(hero).toHaveScreenshot('hero.png');
});
```

### Percy (Service-based)
```bash
# Install Percy CLI
npm install @percy/cli --save-dev

# Run Percy with your test command
percy exec -- npm test

# Playwright with Percy
# test.ts
import { percySnapshot } from '@percy/playwright';

test('Percy snapshot', async ({ page }) => {
  await page.goto('https://example.com');
  await percySnapshot(page, 'Homepage');
});
```

### BackstopJS (Config-based)
```javascript
// backstop.config.js
module.exports = {
  id: 'my_app',
  viewports: [
    { name: 'phone', width: 320, height: 480 },
    { name: 'tablet', width: 1024, height: 768 },
    { name: 'desktop', width: 1920, height: 1080 }
  ],
  scenarios: [
    {
      label: 'Homepage',
      url: 'https://example.com',
      selectors: ['.hero', '.features'],
      selectorExpansion: true,
      misMatchThreshold: 0.1
    }
  ],
  paths: {
    bitmaps_reference: 'backstop_data/bitmaps_reference',
    bitmaps_test: 'backstop_data/bitmaps_test',
    html_report: 'backstop_data/html_report'
  }
};
```

```bash
# Create reference screenshots
backstop reference

# Run tests
backstop test

# Approve changes
backstop approve
```

## Screenshot Comparison

### Using PixelMatch (Node.js)
```javascript
const pixelmatch = require('pixelmatch');
const { createCanvas, loadImage } = require('canvas');

async function compareScreenshots(img1, img2, output) {
  const img1Data = await loadImage(img1);
  const img2Data = await loadImage(img2);

  const width = img1Data.width;
  const height = img1Data.height;

  const diff = createCanvas(width, height);
  const ctx = diff.getContext('2d');

  const img1Canvas = createCanvas(width, height);
  const img1Ctx = img1Canvas.getContext('2d');
  img1Ctx.drawImage(img1Data, 0, 0);

  const img2Canvas = createCanvas(width, height);
  const img2Ctx = img2Canvas.getContext('2d');
  img2Ctx.drawImage(img2Data, 0, 0);

  const numDiffPixels = pixelmatch(
    img1Ctx.getImageData(0, 0, width, height).data,
    img2Ctx.getImageData(0, 0, width, height).data,
    ctx.getImageData(0, 0, width, height).data,
    width,
    height,
    { threshold: 0.1 }
  );

  diff.png.pipe(fs.createWriteStream(output));

  const totalPixels = width * height;
  const diffPercentage = (numDiffPixels / totalPixels) * 100;

  console.log(`Different pixels: ${numDiffPixels}/${totalPixels}`);
  console.log(`Difference: ${diffPercentage.toFixed(2)}%`);

  return {
    passed: numDiffPixels < 100,
    diffPixels: numDiffPixels,
    percentage: diffPercentage
  };
}

// Usage
compareScreenshots(
  'baseline.png',
  'current.png',
  'diff.png'
).then(result => {
  if (result.passed) {
    console.log('✅ Screenshots match');
  } else {
    console.log('❌ Screenshots differ');
  }
});
```

### Using ImageMagick
```bash
# Compare two images
compare baseline.png current.png diff.png

# Get difference metrics
compare -metric MSE baseline.png current.png diff.png

# Fuzzy comparison (allow small differences)
compare -fuzz 5% baseline.png current.png diff.png

# Create side-by-side comparison
convert baseline.png current.png +append comparison.png
```

## Responsive Screenshots

### Multiple Viewports
```python
from selenium import webdriver
from selenium.webdriver.common.by import By

VIEWPORTS = [
    ('mobile', 375, 667),
    ('tablet', 768, 1024),
    ('desktop', 1920, 1080)
]

def capture_responsive_screenshots(url, output_dir):
    driver = webdriver.Chrome()

    for name, width, height in VIEWPORTS:
        driver.set_window_size(width, height)
        driver.get(url)

        # Wait for page to load
        driver.implicitly_wait(2)

        # Capture screenshot
        filename = f'{output_dir}/{name}-{width}x{height}.png'
        driver.save_screenshot(filename)
        print(f'✅ Captured {filename}')

    driver.quit()

capture_responsive_screenshots('https://example.com', 'screenshots')
```

### Playwright Responsive
```typescript
import { chromium } from 'playwright';

const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1920, height: 1080 }
];

const browser = await chromium.launch();
const page = await browser.newPage();

for (const { name, width, height } of viewports) {
  await page.setViewportSize({ width, height });
  await page.goto('https://example.com');
  await page.screenshot({
    path: `screenshots/${name}-${width}x${height}.png`
  });
  console.log(`✅ Captured ${name}`);
}

await browser.close();
```

## Dynamic Content Handling

### Wait for Content
```python
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

driver = webdriver.Chrome()
driver.get('https://example.com')

# Wait for specific element to load
WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.ID, 'dynamic-content'))
)

# Wait for all images to load
driver.execute_script("""
  return Promise.all(
    Array.from(document.images).map(img => {
      if (img.complete) return;
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    })
  );
""")

# Now take screenshot
driver.save_screenshot('screenshot.png')
driver.quit()
```

### Hide Dynamic Elements
```python
from selenium import webdriver

driver = webdriver.Chrome()
driver.get('https://example.com')

# Hide dynamic date/time elements
driver.execute_script("""
  document.querySelectorAll('.timestamp, .date, .time').forEach(el => {
    el.style.visibility = 'hidden';
  });
""")

# Replace random IDs with fixed values
driver.execute_script("""
  document.querySelectorAll('[id^="random-"]').forEach(el => {
    el.id = 'fixed-id';
  });
""")

driver.save_screenshot('screenshot.png')
driver.quit()
```

## CI/CD Integration

### GitHub Actions with Playwright
```yaml
name: Visual Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run visual tests
        run: npx playwright test

      - name: Upload screenshots
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: screenshots
          path: playwright-report/
```

### Percy in CI
```yaml
name: Percy Tests

on: [push, pull_request]

jobs:
  percy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Run Percy
        env:
          PERCY_TOKEN: ${{ secrets.PERCY_TOKEN }}
        run: npx percy exec -- npm test
```

## Best Practices

### 1. Stabilize Screenshots
```typescript
// Disable animations
await page.addStyleTag({
  content: `
    *, *::before, *::after {
      animation-duration: 0s !important;
      animation-delay: 0s !important;
      transition-duration: 0s !important;
      transition-delay: 0s !important;
    }
  `
});

// Hide scrollbars
await page.addStyleTag({
  content: `
    ::-webkit-scrollbar { display: none; }
  `
});

// Set fixed fonts
await page.evaluate(() => {
  document.body.style.fontFamily = 'Arial, sans-serif';
});
```

### 2. Use Consistent Viewports
```typescript
// Always use same viewport
const VIEWPORT = { width: 1280, height: 720 };

await page.setViewportSize(VIEWPORT);
```

### 3. Isolate Components
```typescript
// Test specific component
const component = page.locator('.component');
await component.screenshot({ path: 'component.png' });

// Or with mask (hide other elements)
await page.screenshot({
  path: 'masked.png',
  mask: [page.locator('.dynamic-date')]
});
```

### 4. Handle Loading States
```typescript
// Wait for network idle
await page.goto(url, { waitUntil: 'networkidle' });

// Wait for specific selector
await page.waitForSelector('.loaded', { state: 'attached' });
```

## Gold Standard Integration

### Read-Back Verification
After capturing screenshot:
```python
import os

path = 'screenshot.png'
driver.save_screenshot(path)

# Verify
if os.path.exists(path):
    size = os.path.getsize(path)
    print(f"✅ Screenshot created: {path} ({size} bytes)")
else:
    print("❌ Screenshot not created")
```

### Executable Proof
```bash
# Verify screenshot exists
$ ls -lh screenshot.png
-rw-r--r-- 1 user user 125K Feb 20 10:30 screenshot.png

✅ Screenshot captured successfully
```

---

**"Visual bugs are user-facing bugs. Catch them before your users do."**
