#!/bin/bash

# Enhanced Remi Agentic Search System
# Phase 0: Replace complex RAG memory with ripgrep/glob search

SEARCH_DIR="/home/mdwzrd/wzrd-redesign"
LOG_DIR="/home/mdwzrd/wzrd-redesign/logs"
SEARCH_LOG="$LOG_DIR/search-$(date +%Y-%m-%d).log"
MEMORY_INDEX="$SEARCH_DIR/.memory-index.txt"

# Create log directory
mkdir -p "$LOG_DIR"

# Function to index files for fast search
create_index() {
    local target_dir=${1:-$SEARCH_DIR}
    echo "Creating search index for $target_dir..."
    
    # Find all files (exclude binary, logs, and hidden directories)
    find "$target_dir" -type f \
        -name "*.md" -o \
        -name "*.txt" -o \
        -name "*.json" -o \
        -name "*.yaml" -o \
        -name "*.yml" -o \
        -name "*.js" -o \
        -name "*.ts" -o \
        -name "*.py" -o \
        -name "*.sh" -o \
        -name "*.rs" | \
        grep -v ".git" | \
        grep -v "node_modules" | \
        grep -v "__pycache__" | \
        grep -v "/logs/" | \
        grep -v "/.opencode/" | \
        sort > "$MEMORY_INDEX"
    
    local file_count=$(wc -l < "$MEMORY_INDEX")
    echo "Indexed $file_count files in $target_dir"
    echo "$(date -Iseconds)|index|$target_dir|$file_count" >> "$SEARCH_LOG"
}

# Function to search for content
search_content() {
    local query=$1
    local max_results=${2:-10}
    local scope=${3:-"all"}  # all, code, docs, config
    
    echo "Searching for: '$query'"
    echo "$(date -Iseconds)|search|$query|$max_results|$scope" >> "$SEARCH_LOG"
    
    # Build file filter based on scope
    local file_filter=""
    case "$scope" in
        "code")
            file_filter="--type f -name '*.js' -o -name '*.ts' -o -name '*.py' -o -name '*.rs' -o -name '*.sh'"
            ;;
        "docs")
            file_filter="--type f -name '*.md' -o -name '*.txt'"
            ;;
        "config")
            file_filter="--type f -name '*.json' -o -name '*.yaml' -o -name '*.yml'"
            ;;
        *)
            file_filter=""
            ;;
    esac
    
    # Use ripgrep if available, fallback to grep
    if command -v rg &> /dev/null; then
        # Use ripgrep for fast search
        if [ -z "$file_filter" ]; then
            rg -i --color never --no-heading --line-number "$query" "$SEARCH_DIR" 2>/dev/null | head -n "$max_results"
        else
            eval "find '$SEARCH_DIR' $file_filter 2>/dev/null | xargs rg -i --color never --no-heading --line-number '$query' 2>/dev/null" | head -n "$max_results"
        fi
    else
        # Fallback to grep
        if [ -z "$file_filter" ]; then
            grep -r -i -n --color=never "$query" "$SEARCH_DIR" 2>/dev/null | head -n "$max_results"
        else
            eval "find '$SEARCH_DIR' $file_filter -exec grep -i -n --color=never '$query' {} + 2>/dev/null" | head -n "$max_results"
        fi
    fi
}

# Function to find files by pattern
find_files() {
    local pattern=$1
    local max_results=${2:-20}
    
    echo "Finding files matching: '$pattern'"
    echo "$(date -Iseconds)|find|$pattern|$max_results" >> "$SEARCH_LOG"
    
    find "$SEARCH_DIR" -type f -name "*$pattern*" 2>/dev/null | \
        grep -v ".git" | \
        grep -v "node_modules" | \
        head -n "$max_results"
}

# Function to get file context
get_file_context() {
    local file_path=$1
    local line_number=${2:-1}
    local context_lines=${3:-5}  # lines before and after
    
    if [ ! -f "$file_path" ]; then
        echo "File not found: $file_path"
        return 1
    fi
    
    echo "=== Context from: $file_path (line $line_number) ==="
    echo ""
    
    # Calculate line range
    local start_line=$((line_number - context_lines))
    local end_line=$((line_number + context_lines))
    
    if [ $start_line -lt 1 ]; then
        start_line=1
    fi
    
    # Display context with line numbers
    sed -n "${start_line},${end_line}p" "$file_path" | cat -n
}

# Function to search memory (structured queries)
search_memory() {
    local query=$1
    local category=${2:-"all"}
    
    echo "=== Memory Search: '$query' ==="
    echo ""
    
    # Search in different categories
    case "$category" in
        "personas")
            search_content "$query" 5 "docs"
            ;;
        "config")
            search_content "$query" 5 "config"
            ;;
        "code")
            search_content "$query" 5 "code"
            ;;
        "planning")
            # Search in planning documents
            find "$SEARCH_DIR" -type f -name "*.md" -exec grep -l -i "$query" {} + 2>/dev/null | \
                grep -i "plan\|phase\|roadmap" | \
                head -5
            ;;
        *)
            search_content "$query" 10 "all"
            ;;
    esac
}

# Function to show search statistics
show_stats() {
    echo "=== Agentic Search System Statistics ==="
    echo ""
    
    if [ -f "$SEARCH_LOG" ]; then
        local total_searches=$(grep -c "|search|" "$SEARCH_LOG")
        local total_finds=$(grep -c "|find|" "$SEARCH_LOG")
        local today=$(date +%Y-%m-%d)
        local today_searches=$(grep -c "$today.*|search|" "$SEARCH_LOG")
        
        echo "Total searches: $total_searches"
        echo "Total file finds: $total_finds"
        echo "Searches today: $today_searches"
        echo ""
    fi
    
    if [ -f "$MEMORY_INDEX" ]; then
        local indexed_files=$(wc -l < "$MEMORY_INDEX")
        echo "Indexed files: $indexed_files"
        
        # Show file type distribution
        echo ""
        echo "File type distribution:"
        grep -E "\.(md|txt|json|yaml|yml|js|ts|py|sh|rs)$" "$MEMORY_INDEX" | \
            sed 's/.*\.//' | \
            sort | uniq -c | sort -rn | head -10
    else
        echo "No index created yet. Run '$0 index' to create index."
    fi
}

# Main command handler
case "$1" in
    "index")
        create_index "${2:-$SEARCH_DIR}"
        ;;
    "search")
        if [ -n "$2" ]; then
            search_content "$2" "${3:-10}" "${4:-all}"
        else
            echo "Usage: $0 search <query> [max_results] [scope]"
            echo "Scopes: all, code, docs, config"
        fi
        ;;
    "find")
        if [ -n "$2" ]; then
            find_files "$2" "${3:-20}"
        else
            echo "Usage: $0 find <pattern> [max_results]"
        fi
        ;;
    "context")
        if [ -n "$2" ]; then
            get_file_context "$2" "${3:-1}" "${4:-5}"
        else
            echo "Usage: $0 context <file_path> [line_number] [context_lines]"
        fi
        ;;
    "memory")
        if [ -n "$2" ]; then
            search_memory "$2" "${3:-all}"
        else
            echo "Usage: $0 memory <query> [category]"
            echo "Categories: personas, config, code, planning, all"
        fi
        ;;
    "stats")
        show_stats
        ;;
    "test")
        echo "Testing agentic search system..."
        echo ""
        echo "1. Creating index..."
        create_index "$SEARCH_DIR"
        echo ""
        echo "2. Searching for 'persona'..."
        search_content "persona" 3
        echo ""
        echo "3. Finding config files..."
        find_files ".json" 3
        echo ""
        echo "4. Memory search test..."
        search_memory "cost" "config"
        echo ""
        echo "5. Showing statistics..."
        show_stats
        ;;
    *)
        echo "Enhanced Remi Agentic Search System"
        echo "Phase 0: ripgrep/glob based memory search"
        echo ""
        echo "Usage: $0 {index|search|find|context|memory|stats|test}"
        echo ""
        echo "Commands:"
        echo "  index [directory]           Create search index"
        echo "  search <query> [max] [scope] Search content"
        echo "  find <pattern> [max]        Find files by pattern"
        echo "  context <file> [line] [ctx] Get file context"
        echo "  memory <query> [category]   Structured memory search"
        echo "  stats                       Show search statistics"
        echo "  test                        Run test scenario"
        echo ""
        echo "Note: Install ripgrep (rg) for better performance:"
        echo "  sudo apt install ripgrep  # Ubuntu/Debian"
        echo "  brew install ripgrep       # macOS"
        echo "  brew install ripgrep      # macOS"
        ;;
esac