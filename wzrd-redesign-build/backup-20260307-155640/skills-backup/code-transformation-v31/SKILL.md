# Code Transformation V31 Skill

> **Purpose:** Transform scanner code to V31 gold standard format
> **Category:** Coding / Trading
> **Last Updated:** 2026-02-28 (v3.0 - Added Model C support + Incremental workflow + Complexity check)

---

## Overview

Transforms trading scanner code from non-standard format to V31 gold standard. V31 is the production-ready scanner architecture used in edge.dev with full market coverage (NYSE, NASDAQ, ETFs), 3-stage pipeline, and performance optimizations.

---

## CRITICAL: Two Metric Computation Models

V31 transformation must detect and handle **two fundamentally different metric computation models**:

### Model A: Pre-Shifted Metrics (DailyGapScanner pattern)

**Characteristics:**
- All metrics are pre-shifted with `.shift(1)` before pattern detection
- Pattern detection iterates through shifted columns
- D0 metrics access current row, D-1 metrics access previous row's shifted columns

**Example (Original):**
```python
# Stage 1: Pre-shift ALL metrics
group['open_over_ema9'] = group['open'].shift(1) / group['ema_9'].shift(1)
group['high_over_ema9_div_atr'] = (group['high'].shift(1) - group['ema_9'].shift(1)) / group['atr']
group['tr_prev'] = group['tr'].shift(1)  # D-1's TR
group['atr_raw'] = group['tr'].rolling(30).mean()
group['atr'] = group['atr_raw'].shift(1)  # D-1's ATR

# Stage 2: Pattern detection accesses pre-shifted columns
for i in range(2, len(group)):
    r0 = group.iloc[i]       # D0 (current row)
    r1 = group.iloc[i-1]     # D-1 (previous row)

    # r1 contains D-1 values from shifted columns
    if not (r0['open'] > r1['high']):  # r1['high'] = D-1's high (not prev_high!)
        continue

    # D-1 conditions use r1's shifted metrics
    if r1['open_over_ema9'] < params['min']:
        continue
```

**V31 Transformation (Model A):**
```python
# NO CHANGE - preserve pre-shifted structure
group['open_over_ema9'] = group['open'].shift(1) / group['ema_9'].shift(1)
group['tr_prev'] = group['tr'].shift(1)
group['atr_raw'] = group['tr'].rolling(30).mean()
group['atr'] = group['atr_raw'].shift(1)

# Pattern detection: Use r1['high'] (NOT r1['prev_high'])
if not (r0['open'] > r1['high']):  # ✅ D-1's actual high
    continue
```

---

### Model B: Row-Iteration Metrics (Backside B pattern)

**Characteristics:**
- D0 metrics (gap, EMA ratios, body) computed on CURRENT row (NOT shifted)
- Only ATR and Volume use `.shift(1)` because they represent D-1 values
- Pattern detection accesses rows directly (r0 = current, r1 = previous)

**Example (Original):**
```python
# Compute D0 metrics on CURRENT row (unshifted!)
m["Gap_abs"]       = (m["Open"] - m["Close"].shift(1)).abs()
m["Gap_over_ATR"]  = m["Gap_abs"] / m["ATR"]
m["Open_over_EMA9"]= m["Open"] / m["EMA_9"]
m["Body_over_ATR"] = (m["Close"] - m["Open"]) / m["ATR"]

# ATR and Volume ARE shifted (represent D-1)
m["ATR_raw"]      = m["TR"].rolling(14).mean()
m["ATR"]          = m["ATR_raw"].shift(1)
m["VOL_AVG"]      = m["Volume"].rolling(14).mean().shift(1)

# Pattern detection - access rows directly
for i in range(2, len(m)):
    d0 = m.index[i]
    r0 = m.iloc[i]       # D0 (current row)
    r1 = m.iloc[i-1]     # D-1 (previous row)

    # D0 gates - use r0 directly (current day values)
    if pd.isna(r0["Gap_over_ATR"]) or r0["Gap_over_ATR"] < P["gap_div_atr_min"]:
        continue
    if not (r0["Open"] > r1["High"]):  # Compare D0 Open to D-1 High
        continue
    if pd.isna(r0["Open_over_EMA9"]) or r0["Open_over_EMA9"] < P["open_over_ema9_min"]:
        continue

    # D-1 conditions use r1 directly (previous row values)
    if r1["Slope_9_5d"] < P["slope5d_min"]:
        continue
```

**V31 Transformation (Model B):**
```python
# ✅ PRESERVE: D0 metrics on CURRENT row (NO shift)
group['gap_abs'] = (group['open'] - group['close'].shift(1)).abs()
group['gap_over_atr'] = group['gap_abs'] / group['atr']
group['open_over_ema9'] = group['open'] / group['ema_9']  # NO shift!
group['body_over_atr'] = (group['close'] - group['open']) / group['atr']

# ✅ PRESERVE: ATR and Volume ARE shifted (D-1 values)
group['tr'] = pd.concat([hi_lo, hi_prev, lo_prev], axis=1).max(axis=1)
group['atr_raw'] = group['tr'].rolling(14, min_periods=14).mean()
group['atr'] = group['atr_raw'].shift(1)
group['vol_avg'] = group['volume'].rolling(14, min_periods=14).mean().shift(1)

# Pattern detection: Use r0['gap_over_atr'] (current row), r1['high'] (D-1's high)
if pd.isna(r0['gap_over_atr']) or r0['gap_over_atr'] < self.params['gap_div_atr_min']:
    continue
if not (r0['open'] > r1['high']):  # ✅ D-1's actual high (from r1)
    continue
if pd.isna(r0['open_over_ema9']) or r0['open_over_ema9'] < self.params['open_over_ema9_min']:
    continue
```

---

### Key Differences Summary

| Aspect | Model A (Pre-Shifted) | Model B (Row-Iteration) |
|--------|----------------------|-------------------------|
| **D0 Gap metric** | Pre-shifted: `gap.shift(1)` | Current row: `gap` |
| **D0 EMA ratio** | Pre-shifted: `open_over_ema9.shift(1)` | Current row: `open_over_ema9` |
| **ATR** | Pre-shifted: `atr_raw.shift(1)` | Pre-shifted: `atr_raw.shift(1)` |
| **Volume avg** | Pre-shifted: `vol_avg.shift(1)` | Pre-shifted: `vol_avg.shift(1)` |
| **Gap-up check** | `r0['open'] > r1['high']` | `r0['open'] > r1['high']` |
| **D-1 condition** | `r1['open_over_ema9']` | `r1['slope_9_5d']` (row metric) |

**Critical Rule:** D0 gap/EMA/body metrics are computed on the CURRENT row in Model B, but pre-shifted in Model A.

---

### Model C: Dynamic Level Selection (FBO scan pattern) ⚠️ COMPLEX

**Characteristics:**
- For EACH D0 date, must look back 1000+ days to find a "significant high" level
- Uses pivot high detection within that window
- Computes significance metrics (abs position, percentile, prominence) per candidate
- Level selection is dynamic (different level for each D0 date)
- Requires complex window-based calculations

**V31 Transformation (Model C) - OPTIMIZED:**
```python
# Pre-compute all pivots ONCE per ticker (O(n) not O(n×1000))
def compute_pivot_levels(self, df: pd.DataFrame) -> pd.DataFrame:
    g = df.groupby('ticker', sort=False)
    all_pivots = []
    for ticker, group in g:
        h = group['high'].values
        idx = group.index
        left = self.params['pivot_left']
        right = self.params['pivot_right']
        pivots = []
        for i in range(left, len(h) - right):
            lv = h[i-left:i].max() if left > 0 else -np.inf
            rv = h[i+1:i+1+right].max() if right > 0 else -np.inf
            if np.isfinite(h[i]) and h[i] >= lv and h[i] > rv:
                pivots.append((idx[i], h[i]))
        if pivots:
            pivot_df = pd.DataFrame(pivots, columns=['date', 'pivot_high'])
            pivot_df['ticker'] = ticker
            all_pivots.append(pivot_df)
    return pd.concat(all_pivots, ignore_index=True) if all_pivots else pd.DataFrame()

# O(1) lookup instead of O(1000) search per D0
def get_level_date_for_d0(self, d0_date: pd.Timestamp, pivot_df: pd.DataFrame, ticker: str):
    ticker_pivots = pivot_df[pivot_df['ticker'] == ticker]
    if ticker_pivots.empty:
        return None
    prior_pivots = ticker_pivots[ticker_pivots['date'] < d0_date]
    if prior_pivots.empty:
        return None
    min_days = self.params['min_trade_days_between']
    cutoff = d0_date - pd.Timedelta(days=min_days)
    valid_pivots = prior_pivots[prior_pivots['date'] <= cutoff]
    if valid_pivots.empty:
        return None
    return valid_pivots.iloc[-1]['date']
```

**Model C Detection:**
```python
model_c_indicators = [
    "lookback_days_for_level", "pick_level_date", "_pivot_high_dates",
    "significance_metrics", "min_trade_days_between"
]
```

---

## When to Use This Skill

Use when you have:
- A scanner with hardcoded symbol lists
- Per-ticker API fetching (slow)
- Global variables instead of class structure
- CamelCase naming conventions
- Missing smart filters
- No progress tracking
- Script-style architecture

---

## COMPLEXITY CHECK (Pre-Transformation) ⚠️ CRITICAL (2026-02-28)

**Before attempting transformation, ALWAYS check code complexity:**

```python
def detect_complexity(original_code: str) -> dict:
    """Detect transformation complexity and timeout risks"""
    complexity = {
        'model': 'UNKNOWN',
        'risk_level': 'LOW',
        'requires_incremental': False,
    }

    # Model C detection (FBO-like scanners)
    model_c_indicators = [
        "lookback_days_for_level", "pick_level_date",
        "_pivot_high_dates", "significance_metrics"
    ]
    model_c_score = sum(1 for ind in model_c_indicators if ind in original_code)

    if model_c_score >= 3:
        complexity['model'] = 'MODEL_C'
        complexity['risk_level'] = 'HIGH'
        complexity['requires_incremental'] = True

    if len(original_code.split('\n')) > 400:
        complexity['risk_level'] = 'MEDIUM'
        complexity['requires_incremental'] = True

    return complexity
```

### Incremental Workflow (Required for MEDIUM/HIGH Complexity)

**Stage-by-Stage Transformation:**
1. Class Structure Only → Save & Validate
2. Data Fetching → Test connectivity
3. Simple Features → Test with sample
4. Smart Filters → Verify logic
5. Indicators → Check index alignment
6. Patterns → Test detection
7. Integration → Full E2E test

---

## Model Detection Rules

### Step 1: Detect Which Model the Original Code Uses

**Before transforming, analyze the original code to identify the metric computation model:**

```python
def detect_metric_model(original_code: str) -> str:
    """Detect whether original uses Model A, Model B, or Model C"""

    # Model C Detection: Dynamic level selection (FBO pattern)
    model_c_indicators = [
        "lookback_days_for_level",
        "pick_level_date",
        "_pivot_high_dates",
        "significance_metrics",
        "min_trade_days_between",
    ]
    model_c_score = sum(1 for ind in model_c_indicators if ind in original_code)

    if model_c_score >= 3:
        return "MODEL_C_DYNAMIC_LEVEL"

    # Model A Detection: Pre-shifted metrics
    pre_shifted_indicators = [
        "m['open_over_ema9'] = m['Open'].shift(1) / m['EMA_9'].shift(1)",
        "df['open_over_ema9'] = df['open'].shift(1) / df['ema_9'].shift(1)",
        "m['High_over_EMA9_div_ATR'] = (m['High'].shift(1) - m['EMA_9'].shift(1)) / m['ATR']",
    ]

    # Model B Detection: Row-iteration (D0 metrics unshifted)
    row_iteration_indicators = [
        "m['Gap_over_ATR'] = m['Gap_abs'] / m['ATR']",  # Gap not shifted
        "m['Open_over_EMA9'] = m['Open'] / m['EMA_9']",  # Ratio not shifted
        "m['Body_over_ATR'] = (m['Close'] - m['Open']) / m['ATR']",  # Body not shifted
        "m['Gap_abs'] = (m['Open'] - m['Close'].shift(1)).abs()",  # Gap uses unshifted Open
    ]

    model_a_score = sum(1 for pattern in pre_shifted_indicators if pattern in original_code)
    model_b_score = sum(1 for pattern in row_iteration_indicators if pattern in original_code)

    if model_a_score > model_b_score:
        return "MODEL_A_PRE_SHIFTED"
    elif model_b_score > model_a_score:
        return "MODEL_B_ROW_ITERATION"
    else:
        return "UNKNOWN"  # Manual review required
```

### Step 2: Apply Correct Transformation Rules

**After detection, use the appropriate transformation template:**

| Model | D0 Gap/EMA Metrics | ATR/Volume Metrics | Gap-Up Check |
|-------|-------------------|-------------------|--------------|
| **Model A** | Pre-shifted with `.shift(1)` | Pre-shifted with `.shift(1)` | `r0['open'] > r1['high']` |
| **Model B** | Current row (NO shift) | Pre-shifted with `.shift(1)` | `r0['open'] > r1['high']` |

### Step 3: Validate Transformation

**After transformation, validate that the metric logic matches the original:**

```python
def validate_model_b_transformation(original: str, transformed: str) -> list[str]:
    """Validate Model B transformation preserves row-iteration logic"""
    errors = []

    # Check 1: D0 gap metric should NOT be shifted
    if "group['gap_abs'] = group['open'].shift(1)" in transformed:
        errors.append("Model B bug: D0 gap should use current row, not shifted")

    # Check 2: D0 EMA ratio should NOT be shifted
    if "group['open_over_ema9'] = group['open'].shift(1) / group['ema_9'].shift(1)" in transformed:
        errors.append("Model B bug: D0 open_over_ema9 should use current row")

    # Check 3: ATR should still be shifted
    if "group['atr'] = group['atr_raw']" in transformed and "shift(1)" not in transformed.split("atr']")[0]:
        errors.append("Model B bug: ATR must be shifted (represents D-1)")

    # Check 4: Gap-up uses r1['high'] (not prev_high)
    if "r1['prev_high']" in transformed or 'r1["prev_high"]' in transformed:
        errors.append("Critical bug: Use r1['high'] for D-1, not prev_high")

    return errors
```

---

## V31 Gold Standard Checklist

### Architecture
- [ ] Class-based scanner with `__init__` and `run_scan()`
- [ ] 3-stage pipeline: fetch → simple features → smart filters → full features → detect
- [ ] Session pooling for API efficiency

### Data Coverage
- [ ] **CRITICAL:** Uses grouped endpoint for full market coverage
- [ ] No hardcoded symbol lists
- [ ] Covers NYSE, NASDAQ, and ETFs automatically

### Smart Filters
- [ ] Separates historical data from output range
- [ ] Applies filters ONLY to D0 dates
- [ ] Preserves all historical data for ABS window calculations
- [ ] Minimum 100 days data requirement

### Code Quality
- [ ] All variables in snake_case
- [ ] Type hints on all methods
- [ ] Comprehensive docstrings
- [ ] Progress tracking with emojis
- [ ] Timing per stage

### Performance
- [ ] Pre-slicing with `groupby()` before parallel processing
- [ ] ThreadPoolExecutor for parallel execution
- [ ] ETA calculations

---

## Transformation Rules

### 1. Architecture: Script → Class

**Before:**
```python
# Global variables
API_KEY = "..."
SYMBOLS = [...]
P = {...}

def scan_symbol(sym: str, start: str, end: str):
    ...

if __name__ == "__main__":
    results = []
    for s in SYMBOLS:
        results.append(scan_symbol(s, start, end))
```

**After:**
```python
class BacksideBScanner:
    def __init__(self, api_key: str, d0_start: str, d0_end: str):
        self.d0_start_user = d0_start
        self.d0_end_user = d0_end

        lookback_buffer = 1000 + 50
        scan_start_dt = pd.to_datetime(self.d0_start_user) - pd.Timedelta(days=lookback_buffer)
        self.scan_start = scan_start_dt.strftime('%Y-%m-%d')
        self.d0_end = self.d0_end_user

        self.api_key = api_key
        self.base_url = "https://api.polygon.io"

        self.session = requests.Session()
        self.session.mount('https://', requests.adapters.HTTPAdapter(
            pool_connections=100,
            pool_maxsize=100,
            max_retries=2,
            pool_block=False
        ))

        self.params = {...}

    def run_scan(self):
        stage1 = self.fetch_grouped_data()
        stage2a = self.compute_simple_features(stage1)
        stage2b = self.apply_smart_filters(stage2a)
        stage3a = self.compute_full_features(stage2b)
        stage3 = self.detect_patterns(stage3a)
        return stage3
```

### 2. Data Fetching: Per-Ticker → Grouped Endpoint

**Before:**
```python
SYMBOLS = ['EW', 'JAMF', 'VNET', ...]  # Hardcoded!

def fetch_daily(tkr: str, start: str, end: str) -> pd.DataFrame:
    url = f"{BASE_URL}/v2/aggs/ticker/{tkr}/range/1/day/{start}/{end}"
    r = session.get(url, params={"apiKey": API_KEY})
    ...
```

**After:**
```python
# ✅ NO hardcoded symbols - full market coverage
def fetch_grouped_data(self) -> pd.DataFrame:
    """Fetch all tickers for all trading days using grouped endpoint"""
    nyse = mcal.get_calendar('NYSE')
    trading_dates = nyse.schedule(
        start_date=self.scan_start,
        end_date=self.d0_end
    ).index.strftime('%Y-%m-%d').tolist()

    all_data = []
    with ThreadPoolExecutor(max_workers=5) as executor:
        future_to_date = {
            executor.submit(self._fetch_grouped_day, date_str): date_str
            for date_str in trading_dates
        }
        for future in as_completed(future_to_date):
            data = future.result()
            if data is not None and not data.empty:
                all_data.append(data)

    return pd.concat(all_data, ignore_index=True)

def _fetch_grouped_day(self, date_str: str):
    """Fetch ALL tickers for a single day"""
    url = f"{self.base_url}/v2/aggs/grouped/locale/us/market/stocks/{date_str}"
    response = self.session.get(url, params={'apiKey': self.api_key, 'adjust': 'true'})
    ...
```

### 3. Naming: CamelCase → snake_case

| Original | V31 |
|----------|-----|
| `EMA_9`, `EMA_20` | `ema_9`, `ema_20` |
| `ATR_raw`, `ATR` | `atr_raw`, `atr` |
| `VOL_AVG`, `Prev_Volume` | `vol_avg`, `prev_volume` |
| `Gap_over_ATR` | `gap_over_atr` |
| `Body_over_ATR` | `body_over_atr` |
| `Open_over_EMA9` | `open_over_ema9` |
| `High_over_EMA9_div_ATR` | `high_over_ema9_div_atr` |

### 4. Smart Filters (CRITICAL)

**Before:** No smart filtering concept

**After:**
```python
def apply_smart_filters(self, df: pd.DataFrame):
    """✅ FIXED: Smart filters validate D0 dates, NOT filter entire ticker history

    CRITICAL: Always filter FROM df_output_range (source), not df_output_filtered (being created)
    """
    df = df.dropna(subset=['prev_close', 'adv20_usd', 'price_range'])

    # Separate historical from output range
    df_historical = df[~df['date'].between(self.d0_start_user, self.d0_end_user)].copy()
    df_output_range = df[df['date'].between(self.d0_start_user, self.d0_end_user)].copy()

    # Apply filters ONLY to D0 dates
    # ✅ CORRECT: Use df_output_range (source) - do NOT use df_output_filtered here!
    df_output_filtered = df_output_range[
        (df_output_range['prev_close'] >= self.params['price_min']) &
        (df_output_range['adv20_usd'] >= self.params['adv20_min_usd']) &
        (df_output_range['price_range'] >= 0.50) &
        (df_output_range['volume'] >= 1_000_000)
    ].copy()

    # Combine ALL historical data + filtered D0 dates
    df_combined = pd.concat([df_historical, df_output_filtered], ignore_index=True)

    # Only keep tickers with at least 1 valid D0 date
    tickers_with_valid_d0 = df_output_filtered['ticker'].unique()
    df_combined = df_combined[df_combined['ticker'].isin(tickers_with_valid_d0)]

    return df_combined
```

### 5. Pre-Slicing Optimization

**Before:**
```python
for ticker in unique_tickers:
    ticker_df = df[df['ticker'] == ticker]  # O(n×m) scanning!
    process(ticker_df)
```

**After:**
```python
# Pre-slice once - O(n) complexity
ticker_data_list = []
for ticker, ticker_df in df.groupby('ticker'):
    ticker_data_list.append((ticker, ticker_df.copy(), d0_start_dt, d0_end_dt))

# Parallel process pre-sliced data
with ThreadPoolExecutor(max_workers=10) as executor:
    future_to_ticker = {
        executor.submit(self._process_ticker, ticker_data): ticker_data[0]
        for ticker_data in ticker_data_list
    }
```

### 6. Progress Tracking

**Before:**
```python
print("Scanning...")
```

**After:**
```python
print(f"\n{'='*70}")
print(f"📥 STAGE 1: FETCHING GROUPED DATA")
print(f"{'='*70}")

if completed % 10 == 0:
    print(f"  ⏳ Fetched {completed}/{len(trading_dates)} days ({completed/len(trading_dates)*100:.0f}%)")

total_time = time.time() - start_time
print(f"⏱️  Total time: {total_time:.2f}s")
```

---

## Output Format

Transformed code should return:

```python
results.append({
    'ticker': ticker,
    'date': d0.strftime('%Y-%m-%d'),
    'trigger': trig_tag,
    'close': round(float(r0['close']), 2),
    'volume': int(r0['volume']),
    'confidence': 0.95,  # Optional
    # ... pattern-specific fields
})
```

---

## Common Issues & Fixes

### Issue: Per-ticker symbol list
**Fix:** Replace with grouped endpoint `/v2/aggs/grouped/locale/us/market/stocks/{date}`

### Issue: Smart filters dropping historical data
**Fix:** Separate `df_historical` and `df_output_range`, combine after filtering

### Issue: Slow parallel processing
**Fix:** Pre-slice with `groupby()` before ThreadPoolExecutor

### Issue: ADV20 computed across all tickers
**Fix:** Use `transform()` to compute per-ticker:
```python
df['adv20_usd'] = (df['close'] * df['volume']).groupby(df['ticker']).transform(
    lambda x: x.rolling(window=20, min_periods=20).mean()
)
```

### Issue: Missing 100-day minimum check
**Fix:** Add early exit:
```python
if len(ticker_df) < 100:
    return []
```

### Issue: Pandas Index Mismatch (Grouped Rolling Operations) ⚠️ CRITICAL NEW (2026-02-28)
**Case Study: BacksideParaB_v31 Stage 3a Bug**

**The Bug:**
```
TypeError: incompatible index of inserted column with frame index
```

**Root Cause:**
Grouped rolling operations return results with a MultiIndex that doesn't align with the original DataFrame index.

```python
# ❌ BUGGY - Grouped rolling creates MultiIndex, causes index mismatch
df['atr_raw'] = g['tr'].rolling(14, min_periods=14).mean()
# Result: MultiIndex that doesn't match df.index → TypeError

# ✅ CORRECT - Use transform() for proper index alignment
df['atr_raw'] = g['tr'].transform(lambda x: x.rolling(14, min_periods=14).mean())
# Result: Index properly aligned with original DataFrame
```

**The Fix Pattern - Use `transform(lambda x: ...)` for ALL grouped rolling:**

```python
# ✅ EMAs
df['ema_9'] = g['c'].transform(lambda x: x.ewm(span=9, adjust=False).mean())
df['ema_20'] = g['c'].transform(lambda x: x.ewm(span=20, adjust=False).mean())

# ✅ ATR
df['atr_raw'] = g['tr'].transform(lambda x: x.rolling(14, min_periods=14).mean())

# ✅ Volume Average
df['vol_avg'] = g['v'].transform(lambda x: x.rolling(14, min_periods=14).mean())

# ✅ ADV20
df['adv20_usd'] = (df['c'] * df['v']).groupby(df['ticker']).transform(
    lambda x: x.rolling(window=20, min_periods=20).mean()
)
```

**Rule: For ANY grouped rolling/ewm operation, use `.transform(lambda x: ...)` pattern.**

**Detection Pattern:**
```python
# Pattern: Grouped rolling without transform
if re.search(r"g\[.+\.transform\(lambda x: x\.rolling\(", code):
    # OK - proper index alignment
    pass
elif re.search(r"g\[.+\.rolling\([^)]+\)\.(?:mean|std|sum)", code):
    raise ValidationError(
        "Index mismatch bug: Use transform(lambda x: x.rolling(...)) "
        "for grouped rolling operations"
    )
```

---

## Example Usage

### Input: Original scanner with hardcoded symbols
### Output: V31 class with full market coverage

The skill will:
1. Extract pattern logic (entry/exit conditions)
2. Extract parameters
3. Create V31 class structure
4. Replace symbol list with grouped endpoint
5. Add smart filters
6. Add progress tracking
7. Apply naming conventions
8. Add type hints and docstrings

---

## References

- V31 example: `Backside_B_scanner_31.py`
- Original example: `backside_para_b_copy_3.py`
- Gold standard memory: `~/.claude/projects/-home-mdwzrd/memory/renata/MEMORY.md`

---

## Status

- ✅ Transformation rules documented
- ✅ Checklist created
- ✅ Common issues covered
- ✅ Example references provided
- ✅ D-1 alignment validation added (2026-02-26)
- ✅ Error logging system implemented (2026-02-26)
- ✅ Index alignment bug documented (2026-02-28)
- ✅ **Model C support added (2026-02-28)**
- ✅ **Complexity detection added (2026-02-28)**
- ✅ **Incremental workflow documented (2026-02-28)**

---

## VALIDATION GUARDRAILS (REQUIRED)

### ⚠️ CRITICAL: Self-Reference Bug Prevention

**Case Study: DailyGapScanner_v31 Bug (2026-02-26)**

**The Bug:**
```python
# ❌ BUGGY CODE - Line 343-348
df_output_filtered = df_output_range[
    (df_output_filtered['prev_close'] >= self.params['price_min']) &  # UnboundLocalError!
    (df_output_filtered['adv20_usd'] >= self.params['adv20_min_usd']) &
    (df_output_filtered['price_range'] >= 0.50) &
    (df_output_filtered['volume'] >= 1_000_000)
].copy()
```

**The Error:**
```
UnboundLocalError: cannot access local variable 'df_output_filtered'
where it is not associated with a value
```

**Root Cause:**
- Variable `df_output_filtered` is being **assigned** on line 343 (left side)
- Inside the same line, the code tries to **read** `df_output_filtered['prev_close']` (right side)
- Python throws UnboundLocalError because the variable doesn't exist yet
- This is a **copy-paste/substitution error** from templates

**The Fix:**
```python
# ✅ CORRECT CODE - Use df_output_range (source) not df_output_filtered (being created)
df_output_filtered = df_output_range[
    (df_output_range['prev_close'] >= self.params['price_min']) &  # Correct!
    (df_output_range['adv20_usd'] >= self.params['adv20_min_usd']) &
    (df_output_range['price_range'] >= 0.50) &
    (df_output_range['volume'] >= 1_000_000)
].copy()
```

**Rule: When filtering dataframes, always filter FROM the source, not INTO the same name.**

---

### Index Alignment Validation (CRITICAL - 2026-02-28)

**Pandas Grouped Rolling Index Mismatch Bug**

**The Bug:**
```python
# ❌ BUGGY CODE - Creates MultiIndex mismatch
df['atr_raw'] = g['tr'].rolling(14, min_periods=14).mean()
# TypeError: incompatible index of inserted column with frame index
```

**The Fix:**
```python
# ✅ CORRECT CODE - Uses transform for proper index alignment
df['atr_raw'] = g['tr'].transform(lambda x: x.rolling(14, min_periods=14).mean())
```

**Why This Happens:**
- `g['tr'].rolling().mean()` returns a MultiIndex (ticker, date)
- Original DataFrame has a different index structure
- Assignment fails due to index mismatch

**Rule: ALL grouped rolling/ewm operations MUST use `.transform(lambda x: ...)`**

**Validation Pattern:**
```python
# Check for grouped rolling without transform
dangerous_patterns = [
    r"g\[.+\.rolling\([^)]+\)\.mean\(\)",  # g['tr'].rolling().mean()
    r"g\[.+\.rolling\([^)]+\)\.std\(\)",   # g['tr'].rolling().std()
    r"g\[.+\.rolling\([^)]+\)\.sum\(\)",   # g['tr'].rolling().sum()
    r"g\[.+\.ewm\([^)]+\)\.mean\(\)",     # g['c'].ewm().mean()
]

for pattern in dangerous_patterns:
    if re.search(pattern, code):
        raise ValidationError(
            f"Index mismatch bug: Use transform(lambda x: ...) "
            f"for grouped operations. Pattern found: {pattern}"
        )

# Verify transform is used for grouped operations
safe_patterns = [
    r"g\[.+\.transform\(lambda x: x\.rolling",
    r"g\[.+\.transform\(lambda x: x\.ewm",
]

safe_code = any(re.search(p, code) for p in safe_patterns)

if "g = df.groupby" in code and not safe_code:
    raise ValidationError(
        "Grouped operations found but no transform() used. "
        "May cause index mismatch errors."
    )
```

### Pre-Return Validation Checklist

Before returning any transformed code, the skill MUST validate:

```python
# 1. Variable Reference Check (self-reference bug)
dangerous_pattern = re.compile(r"(\w+)\s*=\s*\1\[")
for line_num, line in enumerate(generated_code.split('\n'), 1):
    if dangerous_pattern.search(line):
        raise ValidationError(f"Self-reference bug on line {line_num}: {line.strip()}")

# 2. Syntax Check
try:
    ast.parse(generated_code)
except SyntaxError as e:
    raise ValidationError(f"Syntax error: {e}")

# 3. Import Check
required_imports = ['pandas', 'requests', 'datetime', 'concurrent.futures']
for imp in required_imports:
    if imp not in generated_code:
        raise ValidationError(f"Missing required import: {imp}")

# 4. V31 Architecture Check
checks = {
    'Class-based': 'class Scanner' in generated_code,
    'Grouped endpoint': '/grouped/locale/us/market/stocks' in generated_code,
    'Smart filters': 'apply_smart_filters' in generated_code,
    'Snake_case': 'df_output_range[' in generated_code and 'df_output_filtered[' not in generated_code,
    '100-day min': 'len(ticker_df) < 100' in generated_code or 'minimum data requirement' in generated_code,
    'Index alignment': 'transform(lambda x: x.rolling' in generated_code or 'transform(lambda x: x.ewm' in generated_code,
}
for check_name, passed in checks.items():
    if not passed:
        raise ValidationError(f"V31 requirement failed: {check_name}")

# 5. Smart Filter Variable Check
# Ensure smart filters use df_output_range, not df_output_filtered
lines = generated_code.split('\n')
for i, line in enumerate(lines):
    if 'df_output_filtered = df_output_range[' in line:
        # Check next few lines for the bug pattern
        for j in range(i, min(i+5, len(lines))):
            if 'df_output_filtered[' in lines[j]:
                raise ValidationError(f"Smart filter self-reference bug detected at line {j+1}")
```

---

### Known Bug Patterns to Catch

| Pattern | Description | Detection |
|---------|-------------|-----------|
| `x = x[` | Self-reference in assignment | Regex `(\w+)\s*=\s*\1\[` |
| `for x in x` | Self-reference in loop | Regex `for\s+(\w+)\s+in\s+\1` |
| `df_output_filtered` in smart filters | Wrong variable name | Context check after assignment |
| `SYMBOLS = [` | Hardcoded symbols | Pattern check |
| CamelCase variables | Naming violation | `EMA_\d+`, `ATR_`, `VOL_` patterns |
| `prev_high` in gap condition | Wrong D-1 high reference | Gap-up check pattern validation |
| Missing `.shift(1)` on D-1 metrics | D-1 alignment bug | Check metric computation |
| Grouped rolling without transform | Index mismatch bug | `g['x'].rolling().mean()` pattern |
| Grouped ewm without transform | Index mismatch bug | `g['x'].ewm().mean()` pattern |

---

### D-1 Alignment Validation (CRITICAL)

**CRITICAL DISTINCTION:** Validation rules differ by metric computation model!

---

### Model A Validation (Pre-Shifted Metrics)

**Case Study: DailyGapScanner_v31 D-1 Bugs (2026-02-26)**

**Bug 1: Gap Condition Using Wrong High**

**Bug 1: Gap Condition Using Wrong High**
```python
# ❌ BUGGY CODE - Uses D-2's high (prev_high was shifted twice!)
if not (r0['open'] > r1['prev_high']):  # WRONG - this is D-2's high
    continue

# ✅ CORRECT CODE - Use D-1's actual high
if not (r0['open'] > r1['high']):  # D-1's real high
    continue
```

**Bug 2: D-1 Metric Shift Issues**
```python
# ❌ BUGGY CODE - Uses current row values, not D-1
group['open_over_ema9'] = group['open'] / group['ema_9']

# ✅ CORRECT CODE - Both shifted for D-1 alignment
group['open_over_ema9'] = group['open'].shift(1) / group['ema_9'].shift(1)
```

**Bug 3: ATR/TR Computation Order**
```python
# ❌ BUGGY CODE - Wrong order causes TR to include ATR in calculation
group['atr_raw'] = group['tr'].rolling(window=30, min_periods=30).mean()
group['tr_prev'] = group['tr'].shift(1)  # Too late!
group['atr'] = group['atr_raw'].shift(1)

# ✅ CORRECT CODE - TR must be computed and shifted before ATR
group['tr_prev'] = group['tr'].shift(1)  # First: D-1's TR
group['atr_raw'] = group['tr'].rolling(window=30, min_periods=30).mean()
group['atr'] = group['atr_raw'].shift(1)  # Then: D-1's ATR
```

**Validation Rule: All D-1 metrics must be computed from properly shifted columns.**

**D-1 Metric Checklist:**
```python
# Verify these are ALL shifted by 1 for D-1 alignment:
D1_METRICS = [
    'high', 'low', 'close', 'open',  # Raw OHLC from D-1
    'ema_9', 'ema_20',                # EMA values through D-1
    'tr',                            # True Range through D-1
    'atr',                           # ATR through D-1
    'vol_avg',                       # Volume avg through D-1
    'slope_9_3d',                    # Slope ending D-1
    'gap_over_atr',                  # Gap calc using D-1 ATR
    'high_over_ema9_div_atr',        # Using D-1 high and EMA
    'open_over_ema9',                # Using D-1 open and EMA
]
```

**Gap-Up Condition Validation:**
```python
# Gap-up must compare D0's open to D-1's HIGH (not prev_high!)
# ❌ WRONG: prev_high = high.shift(1) = D-2's high
# ✅ RIGHT:  high (from row i-1) = D-1's high
```

**Detection Patterns:**
```python
# Pattern 1: prev_high used in gap check
if 'r1[\'prev_high\']' in code or 'r1["prev_high"]' in code:
    raise ValidationError("Use r1['high'] for D-1 high, not prev_high")

# Pattern 2: Missing shift on ratio metrics (MODEL A ONLY)
if "group['open_over_ema9'] = group['open'] / group['ema_9']" in code:
    raise ValidationError("Missing .shift(1) on D-1 metric open_over_ema9 (Model A)")

# Pattern 3: Wrong ATR computation order
if re.search(r"group\['atr_raw'\].*group\['tr_prev'\]", code):
    raise ValidationError("tr_prev must be computed before atr_raw")
```

---

### Model B Validation (Row-Iteration Metrics) ⚠️ NEW

**Case Study: Backside B V31 Transformation Bug (2026-02-26)**

**Bug 1: D0 Gap Metric Incorrectly Shifted**
```python
# ❌ BUGGY CODE - D0 gap should NOT be shifted in Model B!
group['gap_abs'] = group['open'].shift(1) - group['close'].shift(2)  # WRONG!
group['gap_over_atr'] = group['gap_abs'].shift(1) / group['atr']  # WRONG!

# ✅ CORRECT CODE - D0 gap uses CURRENT row values
group['gap_abs'] = (group['open'] - group['close'].shift(1)).abs()  # Current Open, D-1 Close
group['gap_over_atr'] = group['gap_abs'] / group['atr']  # NO shift!
```

**Bug 2: D0 EMA Ratio Incorrectly Shifted**
```python
# ❌ BUGGY CODE - D0 EMA ratio should NOT be shifted in Model B!
group['open_over_ema9'] = group['open'].shift(1) / group['ema_9'].shift(1)  # WRONG!

# ✅ CORRECT CODE - D0 EMA ratio uses CURRENT row values
group['open_over_ema9'] = group['open'] / group['ema_9']  # NO shift!
```

**Bug 3: Gap Condition Still Uses Wrong High**
```python
# ❌ BUGGY CODE - prev_high is D-2's high!
if not (r0['open'] > r1['prev_high']):  # WRONG - this is D-2's high
    continue

# ✅ CORRECT CODE - Use D-1's actual high
if not (r0['open'] > r1['high']):  # D-1's real high
    continue
```

**Model B Transformation Rules:**

| Metric | Original Behavior | V31 Must Match |
|--------|------------------|---------------|
| D0 Gap `gap_abs` | `(Open - Close.shift(1))` | `(open - close.shift(1))` - **NO shift** |
| D0 Gap/ATR `gap_over_atr` | `Gap_abs / ATR` | `gap_abs / atr` - **NO shift** |
| D0 Open/EMA9 `open_over_ema9` | `Open / EMA_9` | `open / ema_9` - **NO shift** |
| D0 Body/ATR `body_over_atr` | `(Close - Open) / ATR` | `(close - open) / atr` - **NO shift** |
| D-1 ATR `atr` | `ATR_raw.shift(1)` | `atr_raw.shift(1)` - **YES shift** |
| D-1 Vol Avg `vol_avg` | `Volume.rolling().mean().shift(1)` | `volume.rolling().mean().shift(1)` - **YES shift** |

**Model B Detection Patterns:**
```python
# Pattern 1: D0 gap metric incorrectly shifted
if "group['gap_abs'].shift(1)" in code or "group['gap_over_atr'].shift(1)" in code:
    raise ValidationError("Model B bug: D0 gap metrics should NOT be shifted")

# Pattern 2: D0 EMA ratio incorrectly shifted
if "group['open_over_ema9'] = group['open'].shift(1)" in code:
    raise ValidationError("Model B bug: D0 open_over_ema9 should NOT be shifted")

# Pattern 3: D0 body/ATR incorrectly shifted
if "group['body_over_atr'] = group['body_over_atr'].shift(1)" in code:
    raise ValidationError("Model B bug: D0 body_over_atr should NOT be shifted")

# Pattern 4: ATR missing shift (Model B)
if "group['atr'] = group['atr_raw']" in code and ".shift(1)" not in code.split("atr']")[0]:
    raise ValidationError("Model B bug: ATR must be shifted (represents D-1)")

# Pattern 5: Vol avg missing shift (Model B)
if "group['vol_avg'] = group['volume'].rolling" in code and ".shift(1)" not in code.split("vol_avg']")[0]:
    raise ValidationError("Model B bug: vol_avg must be shifted (represents D-1)")

# Pattern 6: Gap-up uses prev_high (CRITICAL - applies to BOTH models)
if "r1['prev_high']" in code or 'r1["prev_high"]' in code:
    raise ValidationError("Critical bug: Use r1['high'] for D-1, not prev_high")
```

**Model B Validation Checklist:**
```python
def validate_model_b(code: str) -> list[str]:
    """Validate Model B (row-iteration) transformation"""
    errors = []

    # D0 metrics should NOT be shifted
    if "group['gap_abs'] = (group['open'].shift(1)" in code:
        errors.append("D0 gap_abs: Open should NOT be shifted")

    if "group['gap_over_atr'] = group['gap_abs'].shift(1)" in code:
        errors.append("D0 gap_over_atr: should NOT be shifted")

    if "group['open_over_ema9'] = group['open'].shift(1) / group['ema_9'].shift(1)" in code:
        errors.append("D0 open_over_ema9: should NOT be shifted")

    if "group['body_over_atr'] = group['body_over_atr'].shift(1)" in code:
        errors.append("D0 body_over_atr: should NOT be shifted")

    # D-1 metrics MUST be shifted
    if "group['atr'] = group['atr_raw']" in code and ".shift(1)" not in code:
        errors.append("D-1 atr: MUST be shifted")

    if "group['vol_avg'] = group['volume'].rolling" in code and ".shift(1)" not in code:
        errors.append("D-1 vol_avg: MUST be shifted")

    # Gap-up uses correct high
    if "r1['prev_high']" in code or 'r1["prev_high"]' in code:
        errors.append("Gap-up: Use r1['high'], not r1['prev_high']")

    return errors
```

---

### Static Analysis Tools (Recommended)

Run these before returning code:

```bash
# Check for undefined variables
pyflinks generated_code.py

# Check for style issues
pylint --errors-only generated_code.py

# Check for complexity
mypy --no-error-summary generated_code.py
```

---

### Validation Order

1. **Detect metric model** from original code (Model A or Model B)
2. **Generate code** from transformation rules (model-specific)
3. **Run static checks** (syntax, imports, references)
4. **Validate V31 architecture** (all requirements met)
5. **Check for known bug patterns** (self-reference, naming, D-1 alignment)
6. **Check index alignment** (CRITICAL: grouped rolling with transform)
7. **Run model-specific validation** (A vs B specific checks)
8. **Log validation results** to error log file
9. **Return valid code OR report errors**

**Never return code that fails validation.**

---

## Error Logging System

### Log Directory

```
/home/mdwzrd/wzrd.dev/logs/v31-transformations/
├── validation.log              # All validation attempts
├── errors.log                  # Validation failures only
└── success.log                 # Successful transformations
```

### Log Format

```json
{
  "timestamp": "2026-02-26T15:30:00Z",
  "scanner_name": "DailyGapScanner",
  "input_file": "newfastestscandjt.py",
  "output_file": "DailyGapScanner_v31.py",
  "status": "success" | "error",
  "validation_time_ms": 1250,
  "checks": {
    "syntax": "passed",
    "imports": "passed",
    "class_based": "passed",
    "grouped_endpoint": "passed",
    "smart_filters": "passed",
    "snake_case": "passed",
    "no_self_reference": "passed",
    "d1_alignment": "passed",
    "gap_condition": "passed"
  },
  "errors": [
    {
      "type": "ValidationError",
      "message": "D-1 alignment bug: missing .shift(1) on open_over_ema9",
      "line": 440,
      "code_snippet": "group['open_over_ema9'] = group['open'] / group['ema_9']"
    }
  ],
  "warnings": [],
  "stats": {
    "lines_generated": 650,
    "tickers_processed": "full_market",
    "estimated_time_s": "10-30"
  }
}
```

### Logging Implementation

```python
import json
import os
from datetime import datetime
from pathlib import Path

class V31ValidatorLogger:
    """Log V31 transformation validation results"""

    def __init__(self, base_dir: str = "/home/mdwzrd/wzrd.dev/logs/v31-transformations"):
        self.base_dir = Path(base_dir)
        self.base_dir.mkdir(parents=True, exist_ok=True)

        self.validation_log = self.base_dir / "validation.log"
        self.error_log = self.base_dir / "errors.log"
        self.success_log = self.base_dir / "success.log"

    def log_result(self, result: dict):
        """Write result to appropriate log file"""

        # Add timestamp
        result['timestamp'] = datetime.utcnow().isoformat() + 'Z'

        # Convert to JSON
        log_entry = json.dumps(result, indent=2)

        # Write to validation log (all results)
        with open(self.validation_log, 'a') as f:
            f.write(log_entry + '\n' + '='*80 + '\n')

        # Write to specific log based on status
        if result['status'] == 'error':
            with open(self.error_log, 'a') as f:
                f.write(log_entry + '\n' + '='*80 + '\n')
        elif result['status'] == 'success':
            with open(self.success_log, 'a') as f:
                f.write(log_entry + '\n' + '='*80 + '\n')

    def get_recent_errors(self, n: int = 10) -> list:
        """Get n most recent errors"""
        if not self.error_log.exists():
            return []

        with open(self.error_log, 'r') as f:
            entries = [json.loads(entry) for entry in f.read().split('='*80) if entry.strip()]

        return entries[-n:]

    def get_error_summary(self) -> dict:
        """Get summary of all errors"""
        if not self.error_log.exists():
            return {"total": 0, "by_type": {}, "by_line": {}}

        with open(self.error_log, 'r') as f:
            entries = [json.loads(entry) for entry in f.read().split('='*80) if entry.strip()]

        summary = {"total": len(entries), "by_type": {}, "by_line": {}}

        for entry in entries:
            for error in entry.get('errors', []):
                error_type = error.get('type', 'Unknown')
                summary['by_type'][error_type] = summary['by_type'].get(error_type, 0) + 1

                line = error.get('line', 'Unknown')
                if line != 'Unknown':
                    summary['by_line'][line] = summary['by_line'].get(line, 0) + 1

        return summary

# Global logger instance
v31_logger = V31ValidatorLogger()
```

### Integration with Validation

```python
def detect_metric_model(original_code: str) -> str:
    """Detect whether original uses Model A or Model B"""
    model_a_score = 0
    model_b_score = 0

    # Model A indicators: Pre-shifted metrics
    if "m['open_over_ema9'] = m['Open'].shift(1) / m['EMA_9'].shift(1)" in original_code:
        model_a_score += 3  # Strong indicator
    if "m['High_over_EMA9_div_ATR'] = (m['High'].shift(1) - m['EMA_9'].shift(1))" in original_code:
        model_a_score += 3

    # Model B indicators: Row-iteration (D0 metrics unshifted)
    if "m['Gap_over_ATR'] = m['Gap_abs'] / m['ATR']" in original_code:
        model_b_score += 2
    if "m['Open_over_EMA9'] = m['Open'] / m['EMA_9']" in original_code:
        model_b_score += 2
    if "m['Gap_abs'] = (m['Open'] - m['Close'].shift(1)).abs()" in original_code:
        model_b_score += 2

    if model_a_score > model_b_score:
        return "MODEL_A_PRE_SHIFTED"
    elif model_b_score > model_a_score:
        return "MODEL_B_ROW_ITERATION"
    else:
        return "UNKNOWN"


def validate_v31_code(code: str, scanner_name: str, input_file: str, original_code: str = None) -> tuple[bool, dict]:
    """Validate V31 code and log results with model-specific checks"""

    result = {
        "scanner_name": scanner_name,
        "input_file": input_file,
        "metric_model": "UNKNOWN",
        "checks": {},
        "errors": [],
        "warnings": [],
        "status": "success"
    }

    # Detect model from original code if provided
    if original_code:
        result['metric_model'] = detect_metric_model(original_code)

    start_time = time.time()

    try:
        # 1. Syntax check
        try:
            ast.parse(code)
            result['checks']['syntax'] = 'passed'
        except SyntaxError as e:
            raise ValidationError(f"Syntax error: {e}")

        # 2. Self-reference check
        if re.search(r"(\w+)\s*=\s*\1\[", code):
            result['errors'].append({
                "type": "SelfReferenceBug",
                "message": "Self-reference pattern detected: x = x[",
                "line": find_line(code, r"(\w+)\s*=\s*\1\[")
            })
            result['checks']['no_self_reference'] = 'failed'

        # 3. D-1 alignment check
        if 'r1[\'prev_high\']' in code or 'r1["prev_high"]' in code:
            result['errors'].append({
                "type": "D1AlignmentBug",
                "message": "Use r1['high'] for D-1 high, not prev_high",
                "line": find_line(code, r"r1\['?prev_high'?\]")
            })
            result['checks']['d1_alignment'] = 'failed'

        # 4. Missing shift check
        if "group['open_over_ema9'] = group['open'] / group['ema_9']" in code:
            result['errors'].append({
                "type": "D1AlignmentBug",
                "message": "Missing .shift(1) on D-1 metric open_over_ema9",
                "line": find_line(code, r"group\['open_over_ema9'\]")
            })
            result['checks']['d1_alignment'] = 'failed'

        # 5. ATR order check
        if re.search(r"group\['atr_raw'\].*group\['tr_prev'\]", code):
            result['errors'].append({
                "type": "ATROrderBug",
                "message": "tr_prev must be computed before atr_raw",
                "line": find_line(code, r"group\['atr_raw'\]")
            })
            result['checks']['atr_order'] = 'failed'

        # 6. Index alignment check (CRITICAL - 2026-02-28)
        # Check for grouped rolling without transform
        if "g = df.groupby" in code:
            dangerous_patterns = [
                r"g\[.+\.rolling\([^)]+\)\.mean\(\)",
                r"g\[.+\.rolling\([^)]+\)\.std\(\)",
                r"g\[.+\.rolling\([^)]+\)\.sum\(\)",
                r"g\[.+\.ewm\([^)]+\)\.mean\(\)",
            ]

            for pattern in dangerous_patterns:
                match = re.search(pattern, code)
                if match:
                    result['errors'].append({
                        "type": "IndexAlignmentBug",
                        "message": "Use transform(lambda x: x.rolling(...)) for grouped operations",
                        "line": find_line(code, pattern)
                    })
                    result['checks']['index_alignment'] = 'failed'
                    break

            # Verify transform is used for grouped operations
            safe_patterns = [
                r"g\[.+\.transform\(lambda x: x\.rolling",
                r"g\[.+\.transform\(lambda x: x\.ewm",
            ]

            safe_code = any(re.search(p, code) for p in safe_patterns)

            if not safe_code and not result['errors']:
                result['warnings'].append({
                    "type": "IndexAlignmentWarning",
                    "message": "Grouped operations found but no transform() used. May cause index mismatch errors.",
                    "line": find_line(code, r"g = df.groupby")
                })
            else:
                result['checks']['index_alignment'] = 'passed'

        # 6. Model-specific validation
        model = result['metric_model']

        if model == "MODEL_A_PRE_SHIFTED":
            # Model A: D0 metrics SHOULD be pre-shifted
            if "group['open_over_ema9'] = group['open'] / group['ema_9']" in code:
                result['errors'].append({
                    "type": "D1AlignmentBug",
                    "message": "Model A: Missing .shift(1) on D-1 metric open_over_ema9",
                    "line": find_line(code, r"group\['open_over_ema9'\]")
                })
                result['checks']['d1_alignment'] = 'failed'

        elif model == "MODEL_B_ROW_ITERATION":
            # Model B: D0 metrics should NOT be shifted!
            if "group['gap_abs'] = (group['open'].shift(1)" in code:
                result['errors'].append({
                    "type": "ModelBTransformationBug",
                    "message": "Model B: D0 gap_abs Open should NOT be shifted",
                    "line": find_line(code, r"group\['gap_abs'\]")
                })
                result['checks']['d0_alignment'] = 'failed'

            if "group['gap_over_atr'] = group['gap_abs'].shift(1)" in code:
                result['errors'].append({
                    "type": "ModelBTransformationBug",
                    "message": "Model B: D0 gap_over_atr should NOT be shifted",
                    "line": find_line(code, r"group\['gap_over_atr'\]")
                })
                result['checks']['d0_alignment'] = 'failed'

            if "group['open_over_ema9'] = group['open'].shift(1) / group['ema_9'].shift(1)" in code:
                result['errors'].append({
                    "type": "ModelBTransformationBug",
                    "message": "Model B: D0 open_over_ema9 should NOT be shifted",
                    "line": find_line(code, r"group\['open_over_ema9'\]")
                })
                result['checks']['d0_alignment'] = 'failed'

            if "group['body_over_atr'] = group['body_over_atr'].shift(1)" in code:
                result['errors'].append({
                    "type": "ModelBTransformationBug",
                    "message": "Model B: D0 body_over_atr should NOT be shifted",
                    "line": find_line(code, r"group\['body_over_atr'\]")
                })
                result['checks']['d0_alignment'] = 'failed'

            # Model B: D-1 metrics MUST be shifted
            if "group['atr'] = group['atr_raw']" in code and ".shift(1)" not in code.split("atr']")[0]:
                result['errors'].append({
                    "type": "ModelBTransformationBug",
                    "message": "Model B: ATR must be shifted (represents D-1)",
                    "line": find_line(code, r"group\['atr'\]")
                })
                result['checks']['d1_alignment'] = 'failed'

            if "group['vol_avg'] = group['volume'].rolling" in code and ".shift(1)" not in code:
                result['errors'].append({
                    "type": "ModelBTransformationBug",
                    "message": "Model B: vol_avg must be shifted (represents D-1)",
                    "line": find_line(code, r"group\['vol_avg'\]")
                })
                result['checks']['d1_alignment'] = 'failed'

        # Determine status
        if result['errors']:
            result['status'] = 'error'

    except Exception as e:
        result['status'] = 'error'
        result['errors'].append({
            "type": type(e).__name__,
            "message": str(e),
            "line": getattr(e, 'lineno', None)
        })

    result['validation_time_ms'] = int((time.time() - start_time) * 1000)

    # Log the result
    v31_logger.log_result(result)

    return result['status'] == 'success', result

def find_line(code: str, pattern: str) -> int:
    """Find line number where pattern occurs"""
    import re
    for i, line in enumerate(code.split('\n'), 1):
        if re.search(pattern, line):
            return i
    return None
```

### Error Analysis Commands

```bash
# View recent errors
tail -100 /home/mdwzrd/wzrd.dev/logs/v31-transformations/errors.log

# Get error summary
python -c "
import json
with open('/home/mdwzrd/wzrd.dev/logs/v31-transformations/errors.log') as f:
    entries = [json.loads(e) for e in f.read().split('='*80) if e.strip()]
    types = {}
    for e in entries:
        for err in e.get('errors', []):
            types[err['type']] = types.get(err['type'], 0) + 1
    print(json.dumps(types, indent=2))
"

# Search for specific error type
grep -A 20 "D1AlignmentBug" /home/mdwzrd/wzrd.dev/logs/v31-transformations/errors.log

# Count successful vs failed transformations
echo "Success: $(grep -c '\"status\": \"success\"' /home/mdwzrd/wzrd.dev/logs/v31-transformations/validation.log)"
echo "Errors: $(grep -c '\"status\": \"error\"' /home/mdwzrd/wzrd.dev/logs/v31-transformations/validation.log)"
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-26 | Initial V31 transformation rules |
| 1.1 | 2026-02-26 | Added self-reference bug validation guardrails |
| 1.2 | 2026-02-26 | Added D-1 alignment validation (gap condition, shift issues) |
| 1.3 | 2026-02-26 | Added ATR/TR computation order validation |
| 1.4 | 2026-02-26 | Added error logging system with validation.log, errors.log, success.log |
| 1.5 | 2026-02-26 | Added `V31ValidatorLogger` class for automated logging |
| **2.0** | 2026-02-26 | **TWO MODEL SUPPORT** - Added Model A/B detection, model-specific transformation rules, Model B validation (row-iteration metrics) |
