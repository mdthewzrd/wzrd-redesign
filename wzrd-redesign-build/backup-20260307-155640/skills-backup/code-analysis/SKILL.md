# Code Analysis Skill

> **Skill:** `code-analysis`
> **Agent:** Renata
> **Purpose:** Analyze and understand existing scanner code
> **Mode:** Code Formatter / Trading Research

---

## Description

The code-analysis skill examines existing scanner code (from TradingView, repos, or other sources) and extracts:
- Input parameters and their ranges
- Pattern detection logic
- Timeframes and conditions
- Dependencies (indicators, calculations)

This is crucial for both transforming existing code and understanding baseline parameter values on A+ examples.

---

## Analysis Output

For any scanner code analyzed, the skill returns:

```json
{
  "scan_name": "EMA_Bounce_Scanner",
  "type": "single" | "multiscan",
  "parameters": [
    {
      "name": "ema_length",
      "type": "integer",
      "default": 20,
      "range": "[5, 100]",
      "description": "EMA period for bounce level"
    },
    {
      "name": "volume_multiplier",
      "type": "float",
      "default": 2.0,
      "range": "[1.5, 5.0]",
      "description": "Volume spike threshold"
    }
  ],
  "logic": "Bounce when price touches EMA with volume > threshold",
  "timeframe": "Daily",
  "conditions": [
    "price close to EMA (within 1%)",
    "volume > volume_multiplier * avg_volume(20)",
    "price was above EMA in last 10 days"
  ],
  "dependencies": [
    "EMA",
    "SMA (for average volume)"
  ],
  "suggested_transformations": [
    "Replace TradingView functions with pandas equivalents",
    "Add explicit output columns for dashboard compatibility"
  ]
}
```

---

## A+ Example Analysis

When given A+ example stocks and dates, the skill runs the code and shows:

```
Symbol   Date      EMA(20)  Price   Volume   AvgVol  VolMult  Signal
--------  --------  -------  ------  -------  -------  -------  -------
NVDA     2024-01-15  478.20  478.50  85.2M   28.1M   3.03     TRUE
TSLA     2023-11-28  241.30  241.50  42.8M   17.2M   2.49     TRUE
AMD      2024-02-08  178.80  179.10  95.4M   23.5M   4.06     TRUE
```

This helps establish baseline parameter values.

---

## Usage

```
/analyze-code {code}

/analyze-code --examples "NVDA:2024-01-15, TSLA:2023-11-28" {code}
```

---

## Related Skills

- `scan-build` - Use analysis for scan building
- `code-transformation` - Transform analyzed code
- `v31-generator` - Generate new V31 code from analysis

---

**Created:** 2026-02-26
**Status:** Active
