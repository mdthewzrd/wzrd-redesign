# SEC Filings Skill

Extract and retrieve SEC EDGAR filings for any ticker or CIK.

## Installation

```bash
pip install secedgar
```

## Usage

### Basic Usage - Pull filings for a ticker

```bash
/sec-filings <TICKER> [options]
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--filing-type` | Filing type (10-K, 10-Q, S-3, 424B2, 424B4, 8-K, etc.) | All filings |
| `--count` | Number of filings to retrieve | 10 |
| `--start-date` | Start date (YYYY-MM-DD) | No limit |
| `--end-date` | End date (YYYY-MM-DD) | Today |
| `--output` | Output directory for downloaded filings | `./sec-filings/<TICKER>` |
| `--format` | Output format: `json`, `urls`, or `files` | `json` |
| `--user-agent` | SEC user agent string (required) | `name@example.com` |

### Examples

```bash
# Pull latest 10-K and 10-Q filings for AAPL
/sec-filings AAPL --filing-type 10-K,10-Q --count 5

# Pull all S-3 and 424B2 filings for dilution analysis
/sec-filings XYZ --filing-type S-3,424B2,424B4

# Pull filings within a date range
/sec-filings XYZ --start-date 2024-01-01 --end-date 2024-12-31

# Get URLs only (no download)
/sec-filings AAPL --format urls --count 20

# Download files to specific directory
/sec-filings XYZ --output ~/filings/XYZ
```

### Multiple Tickers

```bash
/sec-filings AAPL,MSFT,GOOGL --count 5
```

### Common Filing Types for Dilution Analysis

| Filing Type | Purpose |
|-------------|---------|
| `S-3` | Registration statement (shelf offering) |
| `424B2` | Prospectus supplement (pricing) |
| `424B4` | Free writing prospectus |
| `8-K` | Material events (convertible note issuances) |
| `10-K` | Annual report (balance sheet, shares outstanding) |
| `10-Q` | Quarterly report |
| `DEF 14A` | Proxy statement (share count, ownership) |
| `SC 13G` | Beneficial ownership (>5%) |

## SEC EDGAR Requirements

The SEC requires a proper `User-Agent` header with your email. The skill will use:

```
User-Agent: SEC-Filings-Skill (name@example.com)
```

Update this in your environment:

```bash
export SEC_USER_AGENT="Your Name (your.email@example.com)"
```

## Output Formats

### JSON (default)
Returns structured JSON with filing metadata:
```json
{
  "ticker": "AAPL",
  "cik": "0000320193",
  "filings": [
    {
      "type": "10-K",
      "filing_date": "2024-01-28",
      "accession_number": "0000320193-24-000013",
      "url": "https://...",
      "form_name": "Form 10-K"
    }
  ]
}
```

### URLs
Returns a list of filing URLs only.

### Files
Downloads filing documents to the output directory.

## Rate Limits

SEC EDGAR enforces rate limits:
- Max 10 requests/second
- Be respectful and add delays between requests

## Notes

- Tickers are automatically resolved to CIKs
- File downloads include full submission and exhibits
- Invalid tickers return an error
- Filing dates are in UTC
