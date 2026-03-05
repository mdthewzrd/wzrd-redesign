# V31 Generator Skill

> **Skill:** `v31-generator`
> **Agent:** Renata
> **Purpose:** Generate V31-compliant scanner code from scratch
> **Mode:** Indicator Builder / Strategy Builder

---

## Description

The v31-generator skill creates **V31-compliant scanner code** from natural language descriptions, pattern definitions, or A+ examples. This is used when:
- Building a new scan from an idea
- No source code exists to transform
- Need to quickly prototype a pattern detection system

---

## Code Generation Template

```python
import pandas as pd
import numpy as np

def scan(
    prices: pd.DataFrame,

    # Parameters
    ema_length: int = 20,
    volume_threshold: float = 2.0,
    pullback_pct: float = 0.10,

) -> pd.DataFrame:
    """
    V31-compliant scanner for EMA bounce pattern.

    Parameters:
        ema_length: EMA period for bounce level
        volume_threshold: Volume multiplier for spike detection
        pullback_pct: Maximum pullback from EMA (as decimal)

    Returns:
        DataFrame with signal and parameter columns
    """
    # Calculate indicators
    ema = prices['close'].ewm(span=ema_length, adjust=False).mean()
    avg_volume = prices['volume'].rolling(20).mean()

    # Pattern conditions
    close_to_ema = (prices['close'] / ema).between(1 - pullback_pct, 1 + pullback_pct)
    volume_spike = prices['volume'] > (avg_volume * volume_threshold)

    # Signal
    signal = close_to_ema & volume_spike

    return pd.DataFrame({
        'signal': signal,
        'ema_value': ema,
        'volume_multiplier': prices['volume'] / avg_volume,
        'distance_from_ema': (prices['close'] / ema) - 1,
    })
```

---

## Usage Patterns

### Pattern Description
```
/v31-gen "Find stocks bouncing off 20EMA with 2x volume"
```

### With A+ Examples
```
/v31-gen "
EMA bounce setup. A+ examples:
- NVDA: Bounced off 20EMA, 3x volume
- TSLA: Bounced off 20EMA, 2.5x volume
"
```

### With Specified Parameters
```
/v31-gen "
Pattern: EMA bounce
Parameters: ema_length=20, volume_threshold=2.0
"
```

---

## Supported Pattern Types

| Type | Description | Example |
|------|-------------|---------|
| **Breakout** | Price breaks through level | Break above 50SMA |
| **Bounce** | Price bounces off support | Bounce off 20EMA |
| **Pullback** | Retracement to key level | Pullback to rising 50DMA |
| **Reversal** | Trend change signal | RSI < 30, candlestick pattern |
| **Continuation** | Pattern in trend direction | Higher low, higher high |
| **Divergence** | Price vs indicator divergence | Price down, RSI up |

---

## Output Guarantees

All generated code includes:
- ✅ Proper function signature with type hints
- ✅ Required signal column
- ✅ Parameter value columns (for dashboard)
- ✅ Comprehensive docstring
- ✅ pandas operations only
- ✅ Error handling for missing columns

---

## Related Skills

- `scan-build` - Full workflow with generated code
- `code-analysis` - Analyze generated code
- `code-transformation` - Alternative: transform existing code

---

**Created:** 2026-02-26
**Status:** Active
