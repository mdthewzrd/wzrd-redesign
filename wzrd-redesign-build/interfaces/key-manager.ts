/**
 * API Key Manager with Automatic Fallback
 * 
 * Manages API keys with automatic switching when limits are reached:
 * 1. Monkeys usage of current key
 * 2. Auto-switches to backup when threshold reached
 * 3. Tracks usage across both keys
 * 4. Provides rotation logic
 */

import * as fs from 'fs';
import * as path from 'path';

export interface APIKeyUsage {
  daily_limit: number;
  used_today: number;
  last_reset: string;
  total_used: number;
}

export interface OpenRouterConfig {
  keys: {
    main: string;
    backup: string;
  };
  current: 'main' | 'backup';
  usage: {
    main: APIKeyUsage;
    backup: APIKeyUsage;
  };
  auto_switch: boolean;
  switch_threshold: number;
  notify_on_switch: boolean;
}

export interface KeyManagerConfig {
  openrouter: OpenRouterConfig;
  discord: {
    bot_token: string;
    client_id: string;
    guild_id: string;
  };
  webhook_urls: {
    discord_webhook: string;
    slack_webhook: string;
    telegram_bot_token: string;
  };
}

export class KeyManager {
  private config: KeyManagerConfig;
  private configPath: string;

  constructor(configPath?: string) {
    this.configPath = configPath || '/home/mdwzrd/wzrd-redesign/configs/api-keys.json';
    this.config = this.loadConfig();
  }

  /**
   * Load config from file
   */
  private loadConfig(): KeyManagerConfig {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('[KeyManager] Failed to load config:', error);
    }

    // Return default config
    return {
      openrouter: {
        keys: {
          main: '',
          backup: ''
        },
        current: 'main',
        usage: {
          main: {
            daily_limit: 100,
            used_today: 0,
            last_reset: new Date().toISOString().split('T')[0],
            total_used: 0
          },
          backup: {
            daily_limit: 100,
            used_today: 0,
            last_reset: new Date().toISOString().split('T')[0],
            total_used: 0
          }
        },
        auto_switch: true,
        switch_threshold: 90,
        notify_on_switch: true
      },
      discord: {
        bot_token: '',
        client_id: '',
        guild_id: ''
      },
      webhook_urls: {
        discord_webhook: '',
        slack_webhook: '',
        telegram_bot_token: ''
      }
    };
  }

  /**
   * Save config to file
   */
  private saveConfig(): void {
    try {
      const dir = path.dirname(this.configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error('[KeyManager] Failed to save config:', error);
    }
  }

  /**
   * Get current API key
   */
  getCurrentKey(): string {
    const currentKeyType = this.config.openrouter.current;
    return this.config.openrouter.keys[currentKeyType];
  }

  /**
   * Get current key type
   */
  getCurrentKeyType(): 'main' | 'backup' {
    return this.config.openrouter.current;
  }

  /**
   * Check if we need to switch keys
   */
  shouldSwitchKey(): boolean {
    if (!this.config.openrouter.auto_switch) {
      return false;
    }

    const currentKeyType = this.config.openrouter.current;
    const currentUsage = this.config.openrouter.usage[currentKeyType];
    
    // Check if we've reached the threshold
    const usagePercentage = (currentUsage.used_today / currentUsage.daily_limit) * 100;
    return usagePercentage >= this.config.openrouter.switch_threshold;
  }

  /**
   * Switch to backup key
   */
  switchToBackup(): boolean {
    if (this.config.openrouter.current === 'backup') {
      console.log('[KeyManager] Already using backup key');
      return false;
    }

    console.log('[KeyManager] Switching from main to backup key');
    
    // Update config
    this.config.openrouter.current = 'backup';
    this.saveConfig();

    // Notify if enabled
    if (this.config.openrouter.notify_on_switch) {
      this.notifyKeySwitch('main', 'backup');
    }

    return true;
  }

  /**
   * Switch to main key
   */
  switchToMain(): boolean {
    if (this.config.openrouter.current === 'main') {
      console.log('[KeyManager] Already using main key');
      return false;
    }

    console.log('[KeyManager] Switching from backup to main key');
    
    // Update config
    this.config.openrouter.current = 'main';
    this.saveConfig();

    // Notify if enabled
    if (this.config.openrouter.notify_on_switch) {
      this.notifyKeySwitch('backup', 'main');
    }

    return true;
  }

  /**
   * Record usage of current key
   */
  recordUsage(tokens: number = 1): void {
    const currentKeyType = this.config.openrouter.current;
    const usage = this.config.openrouter.usage[currentKeyType];
    
    // Reset daily usage if new day
    const today = new Date().toISOString().split('T')[0];
    if (usage.last_reset !== today) {
      usage.used_today = 0;
      usage.last_reset = today;
    }
    
    // Update usage
    usage.used_today += tokens;
    usage.total_used += tokens;
    
    // Save config
    this.saveConfig();
    
    // Check if we need to switch
    if (this.shouldSwitchKey() && currentKeyType === 'main') {
      console.log('[KeyManager] Usage threshold reached, switching to backup');
      this.switchToBackup();
    }
  }

  /**
   * Get usage statistics
   */
  getUsageStats() {
    const mainUsage = this.config.openrouter.usage.main;
    const backupUsage = this.config.openrouter.usage.backup;
    const currentKeyType = this.config.openrouter.current;
    
    const mainPercentage = (mainUsage.used_today / mainUsage.daily_limit) * 100;
    const backupPercentage = (backupUsage.used_today / backupUsage.daily_limit) * 100;
    
    return {
      current_key: currentKeyType,
      main_key: {
        percentage: Math.min(mainPercentage, 100).toFixed(1),
        used_today: mainUsage.used_today,
        daily_limit: mainUsage.daily_limit,
        total_used: mainUsage.total_used,
        last_reset: mainUsage.last_reset
      },
      backup_key: {
        percentage: Math.min(backupPercentage, 100).toFixed(1),
        used_today: backupUsage.used_today,
        daily_limit: backupUsage.daily_limit,
        total_used: backupUsage.total_used,
        last_reset: backupUsage.last_reset
      }
    };
  }

  /**
   * Set Discord credentials
   */
  setDiscordCredentials(botToken: string, clientId?: string, guildId?: string): void {
    this.config.discord.bot_token = botToken;
    if (clientId) this.config.discord.client_id = clientId;
    if (guildId) this.config.discord.guild_id = guildId;
    this.saveConfig();
  }

  /**
   * Get Discord credentials
   */
  getDiscordCredentials() {
    return { ...this.config.discord };
  }

  /**
   * Set webhook URLs
   */
  setWebhookUrls(urls: Partial<typeof this.config.webhook_urls>): void {
    Object.assign(this.config.webhook_urls, urls);
    this.saveConfig();
  }

  /**
   * Get webhook URLs
   */
  getWebhookUrls() {
    return { ...this.config.webhook_urls };
  }

  /**
   * Notify about key switch
   */
  private notifyKeySwitch(from: 'main' | 'backup', to: 'main' | 'backup'): void {
    const message = `API Key switched from ${from} to ${to} key`;
    console.log(`[KeyManager] ${message}`);
    
    // This would send notifications to configured webhooks
    // For now, just log
  }

  /**
   * Reset daily usage for testing
   */
  resetDailyUsage(): void {
    const today = new Date().toISOString().split('T')[0];
    
    this.config.openrouter.usage.main.used_today = 0;
    this.config.openrouter.usage.main.last_reset = today;
    
    this.config.openrouter.usage.backup.used_today = 0;
    this.config.openrouter.usage.backup.last_reset = today;
    
    this.saveConfig();
    console.log('[KeyManager] Daily usage reset');
  }

  /**
   * Update daily limits
   */
  updateDailyLimits(mainLimit: number, backupLimit: number): void {
    this.config.openrouter.usage.main.daily_limit = mainLimit;
    this.config.openrouter.usage.backup.daily_limit = backupLimit;
    this.saveConfig();
    console.log(`[KeyManager] Updated limits: Main=${mainLimit}, Backup=${backupLimit}`);
  }
}

// Export singleton instance
export const keyManager = new KeyManager();

// Export helper functions
export function getAPIKey(): string {
  return keyManager.getCurrentKey();
}

export function recordTokenUsage(tokens: number = 1): void {
  keyManager.recordUsage(tokens);
}

export function checkAndSwitchKeys(): boolean {
  return keyManager.shouldSwitchKey();
}

export function getUsageStats() {
  return keyManager.getUsageStats();
}