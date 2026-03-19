#!/usr/bin/env node
/**
 * Test real Discord bot with real token
 */

console.log('Starting real Discord bot test...');

const { TopicDiscordBot } = require('./interfaces/discord-bot.js');
const fs = require('fs');
const yaml = require('js-yaml');

// Load config
const configPath = './interfaces/discord-config.yaml';
const config = yaml.load(fs.readFileSync(configPath, 'utf8'));

console.log('Config loaded:', {
  bot_token_length: config.discord.bot_token?.length || 0,
  guild_id: config.discord.guild_id,
  channels: Object.keys(config.discord.channels || {}).length
});

// Create bot
const bot = new TopicDiscordBot({
  botToken: config.discord.bot_token,
  ...config.discord
});

console.log('Starting Discord bot...');

bot.start().then(() => {
  console.log('✅ Discord bot started successfully!');
  
  // Keep running for 30 seconds
  setTimeout(() => {
    console.log('Test complete, stopping bot...');
    process.exit(0);
  }, 30000);
  
}).catch(error => {
  console.error('❌ Failed to start Discord bot:', error.message);
  console.error('Full error:', error);
  process.exit(1);
});