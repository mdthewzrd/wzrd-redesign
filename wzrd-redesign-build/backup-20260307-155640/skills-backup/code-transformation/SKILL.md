# Code Transformation Skill

> **Skill:** `code-transformation`
> **Agent:** Renata
> **Purpose:** Transform scanner code to V31/edge.dev standards
> **Mode:** Code Formatter

---

## Description

The code-transformation skill takes scanner code from any source (TradingView Pine Script, ThinkOrSwim, custom scripts, etc.) and transforms it into **V31-compliant code** that works with edge.dev's dashboard system.

---

## V31 Standards

All transformed code must follow these requirements:

### 1. Function Signature
```python
def scan(
    prices: pd.DataFrame,

    # Parameters (preserve original names)
    param1: float = 1.0,
    param2: int = 20,

) -> pd.DataFrame:
    """V31-compliant scanner."""
    ...
```

### 2. Required Output Columns
```python
return pd.DataFrame({
    'signal': bool,          # Pattern detected
    'param1_value': float,   # Actual param value (for dashboard)
    'param2_value': int,     # Actual param value (for dashboard)
    # Additional signal columns as needed
})
```

### 3. Input DataFrame Structure
```python
prices.columns = [
    'timestamp',  # datetime
    'open',       # float
    'high',       # float
    'low',        # float
    'close',      # float
    'volume',     # float (optional)
]
```

### 4. Pandas Operations Only
- No TradingView-specific functions
- Use `pandas.DataFrame` methods
- Use `ta` library for indicators (or implement directly)

### 5. Type Hints & Docstrings
- All parameters must have type hints
- Function must have comprehensive docstring

---

## Transformation Process

1. **Parse Source Code** - Extract logic, parameters, conditions
2. **Map to V31 Standards** - Convert functions to pandas equivalents
3. **Preserve Original Logic** - Keep the trader's intent intact
4. **Add Dashboard Columns** - Include parameter value columns
5. **Validate** - Test on sample data

---

## Common Transformations

| TradingView | Pandas/Python |
|-------------|---------------|
| `ta.ema(close, 20)` | `prices['close'].ewm(span=20, adjust=False).mean()` |
| `ta.sma(close, 20)` | `prices['close'].rolling(20).mean()` |
| `ta.rsi(close, 14)` | `ta.momentum.RSIIndicator(prices['close'], 14).rsi()` |
| `ta.atr(high, low, close, 14)` | `ta.volatility.AverageTrueRange(prices['high'], prices['low'], prices['close'], 14).average_true_range()` |
| `close > ema` | `(prices['close'] > ema_values)` |

---

## Usage

```
/transform-to-v31 {source_code}

/transform-to-v31 --source "tradingview" {code}
```

---

## Integration Points

- **API:** `/api/renata_v2/transform` - Code transformation endpoint
- **Command:** `/transform-to-v31` - Quick transformation

---

## Related Skills

- `code-analysis` - Analyze before transformation
- `v31-generator` - Generate from scratch if no source exists

---

**Created:** 2026-02-26
**Status:** Active
