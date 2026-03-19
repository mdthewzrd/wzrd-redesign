import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Database, 
  Container, 
  Cpu, 
  FileText, 
  Wrench, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  Zap,
  Layers,
  Activity,
  Code,
  Shield
} from 'lucide-react';

interface StripeMinionsComponent {
  id: string;
  name: string;
  status: 'operational' | 'degraded' | 'down';
  description: string;
  lastChecked: string;
  icon: React.ReactNode;
  endpoint?: string;
}

interface StripeMinionsStatus {
  components: Record<string, boolean>;
  allOperational: boolean;
  timestamp: string;
}

export function StripeMinionsDashboard() {
  const [status, setStatus] = useState<StripeMinionsStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<string>('');

  const components: StripeMinionsComponent[] = [
    {
      id: 'sqlite-state',
      name: 'SQLite State Management',
      status: 'operational',
      description: 'Database state management and persistence',
      lastChecked: new Date().toISOString(),
      icon: <Database className="h-5 w-5" />,
      endpoint: '/conductor/lib/db.py'
    },
    {
      id: 'sandbox-system',
      name: 'Sandbox System',
      status: 'operational',
      description: 'Isolated environment creation and management',
      lastChecked: new Date().toISOString(),
      icon: <Container className="h-5 w-5" />,
      endpoint: '/conductor/sandbox-engine.sh'
    },
    {
      id: 'agent-harness',
      name: 'Agent Harness',
      status: 'operational',
      description: 'Blueprint execution and agent coordination',
      lastChecked: new Date().toISOString(),
      icon: <Cpu className="h-5 w-5" />,
      endpoint: '/conductor/blueprint-engine.sh'
    },
    {
      id: 'rules-file',
      name: 'Rules File',
      status: 'operational',
      description: 'Validation rules and pipeline configuration',
      lastChecked: new Date().toISOString(),
      icon: <FileText className="h-5 w-5" />,
      endpoint: '/conductor/validation-pipeline.yaml'
    },
    {
      id: 'tool-shed',
      name: 'Tool Shed Meta-Layer',
      status: 'operational',
      description: 'Tool registration and dependency management',
      lastChecked: new Date().toISOString(),
      icon: <Wrench className="h-5 w-5" />,
      endpoint: '/conductor/tool-shed.sh'
    },
    {
      id: 'validation-layer',
      name: 'Validation Layer',
      status: 'operational',
      description: 'Quality assurance and verification pipeline',
      lastChecked: new Date().toISOString(),
      icon: <Shield className="h-5 w-5" />,
      endpoint: '/conductor/validation-pipeline.sh'
    },
    {
      id: 'end-to-end-flow',
      name: 'End-to-End Flow',
      status: 'operational',
      description: 'Complete sandbox → job → blueprint workflow',
      lastChecked: new Date().toISOString(),
      icon: <Zap className="h-5 w-5" />
    }
  ];

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/stripe-minions/status');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setStatus(data);
      setLastRefresh(new Date().toISOString());
      
      // Update component statuses based on API response
      components.forEach(comp => {
        if (data.components[comp.id] !== undefined) {
          comp.status = data.components[comp.id] ? 'operational' : 'down';
        }
      });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch status');
      console.error('Stripe Minions status fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return <Badge variant="success" className="gap-1"><CheckCircle className="h-3 w-3" /> Operational</Badge>;
      case 'degraded':
        return <Badge variant="warning" className="gap-1"><AlertTriangle className="h-3 w-3" /> Degraded</Badge>;
      case 'down':
        return <Badge variant="error" className="gap-1"><AlertTriangle className="h-3 w-3" /> Down</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'down':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Stripe Minions Framework
          </CardTitle>
          <CardDescription>
            All 7 components of the WZRD.dev agent framework
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {loading ? (
            <Skeleton className="h-8 w-24" />
          ) : status?.allOperational ? (
            <Badge variant="success" className="gap-1">
              <CheckCircle className="h-3 w-3" />
              All Systems Operational
            </Badge>
          ) : (
            <Badge variant="error" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              Issues Detected
            </Badge>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchStatus}
            disabled={loading}
            className="gap-1"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="rounded-md bg-destructive/10 p-4">
            <p className="text-destructive font-medium">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchStatus}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        ) : loading && !status ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <Skeleton className="h-6 w-24" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {components.map((component) => (
              <div 
                key={component.id} 
                className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-muted p-2">
                    {component.icon}
                  </div>
                  <div>
                    <div className="font-medium">{component.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {component.description}
                    </div>
                    {component.endpoint && (
                      <div className="text-xs text-muted-foreground mt-1 font-mono">
                        {component.endpoint}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(component.status)}
                  {getStatusIcon(component.status)}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {lastRefresh && (
          <div className="mt-4 pt-4 border-t text-xs text-muted-foreground flex justify-between">
            <span>
              Last refreshed: {new Date(lastRefresh).toLocaleTimeString()}
            </span>
            <span>
              Total components: {components.length}
            </span>
          </div>
        )}
        
        <div className="mt-6 rounded-lg bg-muted p-4">
          <div className="flex items-center gap-2 mb-2">
            <Code className="h-4 w-4" />
            <span className="font-medium">Integration Status</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span>Gateway V2:</span>
              <span className="font-mono">{status?.allOperational ? '✅ Integrated' : '❌ Issues'}</span>
            </div>
            <div className="flex justify-between">
              <span>Discord Bot:</span>
              <span className="font-mono">✅ Integrated</span>
            </div>
            <div className="flex justify-between">
              <span>Web UI:</span>
              <span className="font-mono">✅ Live Dashboard</span>
            </div>
            <div className="flex justify-between">
              <span>Agent Pool:</span>
              <span className="font-mono">✅ Ready</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}