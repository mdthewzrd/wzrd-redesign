import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Users, Hash, Clock, Activity, Eye, Bot } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

interface DiscordChannel {
  id: string;
  name: string;
  topic: string;
  messageCount: number;
  lastMessage: string;
  status: 'active' | 'inactive';
}

interface DiscordBotStatus {
  botName: string;
  status: 'online' | 'offline' | 'idle' | 'dnd';
  userId: string;
  uptime: number;
  totalMessages: number;
  responseTime: number;
  reactionCount: number;
  channels: DiscordChannel[];
}

const sampleChannels: DiscordChannel[] = [
  {
    id: '1481800155220148296',
    name: 'framework',
    topic: 'WZRD.dev framework discussions',
    messageCount: 24,
    lastMessage: '2 minutes ago',
    status: 'active'
  },
  {
    id: '1481800251806580757',
    name: 'topics',
    topic: 'Topic management and planning',
    messageCount: 18,
    lastMessage: '15 minutes ago',
    status: 'active'
  },
  {
    id: '1481800276330418279',
    name: 'web-ui',
    topic: 'Web interface development',
    messageCount: 42,
    lastMessage: '1 hour ago',
    status: 'active'
  },
  {
    id: '1481800409478725652',
    name: 'docs',
    topic: 'Documentation and guides',
    messageCount: 12,
    lastMessage: '3 hours ago',
    status: 'inactive'
  },
  {
    id: '1481800346253660290',
    name: 'wzrd-redesign',
    topic: 'Redesign project discussions',
    messageCount: 56,
    lastMessage: '30 minutes ago',
    status: 'active'
  },
  {
    id: '1481800429523308624',
    name: 'general',
    topic: 'General discussions',
    messageCount: 89,
    lastMessage: 'Just now',
    status: 'active'
  },
  {
    id: '1481800445465723012',
    name: 'testing',
    topic: 'Testing and validation',
    messageCount: 31,
    lastMessage: '5 minutes ago',
    status: 'active'
  }
];

const sampleStatus: DiscordBotStatus = {
  botName: 'remi#7128',
  status: 'online',
  userId: '677335430336610315',
  uptime: 10502392,
  totalMessages: 272,
  responseTime: 1.2,
  reactionCount: 45,
  channels: sampleChannels
};

export function DiscordBotDashboard() {
  const [status, setStatus] = useState<DiscordBotStatus>(sampleStatus);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchDiscordStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/discord/status');
      if (response.ok) {
        const data = await response.json();
        setStatus({
          botName: data.botName || sampleStatus.botName,
          status: data.status || sampleStatus.status,
          userId: data.userId || sampleStatus.userId,
          uptime: data.uptime || sampleStatus.uptime,
          totalMessages: data.totalMessages || sampleStatus.totalMessages,
          responseTime: data.responseTime || sampleStatus.responseTime,
          reactionCount: data.reactionCount || sampleStatus.reactionCount,
          channels: data.channels || sampleStatus.channels
        });
      }
    } catch (error) {
      console.error('Failed to fetch Discord status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscordStatus();
    const interval = setInterval(fetchDiscordStatus, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: DiscordBotStatus['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-gray-500';
      case 'idle': return 'bg-yellow-500';
      case 'dnd': return 'bg-red-500';
    }
  };

  const getStatusText = (status: DiscordBotStatus['status']) => {
    switch (status) {
      case 'online': return 'Online';
      case 'offline': return 'Offline';
      case 'idle': return 'Idle';
      case 'dnd': return 'Do Not Disturb';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-16 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Discord Bot</h2>
          <p className="text-muted-foreground">
            Real-time monitoring and channel management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchDiscordStatus}>
            Refresh
          </Button>
          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${getStatusColor(status.status)}`} />
            <span className="text-sm font-medium">{getStatusText(status.status)}</span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bot Status</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status.botName}</div>
            <div className="flex items-center gap-2 mt-2">
              <div className={`h-2 w-2 rounded-full ${getStatusColor(status.status)}`} />
              <span className="text-sm">{getStatusText(status.status)}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              User ID: {status.userId}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatUptime(status.uptime)}</div>
            <p className="text-xs text-muted-foreground">
              Total messages: {status.totalMessages}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status.responseTime.toFixed(1)}s</div>
            <p className="text-xs text-muted-foreground">
              Reactions: {status.reactionCount} 👀
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Channels</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status.channels.length}</div>
            <p className="text-xs text-muted-foreground">
              {status.channels.filter(c => c.status === 'active').length} active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Status</CardTitle>
              <CardDescription>
                How Discord bot connects to the WZRD.dev framework
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                      <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Discord Bot</h4>
                      <p className="text-sm text-muted-foreground">Listens to messages in channels</p>
                    </div>
                  </div>
                  <div className="text-blue-500">→</div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                      <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Gateway V2</h4>
                      <p className="text-sm text-muted-foreground">Processes messages via HTTP API</p>
                    </div>
                  </div>
                  <div className="text-purple-500">→</div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                      <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold">NVIDIA API</h4>
                      <p className="text-sm text-muted-foreground">Generates AI responses</p>
                    </div>
                  </div>
                  <div className="text-green-500">→</div>
                </div>
                
                <div className="flex items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900">
                      <Eye className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold">User Response</h4>
                      <p className="text-sm text-muted-foreground">Sends response back to Discord</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Channel Mapping</CardTitle>
              <CardDescription>
                All Discord channels connected to the bot
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {status.channels.map((channel) => (
                  <div key={channel.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        channel.status === 'active' 
                          ? 'bg-green-100 dark:bg-green-900' 
                          : 'bg-gray-100 dark:bg-gray-900'
                      }`}>
                        <Hash className={`h-4 w-4 ${
                          channel.status === 'active' 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-gray-600 dark:text-gray-400'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-semibold">#{channel.name}</h4>
                        <p className="text-sm text-muted-foreground">{channel.topic}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">{channel.messageCount}</div>
                        <div className="text-xs text-muted-foreground">messages</div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm">{channel.lastMessage}</div>
                        <div className="text-xs text-muted-foreground">last message</div>
                      </div>
                      
                      <Badge variant={channel.status === 'active' ? 'default' : 'secondary'}>
                        {channel.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Send Test Message</CardTitle>
            <CardDescription>Test the bot in #testing channel</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Send Test Message
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">View Bot Logs</CardTitle>
            <CardDescription>Check recent bot activity</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Open Logs
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Channel Settings</CardTitle>
            <CardDescription>Configure channel mappings</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Manage Channels
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
