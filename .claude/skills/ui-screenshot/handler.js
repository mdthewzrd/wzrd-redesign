#!/usr/bin/env node

/**
 * UI Screenshot Skill Handler
 * Takes screenshots of local web UI and analyzes with vision
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DEFAULT_URL = 'http://localhost:5173';
const SCREENSHOT_PATH = '/tmp/ui-screenshot.png';
const HTML_DUMP_PATH = '/tmp/ui-dump.html';

async function takeScreenshot(url = DEFAULT_URL) {
  // Method 1: Try playwright (if installed)
  try {
    // Check if we're in the web-ui directory
    const webUiDir = '/home/mdwzrd/wzrd.dev/web-ui';
    const script = `
      const { chromium } = require('playwright');
      (async () => {
        const browser = await chromium.launch();
        const page = await browser.newPage();
        await page.goto('${url}', { waitUntil: 'networkidle' });
        await page.screenshot({ path: '${SCREENSHOT_PATH}', fullPage: true });
        await browser.close();
        console.log('SCREENSHOT_OK');
      })();
    `;

    const output = execSync(`node -e "${script.replace(/\n/g, ' ')}"`, {
      cwd: webUiDir,
      stdio: 'pipe',
      timeout: 10000
    }).toString();

    if (output.includes('SCREENSHOT_OK')) {
      return SCREENSHOT_PATH;
    }
  } catch (e) {
    // Playwright failed, try next method
  }

  // Method 2: For headless environments, create an HTML dump
  console.log('Headless environment detected, creating HTML dump...');
  return await createHTMLDump(url);
}

async function createHTMLDump(url = DEFAULT_URL) {
  const response = await fetch(url);
  const html = await response.text();

  const dump = `
<!DOCTYPE html>
<html>
<head>
  <title>UI Dump - ${new Date().toISOString()}</title>
  <style>
    body { font-family: monospace; white-space: pre; background: #1a1a1a; color: #eee; padding: 20px; }
    .info { color: #4a9; }
    .warn { color: #fa0; }
  </style>
</head>
<body>
<span class="info">[HTML Dump of ${url}]</span>
<span class="warn">[Note: This is a text dump, not a visual screenshot]</span>

${html.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
</body>
</html>
  `;

  fs.writeFileSync(HTML_DUMP_PATH, dump);
  console.log(`HTML dump saved to: ${HTML_DUMP_PATH}`);
  console.log(`file://${HTML_DUMP_PATH}`);
  return HTML_DUMP_PATH;
}

async function main() {
  const url = process.argv[2] || DEFAULT_URL;

  try {
    console.log(`Capturing ${url}...`);
    const resultPath = await takeScreenshot(url);
    console.log(`Result saved to: ${resultPath}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { takeScreenshot };
