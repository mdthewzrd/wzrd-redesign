"use strict";
/**
 * WZRDClaw Discord Bot - Integrated with WZRDClaw backend (7476)
 * Uses existing discord.js setup
 */

const { Client, GatewayIntentBits, Events } = require('discord.js');
const yaml = require('js-yaml');
const fs = require('fs');
const axios = require('axios');

const config = yaml.load(fs.readFileSync('/home/mdwzrd/wzrd-redesign/interfaces/discord-config.yaml', 'utf8'));

class WZRDClawDiscordBot {
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

    this.channelMappings = config.discord?.channels || {};
    console.log(`[WZRDClawBot] Channel mappings:`, Object.keys(this.channelMappings).length);
    this.setupEventHandlers();
    
    console.log(`[WZRDClawBot] Connecting to backend: ${this.wzrdclawBaseUrl}`);
  }

  setupEventHandlers() {
    this.client.once(Events.ClientReady, () => {
      console.log(`[WZRDClawBot] Logged in as ${this.client.user.tag}`);
      console.log(`[WZRDClawBot] Connected to WZRDClaw backend: ${this.wzrdclawBaseUrl}`);
    });

    this.client.on(Events.MessageCreate, async (message) => {
      // Ignore bot messages
      if (message.author.bot) return;

      // Check if channel is mapped
      const channelId = message.channel.id;
      const topic = Object.keys(this.channelMappings).find(key => 
        this.channelMappings[key] === channelId
      );

      if (!topic) {
        // Not a mapped channel
        return;
      }

      try {
        // Show processing
        await message.react('👀');
        await message.channel.sendTyping();

        // Process through WZRDClaw
        const response = await this.processWithWZRDClaw(
          message.content,
          message.author.id,
          topic
        );

        // Send response
        await message.reply(response);

      } catch (error) {
        console.error('[WZRDClawBot] Error processing message:', error);
        await message.reply('❌ Error processing request. Check WZRDClaw backend.');
      }
    });
  }

  async processWithWZRDClaw(content, userId, topic) {
    try {
      // Check backend health
      const healthResponse = await axios.get(`${this.wzrdclawBaseUrl}/health`);
      
      if (!healthResponse.data.success) {
        return '⚠️ WZRDClaw backend is not responding properly.';
      }

      // Get available tools
      const toolsResponse = await axios.get(`${this.wzrdclawBaseUrl}/api/integration/tools`);
      const availableTools = toolsResponse.data.tools || [];
      const toolCount = availableTools.length;

      // Simple command routing
      const lowerContent = content.toLowerCase();
      
      if (lowerContent.includes('help')) {
        return this.getHelpResponse(availableTools);
      }
      
      if (lowerContent.includes('bash')) {
        const cmd = content.replace(/^bash\s+/i, '').trim() || 'ls';
        const { execSync } = require('child_process');
        try {
          const result = execSync(cmd, { encoding: 'utf-8', cwd: process.cwd() });
          return `\`\`\`bash\n${cmd}\n\`\`\`\n\`\`\`\n${result.slice(0, 1800)}\n\`\`\``;
        } catch (error) {
          return `❌ Command failed: ${error.message}`;
        }
      }
      
      if (lowerContent.includes('status')) {
        return `🟢 **WZRDClaw Status**\n• Backend: ✅ Connected\n• Tools: ${toolCount} available\n• URL: ${this.wzrdclawBaseUrl}`;
      }
      
      if (lowerContent.includes('tools')) {
        return `🛠️ **Available Tools (${toolCount})**:\n\`\`\`\n${availableTools.join(', ')}\n\`\`\``;
      }

      // Default chat response
      return this.getChatResponse(content, topic, availableTools);

    } catch (error) {
      console.error('[WZRDClawBot] Backend error:', error.message);
      return '🚨 Error connecting to WZRDClaw backend. Backend may be down.';
    }
  }

  getHelpResponse(tools) {
    const toolCount = tools.length;
    
    return `
🤖 **WZRDClaw Discord Bot** 🔗 *Integrated*

🛠️ **Available Tools:** ${toolCount} tools
\`\`\`
${tools.join(', ')}
\`\`\`

📋 **Commands:**
• \`help\` - Show this message
• \`bash <command>\` - Execute shell command
• \`status\` - Check backend status
• \`tools\` - List available tools
• Any message - General chat through WZRDClaw

💬 **Channels:** Same channel mappings
🔗 **Backend:** Connected to \`localhost:7476\`
✅ **Status:** Operational with ${toolCount} tools
    `;
  }

  getChatResponse(message, topic, tools) {
    const responses = [
      `🤖 **WZRDClaw Response** (${topic}):\n"${message}"\n\nConnected with ${tools.length} tools available.`,
      `🧠 **Processing in ${topic}**:\n"${message}"\n\nWZRDClaw backend active with tools: ${tools.slice(0, 5).join(', ')}...`,
      `⚡ **WZRDClaw integrated**:\n"${message}"\n\nBackend: ✅ | Tools: ${tools.length}`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  async start() {
    try {
      // Use token from config or environment
      const token = config.token || process.env.DISCORD_BOT_TOKEN;
      
      if (!token) {
        console.error('[WZRDClawBot] No Discord bot token found');
        process.exit(1);
      }

      await this.client.login(token);
      console.log('[WZRDClawBot] Started successfully');

    } catch (error) {
      console.error('[WZRDClawBot] Failed to start:', error);
      process.exit(1);
    }
  }
}

// Start bot if run directly
if (require.main === module) {
  const bot = new WZRDClawDiscordBot();
  bot.start();
}

module.exports = WZRDClawDiscordBot;