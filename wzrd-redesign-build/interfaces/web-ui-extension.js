"use strict";
/**
 * Web UI Extension for Topic-Based OpenCode Interface
 *
 * Extends the existing web-ui-react with:
 * 1. Topics page for topic management
 * 2. Discord bot control panel
 * 3. Interface sync visualization
 * 4. Real-time topic updates
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webUIExtension = exports.WebUIExtension = exports.activeTopicAtom = exports.interfaceSyncAtom = exports.discordStatusAtom = exports.topicsAtom = void 0;
exports.useWebUIExtension = useWebUIExtension;
const jotai_1 = require("jotai");
const sync_manager_1 = require("./sync-manager");
const registry_1 = __importDefault(require("../topics/registry"));
// Atoms for state management
exports.topicsAtom = (0, jotai_1.atom)([]);
exports.discordStatusAtom = (0, jotai_1.atom)({
    isConnected: false,
    channels: 0,
    activeTopics: 0,
    uptime: 0,
    lastActivity: new Date().toISOString(),
});
exports.interfaceSyncAtom = (0, jotai_1.atom)({
    discord: false,
    web: true,
    cli: false,
    lastSync: new Date().toISOString(),
    syncCount: 0,
});
exports.activeTopicAtom = (0, jotai_1.atom)(null);
/**
 * Web UI Extension Manager
 */
class WebUIExtension {
    constructor() {
        this.discordWebSocket = null;
        this.topicRegistry = new registry_1.default();
        this.syncManager = new sync_manager_1.InterfaceSyncManager();
    }
    /**
     * Initialize Web UI extension
     */
    async initialize() {
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
    connectToDiscordWebSocket() {
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
        }
        catch (error) {
            console.error('[WebUIExtension] Failed to connect to Discord WebSocket:', error);
        }
    }
    /**
     * Handle Discord WebSocket messages
     */
    handleDiscordMessage(message) {
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
    updateDiscordStatus(data) {
        // Update atom with new status
        // This would integrate with your existing state management
        console.log('[WebUIExtension] Updated Discord status:', data);
    }
    /**
     * Handle incoming Discord response
     */
    handleIncomingResponse(data) {
        // Sync to other interfaces via sync manager
        this.syncManager.syncMessage({
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
                discord_message_count: (this.getTopic(data.topic)?.messageCount || 0) + 1,
            });
        }
    }
    /**
     * Start sync monitoring
     */
    startSyncMonitoring() {
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
    async updateInterfaceSyncStatus() {
        const syncStatus = this.syncManager.getSyncStatus();
        // Update atom with sync status
        console.log('[WebUIExtension] Updated sync status:', syncStatus);
    }
    /**
     * Get all topics for Web UI
     */
    async getTopics() {
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
    async getTopic(topicId) {
        const topic = this.topicRegistry.getTopicByName(topicId);
        if (!topic)
            return null;
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
    async createTopic(name, description) {
        const topic = this.topicRegistry.createTopic(name, {
            description,
            created_from: 'web_ui',
        });
        // Sync to other interfaces
        this.syncManager.syncTopicCreation(topic.id, topic.config.name);
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
    async mapTopicToDiscord(topicId, discordChannelId) {
        // Update topic config
        const topic = this.topicRegistry.getTopicByName(topicId);
        if (!topic)
            throw new Error(`Topic not found: ${topicId}`);
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
        this.syncManager.syncTopicMapping(topicId, discordChannelId);
    }
    /**
     * Send message from Web UI to topic
     */
    async sendMessage(topicId, content) {
        const topic = this.topicRegistry.getTopicByName(topicId);
        if (!topic)
            throw new Error(`Topic not found: ${topicId}`);
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
            content,
            response: '', // Would be populated by response
            topic: topicId,
            interface: 'web',
            userId: 'web_ui_user',
            channelId: 'web_ui',
            timestamp: Date.now(),
        });
        // Update topic progress
        this.topicRegistry.updateTopicProgress(topicId, {
            last_update: new Date().toISOString(),
            web_message_count: (topic.progress?.web_message_count || 0) + 1,
        });
    }
    /**
     * Get interface count for topic
     */
    getTopicInterfaceCount(topicId) {
        const topic = this.topicRegistry.getTopicByName(topicId);
        if (!topic)
            return 0;
        let count = 1; // Always has Web UI
        if (topic.config.discord_channel_id)
            count++; // Discord
        // Add CLI if active
        return count;
    }
    /**
     * Get Discord status
     */
    async getDiscordStatus() {
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
    async getInterfaceSyncStatus() {
        const status = this.syncManager.getSyncStatus();
        return {
            discord: status.discord_connected || false,
            web: true, // Web UI is always connected to itself
            cli: false, // Would check CLI status
            lastSync: status.last_sync || new Date().toISOString(),
            syncCount: status.total_syncs || 0,
        };
    }
    /**
     * Get start time for uptime calculation
     */
    getStartTime() {
        // This would track when the system started
        return Date.now() - 3600000; // 1 hour ago for demo
    }
    /**
     * Cleanup on page unload
     */
    cleanup() {
        if (this.discordWebSocket) {
            this.discordWebSocket.close();
            this.discordWebSocket = null;
        }
        console.log('[WebUIExtension] Cleaned up');
    }
}
exports.WebUIExtension = WebUIExtension;
// Export singleton instance
exports.webUIExtension = new WebUIExtension();
// Export React hook for convenience
function useWebUIExtension() {
    return {
        initialize: exports.webUIExtension.initialize.bind(exports.webUIExtension),
        getTopics: exports.webUIExtension.getTopics.bind(exports.webUIExtension),
        createTopic: exports.webUIExtension.createTopic.bind(exports.webUIExtension),
        sendMessage: exports.webUIExtension.sendMessage.bind(exports.webUIExtension),
        getDiscordStatus: exports.webUIExtension.getDiscordStatus.bind(exports.webUIExtension),
        getInterfaceSyncStatus: exports.webUIExtension.getInterfaceSyncStatus.bind(exports.webUIExtension),
        mapTopicToDiscord: exports.webUIExtension.mapTopicToDiscord.bind(exports.webUIExtension),
        cleanup: exports.webUIExtension.cleanup.bind(exports.webUIExtension),
    };
}
// Export for use in React components
exports.default = exports.webUIExtension;
