/**
 * Topic Registry - Single source of truth for topic management
 *
 * Ensures topic consistency across all interfaces:
 * - Discord channels ↔ Topics
 * - Web UI tabs ↔ Topics
 * - CLI commands ↔ Topics
 *
 * This creates a unified experience where Remi understands
 * which topic is active across all platforms.
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
  progress: {
    status: 'active' | 'paused' | 'completed';
    tasks_completed: number;
    tasks_total: number;
    last_update: string;
  };
}

export interface TopicProgress {
  status: "active" | "paused" | "completed";
  tasks_completed: number;
  tasks_total: number;
  last_update: string;
  cli_commands?: number;
  discord_message_count?: number;
  web_message_count?: number;
}

export class TopicRegistry {
  private topics: Map<string, Topic> = new Map();
  private configPath: string;
  private dataPath: string;
  private initialized: boolean = false;

  constructor(configPath?: string, dataPath?: string) {
    this.configPath = configPath || `${process.env.WZRD_REDESIGN_DIR || '/home/mdwzrd/wzrd-redesign'}/topics/config.yaml`;
    this.dataPath = dataPath || `${process.env.WZRD_REDESIGN_DIR || '/home/mdwzrd/wzrd-redesign'}/topics/data/topics.json`;
  }

  /**
   * Initialize registry and load topics
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Load topics from config and data files
    this.loadTopics();
    this.initialized = true;

    console.log(`[TopicRegistry] Initialized with ${this.topics.size} topics`);
  }

  /**
   * Load topics from files
   */
  private loadTopics(): void {
    const fs = require('fs');

    // Load from config YAML if exists
    if (fs.existsSync(this.configPath)) {
      const config = this.parseYAML(fs.readFileSync(this.configPath, 'utf8'));
      this.createTopicsFromConfig(config);
    }

    // Load from data JSON if exists
    if (fs.existsSync(this.dataPath)) {
      const data = JSON.parse(fs.readFileSync(this.dataPath, 'utf8'));
      for (const topicData of data.topics || []) {
        this.topics.set(topicData.id, topicData);
      }
    }
  }

  /**
   * Create topics from config YAML
   */
  private createTopicsFromConfig(config: any): void {
    const fs = require('fs');

    for (const [key, topicConfig] of Object.entries(config)) {
      const configObj: any = topicConfig;
      const topic: Topic = {
        id: this.generateId(key),
        config: {
          name: configObj.name || key,
          description: configObj.description || '',
          ...configObj,
        },
        created_at: Date.now(),
        updated_at: Date.now(),
        memory_path: `${process.env.WZRD_REDESIGN_DIR || '/home/mdwzrd/wzrd-redesign'}/topics/${this.sanitizeName(key)}`,
        discord_channel_id: configObj.discord_channel_id,
        web_ui_tab: configObj.web_ui_tab || key,
        cli_alias: configObj.cli_alias || this.sanitizeName(key).toLowerCase(),
        project_path: configObj.project_path,
        progress: {
          status: 'active',
          tasks_completed: 0,
          tasks_total: 0,
          last_update: new Date().toISOString(),
        },
      };

      // Create topic directory
      this.createTopicDirectories(topic);

      this.topics.set(topic.id, topic);
    }
  }

  /**
   * Create topic directory structure
   */
  private createTopicDirectories(topic: Topic): void {
    const fs = require('fs');
    const path = require('path');

    const topicPath = topic.memory_path;
    if (!fs.existsSync(topicPath)) {
      fs.mkdirSync(topicPath, { recursive: true });
    }

    // Create memory subdirectories
    const subdirs = ['decisions', 'notes', 'references', 'activity'];
    for (const subdir of subdirs) {
      const subPath = path.join(topicPath, subdir);
      if (!fs.existsSync(subPath)) {
        fs.mkdirSync(subPath, { recursive: true });
      }
    }

    // Create initial progress file
    const progressPath = path.join(topicPath, 'progress.json');
    if (!fs.existsSync(progressPath)) {
      fs.writeFileSync(progressPath, JSON.stringify({
        status: topic.progress.status,
        tasks_completed: topic.progress.tasks_completed,
        tasks_total: topic.progress.tasks_total,
        last_update: topic.progress.last_update,
      }, null, 2));
    }
  }

  /**
   * Create a new topic
   */
  createTopic(name: string, config: Partial<TopicConfig> = {}): Topic {
    const id = this.generateId(name);
    const sanitized = this.sanitizeName(name);

    const topic: Topic = {
      id,
      config: {
        name: name,
        description: config.description || name,
        ...config,
        is_active: config.is_active !== false,
        tags: config.tags || [],
        permissions: config.permissions || { remi: 'read_write', users: 'read_write' },
      },
      created_at: Date.now(),
      updated_at: Date.now(),
      memory_path: `${process.env.WZRD_REDESIGN_DIR || '/home/mdwzrd/wzrd-redesign'}/topics/${sanitized}`,
      cli_alias: config.cli_alias || sanitized.toLowerCase(),
      progress: {
        status: 'active',
        tasks_completed: 0,
        tasks_total: 0,
        last_update: new Date().toISOString(),
      },
    };

    this.topics.set(id, topic);

    // Create directory structure
    this.createTopicDirectories(topic);

    // Save to data file
    this.saveTopics();

    console.log(`[TopicRegistry] Created topic: ${name} (${sanitized})`);

    return topic;
  }

  /**
   * Get topic by ID
   */
  getTopic(id: string): Topic | undefined {
    return this.topics.get(id);
  }

  /**
   * Get topic by Discord channel ID
   */
  getTopicByDiscordChannel(channelId: string): Topic | undefined {
    for (const [_, topic] of this.topics) {
      if (topic.discord_channel_id === channelId) {
        return topic;
      }
    }
    return undefined;
  }

  /**
   * Get topic by Web UI tab
   */
  getTopicByWebUITab(tab: string): Topic | undefined {
    for (const [_, topic] of this.topics) {
      if (topic.web_ui_tab === tab) {
        return topic;
      }
    }
    return undefined;
  }

  /**
   * Get topic by CLI alias
   */
  getTopicByCLIAlias(alias: string): Topic | undefined {
    for (const [_, topic] of this.topics) {
      if (topic.cli_alias === alias) {
        return topic;
      }
    }
    return undefined;
  }

  /**
   * Get topic by name
   */
  getTopicByName(name: string): Topic | undefined {
    for (const [_, topic] of this.topics) {
      if (topic.config.name.toLowerCase() === name.toLowerCase()) {
        return topic;
      }
    }
    return undefined;
  }

  /**
   * Update topic progress
   */
  updateTopicProgress(id: string, progress: Partial<TopicProgress>): void {
    const topic = this.topics.get(id);
    if (!topic) {
      console.warn(`[TopicRegistry] Topic not found: ${id}`);
      return;
    }

    topic.progress = {
      ...topic.progress,
      ...progress,
      last_update: progress.last_update || new Date().toISOString(),
    };
    topic.updated_at = Date.now();

    this.saveTopics();

    console.log(`[TopicRegistry] Updated progress for topic: ${topic.config.name}`);
  }

  /**
   * Update topic configuration
   */
  updateTopicConfig(id: string, config: Partial<TopicConfig>): void {
    const topic = this.topics.get(id);
    if (!topic) {
      console.warn(`[TopicRegistry] Topic not found: ${id}`);
      return;
    }

    topic.config = {
      ...topic.config,
      ...config,
    };
    topic.updated_at = Date.now();

    this.saveTopics();

    console.log(`[TopicRegistry] Updated config for topic: ${topic.config.name}`);
  }

  /**
   * Sync topic progress across interfaces
   */
  syncTopicProgress(topicId: string): void {
    const topic = this.topics.get(topicId);
    if (!topic) {
      return;
    }

    // Here you would implement:
    // - Update Discord bot with new progress
    // - Update Web UI with new progress
    // - Update CLI with new progress

    console.log(`[TopicRegistry] Synced progress for ${topic.config.name} across all interfaces`);
  }

  /**
   * List all topics
   */
  listTopics(): Topic[] {
    return Array.from(this.topics.values());
  }

  /**
   * Get active topics
   */
  getActiveTopics(): Topic[] {
    return Array.from(this.topics.values()).filter(t => t.config.is_active !== false);
  }

  /**
   * Deactivate topic
   */
  deactivateTopic(id: string): void {
    const topic = this.topics.get(id);
    if (!topic) {
      return;
    }

    topic.config.is_active = false;
    topic.progress.status = 'paused';
    topic.updated_at = Date.now();

    this.saveTopics();

    console.log(`[TopicRegistry] Deactivated topic: ${topic.config.name}`);
  }

  /**
   * Activate topic
   */
  activateTopic(id: string): void {
    const topic = this.topics.get(id);
    if (!topic) {
      return;
    }

    topic.config.is_active = true;
    topic.progress.status = 'active';
    topic.updated_at = Date.now();

    this.saveTopics();

    console.log(`[TopicRegistry] Activated topic: ${topic.config.name}`);
  }

  /**
   * Delete topic
   */
  deleteTopic(id: string): boolean {
    const topic = this.topics.get(id);
    if (!topic) {
      return false;
    }

    // Remove from registry
    this.topics.delete(id);

    // Delete topic directory
    const fs = require('fs');
    const topicPath = topic.memory_path;
    if (fs.existsSync(topicPath)) {
      fs.rmSync(topicPath, { recursive: true, force: true });
    }

    // Save changes
    this.saveTopics();

    console.log(`[TopicRegistry] Deleted topic: ${topic.config.name}`);

    return true;
  }

  /**
   * Save topics to data file
   */
  private saveTopics(): void {
    const fs = require('fs');
    const topicsData = {
      topics: Array.from(this.topics.values()),
      updated_at: Date.now(),
    };

    fs.writeFileSync(this.dataPath, JSON.stringify(topicsData, null, 2));

    // Also update config YAML
    if (fs.existsSync(this.configPath)) {
      this.updateConfigYAML();
    }
  }

  /**
   * Update config YAML with current topics
   */
  private updateConfigYAML(): void {
    const fs = require('fs');

    const config: any = {};

    for (const [_, topic] of this.topics) {
      const key = topic.cli_alias as string;
      if (key) {
        config[key] = {
          name: topic.config.name,
          description: topic.config.description,
          discord_channel_id: topic.discord_channel_id,
          web_ui_tab: topic.web_ui_tab,
          cli_alias: topic.cli_alias,
          project_path: topic.project_path,
          tags: topic.config.tags,
          is_active: topic.config.is_active,
        };
      }
    }

    fs.writeFileSync(this.configPath, this.objectToYAML(config));
  }

  /**
   * Generate unique ID for topic
   */
  private generateId(name: string): string {
    return `${name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sanitize name for file/directory
   */
  private sanitizeName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Parse YAML to object
   */
  private parseYAML(yaml: string): any {
    // Simple YAML parser
    const result: any = {};
    const lines = yaml.split('\n');

    let currentSection: any = null;

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip comments and empty lines
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      // Check for section headers
      const sectionMatch = trimmed.match(/^(\w+):\s*$/);
      if (sectionMatch) {
        currentSection = sectionMatch[1];
        result[currentSection] = {};
        continue;
      }

      // Check for key-value pairs
      const kvMatch = trimmed.match(/^(\w+):\s*(.*)$/);
      if (kvMatch) {
        const key = kvMatch[1];
        let value: any = kvMatch[2];

        // Handle arrays
        if (value.match(/^\[(.*)\]$/)) {
          value = value.replace(/^\[|\]$/g, '').split(',').map((s: string) => s.trim());
        }

        if (currentSection) {
          result[currentSection][key] = value;
        } else {
          result[key] = value;
        }
      }
    }

    return result;
  }

  /**
   * Convert object to YAML
   */
  private objectToYAML(obj: any): string {
    const lines: string[] = [];

    for (const key of Object.keys(obj)) {
      const value = obj[key];

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        lines.push(`${key}:`);
        for (const subKey of Object.keys(value)) {
          lines.push(`  ${subKey}: ${value[subKey]}`);
        }
      } else if (Array.isArray(value)) {
        lines.push(`${key}: [${value.join(', ')}]`);
      } else {
        lines.push(`${key}: ${value}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Get registry statistics
   */
  getStatistics() {
    return {
      totalTopics: this.topics.size,
      activeTopics: Array.from(this.topics.values()).filter(t => t.config.is_active !== false).length,
      byInterface: {
        discord: Array.from(this.topics.values()).filter(t => t.discord_channel_id).length,
        web: Array.from(this.topics.values()).filter(t => t.web_ui_tab).length,
        cli: Array.from(this.topics.values()).filter(t => t.cli_alias).length,
      },
    };
  }
}

// Export for use in other modules
export default TopicRegistry;