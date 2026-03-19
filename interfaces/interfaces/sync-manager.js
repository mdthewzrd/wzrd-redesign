"use strict";
/**
 * Real-time Interface Synchronization
 *
 * Syncs state between Discord, Web UI, and CLI:
 * - Active topic
 * - Message history
 * - File changes
 * - Memory updates
 * - Progress tracking
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterfaceSyncManager = void 0;
const registry_1 = require("../topics/registry");
const events_1 = require("events");
class InterfaceSyncManager extends events_1.EventEmitter {
    constructor() {
        super();
        this.initialized = false;
        this.topicRegistry = new registry_1.default();
        this.syncState = this.loadSyncState();
        this.eventListeners = new Map();
    }
    /**
     * Initialize sync manager
     */
    async initialize() {
        if (this.initialized)
            return;
        console.log('[InterfaceSyncManager] Initializing...');
        // Initialize topic registry
        await this.topicRegistry.initialize();
        // Load saved state
        this.syncState = this.loadSyncState();
        // Start sync interval
        this.syncInterval = setInterval(() => this.syncAllInterfaces(), 5000);
        this.initialized = true;
        console.log('[InterfaceSyncManager] Initialized');
    }
    /**
     * Set active topic across all interfaces
     */
    async setActiveTopic(topicId, sourceInterface) {
        const topic = this.topicRegistry.getTopicByName(topicId);
        if (!topic) {
            console.warn(`[InterfaceSyncManager] Topic not found: ${topicId}`);
            return;
        }
        // Update sync state
        this.syncState.activeTopic = topicId;
        this.syncState.lastUpdate = Date.now();
        // Update interface status
        this.updateInterfaceStatus(sourceInterface, {
            activeTopic: topicId,
            lastActive: Date.now(),
        });
        // Save state
        await this.saveSyncState();
        // Broadcast event
        await this.broadcastEvent({
            type: 'topic_switch',
            data: { topicId, topicName: topic.config.name },
            timestamp: Date.now(),
            sourceInterface,
        });
        console.log(`[InterfaceSyncManager] Topic switched to: ${topic.config.name} (via ${sourceInterface})`);
    }
    /**
     * Sync message across all interfaces
     */
    async syncMessage(message) {
        // Store in history
        this.syncState.history.push({
            ...message,
            id: this.generateId(),
        });
        // Keep only last 1000 messages
        if (this.syncState.history.length > 1000) {
            this.syncState.history = this.syncState.history.slice(-1000);
        }
        // Save state
        await this.saveSyncState();
        // Broadcast event
        await this.broadcastEvent({
            type: 'message',
            data: message,
            timestamp: Date.now(),
            sourceInterface: message.interface,
        });
        console.log(`[InterfaceSyncManager] Message synced: ${message.content.substring(0, 50)}... (${message.interface})`);
    }
    /**
     * Sync file change
     */
    async syncFileChange(filePath, operation, sourceInterface) {
        const topicId = this.syncState.activeTopic;
        if (!topicId) {
            console.warn('[InterfaceSyncManager] No active topic for file change');
            return;
        }
        await this.broadcastEvent({
            type: 'file_change',
            data: {
                filePath,
                operation,
                topicId,
                timestamp: Date.now(),
            },
            timestamp: Date.now(),
            sourceInterface,
        });
        console.log(`[InterfaceSyncManager] File change synced: ${operation} ${filePath}`);
    }
    /**
     * Sync memory update
     */
    async syncMemoryUpdate(content, topicId, sourceInterface) {
        await this.broadcastEvent({
            type: 'memory_update',
            data: {
                content,
                topicId,
                timestamp: Date.now(),
            },
            timestamp: Date.now(),
            sourceInterface,
        });
        console.log(`[InterfaceSyncManager] Memory update synced for topic: ${topicId}`);
    }
    /**
     * Sync progress update
     */
    async syncProgressUpdate(topicId, progress, sourceInterface) {
        // Implementation
    }
    /**
     * Sync command execution
     */
    async syncCommand(command, args, topic, result, output, timestamp, sourceInterface) {
        const event = {
            type: 'message',
            data: { command, args, topic, result, output, timestamp },
            timestamp,
            sourceInterface,
        };
        this.emit('command', event);
    }
    /**
     * Sync topic creation
     */
    async syncTopicCreation(topicId, topicName, sourceInterface) {
        const event = {
            type: 'message',
            data: { topicId, topicName, action: 'created' },
            timestamp: Date.now(),
            sourceInterface,
        };
        this.emit('topic_created', event);
    }
    /**
     * Sync topic mapping
     */
    async syncTopicMapping(topicId, channelId, sourceInterface) {
        const event = {
            type: 'message',
            data: { topicId, channelId, action: 'mapped' },
            timestamp: Date.now(),
            sourceInterface,
        };
        this.emit('topic_mapped', event);
    }
    /**
     * Get sync status (wrapper for getSyncState)
     */
    getSyncStatus() {
        return {
            discord_connected: this.getInterfaceStatus('discord')?.connected || false,
            web_connected: this.getInterfaceStatus('web-ui')?.connected || false,
            cli_connected: this.getInterfaceStatus('cli')?.connected || false,
            last_sync: this.syncState.lastUpdate,
            total_syncs: this.syncState.history.length,
        };
    }
    /**
     * Get current sync state
     */
    getSyncState() {
        return { ...this.syncState };
    }
    /**
     * Get active topic
     */
    getActiveTopic() {
        return this.syncState.activeTopic;
    }
    /**
     * Get interface status
     */
    getInterfaceStatus(interfaceType) {
        return this.syncState.interfaces.find(i => i.type === interfaceType);
    }
    /**
     * Get all interface statuses
     */
    getAllInterfaceStatuses() {
        return [...this.syncState.interfaces];
    }
    /**
     * Get message history for a topic
     */
    getTopicHistory(topicId, limit = 50) {
        return this.syncState.history
            .filter(msg => msg.topic === topicId)
            .slice(-limit);
    }
    /**
     * Get recent messages across all topics
     */
    getRecentMessages(limit = 20) {
        return this.syncState.history.slice(-limit);
    }
    /**
     * Sync all interfaces
     */
    async syncAllInterfaces() {
        try {
            // Update interface statuses
            this.updateInterfaceStatuses();
            // Broadcast sync pulse
            await this.broadcastEvent({
                type: 'sync_pulse',
                data: { timestamp: Date.now() },
                timestamp: Date.now(),
                sourceInterface: 'sync-manager',
            });
            // Save state periodically
            await this.saveSyncState();
        }
        catch (error) {
            console.error('[InterfaceSyncManager] Sync error:', error);
        }
    }
    /**
     * Update interface status
     */
    updateInterfaceStatus(interfaceType, updates) {
        const index = this.syncState.interfaces.findIndex(i => i.type === interfaceType);
        if (index === -1) {
            // Add new interface
            this.syncState.interfaces.push({
                id: this.generateId(),
                type: interfaceType,
                connected: true,
                lastActive: Date.now(),
                status: 'online',
                ...updates,
            });
        }
        else {
            // Update existing interface
            this.syncState.interfaces[index] = {
                ...this.syncState.interfaces[index],
                ...updates,
                lastActive: Date.now(),
            };
        }
    }
    /**
     * Update all interface statuses
     */
    updateInterfaceStatuses() {
        // Check Discord connection
        const discordStatus = this.checkDiscordStatus();
        this.updateInterfaceStatus('discord', discordStatus);
        // Check Web UI connection
        const webUIStatus = this.checkWebUIStatus();
        this.updateInterfaceStatus('web-ui', webUIStatus);
        // Check CLI connection
        const cliStatus = this.checkCLIStatus();
        this.updateInterfaceStatus('cli', cliStatus);
        // Remove stale interfaces
        const now = Date.now();
        this.syncState.interfaces = this.syncState.interfaces.filter(iface => {
            return now - iface.lastActive < 5 * 60 * 1000; // 5 minutes
        });
    }
    /**
     * Check Discord status
     */
    checkDiscordStatus() {
        // In production, this would check actual Discord connection
        return {
            id: this.generateId(),
            type: 'discord',
            connected: true,
            lastActive: Date.now(),
            status: 'online',
            activeTopic: this.syncState.activeTopic || undefined,
        };
    }
    /**
     * Check Web UI status
     */
    checkWebUIStatus() {
        // In production, this would check Web UI connection
        return {
            id: this.generateId(),
            type: 'web-ui',
            connected: true,
            lastActive: Date.now(),
            status: 'online',
            activeTopic: this.syncState.activeTopic || undefined,
        };
    }
    /**
     * Check CLI status
     */
    checkCLIStatus() {
        // In production, this would check CLI connection
        return {
            id: this.generateId(),
            type: 'cli',
            connected: true,
            lastActive: Date.now(),
            status: 'online',
            activeTopic: this.syncState.activeTopic || undefined,
        };
    }
    /**
     * Broadcast event to all listeners
     */
    async broadcastEvent(event) {
        const listeners = this.eventListeners.get(event.type) || [];
        for (const listener of listeners) {
            try {
                listener(event);
            }
            catch (error) {
                console.error(`[InterfaceSyncManager] Event listener error:`, error);
            }
        }
        // Also emit to wildcard listeners
        const wildcardListeners = this.eventListeners.get('*') || [];
        for (const listener of wildcardListeners) {
            try {
                listener(event);
            }
            catch (error) {
                console.error(`[InterfaceSyncManager] Wildcard listener error:`, error);
            }
        }
    }
    /**
     * Load sync state from file
     */
    loadSyncState() {
        try {
            const fs = require('fs');
            const syncFile = '/home/mdwzrd/wzrd-redesign/interfaces/sync-state.json';
            if (fs.existsSync(syncFile)) {
                const data = JSON.parse(fs.readFileSync(syncFile, 'utf8'));
                return {
                    activeTopic: data.activeTopic || null,
                    interfaces: data.interfaces || [],
                    history: data.history || [],
                    lastUpdate: data.lastUpdate || Date.now(),
                    connected: data.connected || false,
                };
            }
        }
        catch (error) {
            console.warn('[InterfaceSyncManager] Failed to load sync state:', error);
        }
        // Default state
        return {
            activeTopic: null,
            interfaces: [],
            history: [],
            lastUpdate: Date.now(),
            connected: false,
        };
    }
    /**
     * Save sync state to file
     */
    async saveSyncState() {
        try {
            const fs = require('fs').promises;
            const syncFile = '/home/mdwzrd/wzrd-redesign/interfaces/sync-state.json';
            const data = {
                activeTopic: this.syncState.activeTopic,
                interfaces: this.syncState.interfaces,
                history: this.syncState.history,
                lastUpdate: Date.now(),
                connected: true,
            };
            await fs.writeFile(syncFile, JSON.stringify(data, null, 2));
        }
        catch (error) {
            console.error('[InterfaceSyncManager] Failed to save sync state:', error);
        }
    }
    /**
     * Generate unique ID
     */
    generateId() {
        return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Stop sync manager
     */
    async stop() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = undefined;
        }
        await this.saveSyncState();
        console.log('[InterfaceSyncManager] Stopped');
    }
}
exports.InterfaceSyncManager = InterfaceSyncManager;
// Export for use in other modules
