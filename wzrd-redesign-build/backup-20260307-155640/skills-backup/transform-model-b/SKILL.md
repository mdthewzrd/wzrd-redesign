---
name: transform-model-b
description: Transform row-iteration scanner patterns to V31 gold standard
category: transformation
priority: P0
tags: [v31, transformation, model-b, row-iteration]
---

# Model B Transformation: Row-Iteration Patterns

## Purpose
Transform scanners that use row-by-row iteration patterns (accessing r0, r1, r2 directly) to V31 gold standard.

## Core Principle
**"Iterate smart. D0 unshifted, D-1 shifted, D-2 double-shifted."**

---

## Detection Patterns

```python
# Model B uses these patterns:
for i in range(2, len(df)):
    r0 = df.iloc[i]      # D0 row (no shift)
    r1 = df.iloc[i-1]    # D-1 row (already shifted)
    r2 = df.iloc[i-2]    # D-2 row

    if r0['open'] > r1['high']:  # Gap-up condition
```

---

## Critical: D-1 Metric Alignment

### When Iterating Through Rows
```python
# For each D0 date (r0 = row i, r1 = row i-1):
# r1 ALREADY represents D-1, no need to access shifted columns

# ❌ WRONG - Double shift
r1['prev_high']  # This is D-2's high

# ✅ CORRECT - r1 IS D-1
r1['high']  # This is D-1's high
```

### Computed D-1 Metrics (Pre-Scan)
```python
# These MUST be shifted for D-1 alignment
group['high'] = group['high'].shift(1)  # D-1's high
group['low'] = group['low'].shift(1)    # D-1's low
group['close'] = group['close'].shift(1)  # D-1's close
group['ema_9'] = group['ema_9'].shift(1)  # EMA through D-1

# Ratios using D-1 metrics
group['open_over_ema9'] = group['open'].shift(1) / group['ema_9'].shift(1)
```

---

## Critical: Gap-Up Condition

```python
# ✅ CORRECT - D-1's actual high
if r0['open'] > r1['high']:
    # Gap-up detected

# ❌ WRONG - This is D-2's high
if r0['open'] > r1['prev_high']:
```

---

## Transformation Steps

### Step 1: Load Base V31 Patterns
Load `v31-transformation-base` skill for shared utilities.

### Step 2: Extract Pattern Logic
Identify:
- Pattern trigger conditions (gap-up, EMA cross, etc.)
- D-1 validation conditions (volume, slopes, etc.)
- Pattern-specific calculations

### Step 3: Transform to Class Structure
Use same template as Model A (see `v31-transformation-base`).

### Step 4: Implement 5-Stage Pipeline

**Stages 1-3a:** Same as Model A (see `v31-transformation-base`).

**Stage 3b: Pattern Detection (Model B - Row Iteration)**
```python
def detect_patterns(self, df: pd.DataFrame) -> pd.DataFrame:
    df = df.sort_values(['ticker', 'date']).copy()

    results = []

    for ticker, ticker_df in df.groupby('ticker'):
        if len(ticker_df) < 100:
            continue

        for i in range(2, len(ticker_df)):
            r0 = ticker_df.iloc[i]   # D0
            r1 = ticker_df.iloc[i-1] # D-1
            r2 = ticker_df.iloc[i-2] # D-2

            # Check if in output range
            d0_date = pd.Timestamp(r0['date'])
            if not (d0_start_dt <= d0_date <= d0_end_dt):
                continue

            # Pattern conditions (example: gap-up + volume)
            gap_up = r0['open'] > r1['high']
            volume_ok = r1['volume'] >= self.params['volume_min']

            if gap_up and volume_ok:
                results.append({
                    'ticker': ticker,
                    'date': r0['date'].strftime('%Y-%m-%d'),
                    'close': float(r0['close']),
                    'volume': int(r0['volume']),
                })

    return pd.DataFrame(results)
```

### Step 5: Parallel Processing (Required for Model B)

```python
def detect_patterns(self, df: pd.DataFrame) -> pd.DataFrame:
    # Pre-slice optimization (O(n))
    d0_start_dt = pd.Timestamp(self.d0_start)
    d0_end_dt = pd.Timestamp(self.d0_end)

    ticker_data_list = [
        (ticker, ticker_df.copy(), d0_start_dt, d0_end_dt)
        for ticker, ticker_df in df.groupby('ticker')
    ]

    # Parallel processing
    with ThreadPoolExecutor(max_workers=10) as executor:
        future_to_ticker = {
            executor.submit(self._process_ticker, ticker_data): ticker_data[0]
            for ticker_data in ticker_data_list
        }

        results = []
        for future in as_completed(future_to_ticker):
            results.extend(future.result())

    return pd.DataFrame(results)

def _process_ticker(self, ticker_data):
    ticker, ticker_df, d0_start_dt, d0_end_dt = ticker_data

    results = []
    for i in range(2, len(ticker_df)):
        r0 = ticker_df.iloc[i]
        r1 = ticker_df.iloc[i-1]

        d0_date = pd.Timestamp(r0['date'])
        if not (d0_start_dt <= d0_date <= d0_end_dt):
            continue

        # Pattern logic here...

    return results
```

### Step 6: Convert Naming
Change all variable names to snake_case.

### Step 7: Add Progress Tracking
Add progress bars and timing.

---

## Common Model B Bugs to Avoid

| Bug | Wrong Code | Correct Code |
|------|-------------|--------------|
| Gap condition using wrong high | `r0['open'] > r1['prev_high']` | `r0['open'] > r1['high']` |
| D-1 metric double shift | `r1['prev_close']` | `r1['close']` (r1 is already D-1) |
| Missing shift on computed metrics | `group['ema9']` (unshifted) | `group['ema9'].shift(1)` |
| Index alignment error | `g['tr'].rolling(14).mean()` | `g['tr'].transform(lambda x: x.rolling(14).mean())` |

---

## Validation Checklist

- [ ] Uses grouped endpoint for full market
- [ ] Class-based with `run_scan()` method
- [ ] Smart filters preserve historical data
- [ ] All variables in snake_case
- [ ] Index alignment uses `.transform()`
- [ ] Pattern detection uses row iteration
- [ ] Gap condition uses `r1['high']`, not `prev_high`
- [ ] D-1 metrics properly shifted
- [ ] Parallel processing implemented
- [ ] NYSE trading calendar integrated

---

**"Model B: Iterate smart. Know your D-0, D-1, D-2."**
