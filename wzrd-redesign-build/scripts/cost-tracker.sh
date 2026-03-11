#!/bin/bash

# Enhanced Remi Cost Tracker
# Phase 0: Basic cost tracking for < $1/day budget

CONFIG_DIR="/home/mdwzrd/wzrd-redesign/configs"
LOG_DIR="/home/mdwzrd/wzrd-redesign/logs"
COST_CONFIG="$CONFIG_DIR/cost-tracker.json"
DAILY_LOG="$LOG_DIR/cost-$(date +%Y-%m-%d).log"
SUMMARY_FILE="$LOG_DIR/daily-summary.json"

# Create log directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Function to log cost
log_cost() {
    local persona=$1
    local input_tokens=$2
    local output_tokens=$3
    local timestamp=$(date -Iseconds)
    
    # Calculate costs
    local model=$(jq -r ".personas.\"$persona\".model" "$COST_CONFIG")
    local input_cost=$(jq -r ".models.\"$model\".input_cost_per_1k" "$COST_CONFIG")
    local output_cost=$(jq -r ".models.\"$model\".output_cost_per_1k" "$COST_CONFIG")
    
    local input_cost_total=$(echo "scale=6; $input_tokens * $input_cost / 1000" | bc)
    local output_cost_total=$(echo "scale=6; $output_tokens * $output_cost / 1000" | bc)
    local total_cost=$(echo "scale=6; $input_cost_total + $output_cost_total" | bc)
    
    # Log to daily file
    echo "$timestamp|$persona|$model|$input_tokens|$output_tokens|$total_cost" >> "$DAILY_LOG"
    
    # Update summary
    update_summary "$persona" "$total_cost"
    
    echo "Logged: $persona used $total_cost USD"
}

# Function to update summary
update_summary() {
    local persona=$1
    local cost=$2
    
    # Initialize summary file if it doesn't exist
    if [ ! -f "$SUMMARY_FILE" ]; then
        echo '{"date": "'$(date +%Y-%m-%d)'", "total_cost": 0, "personas": {}}' > "$SUMMARY_FILE"
    fi
    
    # Update summary
    local current_total=$(jq -r '.total_cost' "$SUMMARY_FILE")
    local new_total=$(echo "scale=6; $current_total + $cost" | bc)
    
    # Update JSON
    jq \
        --arg persona "$persona" \
        --argjson cost "$cost" \
        --argjson new_total "$new_total" \
        '.total_cost = $new_total | 
         .personas[$persona].cost = (.personas[$persona].cost // 0) + $cost |
         .personas[$persona].interactions = (.personas[$persona].interactions // 0) + 1' \
        "$SUMMARY_FILE" > "${SUMMARY_FILE}.tmp" && mv "${SUMMARY_FILE}.tmp" "$SUMMARY_FILE"
}

# Function to check budget
check_budget() {
    local daily_limit=$(jq -r '.budget.daily_limit' "$COST_CONFIG")
    local warning_threshold=$(jq -r '.cost_guards.daily_warning_threshold' "$COST_CONFIG")
    
    if [ -f "$SUMMARY_FILE" ]; then
        local current_total=$(jq -r '.total_cost' "$SUMMARY_FILE")
        local warning_limit=$(echo "scale=6; $daily_limit * $warning_threshold" | bc)
        
        if (( $(echo "$current_total >= $warning_limit" | bc -l) )); then
            echo "WARNING: Daily cost ($current_total) approaching limit ($daily_limit)"
            return 1
        fi
        
        if (( $(echo "$current_total >= $daily_limit" | bc -l) )); then
            echo "ALERT: Daily limit ($daily_limit) exceeded! Current: $current_total"
            return 2
        fi
    fi
    return 0
}

# Function to get daily summary
get_daily_summary() {
    if [ -f "$SUMMARY_FILE" ]; then
        echo "=== Daily Cost Summary ==="
        echo "Date: $(jq -r '.date' "$SUMMARY_FILE")"
        echo "Total Cost: $(jq -r '.total_cost' "$SUMMARY_FILE") USD"
        echo ""
        echo "By Persona:"
        jq -r '.personas | to_entries[] | "  \(.key): \(.value.cost) USD (\(.value.interactions) interactions)"' "$SUMMARY_FILE"
        
        local daily_limit=$(jq -r '.budget.daily_limit' "$COST_CONFIG")
        local current_total=$(jq -r '.total_cost' "$SUMMARY_FILE")
        local remaining=$(echo "scale=6; $daily_limit - $current_total" | bc)
        echo ""
        echo "Remaining Budget: $remaining USD"
    else
        echo "No cost data for today"
    fi
}

# Function to reset daily tracking
reset_daily_tracking() {
    local new_date=$(date +%Y-%m-%d)
    echo '{"date": "'$new_date'", "total_cost": 0, "personas": {}}' > "$SUMMARY_FILE"
    echo "Reset cost tracking for $new_date"
}

# Main command handler
case "$1" in
    "log")
        if [ $# -eq 4 ]; then
            log_cost "$2" "$3" "$4"
        else
            echo "Usage: $0 log <persona> <input_tokens> <output_tokens>"
        fi
        ;;
    "check")
        check_budget
        ;;
    "summary")
        get_daily_summary
        ;;
    "reset")
        reset_daily_tracking
        ;;
    "test")
        # Test logging
        echo "Testing cost tracking..."
        log_cost "remi-base" 500 300
        log_cost "coder-pro" 1000 800
        log_cost "research-deep" 800 600
        get_daily_summary
        ;;
    *)
        echo "Enhanced Remi Cost Tracker"
        echo "Usage: $0 {log|check|summary|reset|test}"
        echo ""
        echo "Commands:"
        echo "  log <persona> <input_tokens> <output_tokens>  Log cost"
        echo "  check                                         Check budget status"
        echo "  summary                                       Show daily summary"
        echo "  reset                                         Reset daily tracking"
        echo "  test                                          Run test scenario"
        ;;
esac