"use strict";
// SIMPLE keep-alive bot with minimal features

const { Client, GatewayIntentBits } = require('discord.js');

const token = "MTQ4MzA3ODA4MDUzNTk4NjE4Nw.GmiZM1.6s1YxbEOtuoxMMIJy5qy_XEhPhbHQyqWzxeAdE";

console.log('🤖 Starting SIMPLE keep-alive bot...');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  // Minimal configuration
});

let connectionAttempts = 0;
const maxAttempts = 50;

client.on('ready', () => {
  console.log(`✅ Bot ready: ${client.user.tag}`);
  console.log(`🆔 ID: ${client.user.id}`);
  console.log(`📊 Guilds: ${client.guilds.cache.size}`);
  
  // Set simple presence
  client.user.setPresence({
    status: 'online',
    activities: [{ name: 'WZRDClaw Assistant', type: 0 }]
  });
  
  console.log('🎮 Presence set to: online');
  console.log('🎯 Bot should show in Discord NOW');
  
  // Reset attempt counter on successful connection
  connectionAttempts = 0;
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  
  // Only respond in testing channel
  if (message.channel.id === '1481800445465723012') {
    console.log(`📨 Message in #testing: "${message.content}"`);
    
    try {
      // Simple reaction
      await message.react('👀');
      
      // Simple response
      await message.reply(`✅ **Bot responding!** I'm online. Your message: "${message.content.substring(0, 50)}..."`);
      
    } catch (error) {
      console.error('Response error:', error.message);
    }
  }
});

client.on('error', (error) => {
  console.error('❌ Client error:', error.message);
  connectionAttempts++;
  
  if (connectionAttempts >= maxAttempts) {
    console.error(`🚨 Max connection attempts (${maxAttempts}) reached. Stopping.`);
    process.exit(1);
  }
  
  console.log(`🔄 Reconnection attempt ${connectionAttempts}/${maxAttempts}`);
});

client.on('disconnect', () => {
  console.warn('⚠️ Bot disconnected');
  connectionAttempts++;
  
  if (connectionAttempts >= maxAttempts) {
    console.error(`🚨 Max disconnections (${maxAttempts}) reached. Stopping.`);
    process.exit(1);
  }
  
  console.log(`🔄 Will reconnect automatically (attempt ${connectionAttempts}/${maxAttempts})`);
});

// Login with retry logic
async function loginWithRetry() {
  while (connectionAttempts < maxAttempts) {
    try {
      console.log(`🔐 Attempting login (attempt ${connectionAttempts + 1}/${maxAttempts})...`);
      await client.login(token);
      console.log('✅ Login successful');
      return;
    } catch (error) {
      connectionAttempts++;
      console.error(`❌ Login failed (${connectionAttempts}/${maxAttempts}):`, error.message);
      
      if (connectionAttempts >= maxAttempts) {
        console.error('🚨 Max login attempts reached. Check token validity.');
        process.exit(1);
      }
      
      // Wait before retry
      const delay = Math.min(connectionAttempts * 5000, 30000);
      console.log(`⏳ Waiting ${delay/1000}s before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Start
loginWithRetry().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});

// Keep process alive
process.on('SIGINT', () => {
  console.log('\n👋 Graceful shutdown...');
  client.destroy();
  process.exit(0);
});

console.log('🚀 Bot process started');
console.log('🎯 Check Discord for bot status');
console.log('📝 Logs will show connection attempts');