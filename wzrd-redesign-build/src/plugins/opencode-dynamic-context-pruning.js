/**
 * OpenCode Dynamic Context Pruning Plugin
 * 
 * Automatically prunes old context entries to prevent accumulation
 * in prompt-history.jsonl and TUI slowdowns.
 * 
 * Features:
 * - Automatic pruning after N conversations
 * - Configurable retention periods
 * - Works with OpenCode /compact command
 * - Safe operation with backups
 * 
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

class DynamicContextPruningPlugin {
  constructor(config = {}) {
    this.config = {
      // Maximum conversation history to keep
      maxConversations: 50,
      // Maximum age in milliseconds (default: 24 hours)
      maxAgeMs: 24 * 60 * 60 * 1000,
      // Prune after N new conversations
      pruneAfterConversations: 10,
      // Backup before pruning
      backupEnabled: true,
      // Backup directory
      backupDir: path.join(process.env.HOME || process.env.USERPROFILE, '.opencode', 'backups'),
      ...config
    };
    
    this.conversationCount = 0;
    this.lastPruneTime = 0;
    this.historyFile = path.join(process.env.HOME || process.env.USERPROFILE, '.opencode', 'prompt-history.jsonl');
  }

  /**
   * Initialize plugin
   */
  async init() {
    console.log('[DynamicContextPruning] Plugin initialized');
    
    // Create backup directory if needed
    if (this.config.backupEnabled) {
      await this.ensureBackupDir();
    }
    
    // Load initial conversation count
    await this.loadConversationCount();
    
    return this;
  }

  /**
   * Ensure backup directory exists
   */
  async ensureBackupDir() {
    if (!fs.existsSync(this.config.backupDir)) {
      fs.mkdirSync(this.config.backupDir, { recursive: true });
    }
  }

  /**
   * Load conversation count from history file
   */
  async loadConversationCount() {
    try {
      if (fs.existsSync(this.historyFile)) {
        const content = fs.readFileSync(this.historyFile, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());
        this.conversationCount = lines.length;
      }
    } catch (error) {
      console.error('[DynamicContextPruning] Error loading conversation count:', error.message);
    }
  }

  /**
   * Check if pruning is needed
   */
  shouldPrune() {
    // Check conversation count threshold
    if (this.conversationCount >= this.config.pruneAfterConversations) {
      return true;
    }
    
    // Check time-based pruning (once per hour)
    const now = Date.now();
    if (now - this.lastPruneTime > 60 * 60 * 1000) { // 1 hour
      return true;
    }
    
    return false;
  }

  /**
   * Create backup of history file
   */
  async createBackup() {
    if (!this.config.backupEnabled) return;
    
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(this.config.backupDir, `prompt-history-${timestamp}.jsonl`);
      
      if (fs.existsSync(this.historyFile)) {
        fs.copyFileSync(this.historyFile, backupFile);
        console.log(`[DynamicContextPruning] Backup created: ${backupFile}`);
      }
    } catch (error) {
      console.error('[DynamicContextPruning] Backup failed:', error.message);
    }
  }

  /**
   * Prune old conversations
   */
  async prune() {
    if (!this.shouldPrune()) {
      return false;
    }

    try {
      // Create backup before pruning
      await this.createBackup();

      if (!fs.existsSync(this.historyFile)) {
        console.log('[DynamicContextPruning] No history file to prune');
        return false;
      }

      // Read all lines
      const content = fs.readFileSync(this.historyFile, 'utf8');
      const lines = content.split('\n').filter(line => line.trim());
      
      if (lines.length <= this.config.maxConversations) {
        console.log(`[DynamicContextPruning] History size (${lines.length}) within limit (${this.config.maxConversations}), no pruning needed`);
        return false;
      }

      // Parse timestamps from each line
      const conversations = lines.map((line, index) => {
        try {
          const entry = JSON.parse(line);
          return {
            index,
            line,
            timestamp: entry.timestamp || Date.now() - (lines.length - index) * 1000,
            content: entry
          };
        } catch (e) {
          return {
            index,
            line,
            timestamp: Date.now() - (lines.length - index) * 1000,
            content: null
          };
        }
      });

      // Sort by timestamp (newest first)
      conversations.sort((a, b) => b.timestamp - a.timestamp);

      // Apply both count and time-based filtering
      const now = Date.now();
      const toKeep = conversations.filter(conv => {
        // Time-based filtering: check if within max age
        const isRecent = now - conv.timestamp <= this.config.maxAgeMs;
        
        // Count-based filtering: keep newest N that also pass time filter
        // We'll keep sorting and slicing after filtering
        return isRecent;
      }).slice(0, this.config.maxConversations);
      
      // Sort back to original order
      toKeep.sort((a, b) => a.index - b.index);
      
      // Write back
      const newContent = toKeep.map(c => c.line).join('\n');
      fs.writeFileSync(this.historyFile, newContent);
      
      // Update counts
      this.conversationCount = toKeep.length;
      this.lastPruneTime = Date.now();
      
      const prunedCount = lines.length - toKeep.length;
      console.log(`[DynamicContextPruning] Pruned ${prunedCount} old conversations, kept ${toKeep.length}`);
      
      return true;
    } catch (error) {
      console.error('[DynamicContextPruning] Pruning error:', error);
      return false;
    }
  }

  /**
   * Hook for conversation completion
   */
  async onConversationComplete(conversationData) {
    this.conversationCount++;
    
    // Try to prune if needed
    await this.prune();
    
    return conversationData;
  }

  /**
   * Hook for /compact command
   */
  async onCompactCommand() {
    console.log('[DynamicContextPruning] Compact command received, triggering prune');
    return await this.prune();
  }

  /**
   * Get plugin metadata
   */
  getMetadata() {
    return {
      name: 'Dynamic Context Pruning',
      version: '1.0.0',
      description: 'Automatically prunes old context to prevent accumulation',
      hooks: {
        'conversation:complete': this.onConversationComplete.bind(this),
        'command:compact': this.onCompactCommand.bind(this)
      }
    };
  }
}

// Export for OpenCode plugin system
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DynamicContextPruningPlugin;
}

// Auto-initialize if loaded directly
if (require.main === module) {
  (async () => {
    const plugin = new DynamicContextPruningPlugin();
    await plugin.init();
    console.log('[DynamicContextPruning] Ready for testing');
  })();
}