#!/usr/bin/env node
/**
 * Test Discord bot connection with real token
 */

const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const yaml = require('js-yaml');

// Load config
const configPath = '/home/mdwzrd/wzrd-redesign/interfaces/discord-config.yaml';
const config = yaml.load(fs.readFileSync(configPath, 'utf8'));
const { bot_token } = config.discord;

console.log('Testing Discord bot connection...');
console.log(`Bot token length: ${bot_token.length} chars`);
console.log(`Token starts with: ${bot_token.substring(0, 10)}...`);

if (!bot_token || bot_token.length < 10) {
  console.error('❌ Invalid bot token');
  process.exit(1);
}

// Create client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

let connected = false;

client.on('ready', () => {
  console.log(`✅ Connected as ${client.user.tag}!`);
  console.log(`   ID: ${client.user.id}`);
  console.log(`   Guilds: ${client.guilds.cache.size}`);
  
  client.guilds.cache.forEach(guild => {
    console.log(`   - ${guild.name} (${guild.id})`);
  });
  
  connected = true;
  
  // Exit after showing info
  setTimeout(() => {
    client.destroy();
    console.log('✅ Test complete');
    process.exit(0);
  }, 2000);
});

client.on('error', error => {
  console.error('❌ Discord client error:', error.message);
  process.exit(1);
});

// Set timeout
setTimeout(() => {
  if (!connected) {
    console.error('❌ Connection timeout');
    client.destroy();
    process.exit(1);
  }
}, 10000);

// Try to connect
console.log('Attempting to connect...');
client.login(bot_token).catch(error => {
  console.error('❌ Login failed:', error.message);
  console.error('Error details:', error);
  process.exit(1);
});