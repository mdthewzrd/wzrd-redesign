export interface GatewayMessage {
  type: 'res' | 'stream' | 'error' | 'status' | 'metrics' | 'activity';
  id: number;
  payload?: {
    output?: string;
    chunk?: string;
    done?: boolean;
    error?: string;
    metrics?: any;
    activity?: any;
  };
}

export interface GatewayRequest {
  type: 'req';
  id: string;
  method: string;
  params?: any;
}

export interface TopicConfig {
  key: string;
  name: string;
  mode: string;
  focus?: string;
  description: string;
}

const GATEWAY_URL = 'ws://127.0.0.1:8765/';

class GatewayConnection {
  private ws: WebSocket | null = null;
  private messageHandlers: Set<(message: GatewayMessage) => void> = new Set();
  private statusHandlers: Set<(connected: boolean) => void> = new Set();
  private pendingRequests: Map<string, {
    resolve: (value: any) => void;
    reject: (error: Error) => void;
    chunks: string[];
  }> = new Map();
  private reconnectTimer: number | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private requestIdCounter = 0;
  private connectionPromise: Promise<void> | null = null;
  private resolveConnection: (() => void) | null = null;

  async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('Already connected to Gateway');
      return;
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve) => {
      this.resolveConnection = resolve;
    });

    console.log(`Connecting to Gateway at ${GATEWAY_URL}...`);

    try {
      this.ws = new WebSocket(GATEWAY_URL);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.notifyStatus(true);
        console.log('🔗 Connected to Gateway successfully');
        if (this.resolveConnection) {
          this.resolveConnection();
          this.resolveConnection = null;
        }
        this.connectionPromise = null;
      };

      this.ws.onmessage = (event) => {
        try {
          const message: GatewayMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        this.notifyStatus(false);
        this.scheduleReconnect();
        if (this.resolveConnection) {
          this.resolveConnection();
          this.resolveConnection = null;
        }
        this.connectionPromise = null;
      };

      this.ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        this.notifyStatus(false);
        this.scheduleReconnect();
        if (this.resolveConnection) {
          this.resolveConnection();
          this.resolveConnection = null;
        }
        this.connectionPromise = null;
      };
    } catch (error) {
      console.error('Connection error:', error);
      this.notifyStatus(false);
      this.scheduleReconnect();
      if (this.resolveConnection) {
        this.resolveConnection();
        this.resolveConnection = null;
      }
      this.connectionPromise = null;
    }
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.notifyStatus(false);
  }

  async sendPrompt(prompt: string, routing: any): Promise<string> {
    await this.connect();

    return new Promise((resolve, reject) => {
      const requestId = `web-${Date.now()}-${this.requestIdCounter++}`;
      this.pendingRequests.set(requestId, { resolve, reject, chunks: [] });

      const request: GatewayRequest = {
        type: 'req',
        id: requestId,
        method: 'agent.run',
        params: {
          prompt,
          id: 'web-ui',
          routing
        }
      };

      this.ws!.send(JSON.stringify(request));

      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject(new Error('Request timeout'));
        }
      }, 120000);
    });
  }

  async getMetrics(): Promise<void> {
    await this.connect();

    const requestId = `metrics-${Date.now()}`;
    return new Promise((resolve, reject) => {
      this.pendingRequests.set(requestId, { resolve, reject, chunks: [] });
      const request: GatewayRequest = {
        type: 'req',
        id: requestId,
        method: 'metrics.get',
        params: {}
      };
      this.ws!.send(JSON.stringify(request));
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject(new Error('Metrics request timeout'));
        }
      }, 5000);
    });
  }

  async getActivity(): Promise<void> {
    await this.connect();

    const requestId = `activity-${Date.now()}`;
    return new Promise((resolve, reject) => {
      this.pendingRequests.set(requestId, { resolve, reject, chunks: [] });
      const request: GatewayRequest = {
        type: 'req',
        id: requestId,
        method: 'activity.get',
        params: {}
      };
      this.ws!.send(JSON.stringify(request));
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject(new Error('Activity request timeout'));
        }
      }, 5000);
    });
  }

  private handleMessage(message: GatewayMessage) {
    // Notify general message handlers
    this.messageHandlers.forEach(handler => handler(message));

    // Handle request/response pattern
    const requestId = message.id.toString();
    const pending = this.pendingRequests.get(requestId);

    if (pending) {
      if (message.type === 'stream' && message.payload?.chunk) {
        // Stream chunk - accumulate
        pending.chunks.push(message.payload.chunk);
      } else if (message.type === 'res' && message.payload?.output) {
        // Final response
        this.pendingRequests.delete(requestId);
        pending.resolve(message.payload.output);
      } else if (message.type === 'error') {
        // Error response
        this.pendingRequests.delete(requestId);
        pending.reject(new Error(message.payload?.error || 'Unknown error'));
      } else if (message.type === 'stream' && message.payload?.done) {
        // Stream complete - join all chunks
        this.pendingRequests.delete(requestId);
        pending.resolve(pending.chunks.join(''));
      } else if (message.type === 'metrics') {
        // Update system metrics atom with real Gateway data
        const data = message.payload?.metrics;
        if (data) {
          window.dispatchEvent(new CustomEvent('gateway:metrics', { detail: data }));
        }
        this.pendingRequests.delete(requestId);
        pending.resolve(undefined);
} else if (message.type === 'activity') {
      // Update activity data - send FULL payload with activity, tokens, and activityLog
      const payload = message.payload;
      if (payload) {
        window.dispatchEvent(new CustomEvent('gateway:activity', { detail: payload }));
      }
      this.pendingRequests.delete(requestId);
      pending.resolve(undefined);
    }
    }
  }

  onMessage(handler: (message: GatewayMessage) => void): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onStatusChange(handler: (connected: boolean) => void): () => void {
    this.statusHandlers.add(handler);
    handler(this.isConnected());
    return () => this.statusHandlers.delete(handler);
  }

  private notifyStatus(connected: boolean) {
    this.statusHandlers.forEach(handler => handler(connected));
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached');
      return;
    }

    if (this.reconnectTimer) return;

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    console.log(`Reconnecting in ${delay}ms...`);

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
export const gateway = new GatewayConnection();

// Don't auto-connect - let components control connection

// Helper function to get topic routing
export function getTopicRouting(topic: TopicConfig) {
  return {
    mode: topic.mode,
    focus: topic.focus || '',
    agent: 'remi',
    topic: topic.key
  };
}

// Default topics fallback
export const DEFAULT_TOPICS: TopicConfig[] = [
  { key: 'general', name: 'General', mode: 'orchestration', description: 'Updates, chat, coordination' },
  { key: 'wzrd-dev-ui', name: 'WZRD Dev UI', mode: 'coding', focus: 'frontend', description: 'Frontend, UI, UX' },
  { key: 'wzrd-dev-build', name: 'WZRD Dev Build', mode: 'coding', focus: 'backend', description: 'Backend, API, server work' },
  { key: 'issues', name: 'Issues', mode: 'testing', description: 'Bug reports, problems, QA' },
  { key: 'resources', name: 'Resources', mode: 'research', description: 'Research, investigation, references' },
  { key: 'ideas', name: 'Ideas', mode: 'planning', description: 'New features, brainstorming, planning' },
  { key: 'md-inbox', name: 'MD Inbox', mode: 'preserve', description: 'Messages to continue on desktop' },
  { key: 'testing', name: 'Testing', mode: 'testing', description: 'Testing and experimentation' },
];
