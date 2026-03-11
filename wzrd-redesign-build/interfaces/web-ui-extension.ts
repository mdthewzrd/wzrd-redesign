/**
 * Web UI Extension for Topic-Based OpenCode Interface
 * 
 * Extends the existing web-ui-react with:
 * 1. Topics page for topic management
 * 2. Discord bot control panel
 * 3. Interface sync visualization
 * 4. Real-time topic updates
 */

import { atom } from 'jotai';
import { InterfaceSyncManager } from './sync-manager';
import TopicRegistry from '../topics/registry';

// Types for Web UI
export interface TopicView {
  id: string;
  name: string;
  description: string;
  progress: any;
  discordChannel?: string;
  isActive: boolean;
  lastUpdate: string;
  messageCount: number;
  interfaceCount: number;
}

export interface DiscordStatus {
  isConnected: boolean;
  botName?: string;
  channels: number;
  activeTopics: number;
  uptime: number;
  lastActivity: string;
}

export interface InterfaceSyncStatus {
  discord: boolean;
  web: boolean;
  cli: boolean;
  lastSync: string;
  syncCount: number;
}

// Atoms for state management
export const topicsAtom = atom<TopicView[]>([]);
export const discordStatusAtom = atom<DiscordStatus>({
  isConnected: false,
  channels: 0,
  activeTopics: 0,
  uptime: 0,
  lastActivity: new Date().toISOString(),
});
export const interfaceSyncAtom = atom<InterfaceSyncStatus>({
  discord: false,
  web: true,
  cli: false,
  lastSync: new Date().toISOString(),
  syncCount: 0,
});
export const activeTopicAtom = atom<string | null>(null);

/**
 * Web UI Extension Manager
 */
export class WebUIExtension {
  private topicRegistry: TopicRegistry;
  private syncManager: InterfaceSyncManager;
  private discordWebSocket: WebSocket | null = null;

  constructor() {
    this.topicRegistry = new TopicRegistry();
    this.syncManager = new InterfaceSyncManager();
  }

  /**
   * Initialize Web UI extension
   */
  async initialize(): Promise<void> {
    console.log('[WebUIExtension] Initializing...');
    
    // Initialize topic registry
    await this.topicRegistry.initialize();
    
    // Connect to Discord WebSocket (mock for now)
    this.connectToDiscordWebSocket();
    
    // Start sync monitoring
    this.startSyncMonitoring();
    
    console.log('[WebUIExtension] Initialized successfully');
  }

  /**
   * Connect to Discord WebSocket
   */
  private connectToDiscordWebSocket(): void {
    const wsUrl = 'ws://localhost:8765'; // Discord bot mock WebSocket
    
    try {
      this.discordWebSocket = new WebSocket(wsUrl);
      
      this.discordWebSocket.onopen = () => {
        console.log('[WebUIExtension] Connected to Discord WebSocket');
        
        // Request initial status
        this.discordWebSocket?.send(JSON.stringify({
          type: 'command',
          data: { command: 'status' },
        }));
      };
      
      this.discordWebSocket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        this.handleDiscordMessage(message);
      };
      
      this.discordWebSocket.onclose = () => {
        console.log('[WebUIExtension] Discord WebSocket disconnected');
        this.discordWebSocket = null;
        
        // Attempt reconnect after 5 seconds
        setTimeout(() => this.connectToDiscordWebSocket(), 5000);
      };
      
      this.discordWebSocket.onerror = (error) => {
        console.error('[WebUIExtension] Discord WebSocket error:', error);
      };
      
    } catch (error) {
      console.error('[WebUIExtension] Failed to connect to Discord WebSocket:', error);
    }
  }

  /**
   * Handle Discord WebSocket messages
   */
  private handleDiscordMessage(message: any): void {
    const { type, data } = message;
    
    switch (type) {
      case 'command_response':
        // Update Discord status
        this.updateDiscordStatus(data);
        break;
        
      case 'response':
        // Handle incoming message response
        this.handleIncomingResponse(data);
        break;
        
      case 'system':
        console.log('[WebUIExtension] Discord system message:', data.message);
        break;
        
      default:
        console.log('[WebUIExtension] Unknown Discord message type:', type);
    }
  }

  /**
   * Update Discord status from response
   */
  private updateDiscordStatus(data: any): void {
    // Update atom with new status
    // This would integrate with your existing state management
    console.log('[WebUIExtension] Updated Discord status:', data);
  }

  /**
   * Handle incoming Discord response
   */
  private handleIncomingResponse(data: any): void {
    // Sync to other interfaces via sync manager
    this.syncManager.syncMessage({
        id: Date.now().toString(),
      content: 'Message from Discord',
      response: data.content,
      topic: data.topic || 'general',
      interface: 'discord',
      userId: 'discord_user',
      channelId: 'discord_channel',
      timestamp: Date.now(),
    });
    
    // Update topic progress
    if (data.topic) {
      this.topicRegistry.updateTopicProgress(data.topic, {
        last_update: new Date().toISOString(),
        discord_message_count: 1,
      });
    }
  }

  /**
   * Start sync monitoring
   */
  private startSyncMonitoring(): void {
    // Poll for sync status every 10 seconds
    setInterval(() => {
      this.updateInterfaceSyncStatus();
    }, 10000);
    
    // Initial update
    this.updateInterfaceSyncStatus();
  }

  /**
   * Update interface sync status
   */
  private async updateInterfaceSyncStatus(): Promise<void> {
    const syncStatus = this.syncManager.getSyncStatus();
    
    // Update atom with sync status
    console.log('[WebUIExtension] Updated sync status:', syncStatus);
  }

  /**
   * Get all topics for Web UI
   */
  async getTopics(): Promise<TopicView[]> {
    const topics = this.topicRegistry.listTopics();
    
    return topics.map(topic => ({
      id: topic.id,
      name: topic.config.name,
      description: topic.config.description || 'No description',
      progress: topic.progress || {},
      discordChannel: topic.config.discord_channel_id,
      isActive: false, // Would check against active topics
      lastUpdate: topic.progress?.last_update || new Date().toISOString(),
      messageCount: 0, // Would count messages
      interfaceCount: this.getTopicInterfaceCount(topic.id),
    }));
  }

  /**
   * Get single topic
   */
  async getTopic(topicId: string): Promise<TopicView | null> {
    const topic = this.topicRegistry.getTopicByName(topicId);
    if (!topic) return null;
    
    return {
      id: topic.id,
      name: topic.config.name,
      description: topic.config.description || 'No description',
      progress: topic.progress || {},
      discordChannel: topic.config.discord_channel_id,
      isActive: false,
      lastUpdate: topic.progress?.last_update || new Date().toISOString(),
      messageCount: 0,
      interfaceCount: this.getTopicInterfaceCount(topic.id),
    };
  }

  /**
   * Create new topic from Web UI
   */
  async createTopic(name: string, description?: string): Promise<TopicView> {
    const topic = this.topicRegistry.createTopic(name, {
      description,
      created_from: 'web_ui',
    });
    
    // Sync to other interfaces
    this.syncManager.syncTopicCreation(topic.id, topic.config.name, 'web-ui');
    
    return {
      id: topic.id,
      name: topic.config.name,
      description: topic.config.description || 'No description',
      progress: {},
      isActive: false,
      lastUpdate: new Date().toISOString(),
      messageCount: 0,
      interfaceCount: 1, // Web UI only initially
    };
  }

  /**
   * Map topic to Discord channel
   */
  async mapTopicToDiscord(topicId: string, discordChannelId: string): Promise<void> {
    // Update topic config
    const topic = this.topicRegistry.getTopicByName(topicId);
    if (!topic) throw new Error(`Topic not found: ${topicId}`);
    
    // Update topic config
    this.topicRegistry.updateTopicConfig(topicId, {
      discord_channel_id: discordChannelId,
    });
    
    // Send mapping to Discord bot via WebSocket
    if (this.discordWebSocket?.readyState === WebSocket.OPEN) {
      this.discordWebSocket.send(JSON.stringify({
        type: 'command',
        data: {
          command: 'map',
          topic: topicId,
          channel: discordChannelId,
        },
      }));
    }
    
    // Sync to other interfaces
    this.syncManager.syncTopicMapping(topicId, discordChannelId, "web-ui");
  }

  /**
   * Send message from Web UI to topic
   */
  async sendMessage(topicId: string, content: string): Promise<void> {
    const topic = this.topicRegistry.getTopicByName(topicId);
    if (!topic) throw new Error(`Topic not found: ${topicId}`);
    
    // Send to Discord if mapped
    if (topic.config.discord_channel_id && this.discordWebSocket?.readyState === WebSocket.OPEN) {
      this.discordWebSocket.send(JSON.stringify({
        type: 'message',
        data: {
          content,
          topic: topicId,
          channelId: topic.config.discord_channel_id,
          userId: 'web_ui_user',
          username: 'Web UI',
        },
      }));
    }
    
    // Sync to other interfaces
    this.syncManager.syncMessage({
        id: Date.now().toString(),
      content,
      response: '', // Would be populated by response
      topic: topicId,
      interface: 'web-ui',
      userId: 'web_ui_user',
      channelId: 'web_ui',
      timestamp: Date.now(),
    });
    
    // Update topic progress
    this.topicRegistry.updateTopicProgress(topicId, {
      last_update: new Date().toISOString(),
      web_message_count: 1,
    });
  }

  /**
   * Get interface count for topic
   */
  private getTopicInterfaceCount(topicId: string): number {
    const topic = this.topicRegistry.getTopicByName(topicId);
    if (!topic) return 0;
    
    let count = 1; // Always has Web UI
    
    if (topic.config.discord_channel_id) count++; // Discord
    // Add CLI if active
    
    return count;
  }

  /**
   * Get Discord status
   */
  async getDiscordStatus(): Promise<DiscordStatus> {
    if (this.discordWebSocket?.readyState === WebSocket.OPEN) {
      // Request fresh status
      this.discordWebSocket.send(JSON.stringify({
        type: 'command',
        data: { command: 'status' },
      }));
    }
    
    // Return current status (would be updated via WebSocket)
    return {
      isConnected: this.discordWebSocket?.readyState === WebSocket.OPEN,
      channels: 0, // Would count from Discord
      activeTopics: 0,
      uptime: Date.now() - (this.getStartTime() || Date.now()),
      lastActivity: new Date().toISOString(),
    };
  }

  /**
   * Get interface sync status
   */
  async getInterfaceSyncStatus(): Promise<InterfaceSyncStatus> {
    const status = this.syncManager.getSyncStatus();
    
    return {
      discord: status.discord_connected || false,
      web: true, // Web UI is always connected to itself
      cli: false, // Would check CLI status
      lastSync: String(status.last_sync || new Date().toISOString()),
      syncCount: status.total_syncs || 0,
    };
  }

  /**
   * Get start time for uptime calculation
   */
  private getStartTime(): number | null {
    // This would track when the system started
    return Date.now() - 3600000; // 1 hour ago for demo
  }

  /**
   * Cleanup on page unload
   */
  cleanup(): void {
    if (this.discordWebSocket) {
      this.discordWebSocket.close();
      this.discordWebSocket = null;
    }
    
    console.log('[WebUIExtension] Cleaned up');
  }
}

// Export singleton instance
export const webUIExtension = new WebUIExtension();

// Export React hook for convenience
export function useWebUIExtension() {
  return {
    initialize: webUIExtension.initialize.bind(webUIExtension),
    getTopics: webUIExtension.getTopics.bind(webUIExtension),
    createTopic: webUIExtension.createTopic.bind(webUIExtension),
    sendMessage: webUIExtension.sendMessage.bind(webUIExtension),
    getDiscordStatus: webUIExtension.getDiscordStatus.bind(webUIExtension),
    getInterfaceSyncStatus: webUIExtension.getInterfaceSyncStatus.bind(webUIExtension),
    mapTopicToDiscord: webUIExtension.mapTopicToDiscord.bind(webUIExtension),
    cleanup: webUIExtension.cleanup.bind(webUIExtension),
  };
}

// Export for use in React components
export default webUIExtension;