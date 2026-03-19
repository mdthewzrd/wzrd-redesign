'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CheckCircle, Activity, Users, FolderOpen } from 'lucide-react';

interface SimpleOverviewData {
  activeTopics: number;
  totalTopics: number;
  memoryFiles: number;
  worktrees: number;
  systemStatus: {
    gateway: boolean;
    apiServer: boolean;
    discordBot: boolean;
    nvidiaApi: boolean;
  };
}

export function OverviewPageSimple() {
  const [data, setData] = useState<SimpleOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        setLoading(true);
        
        // Fetch minimal data
        const responses = await Promise.allSettled([
          fetch('/api/topics'),
          fetch('/api/sandboxes'),
          fetch('/api/health'),
          fetch('/api/gateway/v2/health')
        ]);
        
        const [topicsRes, sandboxesRes, healthRes, gatewayHealthRes] = responses;
        
        // Process responses
        const topicsData = topicsRes.status === 'fulfilled' && topicsRes.value.ok 
          ? await topicsRes.value.json() 
          : { topics: [] };
          
        const sandboxesData = sandboxesRes.status === 'fulfilled' && sandboxesRes.value.ok
          ? await sandboxesRes.value.json()
          : { sandboxes: [] };
          
        const healthData = healthRes.status === 'fulfilled' && healthRes.value.ok
          ? await healthRes.value.json()
          : { services: {} };
          
        const gatewayHealthData = gatewayHealthRes.status === 'fulfilled' && gatewayHealthRes.value.ok
          ? await gatewayHealthRes.value.json()
          : { status: 'unknown' };
        
        // Build simple data structure
        const simpleData: SimpleOverviewData = {
          activeTopics: topicsData.topics?.filter((t: any) => t.active).length || 0,
          totalTopics: topicsData.topics?.length || 0,
          memoryFiles: 42, // Default value
          worktrees: sandboxesData.sandboxes?.length || 0,
          systemStatus: {
            gateway: gatewayHealthData.status === 'healthy',
            apiServer: healthData.services?.apiServer === true,
            discordBot: healthData.services?.discordBot === true,
            nvidiaApi: healthData.services?.nvidiaApi === true,
          }
        };
        
        setData(simpleData);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching overview data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">System Overview</h2>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
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
            <p className="text-muted-foreground">Dashboard showing system status</p>
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
            <p className="text-sm">The system data could not be loaded.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">No Data Available</h2>
        <p>Unable to load system data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">WZRD.dev System</h2>
          <p className="text-muted-foreground">Real-time monitoring dashboard</p>
        </div>
      </div>
      
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Gateway V2
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.systemStatus.gateway ? '✅ Healthy' : '❌ Offline'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              HTTP Gateway on port 18801
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.activeTopics}/{data.totalTopics}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active topics
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Worktrees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.worktrees}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Git worktrees
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm">API Server</span>
                <span className={data.systemStatus.apiServer ? 'text-green-600' : 'text-red-600'}>
                  {data.systemStatus.apiServer ? '✅' : '❌'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Discord Bot</span>
                <span className={data.systemStatus.discordBot ? 'text-green-600' : 'text-red-600'}>
                  {data.systemStatus.discordBot ? '✅' : '❌'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">NVIDIA API</span>
                <span className={data.systemStatus.nvidiaApi ? 'text-green-600' : 'text-red-600'}>
                  {data.systemStatus.nvidiaApi ? '✅' : '❌'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>
            WZRD.dev Framework with real Gateway V2 integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Current Architecture</h4>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Gateway V2 (HTTP on port 18801)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>API Server (Express on port 3000)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Discord Bot with NVIDIA API</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Real metrics (no token estimates)</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Quick Actions</h4>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => window.open('http://localhost:3000/', '_blank')}>
                  API Docs
                </Button>
                <Button size="sm" variant="outline" onClick={() => window.open('http://localhost:5174/activity', '_blank')}>
                  Activity
                </Button>
                <Button size="sm" variant="outline" onClick={() => window.open('http://localhost:5174/sandboxes', '_blank')}>
                  Sandboxes
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}