import React, { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { Server, Play, Square, Settings, Trash2, RefreshCw, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, StatusDot } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  sandboxesAtom,
  sandboxLoadingAtom,
  sandboxErrorAtom,
  sandboxStatisticsAtom,
} from '@/stores/atoms';
import { sandboxClient, type Sandbox } from '@/lib/sandboxes';
import { cn, formatBytes } from '@/lib/utils';

interface Instance {
  id: string;
  name: string;
  type: string;
  status: 'running' | 'stopped' | 'error';
  health: 'healthy' | 'degraded' | 'unhealthy' | 'warning' | 'error';
  uptime: string;
  cpu: string;
  memory: string;
  port: number | null;
}

function calculateUptime(createdAt: string): string {
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const diff = now - created;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function transformSandboxToInstance(sandbox: Sandbox): Instance {
  return {
    id: sandbox.id,
    name: sandbox.name || sandbox.id,
    type: sandbox.type === 'git_worktree' ? 'Git Worktree' :
          sandbox.type === 'docker_container' ? 'Docker Container' :
          sandbox.type === 'process_namespace' ? 'Process Namespace' :
          'Worktree',
    status: sandbox.status,
    health: sandbox.health as Instance['health'],
    uptime: calculateUptime(sandbox.createdAt),
    cpu: sandbox.resourceUsage?.cpu ? `${sandbox.resourceUsage.cpu.toFixed(1)}%` : '-',
    memory: sandbox.resourceUsage?.memory ? formatBytes(sandbox.resourceUsage.memory) : '-',
    port: sandbox.topicId ? parseInt(sandbox.topicId) || null : null,
  };
}

export function InstancesPage() {
  const [sandboxes, setSandboxes] = useAtom(sandboxesAtom);
  const [loading, setLoading] = useAtom(sandboxLoadingAtom);
  const [error, setError] = useAtom(sandboxErrorAtom);
  const [statistics, setStatistics] = useAtom(sandboxStatisticsAtom);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [sandboxToDelete, setSandboxToDelete] = useState<Sandbox | null>(null);

  // Load sandboxes on mount
  useEffect(() => {
    loadSandboxes();
    const interval = setInterval(loadSandboxes, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadSandboxes = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedSandboxes = await sandboxClient.listSandboxes();
      setSandboxes(fetchedSandboxes);

      // Load statistics
      const stats = await sandboxClient.getStatistics();
      setStatistics(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load instances');
    } finally {
      setLoading(false);
    }
  };

  const handleStartInstance = async (sandbox: Sandbox) => {
    setActionLoading(sandbox.id);
    try {
      await sandboxClient.startSandbox(sandbox.id);
      setSandboxes(prev =>
        prev.map(s => (s.id === sandbox.id ? { ...s, status: 'running' as const } : s))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start instance');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStopInstance = async (sandbox: Sandbox) => {
    setActionLoading(sandbox.id);
    try {
      await sandboxClient.stopSandbox(sandbox.id);
      setSandboxes(prev =>
        prev.map(s => (s.id === sandbox.id ? { ...s, status: 'stopped' as const } : s))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop instance');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteInstance = async () => {
    if (!sandboxToDelete) return;

    try {
      await sandboxClient.deleteSandbox(sandboxToDelete.id);
      setSandboxes(prev => prev.filter(s => s.id !== sandboxToDelete.id));
      setDeleteConfirmOpen(false);
      setSandboxToDelete(null);

      // Refresh statistics
      const stats = await sandboxClient.getStatistics();
      setStatistics(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete instance');
    }
  };

  const instances = sandboxes.map(transformSandboxToInstance);

  const getStatusColor = (status: Instance['status']) => {
    switch (status) {
      case 'running':
        return 'bg-green-500/20 text-green-400';
      case 'stopped':
        return 'bg-gray-500/20 text-gray-400';
      case 'error':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getHealthColor = (health: Instance['health']) => {
    switch (health) {
      case 'healthy':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'degraded':
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'unhealthy':
      case 'error':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Server className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-semibold text-gradient-gold">Instances</h1>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">Running services and projects</p>
          <Button
            variant="outline"
            size="sm"
            onClick={loadSandboxes}
            disabled={loading}
            className="border-white/10 text-gray-400 hover:text-white"
          >
            <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 mb-6">
          {error}
          <Button
            variant="ghost"
            size="sm"
            onClick={loadSandboxes}
            className="ml-4 text-red-400 hover:text-red-300"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Server className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : instances.filter(i => i.status === 'running').length}
                </div>
                <div className="text-xs text-muted-foreground">Running</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <Square className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : instances.filter(i => i.status === 'stopped').length}
                </div>
                <div className="text-xs text-muted-foreground">Stopped</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Settings className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : statistics?.totalSandboxes || instances.length}
                </div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {loading && instances.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">Loading instances...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && instances.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Server className="w-16 h-16 text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No instances found</h3>
          <p className="text-gray-400 max-w-md">
            No sandboxes are currently registered. Create a sandbox to get started.
          </p>
        </div>
      )}

      {/* Instances List */}
      <div className="space-y-3">
        {instances.map((instance) => {
          const sandbox = sandboxes.find(s => s.id === instance.id);
          return (
            <Card key={instance.id} className="group">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Icon + Status */}
                    <div className={`p-3 rounded-lg ${getStatusColor(instance.status)}`}>
                      <Server className={`w-5 h-5 ${
                        instance.status === 'running' ? 'text-green-400' :
                        instance.status === 'error' ? 'text-red-400' :
                        'text-gray-400'
                      }`} />
                    </div>

                    {/* Info */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{instance.name}</h3>
                        <Badge variant={instance.status === 'running' ? 'success' : instance.status === 'error' ? 'error' : 'default'}>
                          <StatusDot status={instance.status === 'running' ? 'online' : instance.status === 'error' ? 'error' : 'offline'} />
                          {instance.status}
                        </Badge>
                        <Badge variant="outline" className={cn('text-xs', getHealthColor(instance.health))}>
                          {instance.health}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ID: {instance.id} • Type: {instance.type}
                      </div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="hidden sm:grid grid-cols-4 gap-6 text-sm">
                    <div>
                      <div className="text-muted-foreground text-xs">Uptime</div>
                      <div className="font-medium">{instance.uptime}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">CPU</div>
                      <div className="font-medium">{instance.cpu}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">Memory</div>
                      <div className="font-medium">{instance.memory}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">Port</div>
                      <div className="font-medium">{instance.port || '-'}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {sandbox && instance.status === 'running' ? (
                      <>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStopInstance(sandbox)}
                          disabled={actionLoading === sandbox.id}
                        >
                          {actionLoading === sandbox.id ? (
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          ) : (
                            <Square className="w-3 h-3 mr-1" />
                          )}
                          Stop
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="w-3 h-3" />
                        </Button>
                      </>
                    ) : sandbox ? (
                      <>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleStartInstance(sandbox)}
                          disabled={actionLoading === sandbox.id}
                        >
                          {actionLoading === sandbox.id ? (
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          ) : (
                            <Play className="w-3 h-3 mr-1" />
                          )}
                          Start
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          onClick={() => {
                            setSandboxToDelete(sandbox);
                            setDeleteConfirmOpen(true);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="bg-[#141414] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-red-400">Delete Instance?</DialogTitle>
            <DialogDescription className="text-gray-400">
              This will permanently delete the instance "{sandboxToDelete?.name || sandboxToDelete?.id}" and all associated
              data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              className="border-white/10 text-gray-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button onClick={handleDeleteInstance} className="bg-red-500 hover:bg-red-600 text-white">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
