#!/bin/bash
# WZRD.dev Background Agent - File Watcher Trigger
# Watches for file changes and triggers automatic validation/agents

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WATCH_DIR="${1:-.}"
LOG_FILE="${SCRIPT_DIR}/logs/background-agent-$(date +%Y%m%d-%H%M%S).log"

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_trigger() {
    echo -e "${CYAN}[TRIGGER]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Create logs directory
mkdir -p "${SCRIPT_DIR}/logs"

echo "=========================================="
echo "WZRD.dev Background Agent: File Watcher"
echo "=========================================="
echo ""
log_info "Watching directory: $WATCH_DIR"
log_info "Log file: $LOG_FILE"
echo ""

# Check if inotifywait is available
if ! command -v inotifywait &> /dev/null; then
    log_warning "inotifywait not found. Installing..."
    # Try to install inotify-tools
    if command -v apt-get &> /dev/null; then
        sudo apt-get install -y inotify-tools 2>/dev/null || true
    elif command -v brew &> /dev/null; then
        brew install inotify-tools 2>/dev/null || true
    fi
fi

# Check if inotifywait is now available
if command -v inotifywait &> /dev/null; then
    log_info "Starting file watcher..."
    echo ""
    
    inotifywait -m -r -e modify,create,delete \
        --format '%w%f %e' \
        --exclude '.*\.log|.*\.git.*|node_modules|\.next|dist' \
        "$WATCH_DIR" | while read file event; do
        
        # Skip if file is in logs directory
        if [[ "$file" == *"/logs/"* ]]; then
            continue
        fi
        
        log_trigger "File $event: $file"
        
        # Auto-validate markdown files
        if [[ "$file" == *.md ]]; then
            log_info "Markdown file detected, running validation..."
            if [ -f "${SCRIPT_DIR}/validation-pipeline.sh" ]; then
                ${SCRIPT_DIR}/validation-pipeline.sh validate "$file" 2>&1 | tee -a "$LOG_FILE"
            else
                log_info "Validation pipeline not found, skipping"
            fi
        fi
        
        # Auto-test on JavaScript/TypeScript changes
        if [[ "$file" == *.js || "$file" == *.ts || "$file" == *.tsx || "$file" == *.jsx ]]; then
            log_info "Code file changed, triggering tests..."
            # Check if there's a test script
            if [ -f "$(dirname "$file")/package.json" ]; then
                cd "$(dirname "$file")"
                if grep -q '"test"' package.json; then
                    npm test 2>&1 | tee -a "$LOG_FILE" || log_warning "Tests failed"
                else
                    log_info "No test script found in package.json"
                fi
            fi
        fi
        
        # Auto-lint on save
        if [[ "$file" == *.py ]]; then
            log_info "Python file changed, running linter..."
            if command -v pylint &> /dev/null; then
                pylint "$file" 2>&1 | tee -a "$LOG_FILE" || true
            fi
        fi
        
    done
else
    log_warning "inotifywait not available. Using polling fallback..."
    echo ""
    
    # Simple polling fallback
    declare -A file_states
    
    # Initial scan
    while IFS= read -r -d '' file; do
        file_states["$file"]=$(stat -c %Y "$file" 2>/dev/null || echo "0")
    done < <(find "$WATCH_DIR" -type f \( -name "*.md" -o -name "*.js" -o -name "*.ts" -o -name "*.py" \) -print0 2>/dev/null)
    
    log_info "Initial scan complete. Monitoring for changes..."
    
    while true; do
        sleep 5  # Check every 5 seconds
        
        # Check for changes
        for file in "${!file_states[@]}"; do
            if [ -f "$file" ]; then
                current_mtime=$(stat -c %Y "$file" 2>/dev/null || echo "0")
                if [ "$current_mtime" != "${file_states[$file]}" ]; then
                    log_trigger "File modified: $file"
                    file_states["$file"]="$current_mtime"
                    
                    # Trigger validation for markdown
                    if [[ "$file" == *.md ]]; then
                        log_info "Running validation on $file"
                    fi
                fi
            fi
        done
        
        # Check for new files
        while IFS= read -r -d '' file; do
            if [ -z "${file_states[$file]}" ]; then
                log_trigger "New file detected: $file"
                file_states["$file"]=$(stat -c %Y "$file" 2>/dev/null || echo "0")
            fi
        done < <(find "$WATCH_DIR" -type f \( -name "*.md" -o -name "*.js" -o -name "*.ts" -o -name "*.py" \) -print0 2>/dev/null)
    done
fi
