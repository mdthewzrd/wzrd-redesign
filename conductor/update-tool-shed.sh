#!/bin/bash

# WZRD.dev Tool Shed Auto-Update Script
# Automatically updates tool shed registry when skills are added

set -e

# Configuration
SKILLS_DIR="/home/mdwzrd/wzrd-redesign/.agents/skills"
TOOLSHED_CONFIG="./conductor/tool-shed.yaml"
TOOLSHED_DYNAMIC="./conductor/tool-shed-dynamic.yaml"
LOG_FILE="./logs/tool-shed-update-$(date +%Y%m%d-%H%M%S).log"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[TOOL SHED UPDATE]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Get all current skills
get_all_skills() {
    find "$SKILLS_DIR" -maxdepth 1 -type d -exec basename {} \; | grep -v '^skills$' | sort
}

# Categorize skill based on name
categorize_skill() {
    local skill="$1"
    
    # Convert to lowercase for matching
    local skill_lower="${skill,,}"
    
    # Development skills
    if [[ "$skill_lower" =~ (python|javascript|typescript|java|csharp|go|rust|code|test|debug|git|file|doc|react|next|angular|vue|svelte|node|dotnet) ]]; then
        echo "development"
        return 0
    fi
    
    # Architecture skills
    if [[ "$skill_lower" =~ (architect|design|plan|microservice|api|cqrs|saga|event|projection|workflow|database|sql|table) ]]; then
        echo "architecture"
        return 0
    fi
    
    # Infrastructure skills
    if [[ "$skill_lower" =~ (docker|kubernetes|k8s|terraform|helm|istio|linkerd|mesh|ci|cd|gitlab|github|airflow|spark|pipeline|cloud|multi) ]]; then
        echo "infrastructure"
        return 0
    fi
    
    # Security skills
    if [[ "$skill_lower" =~ (security|stride|attack|threat|mitigation|sast|mtls|k8s-security|anti-reversing|binary|memory|forensic|protocol|pci|gdpr|secret) ]]; then
        echo "security"
        return 0
    fi
    
    # AI/ML skills
    if [[ "$skill_lower" =~ (llm|ai|ml|prompt|rag|embedding|similarity|vector|hybrid|search|langchain) ]]; then
        echo "ai_ml"
        return 0
    fi
    
    # Business skills
    if [[ "$skill_lower" =~ (competitive|market|startup|financial|team|kpi|billing|stripe|paypal|defi|nft|backtest|risk) ]]; then
        echo "business"
        return 0
    fi
    
    # UI/UX skills
    if [[ "$skill_lower" =~ (ui|ux|visual|design|interaction|responsive|accessibility|screen|wcag|mobile|ios|android|tailwind|shadcn|theme|component) ]]; then
        echo "ui_ux"
        return 0
    fi
    
    # Data skills
    if [[ "$skill_lower" =~ (data|analysis|quality|story|dbt|transform) ]]; then
        echo "data"
        return 0
    fi
    
    # Default category
    echo "development"
}

# Generate dynamic tool shed configuration
generate_dynamic_config() {
    log_info "Generating dynamic tool shed configuration"
    
    # Get all skills
    local skills=($(get_all_skills))
    local skill_count=${#skills[@]}
    
    log_info "Found $skill_count skills to categorize"
    
    # Create dynamic YAML
    cat > "$TOOLSHED_DYNAMIC" << EOF
# WZRD.dev Tool Shed - Dynamic Configuration
# Auto-generated on $(date)
# Total skills: $skill_count

version: "1.0"
description: "Auto-generated skill registry"

# Skill Counts by Category
skill_counts:
  total: $skill_count
  development: 0
  architecture: 0
  infrastructure: 0
  security: 0
  ai_ml: 0
  business: 0
  ui_ux: 0
  data: 0

# Auto-categorized Skills
categories:
EOF
    
    # Initialize category arrays
    declare -A category_skills
    category_skills["development"]=""
    category_skills["architecture"]=""
    category_skills["infrastructure"]=""
    category_skills["security"]=""
    category_skills["ai_ml"]=""
    category_skills["business"]=""
    category_skills["ui_ux"]=""
    category_skills["data"]=""
    
    # Categorize each skill
    for skill in "${skills[@]}"; do
        local category=$(categorize_skill "$skill")
        category_skills["$category"]+="\"$skill\" "
    done
    
    # Write each category to YAML
    for category in "${!category_skills[@]}"; do
        # Count skills in category
        local skill_list="${category_skills[$category]}"
        local skill_array=($skill_list)
        local count=${#skill_array[@]}
        
        # Update skill counts
        sed -i "s/  $category: 0/  $category: $count/" "$TOOLSHED_DYNAMIC"
        
        # Write category section
        cat >> "$TOOLSHED_DYNAMIC" << EOF
  $category:
    description: "Auto-categorized $category skills"
    count: $count
    skills:
EOF
        
        # Write each skill (clean quotes)
        for skill in "${skill_array[@]}"; do
            # Remove any existing quotes
            local clean_skill=$(echo "$skill" | sed 's/^"//;s/"$//;s/^'"'"'//;s/'"'"'$//')
            echo "      - \"$clean_skill\"" >> "$TOOLSHED_DYNAMIC"
        done
        
        # Add empty line between categories
        echo "" >> "$TOOLSHED_DYNAMIC"
    done
    
    # Add skill discovery metadata
    cat >> "$TOOLSHED_DYNAMIC" << EOF
# Discovery Metadata
discovery:
  last_updated: "$(date -Iseconds)"
  source_directory: "$SKILLS_DIR"
  auto_categorization: "keyword-based"
  update_frequency: "on_change"

# Integration Instructions
integration:
  with_tool_shed_sh: "This file is automatically included by tool-shed.sh"
  with_skill_loader: "Skills are auto-discovered during loading"
  with_blueprint_engine: "Skill recommendations use this categorization"
EOF
    
    log_success "Dynamic configuration generated: $TOOLSHED_DYNAMIC"
    echo "Categorized $skill_count skills:" | tee -a "$LOG_FILE"
    
    for category in "${!category_skills[@]}"; do
        local skill_list="${category_skills[$category]}"
        local skill_array=($skill_list)
        local count=${#skill_array[@]}
        echo "  $category: $count skills" | tee -a "$LOG_FILE"
    done
}

# Check for skill changes
check_for_changes() {
    log_info "Checking for skill changes"
    
    # Create skills snapshot file
    local snapshot_file="./logs/skills-snapshot.txt"
    
    # Get current skills list
    local current_skills=$(get_all_skills | sort)
    
    # Check if snapshot exists
    if [[ -f "$snapshot_file" ]]; then
        local previous_skills=$(cat "$snapshot_file")
        
        # Compare current vs previous
        if [[ "$current_skills" != "$previous_skills" ]]; then
            log_info "Skills have changed, updating tool shed"
            
            # Find added/removed skills
            local added_skills=$(comm -13 <(echo "$previous_skills") <(echo "$current_skills"))
            local removed_skills=$(comm -23 <(echo "$previous_skills") <(echo "$current_skills"))
            
            if [[ -n "$added_skills" ]]; then
                log_info "Added skills:"
                echo "$added_skills" | while read skill; do
                    echo "  + $skill" | tee -a "$LOG_FILE"
                done
            fi
            
            if [[ -n "$removed_skills" ]]; then
                log_warning "Removed skills:"
                echo "$removed_skills" | while read skill; do
                    echo "  - $skill" | tee -a "$LOG_FILE"
                done
            fi
            
            # Update snapshot
            echo "$current_skills" > "$snapshot_file"
            return 0  # Changes detected
        else
            log_info "No skill changes detected"
            return 1  # No changes
        fi
    else
        log_info "Creating initial skills snapshot"
        echo "$current_skills" > "$snapshot_file"
        return 0  # First run, treat as changes
    fi
}

# Update tool shed main script
update_tool_shed_script() {
    log_info "Updating tool-shed.sh to use dynamic configuration"
    
    # Check if tool-shed.sh exists
    if [[ ! -f "./conductor/tool-shed.sh" ]]; then
        log_warning "tool-shed.sh not found, skipping update"
        return 1
    fi
    
    # Create backup
    cp "./conductor/tool-shed.sh" "./conductor/tool-shed.sh.backup-$(date +%Y%m%d)"
    
    # Update the configuration loading
    sed -i 's|TOOLSHED_CONFIG="./conductor/tool-shed.yaml"|TOOLSHED_CONFIG="./conductor/tool-shed.yaml"\nTOOLSHED_DYNAMIC="./conductor/tool-shed-dynamic.yaml"|' "./conductor/tool-shed.sh"
    
    # Add dynamic configuration loading function
    cat >> "./conductor/tool-shed.sh" << 'EOF'

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
EOF
    
    # Replace discover_skills call in main
    sed -i 's/discover_skills "$1"/update_discover_skills "$1"/' "./conductor/tool-shed.sh"
    
    # Add update check to main
    sed -i '/log_info "=== FULL TOOL SHED ANALYSIS ==="/i \
    # Check for skill updates\n    log_info "Checking for skill updates..."\n    if ./conductor/update-tool-shed.sh check; then\n        log_info "Skills updated, reloading configuration"\n        load_dynamic_config\n    fi' "./conductor/tool-shed.sh"
    
    log_success "Tool shed script updated to use dynamic configuration"
}

# Set up file watcher
setup_file_watcher() {
    log_info "Setting up skill directory file watcher"
    
    # Create file watcher script
    cat > "./conductor/watch-skills.sh" << 'EOF'
#!/bin/bash
# Watch skills directory for changes and auto-update tool shed

SKILLS_DIR="/home/mdwzrd/wzrd-redesign/.agents/skills"
LOG_DIR="./logs"

# Ensure log directory exists
mkdir -p "$LOG_DIR"

echo "Starting skill directory watcher..."
echo "Watching: $SKILLS_DIR"
echo "Logs: $LOG_DIR/watcher.log"

# Use inotifywait to watch for directory changes
while true; do
    if command -v inotifywait &> /dev/null; then
        # Linux with inotify
        inotifywait -r -e create,delete,move,modify "$SKILLS_DIR" 2>/dev/null && \
            echo "[$(date)] Skill directory changed" >> "$LOG_DIR/watcher.log" && \
            ./conductor/update-tool-shed.sh auto >> "$LOG_DIR/watcher.log" 2>&1
    elif command -v fswatch &> /dev/null; then
        # macOS with fswatch
        fswatch -1 "$SKILLS_DIR" 2>/dev/null && \
            echo "[$(date)] Skill directory changed" >> "$LOG_DIR/watcher.log" && \
            ./conductor/update-tool-shed.sh auto >> "$LOG_DIR/watcher.log" 2>&1
    else
        # Fallback: poll every 60 seconds
        echo "[$(date)] No file watching tool available, polling every 60s" >> "$LOG_DIR/watcher.log"
        sleep 60
        ./conductor/update-tool-shed.sh check >> "$LOG_DIR/watcher.log" 2>&1
    fi
done
EOF
    
    chmod +x "./conductor/watch-skills.sh"
    
    log_info "File watcher script created: ./conductor/watch-skills.sh"
    log_info "To start watcher: ./conductor/watch-skills.sh &"
}

# Main function
main() {
    local action="${1:-auto}"
    
    # Create logs directory
    mkdir -p "./logs"
    
    case "$action" in
        "auto")
            # Automatic update (check for changes first)
            if check_for_changes; then
                generate_dynamic_config
                update_tool_shed_script
                log_success "Tool shed auto-updated successfully"
            else
                log_info "No changes detected, tool shed is up to date"
            fi
            ;;
        "force")
            # Force update regardless of changes
            generate_dynamic_config
            update_tool_shed_script
            log_success "Tool shed force-updated successfully"
            ;;
        "check")
            # Just check for changes, return exit code
            if check_for_changes; then
                log_info "Changes detected"
                exit 0  # Changes exist
            else
                log_info "No changes"
                exit 1  # No changes
            fi
            ;;
        "setup")
            # Set up file watcher
            setup_file_watcher
            log_success "File watcher setup complete"
            ;;
        *)
            echo "Usage: $0 <action>"
            echo ""
            echo "Actions:"
            echo "  auto    - Check for changes and update if needed (default)"
            echo "  force   - Force update regardless of changes"
            echo "  check   - Check for changes only, return exit code"
            echo "  setup   - Set up file watcher for auto-updates"
            echo ""
            echo "Integration:"
            echo "  Add to pre-commit hooks, CI/CD, or run as cron job"
            exit 1
            ;;
    esac
    
    echo "Update complete: $LOG_FILE" | tee -a "$LOG_FILE"
}

# Run main with all arguments
main "$@"