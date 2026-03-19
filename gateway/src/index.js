/**
 * WZRD.dev Redesign Gateway
 * Central sync hub for Discord, Web UI, and CLI interfaces
 * 
 * Features:
 * - Multi-interface session management
 * - Real-time topic sync
 * - Message routing between interfaces
 * - Activity tracking and metrics
 */

import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { readFileSync, watch } from 'fs';
import { join } from 'path';

// Configuration
const PORT = process.env.GATEWAY_PORT || 8765;
const TOPICS_FILE = join(process.cwd(), '../topics/data/topics.json');
const SYNC_STATE_FILE = join(process.cwd(), '../interfaces/sync-state.json');

// Gateway State
const state = {
  startTime: Date.now(),
  requestsTotal: 0,
  requestsToday: 0,
  lastReset: new Date().toDateString(),
  activeSessions: new Map(), // sessionId -> Session
  interfaceConnections: new Map(), // ws -> InterfaceConnection
  activityLog: [],
  metrics: {
    uptime: 0,
    latency: [],
    errors: 0,
  }
};

// Session represents a conversation topic across all interfaces
class Session {
  constructor(topicId, topicData) {
    this.id = topicId;
    this.topicData = topicData;
    this.participants = new Set(); // Interface connections
    this.messageHistory = [];
    this.lastActivity = Date.now();
  }
}

// Interface connection tracking
class InterfaceConnection {
  constructor(ws, type, sessionId) {
    this.ws = ws;
    this.type = type; // 'discord', 'web', 'cli'
    this.sessionId = sessionId;
    this.id = uuidv4();
    this.connectedAt = Date.now();
  }
}

// Load topics from framework
function loadTopics() {
  try {
    const data = readFileSync(TOPICS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load topics:', error.message);
    return { topics: [] };
  }
}

// Track activity
function trackActivity(type, data) {
  const entry = {
    timestamp: Date.now(),
    type,
    data
  };
  
  state.activityLog.unshift(entry);
  if (state.activityLog.length > 100) {
    state.activityLog = state.activityLog.slice(0, 100);
  }
  
  // Broadcast to all connected interfaces
  broadcast({
    type: 'activity',
    payload: entry
  });
}

// Broadcast message to all connections
function broadcast(message, excludeWs = null) {
  const messageStr = JSON.stringify(message);
  state.interfaceConnections.forEach((conn, ws) => {
    if (ws !== excludeWs && ws.readyState === 1) { // WebSocket.OPEN
      ws.send(messageStr);
    }
  });
}

// Send to specific session
function sendToSession(sessionId, message) {
  state.interfaceConnections.forEach((conn, ws) => {
    if (conn.sessionId === sessionId && ws.readyState === 1) {
      ws.send(JSON.stringify(message));
    }
  });
}

// Create WebSocket Server
const wss = new WebSocketServer({ port: PORT });

console.log(`🚀 WZRD.dev Gateway starting on port ${PORT}...`);

wss.on('connection', (ws, req) => {
  const connectionId = uuidv4();
  console.log(`🔗 New connection: ${connectionId} from ${req.socket.remoteAddress}`);
  
  const connection = new InterfaceConnection(ws, 'unknown', null);
  state.interfaceConnections.set(ws, connection);
  
  // Send initial state
  const initialData = {
    type: 'init',
    payload: {
      connectionId,
      topics: loadTopics().topics,
      activeSessions: state.activeSessions.size,
      uptime: Math.floor((Date.now() - state.startTime) / 1000)
    }
  };
  
  ws.send(JSON.stringify(initialData));
  
  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      await handleMessage(ws, connection, message);
    } catch (error) {
      console.error('Message handling error:', error);
      ws.send(JSON.stringify({ type: 'error', error: error.message }));
    }
  });
  
  ws.on('close', () => {
    console.log(`🔌 Connection closed: ${connectionId}`);
    state.interfaceConnections.delete(ws);
    trackActivity('disconnect', { connectionId, type: connection.type });
  });
  
  ws.on('error', (error) => {
    console.error(`Connection error ${connectionId}:`, error);
  });
});

// Message handler
async function handleMessage(ws, connection, message) {
  const { type, payload } = message;
  
  state.requestsTotal++;
  if (state.lastReset !== new Date().toDateString()) {
    state.requestsToday = 0;
    state.lastReset = new Date().toDateString();
  }
  state.requestsToday++;
  
  switch (type) {
    case 'register': {
      // Register interface connection
      connection.type = payload?.type || 'unknown';
      connection.sessionId = payload?.sessionId || null;
      
      if (payload?.sessionId) {
        if (!state.activeSessions.has(payload.sessionId)) {
          const topics = loadTopics().topics;
          const topic = topics.find(t => t.id === payload.sessionId);
          if (topic) {
            state.activeSessions.set(payload.sessionId, new Session(payload.sessionId, topic));
          }
        }
        state.activeSessions.get(payload.sessionId)?.participants.add(connection);
      }
      
      ws.send(JSON.stringify({
        type: 'registered',
        payload: {
          connectionId: connection.id,
          type: connection.type,
          sessionId: connection.sessionId
        }
      }));
      
      trackActivity('register', { type: connection.type, sessionId: connection.sessionId });
      break;
    }
    
    case 'message': {
      // Route message to session participants
      if (connection.sessionId) {
        const session = state.activeSessions.get(connection.sessionId);
        if (session) {
          session.messageHistory.push({
            timestamp: Date.now(),
            content: payload?.content,
            from: connection.type
          });
          
          // Broadcast to all session participants
          sendToSession(connection.sessionId, {
            type: 'message',
            payload: {
              content: payload?.content,
              from: connection.type,
              timestamp: Date.now()
            }
          });
          
          trackActivity('message', { 
            sessionId: connection.sessionId, 
            from: connection.type,
            content: payload?.content?.substring(0, 100)
          });
        }
      }
      break;
    }
    
    case 'switch_topic': {
      // Switch to different topic/session
      const newSessionId = payload?.sessionId;
      
      if (connection.sessionId) {
        state.activeSessions.get(connection.sessionId)?.participants.delete(connection);
      }
      
      connection.sessionId = newSessionId;
      
      if (newSessionId && !state.activeSessions.has(newSessionId)) {
        const topics = loadTopics().topics;
        const topic = topics.find(t => t.id === newSessionId);
        if (topic) {
          state.activeSessions.set(newSessionId, new Session(newSessionId, topic));
        }
      }
      
      state.activeSessions.get(newSessionId)?.participants.add(connection);
      
      ws.send(JSON.stringify({
        type: 'topic_switched',
        payload: { sessionId: newSessionId }
      }));
      
      trackActivity('topic_switch', { 
        from: connection.type, 
        to: newSessionId 
      });
      break;
    }
    
    case 'get_metrics': {
      // Send current metrics
      ws.send(JSON.stringify({
        type: 'metrics',
        payload: getMetrics()
      }));
      break;
    }
    
    case 'get_activity': {
      // Send activity data
      ws.send(JSON.stringify({
        type: 'activity',
        payload: {
          activity: getActivityData(),
          activityLog: state.activityLog.slice(0, 20)
        }
      }));
      break;
    }
    
    case 'get_topics': {
      // Send current topics
      ws.send(JSON.stringify({
        type: 'topics',
        payload: loadTopics()
      }));
      break;
    }
    
    default:
      console.log('Unknown message type:', type);
  }
}

// Get metrics
function getMetrics() {
  const uptime = Date.now() - state.startTime;
  return {
    uptime: formatUptime(uptime),
    requests: {
      today: state.requestsToday,
      total: state.requestsTotal
    },
    activeSessions: state.activeSessions.size,
    connections: state.interfaceConnections.size,
    latency: state.metrics.latency.length > 0 
      ? Math.round(state.metrics.latency.reduce((a, b) => a + b, 0) / state.metrics.latency.length)
      : 0
  };
}

// Get activity data for charts
function getActivityData() {
  const now = new Date();
  const days = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
    
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const dayEnd = dayStart + (24 * 60 * 60 * 1000);
    
    const count = state.activityLog.filter(a => {
      return a.timestamp >= dayStart && a.timestamp < dayEnd;
    }).length;
    
    days.push({ day: dayStr, count });
  }
  
  return days;
}

// Helper: Format uptime
function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  return `${minutes}m ${seconds % 60}s`;
}

// Watch topics file for changes
try {
  const topicsDir = join(process.cwd(), '../topics/data');
  watch(topicsDir, { recursive: false }, (eventType, filename) => {
    if (filename === 'topics.json') {
      console.log('📝 Topics file changed, broadcasting update...');
      broadcast({
        type: 'topics_updated',
        payload: loadTopics()
      });
    }
  });
} catch (error) {
  console.error('Failed to watch topics file:', error.message);
}

// Heartbeat
setInterval(() => {
  const heartbeat = {
    type: 'heartbeat',
    payload: {
      timestamp: Date.now(),
      uptime: formatUptime(Date.now() - state.startTime),
      connections: state.interfaceConnections.size,
      sessions: state.activeSessions.size
    }
  };
  
  broadcast(heartbeat);
}, 30000); // Every 30 seconds

console.log(`✅ WZRD.dev Gateway running on port ${PORT}`);
console.log(`   Topics loaded: ${loadTopics().topics.length}`);
console.log(`   Ready for connections from Discord, Web UI, and CLI`);
