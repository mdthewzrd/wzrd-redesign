/**
 * WZRD.dev HTTP Gateway V2 with Session Management
 * 
 * Enhanced features:
 * - Session tracking with auto-compression
 * - Token usage monitoring
 * - Session cleanup API
 * - Agent pool coordination
 * 
 * Backward compatible with Discord bot
 */

import { createServer } from 'http';
import { WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import { join } from 'path';

const HTTP_PORT = process.env.HTTP_GATEWAY_PORT || 18801;
const WS_GATEWAY_URL = process.env.WS_GATEWAY_URL || 'ws://127.0.0.1:8765';
const SESSION_DB_PATH = process.env.SESSION_DB_PATH || '/tmp/gateway-sessions.db';

// Session database (in-memory with periodic save)
const sessionDB = {
  sessions: new Map(), // sessionId -> Session
  messageCounts: new Map(), // sessionId -> count
  characterCounts: new Map(), // sessionId -> total characters
  userCharacters: new Map(), // sessionId -> user characters
  aiCharacters: new Map(), // sessionId -> AI characters
  lastCompression: new Map(), // sessionId -> timestamp
};

// Session class
class Session {
  constructor(sessionId, userId, platform = 'unknown', topic = 'general') {
    this.sessionId = sessionId;
    this.userId = userId;
    this.platform = platform;
    this.topic = topic;
    this.createdAt = Date.now();
    this.lastActivity = Date.now();
    this.messageCount = 0;
    this.totalCharacters = 0;
    this.userCharacters = 0;
    this.aiCharacters = 0;
    this.conversationHistory = [];
    this.compressed = false;
    this.compressedAt = null;
    this.compressedSummary = '';
  }

  addMessage(role, content) {
    this.messageCount++;
    this.lastActivity = Date.now();
    this.totalCharacters += content.length;
    
    // Track character counts by role
    if (role === 'user') {
      this.userCharacters += content.length;
    } else {
      this.aiCharacters += content.length;
    }
    
    // Update session DB with REAL metrics
    sessionDB.messageCounts.set(this.sessionId, this.messageCount);
    sessionDB.characterCounts.set(this.sessionId, this.totalCharacters);
    sessionDB.userCharacters.set(this.sessionId, this.userCharacters);
    sessionDB.aiCharacters.set(this.sessionId, this.aiCharacters);
    
    this.conversationHistory.push({
      role,
      content: content.substring(0, 500), // Store truncated version
      timestamp: Date.now(),
      messageId: uuidv4()
    });
    
    // Auto-compress if needed
    if (this.shouldCompress()) {
      this.compress();
    }
  }

  shouldCompress() {
    // Compress based on REAL metrics:
    // 1. More than 50 messages
    // 2. More than 10,000 characters
    // 3. Older than 1 hour
    const age = Date.now() - this.createdAt;
    return this.messageCount > 50 || 
           this.totalCharacters > 10000 || 
           age > 3600000;
  }

  compress() {
    if (this.compressed) return;
    
    console.log(`🔍 Compressing session ${this.sessionId.substring(0, 8)}...`);
    
    // Create summary of conversation
    const summary = this.createSummary();
    this.compressedSummary = summary;
    this.compressed = true;
    this.compressedAt = Date.now();
    
    // Clear detailed history but keep summary
    this.conversationHistory = [
      {
        role: 'system',
        content: `[COMPRESSED SESSION] Summary: ${summary}`,
        timestamp: Date.now(),
        messageId: 'compressed-summary'
      }
    ];
    
    console.log(`✅ Session ${this.sessionId.substring(0, 8)} compressed (${this.messageCount} messages, ${this.totalCharacters} chars)`);
  }

  createSummary() {
    // Extract key points from conversation
    const userMessages = this.conversationHistory
      .filter(m => m.role === 'user')
      .map(m => m.content.substring(0, 200));
    
    const assistantMessages = this.conversationHistory
      .filter(m => m.role === 'assistant')
      .map(m => m.content.substring(0, 200));
    
    return `Session with ${this.userId} on ${this.platform} about ${this.topic}. ` +
           `${this.messageCount} messages exchanged. ` +
           `Key topics: ${userMessages.slice(0, 3).join(', ')}`;
  }

  toJSON() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      platform: this.platform,
      topic: this.topic,
      createdAt: this.createdAt,
      lastActivity: this.lastActivity,
      messageCount: this.messageCount,
      totalCharacters: this.totalCharacters,
      userCharacters: this.userCharacters,
      aiCharacters: this.aiCharacters,
      compressed: this.compressed,
      compressedAt: this.compressedAt,
      compressedSummary: this.compressedSummary,
      conversationLength: this.conversationHistory.length
    };
  }
}

// Session Manager
const sessionManager = {
  getSession(sessionId, userId, platform, topic) {
    let session = sessionDB.sessions.get(sessionId);
    
    if (!session) {
      session = new Session(sessionId, userId, platform, topic);
      sessionDB.sessions.set(sessionId, session);
      sessionDB.messageCounts.set(sessionId, 0);
      sessionDB.characterCounts.set(sessionId, 0);
      sessionDB.userCharacters.set(sessionId, 0);
      sessionDB.aiCharacters.set(sessionId, 0);
      console.log(`🆕 Created session ${sessionId.substring(0, 8)} for ${userId} on ${platform}`);
    }
    
    return session;
  },

  cleanupOldSessions(maxAgeHours = 1) {
    const cutoff = Date.now() - (maxAgeHours * 3600000);
    let removed = 0;
    
    for (const [sessionId, session] of sessionDB.sessions) {
      if (session.lastActivity < cutoff) {
        sessionDB.sessions.delete(sessionId);
        sessionDB.messageCounts.delete(sessionId);
        sessionDB.characterCounts.delete(sessionId);
        sessionDB.userCharacters.delete(sessionId);
        sessionDB.aiCharacters.delete(sessionId);
        removed++;
        console.log(`🗑️  Removed old session ${sessionId.substring(0, 8)} (inactive for ${maxAgeHours}h)`);
      }
    }
    
    return removed;
  },

  getStats() {
    return {
      totalSessions: sessionDB.sessions.size,
      totalMessages: Array.from(sessionDB.messageCounts.values()).reduce((a, b) => a + b, 0),
      totalCharacters: Array.from(sessionDB.characterCounts.values()).reduce((a, b) => a + b, 0),
      userCharacters: Array.from(sessionDB.userCharacters.values()).reduce((a, b) => a + b, 0),
      aiCharacters: Array.from(sessionDB.aiCharacters.values()).reduce((a, b) => a + b, 0),
      compressedSessions: Array.from(sessionDB.sessions.values()).filter(s => s.compressed).length,
      oldestSession: sessionDB.sessions.size > 0 ? 
        Math.min(...Array.from(sessionDB.sessions.values()).map(s => s.createdAt)) : null
    };
  }
};

// HTTP Gateway State
const httpState = {
  startTime: Date.now(),
  requestsTotal: 0,
  activeConversations: new Map(),
  wsConnections: new Map(),
  sessionManager
};

// Connect to WebSocket Gateway
function connectToWebSocketGateway() {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(WS_GATEWAY_URL);
    
    ws.on('open', () => {
      console.log(`✅ Connected to WebSocket Gateway at ${WS_GATEWAY_URL}`);
      
      ws.send(JSON.stringify({
        type: 'register',
        payload: {
          type: 'http_gateway_v2',
          sessionId: 'http_gateway_v2_bridge',
          version: '2.0',
          features: ['session_tracking', 'auto_compression', 'cleanup_api']
        }
      }));
      
      httpState.wsConnections.set(ws, {
        id: uuidv4(),
        connectedAt: Date.now(),
        type: 'http_gateway_v2',
        version: '2.0'
      });
      
      resolve(ws);
    });
    
    ws.on('error', reject);
    ws.on('close', () => {
      console.log('❌ WebSocket connection closed');
      httpState.wsConnections.delete(ws);
    });
  });
}

// Create HTTP server
const server = createServer(async (req, res) => {
  httpState.requestsTotal++;
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Parse URL
  const url = new URL(req.url, `http://${req.headers.host}`);
  
  try {
    // Route requests
    if (req.method === 'POST' && url.pathname === '/gateway') {
      await handleGatewayRequest(req, res);
    } 
    else if (req.method === 'GET' && url.pathname === '/sessions') {
      await handleSessionsAPI(req, res, url);
    }
    else if (req.method === 'POST' && url.pathname === '/sessions/cleanup') {
      await handleSessionCleanup(req, res);
    }
    else if (req.method === 'POST' && url.pathname === '/sessions/compress') {
      await handleSessionCompress(req, res);
    }
    else if (req.method === 'POST' && url.pathname === '/agent/register') {
      await handleAgentRegister(req, res);
    }
    else if (req.method === 'GET' && url.pathname === '/agent/pool') {
      await handleAgentPool(req, res);
    }
    else if (req.method === 'POST' && url.pathname === '/agent/task') {
      await handleAgentTask(req, res);
    }
    else if (req.method === 'GET' && url.pathname === '/agent/status') {
      await handleAgentStatus(req, res, url);
    }
    else if (req.method === 'GET' && url.pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'healthy',
        uptime: Date.now() - httpState.startTime,
        requests: httpState.requestsTotal,
        sessions: sessionManager.getStats(),
        wsConnections: httpState.wsConnections.size
      }));
    }
    else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500);
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
});

// Handle Gateway requests (backward compatible)
async function handleGatewayRequest(req, res) {
  let body = '';
  
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', async () => {
    try {
      const request = JSON.parse(body);
      const { method, params, id } = request;
      
      if (method !== 'gateway.chat') {
        res.writeHead(400);
        res.end(JSON.stringify({ 
          error: { code: -32601, message: 'Method not found' },
          id 
        }));
        return;
      }
      
      const { prompt, userId, platform = 'unknown', topic = 'general', conversationId, botId = 'remi' } = params;
      
      // Create or get session
      const sessionId = conversationId || `${userId}-${platform}-${Date.now()}`;
      const session = sessionManager.getSession(sessionId, userId, platform, topic);
      
      // Track user message
      session.addMessage('user', prompt);
      
      // Get AI response from NVIDIA API
      const aiResponse = await getAIResponse(prompt, topic, botId, sessionId, session);
      
      // Track assistant response
      session.addMessage('assistant', aiResponse.response);
      
      // Send HTTP response
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        result: {
          response: aiResponse.response,
          conversationId: sessionId,
          sessionStats: {
            messageCount: session.messageCount,
            estimatedTokens: session.estimatedTokens,
            compressed: session.compressed
          }
        },
        id: id || uuidv4()
      }));
      
    } catch (error) {
      console.error('Request error:', error);
      res.writeHead(400);
      res.end(JSON.stringify({ 
        error: { code: -32700, message: 'Parse error' },
        id: 'parse-error'
      }));
    }
  });
}

// Get AI response from NVIDIA NIM API
async function getAIResponse(prompt, topic, botId, conversationId, session) {
  const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
  const NVIDIA_API_BASE = process.env.NVIDIA_API_BASE || 'https://integrate.api.nvidia.com/v1';
  
  if (!NVIDIA_API_KEY) {
    console.warn('⚠️ NVIDIA_API_KEY not set, using mock response');
    return createMockAgentResponse(prompt, topic, botId, session);
  }
  
  try {
    console.log(`🤖 Calling NVIDIA NIM API for topic "${topic}"${conversationId ? ` (conversation: ${conversationId.slice(0, 8)}...)` : ''}...`);
    
    // Build messages array with conversation history from session
    const messages = [
      {
        role: 'system',
        content: `You are Remi, the WZRD.dev agent. Session context:
                 User: ${session.userId}
                 Platform: ${session.platform}
                 Topic: ${topic}
                 Messages exchanged: ${session.messageCount}
                 
                 Be helpful, technical, and concise. Format responses for Discord (use markdown sparingly).`,
      }
    ];
    
    // Add conversation history from session
    if (session.conversationHistory.length > 1) {
      // Get last 5 message pairs for context
      const recentHistory = session.conversationHistory.slice(-10);
      for (const msg of recentHistory) {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      }
    } else {
      // Just current prompt
      messages.push({ role: 'user', content: prompt });
    }
    
    const response = await fetch(`${NVIDIA_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-ai/deepseek-v3.2',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
        stream: false,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('NVIDIA API error:', response.status, errorText);
      throw new Error(`NVIDIA API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract response text
    const aiResponse = data.choices[0]?.message?.content || 'No response from AI';
    
    // Get token usage from response
    const promptTokens = data.usage?.prompt_tokens || Math.floor(prompt.length / 4);
    const responseTokens = data.usage?.completion_tokens || Math.floor(aiResponse.length / 4);
    const totalTokens = promptTokens + responseTokens;
    
    return {
      response: aiResponse,
      model: 'deepseek-v3.2',
      tokens: totalTokens,
    };
    
  } catch (error) {
    console.error('Failed to call NVIDIA API:', error.message);
    return createMockAgentResponse(prompt, topic, botId, session);
  }
}

// Create mock agent response for fallback
function createMockAgentResponse(prompt, topic, botId, session) {
  const responses = {
    remi: [
      `I'm Remi from WZRD.dev! Session with ${session.userId} on ${session.platform} about "${topic}": ${prompt}\n\n*Note: Gateway V2 session tracking active (${session.messageCount} messages)*`,
      `Topic: ${topic}\nPlatform: ${session.platform}\nMessages: ${session.messageCount}\n\n🔧 Gateway V2 with session management active`,
      `🤖 Would be real DeepSeek V3.2 response about ${topic}. Session ID: ${session.sessionId.slice(0, 8)}...`
    ],
    default: [
      `Mock response for "${topic}": ${prompt}\n\nSession tracking active with ${session.messageCount} messages`
    ]
  };
  
  const botResponses = responses[botId] || responses.default;
  const response = botResponses[Math.floor(Math.random() * botResponses.length)];
  
  return {
    response,
    model: 'mock-fallback',
    tokens: Math.floor(prompt.length / 4) + Math.floor(response.length / 4),
  };
}

// Session management API
async function handleSessionsAPI(req, res, url) {
  const stats = sessionManager.getStats();
  const sessions = Array.from(sessionDB.sessions.values()).map(s => s.toJSON());
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    stats,
    sessions,
    timestamp: Date.now()
  }));
}

async function handleSessionCleanup(req, res) {
  const maxAge = req.headers['x-max-age-hours'] || 1;
  const removed = sessionManager.cleanupOldSessions(parseInt(maxAge));
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    removed,
    maxAgeHours: maxAge,
    remainingSessions: sessionDB.sessions.size,
    timestamp: Date.now()
  }));
}

async function handleSessionCompress(req, res) {
  let body = '';
  
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', () => {
    try {
      const { sessionId } = JSON.parse(body);
      const session = sessionDB.sessions.get(sessionId);
      
      if (!session) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Session not found' }));
        return;
      }
      
      session.compress();
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        sessionId,
        compressed: session.compressed,
        compressedAt: session.compressedAt,
        messageCount: session.messageCount,
        estimatedTokens: session.estimatedTokens,
        compressedSummary: session.compressedSummary
      }));
    } catch (error) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Invalid request' }));
    }
  });
}

// Agent pool state
const agentPool = {
  agents: new Map(), // agentId -> Agent
  tasks: new Map(), // taskId -> Task
  taskQueue: [],
};

class Agent {
  constructor(agentId, agentType, capabilities) {
    this.agentId = agentId;
    this.agentType = agentType;
    this.capabilities = capabilities;
    this.status = 'idle';
    this.lastHeartbeat = Date.now();
    this.activeTask = null;
    this.createdAt = Date.now();
  }

  updateStatus(status, taskId = null) {
    this.status = status;
    this.activeTask = taskId;
    this.lastHeartbeat = Date.now();
  }

  isAlive() {
    return Date.now() - this.lastHeartbeat < 30000; // 30 seconds
  }
}

class Task {
  constructor(taskId, taskType, prompt, priority = 'normal') {
    this.taskId = taskId;
    this.taskType = taskType;
    this.prompt = prompt;
    this.priority = priority;
    this.status = 'pending';
    this.assignedTo = null;
    this.createdAt = Date.now();
    this.completedAt = null;
    this.result = null;
  }
}

// Helper function to parse request body
async function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

// Agent registration
async function handleAgentRegister(req, res) {
  try {
    const body = await parseRequestBody(req);
    const { agentId, agentType, capabilities } = body;

    if (!agentId || !agentType) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Missing agentId or agentType' }));
    }

    const agent = new Agent(agentId, agentType, capabilities || []);
    agentPool.agents.set(agentId, agent);

    console.log(`[AgentPool] Registered agent: ${agentId} (${agentType})`);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      success: true, 
      agentId,
      message: `Agent ${agentId} registered successfully`
    }));
  } catch (error) {
    console.error('Agent registration error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}

// Get agent pool status
async function handleAgentPool(req, res) {
  const agents = Array.from(agentPool.agents.values())
    .filter(agent => agent.isAlive())
    .map(agent => ({
      agentId: agent.agentId,
      agentType: agent.agentType,
      status: agent.status,
      capabilities: agent.capabilities,
      lastHeartbeat: agent.lastHeartbeat,
      activeTask: agent.activeTask,
      uptime: Date.now() - agent.createdAt
    }));

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    success: true,
    agents,
    totalAgents: agents.length,
    idleAgents: agents.filter(a => a.status === 'idle').length,
    busyAgents: agents.filter(a => a.status === 'busy').length
  }));
}

// Submit task to agent pool
async function handleAgentTask(req, res) {
  try {
    const body = await parseRequestBody(req);
    const { taskType, prompt, priority = 'normal', agentType } = body;

    if (!taskType || !prompt) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Missing taskType or prompt' }));
    }

    const taskId = uuidv4();
    const task = new Task(taskId, taskType, prompt, priority);
    agentPool.tasks.set(taskId, task);
    agentPool.taskQueue.push(taskId);

    console.log(`[AgentPool] Task created: ${taskId} (${taskType})`);

    // Try to assign to idle agent
    assignTasks();

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      success: true,
      taskId,
      status: task.status,
      message: `Task ${taskId} queued successfully`
    }));
  } catch (error) {
    console.error('Task submission error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}

// Get agent/task status
async function handleAgentStatus(req, res, url) {
  const urlParams = new URLSearchParams(url.search);
  const agentId = urlParams.get('agentId');
  const taskId = urlParams.get('taskId');

  if (agentId) {
    const agent = agentPool.agents.get(agentId);
    if (!agent) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Agent not found' }));
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      agentId: agent.agentId,
      agentType: agent.agentType,
      status: agent.status,
      capabilities: agent.capabilities,
      lastHeartbeat: agent.lastHeartbeat,
      activeTask: agent.activeTask,
      isAlive: agent.isAlive()
    }));
  } else if (taskId) {
    const task = agentPool.tasks.get(taskId);
    if (!task) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Task not found' }));
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      taskId: task.taskId,
      taskType: task.taskType,
      status: task.status,
      assignedTo: task.assignedTo,
      createdAt: task.createdAt,
      completedAt: task.completedAt,
      result: task.result
    }));
  } else {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Missing agentId or taskId parameter' }));
  }
}

// Assign tasks to idle agents
function assignTasks() {
  // Get idle agents
  const idleAgents = Array.from(agentPool.agents.values())
    .filter(agent => agent.status === 'idle' && agent.isAlive());

  // Get pending tasks
  const pendingTasks = agentPool.taskQueue
    .filter(taskId => {
      const task = agentPool.tasks.get(taskId);
      return task && task.status === 'pending';
    });

  // Simple round-robin assignment
  for (let i = 0; i < Math.min(idleAgents.length, pendingTasks.length); i++) {
    const agent = idleAgents[i];
    const taskId = pendingTasks[i];
    const task = agentPool.tasks.get(taskId);

    if (task && agent) {
      task.status = 'assigned';
      task.assignedTo = agent.agentId;
      agent.updateStatus('busy', taskId);

      console.log(`[AgentPool] Task ${taskId} assigned to agent ${agent.agentId}`);
    }
  }
}

// Cleanup dead agents periodically
setInterval(() => {
  const deadAgents = Array.from(agentPool.agents.values())
    .filter(agent => !agent.isAlive());

  deadAgents.forEach(agent => {
    console.log(`[AgentPool] Removing dead agent: ${agent.agentId}`);
    agentPool.agents.delete(agent.agentId);
  });
}, 60000); // Every minute

// Start HTTP server
server.listen(HTTP_PORT, () => {
  console.log(`🚀 HTTP Gateway V2 running on port ${HTTP_PORT}`);
  console.log(`   Endpoint: http://127.0.0.1:${HTTP_PORT}/gateway`);
  console.log(`   Session API: http://127.0.0.1:${HTTP_PORT}/sessions`);
  console.log(`   Health: http://127.0.0.1:${HTTP_PORT}/health`);
  console.log(`   Agent Pool: http://127.0.0.1:${HTTP_PORT}/agent/pool`);
  console.log(`   Forwarding to: ${WS_GATEWAY_URL}`);
  
  // Connect to WebSocket Gateway
  connectToWebSocketGateway().catch(error => {
    console.error('Failed to connect to WebSocket Gateway:', error.message);
    console.log('⚠️  HTTP Gateway V2 will run, but WebSocket forwarding will fail');
  });
  
  // Auto-cleanup every 5 minutes
  setInterval(() => {
    const removed = sessionManager.cleanupOldSessions();
    if (removed > 0) {
      console.log(`🧹 Auto-cleaned ${removed} old sessions`);
    }
  }, 300000);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down HTTP Gateway V2...');
  
  httpState.wsConnections.forEach((meta, ws) => {
    ws.close();
  });
  
  server.close(() => {
    console.log('✅ HTTP Gateway V2 stopped');
    process.exit(0);
  });
});

export { server, httpState, sessionManager, connectToWebSocketGateway };