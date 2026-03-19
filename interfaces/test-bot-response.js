// Test script to verify bot response features
const axios = require('axios');

console.log('🤖 Testing Discord Bot Response Features...\n');

// Test 1: Check WZRDClaw backend
async function testBackend() {
  try {
    const response = await axios.get('http://localhost:7476/health');
    console.log('✅ Backend Status:', response.data.status);
    console.log('   Tools:', response.data.toolCount);
    return true;
  } catch (error) {
    console.log('❌ Backend Error:', error.message);
    return false;
  }
}

// Test 2: Check bot process
function checkBotProcess() {
  const { execSync } = require('child_process');
  try {
    const output = execSync('ps aux | grep wzrdclaw-discord-bot-integrated | grep -v grep', { encoding: 'utf-8' });
    console.log('✅ Bot Process Running:', output.trim().split('\n')[0]?.split(' ')[1] || 'Unknown PID');
    return true;
  } catch (error) {
    console.log('❌ Bot Process Not Found');
    return false;
  }
}

// Test 3: Simulate message processing
async function testMessageProcessing() {
  console.log('\n📤 Simulating Message Processing:');
  console.log('   • Should react with 👀');
  console.log('   • Should show typing indicator');
  console.log('   • Should respond with WZRDClaw info');
  
  // Check if bot would process this
  const channelId = '1481800445465723012'; // #testing
  const config = require('js-yaml').load(
    require('fs').readFileSync('/home/mdwzrd/wzrd-redesign/interfaces/discord-config.yaml', 'utf8')
  );
  
  const channelMappings = config.channels || {};
  const topic = Object.keys(channelMappings).find(key => 
    channelMappings[key] === channelId
  );
  
  if (topic) {
    console.log('✅ Channel mapped:', channelId, '→', topic);
  } else {
    console.log('❌ Channel not mapped:', channelId);
  }
}

// Run tests
async function runTests() {
  console.log('=== DISCORD BOT FEATURE TEST ===\n');
  
  const backendOk = await testBackend();
  const processOk = checkBotProcess();
  
  if (backendOk && processOk) {
    console.log('\n🎯 READY FOR TESTING:');
    console.log('=====================');
    console.log('1. Go to Discord');
    console.log('2. Check bot status: Should show as ONLINE');
    console.log('3. Send message in #testing channel:');
    console.log('   • "test"');
    console.log('   • Should see: 👀 reaction + typing indicator');
    console.log('   • Should get WZRDClaw-powered response');
    console.log('\n4. If features don\'t work:');
    console.log('   • Bot might need re-login');
    console.log('   • Discord might need to refresh bot presence');
    console.log('   • Try restarting bot:');
    console.log('     pkill -f wzrdclaw-discord-bot-integrated');
    console.log('     node wzrdclaw-discord-bot-integrated.js');
  } else {
    console.log('\n⚠️ Issues detected. Bot may not be fully functional.');
  }
  
  await testMessageProcessing();
}

runTests().catch(console.error);