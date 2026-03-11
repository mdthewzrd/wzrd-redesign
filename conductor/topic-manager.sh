#!/bin/bash
# WZRD.dev Topic Manager - Unified topic system

WZRD_ROOT="/home/mdwzrd/wzrd-redesign"
TOPICS_DIR="$WZRD_ROOT/topics"
ACTIVE_FILE="$TOPICS_DIR/ACTIVE.md"

init() {
    mkdir -p "$TOPICS_DIR"
    [ ! -f "$TOPICS_DIR/registry.json" ] && echo '{"topics":{},"active":null}' > "$TOPICS_DIR/registry.json"
}

auto_detect() {
    local pwd="${1:-$(pwd)}"
    local name=$(basename "$pwd")
    local uuid=$(echo -n "$pwd" | sha256sum | cut -c1-12)
    echo "$uuid"
}

create() {
    local name="$1"
    local uuid="$2"
    local dir="$TOPICS_DIR/$uuid"
    
    mkdir -p "$dir"
    echo "Created: $name ($uuid)"
}

list() {
    echo "Topics:"
    ls -1 "$TOPICS_DIR"/*/meta.json 2>/dev/null | while read f; do
        dir=$(dirname "$f")
        uuid=$(basename "$dir")
        name=$(jq -r '.name' "$f" 2>/dev/null || echo "unknown")
        echo "  $uuid: $name"
    done
}

tui() {
    while true; do
        clear
        echo "WZRD.dev Topic Manager"
        echo ""
        echo "[1] List topics"
        echo "[2] Create topic"
        echo "[q] Quit"
        echo ""
        read -p "Choice: " choice
        
        case $choice in
            1) list ;;
            2) read -p "Name: " n; create "$n" "$(date +%s)" ;;
            q) break ;;
        esac
        read -p "Press enter..."
    done
}

case "${1:-}" in
    init) init ;;
    create) create "$2" "$3" ;;
    list) list ;;
    tui) tui ;;
    *) echo "Usage: $0 {init|create|list|tui}" ;;
esac
