---
name: transform-model-c
description: Transform complex multi-pass scanner patterns (FBO, level-based) to V31 gold standard with optimizations
category: transformation
priority: P0
tags: [v31, transformation, model-c, fbo, level-based]
---

# Model C Transformation: Complex Multi-Pass Patterns

## Purpose
Transform scanners that use nested loops and long lookbacks (FBO, level-based patterns) to V31 gold standard with critical optimizations.

## Core Principle
**"Pre-compute everything. Don't search 1000 days for every D0."**

---

## Detection Patterns

```python
# Model C uses these patterns:
for d0 in dates:                    # Outer loop
    level_date = pick_level_date(m, d0, p)  # Searches 1000 days!
    sig = significance_metrics(m, level_date, d0, p)  # More expensive

# Or:
pivot_high_dates(df, left, right)      # Pivot computation
significance_metrics(m, level, d0, p)  # Significance gating
timedelta(days=500+)                     # Long lookback
```

---

## Critical Optimization: Pivot Pre-Computation

### Problem: O(n × 1000) Complexity
```python
# ❌ WRONG - Searches 1000 days for EVERY D0
for d0 in dates:
    level_date = pick_level_date(m, d0, p)  # O(1000) per D0
    # Total: O(n × 1000) for one ticker
    # For 10K tickers: ~10 BILLION operations
```

### Solution: Pre-Compute Pivots Once
```python
# ✅ OPTIMIZED - Compute ALL pivots once (O(n))
def compute_pivot_levels(self, df: pd.DataFrame) -> pd.DataFrame:
    """Pre-compute all pivot highs for O(1) lookup."""
    df = df.sort_values(['ticker', 'date']).copy()

    pivot_levels = []

    for ticker, ticker_df in df.groupby('ticker'):
        h_vals = ticker_df['high'].values
        dates = ticker_df['date'].values

        pivots = self._find_pivot_highs(h_vals, dates)

        for pivot_date, pivot_price in pivots:
            pivot_levels.append({
                'ticker': ticker,
                'pivot_date': pivot_date,
                'pivot_price': pivot_price,
            })

    return pd.DataFrame(pivot_levels)

def _find_pivot_highs(self, h_vals, dates):
    """Find all pivot highs using sliding window."""
    pivots = []
    left, right = self.params['pivot_left'], self.params['pivot_right']

    for i in range(left, len(h_vals) - right):
        h_i = h_vals[i]
        lv = h_vals[i-left:i].max() if left > 0 else -np.inf
        rv = h_vals[i+1:i+1+right].max() if right > 0 else -np.inf

        if np.isfinite(h_i) and h_i >= lv and h_i > rv:
            pivots.append((dates[i], h_i))

    return pivots
```

### O(1) Lookup After Pre-Computation
```python
def get_level_date_for_d0(self, d0, pivot_df, ticker):
    """O(1) lookup from pre-computed pivots."""
    ticker_pivots = pivot_df[pivot_df['ticker'] == ticker]

    # Filter by lookback window
    lookback_start = d0 - pd.Timedelta(days=self.params['lookback_days'])
    candidates = ticker_pivots[
        (ticker_pivots['pivot_date'] < d0) &
        (ticker_pivots['pivot_date'] >= lookback_start)
    ]

    if candidates.empty:
        return None

    # Prefer highest pivot
    return candidates.nlargest(1, 'pivot_price').iloc[0]['pivot_date']
```

---

## Transformation Steps

### Step 1: Load Base V31 Patterns
Load `v31-transformation-base` skill for shared utilities.

### Step 2: Extract Pattern Logic
Identify:
- Level/ pivot detection logic
- Significance gating conditions
- Lookback window parameters
- D0 validation conditions

### Step 3: Transform to Class Structure
Use same template as Model A/B (see `v31-transformation-base`).

### Step 4: Implement 5-Stage Pipeline with Optimizations

**Stage 1: Fetch Grouped Data** - Same as Model A/B.

**Stage 2a: Simple Features** - Same as Model A/B.

**Stage 2b: Smart Filters** - Same as Model A/B.

**Stage 3a: Indicators** - Same as Model A/B.

**Stage 3b: Pattern Detection (Model C - Optimized)**

```python
def detect_patterns(self, df: pd.DataFrame) -> pd.DataFrame:
    # Step 1: Pre-compute ALL pivots once (O(n))
    pivot_df = self.compute_pivot_levels(df)

    # Step 2: Pre-slice for parallel processing (O(n))
    d0_start_dt = pd.Timestamp(self.d0_start)
    d0_end_dt = pd.Timestamp(self.d0_end)

    ticker_data_list = [
        (ticker, ticker_df.copy(), pivot_df[pivot_df['ticker'] == ticker].copy(), d0_start_dt, d0_end_dt)
        for ticker, ticker_df in df.groupby('ticker')
    ]

    # Step 3: Parallel processing
    with ThreadPoolExecutor(max_workers=10) as executor:
        future_to_ticker = {
            executor.submit(self._process_ticker_c, ticker_data): ticker_data[0]
            for ticker_data in ticker_data_list
        }

        results = []
        for future in as_completed(future_to_ticker):
            results.extend(future.result())

    return pd.DataFrame(results)

def _process_ticker_c(self, ticker_data):
    """Process ticker with pre-computed pivots (O(n) per ticker)."""
    ticker, ticker_df, pivot_df, d0_start_dt, d0_end_dt = ticker_data

    results = []
    for i in range(2, len(ticker_df)):
        r0 = ticker_df.iloc[i]
        r1 = ticker_df.iloc[i-1]

        d0_date = pd.Timestamp(r0['date'])
        if not (d0_start_dt <= d0_date <= d0_end_dt):
            continue

        # O(1) lookup - no more searching 1000 days!
        level_date = self.get_level_date_for_d0(d0_date, pivot_df, ticker)
        if level_date is None:
            continue

        # Get level price
        level_row = pivot_df[pivot_df['pivot_date'] == level_date].iloc[0]
        level_px = float(level_row['pivot_price'])

        # D0 conditions
        gap_pct = (r0['open'] - r1['close']) / r1['close'] * 100
        if gap_pct < self.params['gap_min_pct']:
            continue

        # Touch condition
        touch_pct = (r0['open'] - level_px) / level_px * 100
        if r0['open'] < level_px * (1 - self.params['touch_tol_pct']/100):
            continue

        # Significance gating (now fast with pre-computed pivots)
        if not self._check_significance(level_row, self.params):
            continue

        results.append({
            'ticker': ticker,
            'date': d0_date.strftime('%Y-%m-%d'),
            'level_date': level_date.strftime('%Y-%m-%d'),
            'level': round(level_px, 4),
            'close': float(r0['close']),
            'volume': int(r0['volume']),
        })

    return results
```

### Step 5: Convert Naming
Change all variable names to snake_case.

### Step 6: Add Progress Tracking
Add progress bars and timing.

---

## Complexity Management

| Operation | Naive Approach | Optimized Approach |
|------------|----------------|-------------------|
| Pivot detection | O(n × 1000) per ticker | O(n) pre-compute |
| Level lookup for D0 | O(1000) per D0 | O(1) lookup |
| Significance check | O(window) per D0 | O(1) from pre-computed |

**Total Speedup:** ~1000x for Model C patterns

---

## Validation Checklist

- [ ] Uses grouped endpoint for full market
- [ ] Class-based with `run_scan()` method
- [ ] Smart filters preserve historical data
- [ ] All variables in snake_case
- [ ] Index alignment uses `.transform()`
- [ ] Pivots pre-computed ONCE (not per D0)
- [ ] Level lookup is O(1), not O(1000)
- [ ] Parallel processing implemented
- [ ] NYSE trading calendar integrated
- [ ] Progress tracking added

---

## Known Model C Patterns

### FBO Scan (First Break Out)
- Level selection from 1000-day lookback
- Pivot significance gating
- Gap-up + touch conditions
- D-1 volume and slope validation

### Other Level-Based Patterns
- Support/Resistance level tests
- Breakout patterns with level validation
- Multi-timeframe level confluence

---

**"Model C: Pre-compute, then O(1) lookup. Don't search, just look up."**
