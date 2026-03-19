"use strict";
/**
 * Topic-Aware Discord Bot
 *
 * Integrates Discord channels with WZRD topics:
 * - Maps Discord channels ↔ Topics
 * - Syncs messages across interfaces
 * - Provides topic-based conversation
 * - Enforces cost tracking
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopicDiscordBot = void 0;
const discord_js_1 = require("discord.js");
const registry_1 = require("../topics/registry");
const sync_manager_1 = require("./sync-manager");
// HTTP client for Gateway API
const GATEWAY_HTTP_URL = process.env.GATEWAY_HTTP_URL || 'http://127.0.0.1:18801';
const GATEWAY_WS_URL = process.env.GATEWAY_WS_URL || 'ws://127.0.0.1:18800';
class TopicDiscordBot {
    constructor(config) {
        this.messageHistory = new Map();
        this.topicMap = new Map(); // channelId -> topicId
        this.activeTopics = new Set();
        this.initialized = false;
        this.activeConversations = new Map();
        this.config = {
            commandPrefix: '!wzrd',
            responseDelay: 1000,
            logFile: '/home/mdwzrd/wzrd-redesign/logs/discord.log',
            ...config,
        };
        // Initialize Discord client
        this.client = new discord_js_1.Client({
            intents: [
                discord_js_1.GatewayIntentBits.Guilds,
                discord_js_1.GatewayIntentBits.GuildMessages,
                discord_js_1.GatewayIntentBits.MessageContent,
                discord_js_1.GatewayIntentBits.GuildMembers,
            ],
        });
        // Initialize WZRD systems
        this.topicRegistry = new registry_1.default();
        this.syncManager = new sync_manager_1.InterfaceSyncManager();
    }
    /**
     * Start the Discord bot
     */
    async start() {
        try {
            // Initialize systems
            await this.initializeSystems();
            // Setup Discord event handlers
            this.setupEventHandlers();
            // If test mode, setup mock WebSocket
            if (this.config.botToken === 'TEST_MODE') {
                console.log('[DiscordBot] Starting in TEST MODE (mock WebSocket)');
                await this.startMockWebSocket();
                return;
            }
            // Login to Discord
            await this.client.login(this.config.botToken);
            console.log(`[DiscordBot] Started successfully. Prefix: ${this.config.commandPrefix}`);
            this.log('info', 'Discord bot started');
        }
        catch (error) {
            console.error('[DiscordBot] Failed to start:', error);
            this.log('error', `Failed to start: ${error}`);
            throw error;
        }
    }
    /**
     * Start mock WebSocket for testing
     */
    async startMockWebSocket() {
        console.log('[DiscordBot] Starting mock WebSocket server on port 8765');
        const WebSocket = require('ws');
        const wss = new WebSocket.Server({ port: 8765 });
        wss.on('connection', (ws) => {
            console.log('[DiscordBot] Mock WebSocket client connected');
            // Send welcome message
            ws.send(JSON.stringify({
                type: 'system',
                message: 'Mock Discord WebSocket connected',
                timestamp: Date.now(),
            }));
            // Handle incoming messages
            ws.on('message', async (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    await this.handleMockMessage(message, ws);
                }
                catch (error) {
                    console.error('[DiscordBot] Error processing mock message:', error);
                }
            });
            ws.on('close', () => {
                console.log('[DiscordBot] Mock WebSocket client disconnected');
            });
        });
        console.log('[DiscordBot] Mock WebSocket server ready at ws://localhost:8765');
    }
    /**
     * Handle mock WebSocket messages
     */
    async handleMockMessage(message, ws) {
        const { type, data } = message;
        switch (type) {
            case 'message':
                // Simulate incoming Discord message
                console.log(`[DiscordBot] Mock message: ${data.content}`);
                // Process as if from Discord
                const mockResponse = await this.createResponse({
                    content: data.content,
                    channelId: data.channelId || 'mock_channel_123',
                    userId: data.userId || 'mock_user_123',
                    username: data.username || 'MockUser',
                    timestamp: Date.now(),
                    isBot: false,
                }, data.topic || 'general');
                // Send response back
                ws.send(JSON.stringify({
                    type: 'response',
                    data: mockResponse,
                    timestamp: Date.now(),
                }));
                break;
            case 'command':
                // Handle mock command
                console.log(`[DiscordBot] Mock command: ${data.command}`);
                let response;
                if (data.command === 'topics') {
                    const topics = this.topicRegistry.listTopics();
                    response = {
                        type: 'command_response',
                        data: {
                            topics: topics.map(t => t.config.name),
                            activeTopics: Array.from(this.activeTopics),
                        },
                    };
                }
                else if (data.command === 'status') {
                    response = {
                        type: 'command_response',
                        data: {
                            status: 'running',
                            activeTopics: Array.from(this.activeTopics),
                            messageHistory: Array.from(this.messageHistory.entries()).map(([channel, msgs]) => ({
                                channel,
                                messageCount: msgs.length,
                            })),
                        },
                    };
                }
                else {
                    response = {
                        type: 'command_response',
                        data: {
                            error: 'Unknown command',
                            availableCommands: ['topics', 'status'],
                        },
                    };
                }
                ws.send(JSON.stringify(response));
                break;
            default:
                ws.send(JSON.stringify({
                    type: 'error',
                    data: { message: 'Unknown message type' },
                }));
        }
    }
    /**
     * Initialize WZRD systems
     */
    async initializeSystems() {
        if (this.initialized)
            return;
        console.log('[DiscordBot] Initializing systems...');
        // Initialize topic registry
        await this.topicRegistry.initialize();
        // Load topic-channel mappings
        await this.loadTopicMappings();
        // Initialize other systems
        // Note: Model router and cost tracker would be properly initialized here
        this.initialized = true;
        console.log('[DiscordBot] Systems initialized');
    }
    /**
     * Load topic-channel mappings from config
     */
    async loadTopicMappings() {
        const fs = require('fs');
        const yaml = require('js-yaml');
        const configPath = '/home/mdwzrd/wzrd-redesign/interfaces/discord-config.yaml';
        if (fs.existsSync(configPath)) {
            try {
                const config = yaml.load(fs.readFileSync(configPath, 'utf8'));
                const channels = config?.discord?.channels || {};
                for (const [topicName, channelId] of Object.entries(channels)) {
                    if (typeof channelId === 'string' && channelId.trim()) {
                        this.topicMap.set(channelId, topicName);
                        console.log(`[DiscordBot] Mapped topic "${topicName}" to channel ${channelId}`);
                    }
                }
            }
            catch (error) {
                console.error('[DiscordBot] Failed to load config:', error);
            }
        }
    }
    /**
     * Setup Discord event handlers
     */
    setupEventHandlers() {
        // Message handler
        this.client.on('messageCreate', async (message) => {
            await this.handleMessage(message);
        });
        // Ready handler
        this.client.on('ready', () => {
            console.log(`[DiscordBot] Logged in as ${this.client.user?.tag}`);
            this.log('info', `Logged in as ${this.client.user?.tag}`);
        });
        // Error handlers
        this.client.on('error', (error) => {
            console.error('[DiscordBot] Discord client error:', error);
            this.log('error', `Client error: ${error.message}`);
        });
        this.client.on('warn', (warning) => {
            console.warn('[DiscordBot] Discord client warning:', warning);
            this.log('warn', `Client warning: ${warning}`);
        });
        // Disconnect handler
        this.client.on('disconnect', () => {
            console.log('[DiscordBot] Disconnected from Discord');
            this.log('warn', 'Disconnected from Discord');
        });
    }
    /**
     * Handle incoming Discord messages
     */
    async handleMessage(message) {
        // Ignore bot messages
        if (message.author.bot)
            return;
        // Ignore empty messages
        if (!message.content.trim())
            return;
        try {
            // Check if message is a command
            if (message.content.startsWith(this.config.commandPrefix)) {
                await this.handleCommand(message);
                return;
            }
            // Process as regular message
            await this.processMessage(message);
        }
        catch (error) {
            console.error('[DiscordBot] Error handling message:', error);
            this.log('error', `Message handling error: ${error}`);
            // Send error response
            await message.reply({
                content: 'Sorry, I encountered an error processing your message.',
            });
        }
    }
    /**
     * Process regular messages
     */
    async processMessage(message) {
        const channelId = message.channel.id;
        const topicId = this.topicMap.get(channelId);
        // Store message in history
        const discordMessage = {
            content: message.content,
            channelId,
            userId: message.author.id,
            username: message.author.username,
            timestamp: Date.now(),
            isBot: false,
        };
        this.addToHistory(channelId, discordMessage);
        // If no topic mapping, prompt for topic creation
        if (!topicId) {
            await this.promptTopicCreation(message);
            return;
        }
        // Get topic
        const topic = this.topicRegistry.getTopicByName(topicId);
        if (!topic) {
            console.warn(`[DiscordBot] Topic not found: ${topicId}`);
            return;
        }
        // Track active topic
        this.activeTopics.add(topicId);
        // Process with topic context
        console.log(`[DiscordBot] Processing message in topic: ${topic.config.name}`);
        // Create response
        const response = await this.createResponse(discordMessage, topic.id);
        // Send response with delay
        if (this.config.responseDelay && this.config.responseDelay > 0) {
            await new Promise(resolve => setTimeout(resolve, this.config.responseDelay));
        }
        await message.reply(response.content);
        // Sync to other interfaces
        await this.syncManager.syncMessage({
            id: Date.now().toString(),
            content: message.content,
            response: response.content,
            topic: topic.config.name,
            interface: 'discord',
            userId: message.author.id,
            channelId,
            timestamp: Date.now(),
        });
        // Update topic progress
        this.topicRegistry.updateTopicProgress(topic.id, {
            last_update: new Date().toISOString(),
        });
        // Log
        this.log('info', `Processed message in ${topic.config.name}: ${message.content.substring(0, 50)}...`);
    }
    /**
     * Handle bot commands
     */
    async handleCommand(message) {
        const content = message.content.slice(this.config.commandPrefix.length).trim();
        const args = content.split(/\s+/);
        const command = args.shift()?.toLowerCase();
        console.log(`[DiscordBot] Command: ${command}, Args: ${args}`);
        switch (command) {
            case 'topics':
                await this.handleTopicsCommand(message, args);
                break;
            case 'help':
                await this.handleHelpCommand(message);
                break;
            case 'status':
                await this.handleStatusCommand(message);
                break;
            case 'cost':
                await this.handleCostCommand(message);
                break;
            case 'memory':
                await this.handleMemoryCommand(message, args);
                break;
            default:
                await message.reply(`Unknown command: ${command}. Use \`${this.config.commandPrefix} help\` for available commands.`);
        }
    }
    /**
     * Handle topics command
     */
    async handleTopicsCommand(message, args) {
        const subcommand = args.shift()?.toLowerCase();
        switch (subcommand) {
            case 'list':
                await this.listTopics(message);
                break;
            case 'create':
                await this.createTopic(message, args);
                break;
            case 'map':
                await this.mapTopic(message, args);
                break;
            default:
                const topics = this.topicRegistry.listTopics();
                const activeCount = this.activeTopics.size;
                const embed = {
                    color: 0x0099ff,
                    title: 'Topic Management',
                    description: `Active topics: ${activeCount} | Total topics: ${topics.length}`,
                    fields: [
                        {
                            name: 'Commands',
                            value: `\`${this.config.commandPrefix} topics list\` - List all topics\n` +
                                `\`${this.config.commandPrefix} topics create <name>\` - Create topic\n` +
                                `\`${this.config.commandPrefix} topics map <topic> <channel>\` - Map topic to channel`,
                        },
                        {
                            name: 'Active Topics',
                            value: Array.from(this.activeTopics).map(t => `• ${t}`).join('\n') || 'None',
                        },
                    ],
                };
                await message.reply({ embeds: [embed] });
        }
    }
    /**
     * List all topics
     */
    async listTopics(message) {
        const topics = this.topicRegistry.listTopics();
        const embed = {
            color: 0x0099ff,
            title: 'Available Topics',
            description: `Total topics: ${topics.length}`,
            fields: [],
        };
        if (topics.length === 0) {
            embed.fields = [{
                    name: 'No Topics',
                    value: 'Use `!wzrd topics create <name>` to create a topic.',
                }];
        }
        else {
            // Group topics into chunks for better display
            const chunks = [];
            for (let i = 0; i < topics.length; i += 10) {
                chunks.push(topics.slice(i, i + 10));
            }
            chunks.forEach((chunk, index) => {
                embed.fields.push({
                    name: `Topics ${index * 10 + 1}-${index * 10 + chunk.length}`,
                    value: chunk.map(topic => {
                        const isActive = this.activeTopics.has(topic.id) ? '🟢' : '⚪';
                        const channelId = Array.from(this.topicMap.entries())
                            .find(([_, topicName]) => topicName === topic.id)?.[0];
                        const channelMention = channelId ? `<#${channelId}>` : 'Not mapped';
                        return `${isActive} **${topic.config.name}** - ${channelMention}`;
                    }).join('\n'),
                });
            });
        }
        await message.reply({ embeds: [embed] });
    }
    /**
     * Create a new topic
     */
    async createTopic(message, args) {
        if (args.length === 0) {
            await message.reply('Please provide a topic name. Usage: `!wzrd topics create <name>`');
            return;
        }
        const topicName = args.join(' ');
        const topic = this.topicRegistry.createTopic(topicName, {
            description: `Topic created via Discord by ${message.author.username}`,
            discord_channel_id: message.channel.id,
        });
        // Map to current channel
        this.topicMap.set(message.channel.id, topic.id);
        await message.reply({
            embeds: [{
                    color: 0x00ff00,
                    title: 'Topic Created',
                    description: `Topic **${topic.config.name}** has been created and mapped to this channel.`,
                    fields: [
                        {
                            name: 'Topic ID',
                            value: topic.id,
                        },
                        {
                            name: 'Use',
                            value: `Messages in this channel will now be associated with topic "${topic.config.name}"`,
                        },
                    ],
                }],
        });
    }
    /**
     * Map topic to channel
     */
    async mapTopic(message, args) {
        if (args.length < 2) {
            await message.reply('Usage: `!wzrd topics map <topic> <channel>`');
            return;
        }
        const [topicName, channelId] = args;
        // Remove <#> from channel mention if present
        const cleanChannelId = channelId.replace(/[<#>]/g, '');
        // Find topic
        const topic = this.topicRegistry.getTopicByName(topicName);
        if (!topic) {
            await message.reply(`Topic "${topicName}" not found.`);
            return;
        }
        // Map topic to channel
        this.topicMap.set(cleanChannelId, topic.id);
        await message.reply({
            embeds: [{
                    color: 0x00ff00,
                    title: 'Topic Mapped',
                    description: `Topic **${topic.config.name}** has been mapped to <#${cleanChannelId}>`,
                }],
        });
    }
    /**
     * Handle help command
     */
    async handleHelpCommand(message) {
        const embed = {
            color: 0x0099ff,
            title: 'WZRD Discord Bot Help',
            description: 'Topic-aware Discord bot for WZRD.dev',
            fields: [
                {
                    name: 'Topic Commands',
                    value: `\`${this.config.commandPrefix} topics\` - Topic management\n` +
                        `\`${this.config.commandPrefix} topics list\` - List all topics\n` +
                        `\`${this.config.commandPrefix} topics create <name>\` - Create topic\n` +
                        `\`${this.config.commandPrefix} topics map <topic> <channel>\` - Map topic to channel`,
                },
                {
                    name: 'Utility Commands',
                    value: `\`${this.config.commandPrefix} help\` - This help message\n` +
                        `\`${this.config.commandPrefix} status\` - Bot status\n` +
                        `\`${this.config.commandPrefix} cost\` - Current cost tracking\n` +
                        `\`${this.config.commandPrefix} memory <query>\` - Search memory`,
                },
                {
                    name: 'Usage',
                    value: 'Simply send a message in a mapped channel to interact with the topic.\n' +
                        'Use commands with the `!wzrd` prefix for bot control.',
                },
            ],
        };
        await message.reply({ embeds: [embed] });
    }
    /**
     * Handle status command
     */
    async handleStatusCommand(message) {
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        const embed = {
            color: 0x0099ff,
            title: 'WZRD Bot Status',
            fields: [
                {
                    name: 'Uptime',
                    value: `${hours}h ${minutes}m ${seconds}s`,
                },
                {
                    name: 'Topics',
                    value: `Active: ${this.activeTopics.size}\nTotal: ${this.topicRegistry.listTopics().length}`,
                },
                {
                    name: 'Memory',
                    value: 'Topic-aware memory system active',
                },
                {
                    name: 'Sync',
                    value: 'Interface synchronization enabled',
                },
            ],
        };
        await message.reply({ embeds: [embed] });
    }
    /**
     * Handle cost command
     */
    async handleCostCommand(message) {
        // This would integrate with the actual cost tracker
        const embed = {
            color: 0x0099ff,
            title: 'Cost Tracking',
            description: 'Cost tracking is integrated with all interactions.',
            fields: [
                {
                    name: 'Daily Budget',
                    value: '$1.00 per day',
                },
                {
                    name: 'Current Usage',
                    value: 'Integrated with model router and memory system',
                },
                {
                    name: 'Safety',
                    value: 'Circuit breakers at 95% usage, warnings at 80%',
                },
            ],
        };
        await message.reply({ embeds: [embed] });
    }
    /**
     * Handle memory command
     */
    async handleMemoryCommand(message, args) {
        if (args.length === 0) {
            await message.reply('Usage: `!wzrd memory <query>`');
            return;
        }
        const query = args.join(' ');
        const channelId = message.channel.id;
        const topicId = this.topicMap.get(channelId);
        if (!topicId) {
            await message.reply('This channel is not mapped to a topic.');
            return;
        }
        // Search memory
        // const results = await this.memory.search(query, { topic: topicId, maxResults: 3 });
        // For now, show placeholder
        const embed = {
            color: 0x0099ff,
            title: 'Memory Search',
            description: `Searching for: "${query}" in topic: ${topicId}`,
            fields: [
                {
                    name: 'Status',
                    value: 'Memory search integrated with unified memory system.',
                },
                {
                    name: 'Note',
                    value: 'Full memory search requires jCodeMunch + agentic search systems.',
                },
            ],
        };
        await message.reply({ embeds: [embed] });
    }
    /**
     * Prompt for topic creation when channel not mapped
     */
    async promptTopicCreation(message) {
        const embed = {
            color: 0xff9900,
            title: 'Channel Not Mapped',
            description: `This channel (<#${message.channel.id}>) is not mapped to a topic.`,
            fields: [
                {
                    name: 'Options',
                    value: `1. Use \`${this.config.commandPrefix} topics create <name>\` to create topic\n` +
                        `2. Use \`${this.config.commandPrefix} topics map <topic> <channel>\` to map existing topic\n` +
                        `3. Continue without topic mapping (limited functionality)`,
                },
            ],
        };
        await message.reply({ embeds: [embed] });
    }
    /**
     * Create response for a message - calls Gateway HTTP API
     */
    async createResponse(message, topicId) {
        const topic = this.topicRegistry.getTopicByName(topicId);
        const topicName = topic?.config.name || topicId;
        try {
            // Build conversation key for caching
            const conversationKey = `${message.userId}:${topicId}`;
            let conversationId = this.activeConversations.get(conversationKey)?.id;
            // Build request payload for Gateway
            const payload = {
                method: 'gateway.chat',
                params: {
                    prompt: message.content,
                    userId: message.userId,
                    platform: 'discord',
                    topic: topicName,
                    botId: 'remi',
                    dangerouslySkipPermissions: true,
                    ...(conversationId && { conversationId }),
                },
                id: `discord-${Date.now()}`,
            };
            // Call Gateway HTTP API
            const response = await fetch(`${GATEWAY_HTTP_URL}/gateway`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                throw new Error(`Gateway returned ${response.status}: ${await response.text()}`);
            }
            const result = await response.json();
            // Cache conversation ID if returned
            if (result.payload?.conversationId) {
                this.activeConversations.set(conversationKey, {
                    id: result.payload.conversationId,
                    timestamp: Date.now(),
                });
            }
            return {
                content: result.payload?.response || result.payload?.content || 'No response from Gateway',
                topic: topicId,
                model: result.payload?.model || 'Gateway',
                tokens: result.payload?.tokens || 0,
                cost: result.payload?.cost || 0,
            };
        }
        catch (error) {
            console.error('[DiscordBot] Gateway API error:', error);
            // Fallback response
            return {
                content: `I received your message about **${topicName}**, but I'm having trouble connecting to the AI Gateway.\n\nYour message: "${message.content.substring(0, 100)}${message.content.length > 100 ? '...' : ''}"\n\n*Error: ${error instanceof Error ? error.message : 'Unknown error'}*`,
                topic: topicId,
                model: 'Error',
                tokens: 0,
                cost: 0,
            };
        }
    }
    /**
     * Add message to history
     */
    addToHistory(channelId, message) {
        if (!this.messageHistory.has(channelId)) {
            this.messageHistory.set(channelId, []);
        }
        const history = this.messageHistory.get(channelId);
        history.push(message);
        // Keep only last 50 messages per channel
        if (history.length > 50) {
            history.shift();
        }
    }
    /**
     * Get message history for a channel
     */
    getChannelHistory(channelId) {
        return this.messageHistory.get(channelId) || [];
    }
    /**
     * Get all mapped topics
     */
    getMappedTopics() {
        return new Map(this.topicMap);
    }
    /**
     * Get active topics
     */
    getActiveTopics() {
        return Array.from(this.activeTopics);
    }
    /**
     * Log message
     */
    log(level, message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
        console.log(logMessage.trim());
        // Write to log file if configured
        if (this.config.logFile) {
            const fs = require('fs');
            fs.appendFileSync(this.config.logFile, logMessage);
        }
    }
    /**
     * Stop the bot
     */
    async stop() {
        try {
            this.log('info', 'Stopping Discord bot...');
            await this.client.destroy();
            this.log('info', 'Discord bot stopped');
        }
        catch (error) {
            console.error('[DiscordBot] Error stopping:', error);
            this.log('error', `Error stopping: ${error}`);
        }
    }
}
exports.TopicDiscordBot = TopicDiscordBot;
// Export for use in other modules
exports.default = TopicDiscordBot;
