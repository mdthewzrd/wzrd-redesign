#!/bin/bash
# WZRD Compact Aliases - Source this in your shell

# Main compact command
alias compact='bash ~/wzrd-redesign/wzrd-compact-solution.sh compact'

# Status check
alias compact-status='bash ~/wzrd-redesign/wzrd-compact-solution.sh status'

# Token check
alias compact-check='bash ~/wzrd-redesign/wzrd-compact-solution.sh check'

# Start monitor
alias compact-monitor='bash ~/wzrd-redesign/wzrd-compact-solution.sh monitor'

# Stop monitor
alias compact-stop='bash ~/wzrd-redesign/wzrd-compact-solution.sh stop'

echo "WZRD Compact aliases loaded:"
echo "  compact        - True compact (like Claude)"
echo "  compact-status - Show status"
echo "  compact-check  - Check token usage"
echo "  compact-monitor- Start auto-monitor"
echo "  compact-stop   - Stop auto-monitor"