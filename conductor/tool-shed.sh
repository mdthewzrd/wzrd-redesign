#!/bin/bash

# WZRD.dev Tool Shed Meta-Layer Script
# Skill registry with dependency resolution and recommendations

set -e

# Configuration
TOOLSHED_CONFIG="./conductor/tool-shed.yaml"
TOOLSHED_DYNAMIC="./conductor/tool-shed-dynamic.yaml"
TOOLSHED_DYNAMIC="./conductor/tool-shed-dynamic.yaml"
TOOLSHED_DYNAMIC="./conductor/tool-shed-dynamic.yaml"
TOOLSHED_DYNAMIC="./conductor/tool-shed-dynamic.yaml"
TOOLSHED_DYNAMIC="./conductor/tool-shed-dynamic.yaml"
TOOLSHED_DYNAMIC="./conductor/tool-shed-dynamic.yaml"
SKILLS_DIR="/home/mdwzrd/wzrd-redesign/.agents/skills"
LOG_FILE="./logs/tool-shed-$(date +%Y%m%d-%H%M%S).log"

# Colors for output
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[TOOL SHED]${NC} $1" | tee -a "$LOG_FILE"
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

log_recommendation() {
    echo -e "${PURPLE}[RECOMMEND]${NC} $1" | tee -a "$LOG_FILE"
}

# Skill discovery
discover_skills() {
    local pattern="$1"
    
    log_info "Discovering skills matching: $pattern"
    
    # Find skills by pattern (case-insensitive)
    local skills=()
    if [[ -n "$pattern" ]]; then
        # Try direct match first
        skills=($(find "$SKILLS_DIR" -maxdepth 1 -type d -iname "*${pattern}*" -exec basename {} \; 2>/dev/null | sort))
        
        # If no direct matches, try keyword matching
        if [[ ${#skills[@]} -eq 0 ]]; then
            # Extract keywords from pattern
            local keywords=($(echo "$pattern" | tr ' ' '\n' | grep -v "^$"))
            for keyword in "${keywords[@]}"; do
                skills+=($(find "$SKILLS_DIR" -maxdepth 1 -type d -iname "*${keyword}*" -exec basename {} \; 2>/dev/null))
            done
            # Remove duplicates
            skills=($(echo "${skills[@]}" | tr ' ' '\n' | sort -u))
        fi
    else
        skills=($(ls -1 "$SKILLS_DIR" 2>/dev/null | sort))
    fi
    
    if [[ ${#skills[@]} -eq 0 ]]; then
        log_warning "No skills found matching pattern: $pattern"
        return 1
    fi
    
    echo "Found ${#skills[@]} skills:" | tee -a "$LOG_FILE"
    for skill in "${skills[@]}"; do
        echo "  • $skill" | tee -a "$LOG_FILE"
    done
    
    return 0
}

# Skill dependency resolution
resolve_dependencies() {
    local skills="$1"
    local mode="$2"
    
    log_info "Resolving dependencies for skills: $skills"
    log_info "Mode: $mode"
    
    # Core dependencies (always required)
    local core_deps=("context-driven-development" "gold-standard")
    
    # Mode-specific dependencies
    local mode_deps=()
    case "$mode" in
        "coding")
            mode_deps=("coding" "testing" "git")
            ;;
        "debugging")
            mode_deps=("debugging" "testing")
            ;;
        "research")
            mode_deps=("research" "documentation")
            ;;
        "planning")
            mode_deps=("planning" "architecture")
            ;;
        "thinker")
            mode_deps=("brainstorming" "context")
            ;;
        *)
            mode_deps=("coding" "testing")
            ;;
    esac
    
    # Combine all dependencies
    local all_deps=("${core_deps[@]}" "${mode_deps[@]}")
    
    # Remove duplicates
    local unique_deps=($(echo "${all_deps[@]}" | tr ' ' '\n' | sort -u))
    
    echo "Required dependencies:" | tee -a "$LOG_FILE"
    for dep in "${unique_deps[@]}"; do
        # Check if dependency exists
        if [[ -d "$SKILLS_DIR/$dep" ]]; then
            echo "  ✓ $dep (available)" | tee -a "$LOG_FILE"
        else
            echo "  ✗ $dep (missing)" | tee -a "$LOG_FILE"
        fi
    done
    
    return 0
}

# Skill recommendations
recommend_skills() {
    local task="$1"
    local mode="$2"
    local complexity="$3"
    
    log_info "Generating skill recommendations"
    log_info "Task: $task"
    log_info "Mode: $mode"
    log_info "Complexity: $complexity"
    
    # Task-based recommendations
    local task_skills=()
    case "$task" in
        *web*|*react*|*next*)
            task_skills=("react-ui-master" "nextjs-app-router-patterns" "tailwind-design-system")
            log_recommendation "Web development detected, recommending React/Next.js skills"
            ;;
        *api*|*backend*)
            task_skills=("api-design-principles" "fastapi-templates" "nodejs-backend-patterns")
            log_recommendation "API development detected, recommending backend skills"
            ;;
        *mobile*|*react-native*)
            task_skills=("react-native-architecture" "react-native-design")
            log_recommendation "Mobile development detected, recommending React Native skills"
            ;;
        *data*|*analytics*)
            task_skills=("data-quality-frameworks" "dbt-transformation-patterns")
            log_recommendation "Data engineering detected, recommending data skills"
            ;;
        *docker*|*k8s*|*infrastructure*)
            task_skills=("docker" "k8s-manifest-generator" "terraform-module-library")
            log_recommendation "Infrastructure detected, recommending DevOps skills"
            ;;
        *security*|*compliance*)
            task_skills=("security" "stride-analysis-patterns" "sast-configuration")
            log_recommendation "Security detected, recommending security skills"
            ;;
        *ai*|*ml*|*llm*)
            task_skills=("llm-evaluation" "rag-implementation" "prompt-engineering-patterns")
            log_recommendation "AI/ML detected, recommending AI skills"
            ;;
    esac
    
    # Complexity-based recommendations
    local complexity_skills=()
    case "$complexity" in
        "simple")
            complexity_skills=("coding" "debugging" "testing")
            ;;
        "medium")
            complexity_skills=("coding" "debugging" "testing" "git" "file-ops" "documentation")
            ;;
        "complex")
            complexity_skills=("coding" "debugging" "testing" "git" "file-ops" "documentation" "architecture" "planning" "security")
            ;;
        *)
            complexity_skills=("coding" "debugging" "testing")
            ;;
    esac
    
    # Combine recommendations
    local all_recommendations=("${task_skills[@]}" "${complexity_skills[@]}")
    local unique_recommendations=($(echo "${all_recommendations[@]}" | tr ' ' '\n' | sort -u))
    
    echo "Skill recommendations:" | tee -a "$LOG_FILE"
    for rec in "${unique_recommendations[@]}"; do
        # Check if recommended skill exists
        if [[ -d "$SKILLS_DIR/$rec" ]]; then
            echo "  → $rec" | tee -a "$LOG_FILE"
        else
            log_warning "Recommended skill '$rec' not found in skills directory"
        fi
    done
    
    # Suggest maximum number of skills based on complexity
    local max_skills
    case "$complexity" in
        "simple") max_skills=3 ;;
        "medium") max_skills=8 ;;
        "complex") max_skills=15 ;;
        *) max_skills=5 ;;
    esac
    
    if [[ ${#unique_recommendations[@]} -gt $max_skills ]]; then
        log_warning "Too many recommendations (${#unique_recommendations[@]}) for $complexity task (max: $max_skills)"
        log_recommendation "Consider focusing on core skills first"
    fi
    
    return 0
}

# Skill compatibility check
check_compatibility() {
    local skills="$1"
    
    log_info "Checking skill compatibility"
    
    # Check for incompatible pairs
    local incompatible_pairs=(
        "test-driven-development verification-before-completion"
        "systematic-debugging parallel-debugging"
        "bash-defensive-patterns shellcheck-configuration"
    )
    
    # Convert skills string to array
    IFS=',' read -ra skill_array <<< "$skills"
    
    for pair in "${incompatible_pairs[@]}"; do
        IFS=' ' read -ra pair_array <<< "$pair"
        skill1="${pair_array[0]}"
        skill2="${pair_array[1]}"
        
        if [[ " ${skill_array[@]} " =~ " $skill1 " ]] && [[ " ${skill_array[@]} " =~ " $skill2 " ]]; then
            log_warning "Incompatible skill pair detected: $skill1 and $skill2"
            log_recommendation "Consider using only one of these skills"
        fi
    done
    
    # Check load order requirements
    if [[ " ${skill_array[@]} " =~ " coding " ]] && [[ ! " ${skill_array[@]} " =~ " context-driven-development " ]]; then
        log_warning "'coding' skill recommended after 'context-driven-development'"
    fi
    
    if [[ " ${skill_array[@]} " =~ " testing " ]] && [[ ! " ${skill_array[@]} " =~ " coding " ]]; then
        log_warning "'testing' skill recommended after 'coding'"
    fi
    
    echo "Compatibility check complete" | tee -a "$LOG_FILE"
    return 0
}

# Skill loading simulation
simulate_skill_loading() {
    local skills="$1"
    
    log_info "Simulating skill loading"
    
    # Convert skills string to array
    IFS=',' read -ra skill_array <<< "$skills"
    
    # Check each skill exists
    local missing_skills=()
    local available_skills=()
    
    for skill in "${skill_array[@]}"; do
        skill=$(echo "$skill" | xargs)  # Trim whitespace
        if [[ -d "$SKILLS_DIR/$skill" ]]; then
            available_skills+=("$skill")
        else
            missing_skills+=("$skill")
        fi
    done
    
    # Report results
    if [[ ${#available_skills[@]} -gt 0 ]]; then
        echo "Available skills (${#available_skills[@]}):" | tee -a "$LOG_FILE"
        for skill in "${available_skills[@]}"; do
            echo "  ✓ $skill" | tee -a "$LOG_FILE"
        done
    fi
    
    if [[ ${#missing_skills[@]} -gt 0 ]]; then
        echo "Missing skills (${#missing_skills[@]}):" | tee -a "$LOG_FILE"
        for skill in "${missing_skills[@]}"; do
            echo "  ✗ $skill" | tee -a "$LOG_FILE"
        done
        log_warning "Some skills are missing from skills directory"
    fi
    
    # Calculate success rate
    local total_skills=$((${#available_skills[@]} + ${#missing_skills[@]}))
    if [[ $total_skills -gt 0 ]]; then
        local success_rate=$((100 * ${#available_skills[@]} / $total_skills))
        echo "Skill loading success rate: ${success_rate}%" | tee -a "$LOG_FILE"
    fi
    
    return 0
}

# Main function
main() {
    local action="$1"
    shift
    
    # Create logs directory
    mkdir -p "./logs"
    
    case "$action" in
  "discover")
    update_discover_skills "$1"
            ;;
        "dependencies")
            resolve_dependencies "$1" "$2"
            ;;
        "recommend")
            recommend_skills "$1" "$2" "$3"
            ;;
        "compatibility")
            check_compatibility "$1"
            ;;
        "simulate")
            simulate_skill_loading "$1"
            ;;
        "full")
            local task="$1"
            local mode="$2"
            local complexity="$3"
            
    # Check for skill updates
    # Check for skill updates
    log_info "Checking for skill updates..."
    if ./conductor/update-tool-shed.sh check; then
        log_info "Skills updated, updating configuration"
        ./conductor/update-tool-shed.sh force
    fi
    # Check for skill updates
    log_info "Checking for skill updates..."
    if ./conductor/update-tool-shed.sh check; then
        log_info "Skills updated, reloading configuration"
        load_dynamic_config
    fi
            log_info "=== FULL TOOL SHED ANALYSIS ==="
            echo "" | tee -a "$LOG_FILE"
            
            # Step 1: Discover relevant skills
            discover_skills "$task"
            echo "" | tee -a "$LOG_FILE"
            
            # Step 2: Resolve dependencies
            resolve_dependencies "coding,testing,debugging" "$mode"
            echo "" | tee -a "$LOG_FILE"
            
            # Step 3: Get recommendations
            recommend_skills "$task" "$mode" "$complexity"
            echo "" | tee -a "$LOG_FILE"
            
            # Step 4: Check compatibility
            check_compatibility "coding,testing,debugging,git,file-ops"
            echo "" | tee -a "$LOG_FILE"
            
            # Step 5: Simulate loading
            simulate_skill_loading "coding,testing,debugging,git,file-ops,documentation"
            ;;
        *)
            echo "Usage: $0 <action> [parameters]"
            echo ""
            echo "Actions:"
            echo "  discover <pattern>          - Discover skills matching pattern"
            echo "  dependencies <skills> <mode> - Resolve skill dependencies"
            echo "  recommend <task> <mode> <complexity> - Get skill recommendations"
            echo "  compatibility <skills>      - Check skill compatibility"
            echo "  simulate <skills>           - Simulate skill loading"
            echo "  full <task> <mode> <complexity> - Run full analysis"
            echo ""
            echo "Examples:"
            echo "  $0 discover react"
            echo "  $0 dependencies 'coding,testing' coding"
            echo "  $0 recommend 'Build web app' coding medium"
            echo "  $0 compatibility 'coding,testing,debugging'"
            echo "  $0 simulate 'coding,testing,git,file-ops'"
            echo "  $0 full 'API development' coding complex"
            exit 1
            ;;
    esac
    
    log_success "Tool shed operation complete: $action"
    echo "Log: $LOG_FILE" | tee -a "$LOG_FILE"
}

# Run main with all arguments
main "$@"
# Load dynamic skill configuration
load_dynamic_config() {
    if [[ -f "$TOOLSHED_DYNAMIC" ]]; then
        log_info "Loading dynamic skill configuration"
        # Parse dynamic config for skill counts
        local total_skills=$(grep "total:" "$TOOLSHED_DYNAMIC" | awk '{print $2}')
        echo "Total skills available: $total_skills" | tee -a "$LOG_FILE"
    else
        log_warning "Dynamic configuration not found, running update"
        ./conductor/update-tool-shed.sh
    fi
}

# Update discover_skills to use dynamic config
update_discover_skills() {
    local pattern="$1"
    
    # Load dynamic config first
    load_dynamic_config
    
    # Call original discover_skills
    discover_skills "$pattern"
}

# Load dynamic skill configuration
load_dynamic_config() {
    if [[ -f "$TOOLSHED_DYNAMIC" ]]; then
        log_info "Loading dynamic skill configuration"
        # Parse dynamic config for skill counts
        local total_skills=$(grep "total:" "$TOOLSHED_DYNAMIC" | awk '{print $2}')
        echo "Total skills available: $total_skills" | tee -a "$LOG_FILE"
    else
        log_warning "Dynamic configuration not found, running update"
        ./conductor/update-tool-shed.sh
    fi
}

# Update discover_skills to use dynamic config
update_discover_skills() {
    local pattern="$1"
    
    # Load dynamic config first
    load_dynamic_config
    
    # Call original discover_skills
    discover_skills "$pattern"
}

# Load dynamic skill configuration
load_dynamic_config() {
    if [[ -f "$TOOLSHED_DYNAMIC" ]]; then
        log_info "Loading dynamic skill configuration"
        # Parse dynamic config for skill counts
        local total_skills=$(grep "total:" "$TOOLSHED_DYNAMIC" | awk '{print $2}')
        echo "Total skills available: $total_skills" | tee -a "$LOG_FILE"
    else
        log_warning "Dynamic configuration not found, running update"
        ./conductor/update-tool-shed.sh
    fi
}

# Update discover_skills to use dynamic config
update_discover_skills() {
    local pattern="$1"
    
    # Load dynamic config first
    load_dynamic_config
    
    # Call original discover_skills
    discover_skills "$pattern"
}

# Load dynamic skill configuration
load_dynamic_config() {
    if [[ -f "$TOOLSHED_DYNAMIC" ]]; then
        log_info "Loading dynamic skill configuration"
        # Parse dynamic config for skill counts
        local total_skills=$(grep "total:" "$TOOLSHED_DYNAMIC" | awk '{print $2}')
        echo "Total skills available: $total_skills" | tee -a "$LOG_FILE"
    else
        log_warning "Dynamic configuration not found, running update"
        ./conductor/update-tool-shed.sh
    fi
}

# Update discover_skills to use dynamic config
update_discover_skills() {
    local pattern="$1"
    
    # Load dynamic config first
    load_dynamic_config
    
    # Call original discover_skills
    discover_skills "$pattern"
}

# Load dynamic skill configuration
load_dynamic_config() {
    if [[ -f "$TOOLSHED_DYNAMIC" ]]; then
        log_info "Loading dynamic skill configuration"
        # Parse dynamic config for skill counts
        local total_skills=$(grep "total:" "$TOOLSHED_DYNAMIC" | awk '{print $2}')
        echo "Total skills available: $total_skills" | tee -a "$LOG_FILE"
    else
        log_warning "Dynamic configuration not found, running update"
        ./conductor/update-tool-shed.sh
    fi
}

# Update discover_skills to use dynamic config
update_discover_skills() {
    local pattern="$1"
    
    # Load dynamic config first
    load_dynamic_config
    
    # Call original discover_skills
    discover_skills "$pattern"
}

# Load dynamic skill configuration
load_dynamic_config() {
    if [[ -f "$TOOLSHED_DYNAMIC" ]]; then
        log_info "Loading dynamic skill configuration"
        # Parse dynamic config for skill counts
        local total_skills=$(grep "total:" "$TOOLSHED_DYNAMIC" | awk '{print $2}')
        echo "Total skills available: $total_skills" | tee -a "$LOG_FILE"
    else
        log_warning "Dynamic configuration not found, running update"
        ./conductor/update-tool-shed.sh
    fi
}

# Update discover_skills to use dynamic config
update_discover_skills() {
    local pattern="$1"
    
    # Load dynamic config first
    load_dynamic_config
    
    # Call original discover_skills
    discover_skills "$pattern"
}
