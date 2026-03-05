#!/usr/bin/env python3
"""
SEC Filings Skill
Retrieve SEC EDGAR filings for tickers/CIKs
"""

import argparse
import json
import os
import sys
from datetime import datetime, date
from pathlib import Path
from typing import List, Dict, Any, Optional, Union

try:
    from secedgar import CompanyFilings, FilingType, DailyFilings
    from secedgar.cik_lookup import CIKLookup
except ImportError:
    print("Error: secedgar package not installed.")
    print("Run: pip install secedgar")
    sys.exit(1)


# SEC-required user agent
DEFAULT_USER_AGENT = "SEC-Filings-Skill (name@example.com)"


def get_user_agent() -> str:
    """Get SEC user agent from environment or use default."""
    return os.environ.get("SEC_USER_AGENT", DEFAULT_USER_AGENT)


def parse_filing_type(filing_type_str: str) -> Optional[FilingType]:
    """
    Parse filing type string to FilingType enum.

    Args:
        filing_type_str: Filing type (e.g., "10-K", "S-3", "424B2")

    Returns:
        FilingType enum or None if not found
    """
    # Try exact match first
    attr_name = f"FILING_{filing_type_str.upper().replace('-', '').replace('_', '')}"
    if hasattr(FilingType, attr_name):
        return getattr(FilingType, attr_name)

    # Try with dashes preserved (some FilingType names use them)
    for attr in dir(FilingType):
        if attr.startswith("FILING_"):
            type_name = attr.replace("FILING_", "").replace("_", "-")
            if type_name.upper() == filing_type_str.upper().replace("_", "-"):
                return getattr(FilingType, attr)

    return None


def resolve_tickers_to_ciks(tickers: Union[str, List[str]]) -> List[str]:
    """
    Resolve ticker symbols to CIK numbers.

    Args:
        tickers: Single ticker or list of tickers

    Returns:
        List of CIK numbers as strings
    """
    if isinstance(tickers, str):
        tickers = [t.strip().upper() for t in tickers.split(",")]

    ciks = []
    lookup = CIKLookup(tickers, user_agent=get_user_agent())

    try:
        cik_dict = lookup.get_ciks()
        for ticker in tickers:
            cik = cik_dict.get(ticker)
            if cik:
                ciks.append(cik)
            else:
                print(f"Warning: Could not resolve ticker {ticker}")
    except Exception as e:
        print(f"Error resolving tickers: {e}")

    return ciks


def get_filings(
    ticker_or_cik: Union[str, List[str]],
    filing_types: Optional[List[str]] = None,
    count: int = 10,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    user_agent: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Get filings for a ticker or CIK.

    Args:
        ticker_or_cik: Ticker symbol or CIK number(s)
        filing_types: List of filing type strings (e.g., ["10-K", "S-3"])
        count: Maximum number of filings to retrieve
        start_date: Start date string (YYYY-MM-DD)
        end_date: End date string (YYYY-MM-DD)
        user_agent: SEC user agent string

    Returns:
        Dict with filing metadata and URLs
    """
    if user_agent is None:
        user_agent = get_user_agent()

    # Resolve tickers to CIKs if needed
    cik_lookup = ticker_or_cik
    is_ticker = True

    # Check if input looks like a CIK (all digits, 10 chars)
    if isinstance(ticker_or_cik, str):
        is_ticker = not ticker_or_cik.isdigit() or len(ticker_or_cik) != 10

    if is_ticker:
        ciks = resolve_tickers_to_ciks(ticker_or_cik)
        if not ciks:
            return {
                "ticker": ticker_or_cik,
                "cik": None,
                "error": f"Could not resolve ticker: {ticker_or_cik}",
                "filings": []
            }
        cik_lookup = ciks[0]  # Use first CIK for display
    else:
        ciks = [ticker_or_cik] if isinstance(ticker_or_cik, str) else ticker_or_cik
        cik_lookup = ciks[0]

    # Parse filing types
    filing_type_enums = None
    if filing_types:
        filing_type_enums = []
        for ft in filing_types:
            ft_enum = parse_filing_type(ft)
            if ft_enum:
                filing_type_enums.append(ft_enum)
            else:
                print(f"Warning: Unknown filing type {ft}")

        # Only use first filing type for CompanyFilings (API limitation)
        filing_type = filing_type_enums[0] if filing_type_enums else None
    else:
        filing_type = None

    # Parse dates
    start = datetime.strptime(start_date, "%Y-%m-%d").date() if start_date else None
    end = datetime.strptime(end_date, "%Y-%m-%d").date() if end_date else date.today()

    # Create filings object
    filings_obj = CompanyFilings(
        cik_lookup=ciks,
        filing_type=filing_type,
        user_agent=user_agent,
        start_date=start,
        end_date=end,
        count=count,
    )

    # Get filing URLs
    try:
        # Suppress XML parsing warning
        from bs4 import XMLParsedAsHTMLWarning
        import warnings
        warnings.filterwarnings("ignore", category=XMLParsedAsHTMLWarning)

        urls_dict = filings_obj.get_urls()
        filings_list = []

        # get_urls() returns dict {cik: [url1, url2, ...]}
        for cik, url_list in urls_dict.items():
            for url in url_list:
                # Extract filing metadata by fetching the document
                filing_info = extract_filing_metadata(url, str(cik), user_agent)
                filings_list.append(filing_info)

        return {
            "ticker": ticker_or_cik if is_ticker else None,
            "cik": cik_lookup,
            "filings": filings_list,
            "count": len(filings_list)
        }
    except Exception as e:
        return {
            "ticker": ticker_or_cik if is_ticker else None,
            "cik": cik_lookup,
            "error": str(e),
            "filings": []
        }


def extract_filing_metadata(url: str, cik: str, user_agent: str) -> Dict[str, str]:
    """
    Extract filing metadata by fetching and parsing the filing document.

    Args:
        url: SEC filing URL
        cik: CIK number
        user_agent: User agent string for SEC request

    Returns:
        Dict with filing metadata including actual type and date
    """
    # URL format: https://www.sec.gov/Archives/edgar/data/CIK/ACCESSION/filename.txt
    parts = url.split("/")

    # Extract accession number (directory name)
    accession_component = parts[-2] if len(parts) >= 2 else ""
    filename = parts[-1] if parts else ""

    # Standard 10-digit CIK
    cik_padded = cik.zfill(10)

    if accession_component.startswith(cik_padded):
        year_part = accession_component[10:12]
        seq_part = accession_component[12:18]
        accession = f"{cik_padded}-{year_part}-{seq_part}"
    else:
        accession = accession_component

    # Try to fetch filing metadata from the document
    filing_type = "UNKNOWN"
    filing_date = "UNKNOWN"

    try:
        import requests
        response = requests.get(url, headers={"User-Agent": user_agent}, timeout=10)
        response.raise_for_status()

        # Parse SEC header for filing type and date
        content = response.text

        # Look for CONFORMED SUBMISSION TYPE
        for line in content.split('\n')[:50]:  # Check first 50 lines
            if 'CONFORMED SUBMISSION TYPE:' in line:
                filing_type = line.split(':')[-1].strip()
            elif 'FILED AS OF DATE:' in line:
                date_str = line.split(':')[-1].strip()
                if len(date_str) == 8 and date_str.isdigit():
                    filing_date = f"{date_str[:4]}-{date_str[4:6]}-{date_str[6:8]}"

    except Exception:
        # If fetch fails, use URL-based parsing
        if "-" in accession:
            parts_acc = accession.split("-")
            if len(parts_acc) == 3:
                year = parts_acc[1]
                if year.isdigit():
                    year_int = int(year)
                    full_year = 2000 + year_int if year_int < 50 else 1900 + year_int
                    filing_date = f"{full_year}-??-??"

    return {
        "type": filing_type,
        "filing_date": filing_date,
        "accession_number": accession,
        "cik": cik,
        "url": url,
        "filename": filename
    }


def parse_filing_url(url: str, cik: str) -> Dict[str, str]:
    """
    Parse SEC filing URL to extract metadata.

    Args:
        url: SEC filing URL
        cik: CIK number

    Returns:
        Dict with filing metadata
    """
    # URL format: https://www.sec.gov/Archives/edgar/data/CIK/ACCESSION/filename.txt
    parts = url.split("/")

    # Extract accession number (directory name)
    accession_component = parts[-2] if len(parts) >= 2 else ""
    filename = parts[-1] if parts else ""

    # The accession number in the directory format: 000032019325000079
    # This is: 10-digit CIK (0000320193) + 2-digit year (25) + 6-digit sequence (000079)
    # Convert to standard format with dashes: 0000320193-25-000079

    # Standard 10-digit CIK
    cik_padded = cik.zfill(10)

    if accession_component.startswith(cik_padded):
        # Extract year and sequence
        year_part = accession_component[10:12]  # 25
        seq_part = accession_component[12:18]     # 000079
        accession = f"{cik_padded}-{year_part}-{seq_part}"
    else:
        # Fallback - just use the directory name as accession
        accession = accession_component

    # Extract year from accession for approximate date
    filing_date = "UNKNOWN"
    if "-" in accession:
        parts_acc = accession.split("-")
        if len(parts_acc) == 3:
            year = parts_acc[1]  # "25" for 2025
            if year.isdigit():
                # Convert 2-digit year to 4-digit
                year_int = int(year)
                full_year = 2000 + year_int if year_int < 50 else 1900 + year_int
                filing_date = f"{full_year}-??-??"  # Approximate year only

    return {
        "type": "UNKNOWN",  # Need to fetch filing to get actual type
        "filing_date": filing_date,
        "accession_number": accession,
        "cik": cik,
        "url": url,
        "filename": filename
    }


def download_filings(
    ticker_or_cik: Union[str, List[str]],
    filing_types: Optional[List[str]] = None,
    count: int = 10,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    output_dir: Optional[str] = None,
    user_agent: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Download filing documents to disk.

    Args:
        ticker_or_cik: Ticker symbol or CIK number(s)
        filing_types: List of filing type strings
        count: Maximum number of filings to retrieve
        start_date: Start date string (YYYY-MM-DD)
        end_date: End date string (YYYY-MM-DD)
        output_dir: Output directory path
        user_agent: SEC user agent string

    Returns:
        Dict with download results
    """
    if user_agent is None:
        user_agent = get_user_agent()

    # Create output directory
    if output_dir is None:
        ticker_str = ticker_or_cik if isinstance(ticker_or_cik, str) else ticker_or_cik[0]
        ticker = ticker_str.split(",")[0] if "," in ticker_str else ticker_str
        output_dir = f"./sec-filings/{ticker}"

    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    # Get filing URLs
    result = get_filings(
        ticker_or_cik=ticker_or_cik,
        filing_types=filing_types,
        count=count,
        start_date=start_date,
        end_date=end_date,
        user_agent=user_agent
    )

    if "error" in result:
        return result

    downloaded = []
    failed = []

    # Download each filing
    for filing in result.get("filings", []):
        try:
            filename = filing.get("filename", filing["accession_number"])
            filepath = output_path / filename

            # Fetch and save filing
            import requests
            response = requests.get(filing["url"], headers={"User-Agent": user_agent})
            response.raise_for_status()

            with open(filepath, "w") as f:
                f.write(response.text)

            downloaded.append({
                "filename": filename,
                "filepath": str(filepath),
                "url": filing["url"]
            })
        except Exception as e:
            failed.append({
                "url": filing["url"],
                "error": str(e)
            })

    result["downloaded"] = downloaded
    result["failed"] = failed
    result["output_dir"] = str(output_path)

    return result


def get_filing_urls(
    ticker_or_cik: Union[str, List[str]],
    filing_types: Optional[List[str]] = None,
    count: int = 10,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    user_agent: Optional[str] = None,
) -> List[str]:
    """
    Get list of filing URLs only.

    Args:
        ticker_or_cik: Ticker symbol or CIK number(s)
        filing_types: List of filing type strings
        count: Maximum number of filings to retrieve
        start_date: Start date string (YYYY-MM-DD)
        end_date: End date string (YYYY-MM-DD)
        user_agent: SEC user agent string

    Returns:
        List of filing URLs
    """
    result = get_filings(
        ticker_or_cik=ticker_or_cik,
        filing_types=filing_types,
        count=count,
        start_date=start_date,
        end_date=end_date,
        user_agent=user_agent
    )

    return [f["url"] for f in result.get("filings", [])]


def list_filing_types() -> None:
    """Print available filing types."""
    print("Available SEC Filing Types:")
    print("=" * 50)

    # Common filing types first
    common = ["10-K", "10-Q", "8-K", "S-3", "424B2", "424B4", "10-K", "DEF 14A", "SC 13G"]

    print("\nCommon for Dilution Analysis:")
    for ft in common:
        print(f"  {ft}")

    print("\nAll Available:")
    all_types = []
    for attr in sorted(dir(FilingType)):
        if attr.startswith("FILING_"):
            type_name = attr.replace("FILING_", "").replace("_", "-")
            all_types.append(type_name)

    for ft in all_types:
        print(f"  {ft}")


def main() -> None:
    """CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Retrieve SEC EDGAR filings for tickers/CIKs",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s AAPL --filing-type 10-K,10-Q --count 5
  %(prog)s XYZ --filing-type S-3,424B2,424B4
  %(prog)s AAPL,MSFT --start-date 2024-01-01 --end-date 2024-12-31
  %(prog)s AAPL --format urls --count 20
  %(prog)s --list-types
        """
    )

    parser.add_argument(
        "ticker",
        nargs="?",
        help="Ticker symbol or CIK (comma-separated for multiple)"
    )
    parser.add_argument(
        "--filing-type", "-t",
        help="Filing type(s) (comma-separated, e.g., 10-K,10-Q,S-3)"
    )
    parser.add_argument(
        "--count", "-n",
        type=int,
        default=10,
        help="Number of filings to retrieve (default: 10)"
    )
    parser.add_argument(
        "--start-date",
        help="Start date (YYYY-MM-DD)"
    )
    parser.add_argument(
        "--end-date",
        help="End date (YYYY-MM-DD, default: today)"
    )
    parser.add_argument(
        "--output", "-o",
        help="Output directory (default: ./sec-filings/<TICKER>)"
    )
    parser.add_argument(
        "--format", "-f",
        choices=["json", "urls", "files"],
        default="json",
        help="Output format (default: json)"
    )
    parser.add_argument(
        "--user-agent",
        help="SEC user agent string (or set SEC_USER_AGENT env var)"
    )
    parser.add_argument(
        "--list-types",
        action="store_true",
        help="List all available filing types and exit"
    )

    args = parser.parse_args()

    if args.list_types:
        list_filing_types()
        return

    if not args.ticker:
        parser.print_help()
        return

    # Parse filing types
    filing_types = None
    if args.filing_type:
        filing_types = [ft.strip() for ft in args.filing_type.split(",")]

    # Execute based on format
    if args.format == "json":
        result = get_filings(
            ticker_or_cik=args.ticker,
            filing_types=filing_types,
            count=args.count,
            start_date=args.start_date,
            end_date=args.end_date,
            user_agent=args.user_agent
        )
        print(json.dumps(result, indent=2))

    elif args.format == "urls":
        urls = get_filing_urls(
            ticker_or_cik=args.ticker,
            filing_types=filing_types,
            count=args.count,
            start_date=args.start_date,
            end_date=args.end_date,
            user_agent=args.user_agent
        )
        for url in urls:
            print(url)

    elif args.format == "files":
        result = download_filings(
            ticker_or_cik=args.ticker,
            filing_types=filing_types,
            count=args.count,
            start_date=args.start_date,
            end_date=args.end_date,
            output_dir=args.output,
            user_agent=args.user_agent
        )
        print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
