// Debug Discord bot connection
const { Client, GatewayIntentBits } = require('discord.js');

const token = "MTQ4MzA3ODA4MDUzNTk4NjE4Nw.GmiZM1.6s1YxbEOtuoxMMIJy5qy_XEhPhbHQyqWzxeAdE";

console.log('🔍 Debugging Discord Connection...\n');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Add ALL event listeners for debugging
client.on('ready', () => {
  console.log('✅ READY event fired');
  console.log('   Bot:', client.user.tag);
  console.log('   ID:', client.user.id);
  console.log('   Status:', client.user.presence?.status || 'unknown');
  
  // Check guilds
  const guilds = client.guilds.cache;
  console.log(`   Guilds: ${guilds.size}`);
  guilds.forEach(guild => {
    console.log(`     • ${guild.name} (${guild.id})`);
    
    // Check channels
    const channels = guild.channels.cache;
    console.log(`       Channels: ${channels.size}`);
    
    // Check if we can see the testing channel
    const testChannel = channels.get('1481800445465723012');
    if (testChannel) {
      console.log(`       ✅ #testing channel accessible`);
      console.log(`         Name: ${testChannel.name}`);
      console.log(`         Type: ${testChannel.type}`);
      
      // Check permissions
      const perms = testChannel.permissionsFor(client.user);
      if (perms) {
        console.log(`         Can send: ${perms.has('SendMessages') ? '✅' : '❌'}`);
        console.log(`         Can read: ${perms.has('ViewChannel') ? '✅' : '❌'}`);
        console.log(`         Can react: ${perms.has('AddReactions') ? '✅' : '❌'}`);
      }
    } else {
      console.log(`       ❌ #testing channel NOT in cache`);
    }
  });
});

client.on('messageCreate', (message) => {
  console.log(`📨 MESSAGE event: "${message.content.substring(0, 50)}..."`);
  console.log(`   Channel: ${message.channel.id} (${message.channel.name || 'unknown'})`);
  console.log(`   Author: ${message.author.tag} (${message.author.id})`);
});

client.on('presenceUpdate', (oldPresence, newPresence) => {
  console.log(`👤 PRESENCE update: ${newPresence?.user?.tag} -> ${newPresence?.status}`);
});

client.on('guildCreate', (guild) => {
  console.log(`🏰 GUILD added: ${guild.name} (${guild.id})`);
});

client.on('error', (error) => {
  console.log(`❌ ERROR: ${error.message}`);
});

client.on('debug', (info) => {
  console.log(`🔧 DEBUG: ${info.substring(0, 100)}...`);
});

client.on('warn', (info) => {
  console.log(`⚠️ WARN: ${info}`);
});

console.log('Attempting login...');
client.login(token).then(() => {
  console.log('\n✅ Login successful');
  console.log('Bot should show in Discord as:', client.user?.tag || 'unknown');
  
  // Keep alive for testing
  console.log('\n⏳ Keeping connection alive for 60 seconds...');
  console.log('Send a message in #testing channel to test');
  
  setTimeout(() => {
    console.log('\n⏱️ Debug complete');
    process.exit(0);
  }, 60000);
}).catch(error => {
  console.error('❌ Login failed:', error.message);
  process.exit(1);
});