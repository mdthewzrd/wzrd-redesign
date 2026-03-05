/**
 * Remi Interface Monitor Dashboard
 * 
 * Provides monitoring and visualization for:
 * 1. Discord bot status
 * 2. Web UI connections
 * 3. CLI activity
 * 4. Topic synchronization
 * 5. API key usage
 * 6. System health
 */

import { InterfaceSyncManager } from './sync-manager';
import TopicRegistry from '../topics/registry';
import { KeyManager, getUsageStats } from './key-manager';
import TopicDiscordBot from './discord-bot';
import { WebUIExtension } from './web-ui-extension';
import { CLIWrapper } from './cli-wrapper';

export interface SystemStatus {
  timestamp: string;
  interfaces: {
    discord: boolean;
    web: boolean;
    cli: boolean;
  };
  topics: {
    total: number;
    active: number;
    with_discord: number;
  };
  api_keys: {
    current: string;
    main_usage: number;
    backup_usage: number;
    auto_switch: boolean;
  };
  sync: {
    last_sync: string;
    total_syncs: number;
    errors_last_hour: number;
    last_discord_activity: string;
  };
  system: {
    uptime: number;
    memory_usage: number;
    disk_usage: number;
  };
}

export interface InterfaceDetail {
  name: string;
  status: 'online' | 'offline' | 'degraded';
  last_activity: string;
  active_topics: string[];
  connection_details: Record<string, any>;
}

export interface TopicDetail {
  id: string;
  name: string;
  description: string;
  interfaces: string[];
  last_activity: string;
  message_counts: {
    cli: number;
    discord: number;
    web: number;
  };
  progress: any;
}

export class RemiMonitor {
  private syncManager: InterfaceSyncManager;
  private topicRegistry: TopicRegistry;
  private keyManager: KeyManager;
  private discordBot: TopicDiscordBot | null = null;
  private webUI: WebUIExtension | null = null;
  private cliWrapper: CLIWrapper | null = null;
  private startTime: Date;
  private activityLog: Array<{
    timestamp: string;
    interface: string;
    topic: string;
    action: string;
    details: any;
  }> = [];

  constructor() {
    this.syncManager = new InterfaceSyncManager();
    this.topicRegistry = new TopicRegistry();
    this.keyManager = new KeyManager();
    this.startTime = new Date();
    
    // Initialize systems
    this.initialize();
  }

  /**
   * Initialize monitor
   */
  private async initialize(): Promise<void> {
    console.log('[RemiMonitor] Initializing...');
    
    try {
      // Initialize topic registry
      await this.topicRegistry.initialize();
      
      // Initialize key manager
      console.log('[RemiMonitor] API Key:', this.keyManager.getCurrentKeyType());
      
      // Initialize Discord bot (mock mode)
      this.discordBot = new TopicDiscordBot({
        botToken: 'TEST_MODE',
        clientId: 'mock',
        guildId: 'mock',
      });
      
      // Initialize Web UI extension
      this.webUI = new WebUIExtension();
      await this.webUI.initialize();
      
      // Initialize CLI wrapper
      this.cliWrapper = new CLIWrapper();
      await this.cliWrapper.initialize();
      
      console.log('[RemiMonitor] Initialized successfully');
      
    } catch (error) {
      console.error('[RemiMonitor] Initialization failed:', error);
    }
  }

  /**
   * Get complete system status
   */
  async getSystemStatus(): Promise<SystemStatus> {
    const topics = this.topicRegistry.listTopics();
    const activeTopics = await this.getActiveTopics();
    
    const syncStatus = this.syncManager.getSyncStatus();
    const keyUsage = getUsageStats();
    
    // Get system metrics
    const systemMetrics = await this.getSystemMetrics();
    
    return {
      timestamp: new Date().toISOString(),
      interfaces: {
        discord: syncStatus.discord_connected || false,
        web: syncStatus.web_connected || false,
        cli: syncStatus.cli_connected || false,
      },
      topics: {
        total: topics.length,
        active: activeTopics.length,
        with_discord: topics.filter((t: any) => t.config.discord_channel_id).length,
      },
      api_keys: {
        current: keyUsage.current_key,
        main_usage: parseFloat(String(keyUsage.main_key.percentage)),
        backup_usage: parseFloat(String(keyUsage.backup_key.percentage)),
        auto_switch: this.keyManager['config'].openrouter.auto_switch,
      },
      sync: {
        last_sync: String(syncStatus.last_sync || 'Never'),
        total_syncs: syncStatus.total_syncs || 0,
        errors_last_hour: this.getErrorCountLastHour(),
        last_discord_activity: String(syncStatus.last_sync || 'Never'),
      },
      system: {
        uptime: Date.now() - this.startTime.getTime(),
        memory_usage: systemMetrics.memory_usage,
        disk_usage: systemMetrics.disk_usage,
      },
    };
  }

  /**
   * Get interface details
   */
  async getInterfaceDetails(): Promise<InterfaceDetail[]> {
    const syncStatus = this.syncManager.getSyncStatus();
    const topics = this.topicRegistry.listTopics();
    
    const interfaces: InterfaceDetail[] = [];
    
    // Discord interface
    interfaces.push({
      name: 'discord',
      status: syncStatus.discord_connected ? 'online' : 'offline',
      last_activity: String(syncStatus.last_sync || 'Never'),
      active_topics: topics
        .filter(t => t.config.discord_channel_id)
        .map(t => t.config.name),
      connection_details: {
        mode: syncStatus.discord_connected ? 'connected' : 'mock',
        web_socket: syncStatus.discord_connected ? 'ws://localhost:8765' : null,
        mapped_channels: topics.filter((t: any) => t.config.discord_channel_id).length,
      },
    });
    
    // Web UI interface
    interfaces.push({
      name: 'web',
      status: 'online',
      last_activity: new Date().toISOString(),
      active_topics: await this.getActiveTopics(),
      connection_details: {
        mode: 'direct',
        url: 'http://localhost:3000',
        topics_loaded: topics.length,
      },
    });
    
    // CLI interface
    interfaces.push({
      name: 'cli',
      status: 'online',
      last_activity: new Date().toISOString(),
      active_topics: await this.getActiveTopics(),
      connection_details: {
        mode: 'direct',
        executable: '/home/mdwzrd/wzrd-redesign/bin/wzrd-cli',
        active_sessions: 1,
      },
    });
    
    return interfaces;
  }

  /**
   * Get topic details
   */
  async getTopicDetails(topicId?: string): Promise<TopicDetail[]> {
    const topics = topicId 
      ? [this.topicRegistry.getTopicByName(topicId)].filter(Boolean)
      : this.topicRegistry.listTopics();
    
    if (!topics.length) {
      return [];
    }
    
    return topics.map((topic: any) => {
      const progress = topic.progress || {};
      
      return {
        id: topic.id,
        name: topic.config.name,
        description: topic.config.description || 'No description',
        interfaces: this.getTopicInterfaces(topic.id),
        last_activity: progress.last_update || 'Never',
        message_counts: {
          cli: progress?.cli_commands || 0 || 0,
          discord: progress?.discord_message_count || 0 || 0,
          web: progress?.web_message_count || 0 || 0,
        },
        progress,
      };
    });
  }

  /**
   * Get API key usage dashboard
   */
  getAPIKeyDashboard() {
    const usage = getUsageStats();
    
    return {
      current_key: usage.current_key,
      keys: {
        main: {
          used_today: usage.main_key.used_today,
          daily_limit: usage.main_key.daily_limit,
          percentage: usage.main_key.percentage,
          total_used: usage.main_key.total_used,
          last_reset: usage.main_key.last_reset,
        },
        backup: {
          used_today: usage.backup_key.used_today,
          daily_limit: usage.backup_key.daily_limit,
          percentage: usage.backup_key.percentage,
          total_used: usage.backup_key.total_used,
          last_reset: usage.backup_key.last_reset,
        },
      },
      auto_switch: this.keyManager['config'].openrouter.auto_switch,
      switch_threshold: this.keyManager['config'].openrouter.switch_threshold,
      should_switch: this.keyManager.shouldSwitchKey(),
    };
  }

  /**
   * Get sync activity log
   */
  getActivityLog(limit: number = 50) {
    return this.activityLog.slice(-limit).reverse();
  }

  /**
   * Record activity
   */
  recordActivity(interfaceName: string, topic: string, action: string, details: any = {}) {
    this.activityLog.push({
      timestamp: new Date().toISOString(),
      interface: interfaceName,
      topic,
      action,
      details,
    });
    
    // Keep only last 1000 entries
    if (this.activityLog.length > 1000) {
      this.activityLog = this.activityLog.slice(-1000);
    }
  }

  /**
   * Get sync statistics
   */
  getSyncStatistics() {
    const syncStatus = this.syncManager.getSyncStatus();
    
    // Calculate hourly syncs
    const hourlySyncs = this.activityLog
      .filter(log => log.action === 'sync')
      .filter(log => {
        const logTime = new Date(log.timestamp).getTime();
        const hourAgo = Date.now() - 3600000;
        return logTime > hourAgo;
      })
      .length;
    
    // Calculate topic distribution
    const topicCounts: Record<string, number> = {};
    this.activityLog.forEach(log => {
      topicCounts[log.topic] = (topicCounts[log.topic] || 0) + 1;
    });
    
    // Calculate interface distribution
    const interfaceCounts: Record<string, number> = {};
    this.activityLog.forEach(log => {
      interfaceCounts[log.interface] = (interfaceCounts[log.interface] || 0) + 1;
    });
    
    return {
      total_syncs: syncStatus.total_syncs || 0,
      syncs_last_hour: hourlySyncs,
      last_sync: syncStatus.last_sync || 'Never',
      topic_distribution: topicCounts,
      interface_distribution: interfaceCounts,
      errors_last_hour: this.getErrorCountLastHour(),
    };
  }

  /**
   * Get error count from last hour
   */
  private getErrorCountLastHour(): number {
    const hourAgo = Date.now() - 3600000;
    
    return this.activityLog
      .filter(log => {
        const logTime = new Date(log.timestamp).getTime();
        return logTime > hourAgo && log.action.includes('error');
      })
      .length;
  }

  /**
   * Get active topics
   */
  private async getActiveTopics(): Promise<string[]> {
    const topics = this.topicRegistry.listTopics();
    const activeTopics: string[] = [];
    
    // This would check each interface for active topics
    // For now, return all topics with recent activity
    topics.forEach(topic => {
      const progress = topic.progress || { last_update: new Date().toISOString() };
      if (progress.last_update) {
        const lastUpdate = new Date(progress.last_update).getTime();
        const hourAgo = Date.now() - 3600000;
        if (lastUpdate > hourAgo) {
          activeTopics.push(topic.config.name);
        }
      }
    });
    
    return activeTopics;
  }

  /**
   * Get topic interfaces
   */
  private getTopicInterfaces(topicId: string): string[] {
    const topic = this.topicRegistry.getTopicByName(topicId);
    if (!topic) return [];
    
    const interfaces: string[] = ['web'];
    
    if (topic.config.discord_channel_id) {
      interfaces.push('discord');
    }
    
    // Check if CLI has been used with this topic
    const progress = topic.progress || {};
    if ((progress as any).cli_commands > 0) {
      interfaces.push('cli');
    }
    
    return interfaces;
  }

  /**
   * Get system metrics
   */
  private async getSystemMetrics(): Promise<{ memory_usage: number; disk_usage: number }> {
    try {
      const os = require('os');
      const fs = require('fs');
      const path = require('path');
      
      // Memory usage
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const memory_usage = ((totalMem - freeMem) / totalMem) * 100;
      
      // Disk usage
      const rootPath = path.join(__dirname, '..');
      const stats = fs.statfsSync ? fs.statfsSync(rootPath) : { bsize: 1, blocks: 1, bfree: 1 };
      const disk_usage = 100 - ((stats.bfree * stats.bsize) / (stats.blocks * stats.bsize)) * 100;
      
      return {
        memory_usage: Math.round(memory_usage * 10) / 10,
        disk_usage: Math.round(disk_usage * 10) / 10,
      };
    } catch (error) {
      console.error('[RemiMonitor] Failed to get system metrics:', error);
      return {
        memory_usage: 0,
        disk_usage: 0,
      };
    }
  }

  /**
   * Export dashboard data for Web UI
   */
  async exportDashboardData() {
    const [systemStatus, interfaceDetails, topicDetails, apiDashboard, syncStats] = await Promise.all([
      this.getSystemStatus(),
      this.getInterfaceDetails(),
      this.getTopicDetails(),
      this.getAPIKeyDashboard(),
      this.getSyncStatistics(),
    ]);
    
    return {
      system: systemStatus,
      interfaces: interfaceDetails,
      topics: topicDetails,
      api_keys: apiDashboard,
      sync: syncStats,
      activity_log: this.getActivityLog(20),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Start monitoring
   */
  startMonitoring(intervalMs: number = 60000): NodeJS.Timeout {
    console.log(`[RemiMonitor] Starting monitoring with ${intervalMs}ms interval`);
    
    return setInterval(async () => {
      try {
        const status = await this.getSystemStatus();
        
        // Record monitoring activity
        this.recordActivity('monitor', 'system', 'health_check', {
          interfaces: status.interfaces,
          topics: status.topics,
          api_keys: status.api_keys,
        });
        
        // Check for issues
        this.checkForIssues(status);
        
      } catch (error) {
        console.error('[RemiMonitor] Monitoring error:', error);
        this.recordActivity('monitor', 'system', 'error', { error: error instanceof Error ? error.message : String(error) });
      }
    }, intervalMs);
  }

  /**
   * Check for system issues
   */
  private checkForIssues(status: SystemStatus): void {
    const issues: string[] = [];
    
    // Check API key usage
    if (status.api_keys.main_usage > 90 && status.api_keys.current === 'main') {
      issues.push(`Main API key usage at ${status.api_keys.main_usage}%`);
    }
    
    if (status.api_keys.backup_usage > 90 && status.api_keys.current === 'backup') {
      issues.push(`Backup API key usage at ${status.api_keys.backup_usage}%`);
    }
    
    // Check interface connectivity
    if (!status.interfaces.discord) {
      issues.push('Discord interface disconnected');
    }
    
    // Check sync errors
    if (status.sync.errors_last_hour > 5) {
      issues.push(`High sync errors: ${status.sync.errors_last_hour} in last hour`);
    }
    
    // Log issues if any
    if (issues.length > 0) {
      console.warn('[RemiMonitor] System issues detected:', issues);
      this.recordActivity('monitor', 'system', 'issues_detected', { issues });
    }
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    console.log('[RemiMonitor] Cleaning up...');
    
    if (this.discordBot) {
      this.discordBot.stop().catch(() => {});
    }
    
    if (this.webUI) {
      this.webUI.cleanup();
    }
    
    console.log('[RemiMonitor] Cleaned up');
  }
}

// Export singleton instance
export const remiMonitor = new RemiMonitor();

// Export for use in other modules
export default remiMonitor;