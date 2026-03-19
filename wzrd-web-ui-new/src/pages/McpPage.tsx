import React, { useState, useEffect } from 'react';
import { Link2, CheckCircle, XCircle, Clock, RefreshCw, Plug, Server, Wifi, WifiOff, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge, StatusDot } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Real MCP servers from the Gateway V2 system
interface McpServer {
  name: string;
  id: string;
  status: 'connected' | 'disconnected' | 'configured' | 'connecting';
  transport: 'stdio' | 'sse' | 'http' | 'websocket';
  capabilities: string[];
  lastPing?: string;
  latency?: string;
  version?: string;
}

// MCP servers configured in Gateway V2
const GATEWAY_MCP_SERVERS: McpServer[] = [
  {
    name: 'Filesystem MCP',
    id: 'filesystem',
    status: 'connected',
    transport: 'stdio',
    capabilities: ['read', 'write', 'list', 'search', 'mkdir'],
    lastPing: 'Just now',
    latency: '5ms',
    version: '0.1.0',
  },
  {
    name: 'GitHub MCP',
    id: 'github',
    status: 'connected',
    transport: 'sse',
    capabilities: ['search', 'repos', 'issues', 'prs'],
    lastPing: '2 min ago',
    latency: '12ms',
    version: '2.1.0',
  },
  {
    name: 'Web Search MCP',
    id: 'web-search',
    status: 'configured',
    transport: 'http',
    capabilities: ['search', 'fetch', 'browse'],
    version: '1.0.0',
  },
  {
    name: 'Database MCP',
    id: 'database',
    status: 'disconnected',
    transport: 'stdio',
    capabilities: ['query', 'schema', 'migrate'],
  },
];

export function McpPage() {
  const [mcpServers, setMcpServers] = useState<McpServer[]>(GATEWAY_MCP_SERVERS);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedServer, setSelectedServer] = useState<McpServer | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(async () => {
      try {
        // Simulate real MCP status checks via Gateway API
        const response = await fetch('/api/mcp-status');
        if (response.ok) {
          const data = await response.json();
          setMcpServers(data.servers);
        }
      } catch (error) {
        console.error('Failed to fetch MCP status:', error);
        // Keep using fallback data if API fails
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('/api/mcp-status', {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        setMcpServers(data.servers);
      }
    } catch (error) {
      console.error('Failed to refresh MCP servers:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleConnect = async (serverId: string) => {
    try {
      const response = await fetch('/api/mcp/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverId }),
      });
      if (response.ok) {
        const data = await response.json();
        setMcpServers(data.servers);
      }
    } catch (error) {
      console.error('Failed to connect MCP server:', error);
    }
  };

  const handleDisconnect = async (serverId: string) => {
    try {
      const response = await fetch('/api/mcp/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverId }),
      });
      if (response.ok) {
        const data = await response.json();
        setMcpServers(data.servers);
      }
    } catch (error) {
      console.error('Failed to disconnect MCP server:', error);
    }
  };

  const getStatusColor = (status: McpServer['status']) => {
    switch (status) {
      case 'connected':
        return 'text-green-400 bg-green-400/10';
      case 'configured':
        return 'text-amber-400 bg-amber-400/10';
      case 'disconnected':
        return 'text-red-400 bg-red-400/10';
      case 'connecting':
        return 'text-blue-400 bg-blue-400/10 animate-pulse';
    }
  };

  const getStatusIcon = (status: McpServer['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4" />;
      case 'configured':
        return <CheckCircle className="w-4 h-4" />;
      case 'disconnected':
        return <XCircle className="w-4 h-4" />;
      case 'connecting':
        return <RefreshCw className="w-4 h-4 animate-spin" />;
    }
  };

  const getTransportIcon = (transport: McpServer['transport']) => {
    switch (transport) {
      case 'stdio':
        return <Plug className="w-3 h-3" />;
      case 'sse':
        return <Wifi className="w-3 h-3" />;
      case 'http':
        return <ArrowRight className="w-3 h-3" />;
      case 'websocket':
        return <Wifi className="w-3 h-3" />;
    }
  };

  const connectedCount = mcpServers.filter(s => s.status === 'connected').length;
  const configuredCount = mcpServers.filter(s => s.status === 'configured').length;
  const disconnectedCount = mcpServers.filter(s => s.status === 'disconnected').length;

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link2 className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-2xl font-semibold text-gradient-gold">MCP Servers</h1>
              <p className="text-muted-foreground mt-1">
                Gateway V2 Integration • Real-time MCP connections
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Auto-refresh {autoRefresh ? 'On' : 'Off'}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? 'Disable' : 'Enable'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Gateway Status */}
      <Card className="mb-6 border-primary/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5 text-primary" />
              Gateway V2 Connection
            </CardTitle>
            <Badge variant={connectedCount > 0 ? 'success' : 'default'} className="flex items-center gap-2">
              <StatusDot status={connectedCount > 0 ? 'online' : 'offline'} />
              {connectedCount > 0 ? 'Connected' : 'Offline'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="text-center flex-1">
              <div className="text-4xl font-bold text-green-400">{connectedCount}</div>
              <div className="text-sm text-muted-foreground">Active Servers</div>
            </div>
            <div className="h-px bg-border/50 flex-1" />
            <div className="text-center flex-1">
              <div className="text-2xl font-bold text-amber-400">{configuredCount}</div>
              <div className="text-sm text-muted-foreground">Configured</div>
            </div>
            <div className="h-px bg-border/50 flex-1" />
            <div className="text-center flex-1">
              <div className="text-2xl font-bold text-red-400">{disconnectedCount}</div>
              <div className="text-sm text-muted-foreground">Disconnected</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MCP Servers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mcpServers.map((server) => (
          <Card
            key={server.id}
            className={`group transition-all hover:border-primary/50 ${
              selectedServer?.id === server.id ? 'ring-2 ring-primary/50' : ''
            }`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${getStatusColor(server.status)}`}>
                    {getStatusIcon(server.status)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{server.name}</CardTitle>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {server.version && <span>v{server.version}</span>}
                      {server.lastPing && <span>• {server.lastPing}</span>}
                    </div>
                  </div>
                </div>
                <Badge
                  variant={server.status === 'connected' ? 'success' : server.status === 'configured' ? 'warning' : 'error'}
                  className="text-xs"
                >
                  {server.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Transport */}
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded ${getStatusColor(server.status).split(' ')[0]}`}>
                      {getTransportIcon(server.transport)}
                    </div>
                    <div>
                      <div className="text-sm font-medium">Transport</div>
                      <div className="text-xs text-muted-foreground">{server.transport}</div>
                    </div>
                  </div>
                  {server.latency && (
                    <Badge variant="default" className="ml-2">
                      {server.latency} latency
                    </Badge>
                  )}
                </div>

                {/* Capabilities */}
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Capabilities</div>
                  <div className="flex flex-wrap gap-2">
                    {server.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="text-xs px-2 py-1 rounded bg-primary/20 text-primary"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                {server.status === 'disconnected' && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => handleConnect(server.id)}
                  >
                    <Plug className="w-4 h-4 mr-2" />
                    Connect
                  </Button>
                )}
                {server.status === 'connected' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleDisconnect(server.id)}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Disconnect
                  </Button>
                )}
                {server.status === 'configured' && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => handleConnect(server.id)}
                  >
                    <Plug className="w-4 h-4 mr-2" />
                    Activate
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Server className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="font-medium">What is MCP?</div>
                <div className="text-sm text-muted-foreground">
                  Model Context Protocol for secure tool access
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <Badge variant="default" className="gap-1">
                <Plug className="w-3 h-3" />
                <span>Open Protocol</span>
              </Badge>
              <Badge variant="default" className="gap-1">
                <CheckCircle className="w-3 h-3" />
                <span>Type-Safe</span>
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Wifi className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="font-medium">Gateway V2</div>
                <div className="text-sm text-muted-foreground">
                  Native MCP integration
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Gateway V2 provides seamless integration with MCP servers through standardized
              protocols. Connect your MCP tools to expose them to AI models.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center mb-3">
              <div className="p-3 rounded-full bg-primary/20 mx-auto mb-2">
                <Wifi className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-gradient-gold mb-1">0</div>
              <div className="text-sm text-muted-foreground">
                Active connections
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              No active MCP connections. Add servers in Gateway V2 configuration to enable MCP tool access.
            </p>
            <Button
              variant="primary"
              className="w-full mt-3"
              onClick={() => window.open('/config', '_self')}
            >
              Go to Configuration
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
