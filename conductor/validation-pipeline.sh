#!/bin/bash

# WZRD.dev Validation Pipeline Script
# Implements quality gates based on Stripe Minions "Validation Layer"

set -e

# Configuration
VALIDATION_CONFIG="./conductor/validation-pipeline.yaml"
CONTEXT_RULES="./conductor/context-rules.yaml"
LOG_FILE="./logs/validation-$(date +%Y%m%d-%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

# Validation functions
validate_pre_execution() {
    local task_type="$1"
    local task_description="$2"
    local token_budget="$3"
    
    log_info "=== PRE-EXECUTION VALIDATION ==="
    log_info "Task Type: $task_type"
    log_info "Description: $task_description"
    log_info "Token Budget: $token_budget"
    
    # Check requirements clarity
    if [[ ${#task_description} -lt 20 ]]; then
        log_warning "Task description may be too brief (< 20 chars). Requesting clarification."
        return 1
    fi
    
    # Check feasibility based on task type
    case "$task_type" in
        "coding")
            log_info "Coding task detected. Checking for code-specific requirements..."
            if [[ ! "$task_description" =~ (function|class|method|code|implement) ]]; then
                log_warning "Coding task may lack specific implementation details."
            fi
            ;;
        "debugging")
            log_info "Debugging task detected. Checking for error details..."
            if [[ ! "$task_description" =~ (error|bug|fail|crash|exception) ]]; then
                log_warning "Debugging task may lack error details."
            fi
            ;;
        "research")
            log_info "Research task detected. Checking for scope..."
            if [[ ${#task_description} -lt 30 ]]; then
                log_warning "Research task may need more specific scope."
            fi
            ;;
    esac
    
    # Token budget validation
    if [[ "$token_budget" -lt 1000 ]]; then
        log_warning "Token budget very low ($token_budget). Task may be underspecified."
    elif [[ "$token_budget" -gt 30000 ]]; then
        log_warning "Token budget very high ($token_budget). Task may be too large."
    fi
    
    log_success "Pre-execution validation passed"
    return 0
}

validate_mid_execution() {
    local task_type="$1"
    local progress_summary="$2"
    
    log_info "=== MID-EXECUTION VALIDATION ==="
    log_info "Validating progress for: $task_type"
    
    # Progress quality check
    if [[ ${#progress_summary} -lt 50 ]]; then
        log_warning "Progress summary may be too brief. More detail recommended."
    fi
    
    # Type-specific mid-validation
    case "$task_type" in
        "coding")
            # Check for code examples in progress
            if [[ ! "$progress_summary" =~ (def |function |class |export |import |from ) ]]; then
                log_warning "Coding progress lacks code examples. Ensure implementation details included."
            fi
            ;;
        "debugging")
            # Check for error analysis
            if [[ ! "$progress_summary" =~ (cause|root|analysis|fix|solution) ]]; then
                log_warning "Debugging progress lacks analysis. Include cause/solution details."
            fi
            ;;
    esac
    
    log_success "Mid-execution validation passed"
    return 0
}

validate_post_execution() {
    local task_type="$1"
    local results="$2"
    local success_criteria="$3"
    
    log_info "=== POST-EXECUTION VALIDATION ==="
    
    # Basic results validation
    if [[ ${#results} -lt 100 ]]; then
        log_error "Results seem too brief (< 100 chars). May not be complete."
        return 1
    fi
    
    # Type-specific validation
    case "$task_type" in
        "coding")
            # Check for executable code
            if [[ ! "$results" =~ (\`\`\`|def |function |class |return |if |for |while ) ]]; then
                log_warning "Coding results may lack executable code. Verify implementation."
            fi
            ;;
        "debugging")
            # Check for fix verification
            if [[ ! "$results" =~ (fixed|resolved|working|solved|corrected) ]]; then
                log_warning "Debugging results may not confirm fix. Verify issue resolved."
            fi
            ;;
        "research")
            # Check for sources/citations
            if [[ ! "$results" =~ (source|http|https|www\.|\.com|\.org|reference|citation) ]]; then
                log_warning "Research results may lack source citations. Include references."
            fi
            ;;
    esac
    
    # Success criteria check
    if [[ -n "$success_criteria" ]]; then
        log_info "Checking success criteria: $success_criteria"
        # Simple keyword matching for demonstration
        if [[ "$results" != *"$success_criteria"* ]] && [[ ! "$success_criteria" =~ (working|complete|done|resolved) ]]; then
            log_warning "Results may not fully address success criteria: $success_criteria"
        fi
    fi
    
    log_success "Post-execution validation passed"
    return 0
}

validate_regression() {
    local changes_summary="$1"
    
    log_info "=== REGRESSION VALIDATION ==="
    
    # Check for breaking change indicators
    local breaking_indicators=(
        "break" "remove" "delete" "deprecate" "change api" "interface change"
        "incompatible" "backward" "migration needed"
    )
    
    for indicator in "${breaking_indicators[@]}"; do
        if [[ "${changes_summary,,}" == *"${indicator}"* ]]; then
            log_warning "Potential breaking change detected: '$indicator'"
            log_warning "Regression risk: Consider impact on existing functionality"
        fi
    done
    
    # API compatibility check (simplified)
    if [[ "${changes_summary,,}" == *"api"* ]] && [[ "${changes_summary,,}" == *"change"* ]]; then
        log_warning "API changes detected. Verify backward compatibility."
    fi
    
    log_success "Regression validation passed"
    return 0
}

# Main validation pipeline
main() {
    local stage="$1"
    local task_type="$2"
    local task_description="$3"
    local additional_params="$4"
    
    # Create logs directory if needed
    mkdir -p "./logs"
    
    case "$stage" in
        "pre")
            validate_pre_execution "$task_type" "$task_description" "$additional_params"
            ;;
        "mid")
            validate_mid_execution "$task_type" "$additional_params"
            ;;
        "post")
            # Parse additional params for post-validation
            local results
            local success_criteria
            IFS='|' read -r results success_criteria <<< "$additional_params"
            validate_post_execution "$task_type" "$results" "$success_criteria"
            ;;
        "regression")
            validate_regression "$additional_params"
            ;;
        "full")
            log_info "=== FULL VALIDATION PIPELINE ==="
            validate_pre_execution "$task_type" "$task_description" "5000"
            echo "---"
            validate_mid_execution "$task_type" "Progress validation check"
            echo "---"
            validate_post_execution "$task_type" "Results would go here" "working implementation"
            echo "---"
            validate_regression "Summary of changes made"
            ;;
        *)
            echo "Usage: $0 <stage> <task_type> <description> [additional_params]"
            echo "Stages: pre, mid, post, regression, full"
            echo "Task types: coding, debugging, research, planning, thinker"
            echo ""
            echo "Examples:"
            echo "  $0 pre coding 'Write a function to parse JSON' 5000"
            echo "  $0 mid coding 'Implemented JSON parser with tests'"
            echo "  $0 post coding 'Results|working JSON parser with tests'"
            echo "  $0 regression 'Changed API endpoint response format'"
            exit 1
            ;;
    esac
}

# Run main with all arguments
main "$@"