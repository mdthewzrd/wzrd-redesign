"use strict";
// Direct version using YOUR token

const { Client, GatewayIntentBits, Events } = require('discord.js');
const axios = require('axios');

// YOUR BOT TOKEN - app ID 1483078080535986187
const YOUR_BOT_TOKEN = "MTQ4MzA3ODA4MDUzNTk4NjE4Nw.GmiZM1.6s1YxbEOtuoxMMIJy5qy_XEhPhbHQyqWzxeAdE";

// Channel mappings for YOUR bot
const CHANNEL_MAPPINGS = {
  '1481800155220148296': 'framework',
  '1481800251806580757': 'topics',
  '1481800276330418279': 'web-ui',
  '1481800409478725652': 'docs',
  '1481800346253660290': 'wzrd-redesign',
  '1481800429523308624': 'general',
  '1481800445465723012': 'testing',
};

class DirectWZRDClawDiscordBot {
  constructor() {
    this.wzrdclawBaseUrl = 'http://localhost:7476';
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
      ],
    });

    console.log('🚀 Starting DIRECT WZRDClaw Discord Bot');
    console.log('🔗 Backend:', this.wzrdclawBaseUrl);
    console.log('📡 Channels mapped:', Object.keys(CHANNEL_MAPPINGS).length);
    
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.client.once(Events.ClientReady, () => {
      console.log('✅ Logged in as', this.client.user.tag);
      console.log('🆔 User ID:', this.client.user.id);
      console.log('🎯 Ready for messages!');
    });

    this.client.on(Events.MessageCreate, async (message) => {
      console.log(`📨 [${new Date().toISOString()}] Message: "${message.content}"`);
      console.log(`   Channel: ${message.channel.id} (${message.channel.name})`);
      console.log(`   Author: ${message.author.tag} (${message.author.id})`);
      
      if (message.author.bot) {
        console.log('⏭️ Ignoring bot message');
        return;
      }

      const channelId = message.channel.id;
      const topic = CHANNEL_MAPPINGS[channelId];

      if (!topic) {
        console.log(`⚠️ Channel ${channelId} not in mappings`);
        return;
      }

      console.log(`✅ Channel mapped to: ${topic}`);

      try {
        console.log('👀 Adding reaction...');
        await message.react('👀');
        console.log('✅ Reaction added');
        
        console.log('⌨️ Sending typing indicator...');
        await message.channel.sendTyping();
        console.log('✅ Typing indicator sent');

        const response = await this.processMessage(message.content, topic);
        
        console.log(`📤 Sending response (${response.length} chars)...`);
        await message.reply(response);
        console.log('✅ Response sent!');

      } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
      }
    });
  }

  async processMessage(content, topic) {
    console.log(`🤖 Processing: "${content}" for topic: ${topic}`);
    
    try {
      const health = await axios.get(`${this.wzrdclawBaseUrl}/health`);
      console.log('🔧 Backend health:', health.data.status);
      
      const tools = await axios.get(`${this.wzrdclawBaseUrl}/api/integration/tools`);
      console.log('🛠️ Tools available:', tools.data.tools.length);
      
      // Better responses based on content
      const lowerContent = content.toLowerCase().trim();
      
      if (lowerContent === 'help' || lowerContent === 'commands') {
        return `
**🤖 WZRDClaw Bot Help**  
*Connected to WZRDClaw backend with ${tools.data.tools.length} tools*

**Available Tools:** ${tools.data.tools.join(', ')}

**Commands:**
• \`help\` - Show this message
• \`status\` - Check backend status  
• \`tools\` - List available tools
• \`bash <command>\` - Run shell command
• Any message - Chat with WZRDClaw

**Channel:** ${topic}
**Backend:** ✅ Connected (${this.wzrdclawBaseUrl})
`;
      }
      
      if (lowerContent === 'status' || lowerContent === 'health') {
        return `
**🔧 WZRDClaw Status**
• **Backend:** ${health.data.status}
• **Tools:** ${tools.data.tools.length} available
• **Components:** ${health.data.components?.join(', ') || 'N/A'}
• **URL:** ${this.wzrdclawBaseUrl}
• **Channel:** ${topic}
`;
      }
      
      if (lowerContent === 'tools' || lowerContent.includes('tool')) {
        return `
**🛠️ Available Tools (${tools.data.tools.length})**
\`\`\`
${tools.data.tools.join(', ')}
\`\`\`
**Backend:** ${this.wzrdclawBaseUrl}
`;
      }
      
      if (lowerContent.startsWith('bash ')) {
        const cmd = content.substring(5).trim();
        if (!cmd) {
          return '**⚠️ Please provide a command.**\nExample: `bash ls` or `bash pwd`';
        }
        
        try {
          const { execSync } = require('child_process');
          const result = execSync(cmd, { encoding: 'utf-8', cwd: process.cwd() });
          return `**💻 Command:** \`${cmd}\`\n\`\`\`\n${result.slice(0, 1800)}\n\`\`\``;
        } catch (error) {
          return `**❌ Command Failed**\n\`${cmd}\`\nError: ${error.message}`;
        }
      }
      
      // Default response - more conversational
      const responses = [
        `**🤖 WZRDClaw Response**\nHey! I'm connected to the WZRDClaw backend with ${tools.data.tools.length} tools ready to help. You said: "${content}"\n\n*What would you like to do? Try \`help\` for commands.*`,
        `**🧠 Processing in ${topic}**\n"${content}"\n\n✅ Connected to WZRDClaw (${tools.data.tools.length} tools)\nTry: \`help\`, \`status\`, or \`bash ls\``,
        `**⚡ WZRDClaw Active**\nReceived: "${content}"\n\n🔗 Backend: ${this.wzrdclawBaseUrl}\n🛠️ Tools: ${tools.data.tools.length}\n💬 Channel: ${topic}\n\nNeed help? Type \`help\``
      ];
      
      return responses[Math.floor(Math.random() * responses.length)];

    } catch (error) {
      console.error('🚨 Backend error:', error.message);
      return `**❌ Connection Error**\nCould not reach WZRDClaw backend at ${this.wzrdclawBaseUrl}\nError: ${error.message}`;
    }
  }

  async start() {
    if (!YOUR_BOT_TOKEN) {
      console.error('❌ No bot token provided');
      process.exit(1);
    }

    try {
      await this.client.login(YOUR_BOT_TOKEN);
      console.log('🎉 Bot started successfully!');
    } catch (error) {
      console.error('❌ Login failed:', error.message);
      process.exit(1);
    }
  }
}

// Start bot
const bot = new DirectWZRDClawDiscordBot();
bot.start();

// Keep process alive
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down...');
  process.exit(0);
});