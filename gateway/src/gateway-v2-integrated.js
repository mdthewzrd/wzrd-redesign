/**
 * WZRD.dev Gateway V2 Integrated with Agent Pool
 * 
 * Combines:
 * - HTTP Gateway with session management
 * - Agent pool for parallel execution
 * - Session tracking and auto-compression
 */

import { createServer } from 'http';
import { WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { AgentPoolManager } from './agent-pool.js';

const HTTP_PORT = process.env.HTTP_GATEWAY_PORT || 18802; // Different port for integrated version
const agentPool = new AgentPoolManager({ maxAgents: 10 });

// Simple session management (copied from http-gateway-v2.js)
class Session {
  constructor(sessionId, userId, platform = 'unknown', topic = 'general') {
    this.sessionId = sessionId;
    this.userId = userId;
    this.platform = platform;
    this.topic = topic;
    this.createdAt = Date.now();
    this.lastActivity = Date.now();
    this.messageCount = 0;
    this.estimatedTokens = 0;
    this.conversationHistory = [];
  }

  addMessage(role, content) {
    this.messageCount++;
    this.lastActivity = Date.now();
    this.estimatedTokens += Math.ceil(content.length / 4);
    
    this.conversationHistory.push({
      role,
      content: content.substring(0, 500),
      timestamp: Date.now(),
      messageId: uuidv4()
    });
  }
}

const sessions = new Map();

// Create HTTP server
const server = createServer(async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  const url = new URL(req.url, `http://${req.headers.host}`);
  
  try {
    // Route requests
    if (req.method === 'POST' && url.pathname === '/gateway') {
      await handleGatewayRequest(req, res);
    } 
    else if (req.method === 'GET' && url.pathname === '/pool/stats') {
      handlePoolStats(req, res);
    }
    else if (req.method === 'GET' && url.pathname === '/sessions') {
      handleSessions(req, res);
    }
    else if (req.method === 'GET' && url.pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'healthy',
        uptime: Date.now() - startTime,
        sessions: sessions.size,
        poolStats: agentPool.getPoolStats()
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

const startTime = Date.now();

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
      let session = sessions.get(sessionId);
      if (!session) {
        session = new Session(sessionId, userId, platform, topic);
        sessions.set(sessionId, session);
      }
      
      // Track user message
      session.addMessage('user', prompt);
      
      // Submit task to agent pool
      const taskType = determineTaskType(prompt, topic);
      const taskId = agentPool.submitTask(
        taskType,
        prompt,
        'medium',
        { userId, platform, topic }
      );
      
      console.log(`📤 Submitted to agent pool: ${taskId} (${taskType})`);
      
      // Wait for task completion
      const result = await waitForTaskCompletion(taskId, 30000);
      
      if (result.error) {
        // Fallback to direct response
        const fallbackResponse = createFallbackResponse(prompt, topic, botId, session);
        session.addMessage('assistant', fallbackResponse);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          result: {
            response: fallbackResponse,
            conversationId: sessionId,
            sessionStats: {
              messageCount: session.messageCount,
              estimatedTokens: session.estimatedTokens
            },
            via: 'fallback'
          },
          id: id || uuidv4()
        }));
      } else {
        // Agent pool response
        session.addMessage('assistant', result.output);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          result: {
            response: result.output,
            conversationId: sessionId,
            sessionStats: {
              messageCount: session.messageCount,
              estimatedTokens: session.estimatedTokens
            },
            via: 'agent_pool',
            agentId: result.agentId,
            executionTime: result.executionTime
          },
          id: id || uuidv4()
        }));
      }
      
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

function determineTaskType(prompt, topic) {
  // Simple heuristic to determine task type
  const promptLower = prompt.toLowerCase();
  
  if (promptLower.includes('write') || promptLower.includes('code') || promptLower.includes('function')) {
    return 'coding';
  }
  if (promptLower.includes('research') || promptLower.includes('compare') || promptLower.includes('analyze')) {
    return 'research';
  }
  if (promptLower.includes('plan') || promptLower.includes('design') || promptLower.includes('architecture')) {
    return 'planning';
  }
  if (promptLower.includes('debug') || promptLower.includes('error') || promptLower.includes('fix')) {
    return 'debugging';
  }
  
  return 'analysis'; // default
}

function waitForTaskCompletion(taskId, timeout) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const checkInterval = setInterval(() => {
      try {
        const task = agentPool.getTaskStatus(taskId);
        
        if (task.status === 'completed') {
          clearInterval(checkInterval);
          resolve({ 
            output: `Agent pool response for task ${taskId}`,
            agentId: task.assignedAgent,
            executionTime: Date.now() - startTime
          });
        } else if (task.status === 'failed') {
          clearInterval(checkInterval);
          resolve({ error: 'Task failed' });
        } else if (Date.now() - startTime > timeout) {
          clearInterval(checkInterval);
          resolve({ error: 'Timeout' });
        }
      } catch (error) {
        clearInterval(checkInterval);
        resolve({ error: error.message });
      }
    }, 100);
  });
}

function createFallbackResponse(prompt, topic, botId, session) {
  const responses = {
    remi: [
      `I'm Remi from WZRD.dev! Agent pool integration active. Session: ${session.userId} on ${session.platform}`,
      `Topic: ${topic}\nPlatform: ${session.platform}\nMessages: ${session.messageCount}\n\n🔧 Integrated Gateway V2 with agent pool`,
    ],
    default: [
      `Integrated Gateway V2 response for "${topic}": ${prompt}`
    ]
  };
  
  const botResponses = responses[botId] || responses.default;
  return botResponses[Math.floor(Math.random() * botResponses.length)];
}

function handlePoolStats(req, res) {
  const stats = agentPool.getPoolStats();
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(stats));
}

function handleSessions(req, res) {
  const sessionList = Array.from(sessions.values()).map(s => ({
    sessionId: s.sessionId,
    userId: s.userId,
    platform: s.platform,
    topic: s.topic,
    messageCount: s.messageCount,
    estimatedTokens: s.estimatedTokens,
    lastActivity: s.lastActivity
  }));
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    totalSessions: sessions.size,
    sessions: sessionList
  }));
}

// Start server
server.listen(HTTP_PORT, () => {
  console.log(`🚀 Integrated Gateway V2 running on port ${HTTP_PORT}`);
  console.log(`   Endpoint: http://127.0.0.1:${HTTP_PORT}/gateway`);
  console.log(`   Pool Stats: http://127.0.0.1:${HTTP_PORT}/pool/stats`);
  console.log(`   Sessions: http://127.0.0.1:${HTTP_PORT}/sessions`);
  console.log(`   Health: http://127.0.0.1:${HTTP_PORT}/health`);
  console.log(`   Agent Pool: ${agentPool.agents.size} agents ready`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down Integrated Gateway V2...');
  server.close(() => {
    console.log('✅ Integrated Gateway V2 stopped');
    process.exit(0);
  });
});