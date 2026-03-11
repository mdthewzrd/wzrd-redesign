# Scan Build Skill

> **Skill:** `scan-build`
> **Agent:** Renata
> **Purpose:** End-to-end systematic scan building workflow
> **Mode:** Strategy Builder / Edge Hunter

---

## Description

The scan-build skill orchestrates the complete scan building process from initial idea to finalized scanner. This is a **human-in-the-loop** workflow where Renata guides through each step and the trader validates visually using the edge.dev dashboard.

---

## Workflow Steps

### Step 1: Idea Capture & Vision Sharing
- Receive trader's setup idea
- Parse A+ examples if provided
- Extract key features (indicators, patterns, conditions)
- Document the trading vision

### Step 2: Shape the Mold
- Translate vision into technical parameters
- Identify which parameters to optimize
- Define the pattern detection logic
- Determine if single or multiscan approach

### Step 3: Baseline Analysis on A+ Examples
- Analyze code on A+ example names
- Show parameter values for key stocks
- Establish baseline ranges

### Step 4: Initial Scan with Test Parameters
- Generate V31-compliant scanner code
- Run scan with test parameters
- Return results for validation

### Step 5: Human Validation & Feedback
- Trader reviews results in edge.dev dashboard
- Trader provides feedback on:
  - Which names are good/bad fits
  - Parameter adjustments needed
  - Pattern nuances missed

### Step 6: Iterate & Refine
- Apply trader feedback
- Adjust parameters and logic
- Re-run scan
- Repeat until good mold achieved

### Step 7: Extended Validation
- Run finalized parameters vs 4-5 years of data
- Validate consistency across time
- Finalize scan

---

## Usage

```
/scan-build "I want to find stocks that are bouncing off the 20EMA after a sharp pullback with volume spike"
```

With A+ examples:
```
/scan-build "
I want to find EMA bounce setups. A+ examples:
- NVDA 2024-01-15: Bounced off 20EMA, 3x volume, +15% next 3 days
- TSLA 2023-11-28: 20EMA bounce, 2.5x volume, +12% move
- AMD 2024-02-08: 20EMA bounce, 4x volume, +20% move
"
```

---

## Memory Storage

```
~/.claude/projects/-home-mdwzrd/memory/renata/scans/
├── {scan_name}/
│   ├── vision.md          # Initial idea and vision
│   ├── parameters.json    # Final parameter set
│   ├── iterations/        # Each iteration attempt
│   ├── validation.json     # A+ validation results
│   └── a_plus_examples.md  # Reference examples
```

---

## Integration Points

- **Command:** `/build-scan` - Full workflow execution
- **API:** `/api/scan_ez/execute` - Scanner execution
- **API:** `/api/renata_v2/transform` - Code transformation
- **Dashboard:** edge.dev for visual validation

---

## Related Skills

- `code-analysis` - Analyze existing scanner code
- `code-transformation` - Transform to V31 standards
- `v31-generator` - Generate V31-compliant code

---

**Created:** 2026-02-26
**Status:** Active
