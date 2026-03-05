#!/usr/bin/env node
"use strict";
/**
 * CLI Wrapper for Topic-Based WZRD Operations
 *
 * Extends OpenCode CLI with:
 * 1. --topic parameter for all commands
 * 2. Interface synchronization
 * 3. Discord bot control
 * 4. Topic management
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cliWrapper = exports.CLIWrapper = void 0;
exports.main = main;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const registry_1 = __importDefault(require("../topics/registry"));
const sync_manager_1 = require("./sync-manager");
const key_manager_1 = require("./key-manager");
/**
 * CLI Wrapper for Topic-Based Operations
 */
class CLIWrapper {
    constructor(logFile) {
        this.activeTopics = new Set();
        this.topicRegistry = new registry_1.default();
        this.syncManager = new sync_manager_1.InterfaceSyncManager();
        this.logFile = logFile || '/home/mdwzrd/wzrd-redesign/logs/cli.log';
        // Ensure log directory exists
        const logDir = path.dirname(this.logFile);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
    }
    /**
     * Initialize CLI wrapper
     */
    async initialize() {
        console.log('[CLIWrapper] Initializing...');
        // Initialize topic registry
        await this.topicRegistry.initialize();
        // Initialize key manager
        console.log(`[CLIWrapper] Using API key: ${key_manager_1.keyManager.getCurrentKeyType()}`);
        console.log('[CLIWrapper] Initialized successfully');
    }
    /**
     * Parse command line arguments
     */
    parseArgs(args) {
        const options = {
            command: '',
            args: [],
            interactive: false
        };
        let parsingTopic = false;
        let currentTopic = null;
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            if (arg === '--topic') {
                parsingTopic = true;
                continue;
            }
            if (parsingTopic) {
                currentTopic = arg;
                parsingTopic = false;
                continue;
            }
            if (arg === '--interactive' || arg === '-i') {
                options.interactive = true;
                continue;
            }
            if (arg === '--log-file') {
                options.logFile = args[++i];
                continue;
            }
            if (!options.command) {
                options.command = arg;
            }
            else {
                options.args.push(arg);
            }
        }
        if (currentTopic) {
            options.topic = currentTopic;
        }
        return options;
    }
    /**
     * Execute command with topic context
     */
    async execute(options) {
        const startTime = Date.now();
        const timestamp = startTime;
        const topic = options.topic || 'general';
        // Track active topic
        this.activeTopics.add(topic);
        // Update topic progress
        this.topicRegistry.updateTopicProgress(topic, {
            last_update: new Date().toISOString(),
            cli_commands: (this.getTopicProgress(topic)?.cli_commands || 0) + 1,
        });
        // Log command execution
        this.log('info', `Executing command: ${options.command} ${options.args.join(' ')} in topic: ${topic}`);
        let result;
        try {
            // Handle special WZRD commands
            if (options.command === 'wzrd' || options.command.startsWith('wzrd-')) {
                result = await this.executeWZRDCommand(options);
            }
            else if (options.command === 'opencode') {
                result = await this.executeOpenCodeCommand(options);
            }
            else if (options.command === 'topic') {
                result = await this.executeTopicCommand(options);
            }
            else if (options.command === 'discord') {
                result = await this.executeDiscordCommand(options);
            }
            else if (options.command === 'status') {
                result = await this.executeStatusCommand(options);
            }
            else {
                // Execute as generic shell command
                result = await this.executeShellCommand(options);
            }
            // Add topic context
            result.topic = topic;
            result.interface = 'cli';
            result.timestamp = timestamp;
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            result = {
                success: false,
                output: '',
                error: errorMsg,
                topic,
                interface: 'cli',
                timestamp,
            };
            this.log('error', `Command failed: ${errorMsg}`);
        }
        // Sync to other interfaces
        await this.syncManager.syncCommand(options.command, options.args, topic, result.success, result.output, Date.now(), 'cli');
        // Record API usage if applicable
        if (options.command.includes('opencode') || options.command.includes('wzrd')) {
            (0, key_manager_1.recordTokenUsage)(5); // Estimate 5 tokens for CLI command
        }
        const duration = Date.now() - startTime;
        this.log('info', `Command completed in ${duration}ms: ${result.success ? 'SUCCESS' : 'FAILED'}`);
        return result;
    }
    /**
     * Execute WZRD-specific command
     */
    async executeWZRDCommand(options) {
        const { command, args, topic = 'general' } = options;
        // Map to actual WZRD commands
        let actualCommand = command;
        let actualArgs = [...args];
        if (command === 'wzrd') {
            if (args.length === 0) {
                return this.showWZRDHelp();
            }
            // Handle wzrd subcommands
            const subcommand = args[0];
            switch (subcommand) {
                case 'topics':
                    return this.handleTopicsCommand(args.slice(1), topic);
                case 'discord':
                    return this.handleDiscordControl(args.slice(1));
                case 'sync':
                    return this.handleSyncCommand(args.slice(1));
                case 'status':
                    return this.handleSystemStatus();
                case 'cost':
                    return this.handleCostCommand();
                default:
                    // Pass through to actual wzrd command
                    actualCommand = 'wzrd';
            }
        }
        // Execute actual command
        return await this.executeShellCommand({
            ...options,
            command: actualCommand,
            args: actualArgs,
        });
    }
    /**
     * Execute OpenCode command
     */
    async executeOpenCodeCommand(options) {
        const { args, topic = 'general' } = options;
        // Add topic context to OpenCode environment
        const env = {
            ...process.env,
            OPENCODE_TOPIC: topic,
            OPENCODE_API_KEY: (0, key_manager_1.getAPIKey)(),
        };
        // Execute OpenCode with modified environment
        return await this.executeShellCommand({
            ...options,
            command: 'opencode',
            env,
        });
    }
    /**
     * Execute topic command
     */
    async executeTopicCommand(options) {
        const { args } = options;
        if (args.length === 0) {
            return this.showTopicHelp();
        }
        const subcommand = args[0];
        switch (subcommand) {
            case 'list':
                return this.listTopics();
            case 'create':
                if (args.length < 2) {
                    return {
                        success: false,
                        output: 'Usage: topic create <name> [description]',
                        interface: 'cli',
                        timestamp: Date.now(),
                    };
                }
                return this.createTopic(args[1], args.slice(2).join(' '));
            case 'info':
                if (args.length < 2) {
                    return {
                        success: false,
                        output: 'Usage: topic info <name>',
                        interface: 'cli',
                        timestamp: Date.now(),
                    };
                }
                return this.getTopicInfo(args[1]);
            case 'switch':
                if (args.length < 2) {
                    return {
                        success: false,
                        output: 'Usage: topic switch <name>',
                        interface: 'cli',
                        timestamp: Date.now(),
                    };
                }
                return this.switchTopic(args[1]);
            default:
                return {
                    success: false,
                    output: `Unknown topic command: ${subcommand}`,
                    interface: 'cli',
                    timestamp: Date.now(),
                };
        }
    }
    /**
     * Execute Discord command
     */
    async executeDiscordCommand(options) {
        const { args } = options;
        if (args.length === 0) {
            return {
                success: false,
                output: 'Discord bot control commands:\n  start - Start Discord bot\n  stop - Stop Discord bot\n  status - Check bot status\n  map <topic> <channel> - Map topic to Discord channel',
                interface: 'cli',
                timestamp: Date.now(),
            };
        }
        const subcommand = args[0];
        switch (subcommand) {
            case 'start':
                return this.startDiscordBot();
            case 'stop':
                return this.stopDiscordBot();
            case 'status':
                return this.getDiscordStatus();
            case 'map':
                if (args.length < 3) {
                    return {
                        success: false,
                        output: 'Usage: discord map <topic> <channel-id>',
                        interface: 'cli',
                        timestamp: Date.now(),
                    };
                }
                return this.mapTopicToDiscord(args[1], args[2]);
            default:
                return {
                    success: false,
                    output: `Unknown Discord command: ${subcommand}`,
                    interface: 'cli',
                    timestamp: Date.now(),
                };
        }
    }
    /**
     * Execute status command
     */
    async executeStatusCommand(options) {
        const status = await this.getSystemStatus();
        return {
            success: true,
            output: status,
            interface: 'cli',
            timestamp: Date.now(),
        };
    }
    /**
     * Execute shell command
     */
    executeShellCommand(options) {
        return new Promise((resolve) => {
            const { command, args, env = process.env, cwd = process.cwd(), interactive = false } = options;
            let output = '';
            let error = '';
            const child = (0, child_process_1.spawn)(command, args, {
                env,
                cwd,
                stdio: interactive ? 'inherit' : ['pipe', 'pipe', 'pipe'],
                shell: true,
            });
            if (!interactive) {
                child.stdout?.on('data', (data) => {
                    output += data.toString();
                });
                child.stderr?.on('data', (data) => {
                    error += data.toString();
                });
            }
            child.on('close', (code) => {
                resolve({
                    success: code === 0,
                    output: output.trim(),
                    error: error.trim(),
                    interface: 'cli',
                    timestamp: Date.now(),
                });
            });
            child.on('error', (err) => {
                resolve({
                    success: false,
                    output: '',
                    error: err.message,
                    interface: 'cli',
                    timestamp: Date.now(),
                });
            });
        });
    }
    /**
     * Show WZRD help
     */
    showWZRDHelp() {
        const help = `
WZRD CLI - Topic-Aware Command Wrapper

Usage:
  wzrd [command] [args...] [--topic <topic-name>]

Commands:
  topics      - Manage topics
  discord     - Control Discord bot
  sync        - Interface synchronization
  status      - System status
  cost        - API cost tracking

Topic Commands:
  topic list                    - List all topics
  topic create <name> [desc]    - Create new topic
  topic info <name>             - Get topic information
  topic switch <name>           - Switch to topic

Discord Commands:
  discord start                 - Start Discord bot
  discord stop                  - Stop Discord bot
  discord status                - Check bot status
  discord map <topic> <channel> - Map topic to Discord channel

Examples:
  wzrd --topic "web-ui" opencode "fix bug in navbar"
  wzrd topics list
  topic create "api-integration" "API integration project"
  discord map "api-integration" "123456789012345678"
`;
        return {
            success: true,
            output: help.trim(),
            interface: 'cli',
            timestamp: Date.now(),
        };
    }
    /**
     * Handle topics command
     */
    async handleTopicsCommand(args, currentTopic) {
        if (args.length === 0) {
            return await this.listTopics();
        }
        const subcommand = args[0];
        switch (subcommand) {
            case 'list':
                return await this.listTopics();
            case 'create':
                if (args.length < 2) {
                    return {
                        success: false,
                        output: 'Usage: wzrd topics create <name> [description]',
                        interface: 'cli',
                        timestamp: Date.now(),
                    };
                }
                return await this.createTopic(args[1], args.slice(2).join(' '));
            case 'active':
                return {
                    success: true,
                    output: `Active topics: ${Array.from(this.activeTopics).join(', ')}\nCurrent topic: ${currentTopic}`,
                    interface: 'cli',
                    timestamp: Date.now(),
                };
            default:
                return {
                    success: false,
                    output: `Unknown topics subcommand: ${subcommand}`,
                    interface: 'cli',
                    timestamp: Date.now(),
                };
        }
    }
    /**
     * Handle Discord control
     */
    async handleDiscordControl(args) {
        if (args.length === 0) {
            return await this.getDiscordStatus();
        }
        const subcommand = args[0];
        switch (subcommand) {
            case 'start':
                return await this.startDiscordBot();
            case 'stop':
                return await this.stopDiscordBot();
            case 'status':
                return await this.getDiscordStatus();
            default:
                return {
                    success: false,
                    output: `Unknown Discord subcommand: ${subcommand}`,
                    interface: 'cli',
                    timestamp: Date.now(),
                };
        }
    }
    /**
     * Handle sync command
     */
    async handleSyncCommand(args) {
        const syncStatus = this.syncManager.getSyncStatus();
        const output = `
Interface Synchronization Status:
  Discord: ${syncStatus.discord_connected ? 'Connected' : 'Disconnected'}
  Web UI: ${syncStatus.web_connected ? 'Connected' : 'Disconnected'}
  CLI: ${syncStatus.cli_connected ? 'Connected' : 'Disconnected'}
  
Last Sync: ${syncStatus.last_sync || 'Never'}
Total Syncs: ${syncStatus.total_syncs || 0}
  
Active Topics: ${Array.from(this.activeTopics).join(', ')}
`;
        return {
            success: true,
            output: output.trim(),
            interface: 'cli',
            timestamp: Date.now(),
        };
    }
    /**
     * Process regular messages
     */
    async processMessage(message) {
        console.log(`\n[CLI] Processing message: "${message.content}"`);
        console.log(`[CLI] Message length: ${message.content.length}`);
        console.log(`[CLI] Timestamp: ${new Date().toISOString()}`);
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
            console.log(`[CLI] No topic mapping found for channel ${channelId}`);
            await this.promptTopicCreation(message);
            return;
        }
        // Get topic
        const topic = this.topicRegistry.getTopicByName(topicId);
        if (!topic) {
            console.warn(`[CLI] Topic not found: ${topicId}`);
            return;
        }
        // Track active topic
        this.activeTopics.add(topicId);
        console.log(`[CLI] Active topic: ${topic.config.name}`);
        // Process with topic context
        console.log(`[CLI] Processing message in topic: ${topic.config.name}`);
        console.log(`[CLI] Topic ID: ${topic.id}`);
        // Create response
        const response = await this.createResponse(discordMessage, topic.id);
        console.log(`[CLI] Response created: ${response.content.substring(0, 100)}...`);
        console.log(`[CLI] Response cost: ${response.cost}, tokens: ${response.tokens}`);
        // Send response with delay
        if (this.config.responseDelay && this.config.responseDelay > 0) {
            await new Promise(resolve => setTimeout(resolve, this.config.responseDelay));
        }
        await message.reply(response.content);
        console.log(`[CLI] Response sent to Discord`);
        // Sync to other interfaces
        await this.syncManager.syncCommand(options.command, options.args, topic, result.success, result.output, Date.now(), 'cli');
    }
    /**
     * Handle cost command
     */
    async handleCostCommand() {
        const usage = (0, key_manager_1.getUsageStats)();
        const output = `
API Key Usage:
  Current Key: ${usage.current_key}
  
Main Key:
  Used Today: ${usage.main_key.used_today}/${usage.main_key.daily_limit}
  Percentage: ${usage.main_key.percentage}%
  Total Used: ${usage.main_key.total_used}
  Last Reset: ${usage.main_key.last_reset}
  
Backup Key:
  Used Today: ${usage.backup_key.used_today}/${usage.backup_key.daily_limit}
  Percentage: ${usage.backup_key.percentage}%
  Total Used: ${usage.backup_key.total_used}
  Last Reset: ${usage.backup_key.last_reset}
  
Auto-switch: ${key_manager_1.keyManager['config'].openrouter.auto_switch ? 'Enabled' : 'Disabled'}
Switch Threshold: ${key_manager_1.keyManager['config'].openrouter.switch_threshold}%
`;
        return {
            success: true,
            output: output.trim(),
            interface: 'cli',
            timestamp: Date.now(),
        };
    }
    /**
     * Show topic help
     */
    showTopicHelp() {
        const help = `
Topic Management Commands:

  topic list                    - List all topics
  topic create <name> [desc]    - Create new topic
  topic info <name>             - Get topic information
  topic switch <name>           - Switch to topic
  
  wzrd topics list              - Alternative syntax
  wzrd topics create <name>     - Alternative syntax
  wzrd topics active            - Show active topics
`;
        return {
            success: true,
            output: help.trim(),
            interface: 'cli',
            timestamp: Date.now(),
        };
    }
    /**
     * List all topics
     */
    async listTopics() {
        const topics = this.topicRegistry.listTopics();
        if (topics.length === 0) {
            return {
                success: true,
                output: 'No topics found. Use "topic create <name>" to create one.',
                interface: 'cli',
                timestamp: Date.now(),
            };
        }
        const output = topics.map(topic => {
            const isActive = this.activeTopics.has(topic.id) ? '[ACTIVE]' : '';
            const hasDiscord = topic.config.discord_channel_id ? '[DISCORD]' : '';
            return `${isActive} ${hasDiscord} ${topic.config.name} - ${topic.config.description || 'No description'}`;
        }).join('\n');
        return {
            success: true,
            output: `Topics (${topics.length}):\n${output}`,
            interface: 'cli',
            timestamp: Date.now(),
        };
    }
    /**
     * Create new topic
     */
    async createTopic(name, description) {
        const topic = this.topicRegistry.createTopic(name, { description });
        // Sync to other interfaces
        await this.syncManager.syncTopicCreation(topic.id, topic.config.name, 'cli');
        return {
            success: true,
            output: `Topic created: ${topic.config.name}\nID: ${topic.id}\nDescription: ${topic.config.description || 'None'}`,
            interface: 'cli',
            timestamp: Date.now(),
        };
    }
    /**
     * Get topic information
     */
    async getTopicInfo(topicName) {
        const topic = this.topicRegistry.getTopicByName(topicName);
        if (!topic) {
            return {
                success: false,
                output: `Topic not found: ${topicName}`,
                interface: 'cli',
                timestamp: Date.now(),
            };
        }
        const progress = this.getTopicProgress(topic.id);
        const output = `
Topic: ${topic.config.name}
ID: ${topic.id}
Description: ${topic.config.description || 'None'}
Created: ${topic.config.created_at || 'Unknown'}

Discord Channel: ${topic.config.discord_channel_id || 'Not mapped'}

Progress:
  Last Update: ${progress?.last_update || 'Never'}
  CLI Commands: ${progress?.cli_commands || 0}
  Discord Messages: ${progress?.discord_message_count || 0}
  Web Messages: ${progress?.web_message_count || 0}

Active: ${this.activeTopics.has(topic.id) ? 'Yes' : 'No'}
`;
        return {
            success: true,
            output: output.trim(),
            interface: 'cli',
            timestamp: Date.now(),
        };
    }
    /**
     * Switch to topic
     */
    async switchTopic(topicName) {
        const topic = this.topicRegistry.getTopicByName(topicName);
        if (!topic) {
            return {
                success: false,
                output: `Topic not found: ${topicName}`,
                interface: 'cli',
                timestamp: Date.now(),
            };
        }
        this.activeTopics.add(topic.id);
        return {
            success: true,
            output: `Switched to topic: ${topic.config.name}\nUse --topic "${topic.config.name}" with commands for context.`,
            interface: 'cli',
            timestamp: Date.now(),
        };
    }
    /**
     * Start Discord bot
     */
    async startDiscordBot() {
        // This would start the actual Discord bot
        // For now, return mock response
        return {
            success: true,
            output: 'Discord bot started in mock mode\nConnect to WebSocket at ws://localhost:8765',
            interface: 'cli',
            timestamp: Date.now(),
        };
    }
    /**
     * Stop Discord bot
     */
    async stopDiscordBot() {
        return {
            success: true,
            output: 'Discord bot stopped',
            interface: 'cli',
            timestamp: Date.now(),
        };
    }
    /**
     * Get Discord status
     */
    async getDiscordStatus() {
        const discordConfig = key_manager_1.keyManager.getDiscordCredentials();
        const hasToken = !!discordConfig.bot_token;
        const output = `
Discord Bot Status:
  Configured: ${hasToken ? 'Yes' : 'No'}
  Bot Token: ${hasToken ? 'Set' : 'Not set'}
  Client ID: ${discordConfig.client_id || 'Not set'}
  Guild ID: ${discordConfig.guild_id || 'Not set'}
  
WebSocket: ws://localhost:8765
Mock Mode: Active (use "discord set-token <token>" to use real Discord)
`;
        return {
            success: true,
            output: output.trim(),
            interface: 'cli',
            timestamp: Date.now(),
        };
    }
    /**
     * Map topic to Discord channel
     */
    async mapTopicToDiscord(topicName, channelId) {
        const topic = this.topicRegistry.getTopicByName(topicName);
        if (!topic) {
            return {
                success: false,
                output: `Topic not found: ${topicName}`,
                interface: 'cli',
                timestamp: Date.now(),
            };
        }
        // Update topic config
        this.topicRegistry.updateTopicConfig(topic.id, {
            discord_channel_id: channelId,
        });
        // Sync to other interfaces
        await this.syncManager.syncTopicMapping(topic.id, channelId, 'cli');
        return {
            success: true,
            output: `Topic "${topic.config.name}" mapped to Discord channel: ${channelId}`,
            interface: 'cli',
            timestamp: Date.now(),
        };
    }
    /**
     * Get system status
     */
    async getSystemStatus() {
        const topics = this.topicRegistry.listTopics();
        const activeTopics = Array.from(this.activeTopics);
        const syncStatus = this.syncManager.getSyncStatus();
        const usage = (0, key_manager_1.getUsageStats)();
        return `
WZRD System Status:
  
Topics:
  Total: ${topics.length}
  Active: ${activeTopics.length}
  
Interfaces:
  Discord: ${syncStatus.discord_connected ? 'Connected' : 'Disconnected'}
  Web UI: ${syncStatus.web_connected ? 'Connected' : 'Disconnected'}
  CLI: ${syncStatus.cli_connected ? 'Connected' : 'Disconnected'}
  
API Keys:
  Current: ${usage.current_key}
  Main Usage: ${usage.main_key.percentage}%
  Backup Usage: ${usage.backup_key.percentage}%
  
Sync:
  Last Sync: ${syncStatus.last_sync || 'Never'}
  Total Syncs: ${syncStatus.total_syncs || 0}
`.trim();
    }
    /**
     * Get system status as command result
     */
    async getSystemStatusCommand() {
        const status = await this.getSystemStatus();
        return {
            success: true,
            output: status,
            interface: 'cli',
            timestamp: Date.now(),
        };
    }
    /**
     * Get topic progress
     */
    getTopicProgress(topicId) {
        const topic = this.topicRegistry.getTopicByName(topicId);
        return topic?.progress || {};
    }
    /**
     * Log message
     */
    log(level, message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
        console.log(logMessage.trim());
        // Write to log file
        try {
            fs.appendFileSync(this.logFile, logMessage);
        }
        catch (error) {
            console.error('[CLIWrapper] Failed to write to log file:', error);
        }
    }
}
exports.CLIWrapper = CLIWrapper;
// Export singleton instance
exports.cliWrapper = new CLIWrapper();
// Export main function for CLI usage
async function main() {
    console.log('\n=== WZRD CLI STARTING ===');
    console.log(`[${new Date().toISOString()}] Starting WZRD CLI Wrapper`);
    const wrapper = new CLIWrapper();
    console.log('[CLI] CLIWrapper instance created');
    await wrapper.initialize();
    console.log('[CLI] WZRD Wrapper initialized successfully');
    const args = process.argv.slice(2);
    console.log(`[CLI] Args received: ${JSON.stringify(args)}`);
    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
        console.log('[CLI] Showing help');
        const helpResult = wrapper.showWZRDHelp();
        console.log(helpResult.output);
        process.exit(helpResult.success ? 0 : 1);
    }
    console.log(`[CLI] Executing command: ${args.join(' ')}`);
    const options = wrapper.parseArgs(args);
    console.log(`[CLI] Parsed options: topic=${options.topic}, command=${options.command}, args=${JSON.stringify(options.args)}`);
    const result = await wrapper.execute(options);
    console.log(`[CLI] Command result: success=${result.success}`);
    if (result.output) {
        console.log(result.output);
    }
    if (result.error) {
        console.error(result.error);
    }
    process.exit(result.success ? 0 : 1);
}
// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('[CLI] Fatal error:', error);
        process.exit(1);
    });
}
