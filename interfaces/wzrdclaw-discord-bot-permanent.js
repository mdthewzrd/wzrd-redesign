"use strict";
// Permanent bot with auto-restart

const { Client, GatewayIntentBits, Events } = require('discord.js');
const axios = require('axios');

const YOUR_BOT_TOKEN = "MTQ4MzA3ODA4MDUzNTk4NjE4Nw.GmiZM1.6s1YxbEOtuoxMMIJy5qy_XEhPhbHQyqWzxeAdE";

// Channel mappings
const CHANNEL_MAPPINGS = {
  '1481800155220148296': 'framework',
  '1481800251806580757': 'topics',
  '1481800276330418279': 'web-ui',
  '1481800409478725652': 'docs',
  '1481800346253660290': 'wzrd-redesign',
  '1481800429523308624': 'general',
  '1481800445465723012': 'testing',
};

class PermanentWZRDClawBot {
  constructor() {
    this.wzrdclawBaseUrl = 'http://localhost:7476';
    this.restartCount = 0;
    this.maxRestarts = 10;
    
    this.startBot();
  }
  
  startBot() {
    console.log(`🚀 Starting WZRDClaw Discord Bot (attempt ${this.restartCount + 1}/${this.maxRestarts})`);
    
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
      ],
    });
    
    this.setupEventHandlers();
    this.loginWithRetry();
  }
  
  setupEventHandlers() {
    this.client.once(Events.ClientReady, () => {
      console.log(`✅ Logged in as ${this.client.user.tag}`);
      console.log(`🆔 User ID: ${this.client.user.id}`);
      console.log(`🔗 Connected to WZRDClaw: ${this.wzrdclawBaseUrl}`);
      console.log(`📡 Channels: ${Object.keys(CHANNEL_MAPPINGS).length} mapped`);
      console.log('🎯 Bot is ONLINE and ready!');
      
      this.restartCount = 0; // Reset on successful login
    });
    
    this.client.on(Events.MessageCreate, async (message) => {
      if (message.author.bot) return;
      
      const channelId = message.channel.id;
      const topic = CHANNEL_MAPPINGS[channelId];
      
      if (!topic) return;
      
      try {
        // React and type
        await message.react('👀');
        await message.channel.sendTyping();
        
        // Process
        const response = await this.processMessage(message.content, topic);
        
        // Respond
        await message.reply(response);
        
      } catch (error) {
        console.error('Message error:', error.message);
        try {
          await message.reply('❌ Processing error. Bot restarting...');
        } catch (e) {}
      }
    });
    
    this.client.on('error', (error) => {
      console.error('Discord client error:', error.message);
      this.scheduleRestart(5000);
    });
    
    this.client.on('disconnect', () => {
      console.warn('⚠️ Discord disconnected');
      this.scheduleRestart(10000);
    });
  }
  
  async loginWithRetry() {
    try {
      await this.client.login(YOUR_BOT_TOKEN);
      console.log('🔐 Login successful');
    } catch (error) {
      console.error('❌ Login failed:', error.message);
      this.scheduleRestart(15000);
    }
  }
  
  scheduleRestart(delay) {
    if (this.restartCount >= this.maxRestarts) {
      console.error(`🚨 Max restart attempts (${this.maxRestarts}) reached. Stopping.`);
      process.exit(1);
    }
    
    this.restartCount++;
    console.log(`🔄 Scheduling restart ${this.restartCount}/${this.maxRestarts} in ${delay}ms`);
    
    if (this.client && this.client.destroy) {
      this.client.destroy();
    }
    
    setTimeout(() => {
      this.startBot();
    }, delay);
  }
  
  async processMessage(content, topic) {
    try {
      const health = await axios.get(`${this.wzrdclawBaseUrl}/health`);
      const tools = await axios.get(`${this.wzrdclawBaseUrl}/api/integration/tools`);
      
      const lowerContent = content.toLowerCase().trim();
      
      if (lowerContent === 'help') {
        return `
**🤖 WZRDClaw Bot Help**  
*Connected with ${tools.data.tools.length} tools*

**Commands:**
• \`help\` - This message
• \`status\` - Backend health
• \`tools\` - Available tools
• \`bash <cmd>\` - Run shell command
• Anything else - Chat

**Channel:** ${topic}
**Backend:** ✅ ${this.wzrdclawBaseUrl}
`;
      }
      
      if (lowerContent === 'status') {
        return `
**🔧 Status**  
• **Backend:** ${health.data.status}
• **Tools:** ${tools.data.tools.length}
• **Channel:** ${topic}
• **Bot:** ✅ Online
`;
      }
      
      if (lowerContent === 'tools') {
        return `
**🛠️ Tools (${tools.data.tools.length})**
\`\`\`
${tools.data.tools.join(', ')}
\`\`\`
`;
      }
      
      if (lowerContent.startsWith('bash ')) {
        const cmd = content.substring(5).trim();
        if (!cmd) return '⚠️ Provide command: `bash ls`';
        
        try {
          const { execSync } = require('child_process');
          const result = execSync(cmd, { encoding: 'utf-8', cwd: process.cwd() });
          return `\`\`\`bash\n${cmd}\n\`\`\`\n\`\`\`\n${result.slice(0, 1800)}\n\`\`\``;
        } catch (error) {
          return `❌ \`${cmd}\` failed: ${error.message}`;
        }
      }
      
      // Default response
      const responses = [
        `**🤖 WZRDClaw** - ${topic}\n"${content}"\n\n✅ ${tools.data.tools.length} tools ready\nTry \`help\` for commands`,
        `**🧠 Processing** in ${topic}\n"${content}"\n\n🔗 Connected to WZRDClaw\n🛠️ ${tools.data.tools.length} tools available`,
        `**⚡ Active** - ${topic}\n"${content}"\n\nBackend: ${this.wzrdclawBaseUrl}\nTools: ${tools.data.tools.length}\nNeed \`help\`?`
      ];
      
      return responses[Math.floor(Math.random() * responses.length)];
      
    } catch (error) {
      console.error('Process error:', error.message);
      return `❌ Backend error: ${error.message}`;
    }
  }
}

// Start and keep alive
console.log('🔐 Starting PERMANENT WZRDClaw Discord Bot');
console.log('📡 Auto-restart enabled (max 10 attempts)');
console.log('💾 Logs will show startup attempts');

const bot = new PermanentWZRDClawBot();

// Keep process alive
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught exception:', error.message);
  console.error('Stack:', error.stack);
  // Don't exit - let restart handler deal with it
});