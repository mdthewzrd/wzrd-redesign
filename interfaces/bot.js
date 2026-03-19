const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

// Load Discord config
const config = yaml.load(fs.readFileSync('/home/mdwzrd/wzrd-redesign/interfaces/discord-config.yaml', 'utf8'));

// Load topic config
const topicConfig = yaml.load(fs.readFileSync('/home/mdwzrd/wzrd-redesign/topics/config.yaml', 'utf8'));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

// Topic mappings from config
const TOPIC_CHANNELS = {};
Object.entries(topicConfig).forEach(([topicId, topic]) => {
  if (topic.discord_channel_ids) {
    topic.discord_channel_ids.forEach(channelId => {
      TOPIC_CHANNELS[channelId] = {
        topicId,
        name: topic.name,
        cliAlias: topic.cli_alias
      };
    });
  }
});

// Natural language command patterns
const COMMAND_PATTERNS = {
  loadtopic: [
    'load topic', 'load the topic', 'switch to topic', 'change to topic',
    'open topic', 'switch topic', 'change topic', 'show topic',
    'load framework', 'load web ui', 'load documentation'
  ],
  addtotopic: [
    'add to topic', 'add this to topic', 'organize under',
    'put in topic', 'save to topic', 'assign to topic', 'this is about'
  ],
  loadchannel: [
    'load channel', 'sync with discord', 'pull from discord',
    'sync channel', 'get discord context', 'load discord', 'get team context'
  ],
  addtochannel: [
    'add to channel', 'share to discord', 'post to discord',
    'send to channel', 'publish to discord', 'share with team', 'post summary'
  ],
  help: [
    'help', 'what can you do', 'commands', 'how to use', 'assist me'
  ],
  status: [
    'status', 'what topic is this', 'current topic', 'what are we working on'
  ]
};

// Topic name mappings
const TOPIC_ALIASES = {
  'framework': 'wzrd-framework-core',
  'core': 'wzrd-framework-core',
  'optimization': 'wzrd-framework-core',
  'performance': 'wzrd-framework-core',
  'topic system': 'wzrd-topic-system',
  'topics': 'wzrd-topic-system',
  'discord': 'wzrd-topic-system',
  'web ui': 'wzrd-web-ui',
  'web': 'wzrd-web-ui',
  'ui': 'wzrd-web-ui',
  'react': 'wzrd-web-ui',
  'documentation': 'wzrd-documentation',
  'docs': 'wzrd-documentation',
  'skills': 'wzrd-documentation',
  'wzrd-redesign': 'wzrd-redesign',
  'redesign': 'wzrd-redesign'
};

client.once('clientReady', () => {
  console.log(`🤖 Bot logged in as ${client.user.tag}`);
  console.log(`📋 Available topics: ${Object.keys(topicConfig).join(', ')}`);

  // Set activity
  client.user.setActivity('Type @remi for help', { type: ActivityType.Custom });
});

client.on('messageCreate', async (message) => {
  // Ignore bot messages
  if (message.author.bot) return;

  const content = message.content;
  const isMention = message.mentions.has(client.user);
  const isDM = message.channel.isDMBased();

  console.log(`[${message.channel.name || 'DM'}] ${message.author.tag}: "${content.substring(0, 50)}..."`);

  // Handle test command (keep for debugging)
  if (content === '!test') {
    await message.reply('✅ Bot is working! Try mentioning me with @remi for topic commands.');
    return;
  }

  // Remove the bot mention from content (if present)
  let cleanContent = content
    .replace(new RegExp(`<@!?${client.user.id}>`), '')
    .trim();

  // Only skip single characters
  if (cleanContent.length <= 1) return;

  // Parse command
  const command = parseCommand(cleanContent);
  console.log(`   Parsed command: ${command.type} (confidence: ${command.confidence})`);

  // Send typing indicator
  await message.channel.sendTyping();

  // Execute command
  const response = await executeCommand(command, message, cleanContent);

  // Reply with response
  if (response) {
    await message.reply(response);
  }
});

function parseCommand(input) {
  const lowerInput = input.toLowerCase().trim();

  // Check each command type
  for (const [commandType, patterns] of Object.entries(COMMAND_PATTERNS)) {
    for (const pattern of patterns) {
      if (lowerInput.includes(pattern)) {
        return {
          type: commandType,
          target: extractTarget(lowerInput, commandType),
          confidence: calculateConfidence(lowerInput, pattern),
          raw: input
        };
      }
    }
  }

  // Check for simple greetings
  if (/^(hi|hello|hey|howdy)/.test(lowerInput)) {
    return { type: 'greeting', target: '', confidence: 1.0, raw: input };
  }

  // Default to conversational
  return { type: 'conversational', target: '', confidence: 0.5, raw: input };
}

function extractTarget(input, commandType) {
  let cleaned = input.toLowerCase();

  // Remove command patterns
  const patterns = COMMAND_PATTERNS[commandType] || [];
  for (const pattern of patterns) {
    cleaned = cleaned.replace(pattern, '');
  }

  cleaned = cleaned.trim();

  // Map to topic aliases
  if (commandType === 'loadtopic' || commandType === 'addtotopic') {
    for (const [alias, topicId] of Object.entries(TOPIC_ALIASES)) {
      if (cleaned.includes(alias)) {
        return topicId;
      }
    }
  }

  return cleaned || 'unknown';
}

function calculateConfidence(input, pattern) {
  if (input === pattern) return 1.0;
  if (input.includes(pattern)) {
    return Math.min(0.9, 0.5 + (pattern.length / input.length) * 0.4);
  }
  return 0.5;
}

async function executeCommand(command, message, rawContent) {
  const channelTopic = TOPIC_CHANNELS[message.channel.id];

  switch (command.type) {
    case 'greeting':
      return `👋 Hello ${message.author.username}! I'm Remi, your WZRD.dev assistant.\n\n` +
             `Current channel: **${channelTopic?.name || 'General'}**\n\n` +
             `Try asking me:\n` +
             `• "What topic is this?"\n` +
             `• "Load the framework topic"\n` +
             `• "What can you do?"`;

    case 'help':
      return getHelpText();

    case 'status':
      if (channelTopic) {
        return `📍 **Current Topic: ${channelTopic.name}**\n` +
               `• Topic ID: \`${channelTopic.topicId}\`\n` +
               `• CLI Alias: \`${channelTopic.cliAlias || 'none'}\`\n` +
               `• Channel: #${message.channel.name}\n\n` +
               `Use \`loadtopic ${channelTopic.topicId}\` in the TUI to sync.`;
      } else {
        return `📍 This channel is not mapped to a specific topic.\n\n` +
               `Available topics:\n` +
               Object.entries(topicConfig)
                 .filter(([_, t]) => t.is_active)
                 .map(([id, t]) => `• **${t.name}** (\`${id}\`)`)
                 .join('\n');
      }

    case 'loadtopic':
      if (command.target === 'unknown' || !topicConfig[command.target]) {
        const available = Object.keys(topicConfig).filter(k => topicConfig[k].is_active);
        return `❓ Topic not found. Available topics:\n` +
               available.map(id => `• ${topicConfig[id].name} (\`${id}\`)`).join('\n');
      }
      const topic = topicConfig[command.target];
      return `✅ **${topic.name}** loaded\n` +
             `• Description: ${topic.description}\n` +
             `• CLI: \`${topic.cli_alias || 'none'}\`\n` +
             `• Path: \`${topic.project_path || 'none'}\``;

    case 'addtotopic':
      return `📝 To add this session to a topic, use in TUI:\n` +
             `\`\`\`\n/addtotopic ${command.target}\n\`\`\`\n\n` +
             `Or mention what this session is about and I'll help categorize it.`;

    case 'loadchannel':
      if (!channelTopic) {
        return `⚠️ This channel isn't mapped to a topic yet.`;
      }
      return `🔄 Syncing with #${message.channel.name}...\n` +
             `To pull Discord context into TUI, use:\n` +
             `\`\`\`\n/loadchannel ${message.channel.name}\n\`\`\``;

    case 'addtochannel':
      return `📤 To share your TUI session to this channel, use in TUI:\n` +
             `\`\`\`\n/addtochannel ${message.channel.name}\n\`\`\`\n\n` +
             `This will post a summary of your current session.`;

    case 'conversational':
    default:
      // Context-aware response based on current channel
      if (channelTopic) {
        return `I'm here to help with **${channelTopic.name}**.\n\n` +
               `You can ask me to:\n` +
               `• Show the current topic status\n` +
               `• Load a different topic\n` +
               `• Help with commands\n\n` +
               `Or just chat about what you're working on!`;
      }
      return `I'm here to help! Try asking:\n` +
             `• "What topic is this?" - See current topic\n` +
             `• "Load framework topic" - Switch topics\n` +
             `• "What can you do?" - See all commands`;
  }
}

function getHelpText() {
  return `
🤖 **Remi - WZRD.dev Topic Assistant**

**Natural Language Commands:**
• "What topic is this?" - Show current topic
• "Load the [topic] topic" - Load a topic's context
• "Show status" - Get current channel info

**Topic Commands (in TUI):**
• \`/loadtopic <topic>\` - Load topic context
• \`/addtotopic <topic>\` - Add session to topic

**Discord Sync Commands:**
• \`/loadchannel <channel>\` - Pull Discord messages into TUI
• \`/addtochannel <channel>\` - Push TUI summary to Discord

**Available Topics:**
${Object.entries(topicConfig)
  .filter(([_, t]) => t.is_active)
  .map(([id, t]) => `• **${t.name}** - \`${id}\``)
  .join('\n')}

Mention me (@remi) in any channel to chat!
  `.trim();
}

// Error handling
client.on('error', (error) => {
  console.error('Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

// Login
client.login(config.discord.bot_token).catch(err => {
  console.error('Failed to login:', err);
  process.exit(1);
});

console.log('🚀 Starting bot...');
