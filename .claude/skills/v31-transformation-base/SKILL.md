---
name: v31-transformation-base
description: Shared V31 transformation utilities and patterns used by all transformation skills
category: transformation
priority: P0
tags: [v31, transformation, shared-utilities, gold-standard]
---

# V31 Transformation Base

## Purpose
Shared V31 transformation utilities, patterns, and code templates used by all specialized transformation skills.

## Core Principle
**"Write once, use everywhere. V31 patterns are universal."**

---

## V31 Gold Standard (Non-Negotiable)

### 1. Full Market Coverage
```python
# ❌ FORBIDDEN: Hardcoded symbol lists
SYMBOLS = ['EW', 'JAMF', 'VNET', ...]

# ✅ REQUIRED: Grouped endpoint for ALL tickers
url = f"{base_url}/v2/aggs/grouped/locale/us/market/stocks/{date}"
```

### CRITICAL: Polygon Grouped Endpoint Column Mapping

The grouped endpoint returns different column names than per-ticker endpoints:

| API Column | Internal Use | Rename To |
|-------------|----------------|------------|
| `T` | Ticker symbol | `ticker` |
| `o` | Open price | `open` |
| `h` | High price | `high` |
| `l` | Low price | `low` |
| `c` | Close price | `close` |
| `v` | Volume | `volume` |
| `t` | Timestamp (ms) | - (converted to date) |

**Column Rename Pattern:**
```python
df = (pd.DataFrame(rows)
       .assign(date=lambda d: pd.to_datetime(d["t"], unit="ms", utc=True)
                                       .dt.tz_convert('America/New_York')
                                       .dt.normalize()
                                       .dt.tz_localize(None))
       .rename(columns={"T": "ticker", "o": "open", "h": "high",
                       "l": "low", "c": "close", "v": "volume"})
       [["ticker", "date", "open", "high", "low", "close", "volume"]])
```

**Common Bug:** Missing `"T": "ticker"` in rename causes empty results!

### 2. Class-Based Architecture
```python
class ScannerName:
    def __init__(self, api_key: str, d0_start: str, d0_end: str):
        # Date properties (easily accessible)
        self.scan_start_date = d0_start
        self.scan_end_date = d0_end
        self.data_fetch_start = (pd.Timestamp(d0_start) - pd.Timedelta(days=1050)).strftime('%Y-%m-%d')
        self.data_fetch_end = d0_end

        # API and session
        self.api_key = api_key
        self.base_url = "https://api.polygon.io"
        self.session = requests.Session()
        self.session.mount('https://', requests.adapters.HTTPAdapter(
            pool_connections=100, pool_maxsize=100, max_retries=2
        ))

        # NYSE calendar
        self.nyse = mcal.get_calendar('NYSE')

        # Parameters (flat structure, snake_case)
        self.params = { ... }
```

### 3. 5-Stage Pipeline
```python
def run_scan(self):
    # Stage 1: Fetch grouped data (adjusted + unadjusted)
    stage1_data = self.fetch_grouped_data()

    # Stage 2a: Compute simple features
    stage2a_data = self.compute_simple_features(stage1_data)

    # Stage 2b: Apply smart filters
    stage2b_data = self.apply_smart_filters(stage2a_data)

    # Stage 3a: Compute indicators
    stage3a_data = self.compute_indicators(stage2b_data)

    # Stage 3b: Detect patterns
    stage3b_data = self.detect_patterns(stage3a_data)

    # Stage 3c: Compute gap levels (optional)
    stage3c_data = self.compute_gap_levels(stage3b_data)

    return stage3c_data
```

### 4. Smart Filters (Critical)
```python
def apply_smart_filters(self, df: pd.DataFrame):
    # Separate historical from output range
    df_historical = df[~df['date'].between(self.d0_start, self.d0_end)].copy()
    df_output_range = df[df['date'].between(self.d0_start, self.d0_end)].copy()

    # Filter ONLY D0 dates
    df_output_filtered = df_output_range[
        (df_output_range['prev_close'] >= self.params['price_min']) &
        (df_output_range['adv20_usd'] >= self.params['adv20_min_usd'])
    ].copy()

    # Combine ALL historical + filtered D0
    df_combined = pd.concat([df_historical, df_output_filtered], ignore_index=True)

    # Keep only tickers with valid D0
    tickers_with_valid_d0 = df_output_filtered['ticker'].unique()
    df_combined = df_combined[df_combined['ticker'].isin(tickers_with_valid_d0)]

    return df_combined
```

### 5. Snake Case Naming Only
```python
# ❌ FORBIDDEN
EMA_9, ATR_raw, VOL_AVG, Gap_over_ATR

# ✅ REQUIRED
ema_9, atr_raw, vol_avg, gap_over_atr
```

### 6. Index Alignment Fix (Critical Bug Pattern)
```python
# ❌ WRONG - Causes index mismatch
df['atr_raw'] = g['tr'].rolling(14, min_periods=14).mean()

# ✅ CORRECT - Uses transform for alignment
df['atr_raw'] = g['tr'].transform(lambda x: x.rolling(14, min_periods=14).mean())
```

### 7. CRITICAL: Never Use Transform with DataFrame Lambda

**`g.transform(lambda x: f(x))` passes a Series, not a DataFrame!**

```python
# ❌ WRONG - Lambda receives Series, function expects DataFrame
def _compute_tr(df: pd.DataFrame) -> pd.Series:
    hi_lo = df["high"] - df["low"]  # FAILS - KeyError: 'high'
    return ...

m["tr_raw"] = g.transform(lambda x: self._compute_tr(x))  # x is Series

# ✅ CORRECT - Vectorized operations, no lambda
prev_close = g["close"].shift(1)
hi_lo = m["high"] - m["low"]
hi_pc = (m["high"] - prev_close).abs()
lo_pc = (m["low"] - prev_close).abs()
m["tr_raw"] = pd.concat([hi_lo, hi_pc, lo_pc], axis=1).max(axis=1)
```

**Pattern Rule:**
- Use `transform(lambda x: ...)` for **Series → Series** operations (e.g., rolling)
- Use **vectorized operations** for arithmetic across columns
- Use `apply(lambda x: ...)` only when function returns DataFrame

---

## Trading Calendar Integration

```python
import pandas_market_calendars as mcal

def _get_trading_days(self, start: str, end: str) -> list:
    schedule = self.nyse.schedule(start_date=start, end_date=end)
    trading_days = self.nyse.valid_days(start_date=start, end_date=end)
    return [d.strftime('%Y-%m-%d') for d in trading_days]
```

---

## Dual Data Fetch (Adjusted + Unadjusted)

```python
async def fetch_grouped_data(self) -> pd.DataFrame:
    df_adj = await self._fetch_dates(self.trading_dates, adjusted="true")
    df_unadj = await self._fetch_dates(self.trading_dates, adjusted="false")

    df_unadj = df_unadj.rename(columns={
        col: f"{col}_ua" for col in df_unadj.columns
        if col not in ['date', 'ticker']
    })

    df = pd.merge(df_adj, df_unadj, on=['date', 'ticker'], how='inner')
    return df
```

---

## Indicator Computation Framework

```python
def compute_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
    df = df.sort_values(["ticker", "date"]).copy()
    g = df.groupby("ticker", sort=False)

    # True Range
    hi_lo = df['h'] - df['l']
    hi_pc = (df['h'] - df['c'].shift(1)).abs()
    lo_pc = (df['l'] - df['c'].shift(1)).abs()
    df['tr'] = np.maximum(hi_lo, hi_pc, lo_pc)

    # ATR with transform (index alignment fix)
    df['tr_prev'] = g['tr'].transform(lambda x: x.shift(1))
    df['atr_raw'] = g['tr'].transform(lambda x: x.rolling(14, min_periods=14).mean())
    df['atr'] = g['atr_raw'].transform(lambda x: x.shift(1))

    # EMAs
    for period in (9, 20, 50, 200):
        df[f'ema{period}'] = g['c'].transform(
            lambda x: x.ewm(span=period, adjust=False).mean()
        ).reset_index(level=0, drop=True)

    return df
```

---

## Parallel Processing Pattern

```python
def detect_patterns(self, df: pd.DataFrame) -> pd.DataFrame:
    # Pre-slice optimization (O(n))
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
```

---

## Gap Levels (Optional)

```python
def compute_gap_levels(self, df: pd.DataFrame) -> pd.DataFrame:
    df['range'] = df['h_ua'] - df['l_ua']
    df['range_cont'] = df['h_ua'] - df['c_ua']

    df['gap_20'] = np.ceil((df['c_ua'] + df['range']*0.2) * 100) / 100
    df['gap_30'] = np.ceil((df['c_ua'] + df['range']*0.3) * 100) / 100
    df['gap_50'] = np.ceil((df['c_ua'] + df['range']*0.5) * 100) / 100
    df['gap_100'] = np.ceil((df['c_ua'] + df['range']*1.0) * 100) / 100
    df['gap_cont_30'] = np.ceil((df['c_ua'] + df['range_cont']*0.3) * 100) / 100

    return df
```

---

## Progress Tracking

```python
print(f"\n{'='*70}")
print(f"STAGE {stage}: {stage_name}")
print(f"{'='*70}")

# Progress updates
if completed % 10 == 0 or completed == len(items):
    print(f"  Progress: {completed}/{len(items)} ({completed/len(items)*100:.0f}%)")

# Timing
total_time = time.time() - start_time
print(f"Total time: {total_time:.2f}s")
```

---

## Validation Checks

| Check | What to Verify |
|-------|----------------|
| Full market coverage | Uses grouped endpoint, no hardcoded symbols |
| Class-based | Has `run_scan()` method, 5-stage pipeline |
| Smart filters | Preserves historical, filters only D0 |
| Snake case | All variables follow snake_case |
| Index alignment | Uses `.transform()` for grouped rolling |
| Trading calendar | Uses NYSE calendar, not calendar days |
| NO transform with DataFrame lambda | Vectorized operations used for multi-column logic |
| Column mapping verified | All API columns properly renamed (T→ticker, etc.) |

---

**"V31 patterns are the foundation. Build on them, don't break them."**
