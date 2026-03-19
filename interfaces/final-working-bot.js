"use strict";
// FINAL WORKING BOT with NEW TOKEN

const { Client, GatewayIntentBits, ActivityType } = require('discord.js');

// NEW TOKEN from Discord Developer Portal
const NEW_TOKEN = "YOUR_DISCORD_BOT_TOKEN_HERE";

console.log('🚀 Starting FINAL BOT with NEW TOKEN...');
console.log('🔑 Token length:', NEW_TOKEN.length);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  presence: {
    status: 'online',
    activities: [{
      name: 'WZRDClaw AI Assistant',
      type: ActivityType.Playing,
    }]
  }
});

let isConnected = false;

client.on('ready', () => {
  console.log(`✅ FINAL BOT READY: ${client.user.tag}`);
  console.log(`🆔 ID: ${client.user.id}`);
  console.log(`🎮 Presence: ${client.user.presence.status}`);
  console.log(`🏰 Guilds: ${client.guilds.cache.size}`);
  
  isConnected = true;
  
  // Update presence to be very visible
  client.user.setPresence({
    status: 'online',
    activities: [{
      name: 'AI Assistant | ONLINE',
      type: ActivityType.Custom,
    }]
  });
  
  console.log('\n📱 CHECK DISCORD NOW:');
  console.log('1. Bot should show as ONLINE (green)');
  console.log('2. Should show "AI Assistant | ONLINE"');
  console.log('3. Should be in member list as Remi#6734');
  
  // Send test message
  const testChannel = client.channels.cache.get('1481800445465723012');
  if (testChannel) {
    console.log('\n📤 Sending verification message...');
    testChannel.send('✅ **BOT VERIFIED ONLINE** with new token! Try sending a message.').catch(console.error);
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  
  // Only in testing channel
  if (message.channel.id === '1481800445465723012') {
    console.log(`📨 Message: "${message.content}"`);
    
    try {
      // React immediately
      await message.react('👀');
      
      // Show typing indicator
      await message.channel.sendTyping();
      
      // Wait a moment (simulate AI processing)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Enhanced response with NEW token confirmation
      const response = `**✅ FINAL BOT RESPONSE**\n\nYour message: "${message.content}"\n\n🎉 **NEW TOKEN WORKING!**\n• Bot: Remi#6734\n• Status: ✅ Online\n• Channel: #testing\n• Token: Updated successfully\n\nTry: \`help\` for commands`;
      
      await message.reply(response);
      
      console.log(`✅ Responded to: "${message.content.substring(0, 30)}..."`);
      
    } catch (error) {
      console.error('Response error:', error.message);
    }
  }
});

client.on('error', (error) => {
  console.error('❌ Client error:', error.message);
  isConnected = false;
});

client.on('disconnect', () => {
  console.warn('⚠️ Bot disconnected');
  isConnected = false;
});

// Login with new token
client.login(NEW_TOKEN).then(() => {
  console.log('🔐 Login with NEW token successful');
  
  // Monitor connection
  setInterval(() => {
    console.log(`💓 Heartbeat: ${isConnected ? '✅ Connected' : '❌ Disconnected'}`);
  }, 30000);
  
}).catch(error => {
  console.error('❌ Login FAILED with new token:', error.message);
  console.log('\n🔧 Check:');
  console.log('1. Token copied correctly');
  console.log('2. Bot re-invited to server');
  console.log('3. Bot permissions in Discord');
  process.exit(1);
});

// Keep alive
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down final bot...');
  client.destroy();
  process.exit(0);
});

console.log('\n🎯 Bot starting with NEW TOKEN');
console.log('⏳ Check Discord in 10-30 seconds...');