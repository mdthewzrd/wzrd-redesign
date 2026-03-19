const { Client, GatewayIntentBits, Events } = require('discord.js');
const yaml = require('js-yaml');
const fs = require('fs');

const config = yaml.load(fs.readFileSync('/home/mdwzrd/wzrd-redesign/interfaces/discord-config.yaml', 'utf8'));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

client.once(Events.ClientReady, () => {
  console.log(`[DiscordBot] Logged in as ${client.user.tag}`);
});

client.on(Events.MessageCreate, async (message) => {
  console.log(`[DiscordBot] Message received: "${message.content}" from ${message.author.tag} in #${message.channel.name}`);
  
  if (message.author.bot) {
    console.log('[DiscordBot] Ignoring bot message');
    return;
  }

  // React to show we saw it
  try {
    await message.react('👀');
    console.log('[DiscordBot] Reacted successfully');
  } catch (err) {
    console.error('[DiscordBot] React error:', err.message);
  }

  // Check for commands
  if (message.content.startsWith('!wzrd')) {
    console.log('[DiscordBot] Command detected');
    
    // Show typing
    try {
      await message.channel.sendTyping();
      console.log('[DiscordBot] Typing sent');
    } catch (err) {
      console.error('[DiscordBot] Typing error:', err.message);
    }

    // Wait then respond
    setTimeout(async () => {
      try {
        const reply = await message.reply('Hello! I received your command!');
        console.log('[DiscordBot] Reply sent:', reply.id);
      } catch (err) {
        console.error('[DiscordBot] Reply error:', err.message);
      }
    }, 1000);
  }

  // Respond to mentions
  if (message.mentions.has(client.user)) {
    console.log('[DiscordBot] Mention detected');
    try {
      await message.channel.sendTyping();
      const reply = await message.reply('You mentioned me! Try: `!wzrd hello`');
      console.log('[DiscordBot] Mention reply sent:', reply.id);
    } catch (err) {
      console.error('[DiscordBot] Mention error:', err.message);
    }
  }
});

client.on(Events.Error, (error) => {
  console.error('[DiscordBot] Client error:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('[DiscordBot] Unhandled rejection:', error);
});

client.login(config.discord.bot_token).catch(err => {
  console.error('[DiscordBot] Login failed:', err.message);
  process.exit(1);
});
