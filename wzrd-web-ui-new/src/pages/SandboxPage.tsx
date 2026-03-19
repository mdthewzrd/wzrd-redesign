import { useState, useEffect } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  Container,
  Plus,
  Search,
  MoreVertical,
  Play,
  Square,
  Trash2,
  ExternalLink,
  GitBranch,
  GitCommit,
  Clock,
  HardDrive,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FolderOpen,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  sandboxFilterAtom,
  createSandboxModalOpenAtom,
} from '@/stores/atoms';
import { sandboxClient } from '@/lib/sandboxes';
import type { Sandbox, SandboxStatus, SandboxType, SandboxStatistics } from '@/lib/sandboxes';
import { cn, formatBytes, formatDate } from '@/lib/utils';

export function SandboxPage() {
  // Use local state instead of atoms to avoid type conflicts
  const [loading, setLoading] = useState(false);
  const [sandboxes, setSandboxes] = useState<Sandbox[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<SandboxStatistics>({
    totalSandboxes: 0,
    activeSandboxes: 0,
    healthySandboxes: 0,
    totalDiskUsage: 0,
    byType: { git_worktree: 0, docker_container: 0, process_namespace: 0 }
  });
  
  const filter = useAtomValue(sandboxFilterAtom);
  const setFilter = useSetAtom(sandboxFilterAtom);
  const createModalOpen = useAtomValue(createSandboxModalOpenAtom);
  const setCreateModalOpen = useSetAtom(createSandboxModalOpenAtom);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<SandboxStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<SandboxType | 'all'>('all');
  const [selectedSandbox, setSelectedSandbox] = useState<Sandbox | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [sandboxToDelete, setSandboxToDelete] = useState<Sandbox | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // New sandbox form
  const [newSandboxName, setNewSandboxName] = useState('');
  const [newSandboxType, setNewSandboxType] = useState<SandboxType>('git_worktree');
  const [newSandboxBranch, setNewSandboxBranch] = useState('');
  const [newSandboxDescription, setNewSandboxDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Load sandboxes on mount
  useEffect(() => {
    loadSandboxes();
    const interval = setInterval(loadSandboxes, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadSandboxes = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedSandboxes = await sandboxClient.listSandboxes();
      setSandboxes(fetchedSandboxes);

      // Load statistics
      const stats = await sandboxClient.getStatistics();
      setStatistics(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sandboxes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSandbox = async () => {
    if (!newSandboxName.trim()) return;

    setIsCreating(true);
    try {
      const newSandbox = await sandboxClient.createSandbox({
        name: newSandboxName,
        type: newSandboxType,
        branch: newSandboxBranch || undefined,
        description: newSandboxDescription || undefined,
      });

      (setSandboxes as any)((prev: any) => [...prev, newSandbox]);
      (setCreateModalOpen as any)(false);
      setNewSandboxName('');
      setNewSandboxBranch('');
      setNewSandboxDescription('');

      // Refresh statistics
      const stats = await sandboxClient.getStatistics();
      (setStatistics as any)(stats);
    } catch (err) {
      (setError as any)(err instanceof Error ? err.message : 'Failed to create sandbox');
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartSandbox = async (sandbox: Sandbox) => {
    setActionLoading(sandbox.id);
    try {
      await sandboxClient.startSandbox(sandbox.id);
      setSandboxes(prev =>
        prev.map(s => (s.id === sandbox.id ? { ...s, status: 'running' as const } : s))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start sandbox');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStopSandbox = async (sandbox: Sandbox) => {
    setActionLoading(sandbox.id);
    try {
      await sandboxClient.stopSandbox(sandbox.id);
      setSandboxes(prev =>
        prev.map(s => (s.id === sandbox.id ? { ...s, status: 'stopped' as const } : s))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop sandbox');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteSandbox = async () => {
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
      setError(err instanceof Error ? err.message : 'Failed to delete sandbox');
    }
  };

  const handleViewSandbox = (sandbox: Sandbox) => {
    setSelectedSandbox(sandbox);
    setDetailsOpen(true);
  };

  const handleOpenPath = (path: string) => {
    // In a real implementation, this might open a file explorer or VS Code
    console.log('Opening path:', path);
  };

  const filteredSandboxes = sandboxes.filter(sandbox => {
    const matchesSearch =
      sandbox.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sandbox.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || sandbox.status === statusFilter;
    const matchesType = typeFilter === 'all' || sandbox.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusIcon = (status: SandboxStatus) => {
    switch (status) {
      case 'running':
        return <Play className="w-4 h-4 text-green-400" />;
      case 'stopped':
        return <Square className="w-4 h-4 text-gray-400" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: SandboxStatus) => {
    switch (status) {
      case 'running':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'stopped':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'error':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'error':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTypeLabel = (type: SandboxType) => {
    switch (type) {
      case 'git_worktree':
        return 'Git Worktree';
      case 'docker_container':
        return 'Docker';
      case 'process_namespace':
        return 'Process';
      default:
        return type;
    }
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Sandbox Manager</h1>
            <p className="text-gray-400">Isolated development environments</p>
          </div>
          <div className="flex items-center gap-2">
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
            <Button
              onClick={() => setCreateModalOpen(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Sandbox
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-[#141414] border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Sandboxes</p>
                  <p className="text-2xl font-bold text-white">
                    {statistics?.totalSandboxes || sandboxes.length}
                  </p>
                </div>
                <Container className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#141414] border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active</p>
                  <p className="text-2xl font-bold text-green-400">
                    {statistics?.activeSandboxes || sandboxes.filter(s => s.status === 'running').length}
                  </p>
                </div>
                <Play className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#141414] border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Healthy</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {statistics?.healthySandboxes || 0}
                  </p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#141414] border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Disk Usage</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {formatBytes(statistics?.totalDiskUsage || 0)}
                  </p>
                </div>
                <HardDrive className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search sandboxes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as SandboxStatus | 'all')}
              className="bg-[#1a1a1a] border border-white/10 rounded-md px-3 py-1.5 text-sm text-white"
            >
              <option value="all">All Status</option>
              <option value="running">Running</option>
              <option value="stopped">Stopped</option>
              <option value="error">Error</option>
            </select>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as SandboxType | 'all')}
              className="bg-[#1a1a1a] border border-white/10 rounded-md px-3 py-1.5 text-sm text-white"
            >
              <option value="all">All Types</option>
              <option value="git_worktree">Git Worktree</option>
              <option value="docker_container">Docker</option>
              <option value="process_namespace">Process</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
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

      {/* Sandboxes Grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSandboxes.map(sandbox => (
            <Card
              key={sandbox.id}
              className={cn(
                'bg-[#141414] border-white/10 hover:border-yellow-500/50 transition-all cursor-pointer group'
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 flex items-center justify-center">
                      <Container className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base text-white group-hover:text-yellow-400 transition-colors truncate">
                        {sandbox.name}
                      </CardTitle>
                      <p className="text-xs text-gray-500 truncate">ID: {sandbox.id}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-white/10">
                      <DropdownMenuItem
                        onClick={() => handleViewSandbox(sandbox)}
                        className="text-white hover:bg-white/10"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleOpenPath(sandbox.path)}
                        className="text-white hover:bg-white/10"
                      >
                        <FolderOpen className="w-4 h-4 mr-2" />
                        Open Path
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/10" />
                      {sandbox.status === 'running' ? (
                        <DropdownMenuItem
                          onClick={() => handleStopSandbox(sandbox)}
                          disabled={actionLoading === sandbox.id}
                          className="text-yellow-400 hover:bg-white/10"
                        >
                          <Square className="w-4 h-4 mr-2" />
                          {actionLoading === sandbox.id ? 'Stopping...' : 'Stop'}
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => handleStartSandbox(sandbox)}
                          disabled={actionLoading === sandbox.id}
                          className="text-green-400 hover:bg-white/10"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          {actionLoading === sandbox.id ? 'Starting...' : 'Start'}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem
                        onClick={() => {
                          setSandboxToDelete(sandbox);
                          setDeleteConfirmOpen(true);
                        }}
                        className="text-red-400 hover:bg-white/10"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn('text-xs', getStatusColor(sandbox.status))}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(sandbox.status)}
                      {sandbox.status}
                    </span>
                  </Badge>
                  <Badge variant="outline" className={cn('text-xs', getHealthColor(sandbox.health))}>
                    <span className="flex items-center gap-1">
                      {getHealthIcon(sandbox.health)}
                      {sandbox.health}
                    </span>
                  </Badge>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Filter className="w-3 h-3" />
                    <span>{getTypeLabel(sandbox.type)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>Created {new Date(sandbox.createdAt).toLocaleDateString()}</span>
                  </div>
                  {sandbox.branch && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <GitBranch className="w-3 h-3" />
                      <span className="truncate">{sandbox.branch}</span>
                    </div>
                  )}
                  {sandbox.commit && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <GitCommit className="w-3 h-3" />
                      <span className="font-mono">{sandbox.commit.slice(0, 7)}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="text-xs text-gray-500 truncate flex-1" title={sandbox.path}>
                    {sandbox.path}
                  </div>
                  <div className="flex gap-1">
                    {sandbox.status === 'running' ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10"
                        onClick={() => handleStopSandbox(sandbox)}
                        disabled={actionLoading === sandbox.id}
                      >
                        <Square className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-green-500 hover:text-green-400 hover:bg-green-500/10"
                        onClick={() => handleStartSandbox(sandbox)}
                        disabled={actionLoading === sandbox.id}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-blue-500 hover:text-blue-400 hover:bg-blue-500/10"
                      onClick={() => handleViewSandbox(sandbox)}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                      onClick={() => {
                        setSandboxToDelete(sandbox);
                        setDeleteConfirmOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSandboxes.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Container className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'No sandboxes found'
                : 'No sandboxes yet'}
            </h3>
            <p className="text-gray-400 max-w-md">
              {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first sandbox to get started with isolated development environments'}
            </p>
            {!searchQuery && statusFilter === 'all' && typeFilter === 'all' && (
              <Button
                onClick={() => setCreateModalOpen(true)}
                className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-black"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Sandbox
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Create Sandbox Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="bg-[#141414] border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Plus className="w-5 h-5 text-yellow-500" />
              Create New Sandbox
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Create a new isolated development environment
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1.5 block">Sandbox Name</label>
              <Input
                placeholder="e.g., feature-branch-sandbox"
                value={newSandboxName}
                onChange={e => setNewSandboxName(e.target.value)}
                className="bg-[#1a1a1a] border-white/10 text-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-1.5 block">Type</label>
              <select
                value={newSandboxType}
                onChange={e => setNewSandboxType(e.target.value as SandboxType)}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-md px-3 py-2 text-sm text-white"
              >
                <option value="git_worktree">Git Worktree</option>
                <option value="docker_container">Docker Container</option>
                <option value="process_namespace">Process Namespace</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-1.5 block">
                Branch (optional)
              </label>
              <Input
                placeholder="e.g., feature/new-feature"
                value={newSandboxBranch}
                onChange={e => setNewSandboxBranch(e.target.value)}
                className="bg-[#1a1a1a] border-white/10 text-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-1.5 block">
                Description (optional)
              </label>
              <textarea
                placeholder="What is this sandbox for?"
                value={newSandboxDescription}
                onChange={e => setNewSandboxDescription(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-md p-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 min-h-[80px] resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateModalOpen(false)}
              className="border-white/10 text-gray-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateSandbox}
              disabled={!newSandboxName.trim() || isCreating}
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              {isCreating ? 'Creating...' : 'Create Sandbox'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sandbox Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="bg-[#141414] border-white/10 text-white max-w-2xl max-h-[80vh] overflow-auto">
          {selectedSandbox && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 flex items-center justify-center">
                    <Container className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">{selectedSandbox.name}</DialogTitle>
                    <p className="text-sm text-gray-400">ID: {selectedSandbox.id}</p>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#1a1a1a] rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Status</h4>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedSandbox.status)}
                      <span className="capitalize">{selectedSandbox.status}</span>
                    </div>
                  </div>

                  <div className="bg-[#1a1a1a] rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Health</h4>
                    <div className="flex items-center gap-2">
                      {getHealthIcon(selectedSandbox.health)}
                      <span className="capitalize">{selectedSandbox.health}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1a1a1a] rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Path</h4>
                  <div className="flex items-center gap-2 text-gray-400">
                    <FolderOpen className="w-4 h-4" />
                    <code className="text-sm break-all">{selectedSandbox.path}</code>
                  </div>
                </div>

                {selectedSandbox.branch && (
                  <div className="bg-[#1a1a1a] rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Git Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-400">
                        <GitBranch className="w-4 h-4" />
                        <span>Branch: {selectedSandbox.branch}</span>
                      </div>
                      {selectedSandbox.commit && (
                        <div className="flex items-center gap-2 text-gray-400">
                          <GitCommit className="w-4 h-4" />
                          <span className="font-mono">Commit: {selectedSandbox.commit}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="bg-[#1a1a1a] rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Timestamps</h4>
                  <div className="space-y-1 text-sm text-gray-400">
                    <p>Created: {new Date(selectedSandbox.createdAt).toLocaleString()}</p>
                    <p>Last Accessed: {new Date(selectedSandbox.lastAccessed).toLocaleString()}</p>
                  </div>
                </div>

                {selectedSandbox.description && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Description</h4>
                    <p className="text-gray-400">{selectedSandbox.description}</p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDetailsOpen(false)}
                  className="border-white/10 text-gray-400 hover:text-white"
                >
                  Close
                </Button>
                {selectedSandbox.status === 'running' ? (
                  <Button
                    onClick={() => {
                      handleStopSandbox(selectedSandbox);
                      setDetailsOpen(false);
                    }}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Stop Sandbox
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      handleStartSandbox(selectedSandbox);
                      setDetailsOpen(false);
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Sandbox
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="bg-[#141414] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-red-400">Delete Sandbox?</DialogTitle>
            <DialogDescription className="text-gray-400">
              This will permanently delete the sandbox "{sandboxToDelete?.name}" and all associated
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
            <Button onClick={handleDeleteSandbox} className="bg-red-500 hover:bg-red-600 text-white">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
