"use strict";
// Debug version with more logging

const { Client, GatewayIntentBits, Events } = require('discord.js');
const yaml = require('js-yaml');
const fs = require('fs');
const axios = require('axios');

const config = yaml.load(fs.readFileSync('/home/mdwzrd/wzrd-redesign/interfaces/discord-config.yaml', 'utf8'));

class DebugWZRDClawDiscordBot {
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
    console.log('[DEBUG] Channel mappings:', this.channelMappings);
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.client.once(Events.ClientReady, () => {
      console.log('[DEBUG] ✅ Logged in as', this.client.user.tag);
      console.log('[DEBUG] 🆔 User ID:', this.client.user.id);
    });

    this.client.on(Events.MessageCreate, async (message) => {
      console.log(`[DEBUG] 📨 Message received: "${message.content}" in channel ${message.channel.id} by ${message.author.tag}`);
      
      if (message.author.bot) {
        console.log('[DEBUG] ⏭️ Ignoring bot message');
        return;
      }

      const channelId = message.channel.id;
      console.log('[DEBUG] 🔍 Checking channel:', channelId);
      
      // Find topic for this channel
      const topic = Object.keys(this.channelMappings).find(key => 
        this.channelMappings[key] === channelId
      );

      if (!topic) {
        console.log('[DEBUG] ⚠️ Channel not mapped:', channelId);
        console.log('[DEBUG] Available mappings:', Object.entries(this.channelMappings));
        return;
      }

      console.log('[DEBUG] ✅ Channel mapped to topic:', topic);

      try {
        console.log('[DEBUG] 👀 Adding reaction...');
        await message.react('👀');
        console.log('[DEBUG] ✅ Reaction added');
        
        console.log('[DEBUG] ⌨️ Sending typing indicator...');
        await message.channel.sendTyping();
        console.log('[DEBUG] ✅ Typing indicator sent');

        console.log('[DEBUG] 🔄 Processing with WZRDClaw...');
        const response = await this.processWithWZRDClaw(
          message.content,
          message.author.id,
          topic
        );

        console.log('[DEBUG] 📤 Sending response:', response.substring(0, 100) + '...');
        await message.reply(response);
        console.log('[DEBUG] ✅ Response sent');

      } catch (error) {
        console.error('[DEBUG] ❌ Error:', error);
        console.error('[DEBUG] Stack:', error.stack);
        try {
          await message.reply(`❌ Error: ${error.message}`);
        } catch (e) {
          console.error('[DEBUG] Failed to send error message:', e);
        }
      }
    });
  }

  async processWithWZRDClaw(content, userId, topic) {
    console.log('[DEBUG] 🤖 Processing:', { content, userId, topic });
    
    try {
      console.log('[DEBUG] 🔗 Checking backend:', this.wzrdclawBaseUrl);
      const healthResponse = await axios.get(`${this.wzrdclawBaseUrl}/health`);
      console.log('[DEBUG] Backend health:', healthResponse.data);
      
      if (!healthResponse.data.success) {
        return '⚠️ WZRDClaw backend error';
      }

      const toolsResponse = await axios.get(`${this.wzrdclawBaseUrl}/api/integration/tools`);
      const tools = toolsResponse.data.tools || [];
      console.log('[DEBUG] Tools available:', tools);

      return `🤖 **WZRDClaw Debug Response**\nTopic: ${topic}\nTools: ${tools.length}\nYour message: "${content}"`;

    } catch (error) {
      console.error('[DEBUG] Backend error:', error.message);
      return `🚨 Backend error: ${error.message}`;
    }
  }

  async start() {
    const token = "YOUR_DISCORD_BOT_TOKEN_HERE";
    
    if (!token) {
      console.error('[DEBUG] ❌ No token');
      process.exit(1);
    }

    console.log('[DEBUG] 🔑 Token length:', token.length);
    
    try {
      await this.client.login(token);
      console.log('[DEBUG] 🚀 Bot started');
    } catch (error) {
      console.error('[DEBUG] ❌ Login failed:', error.message);
      process.exit(1);
    }
  }
}

if (require.main === module) {
  const bot = new DebugWZRDClawDiscordBot();
  bot.start();
}