// Test Discord token validity
const axios = require('axios');

const token = "MTQ4MzA3ODA4MDUzNTk4NjE4Nw.GmiZM1.6s1YxbEOtuoxMMIJy5qy_XEhPhbHQyqWzxeAdE";

console.log('🔍 Testing Discord Token Validity...\n');

async function testToken() {
  try {
    // Test 1: Basic format check
    console.log('1. Token format check:');
    console.log('   Length:', token.length);
    console.log('   Starts with MTQ4:', token.startsWith('MTQ4'));
    console.log('   Has three dots:', (token.match(/\./g) || []).length === 3);
    
    // Test 2: Direct API call
    console.log('\n2. Discord API test:');
    
    const response = await axios.get('https://discord.com/api/v10/users/@me', {
      headers: {
        'Authorization': `Bot ${token}`
      },
      timeout: 10000
    });
    
    console.log('   ✅ API responded:', response.status);
    console.log('   Bot username:', response.data.username);
    console.log('   Bot ID:', response.data.id);
    console.log('   Bot discriminator:', response.data.discriminator);
    
    // Test 3: Check bot applications
    console.log('\n3. Bot application check:');
    
    const appResponse = await axios.get(`https://discord.com/api/v10/applications/${response.data.id}/bot`, {
      headers: {
        'Authorization': `Bot ${token}`
      },
      timeout: 10000
    });
    
    console.log('   ✅ Application accessible');
    console.log('   App name:', appResponse.data.name);
    console.log('   Public:', appResponse.data.bot_public);
    console.log('   Requires code grant:', appResponse.data.bot_require_code_grant);
    
    // Test 4: Check gateway
    console.log('\n4. Gateway check:');
    
    const gatewayResponse = await axios.get('https://discord.com/api/v10/gateway/bot', {
      headers: {
        'Authorization': `Bot ${token}`
      },
      timeout: 10000
    });
    
    console.log('   ✅ Gateway accessible');
    console.log('   URL:', gatewayResponse.data.url);
    console.log('   Shards:', gatewayResponse.data.shards);
    console.log('   Session limit:', gatewayResponse.data.session_start_limit);
    
    console.log('\n🎉 Token is VALID and working!');
    console.log('\n🔧 If bot keeps disconnecting:');
    console.log('1. Check bot permissions in Discord');
    console.log('2. Ensure bot is added to server with correct scopes');
    console.log('3. Bot might need re-invite');
    console.log('4. Check rate limits');
    
    return true;
    
  } catch (error) {
    console.error('❌ Token test failed:', error.message);
    
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Status text:', error.response.statusText);
      console.log('   Headers:', JSON.stringify(error.response.headers));
      
      if (error.response.data) {
        console.log('   Error details:', JSON.stringify(error.response.data));
      }
    }
    
    console.log('\n🔧 Possible issues:');
    console.log('• Token revoked/expired');
    console.log('• Bot not properly authorized');
    console.log('• Missing required scopes');
    console.log('• Bot deleted from Discord Developer Portal');
    
    return false;
  }
}

testToken().then(isValid => {
  if (isValid) {
    console.log('\n✅ Token is valid. Bot disconnection is likely due to:');
    console.log('• Network issues');
    console.log('• Discord gateway problems');
    console.log('• Bot client implementation');
    console.log('• Server-side disconnects');
  } else {
    console.log('\n❌ Token is INVALID. Need new token from Discord Developer Portal.');
  }
  
  process.exit(isValid ? 0 : 1);
});