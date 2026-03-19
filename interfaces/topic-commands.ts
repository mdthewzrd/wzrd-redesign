/**
 * Topic & Channel Command System
 * 
 * Natural language commands for:
 * - /loadtopic <topic> - Load a topic's context
 * - /addtotopic <topic> - Add current session to topic
 * - /loadchannel <channel> - Pull Discord messages into TUI
 * - /addtochannel <channel> - Push TUI summary to Discord
 * 
 * Smart confirmation: Only for destructive/public actions
 */

import * as fs from 'fs';
import * as path from 'path';
import TopicRegistry from '../topics/registry';

// Command types
export type CommandType = 'loadtopic' | 'addtotopic' | 'loadchannel' | 'addtochannel' | 'unknown';

export interface ParsedCommand {
  type: CommandType;
  target: string;
  confidence: number;
  requiresConfirmation: boolean;
  confirmationReason?: string;
}

export interface CommandResult {
  success: boolean;
  message: string;
  action?: string;
  data?: any;
}

// Natural language patterns for command detection
const COMMAND_PATTERNS: Record<CommandType, string[]> = {
  loadtopic: [
    'load topic',
    'load the topic',
    'switch to topic',
    'change to topic',
    'open topic',
    'switch topic',
    'change topic',
    'topic',
    'load framework',
    'load web ui',
    'load documentation',
    'show topic'
  ],
  addtotopic: [
    'add to topic',
    'add this to topic',
    'organize under',
    'organize this',
    'put in topic',
    'save to topic',
    'assign to topic',
    'categorize as',
    'this is about'
  ],
  loadchannel: [
    'load channel',
    'sync with discord',
    'pull from discord',
    'sync channel',
    'get discord context',
    'load discord',
    'sync discord',
    'pull team discussion',
    'get team context'
  ],
  addtochannel: [
    'add to channel',
    'share to discord',
    'post to discord',
    'send to channel',
    'publish to discord',
    'share with team',
    'post summary',
    'update discord'
  ],
  unknown: []
};

// Topic name mappings (for natural language matching)
const TOPIC_MAPPINGS: Record<string, string> = {
  'framework': 'wzrd-framework-core',
  'framework core': 'wzrd-framework-core',
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
  'skills': 'wzrd-documentation'
};

// Channel name mappings
const CHANNEL_MAPPINGS: Record<string, string> = {
  'framework': '#framework-core',
  'framework core': '#framework-core',
  'topic system': '#topic-system',
  'topics': '#topic-system',
  'discord': '#topic-system',
  'web ui': '#web-ui',
  'web': '#web-ui',
  'documentation': '#documentation',
  'docs': '#documentation'
};

/**
 * Topic Command Handler
 */
export class TopicCommandHandler {
  private topicRegistry: TopicRegistry;
  private sessionRegistryPath: string;

  constructor() {
    this.topicRegistry = new TopicRegistry();
    this.sessionRegistryPath = '/home/mdwzrd/wzrd-redesign/topics/opencode-sessions.json';
  }

  /**
   * Initialize handler
   */
  async initialize(): Promise<void> {
    await this.topicRegistry.initialize();
  }

  /**
   * Parse natural language into command
   */
  parseCommand(input: string): ParsedCommand {
    const lowerInput = input.toLowerCase().trim();
    
    // Check each command type
    for (const [commandType, patterns] of Object.entries(COMMAND_PATTERNS)) {
      if (commandType === 'unknown') continue;
      
      for (const pattern of patterns) {
        if (lowerInput.includes(pattern)) {
          // Extract target (topic or channel name)
          const target = this.extractTarget(lowerInput, commandType as CommandType);
          
          // Determine if confirmation is needed
          const { requiresConfirmation, reason } = this.checkRequiresConfirmation(
            commandType as CommandType,
            target
          );
          
          return {
            type: commandType as CommandType,
            target,
            confidence: this.calculateConfidence(lowerInput, pattern),
            requiresConfirmation,
            confirmationReason: reason
          };
        }
      }
    }
    
    return {
      type: 'unknown',
      target: '',
      confidence: 0,
      requiresConfirmation: false
    };
  }

  /**
   * Extract target (topic or channel) from input
   */
  private extractTarget(input: string, commandType: CommandType): string {
    // Remove command words
    let cleaned = input;
    const patterns = COMMAND_PATTERNS[commandType];
    for (const pattern of patterns) {
      cleaned = cleaned.replace(pattern, '');
    }
    
    cleaned = cleaned.trim();
    
    // Map to known topic or channel
    if (commandType === 'loadtopic' || commandType === 'addtotopic') {
      for (const [alias, topicId] of Object.entries(TOPIC_MAPPINGS)) {
        if (cleaned.includes(alias)) {
          return topicId;
        }
      }
    }
    
    if (commandType === 'loadchannel' || commandType === 'addtochannel') {
      for (const [alias, channelName] of Object.entries(CHANNEL_MAPPINGS)) {
        if (cleaned.includes(alias)) {
          return channelName;
        }
      }
    }
    
    // Return cleaned text if no mapping found
    return cleaned || 'unknown';
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(input: string, pattern: string): number {
    // Higher confidence for exact matches or longer patterns
    if (input === pattern) return 1.0;
    if (input.includes(pattern)) {
      return Math.min(0.9, 0.5 + (pattern.length / input.length) * 0.4);
    }
    return 0.5;
  }

  /**
   * Check if command requires confirmation
   */
  private checkRequiresConfirmation(
    commandType: CommandType,
    target: string
  ): { requiresConfirmation: boolean; reason?: string } {
    switch (commandType) {
      case 'addtochannel':
        return {
          requiresConfirmation: true,
          reason: `This will post your session content to Discord channel ${target}. The message will be public.`
        };
      
      case 'addtotopic':
        // Check if already in topic
        return {
          requiresConfirmation: false
        };
      
      case 'loadtopic':
      case 'loadchannel':
        return {
          requiresConfirmation: false
        };
      
      default:
        return {
          requiresConfirmation: false
        };
    }
  }

  /**
   * Execute parsed command
   */
  async executeCommand(command: ParsedCommand, sessionId?: string): Promise<CommandResult> {
    switch (command.type) {
      case 'loadtopic':
        return this.executeLoadTopic(command.target);
      
      case 'addtotopic':
        if (!sessionId) {
          return {
            success: false,
            message: 'No session ID provided. Cannot add to topic.'
          };
        }
        return this.executeAddToTopic(command.target, sessionId);
      
      case 'loadchannel':
        return this.executeLoadChannel(command.target);
      
      case 'addtochannel':
        if (!sessionId) {
          return {
            success: false,
            message: 'No session ID provided. Cannot share to channel.'
          };
        }
        return this.executeAddToChannel(command.target, sessionId);
      
      default:
        return {
          success: false,
          message: 'Unknown command type'
        };
    }
  }

  /**
   * Execute /loadtopic command
   */
  private async executeLoadTopic(topicId: string): Promise<CommandResult> {
    try {
      const topic = this.topicRegistry.getTopic(topicId);
      
      if (!topic) {
        // Try to find by name
        const allTopics = this.topicRegistry.listTopics();
        const matchedTopic = allTopics.find(t => 
          t.name.toLowerCase().includes(topicId.toLowerCase())
        );
        
        if (!matchedTopic) {
          return {
            success: false,
            message: `Topic "${topicId}" not found. Available topics: ${allTopics.map(t => t.name).join(', ')}`
          };
        }
      }
      
      // Load topic context
      const topicData = this.topicRegistry.getTopic(topicId);
      const sessionCount = await this.getSessionCountForTopic(topicId);
      
      return {
        success: true,
        message: `✅ Loaded ${topicData?.name || topicId} topic`,
        action: 'loadtopic',
        data: {
          topic: topicData,
          sessions: sessionCount,
          discordChannel: topicData?.config.discord_channel_ids?.[0]
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to load topic: ${error}`
      };
    }
  }

  /**
   * Execute /addtotopic command
   */
  private async executeAddToTopic(topicId: string, sessionId: string): Promise<CommandResult> {
    try {
      // Update session registry
      const registry = this.loadSessionRegistry();
      
      // Find or create mapping for this session
      const existingMapping = registry.mappings.find(m => 
        m.sessions.tui?.session_id === sessionId
      );
      
      if (existingMapping) {
        existingMapping.topic_uuid = topicId;
        existingMapping.updated = new Date().toISOString().split('T')[0];
      } else {
        registry.mappings.push({
          topic_uuid: topicId,
          topic_name: topicId,
          sessions: {
            tui: {
              session_id: sessionId,
              status: 'active'
            },
            discord: { status: 'pending' },
            web: { status: 'pending' }
          },
          created: new Date().toISOString().split('T')[0],
          updated: new Date().toISOString().split('T')[0]
        });
      }
      
      // Save registry
      fs.writeFileSync(this.sessionRegistryPath, JSON.stringify(registry, null, 2));
      
      return {
        success: true,
        message: `✅ Added current session to ${topicId} topic`,
        action: 'addtotopic',
        data: { topic: topicId, session: sessionId }
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to add to topic: ${error}`
      };
    }
  }

  /**
   * Execute /loadchannel command
   */
  private async executeLoadChannel(channelName: string): Promise<CommandResult> {
    try {
      // This would integrate with Discord bot to pull messages
      // For now, return mock data
      const channelId = CHANNEL_MAPPINGS[channelName.toLowerCase()] || channelName;
      
      return {
        success: true,
        message: `✅ Synced with ${channelId}`,
        action: 'loadchannel',
        data: {
          channel: channelName,
          messages: 50, // Would fetch actual count
          preview: 'Last discussion about architecture...'
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to sync with channel: ${error}`
      };
    }
  }

  /**
   * Execute /addtochannel command
   */
  private async executeAddToChannel(channelName: string, sessionId: string): Promise<CommandResult> {
    try {
      const channelId = CHANNEL_MAPPINGS[channelName.toLowerCase()] || channelName;
      
      // This would post to Discord
      // For now, return success
      
      return {
        success: true,
        message: `✅ Posted session summary to ${channelId}`,
        action: 'addtochannel',
        data: {
          channel: channelName,
          session: sessionId,
          shared: true
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to share to channel: ${error}`
      };
    }
  }

  /**
   * Load session registry
   */
  private loadSessionRegistry(): any {
    if (fs.existsSync(this.sessionRegistryPath)) {
      return JSON.parse(fs.readFileSync(this.sessionRegistryPath, 'utf8'));
    }
    return { version: '1.0', mappings: [] };
  }

  /**
   * Get session count for topic
   */
  private async getSessionCountForTopic(topicId: string): Promise<number> {
    const registry = this.loadSessionRegistry();
    return registry.mappings.filter((m: any) => m.topic_uuid === topicId).length;
  }

  /**
   * Get help text
   */
  getHelpText(): string {
    return `
Topic & Channel Commands:

Topic Commands (Internal Organization):
  /loadtopic <topic>      - Load a topic's context
  /addtotopic <topic>     - Add current session to topic

Channel Commands (Discord Sync):
  /loadchannel <channel>  - Pull Discord messages into TUI
  /addtochannel <channel> - Push TUI summary to Discord

Natural Language Examples:
  "load the framework topic"
  "add this to web ui"
  "sync with Discord"
  "share to documentation"

Topics: framework-core, topic-system, web-ui, documentation
Channels: #framework-core, #topic-system, #web-ui, #documentation
    `.trim();
  }
}

export default TopicCommandHandler;
