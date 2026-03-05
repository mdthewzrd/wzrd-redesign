---
name: test-driven-development
description: Write tests before implementing features
category: coding
priority: P0
tags: [coding, testing, tdd, gold-standard]
---

# Test-Driven Development (TDD)

## Purpose
Ensure code quality by writing tests before implementation.

## Golden Rule
"Write the test before writing the code."

## When to Use
- Implementing new features
- Fixing bugs (write regression test first)
- Refactoring code (tests protect against breakage)

## TDD Cycle

### Red → Green → Refactor

```
1. RED: Write failing test
   - Test describes desired behavior
   - Test fails (feature doesn't exist yet)

2. GREEN: Write minimal code to pass
   - Implement just enough to make test pass
   - Don't worry about perfection yet

3. REFACTOR: Improve the code
   - Clean up implementation
   - Tests ensure you don't break anything
```

## Example

### Step 1: Write Test (RED)
```python
def test_trading_bot_calculates_position_size():
    bot = TradingBot(risk_per_trade=0.02)
    position = bot.calculate_position_size(
        account_balance=10000,
        entry_price=100,
        stop_loss_price=95
    )
    assert position.size == 40  # 2% risk, $5 stop distance
    assert position.risk_amount == 200  # 2% of $10,000
```

### Step 2: Run Test (RED)
```bash
$ pytest test_trading_bot.py
FAILED - TradingBot.calculate_position_size does not exist
```

### Step 3: Implement Code (GREEN)
```python
class TradingBot:
    def __init__(self, risk_per_trade=0.02):
        self.risk_per_trade = risk_per_trade

    def calculate_position_size(self, account_balance, entry_price, stop_loss_price):
        risk_amount = account_balance * self.risk_per_trade
        stop_distance = abs(entry_price - stop_loss_price)
        size = risk_amount / stop_distance
        return Position(size=size, risk_amount=risk_amount)
```

### Step 4: Run Test (GREEN)
```bash
$ pytest test_trading_bot.py
PASSED ✅
```

### Step 5: Refactor (if needed)
```python
# Clean up implementation while tests stay green
class TradingBot:
    def __init__(self, risk_per_trade=0.02):
        if not 0 < risk_per_trade <= 0.1:
            raise ValueError("risk_per_trade must be between 0 and 0.1")
        self.risk_per_trade = risk_per_trade

    # ... (tests still pass)
```

## Benefits

### Why TDD Matters
- **Confidence:** Tests prove code works
- **Documentation:** Tests show how code is used
- **Safety:** Refactor without fear of breaking
- **Design:** Writing tests first improves API design
- **Debugging:** Find bugs immediately, not later

### Evidence Requirements (Gold Standard)
After implementing feature:
1. Show test code
2. Show test execution output (PASSED)
3. Show implementation code
4. Only then claim feature complete

## Best Practices

- Test one thing per test
- Use descriptive test names
- Test edge cases (empty, null, boundaries)
- Mock external dependencies (APIs, databases)
- Keep tests fast (unit tests, not integration)

## Anti-Patterns

❌ Don't write tests after code (defeats purpose)
❌ Don't skip tests for "simple" code
❌ Don't write tests that test nothing (assert True)
❌ Don't make tests dependent on order

## Gold Standard Integration

This skill works with:
- Pillar 5 (Validation) - Executable proof via test results
- Pillar 2 (Subagents) - Chet agent writes tests, Arya agent writes code
- Pillar 10 (Ultimate Workflow) - TDD in build phase
