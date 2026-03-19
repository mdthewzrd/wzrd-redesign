import React, { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { 
  RefreshCw, 
  Monitor, 
  Terminal, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Activity,
  Wifi,
  WifiOff,
  AlertTriangle,
  Zap,
  FileText,
  MemoryStick,
  ArrowRightLeft,
  History,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Play,
  Pause
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  syncEventsAtom, 
  syncStatusAtom, 
  activeInterfacesAtom,
  topicsAtom,
  type SyncEvent,
  type SyncEventType
} from '@/stores/atoms';

interface InterfaceStatus {
  id: string;
  type: 'discord' | 'web-ui' | 'cli';
  connected: boolean;
  lastActive: number;
  status: 'online' | 'offline' | 'error';
  activeTopic?: string;
}

interface SyncState {
  activeTopic: string | null;
  interfaces: InterfaceStatus[];
  history: SyncEvent[];
  lastUpdate: number;
  connected: boolean;
}

const eventTypeConfig: Record<SyncEventType, { icon: React.ReactNode; color: string; label: string }> = {
  'topic_switch': { 
    icon: <ArrowRightLeft className="w-4 h-4" />, 
    color: 'text-blue-400', 
    label: 'Topic Switch' 
  },
  'message': { 
    icon: <MessageSquare className="w-4 h-4" />, 
    color: 'text-green-400', 
    label: 'Message' 
  },
  'file_change': { 
    icon: <FileText className="w-4 h-4" />, 
    color: 'text-yellow-400', 
    label: 'File Change' 
  },
  'memory_update': { 
    icon: <MemoryStick className="w-4 h-4" />, 
    color: 'text-purple-400', 
    label: 'Memory Update' 
  },
  'progress_update': { 
    icon: <Activity className="w-4 h-4" />, 
    color: 'text-cyan-400', 
    label: 'Progress' 
  },
  'command': { 
    icon: <Terminal className="w-4 h-4" />, 
    color: 'text-orange-400', 
    label: 'Command' 
  },
  'topic_created': { 
    icon: <Zap className="w-4 h-4" />, 
    color: 'text-pink-400', 
    label: 'Topic Created' 
  },
  'topic_mapped': { 
    icon: <RefreshCw className="w-4 h-4" />, 
    color: 'text-indigo-400', 
    label: 'Topic Mapped' 
  },
  'sync_pulse': { 
    icon: <Wifi className="w-4 h-4" />, 
    color: 'text-gray-400', 
    label: 'Sync Pulse' 
  },
};

const interfaceConfig = {
  discord: { 
    name: 'Discord', 
    icon: MessageSquare, 
    description: 'Discord Bot Interface',
    color: 'text-indigo-400'
  },
  'web-ui': { 
    name: 'Web UI', 
    icon: Monitor, 
    description: 'Browser Interface',
    color: 'text-primary'
  },
  cli: { 
    name: 'CLI', 
    icon: Terminal, 
    description: 'Command Line Interface',
    color: 'text-green-400'
  },
};

export function SyncPage() {
  const [syncEvents, setSyncEvents] = useAtom(syncEventsAtom);
  const [syncStatus, setSyncStatus] = useAtom(syncStatusAtom);
  const [activeInterfaces, setActiveInterfaces] = useAtom(activeInterfacesAtom);
  const [topics] = useAtom(topicsAtom);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncState, setSyncState] = useState<SyncState | null>(null);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<Set<SyncEventType>>(new Set());
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Fetch sync state from API or mock data
  const fetchSyncState = async () => {
    try {
      // Try to fetch from sync-state.json
      const response = await fetch('/api/sync/state').catch(() => null);
      
      if (response && response.ok) {
        const data = await response.json();
        setSyncState(data);
        
        // Update atoms
        if (data.history) {
          setSyncEvents(data.history);
        }
        
        // Update interface statuses
        const interfaces: Record<string, boolean> = {
          discord: false,
          web: false,
          cli: false
        };
        
        data.interfaces?.forEach((iface: InterfaceStatus) => {
          if (iface.type === 'discord') interfaces.discord = iface.connected;
          if (iface.type === 'web-ui') interfaces.web = iface.connected;
          if (iface.type === 'cli') interfaces.cli = iface.connected;
        });
        
        setActiveInterfaces(interfaces);
        setSyncStatus(data.connected ? 'connected' : 'disconnected');
      } else {
        // Generate mock sync state
        generateMockSyncState();
      }
    } catch (err) {
      // Generate mock sync state on error
      generateMockSyncState();
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  };

  const generateMockSyncState = () => {
    const now = Date.now();
    const mockState: SyncState = {
      activeTopic: topics[0]?.id || 'general',
      interfaces: [
        { 
          id: 'discord-1', 
          type: 'discord', 
          connected: true, 
          lastActive: now - 30000, 
          status: 'online',
          activeTopic: topics[0]?.id || 'general'
        },
        { 
          id: 'web-ui-1', 
          type: 'web-ui', 
          connected: true, 
          lastActive: now, 
          status: 'online',
          activeTopic: topics[0]?.id || 'general'
        },
        { 
          id: 'cli-1', 
          type: 'cli', 
          connected: true, 
          lastActive: now - 120000, 
          status: 'online',
          activeTopic: topics[0]?.id || 'general'
        },
      ],
      history: generateMockEvents(20),
      lastUpdate: now,
      connected: true,
    };
    
    setSyncState(mockState);
    setSyncEvents(mockState.history);
    setActiveInterfaces({ discord: true, web: true, cli: true });
    setSyncStatus('connected');
  };

  const generateMockEvents = (count: number): SyncEvent[] => {
    const events: SyncEvent[] = [];
    const types: SyncEventType[] = ['topic_switch', 'message', 'file_change', 'memory_update', 'command', 'sync_pulse'];
    const interfaces: ('discord' | 'web-ui' | 'cli')[] = ['discord', 'web-ui', 'cli'];
    
    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const iface = interfaces[Math.floor(Math.random() * interfaces.length)];
      
      events.push({
        id: `sync_${Date.now() - i * 5000}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        interface: iface,
        content: generateEventContent(type),
        topic: topics[Math.floor(Math.random() * topics.length)]?.id || 'general',
        userId: iface === 'discord' ? 'discord-user-123' : undefined,
        channelId: iface === 'discord' ? 'channel-456' : undefined,
        timestamp: Date.now() - i * 5000,
        metadata: { mock: true },
      });
    }
    
    return events;
  };

  const generateEventContent = (type: SyncEventType): string => {
    const contents: Record<SyncEventType, string[]> = {
      'topic_switch': ['Switched to topic', 'Changed active context', 'Topic updated'],
      'message': ['New message received', 'Message synced', 'Chat update'],
      'file_change': ['File modified', 'Document updated', 'Code change detected'],
      'memory_update': ['Memory context updated', 'New memory entry', 'Context refreshed'],
      'progress_update': ['Progress updated', 'Task status changed', 'Milestone reached'],
      'command': ['Command executed', 'CLI command', 'Action performed'],
      'topic_created': ['New topic created', 'Topic initialized', 'Project added'],
      'topic_mapped': ['Topic mapped to channel', 'Interface linked', 'Connection established'],
      'sync_pulse': ['Sync heartbeat', 'Pulse check', 'Status refresh'],
    };
    
    const options = contents[type];
    return options[Math.floor(Math.random() * options.length)];
  };

  // Initial load and auto-refresh
  useEffect(() => {
    fetchSyncState();
    
    let interval: NodeJS.Timeout;
    if (isAutoRefresh) {
      interval = setInterval(fetchSyncState, 5000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoRefresh]);

  // Filter events
  const filteredEvents = syncEvents.filter(event => {
    const matchesSearch = !searchQuery || 
      event.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.interface.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.topic?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedTypes.size === 0 || selectedTypes.has(event.type);
    
    return matchesSearch && matchesType;
  });

  // Statistics
  const stats = {
    totalEvents: syncEvents.length,
    pendingItems: syncEvents.filter(e => e.timestamp > Date.now() - 300000).length,
    connectedInterfaces: Object.values(activeInterfaces).filter(Boolean).length,
    lastSync: syncState?.lastUpdate || Date.now(),
  };

  const toggleEventType = (type: SyncEventType) => {
    setSelectedTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };

  const toggleEventExpand = (eventId: string) => {
    setExpandedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="sync-page p-6 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          <span className="ml-3 text-muted-foreground">Loading sync state...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sync-page p-6 animate-fade-in">
        <div className="flex items-center justify-center h-64 text-red-400">
          <AlertTriangle className="w-8 h-8 mr-3" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="sync-page p-6 animate-fade-in">
      {/* Header */}
      <div className="sync-header mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <RefreshCw className="w-7 h-7 text-primary" />
              <h1 className="page-title">Interface Sync</h1>
              <Badge 
                variant="default" 
                className={syncStatus === 'connected' 
                  ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                  : 'bg-red-500/20 text-red-400 border-red-500/30'
                }
              >
                {syncStatus === 'connected' ? (
                  <><CheckCircle2 className="w-3 h-3 mr-1" /> Connected</>
                ) : (
                  <><WifiOff className="w-3 h-3 mr-1" /> Disconnected</>
                )}
              </Badge>
            </div>
            <p className="page-subtitle">
              Real-time synchronization between Discord, CLI, and Web UI
            </p>
          </div>
          <div className="header-actions flex gap-2">
            <Button
              variant={isAutoRefresh ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              className="gap-2"
            >
              {isAutoRefresh ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isAutoRefresh ? 'Pause' : 'Auto-refresh'}
            </Button>
            <Button variant="default" size="sm" onClick={fetchSyncState} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="stat-header">
              <History className="w-4 h-4 text-primary" />
              <span className="stat-label">Total Events</span>
            </div>
            <div className="stat-value">{stats.totalEvents}</div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="stat-header">
              <Clock className="w-4 h-4 text-yellow-400" />
              <span className="stat-label">Pending Items</span>
            </div>
            <div className="stat-value">{stats.pendingItems}</div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="stat-header">
              <Wifi className="w-4 h-4 text-green-400" />
              <span className="stat-label">Connected</span>
            </div>
            <div className="stat-value">{stats.connectedInterfaces}/3</div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="stat-header">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="stat-label">Last Sync</span>
            </div>
            <div className="stat-value text-sm">{formatRelativeTime(stats.lastSync)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interface Status Grid */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Monitor className="w-4 h-4 text-primary" />
                Interface Status
              </CardTitle>
              <CardDescription>
                Connection status for each interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {syncState?.interfaces.map((iface) => {
                const config = interfaceConfig[iface.type];
                const Icon = config.icon;
                
                return (
                  <div 
                    key={iface.id}
                    className={`interface-card p-4 rounded-lg border ${
                      iface.connected 
                        ? 'border-green-500/30 bg-green-500/5' 
                        : 'border-red-500/30 bg-red-500/5'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-secondary ${config.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium">{config.name}</div>
                          <div className="text-xs text-muted-foreground">{config.description}</div>
                        </div>
                      </div>
                      <Badge 
                        variant="default" 
                        className={iface.connected 
                          ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                          : 'bg-red-500/20 text-red-400 border-red-500/30'
                        }
                      >
                        {iface.connected ? (
                          <><Wifi className="w-3 h-3 mr-1" /> Online</>
                        ) : (
                          <><WifiOff className="w-3 h-3 mr-1" /> Offline</>
                        )}
                      </Badge>
                    </div>
                    
                    {iface.connected && (
                      <div className="mt-3 pt-3 border-t border-white/10 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Active Topic:</span>
                          <span className="text-primary">{iface.activeTopic || 'None'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last Active:</span>
                          <span>{formatRelativeTime(iface.lastActive)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* Overall Sync Status */}
              <div className="mt-4 p-4 rounded-lg bg-secondary/50 border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-primary" />
                    <span className="font-medium">Sync Health</span>
                  </div>
                  <Badge 
                    variant="default" 
                    className={syncStatus === 'connected' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                    }
                  >
                    {syncStatus === 'connected' ? 'Healthy' : 'Degraded'}
                  </Badge>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Last refresh: {lastRefresh.toLocaleTimeString()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Event Log */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <History className="w-4 h-4 text-primary" />
                    Sync Events
                  </CardTitle>
                  <CardDescription>
                    {filteredEvents.length} events • Last updated {formatRelativeTime(lastRefresh.getTime())}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filter */}
              <div className="mb-4 space-y-3">
                <div className="search-bar">
                  <Search className="search-icon" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search events..."
                    className="search-input"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(eventTypeConfig) as SyncEventType[]).map(type => (
                    <Button
                      key={type}
                      variant={selectedTypes.has(type) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleEventType(type)}
                      className="gap-1 text-xs"
                    >
                      {eventTypeConfig[type].icon}
                      <span className="ml-1">{eventTypeConfig[type].label}</span>
                    </Button>
                  ))}
                  {selectedTypes.size > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTypes(new Set())}
                      className="text-xs"
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              </div>

              {/* Events List */}
              <div className="events-container max-h-[500px] overflow-y-auto">
                {filteredEvents.length === 0 ? (
                  <div className="empty-events text-center py-8">
                    <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No sync events found</p>
                    {searchQuery && (
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={() => setSearchQuery('')} 
                        className="mt-4"
                      >
                        Clear Search
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="events-list space-y-2">
                    {filteredEvents.map((event) => {
                      const config = eventTypeConfig[event.type];
                      const isExpanded = expandedEvents.has(event.id);
                      
                      return (
                        <div 
                          key={event.id}
                          className="event-item p-3 rounded-lg bg-secondary/50 border border-white/10 hover:border-primary/30 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 ${config.color}`}>
                              {config.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">{config.label}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {event.interface}
                                  </Badge>
                                  {event.topic && (
                                    <Badge variant="secondary" className="text-xs">
                                      {event.topic}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">
                                    {formatTime(event.timestamp)}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => toggleEventExpand(event.id)}
                                  >
                                    {isExpanded ? (
                                      <ChevronUp className="w-4 h-4" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {event.content}
                              </p>
                              
                              {isExpanded && event.metadata && (
                                <div className="mt-2 p-2 rounded bg-black/30 text-xs font-mono">
                                  <pre className="whitespace-pre-wrap break-all">
                                    {JSON.stringify(event.metadata, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
