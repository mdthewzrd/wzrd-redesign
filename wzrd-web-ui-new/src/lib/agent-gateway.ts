import { type GatewayRequest } from './gateway';
import { wsConnectedAtom } from '@/stores/atoms';
import { getDefaultStore } from 'jotai';

interface GatewayMessage {
  type: 'res' | 'event';
  id?: string | number;
  ok?: boolean;
  error?: string;
  payload?: any;
}

// WZRD Redesign Gateway WebSocket endpoint
const AGENT_GATEWAY_URL = 'ws://127.0.0.1:8765';

export interface AgentInfo {
  id: string;
  processId: number;
  startTime: number;
  workdir?: string;
  conversationId?: string;
  platform?: string;
  topic?: string;
  enhancement?: {
    enhancedPrompt: string;
    originalPrompt: string;
    memoryResults: Array<{
      content: string;
      topic: string;
      score: number;
      source: string;
    }>;
  contextSummary: string;
  tokenSavings: number;
  };
}

export interface AgentListResponse {
  type: 'res';
  id: string;
  ok: boolean;
  error?: string;
  payload?: {
    agents: AgentInfo[];
  };
}

export interface AgentKillResponse {
  type: 'res';
  id: string;
  ok: boolean;
  error?: string;
  payload?: {
    killed: boolean;
  };
}

class AgentGatewayConnection {
  private ws: WebSocket | null = null;
  private pendingRequests: Map<string, {
    resolve: (value: any) => void;
    reject: (error: Error) => void;
  }> = new Map();
  private retryCount = 0;
  private maxRetries = 5;
  private retryDelay = 1000; // Start with 1 second

  connect(): Promise<boolean> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('Already connected to Agent Gateway');
      return Promise.resolve(true);
    }

    console.log(`Connecting to Agent Gateway at ${AGENT_GATEWAY_URL}...`);

    try {
      this.ws = new WebSocket(AGENT_GATEWAY_URL);

    this.ws.onopen = () => {
      console.log('🔗 Connected to Agent Gateway successfully');
      getDefaultStore().set(wsConnectedAtom, true);
      this.retryCount = 0; // Reset retry count on successful connection
    };

      this.ws.onmessage = (event: MessageEvent) => {
        try {
          const message: GatewayMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse message:', error);
        }
      };

    this.ws.onclose = (event) => {
      console.log('Agent Gateway connection closed', event.code, event.reason);
      getDefaultStore().set(wsConnectedAtom, false);
      
      // Attempt reconnection with exponential backoff if not intentionally closed
      if (event.code !== 1000 && event.code !== 1001) {
        this.scheduleReconnection();
      }
    };

      this.ws.onerror = (event) => {
        console.error('Agent Gateway error:', event);
      };
    } catch (error) {
      console.error('Failed to connect to Agent Gateway:', error);
      this.scheduleReconnection();
      return Promise.resolve(false);
    }
    
    return Promise.resolve(true);
  }

  // Schedule reconnection with exponential backoff
  private scheduleReconnection(): void {
    if (this.retryCount >= this.maxRetries) {
      console.log('Max reconnection attempts reached. Manual reconnection required.');
      return;
    }
    
    this.retryCount++;
    const delay = this.retryDelay * Math.pow(2, this.retryCount - 1); // Exponential backoff
    
    console.log(`Scheduling reconnection attempt ${this.retryCount}/${this.maxRetries} in ${delay}ms`);
    
    setTimeout(() => {
      if (this.ws?.readyState !== WebSocket.OPEN) {
        console.log(`Attempting reconnection ${this.retryCount}/${this.maxRetries}...`);
        this.connect();
      }
    }, delay);
  }

  private handleMessage(message: GatewayMessage): void {
    const requestId = message.id?.toString();

    if (message.type === 'res' && requestId) {
      const pending = this.pendingRequests.get(requestId);
      if (pending) {
        this.pendingRequests.delete(requestId);
        // For agents.list, resolve with the agents array
        if (message.payload?.agents) {
          pending.resolve(message.payload.agents);
        }
        // For agent.kill, resolve with killed status
        else if (message.payload?.killed !== undefined) {
          pending.resolve(message.payload.killed);
        }
        else {
          pending.resolve(message.payload);
        }
      }
    }
  }

  async listAgents(): Promise<AgentInfo[]> {
    return new Promise((resolve, reject) => {
      const requestId = `list-${Date.now()}`;

      this.pendingRequests.set(requestId, { resolve, reject });

      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        this.connect();
      }

      const request: GatewayRequest = {
        type: 'req',
        id: requestId,
        method: 'agents.list',
        params: {},
      };

      this.ws.send(JSON.stringify(request));

      // Timeout after 5 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject(new Error('Request timeout'));
        }
      }, 5000);
    });
  }

  async killAgent(agentId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const requestId = `kill-${Date.now()}`;

      this.pendingRequests.set(requestId, { resolve, reject });

      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        this.connect();
      }

      const request: GatewayRequest = {
        type: 'req',
        id: requestId,
        method: 'agent.kill',
        params: { id: agentId },
      };

      this.ws.send(JSON.stringify(request));

      // Timeout after 5 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject(new Error('Request timeout'));
        }
      }, 5000);
    });
  }
}

// Singleton instance
export const agentGateway = new AgentGatewayConnection();
