/**
 * Topic Registry API Client
 * Bridges Web UI to framework's TopicRegistry
 */

export interface TopicConfig {
  name: string;
  description: string;
  discord_channel_id?: string;
  discord_channel_name?: string;
  web_ui_tab?: string;
  cli_alias?: string;
  project_path?: string;
  memory_quota?: string;
  permissions?: {
    remi?: 'read_write' | 'read_only';
    users?: 'read_write' | 'read_only';
  };
  tags?: string[];
  is_active?: boolean;
  created_at?: string;
  created_from?: string;
}

export interface TopicProgress {
  status: 'active' | 'paused' | 'completed';
  tasks_completed: number;
  tasks_total: number;
  last_update: string;
  cli_commands?: number;
  discord_message_count?: number;
  web_message_count?: number;
}

export interface Topic {
  id: string;
  config: TopicConfig;
  created_at: number;
  updated_at: number;
  memory_path: string;
  discord_channel_id?: string;
  web_ui_tab?: string;
  cli_alias?: string;
  project_path?: string;
  progress: TopicProgress;
}

export interface TopicStatistics {
  totalTopics: number;
  activeTopics: number;
  byInterface: {
    discord: number;
    web: number;
    cli: number;
  };
}

const API_BASE_URL = '/api';

class TopicRegistryClient {
  private cache: Map<string, Topic> = new Map();
  private lastFetch: number = 0;
  private cacheTTL: number = 30000; // 30 seconds

  /**
   * Fetch all topics from the framework
   */
  async listTopics(): Promise<Topic[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/topics`);
      if (!response.ok) throw new Error('Failed to fetch topics');
      const data = await response.json();
      
      // Update cache
      this.cache.clear();
      data.topics.forEach((topic: Topic) => {
        this.cache.set(topic.id, topic);
      });
      this.lastFetch = Date.now();
      
      return data.topics;
    } catch (error) {
      console.error('[TopicRegistryClient] Error fetching topics:', error);
      // Return cached data if available
      return Array.from(this.cache.values());
    }
  }

  /**
   * Get a single topic by ID
   */
  async getTopic(id: string): Promise<Topic | undefined> {
    // Check cache first
    const cached = this.cache.get(id);
    if (cached && Date.now() - this.lastFetch < this.cacheTTL) {
      return cached;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/topics/${id}`);
      if (!response.ok) throw new Error('Failed to fetch topic');
      const data = await response.json();
      this.cache.set(id, data.topic);
      return data.topic;
    } catch (error) {
      console.error('[TopicRegistryClient] Error fetching topic:', error);
      return this.cache.get(id);
    }
  }

  /**
   * Create a new topic
   */
  async createTopic(name: string, config: Partial<TopicConfig> = {}): Promise<Topic> {
    const response = await fetch(`${API_BASE_URL}/topics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, config }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create topic: ${error}`);
    }

    const data = await response.json();
    this.cache.set(data.topic.id, data.topic);
    return data.topic;
  }

  /**
   * Update topic configuration
   */
  async updateTopicConfig(id: string, config: Partial<TopicConfig>): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/topics/${id}/config`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      throw new Error('Failed to update topic config');
    }

    // Update cache
    const topic = this.cache.get(id);
    if (topic) {
      topic.config = { ...topic.config, ...config };
      topic.updated_at = Date.now();
    }
  }

  /**
   * Update topic progress
   */
  async updateTopicProgress(id: string, progress: Partial<TopicProgress>): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/topics/${id}/progress`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(progress),
    });

    if (!response.ok) {
      throw new Error('Failed to update topic progress');
    }

    // Update cache
    const topic = this.cache.get(id);
    if (topic) {
      topic.progress = { ...topic.progress, ...progress };
      topic.updated_at = Date.now();
    }
  }

  /**
   * Activate a topic
   */
  async activateTopic(id: string): Promise<void> {
    await this.updateTopicConfig(id, { is_active: true });
  }

  /**
   * Deactivate a topic
   */
  async deactivateTopic(id: string): Promise<void> {
    await this.updateTopicConfig(id, { is_active: false });
  }

  /**
   * Delete a topic
   */
  async deleteTopic(id: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/topics/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete topic');
    }

    this.cache.delete(id);
    return true;
  }

  /**
   * Get topic statistics
   */
  async getStatistics(): Promise<TopicStatistics> {
    const response = await fetch(`${API_BASE_URL}/topics/statistics`);
    if (!response.ok) throw new Error('Failed to fetch statistics');
    const data = await response.json();
    return data.statistics;
  }

  /**
   * Get active topics
   */
  async getActiveTopics(): Promise<Topic[]> {
    const topics = await this.listTopics();
    return topics.filter(t => t.config.is_active !== false);
  }

  /**
   * Map topic to Discord channel
   */
  async mapToDiscord(id: string, channelId: string, channelName?: string): Promise<void> {
    await this.updateTopicConfig(id, { 
      discord_channel_id: channelId,
      discord_channel_name: channelName 
    });
  }

  /**
   * Map topic to Web UI tab
   */
  async mapToWebUI(id: string, tabId: string): Promise<void> {
    await this.updateTopicConfig(id, { web_ui_tab: tabId });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.lastFetch = 0;
  }
}

// Singleton instance
export const topicRegistry = new TopicRegistryClient();

// Note: Jotai atoms moved to @/stores/atoms.ts
// Import from there: import { topicsAtom, activeTopicAtom, ... } from '@/stores/atoms'
