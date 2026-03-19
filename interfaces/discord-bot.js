/**
 * Topic-Aware Discord Bot
 *
 * Integrates Discord channels with WZRD topics
 * Calls Gateway HTTP API for AI responses
 */
console.log('Loading discord.js...');
const { Client, GatewayIntentBits } = require('discord.js');
console.log('discord.js loaded');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Gateway HTTP URL
const GATEWAY_HTTP_URL = process.env.GATEWAY_HTTP_URL || 'http://127.0.0.1:18801';

// Topic registry path
const TOPICS_PATH = '/home/mdwzrd/wzrd-redesign/topics/data/topics.json';
const CONFIG_PATH = '/home/mdwzrd/wzrd-redesign/interfaces/discord-config.yaml';

class TopicDiscordBot {
  constructor(config) {
    this.config = {
      commandPrefix: '!wzrd',
      responseDelay: 1000,
      logFile: '/home/mdwzrd/wzrd-redesign/logs/discord.log',
      ...config,
    };

    // Initialize Discord client
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
      ],
    });

    // State
    this.messageHistory = new Map();
    this.topicMap = new Map();
    this.activeTopics = new Set();
    this.activeConversations = new Map();
  }

  async start() {
    try {
      await this.loadTopicMappings();
      this.setupEventHandlers();

      if (this.config.botToken === 'TEST_MODE') {
        console.log('[DiscordBot] Starting in TEST MODE');
        return;
      }

      await this.client.login(this.config.botToken);
      console.log(`[DiscordBot] Started as ${this.client.user?.tag}`);
    } catch (error) {
      console.error('[DiscordBot] Failed to start:', error);
      throw error;
    }
  }

  async loadTopicMappings() {
    try {
      if (fs.existsSync(CONFIG_PATH)) {
        const config = yaml.load(fs.readFileSync(CONFIG_PATH, 'utf8'));
        // Get channels from config.discord.channels
        const channels = config?.discord?.channels || {};

        // Only map actual channel IDs (strings that look like Discord IDs)
        const channelIdRegex = /^\d{17,20}$/;
        
        for (const [topicName, channelId] of Object.entries(channels)) {
          if (typeof channelId === 'string' && channelId.trim() && channelIdRegex.test(channelId)) {
            this.topicMap.set(channelId, topicName);
            console.log(`[DiscordBot] Mapped topic "${topicName}" to channel ${channelId}`);
          }
        }
        
        console.log(`[DiscordBot] Loaded ${this.topicMap.size} channel mappings`);
      }
    } catch (error) {
      console.error('[DiscordBot] Failed to load config:', error);
    }
  }

  setupEventHandlers() {
    this.client.on('messageCreate', async (message) => {
      console.log(`[DiscordBot] Message received: "${message.content.substring(0, 50)}..." in channel ${message.channel.id} by ${message.author.tag}`);
      
      if (message.author.bot) {
        console.log('[DiscordBot] Ignoring bot message');
        return;
      }
      if (!message.content.trim()) {
        console.log('[DiscordBot] Ignoring empty message');
        return;
      }

      try {
        if (message.content.startsWith(this.config.commandPrefix)) {
          console.log('[DiscordBot] Processing command');
          await this.handleCommand(message);
        } else {
          console.log('[DiscordBot] Processing regular message');
          await this.processMessage(message);
        }
      } catch (error) {
        console.error('[DiscordBot] Error:', error);
        await message.reply('Sorry, I encountered an error.');
      }
    });

    this.client.on('ready', () => {
      console.log(`[DiscordBot] Logged in as ${this.client.user?.tag}`);
    });
  }

  async handleCommand(message) {
    const content = message.content.slice(this.config.commandPrefix.length).trim();
    const args = content.split(/\s+/);
    const command = args.shift()?.toLowerCase();

    switch (command) {
      case 'status':
        await this.handleStatusCommand(message);
        break;
      case 'help':
        await message.reply(
          `**WZRD Bot Commands**\n\n` +
          `\`${this.config.commandPrefix} status\` - Show current topic\n` +
          `\`${this.config.commandPrefix} help\` - Show this help`
        );
        break;
      default:
        await message.reply(`Unknown command. Use \`${this.config.commandPrefix} help\`.`);
    }
  }

  async handleStatusCommand(message) {
    const channelId = message.channel.id;
    const topicId = this.topicMap.get(channelId);

    if (topicId) {
      await message.reply(`📍 Current topic: **${topicId}**`);
    } else {
      await message.reply('📍 This channel is not mapped to a topic.');
    }
  }

  async processMessage(message) {
    const channelId = message.channel.id;
    const topicId = this.topicMap.get(channelId);

    if (!topicId) {
      console.log(`[DiscordBot] No topic mapping for channel ${channelId}`);
      return;
    }

    this.activeTopics.add(topicId);

    // React with 👀 to show we're processing
    try {
      await message.react('👀');
      console.log(`[DiscordBot] Reacted with 👀 to message from ${message.author.tag}`);
    } catch (error) {
      console.log(`[DiscordBot] Failed to react:`, error.message);
    }

    // Show typing indicator
    try {
      await message.channel.sendTyping();
      console.log(`[DiscordBot] Sent typing indicator in channel ${channelId}`);
    } catch (error) {
      console.log(`[DiscordBot] Failed to send typing:`, error.message);
    }

    // Create response via Gateway
    const response = await this.createResponse({
      content: message.content,
      channelId,
      userId: message.author.id,
      username: message.author.username,
      timestamp: Date.now(),
      isBot: false,
    }, topicId);

    // Send response
    if (this.config.responseDelay > 0) {
      await new Promise(r => setTimeout(r, this.config.responseDelay));
    }

    await message.reply(response.content);
  }

  async createResponse(message, topicId) {
    try {
      const conversationKey = `${message.userId}:${topicId}`;
      const cachedConv = this.activeConversations.get(conversationKey);
      const conversationId = cachedConv?.id;

      // Build request for Gateway
      const payload = {
        method: 'gateway.chat',
        params: {
          prompt: message.content,
          userId: message.userId,
          platform: 'discord',
          topic: topicId,
          botId: 'remi',
          dangerouslySkipPermissions: true,
          ...(conversationId && { conversationId }),
        },
        id: `discord-${Date.now()}`,
      };

      console.log(`[DiscordBot] Calling Gateway: ${GATEWAY_HTTP_URL}/gateway`);

      // Call Gateway HTTP API
      const res = await fetch(`${GATEWAY_HTTP_URL}/gateway`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Gateway returned ${res.status}`);
      }

      const result = await res.json();
      
      // Gateway V2 returns result.response, older versions had payload.response
      const gatewayResponse = result.result?.response || result.payload?.response || result.payload?.content || 'No response';
      const gatewayConversationId = result.result?.conversationId || result.payload?.conversationId;
      
      // Cache conversation ID
      if (gatewayConversationId) {
        this.activeConversations.set(conversationKey, {
          id: gatewayConversationId,
          timestamp: Date.now(),
        });
      }

      return {
        content: gatewayResponse,
        topic: topicId,
        model: 'Gateway V2',
        tokens: result.result?.sessionStats?.estimatedTokens || result.payload?.tokens || 0,
        cost: 0,
        conversationId: gatewayConversationId,
      };
    } catch (error) {
      console.error('[DiscordBot] Gateway error:', error);
      return {
        content: `I received your message, but I'm having trouble connecting to the Gateway.\n\n*Error: ${error.message}*`,
        topic: topicId,
        model: 'Error',
        tokens: 0,
        cost: 0,
      };
    }
  }

  async stop() {
    await this.client.destroy();
    console.log('[DiscordBot] Stopped');
  }
}

module.exports = { TopicDiscordBot };
