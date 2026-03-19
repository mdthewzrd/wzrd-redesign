"use strict";
// Real AI Discord Bot - Connects to actual AI API

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

class RealAIBot {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
      ],
    });
    
    // Claude API endpoint (you would use your actual API key)
    this.aiEndpoint = 'https://api.anthropic.com/v1/messages';
    this.aiModel = 'claude-3-5-sonnet-20241022';
    
    // Or use OpenAI
    this.openaiEndpoint = 'https://api.openai.com/v1/chat/completions';
    this.openaiModel = 'gpt-4-turbo-preview';
    
    // Use local AI if available
    this.localEndpoint = 'http://localhost:11434/api/chat'; // Ollama
    this.localModel = 'llama2';
    
    this.currentAiProvider = 'claude'; // claude, openai, local
    
    console.log('🧠 REAL AI Bot Initialized');
    console.log('🤖 Provider:', this.currentAiProvider);
    
    this.setupEventHandlers();
  }
  
  setupEventHandlers() {
    this.client.once(Events.ClientReady, () => {
      console.log(`✅ Logged in as ${this.client.user.tag}`);
      console.log(`🆔 User ID: ${this.client.user.id}`);
      console.log(`📡 Channels: ${Object.keys(CHANNEL_MAPPINGS).length} mapped`);
      console.log('🎯 REAL AI Mode: ACTIVE');
      console.log('🎮 Bot is ONLINE and ready!');
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
        
        // Get REAL AI response
        const response = await this.getRealAIResponse(message.content, topic, message.author.tag);
        
        // Send response
        await message.reply(response);
        
      } catch (error) {
        console.error('AI error:', error.message);
        try {
          // Fallback to WZRDClaw info
          const fallback = await this.getFallbackResponse(message.content, topic);
          await message.reply(fallback);
        } catch (e) {
          console.error('Fallback failed:', e.message);
        }
      }
    });
  }
  
  async getRealAIResponse(content, topic, username) {
    console.log(`🧠 Getting REAL AI response for: "${content}"`);
    
    try {
      // Try Claude API first
      const aiResponse = await this.callClaudeAPI(content, topic, username);
      return this.formatAIResponse(aiResponse, topic);
      
    } catch (claudeError) {
      console.log('Claude failed, trying OpenAI...');
      
      try {
        const aiResponse = await this.callOpenAI(content, topic, username);
        return this.formatAIResponse(aiResponse, topic);
        
      } catch (openaiError) {
        console.log('OpenAI failed, trying local...');
        
        try {
          const aiResponse = await this.callLocalAI(content, topic, username);
          return this.formatAIResponse(aiResponse, topic);
          
        } catch (localError) {
          console.log('All AI failed, using fallback');
          return await this.getFallbackResponse(content, topic);
        }
      }
    }
  }
  
  async callClaudeAPI(content, topic, username) {
    // This requires actual Claude API key
    const apiKey = process.env.CLAUDE_API_KEY;
    
    if (!apiKey) {
      throw new Error('No Claude API key');
    }
    
    const response = await axios.post(
      this.aiEndpoint,
      {
        model: this.aiModel,
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: `You are Remi, a WZRDClaw AI assistant. Topic: ${topic}. User: ${username}. Message: ${content}. Provide helpful, technical AI response.`
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        timeout: 30000
      }
    );
    
    return response.data.content[0]?.text || 'Claude response error';
  }
  
  async callOpenAI(content, topic, username) {
    // This requires actual OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('No OpenAI API key');
    }
    
    const response = await axios.post(
      this.openaiEndpoint,
      {
        model: this.openaiModel,
        messages: [
          {
            role: "system",
            content: `You are Remi, a WZRDClaw AI assistant specializing in ${topic}. Be helpful and technical.`
          },
          {
            role: "user",
            content: `${username}: ${content}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        timeout: 30000
      }
    );
    
    return response.data.choices[0]?.message?.content || 'OpenAI response error';
  }
  
  async callLocalAI(content, topic, username) {
    // Try local Ollama
    try {
      const response = await axios.post(
        this.localEndpoint,
        {
          model: this.localModel,
          messages: [
            {
              role: "user",
              content: `[Topic: ${topic}, User: ${username}] ${content}`
            }
          ],
          stream: false
        },
        {
          timeout: 60000
        }
      );
      
      return response.data.message?.content || 'Local AI response error';
    } catch (error) {
      throw new Error(`Local AI: ${error.message}`);
    }
  }
  
  formatAIResponse(aiText, topic) {
    // Format the AI response nicely
    return `**🤖 Remi AI Assistant** *(${topic})*\n\n${aiText}\n\n*Powered by AI*`;
  }
  
  async getFallbackResponse(content, topic) {
    // Enhanced fallback when AI APIs fail
    console.log('Using enhanced fallback');
    
    try {
      // Check WZRDClaw backend
      const health = await axios.get('http://localhost:7476/health');
      const tools = await axios.get('http://localhost:7476/api/integration/tools');
      
      const toolCount = tools.data.tools?.length || 0;
      
      const responses = [
        `**🧠 AI Assistant** *(${topic})*\n"${content}"\n\n🔗 *Connected to WZRDClaw backend*\n🛠️ ${toolCount} tools available\n\n*Note: AI API connection pending. I can still help with commands:*\n• \`help\` - Show commands\n• \`bash <cmd>\` - Run commands\n• \`status\` - Check backend`,
        `**⚡ WZRDClaw Assistant**\nYour message: "${content}"\n\n✅ Backend: ${health.data.status}\n🔧 Tools: ${toolCount}\n💬 Channel: ${topic}\n\n*Real AI responses require API key setup.*\nTry: \`bash echo "Hello"\``,
        `**🤖 Technical Assistant**\n"${content}"\n\n🛠️ WZRDClaw tools: ${toolCount}\n🔗 Backend: Connected\n🎯 Topic: ${topic}\n\n*Available without AI:*\n• Command execution\n• File operations\n• Code analysis\n• System monitoring`
      ];
      
      return responses[Math.floor(Math.random() * responses.length)];
      
    } catch (error) {
      // Ultimate fallback
      return `**🤖 Remi Assistant**\n"${content}"\n\n💬 Topic: ${topic}\n\n*I'm your WZRDClaw assistant! Real AI responses require API setup.*\n\nTry these commands:\n• \`help\` - Show available features\n• Ask technical questions\n• Request code examples\n• Discuss system design`;
    }
  }
  
  async start() {
    try {
      await this.client.login(YOUR_BOT_TOKEN);
      console.log('🔐 Login successful');
      
      // Keep alive
      setInterval(() => {
        console.log('💓 Heartbeat: Bot alive');
      }, 60000);
      
    } catch (error) {
      console.error('❌ Login failed:', error.message);
      process.exit(1);
    }
  }
}

// Start bot
console.log('🚀 Starting REAL AI Discord Bot');
console.log('🎯 Will attempt: Claude → OpenAI → Local → Fallback');

const bot = new RealAIBot();
bot.start();

// Handle shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down...');
  process.exit(0);
});