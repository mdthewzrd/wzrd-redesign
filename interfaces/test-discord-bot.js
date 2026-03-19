/**
 * Test Discord Bot with Gateway Integration
 */
const { TopicDiscordBot } = require('./discord-bot.js');
const yaml = require('js-yaml');
const fs = require('fs');

// Load config
const config = yaml.load(fs.readFileSync('/home/mdwzrd/wzrd-redesign/interfaces/discord-config.yaml', 'utf8'));

// Create bot instance
const bot = new TopicDiscordBot({
  botToken: config.discord.bot_token,
  clientId: config.discord.client_id,
});

// Start bot
bot.start().then(() => {
  console.log('✅ Bot started successfully!');
}).catch(err => {
  console.error('❌ Failed to start:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  await bot.stop();
  process.exit(0);
});
