# Code Run Validator Skill

**Purpose:** Run Python code/scripts and return execution results via Discord upload.

**Use When:**
- Testing generated code before sending to user
- Validating scanner output
- Running backtests or scans
- Any code execution that needs results returned

---

## What This Skill Does

1. **Run Python script** at specified path with optional arguments
2. **Capture all output** (stdout, stderr, exit code)
3. **Upload results file** to Discord with timestamp

---

## Usage

### Basic Usage
```python
# Run a Python script
python scripts/my_scanner.py

# Run with arguments
python scripts/my_scanner.py --start 2024-01-01 --end 2024-12-31

# Run with environment variables
API_KEY="xxx" python scripts/api_call.py
```

### Skill Command Pattern
When calling this skill, provide:
- `command`: The exact command to run (e.g., `python scanner.py`)
- `timeout`: Optional timeout in seconds (default: 300)
- `output_file`: Optional custom output filename (default: `code_run_<timestamp>.txt`)

---

## Execution Flow

```
1. Parse command
2. Execute with timeout
3. Capture stdout + stderr
4. Get exit code
5. Format results file with metadata
6. Upload to Discord
7. Return summary to user
```

---

## Output Format

The results file contains:

```text
================================================================================
CODE RUN RESULTS
================================================================================

Command: python /path/to/script.py arguments...

Started: 2026-02-26 14:30:00 UTC
Completed: 2026-02-26 14:30:15 UTC
Duration: 15.23 seconds
Exit Code: 0

--------------------------------------------------------------------------------
STDOUT
--------------------------------------------------------------------------------

[All standard output from the script]

--------------------------------------------------------------------------------
STDERR
--------------------------------------------------------------------------------

[All error output from the script]

--------------------------------------------------------------------------------
SUMMARY
--------------------------------------------------------------------------------

✅ Success / ❌ Failed
Exit Code: 0
Lines of output: 123
```

---

## Guardrails

### Safety Checks (Pre-Execution)

1. **Command validation**
   - Must be `python`, `python3`, or `pip` commands
   - No destructive commands (`rm`, `del`, etc.)
   - No network exfiltration attempts

2. **Path validation**
   - Path must be within allowed directories
   - No parent directory traversal (`../`)
   - Must exist and be readable

3. **Timeout protection**
   - Default 5 minutes
   - Maximum 30 minutes (configurable)
   - Kills process if exceeded

4. **Resource limits**
   - Memory cap: 4GB
   - CPU limit: 90% (soft)
   - Prevent runaway processes

---

## Error Handling

| Error Type | Handling |
|------------|----------|
| **File not found** | Report path, suggest checking spelling |
| **Syntax error** | Include full traceback in output |
| **Import error** | List missing dependencies |
| **Runtime error** | Full traceback + line numbers |
| **Timeout** | Partial output + timeout message |
| **Memory error** | OOM traceback + suggestions |

---

## Integration Pattern

### For V31 Scanner Validation
```python
# 1. Generate V31 scanner
skill: "code-transformation-v31", args: "scanner.py"

# 2. Run the scanner locally
skill: "code-run-validator", args: "python DailyGapScanner_v31.py"

# 3. Review results
# - Check for errors
# - Verify output format
# - Confirm scan completed

# 4. If valid, send to user
skill: "discord-file-upload", args: "DailyGapScanner_v31.py"
```

### For Backtesting
```python
# Run backtest and return results
skill: "code-run-validator", args: "python backtest.py --strategy gap-up"
```

### For Data Processing
```python
# Process data pipeline
skill: "code-run-validator", args: "python pipeline.py --input data.csv --output results.csv"
```

---

## Implementation Notes

### Required Capabilities
- Bash tool execution
- File read/write
- Discord file upload (via discord-file-upload skill)
- Timestamp generation

### Code Structure
```python
def run_code_validator(command: str, timeout: int = 300, output_file: str = None):
    """Run code and return results via Discord upload"""

    # 1. Validate command (safety check)
    validate_command(command)

    # 2. Execute with timeout
    result = subprocess.run(
        command,
        shell=True,
        capture_output=True,
        text=True,
        timeout=timeout
    )

    # 3. Format results
    results_text = format_results(result, command, timeout)

    # 4. Write to file
    if output_file is None:
        output_file = f"code_run_{get_timestamp()}.txt"
    write_file(output_file, results_text)

    # 5. Upload to Discord
    discord_upload(output_file)

    # 6. Return summary
    return summarize_result(result)
```

---

## Known Issues

| Issue | Workaround |
|-------|------------|
| **Interactive prompts** | Scripts must be fully non-interactive |
| **Long-running scans** | Use larger timeout parameter |
| **API key exposure** | Store in env vars, not in code |
| **Large output files** | Truncate to 100KB max for Discord |

---

## Best Practices

1. **Always validate code before sending** - Run through this skill first
2. **Use meaningful timeouts** - Match expected execution time
3. **Check exit codes** - Non-zero means something failed
4. **Review stderr** - Warnings often indicate real issues
5. **Preserve output** - Keep timestamped files for debugging

---

## Example Commands

```bash
# Scanner execution
python scanners/DailyGapScanner_v31.py --api_key $POLYGON_API_KEY

# Backtest
python backtest.py --scanner DailyGapScanner_v31 --start 2024-01-01 --end 2024-12-31

# Data validation
python validate_data.py --input daily_prices.parquet

# Parameter optimization
python optimize.py --scanner GapUp --param_range atr_mult:2.0:3.0:0.1
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-26 | Initial version - basic run + upload |
