#!/bin/bash
# Browser Automation Script for Claude
# Uses Playwright for browser interaction

set -e

# Default values
HEADLESS="true"
TIMEOUT=10
SCREENSHOT_PATH="/tmp/browser-screenshot.png"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --headless)
      HEADLESS="$2"
      shift 2
      ;;
    --timeout)
      TIMEOUT="$2"
      shift 2
      ;;
    --screenshot-path)
      SCREENSHOT_PATH="$2"
      shift 2
      ;;
    *)
      break
      ;;
  esac
done

COMMAND="$1"
shift

# Create temporary Python script for the browser action
PYTHON_SCRIPT=$(cat <<'EOF'
import asyncio
import sys
from playwright.async_api import async_playwright
from pathlib import Path

async def main():
    command = sys.argv[1]
    args = sys.argv[2:]

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        try:
            if command == "open":
                url = args[0]
                print(f"Opening browser to: {url}")
                await page.goto(url, wait_until="networkidle", timeout=30000)
                # Wait a bit for JS to render
                await asyncio.sleep(2)
                print("✅ Page loaded")

            elif command == "screenshot":
                screenshot_path = args[0] if args else "/tmp/browser-screenshot.png"
                print(f"Taking screenshot: {screenshot_path}")
                await page.screenshot(path=screenshot_path, full_page=True)
                print(f"✅ Screenshot saved to: {screenshot_path}")

            elif command == "click":
                selector = args[0]
                print(f"Clicking: {selector}")
                await page.click(selector, timeout=5000)
                print("✅ Clicked")
                await asyncio.sleep(1)

            elif command == "fill":
                selector = args[0]
                text = args[1]
                print(f"Filling {selector} with: {text[:20]}...")
                await page.fill(selector, text, timeout=5000)
                print("✅ Filled")

            elif command == "wait":
                selector = args[0]
                timeout_ms = int(args[1]) * 1000 if len(args) > 1 else 10000
                print(f"Waiting for: {selector} (timeout {timeout_ms}ms)")
                await page.wait_for_selector(selector, timeout=timeout_ms)
                print("✅ Element found")

            elif command == "text":
                selector = args[0]
                print(f"Getting text from: {selector}")
                element = await page.query_selector(selector)
                if element:
                    text = await element.text_content()
                    print(text)
                else:
                    print("❌ Element not found")

            elif command == "url":
                print(page.url)

            else:
                print(f"❌ Unknown command: {command}")
                sys.exit(1)

        except Exception as e:
            print(f"❌ Error: {e}")
            # Take screenshot on error for debugging
            error_screenshot = "/tmp/browser-error.png"
            await page.screenshot(path=error_screenshot)
            print(f"📸 Error screenshot: {error_screenshot}")
            sys.exit(1)

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
EOF
)

# Run the Python script
python3 -c "$PYTHON_SCRIPT" "$COMMAND" "$@"
