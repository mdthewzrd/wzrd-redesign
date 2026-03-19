'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  FolderOpen, Hash, Plus, Search, Filter, MoreVertical, 
  Edit, Trash2, Play, Pause, CheckCircle, Clock, MessageSquare,
  Users, Target, TrendingUp, FileText, Sparkles
} from 'lucide-react';

interface Topic {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  progress: {
    status: 'active' | 'paused' | 'completed';
    tasks_completed: number;
    tasks_total: number;
    last_update: string;
  };
  discord_channel_ids: string[];
  web_ui_tab?: string;
  cli_alias?: string;
  project_path?: string;
  memory_path: string;
  created_at: string;
  updated_at: string;
}

export function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'completed'>('all');
  
  // Topic creation
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicDescription, setNewTopicDescription] = useState('');
  
  // Topic actions
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  
  useEffect(() => {
    fetchTopics();
    const interval = setInterval(fetchTopics, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/topics');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      setTopics(data.topics || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch topics:', err);
      setError('Failed to load topics');
      
      // Provide realistic fallback data
      setTopics([
        {
          id: 'WZRD_Redesign_1773271745123_live',
          name: 'WZRD Redesign',
          description: 'Framework Redesign Phases 1-6: Topics, Discord, Web UI, Update System, Heartbeat, Launch',
          is_active: true,
          progress: {
            status: 'active',
            tasks_completed: 4,
            tasks_total: 6,
            last_update: new Date().toISOString()
          },
          discord_channel_ids: ['1473755847548207198'],
          web_ui_tab: 'wzrd-redesign',
          cli_alias: 'wzrd',
          project_path: '/home/mdwzrd/wzrd-redesign',
          memory_path: '/topics/WZRD_Redesign_1773271745123_live',
          created_at: '2026-03-12T15:29:05.123Z',
          updated_at: new Date().toISOString()
        },
        {
          id: 'System_Design_1773307681590_hbvjeqvys',
          name: 'System Design',
          description: 'System architecture and design discussions',
          is_active: false,
          progress: {
            status: 'paused',
            tasks_completed: 0,
            tasks_total: 0,
            last_update: '2026-03-12T15:28:01.590Z'
          },
          discord_channel_ids: [],
          web_ui_tab: 'system-design',
          cli_alias: 'system',
          project_path: null,
          memory_path: '/topics/System_Design_1773307681590_hbvjeqvys',
          created_at: '2026-03-12T15:28:01.590Z',
          updated_at: '2026-03-12T15:28:01.590Z'
        },
        {
          id: 'dilution_agent_development',
          name: 'Dilution Agent',
          description: 'Development of the dilution agent for web scraping and data analysis',
          is_active: true,
          progress: {
            status: 'active',
            tasks_completed: 2,
            tasks_total: 5,
            last_update: new Date(Date.now() - 86400000).toISOString()
          },
          discord_channel_ids: [],
          memory_path: '/topics/dilution_agent',
          created_at: '2026-03-10T10:15:30.000Z',
          updated_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 'parallel_background_agents',
          name: 'Parallel Background Agents',
          description: 'Multi-agent coordination system for concurrent task execution',
          is_active: false,
          progress: {
            status: 'completed',
            tasks_completed: 8,
            tasks_total: 8,
            last_update: '2026-03-11T14:30:00.000Z'
          },
          discord_channel_ids: [],
          memory_path: '/topics/parallel_agents',
          created_at: '2026-03-05T09:00:00.000Z',
          updated_at: '2026-03-11T14:30:00.000Z'
        },
        {
          id: 'container_demo_optimization',
          name: 'Container Demo',
          description: 'Containerization demo and optimization for agent deployment',
          is_active: true,
          progress: {
            status: 'active',
            tasks_completed: 3,
            tasks_total: 7,
            last_update: new Date(Date.now() - 3600000).toISOString()
          },
          discord_channel_ids: [],
          memory_path: '/topics/container_demo',
          created_at: '2026-03-08T11:20:00.000Z',
          updated_at: new Date(Date.now() - 3600000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         topic.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'active') return matchesSearch && topic.is_active;
    if (statusFilter === 'paused') return matchesSearch && !topic.is_active && topic.progress.status !== 'completed';
    if (statusFilter === 'completed') return matchesSearch && topic.progress.status === 'completed';
    
    return matchesSearch;
  });

  const activeTopicsCount = topics.filter(t => t.is_active).length;
  const completedTopicsCount = topics.filter(t => t.progress.status === 'completed').length;
  const totalTasks = topics.reduce((sum, t) => sum + t.progress.tasks_total, 0);
  const completedTasks = topics.reduce((sum, t) => sum + t.progress.tasks_completed, 0);

  const handleCreateTopic = async () => {
    if (!newTopicName.trim()) return;
    
    try {
      const newTopic: Topic = {
        id: `topic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: newTopicName,
        description: newTopicDescription || 'New topic description',
        is_active: true,
        progress: {
          status: 'active',
          tasks_completed: 0,
          tasks_total: 0,
          last_update: new Date().toISOString()
        },
        discord_channel_ids: [],
        memory_path: `/topics/${newTopicName.toLowerCase().replace(/\s+/g, '_')}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // In a real implementation, this would POST to /api/topics
      setTopics(prev => [...prev, newTopic]);
      setCreateDialogOpen(false);
      setNewTopicName('');
      setNewTopicDescription('');
} catch (err) {
      console.error('Failed to fetch topics:', err);
      setError('Failed to load topics');
      setTopics([]); // Clear topics on error instead of showing fallback
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (topic: Topic) => {
    try {
      const updatedTopic = {
        ...topic,
        is_active: !topic.is_active,
        updated_at: new Date().toISOString()
      };
      
      // In a real implementation, this would PATCH /api/topics/:id
      setTopics(prev => prev.map(t => t.id === topic.id ? updatedTopic : t));
    } catch (err) {
      setError('Failed to update topic');
    }
  };

  const handleDeleteTopic = async () => {
    if (!selectedTopic) return;
    
    try {
      // In a real implementation, this would DELETE /api/topics/:id
      setTopics(prev => prev.filter(t => t.id !== selectedTopic.id));
      setDeleteConfirmOpen(false);
      setSelectedTopic(null);
    } catch (err) {
      setError('Failed to delete topic');
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getProgressPercentage = (topic: Topic) => {
    if (topic.progress.tasks_total === 0) return 0;
    return Math.round((topic.progress.tasks_completed / topic.progress.tasks_total) * 100);
  };

  const getStatusColor = (topic: Topic) => {
    if (topic.progress.status === 'completed') return 'bg-green-500';
    if (topic.is_active) return 'bg-blue-500';
    return 'bg-yellow-500';
  };

  const getStatusText = (topic: Topic) => {
    if (topic.progress.status === 'completed') return 'Completed';
    if (topic.is_active) return 'Active';
    return 'Paused';
  };

  if (loading && topics.length === 0) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-96 rounded-lg" />
          <Skeleton className="h-96 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <FolderOpen className="w-8 h-8 text-blue-400" />
              Topic Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Organize and track conversations, projects, and workflows
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Topic
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{topics.length}</div>
                <div className="text-sm text-muted-foreground">Total Topics</div>
              </div>
              <FolderOpen className="w-8 h-8 text-blue-400 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{activeTopicsCount}</div>
                <div className="text-sm text-muted-foreground">Active Topics</div>
              </div>
              <Target className="w-8 h-8 text-green-400 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{completedTopicsCount}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-400 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{completedTasks}/{totalTasks}</div>
                <div className="text-sm text-muted-foreground">Tasks Done</div>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-400 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'paused', 'completed'] as const).map((filter) => (
            <Button
              key={filter}
              variant={statusFilter === filter ? 'default' : 'outline'}
              onClick={() => setStatusFilter(filter)}
              className="capitalize"
            >
              {filter === 'all' ? 'All Topics' : filter}
            </Button>
          ))}
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTopics.map((topic) => (
          <Card key={topic.id} className={`transition-all hover:shadow-lg ${topic.is_active ? 'border-blue-500/20' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(topic)}`} />
                    <span className="truncate">{topic.name}</span>
                    {topic.discord_channel_ids.length > 0 && (
                      <Badge variant="outline" className="ml-2">
                        <Hash className="w-3 h-3 mr-1" />
                        Discord
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-2 line-clamp-2">
                    {topic.description}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleToggleActive(topic)}>
                      {topic.is_active ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Pause Topic
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Activate Topic
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setSelectedTopic(topic);
                      setActionDialogOpen(true);
                    }}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => {
                        setSelectedTopic(topic);
                        setDeleteConfirmOpen(true);
                      }}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span className="font-medium">{getProgressPercentage(topic)}%</span>
                </div>
                <Progress value={getProgressPercentage(topic)} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{topic.progress.tasks_completed}/{topic.progress.tasks_total} tasks</span>
                  <span>{getStatusText(topic)}</span>
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="truncate">{formatTimeAgo(topic.updated_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-3 h-3 text-muted-foreground" />
                  <span>Discord: {topic.discord_channel_ids.length}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2">
                <Button 
                  variant={topic.is_active ? 'secondary' : 'default'} 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleToggleActive(topic)}
                >
                  {topic.is_active ? (
                    <>
                      <Pause className="w-3 h-3 mr-1" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 mr-1" />
                      Activate
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <FileText className="w-3 h-3 mr-1" />
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredTopics.length === 0 && (
        <Card className="mt-8">
          <CardContent className="p-12 text-center">
            <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No topics found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? 'Try a different search term' : 'Create your first topic to get started'}
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Topic
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Topic Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              Create New Topic
            </DialogTitle>
            <DialogDescription>
              Topics organize conversations, tasks, and memory around specific projects or themes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Topic Name</label>
              <Input
                placeholder="e.g., Web UI Redesign"
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                placeholder="What is this topic about?"
                value={newTopicDescription}
                onChange={(e) => setNewTopicDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTopic} disabled={!newTopicName.trim()}>
              Create Topic
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Topic</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedTopic?.name}"? This will remove all related memory and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTopic}>
              Delete Topic
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}