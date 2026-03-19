#!/bin/bash
# Comprehensive script to clean all Discord bot tokens from files

echo "=== Cleaning ALL Discord bot tokens from the repository ==="

# Function to clean a specific file
clean_file() {
  local file=$1
  if [ -f "$file" ]; then
    echo "Cleaning: $file"
    # Replace Discord bot tokens with placeholder
    sed -i 's/MTQ4[^"]*/YOUR_DISCORD_BOT_TOKEN_HERE/g' "$file"
    sed -i 's/const token = "[^"]*"/const token = "YOUR_DISCORD_BOT_TOKEN_HERE"/g' "$file"
    sed -i 's/"token": "[^"]*"/"token": "YOUR_DISCORD_BOT_TOKEN_HERE"/g' "$file"
    sed -i "s/'token': '[^']*'/'token': 'YOUR_DISCORD_BOT_TOKEN_HERE'/g" "$file"
  fi
}

# List of files known to contain tokens
declare -a token_files=(
  "interfaces/debug-discord-connection.js"
  "interfaces/force-online-bot.js"
  "interfaces/final-working-bot.js"
  "interfaces/wzrdclaw-discord-bot-direct.js"
  "interfaces/wzrdclaw-discord-bot-real-ai.js"
  "interfaces/wzrdclaw-discord-bot-ai-integrated.js"
  "interfaces/wzrdclaw-discord-bot-permanent.js"
  "interfaces/wzrdclaw-discord-bot-ai.js"
  "interfaces/wzrdclaw-discord-bot-hybrid.js"
  "interfaces/wzrdclaw-bot-supervisor.js"
  "interfaces/simple-keepalive-bot.js"
  "interfaces/validate-bot-connection.js"
  "interfaces/test-token-validity.js"
  "interfaces/discord-config.yaml"
  "configs/api-keys.json"
  "docs/FRESH-DISCORD-SETUP.md"
  "docs/DISCORD-SETUP.md"
)

# Clean each file
for file in "${token_files[@]}"; do
  clean_file "$file"
done

# Also search for any remaining tokens
echo "=== Searching for remaining tokens ==="
find . -type f \( -name "*.js" -o -name "*.ts" -o -name "*.yaml" -o -name "*.yml" -o -name "*.json" -o -name "*.md" \) \
  ! -path "./node_modules/*" ! -path "./.worktrees/*" ! -path "./wzrd-web-ui-new/node_modules/*" \
  -exec grep -l "MTQ4" {} \; 2>/dev/null | while read -r file; do
  if [[ ! " ${token_files[@]} " =~ " ${file} " ]]; then
    echo "Found token in unexpected file: $file"
    clean_file "$file"
  fi
done

echo "=== Token cleanup complete! ==="
echo "Remaining files with potential tokens:"
find . -type f \( -name "*.js" -o -name "*.ts" -o -name "*.yaml" -o -name "*.yml" -o -name "*.json" -o -name "*.md" \) \
  ! -path "./node_modules/*" ! -path "./.worktrees/*" ! -path "./wzrd-web-ui-new/node_modules/*" \
  -exec grep -l "MTQ4" {} \; 2>/dev/null || echo "None found!"