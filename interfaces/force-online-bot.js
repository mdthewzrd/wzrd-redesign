// Force bot to show as online with active presence
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');

const token = "MTQ4MzA3ODA4MDUzNTk4NjE4Nw.GmiZM1.6s1YxbEOtuoxMMIJy5qy_XEhPhbHQyqWzxeAdE";

console.log('🎮 Setting bot presence to FORCE ONLINE...\n');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
  ],
  presence: {
    status: 'online',
    activities: [{
      name: 'WZRDClaw AI Assistant',
      type: ActivityType.Playing,
    }]
  }
});

client.on('ready', () => {
  console.log('✅ Bot ready:', client.user.tag);
  console.log('🆔 ID:', client.user.id);
  console.log('🎮 Presence:', client.user.presence.status);
  console.log('🎯 Activity:', client.user.presence.activities[0]?.name);
  
  // Update presence to be more visible
  client.user.setPresence({
    status: 'online',
    activities: [{
      name: 'AI Assistant | Type !help',
      type: ActivityType.Custom,
    }]
  });
  
  console.log('\n🎯 Presence updated to:');
  console.log('   Status: online');
  console.log('   Activity: AI Assistant | Type !help');
  console.log('   Should show clearly in Discord');
  
  // Send test message to #testing
  const testChannel = client.channels.cache.get('1481800445465723012');
  if (testChannel) {
    console.log('\n📤 Sending test message to #testing...');
    testChannel.send('🤖 **Bot Status Test**: I\'m online and ready! Try sending a message.').then(() => {
      console.log('✅ Test message sent!');
    }).catch(err => {
      console.log('❌ Cannot send:', err.message);
    });
  }
  
  console.log('\n⏳ Bot will stay online...');
});

client.on('messageCreate', (message) => {
  if (message.author.bot) return;
  
  const channelId = message.channel.id;
  if (channelId === '1481800445465723012') { // #testing
    console.log(`📨 Message in #testing: "${message.content}"`);
    
    // Simple response to prove bot is working
    if (message.content.toLowerCase() === 'test' || message.content.toLowerCase() === 'hello') {
      message.reply('✅ **Bot is responding!** I\'m connected to WZRDClaw. Try `help` for commands.').catch(console.error);
    }
  }
});

client.login(token).then(() => {
  console.log('🔐 Login successful');
  console.log('\n📱 CHECK DISCORD NOW:');
  console.log('1. Look for "Remi#6734" in member list');
  console.log('2. Should show "AI Assistant | Type !help"');
  console.log('3. Should be GREEN/ONLINE');
  console.log('4. Send "test" in #testing channel');
}).catch(err => {
  console.error('❌ Login failed:', err.message);
});

// Keep alive
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down...');
  process.exit(0);
});