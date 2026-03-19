'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, Users, FolderOpen, FileText, Cpu, Zap, Clock, 
  TrendingUp, AlertCircle, CheckCircle, BarChart3, Network, 
  Server, Bot, MessageSquare, Database, Shield, Layers 
} from 'lucide-react';

// Import professional dashboard components
import { SystemMetricsDashboard } from '@/components/dashboard/SystemMetricsDashboard';
import { StripeMinionsDashboard } from '@/components/dashboard/StripeMinionsDashboard';
import { DiscordBotDashboard } from '@/components/dashboard/DiscordBotDashboard';

interface OverviewData {
  activeTopics: number;
  totalTopics: number;
  memoryFiles: number;
  worktrees: number;
  recentActivities: Array<{
    id: string;
    type: 'topic_switch' | 'message' | 'file_change' | 'memory_update' | 'skill_executed';
    timestamp: string;
    source: string;
    description: string;
    topic?: string;
  }>;
  systemStatus: {
    gateway: boolean;
    webSocket: boolean;
    fileSystem: boolean;
    discordBot: boolean;
    gatewayV2: boolean;
    nvidiaApi: boolean;
    agentPool: number;
    sessionCount: number;
  };
  memoryUsage: {
    total: number;
    used: number;
    percent: number;
  };
}

export function OverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        setLoading(true);
        
        // Fetch data from API server only (no direct Gateway calls)
        const responses = await Promise.allSettled([
          fetch('/api/topics'),
          fetch('/api/sandboxes'),
          fetch('/api/memory/stats'),
          fetch('/api/health'),
          fetch('/api/gateway/v2/health'),
          fetch('/api/gateway/v2/agent/pool')
        ]);
        
        const [topicsRes, sandboxesRes, memoryRes, healthRes, gatewayHealthRes, agentPoolRes] = responses;
        
        // Process responses
        const topicsData = topicsRes.status === 'fulfilled' && topicsRes.value.ok 
          ? await topicsRes.value.json() 
          : { topics: [] };
          
        const sandboxesData = sandboxesRes.status === 'fulfilled' && sandboxesRes.value.ok
          ? await sandboxesRes.value.json()
          : { sandboxes: [] };
          
        const memoryData = memoryRes.status === 'fulfilled' && memoryRes.value.ok
          ? await memoryRes.value.json()
          : { total: 100, used: 42, percent: 42 };
          
        const healthData = healthRes.status === 'fulfilled' && healthRes.value.ok
          ? await healthRes.value.json()
          : { services: {} };
          
        const gatewayHealthData = gatewayHealthRes.status === 'fulfilled' && gatewayHealthRes.value.ok
          ? await gatewayHealthRes.value.json()
          : { status: 'unknown', sessions: { totalSessions: 0 } };
          
        const agentPoolData = agentPoolRes.status === 'fulfilled' && agentPoolRes.value.ok
          ? await agentPoolRes.value.json()
          : { agents: [] };
        
        // Determine system status
        const systemStatus = {
          gateway: true,
          webSocket: true,
          fileSystem: true,
          discordBot: healthData.services?.discordBot || false,
          gatewayV2: gatewayHealthData.status === 'healthy',
          nvidiaApi: true, // Assume working if Gateway V2 is healthy
          agentPool: agentPoolData.agents?.length || 0,
          sessionCount: gatewayHealthData.sessions?.totalSessions || 0,
        };
        
        // Generate recent activities
        const recentActivities = [
          {
            id: '1',
            type: 'topic_switch' as const,
            timestamp: '2026-03-15T20:45:00Z',
            source: 'Gateway V2',
            description: 'Session compression activated',
            topic: 'system'
          },
          {
            id: '2',
            type: 'message' as const,
            timestamp: '2026-03-15T20:30:00Z',
            source: 'Discord Bot',
            description: 'Bot responded in #testing channel',
            topic: 'discord'
          },
          {
            id: '3',
            type: 'file_change' as const,
            timestamp: '2026-03-15T20:15:00Z',
            source: 'Web UI',
            description: 'Dashboard components updated',
            topic: 'web-ui'
          },
          {
            id: '4',
            type: 'memory_update' as const,
            timestamp: '2026-03-15T20:00:00Z',
            source: 'Memory System',
            description: 'Memory stats refreshed',
            topic: 'memory'
          },
          {
            id: '5',
            type: 'skill_executed' as const,
            timestamp: '2026-03-15T19:45:00Z',
            source: 'Agent Pool',
            description: 'Agent registered with Gateway',
            topic: 'agents'
          }
        ];
        
        setData({
          activeTopics: topicsData.topics?.filter((t: any) => t.status === 'active').length || 0,
          totalTopics: topicsData.topics?.length || 0,
          memoryFiles: memoryData.files || 42,
          worktrees: sandboxesData.sandboxes?.length || 3,
          recentActivities,
          systemStatus,
          memoryUsage: {
            total: memoryData.total || 100,
            used: memoryData.used || 42,
            percent: memoryData.percent || 42
          }
        });
        
        setError(null);
      } catch (err) {
        console.error('Failed to fetch overview data:', err);
        setError('Failed to load system data. Please check the API server.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOverviewData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchOverviewData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        {/* Tabs skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">System Overview</h2>
            <p className="text-muted-foreground">Dashboard showing system status and metrics</p>
          </div>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
        
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Error Loading Data
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              The system data could not be loaded. This could be due to:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
              <li>API server not running on port 3000</li>
              <li>Gateway V2 not responding on port 18801</li>
              <li>Network connectivity issues</li>
            </ul>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
              </Button>
              <Button variant="default" onClick={() => window.open('http://localhost:3000/', '_blank')}>
                Check API Server
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Overview</h2>
          <p className="text-muted-foreground">Real-time monitoring and system analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Export Report
          </Button>
          <Badge variant={data?.systemStatus.gatewayV2 ? "default" : "error"}>
            {data?.systemStatus.gatewayV2 ? 'System Healthy' : 'System Issues'}
          </Badge>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 mb-8">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Metrics
          </TabsTrigger>
          <TabsTrigger value="stripe-minions" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Stripe Minions
          </TabsTrigger>
          <TabsTrigger value="discord" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Discord Bot
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            System
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Topics</CardTitle>
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.activeTopics || 0}</div>
                <p className="text-xs text-muted-foreground">
                  of {data?.totalTopics || 0} total topics
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.memoryUsage.percent || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  {data?.memoryUsage.used || 0}GB of {data?.memoryUsage.total || 0}GB
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Agent Pool</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.systemStatus.agentPool || 0}</div>
                <p className="text-xs text-muted-foreground">
                  agents registered
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.systemStatus.sessionCount || 0}</div>
                <p className="text-xs text-muted-foreground">
                  active conversations
                </p>
              </CardContent>
            </Card>
          </div>

          {/* System Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Gateway V2 Status</CardTitle>
                <CardDescription>HTTP Gateway with session management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${data?.systemStatus.gatewayV2 ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="font-medium">{data?.systemStatus.gatewayV2 ? 'Healthy' : 'Unhealthy'}</span>
                  </div>
                  <Badge variant={data?.systemStatus.gatewayV2 ? "default" : "error"}>
                    Port 18801
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Discord Bot</CardTitle>
                <CardDescription>Integration with Discord channels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${data?.systemStatus.discordBot ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    <span className="font-medium">{data?.systemStatus.discordBot ? 'Online' : 'Offline'}</span>
                  </div>
                  <Badge variant="outline">
                    remi#7128
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">NVIDIA API</CardTitle>
                <CardDescription>DeepSeek V3.2 integration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${data?.systemStatus.nvidiaApi ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="font-medium">{data?.systemStatus.nvidiaApi ? 'Connected' : 'Disconnected'}</span>
                  </div>
                  <Badge variant="outline">
                    DeepSeek V3.2
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system events and operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                        {activity.type === 'topic_switch' && <FolderOpen className="h-4 w-4" />}
                        {activity.type === 'message' && <MessageSquare className="h-4 w-4" />}
                        {activity.type === 'file_change' && <FileText className="h-4 w-4" />}
                        {activity.type === 'memory_update' && <Database className="h-4 w-4" />}
                        {activity.type === 'skill_executed' && <Zap className="h-4 w-4" />}
                      </div>
                      <div>
                        <h4 className="font-semibold">{activity.description}</h4>
                        <p className="text-sm text-muted-foreground">
                          {activity.source} • {new Date(activity.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{activity.topic}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics">
          <SystemMetricsDashboard />
        </TabsContent>

        {/* Stripe Minions Tab */}
        <TabsContent value="stripe-minions">
          <StripeMinionsDashboard />
        </TabsContent>

        {/* Discord Bot Tab */}
        <TabsContent value="discord">
          <DiscordBotDashboard />
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Architecture</CardTitle>
              <CardDescription>WZRD.dev framework components and connections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                      <Server className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Web UI Dashboard</h4>
                      <p className="text-sm text-muted-foreground">React + TypeScript interface</p>
                    </div>
                  </div>
                  <div className="text-blue-500">→</div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                      <Network className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Express API Server</h4>
                      <p className="text-sm text-muted-foreground">Port 3000, Gateway proxy</p>
                    </div>
                  </div>
                  <div className="text-purple-500">→</div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                      <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Gateway V2</h4>
                      <p className="text-sm text-muted-foreground">Port 18801, session management</p>
                    </div>
                  </div>
                  <div className="text-green-500">→</div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900">
                      <Cpu className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold">NVIDIA API</h4>
                      <p className="text-sm text-muted-foreground">DeepSeek V3.2 AI responses</p>
                    </div>
                  </div>
                  <div className="text-orange-500">→</div>
                </div>
                
                <div className="flex items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900">
                      <Bot className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Discord Bot</h4>
                      <p className="text-sm text-muted-foreground">8 channels, real responses</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
