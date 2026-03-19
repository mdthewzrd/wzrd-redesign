"use strict";
/**
 * Simple Discord Bot with Debug Logging
 */

const { Client, GatewayIntentBits, Events } = require('discord.js');
const yaml = require('js-yaml');
const fs = require('fs');

const config = yaml.load(fs.readFileSync('/home/mdwzrd/wzrd-redesign/interfaces/discord-config.yaml', 'utf8'));

class SimpleDiscordBot {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
      ],
    });

    this.commandPrefix = '!wzrd';
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.client.once(Events.ClientReady, () => {
      console.log(`[DiscordBot] Logged in as ${this.client.user.tag}`);
    });

    this.client.on(Events.MessageCreate, async (message) => {
      console.log(`[DiscordBot] Received message: "${message.content.substring(0, 50)}" from ${message.author.tag}`);
      
      if (message.author.bot) {
        console.log('[DiscordBot] Ignoring bot message');
        return;
      }

      // React first
      try {
        await message.react('👀');
        console.log('[DiscordBot] Reacted with eyes');
      } catch (e) {
        console.log('[DiscordBot] React error:', e.message);
      }

      // Check for command
      const content = message.content.trim();
      console.log(`[DiscordBot] Checking if command: starts with "${this.commandPrefix}" = ${content.startsWith(this.commandPrefix)}`);

      if (!content.startsWith(this.commandPrefix)) {
        // Check for mention
        if (message.mentions.has(this.client.user)) {
          console.log('[DiscordBot] Responding to mention');
          try {
            await message.channel.sendTyping();
            console.log('[DiscordBot] Sent typing indicator');
            await new Promise(resolve => setTimeout(resolve, 1000));
            await message.reply('Hello! How can I help? Try: `!wzrd help`');
            console.log('[DiscordBot] Replied to mention');
          } catch (e) {
            console.log('[DiscordBot] Mention reply error:', e.message);
          }
        }
        return;
      }

      // Parse command
      const args = content.slice(this.commandPrefix.length).trim().split(/ +/);
      const command = args.shift().toLowerCase();
      console.log(`[DiscordBot] Command detected: "${command}"`);

      // Send typing indicator
      try {
        await message.channel.sendTyping();
        console.log('[DiscordBot] Typing sent');
      } catch (e) {
        console.log('[DiscordBot] Typing error:', e.message);
      }

      // Wait a bit then respond
      await new Promise(resolve => setTimeout(resolve, 1000));

      try {
        switch (command) {
          case 'help':
            await message.reply('**Commands:** `!wzrd help`, `!wzrd status`, `!wzrd hello`');
            break;
          case 'status':
            await message.reply(`✅ Online! Latency: ${this.client.ws.ping}ms`);
            break;
          case 'hello':
            await message.reply('Hello! I am Remi! 👋');
            break;
          default:
            await message.reply(`Unknown command: "${command}". Try: !wzrd help`);
        }
        console.log('[DiscordBot] Command executed successfully');
      } catch (e) {
        console.log('[DiscordBot] Command execution error:', e.message);
      }
    });

    this.client.on(Events.Error, (error) => {
      console.error('[DiscordBot] Error:', error.message);
    });
  }

  async start() {
    try {
      await this.client.login(config.discord.bot_token);
    } catch (error) {
      console.error('[DiscordBot] Failed to start:', error.message);
      process.exit(1);
    }
  }
}

const bot = new SimpleDiscordBot();
bot.start();
