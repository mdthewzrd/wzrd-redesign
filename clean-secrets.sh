#!/bin/bash
# Script to clean Discord bot tokens from files before pushing to GitHub

echo "Cleaning Discord bot tokens from files..."

# Remove actual token from discord-config.yaml
sed -i 's/bot_token:.*/bot_token: "YOUR_DISCORD_BOT_TOKEN_HERE"/g' ./interfaces/discord-config.yaml
sed -i 's/client_id:.*/client_id: "YOUR_DISCORD_CLIENT_ID_HERE"/g' ./interfaces/discord-config.yaml

# Clean api-keys.json
cat > ./configs/api-keys.json << 'EOF'
{
  "discord": {
    "bot_token": "YOUR_DISCORD_BOT_TOKEN_HERE",
    "client_id": "YOUR_DISCORD_CLIENT_ID_HERE",
    "client_secret": ""
  },
  "anthropic": {
    "api_key": "YOUR_ANTHROPIC_API_KEY_HERE"
  },
  "openai": {
    "api_key": "YOUR_OPENAI_API_KEY_HERE"
  },
  "github": {
    "token": "YOUR_GITHUB_TOKEN_HERE"
  },
  "stripe": {
    "secret_key": "YOUR_STRIPE_SECRET_KEY_HERE",
    "publishable_key": "YOUR_STRIPE_PUBLISHABLE_KEY_HERE"
  },
  "environment": "development"
}
EOF

# Clean other bot files
for file in ./interfaces/bot.js ./interfaces/discord-bot-simple.js ./interfaces/discord-bot-v2.js ./interfaces/wzrdclaw-discord-bot-debug.js ./interfaces/test-discord-bot.js; do
  if [ -f "$file" ]; then
    sed -i 's/MTQ4MTM0ODU0NDkyMDI4OTM5Ng/YOUR_DISCORD_BOT_TOKEN_HERE/g' "$file"
    sed -i 's/const token = .*/const token = "YOUR_DISCORD_BOT_TOKEN_HERE";/g' "$file"
  fi
done

# Clean documentation files
sed -i 's/MTQ4MTM0ODU0NDkyMDI4OTM5Ng/YOUR_DISCORD_BOT_TOKEN_HERE/g' ./docs/FRESH-DISCORD-SETUP.md
sed -i 's/677335430336610315/YOUR_DISCORD_CLIENT_ID_HERE/g' ./docs/FRESH-DISCORD-SETUP.md

echo "Token cleanup complete!"