#!/usr/bin/env node
/**
 * CLI Wrapper for Topic-Based Command Line Interface
 * 
 * Extends OpenCode CLI with:
 * 1. --topic parameter for all commands
 * 2. Interface synchronization
 * 3. Discord bot control
 * 4. Topic management
 */

// Import types for Discord integration
import { Message as DiscordMessage } from 'discord.js';

import * as fs from 'fs';
import * as path from 'path';
import { spawn, execSync } from 'child_process';
import TopicRegistry from '../topics/registry';
import { InterfaceSyncManager } from './sync-manager';
import { KeyManager, keyManager, getAPIKey, recordTokenUsage, getUsageStats } from './key-manager';
import TopicCommandHandler, { ParsedCommand } from './topic-commands';

// Interface for CLI commands
interface CLIOptions {
  topic?: string;
  command: string;
  args: string[];
  env?: NodeJS.ProcessEnv;
  cwd?: string;
  interactive?: boolean;
  logFile?: string;
}

interface CommandResult {
  success: boolean;
  output: string;
  error?: string;
  topic?: string;
  interface: 'cli';
  timestamp: number;
}

/**
 * CLI Wrapper for Topic-Based Operations
 */
export class CLIWrapper {
  private topicRegistry: TopicRegistry;
  private syncManager: InterfaceSyncManager;
  private topicCommandHandler: TopicCommandHandler;
  private logFile: string;
  private activeTopics: Set<string> = new Set();

  constructor(logFile?: string) {
    this.topicRegistry = new TopicRegistry();
    this.syncManager = new InterfaceSyncManager();
    this.topicCommandHandler = new TopicCommandHandler();
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
  async initialize(): Promise<void> {
    console.log('[CLIWrapper] Initializing...');
    
    // Initialize topic registry
    await this.topicRegistry.initialize();
    
    // Initialize key manager
    console.log(`[CLIWrapper] Using API key: ${keyManager.getCurrentKeyType()}`);
    
    console.log('[CLIWrapper] Initialized successfully');
  }

  /**
   * Parse command line arguments
   */
  parseArgs(args: string[]): CLIOptions {
    const options: CLIOptions = {
      command: '',
      args: [],
      interactive: false
    };

    let parsingTopic = false;
    let currentTopic: string | null = null;

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
      } else {
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
  async execute(options: CLIOptions): Promise<CommandResult> {
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

    let result: CommandResult;

    try {
      // Check for natural language topic/channel commands
      const naturalLanguageResult = await this.handleNaturalLanguageCommand(
        options.command + ' ' + options.args.join(' '),
        options.topic
      );
      if (naturalLanguageResult) {
        return naturalLanguageResult;
      }

      // Handle special WZRD commands
      if (options.command === 'wzrd' || options.command.startsWith('wzrd-')) {
        result = await this.executeWZRDCommand(options);
      } else if (options.command === 'opencode') {
        result = await this.executeOpenCodeCommand(options);
      } else if (options.command === 'topic') {
        result = await this.executeTopicCommand(options);
      } else if (options.command === 'discord') {
        result = await this.executeDiscordCommand(options);
      } else if (options.command === 'status') {
        result = await this.getSystemStatusCommand();
      } else {
        // Execute as generic shell command
        result = await this.executeShellCommand(options);
      }
      
      // Add topic context
      result.topic = topic;
      result.interface = 'cli';
      result.timestamp = timestamp;
      
    } catch (error) {
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
    await this.syncManager.syncCommand(
      options.command,
      options.args,
      topic,
      result.success,
      result.output,
      Date.now(),
      'cli'
    );
    
    // Record API usage if applicable
    if (options.command.includes('opencode') || options.command.includes('wzrd')) {
      recordTokenUsage(5); // Estimate 5 tokens for CLI command
    }
    
    const duration = Date.now() - startTime;
    this.log('info', `Command completed in ${duration}ms: ${result.success ? 'SUCCESS' : 'FAILED'}`);
    
    return result;
  }

  /**
   * Execute WZRD-specific command
   */
  private async executeWZRDCommand(options: CLIOptions): Promise<CommandResult> {
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
          return await this.getSystemStatusCommand();
          
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
  private async executeOpenCodeCommand(options: CLIOptions): Promise<CommandResult> {
    const { args, topic = 'general' } = options;
    
    // Add topic context to OpenCode environment
    const env = {
      ...process.env,
      OPENCODE_TOPIC: topic,
      OPENCODE_API_KEY: getAPIKey(),
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
  private async executeTopicCommand(options: CLIOptions): Promise<CommandResult> {
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
  private async executeDiscordCommand(options: CLIOptions): Promise<CommandResult> {
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
  private async executeStatusCommand(options: CLIOptions): Promise<CommandResult> {
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
  private executeShellCommand(options: CLIOptions): Promise<CommandResult> {
    return new Promise((resolve) => {
      const { command, args, env = process.env, cwd = process.cwd(), interactive = false } = options;
      
      let output = '';
      let error = '';
      
      const child = spawn(command, args, {
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
  public showWZRDHelp(): CommandResult {
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
  private async handleTopicsCommand(args: string[], currentTopic: string): Promise<CommandResult> {
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
  private async handleDiscordControl(args: string[]): Promise<CommandResult> {
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
  private async handleSyncCommand(args: string[]): Promise<CommandResult> {
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
  private async processMessage(message: DiscordMessage): Promise<void> {
    console.log(`\n[CLI] Processing message: "${message.content}"`);
    console.log(`[CLI] Message length: ${message.content.length}`);
    console.log(`[CLI] Timestamp: ${new Date().toISOString()}`);

    const channelId = message.channelId;
    const topicId = this.topicRegistry.getTopicByDiscordChannel(channelId);

    console.log(`[CLI] Topic ID for channel ${channelId}: ${topicId || 'Not mapped'}`);

    // If no topic mapping, skip message processing
    if (!topicId) {
      console.log(`[CLI] No topic mapping found for channel ${channelId}`);
      return;
    }

    // Get topic
    const topic = this.topicRegistry.getTopic(String(topicId));
    if (!topic) {
      console.warn(`[CLI] Topic not found: ${topicId}`);
      return;
    }

    // Track active topic
    this.activeTopics.add(String(topicId));
    console.log(`[CLI] Active topic: ${topic.config.name}`);

    // Process with topic context
    console.log(`[CLI] Processing message in topic: ${topic.config.name}`);

    // Sync to other interfaces
    await this.syncManager.syncMessage(
      {
        id: Date.now().toString(),
        content: message.content,
        response: '',
        topic: topic.config.name,
        interface: 'discord' as const,
        userId: message.author.id,
        channelId: message.channel.id,
        timestamp: Date.now(),
      }
    );

    console.log(`[CLI] Message processed successfully`);
  }

  /**
   * Handle cost command
   */
  private async handleCostCommand(): Promise<CommandResult> {
    const usage = getUsageStats();
    
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
  
Auto-switch: Configured in api-keys.json (currently disabled for security)
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
  private showTopicHelp(): CommandResult {
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
  private async listTopics(): Promise<CommandResult> {
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
  private async createTopic(name: string, description?: string): Promise<CommandResult> {
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
  private async getTopicInfo(topicName: string): Promise<CommandResult> {
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
  private async switchTopic(topicName: string): Promise<CommandResult> {
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
  private async startDiscordBot(): Promise<CommandResult> {
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
  private async stopDiscordBot(): Promise<CommandResult> {
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
  private async getDiscordStatus(): Promise<CommandResult> {
    const discordConfig = keyManager.getDiscordCredentials();
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
  private async mapTopicToDiscord(topicName: string, channelId: string): Promise<CommandResult> {
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
  private async getSystemStatus(): Promise<string> {
    const topics = this.topicRegistry.listTopics();
    const activeTopics = Array.from(this.activeTopics);
    const syncStatus = this.syncManager.getSyncStatus();
    const usage = getUsageStats();
    
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
  private async getSystemStatusCommand(): Promise<CommandResult> {
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
  private getTopicProgress(topicId: string): any {
    const topic = this.topicRegistry.getTopicByName(topicId);
    return topic?.progress || {};
  }

  /**
   * Log message
   */
  private log(level: 'info' | 'warn' | 'error', message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;

    console.log(logMessage.trim());

    // Write to log file
    try {
      fs.appendFileSync(this.logFile, logMessage);
    } catch (error) {
      console.error('[CLIWrapper] Failed to write to log file:', error);
    }
  }

  /**
   * Handle natural language topic/channel commands
   * Returns CommandResult if a command was handled, null otherwise
   */
  private async handleNaturalLanguageCommand(
    input: string,
    currentSessionId?: string
  ): Promise<CommandResult | null> {
    // Skip if input looks like a standard command
    if (input.startsWith('/') || input.startsWith('-') || input.startsWith('--')) {
      return null;
    }

    // Initialize command handler if needed
    await this.topicCommandHandler.initialize();

    // Parse the command
    const parsed = this.topicCommandHandler.parseCommand(input);

    if (parsed.type === 'unknown') {
      return null;
    }

    // Check if confirmation is needed
    if (parsed.requiresConfirmation) {
      return {
        success: true,
        output: `⚠️ ${parsed.confirmationReason}\n\nRun with --confirm to execute: /${parsed.type} ${parsed.target}`,
        topic: currentSessionId,
        interface: 'cli',
        timestamp: Date.now(),
      };
    }

    // Execute the command
    const result = await this.topicCommandHandler.executeCommand(parsed, currentSessionId);

    return {
      success: result.success,
      output: result.message,
      topic: currentSessionId,
      interface: 'cli',
      timestamp: Date.now(),
    };
  }
}

// Export singleton instance
export const cliWrapper = new CLIWrapper();

// Export main function for CLI usage
export async function main() {
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


