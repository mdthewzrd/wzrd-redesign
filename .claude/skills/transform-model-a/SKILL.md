---
name: transform-model-a
description: Transform column-based filtering scanner patterns to V31 gold standard
category: transformation
priority: P0
tags: [v31, transformation, model-a, column-filtering]
---

# Model A Transformation: Column-Based Filtering

## Purpose
Transform scanners that use column-based filtering patterns (vectorized operations, no row iteration) to V31 gold standard.

## Core Principle
**"Vectorize everything. No iteration, just filtering."**

---

## Detection Patterns

```python
# Model A uses these patterns:
df[df['condition']] = ...           # Boolean masking
group['column'].mean()               # Group aggregation
df[df['ema9'] > df['ema20']]       # Column comparison
df.groupby('ticker')['col'].sum()      # Group operations
```

---

## Transformation Steps

### Step 1: Load Base V31 Patterns
Load `v31-transformation-base` skill for shared utilities.

### Step 2: Extract Pattern Logic
Identify the filtering conditions:
- Entry conditions (boolean masks)
- Exit conditions (boolean masks)
- Any additional computed columns

### Step 3: Transform to Class Structure

```python
class ScannerName:
    def __init__(self, api_key: str, d0_start: str, d0_end: str):
        self.scan_start_date = d0_start
        self.scan_end_date = d0_end
        self.data_fetch_start = (pd.Timestamp(d0_start) - pd.Timedelta(days=1050)).strftime('%Y-%m-%d')
        self.data_fetch_end = d0_end

        self.api_key = api_key
        self.base_url = "https://api.polygon.io"
        self.session = requests.Session()
        self.session.mount('https://', requests.adapters.HTTPAdapter(
            pool_connections=100, pool_maxsize=100, max_retries=2
        ))

        self.nyse = mcal.get_calendar('NYSE')
        self.params = { ... }  # From original code
```

### Step 4: Implement 5-Stage Pipeline

**Stage 1: Fetch Grouped Data**
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

**Stage 2a: Simple Features**
```python
def compute_simple_features(self, df: pd.DataFrame) -> pd.DataFrame:
    df = df.sort_values(['ticker', 'date']).copy()
    g = df.groupby('ticker', sort=False)

    df['prev_close'] = g['c_ua'].shift(1)
    df['volume_20'] = g['v_ua'].transform(lambda x: x.rolling(20, min_periods=20).mean())
    df['adv20_usd'] = df['volume_20'] * df['c_ua']
    df['price_range'] = df['h_ua'] - df['l_ua']

    return df
```

**Stage 2b: Smart Filters**
```python
def apply_smart_filters(self, df: pd.DataFrame) -> pd.DataFrame:
    df_historical = df[~df['date'].between(self.d0_start, self.d0_end)].copy()
    df_output_range = df[df['date'].between(self.d0_start, self.d0_end)].copy()

    df_output_filtered = df_output_range[
        (df_output_range['prev_close'] >= self.params['price_min']) &
        (df_output_range['adv20_usd'] >= self.params['adv20_min_usd'])
    ].copy()

    df_combined = pd.concat([df_historical, df_output_filtered], ignore_index=True)
    tickers_with_valid_d0 = df_output_filtered['ticker'].unique()
    df_combined = df_combined[df_combined['ticker'].isin(tickers_with_valid_d0)]

    return df_combined
```

**Stage 3a: Indicators**
```python
def compute_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
    df = df.sort_values(['ticker', 'date']).copy()
    g = df.groupby('ticker', sort=False)

    hi_lo = df['h'] - df['l']
    hi_pc = (df['h'] - df['c'].shift(1)).abs()
    lo_pc = (df['l'] - df['c'].shift(1)).abs()
    df['tr'] = np.maximum(hi_lo, hi_pc, lo_pc)

    df['tr_prev'] = g['tr'].transform(lambda x: x.shift(1))
    df['atr_raw'] = g['tr'].transform(lambda x: x.rolling(14, min_periods=14).mean())
    df['atr'] = g['atr_raw'].transform(lambda x: x.shift(1))

    for period in (9, 20, 50, 200):
        df[f'ema{period}'] = g['c'].transform(
            lambda x: x.ewm(span=period, adjust=False).mean()
        ).reset_index(level=0, drop=True)

    return df
```

**Stage 3b: Pattern Detection (Model A - Vectorized)**
```python
def detect_patterns(self, df: pd.DataFrame) -> pd.DataFrame:
    # Apply pattern conditions as vectorized operations
    df['entry_condition'] = (
        (df['ema9'] > df['ema20']) &
        (df['close'] > df['open'])
    )

    df_filtered = df[df['entry_condition']].copy()

    # Map to output format
    results = []
    for _, row in df_filtered.iterrows():
        results.append({
            'ticker': row['ticker'],
            'date': row['date'].strftime('%Y-%m-%d'),
            'close': float(row['c']),
            'volume': int(row['v']),
        })

    return pd.DataFrame(results)
```

### Step 5: Convert Naming
Change all variable names to snake_case:
- `EMA_9` → `ema9`
- `ATR_raw` → `atr_raw`
- `Gap_over_ATR` → `gap_over_atr`

### Step 6: Add Progress Tracking
Add progress bars and timing for each stage.

---

## Validation Checklist

- [ ] Uses grouped endpoint for full market
- [ ] Class-based with `run_scan()` method
- [ ] Smart filters preserve historical data
- [ ] All variables in snake_case
- [ ] Index alignment uses `.transform()`
- [ ] Pattern detection is vectorized
- [ ] NYSE trading calendar integrated
- [ ] Progress tracking added

---

**"Model A: Simple, fast, vectorized. Filter, don't iterate."**
