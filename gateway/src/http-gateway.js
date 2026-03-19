/**
 * WZRD.dev HTTP Gateway Proxy
 * 
 * Bridges HTTP API calls to WebSocket Gateway
 * 
 * Features:
 * - HTTP server on port 18801
 * - Accepts POST /gateway for agent chat
 * - Forwards to WebSocket Gateway (port 8765)
 * - Returns HTTP responses
 * - Handles conversation sessions
 */

import { createServer } from 'http';
import { WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';

const HTTP_PORT = process.env.HTTP_GATEWAY_PORT || 18801;
const WS_GATEWAY_URL = process.env.WS_GATEWAY_URL || 'ws://127.0.0.1:8765';

// HTTP Gateway State
const httpState = {
  startTime: Date.now(),
  requestsTotal: 0,
  activeConversations: new Map(), // conversationId -> { ws, userId, topic }
  wsConnections: new Map(), // ws -> metadata
};

// Connect to WebSocket Gateway
function connectToWebSocketGateway() {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(WS_GATEWAY_URL);
    
    ws.on('open', () => {
      console.log(`✅ Connected to WebSocket Gateway at ${WS_GATEWAY_URL}`);
      
      // Register as HTTP gateway interface
      ws.send(JSON.stringify({
        type: 'register',
        payload: {
          type: 'http_gateway',
          sessionId: 'http_gateway_bridge',
        }
      }));
      
      // Store connection
      httpState.wsConnections.set(ws, {
        id: uuidv4(),
        connectedAt: Date.now(),
        type: 'http_gateway',
      });
      
      resolve(ws);
    });
    
    ws.on('error', (error) => {
      console.error(`❌ WebSocket connection error:`, error);
      reject(error);
    });
    
    ws.on('close', () => {
      console.log('🔌 Disconnected from WebSocket Gateway');
      httpState.wsConnections.delete(ws);
    });
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        handleWebSocketMessage(ws, message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    });
  });
}

// Handle incoming WebSocket messages
function handleWebSocketMessage(ws, message) {
  const { type, payload } = message;
  
  switch (type) {
    case 'registered':
      console.log('✅ Registered with WebSocket Gateway:', payload);
      break;
      
    case 'message':
      // This would be responses from other interfaces
      console.log('📨 Message from WebSocket:', payload);
      break;
      
    case 'heartbeat':
      // Keep connection alive
      break;
      
    default:
      console.log('WebSocket message:', type);
  }
}

// Send message via WebSocket and wait for response
function sendViaWebSocket(ws, payload) {
  return new Promise((resolve, reject) => {
    const messageId = uuidv4();
    const timeoutId = setTimeout(() => {
      reject(new Error('WebSocket response timeout'));
    }, 30000); // 30 second timeout
    
    // Create response handler
    const responseHandler = (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === 'message_response' && message.payload?.requestId === messageId) {
          clearTimeout(timeoutId);
          ws.removeListener('message', responseHandler);
          resolve(message.payload);
        }
      } catch (error) {
        // Ignore parse errors
      }
    };
    
    ws.on('message', responseHandler);
    
    // Send message
    ws.send(JSON.stringify({
      type: 'message',
      payload: {
        ...payload,
        requestId: messageId,
        from: 'http_gateway',
      }
    }));
  });
}

// Handle HTTP Gateway chat request
async function handleGatewayChat(requestBody) {
  const { method, params, id } = requestBody;
  
  if (method !== 'gateway.chat') {
    return {
      error: { code: -32601, message: 'Method not found' },
      id
    };
  }
  
  const { prompt, userId, platform = 'http', topic = 'general', botId = 'remi', conversationId } = params;
  
  console.log(`💬 Gateway chat request:`, { 
    userId, 
    platform, 
    topic, 
    botId,
    length: prompt?.length || 0 
  });
  
  // Use provided conversation ID or generate new one
  const newConversationId = conversationId || `conv-${uuidv4()}`;
  
  // Get real AI response from Claude API
  const aiResponse = await getRealAIResponse(prompt, topic, botId, newConversationId);
  
  // Store conversation context if we have a conversation ID
  if (newConversationId) {
    // Store last message for context (in real implementation, this would be a database)
    const conversationKey = `conv:${newConversationId}`;
    httpState.activeConversations.set(conversationKey, {
      lastPrompt: prompt,
      lastTopic: topic,
      lastUserId: userId,
      timestamp: Date.now(),
    });
  }
  
  // Sync to WebSocket Gateway for other interfaces
  try {
    const ws = await getWebSocketConnection();
    await sendViaWebSocket(ws, {
      content: prompt,
      userId,
      platform,
      topic,
      conversationId: newConversationId,
      timestamp: Date.now(),
      response: aiResponse.response,
    });
  } catch (error) {
    console.warn('Failed to sync to WebSocket Gateway:', error.message);
    // Continue anyway - HTTP Gateway can work without WebSocket
  }
  
  return {
    payload: {
      response: aiResponse.response,
      model: aiResponse.model,
      tokens: aiResponse.tokens,
      cost: aiResponse.cost,
      conversationId: newConversationId,
      topic,
    },
    id
  };
}

// Get WebSocket connection (lazy initialize)
async function getWebSocketConnection() {
  if (httpState.wsConnections.size === 0) {
    return await connectToWebSocketGateway();
  }
  return Array.from(httpState.wsConnections.keys())[0];
}

// Get real AI response from NVIDIA NIM API
async function getRealAIResponse(prompt, topic, botId, conversationId) {
  const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
  const NVIDIA_API_BASE = process.env.NVIDIA_API_BASE || 'https://integrate.api.nvidia.com/v1';
  
  if (!NVIDIA_API_KEY) {
    console.warn('⚠️ NVIDIA_API_KEY not set, using mock response');
    return createMockAgentResponse(prompt, topic, botId);
  }
  
  try {
    console.log(`🤖 Calling NVIDIA NIM API for topic "${topic}"${conversationId ? ` (conversation: ${conversationId.slice(0, 8)}...)` : ''}...`);
    
    // Get conversation history if available
    const conversationHistory = conversationId ? httpState.activeConversations.get(`conv:${conversationId}`) : null;
    
    // Build messages array with context if available
    const messages = [
      {
        role: 'system',
        content: `You are Remi, the WZRD.dev agent. You're responding in Discord channel about topic: "${topic}". 
                Be helpful, technical, and concise. Format responses for Discord (use markdown sparingly).`,
      }
    ];
    
    // Add previous context if we have it
    if (conversationHistory?.lastPrompt) {
      messages.push(
        { role: 'user', content: conversationHistory.lastPrompt },
        { role: 'assistant', content: '[Previous conversation context loaded]' }
      );
    }
    
    // Add current prompt
    messages.push({ role: 'user', content: prompt });
    
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
    
    // NVIDIA pricing varies by model - using approximate
    const costPerToken = 0.0000005; // $0.50 per million tokens
    const cost = totalTokens * costPerToken;
    
    return {
      response: aiResponse,
      model: 'deepseek-v3.2',
      tokens: totalTokens,
      cost: parseFloat(cost.toFixed(6)),
    };
    
  } catch (error) {
    console.error('Failed to call NVIDIA API:', error.message);
    return createMockAgentResponse(prompt, topic, botId);
  }
}

// Create mock agent response for fallback
function createMockAgentResponse(prompt, topic, botId) {
  const responses = {
    remi: [
      `I'm Remi from WZRD.dev! You asked about "${topic}": ${prompt}\n\n*Note: NVIDIA API not configured - using mock response*`,
      `Topic: ${topic}\nQuestion: ${prompt}\n\n🔧 Real AI integration pending NVIDIA_API_KEY environment variable`,
      `🤖 Would be real DeepSeek V3.2 response about ${topic}. Set NVIDIA_API_KEY for real AI.`
    ],
    default: [
      `Mock response for "${topic}": ${prompt}\n\nSet NVIDIA_API_KEY environment variable for real AI.`
    ]
  };
  
  const botResponses = responses[botId] || responses.default;
  const response = botResponses[Math.floor(Math.random() * botResponses.length)];
  
  return {
    response,
    model: 'mock-fallback',
    tokens: Math.floor(prompt.length / 4) + Math.floor(response.length / 4),
    cost: 0,
  };
}

// Create HTTP server
const server = createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Only accept POST for /gateway
  if (req.method !== 'POST' || req.url !== '/gateway') {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }
  
  httpState.requestsTotal++;
  
  try {
    // Parse request body
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const requestBody = JSON.parse(body);
        
        // Validate request format
        if (!requestBody.method || !requestBody.id) {
          res.writeHead(400);
          res.end(JSON.stringify({ 
            error: { code: -32600, message: 'Invalid request' },
            id: requestBody.id || 'unknown'
          }));
          return;
        }
        
        // Handle different methods
        let result;
        switch (requestBody.method) {
          case 'gateway.chat':
            result = await handleGatewayChat(requestBody);
            break;
            
          case 'gateway.status':
            result = {
              payload: {
                status: 'running',
                uptime: Math.floor((Date.now() - httpState.startTime) / 1000),
                requests: httpState.requestsTotal,
                connections: httpState.wsConnections.size,
              },
              id: requestBody.id
            };
            break;
            
          default:
            result = {
              error: { code: -32601, message: 'Method not found' },
              id: requestBody.id
            };
        }
        
        // Send response
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        
      } catch (parseError) {
        console.error('Request parsing error:', parseError);
        res.writeHead(400);
        res.end(JSON.stringify({ 
          error: { code: -32700, message: 'Parse error' },
          id: 'parse-error'
        }));
      }
    });
    
  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500);
    res.end(JSON.stringify({ 
      error: { code: -32000, message: 'Internal server error' },
      id: 'server-error'
    }));
  }
});

// Start HTTP server
server.listen(HTTP_PORT, () => {
  console.log(`🚀 HTTP Gateway Proxy running on port ${HTTP_PORT}`);
  console.log(`   Endpoint: http://127.0.0.1:${HTTP_PORT}/gateway`);
  console.log(`   Forwarding to: ${WS_GATEWAY_URL}`);
  
  // Try to connect to WebSocket Gateway
  connectToWebSocketGateway().catch(error => {
    console.error('Failed to connect to WebSocket Gateway:', error.message);
    console.log('⚠️  HTTP Gateway will run, but WebSocket forwarding will fail');
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down HTTP Gateway...');
  
  // Close WebSocket connections
  httpState.wsConnections.forEach((meta, ws) => {
    ws.close();
  });
  
  server.close(() => {
    console.log('✅ HTTP Gateway stopped');
    process.exit(0);
  });
});

export { server, httpState, connectToWebSocketGateway };