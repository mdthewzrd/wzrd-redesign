"use strict";
/**
 * API Key Manager with Automatic Fallback
 *
 * Manages API keys with automatic switching when limits are reached:
 * 1. Monkeys usage of current key
 * 2. Auto-switches to backup when threshold reached
 * 3. Tracks usage across both keys
 * 4. Provides rotation logic
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.keyManager = exports.KeyManager = void 0;
exports.getAPIKey = getAPIKey;
exports.recordTokenUsage = recordTokenUsage;
exports.checkAndSwitchKeys = checkAndSwitchKeys;
exports.getUsageStats = getUsageStats;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class KeyManager {
    constructor(configPath) {
        this.configPath = configPath || '/home/mdwzrd/wzrd-redesign/configs/api-keys.json';
        this.config = this.loadConfig();
    }
    /**
     * Load config from file
     */
    loadConfig() {
        try {
            if (fs.existsSync(this.configPath)) {
                const data = fs.readFileSync(this.configPath, 'utf8');
                return JSON.parse(data);
            }
        }
        catch (error) {
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
    saveConfig() {
        try {
            const dir = path.dirname(this.configPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
        }
        catch (error) {
            console.error('[KeyManager] Failed to save config:', error);
        }
    }
    /**
     * Get current API key
     */
    getCurrentKey() {
        const currentKeyType = this.config.openrouter.current;
        return this.config.openrouter.keys[currentKeyType];
    }
    /**
     * Get current key type
     */
    getCurrentKeyType() {
        return this.config.openrouter.current;
    }
    /**
     * Check if we need to switch keys
     */
    shouldSwitchKey() {
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
    switchToBackup() {
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
    switchToMain() {
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
    recordUsage(tokens = 1) {
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
    setDiscordCredentials(botToken, clientId, guildId) {
        this.config.discord.bot_token = botToken;
        if (clientId)
            this.config.discord.client_id = clientId;
        if (guildId)
            this.config.discord.guild_id = guildId;
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
    setWebhookUrls(urls) {
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
    notifyKeySwitch(from, to) {
        const message = `API Key switched from ${from} to ${to} key`;
        console.log(`[KeyManager] ${message}`);
        // This would send notifications to configured webhooks
        // For now, just log
    }
    /**
     * Reset daily usage for testing
     */
    resetDailyUsage() {
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
    updateDailyLimits(mainLimit, backupLimit) {
        this.config.openrouter.usage.main.daily_limit = mainLimit;
        this.config.openrouter.usage.backup.daily_limit = backupLimit;
        this.saveConfig();
        console.log(`[KeyManager] Updated limits: Main=${mainLimit}, Backup=${backupLimit}`);
    }
}
exports.KeyManager = KeyManager;
// Export singleton instance
exports.keyManager = new KeyManager();
// Export helper functions
function getAPIKey() {
    return exports.keyManager.getCurrentKey();
}
function recordTokenUsage(tokens = 1) {
    exports.keyManager.recordUsage(tokens);
}
function checkAndSwitchKeys() {
    return exports.keyManager.shouldSwitchKey();
}
function getUsageStats() {
    return exports.keyManager.getUsageStats();
}
