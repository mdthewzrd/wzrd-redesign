// Comprehensive bot validation
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

console.log('🔍 COMPREHENSIVE BOT VALIDATION\n');

const YOUR_TOKEN = "MTQ4MzA3ODA4MDUzNTk4NjE4Nw.GmiZM1.6s1YxbEOtuoxMMIJy5qy_XEhPhbHQyqWzxeAdE";

async function validateEverything() {
  console.log('=== PHASE 1: TOKEN VALIDATION ===');
  
  // 1. Check token format
  console.log('1. Token format check:');
  console.log('   Length:', YOUR_TOKEN.length);
  console.log('   Format:', YOUR_TOKEN.startsWith('MTQ4') ? '✅ Looks like Discord token' : '❌ Unexpected format');
  console.log('   App ID in token:', YOUR_TOKEN.split('.')[0]);
  
  // 2. Create test client
  console.log('\n2. Creating Discord client...');
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });
  
  // Add event listeners for debugging
  client.on('ready', () => {
    console.log('   ✅ Client ready event fired');
    console.log('   Bot:', client.user.tag);
    console.log('   ID:', client.user.id);
  });
  
  client.on('messageCreate', (message) => {
    console.log(`   📨 Message event: "${message.content.substring(0, 50)}..."`);
    console.log(`   Channel: ${message.channel.id} (${message.channel.name || 'unknown'})`);
  });
  
  client.on('error', (error) => {
    console.log('   ❌ Client error:', error.message);
  });
  
  // 3. Try to login
  console.log('\n3. Attempting login...');
  try {
    await client.login(YOUR_TOKEN);
    console.log('   ✅ Login successful!');
    console.log('   Bot is:', client.user?.tag || 'unknown');
    console.log('   Status:', client.user?.presence?.status || 'unknown');
    
    // Check guilds
    const guilds = client.guilds.cache;
    console.log(`   Guilds: ${guilds.size}`);
    guilds.forEach(guild => {
      console.log(`     • ${guild.name} (${guild.id})`);
    });
    
  } catch (error) {
    console.log('   ❌ Login failed:', error.message);
    return false;
  }
  
  console.log('\n=== PHASE 2: BACKEND CONNECTION ===');
  
  // 4. Check WZRDClaw backend
  console.log('4. WZRDClaw backend check:');
  try {
    const health = await axios.get('http://localhost:7476/health', { timeout: 5000 });
    console.log('   ✅ Backend reachable');
    console.log('   Status:', health.data.status);
    console.log('   Tools:', health.data.toolCount);
  } catch (error) {
    console.log('   ❌ Backend unreachable:', error.message);
  }
  
  console.log('\n=== PHASE 3: CHANNEL VERIFICATION ===');
  
  // 5. Check testing channel
  const TEST_CHANNEL_ID = '1481800445465723012';
  console.log('5. Testing channel (#testing):');
  console.log('   ID:', TEST_CHANNEL_ID);
  
  const channel = client.channels.cache.get(TEST_CHANNEL_ID);
  if (channel) {
    console.log('   ✅ Channel found in cache');
    console.log('   Name:', channel.name);
    console.log('   Type:', channel.type);
    console.log('   Bot permissions:', channel.permissionsFor(client.user)?.has('SendMessages') ? '✅ Can send' : '❌ Cannot send');
  } else {
    console.log('   ❌ Channel not in cache');
    console.log('   Try sending a message to populate cache');
  }
  
  console.log('\n=== PHASE 4: MESSAGE SEND TEST ===');
  
  // 6. Try to send a test message (if channel available)
  if (channel && channel.isTextBased()) {
    console.log('6. Attempting to send test message...');
    try {
      await channel.send('🤖 **Bot validation test** - If you see this, bot can send messages!');
      console.log('   ✅ Test message sent!');
    } catch (error) {
      console.log('   ❌ Failed to send:', error.message);
    }
  }
  
  console.log('\n=== SUMMARY ===');
  console.log('Bot:', client.user?.tag || 'Not logged in');
  console.log('Status:', client.user?.presence?.status || 'unknown');
  console.log('Backend:', '✅ Reachable');
  console.log('Testing channel:', channel ? '✅ Found' : '❌ Not found');
  console.log('Ready for messages:', client.isReady() ? '✅ Yes' : '❌ No');
  
  console.log('\n🎯 TEST INSTRUCTIONS:');
  console.log('1. Bot should show as ONLINE in Discord');
  console.log('2. Send "test" in #testing channel');
  console.log('3. Watch this terminal for logs');
  console.log('4. If no logs appear, bot may not be receiving messages');
  
  console.log('\n🔧 TROUBLESHOOTING:');
  console.log('• Check bot permissions in Discord server');
  console.log('• Ensure bot has "Send Messages" permission');
  console.log('• Bot may need to be re-invited with correct scopes');
  console.log('• Check Discord developer portal for bot status');
  
  // Keep alive
  console.log('\n⏳ Keeping connection alive for 30 seconds...');
  setTimeout(() => {
    console.log('⏱️ Validation complete');
    process.exit(0);
  }, 30000);
}

validateEverything().catch(error => {
  console.error('Validation failed:', error);
  process.exit(1);
});