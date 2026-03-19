import React, { useState, useEffect, useCallback } from 'react';
import { useAtom } from 'jotai';
import { 
  ScrollText, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  Play, 
  Pause, 
  RotateCcw, 
  Terminal, 
  Network, 
  Database, 
  Activity, 
  Cpu, 
  HardDrive, 
  Zap, 
  Bug, 
  AlertTriangle, 
  Download, 
  Eye, 
  EyeOff,
  FileText,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  File,
  FolderOpen
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { logFilesAtom, currentLogAtom } from '@/stores/atoms';

interface LogFile {
  name: string;
  path: string;
  size: number;
  modified: number;
  type: 'log' | 'json' | 'md';
}

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'success' | 'warning' | 'error' | 'debug';
  message: string;
  source: string;
  agent?: string;
  duration?: number;
  metadata?: Record<string, any>;
  raw?: string;
}

interface LogStats {
  total: number;
  info: number;
  success: number;
  warning: number;
  error: number;
  debug: number;
}

const logSources = [
  { id: 'gateway', name: 'Gateway', icon: Network },
  { id: 'renata', name: 'Renata', icon: Activity },
  { id: 'remi', name: 'Remi', icon: Zap },
  { id: 'claude', name: 'Claude', icon: Bug },
  { id: 'database', name: 'Database', icon: Database },
  { id: 'system', name: 'System', icon: Cpu },
  { id: 'websocket', name: 'WebSocket', icon: Network },
  { id: 'api', name: 'API', icon: Terminal },
  { id: 'skills', name: 'Skills', icon: Zap },
  { id: 'monitor', name: 'Monitor', icon: Activity },
];

const logLevels = ['debug', 'info', 'success', 'warning', 'error'] as const;

export function LogsPage() {
  const [logFiles, setLogFiles] = useAtom(logFilesAtom);
  const [currentLog, setCurrentLog] = useAtom(currentLogAtom);
  
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<Set<string>>(new Set(['info', 'success', 'warning', 'error']));
  const [selectedSources, setSelectedSources] = useState<Set<string>>(new Set(logSources.map(s => s.id)));
  const [searchQuery, setSearchQuery] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showMetadata, setShowMetadata] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'live' | 'files'>('live');
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  // Fetch log files list
  const fetchLogFiles = useCallback(async () => {
    try {
      const response = await fetch('/api/logs');
      if (!response.ok) throw new Error('Failed to fetch log files');
      const data = await response.json();
      setLogFiles(data.files || []);
    } catch (err) {
      console.error('Error fetching log files:', err);
      // Don't set error here, we'll try to use live logs
    }
  }, [setLogFiles]);

  // Fetch specific log file
  const fetchLogContent = useCallback(async (filename: string) => {
    try {
      const response = await fetch(`/api/logs/${encodeURIComponent(filename)}`);
      if (!response.ok) throw new Error('Failed to fetch log content');
      const data = await response.json();
      
      // Parse log content
      const parsedLogs = parseLogContent(data.content, filename);
      setLogs(parsedLogs);
      setFilteredLogs(parsedLogs);
      setCurrentLog(filename);
    } catch (err) {
      console.error('Error fetching log content:', err);
      setError('Failed to load log file');
    }
  }, [setCurrentLog]);

  // Parse different log formats
  const parseLogContent = (content: string, filename: string): LogEntry[] => {
    const entries: LogEntry[] = [];
    const lines = content.split('\n').filter(line => line.trim());
    
    // Try to detect log format
    if (filename.includes('cli')) {
      // CLI log format: [timestamp] [LEVEL] message
      lines.forEach((line, index) => {
        const match = line.match(/\[([\d\-T:.Z]+)\]\s*\[(\w+)\]\s*(.+)/);
        if (match) {
          const [, timestamp, level, message] = match;
          entries.push({
            id: `${filename}-${index}`,
            timestamp: new Date(timestamp),
            level: mapLogLevel(level),
            message: message.trim(),
            source: 'cli',
            raw: line,
          });
        } else {
          // Fallback for unparsable lines
          entries.push({
            id: `${filename}-${index}`,
            timestamp: new Date(),
            level: 'info',
            message: line.trim(),
            source: 'cli',
            raw: line,
          });
        }
      });
    } else if (filename.includes('job') || filename.includes('health-check')) {
      // Job log format (JSON)
      try {
        // Try to parse as JSON
        const jsonContent = `[${lines.join(',').replace(/\}\s*\{/g, '},{')}]`;
        const jsonLogs = JSON.parse(jsonContent);
        jsonLogs.forEach((entry: any, index: number) => {
          entries.push({
            id: `${filename}-${index}`,
            timestamp: new Date(entry.startTime || entry.endTime || Date.now()),
            level: entry.status === 'success' ? 'success' : entry.status === 'error' ? 'error' : 'info',
            message: entry.jobName || entry.output || JSON.stringify(entry).slice(0, 100),
            source: 'system',
            metadata: entry,
            raw: JSON.stringify(entry, null, 2),
          });
        });
      } catch {
        // Fallback to line-by-line
        lines.forEach((line, index) => {
          entries.push({
            id: `${filename}-${index}`,
            timestamp: new Date(),
            level: 'info',
            message: line.trim(),
            source: 'system',
            raw: line,
          });
        });
      }
    } else {
      // Generic format - try to parse timestamp and level
      lines.forEach((line, index) => {
        const timestampMatch = line.match(/(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2})/);
        const levelMatch = line.match(/\b(INFO|WARN|ERROR|DEBUG|SUCCESS)\b/i);
        
        entries.push({
          id: `${filename}-${index}`,
          timestamp: timestampMatch ? new Date(timestampMatch[1]) : new Date(),
          level: levelMatch ? mapLogLevel(levelMatch[1]) : 'info',
          message: line.trim().slice(0, 200),
          source: 'system',
          raw: line,
        });
      });
    }
    
    return entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  const mapLogLevel = (level: string): LogEntry['level'] => {
    const levelMap: Record<string, LogEntry['level']> = {
      'INFO': 'info',
      'WARN': 'warning',
      'WARNING': 'warning',
      'ERROR': 'error',
      'DEBUG': 'debug',
      'SUCCESS': 'success',
    };
    return levelMap[level.toUpperCase()] || 'info';
  };

  // Initial load
  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      await fetchLogFiles();
      
      // Try to load cli.log by default
      await fetchLogContent('cli.log');
      
      setLoading(false);
    };
    
    loadInitial();
  }, [fetchLogFiles, fetchLogContent]);

  // Auto-refresh
  useEffect(() => {
    if (!isAutoRefresh || activeTab !== 'live' || currentLog !== 'cli.log') return;
    
    const interval = setInterval(() => {
      fetchLogContent('cli.log');
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isAutoRefresh, activeTab, currentLog, fetchLogContent]);

  const filterLogs = (logsToFilter: LogEntry[], levels: Set<string>, sources: Set<string>, query: string) => {
    return logsToFilter.filter(log => {
      const matchesLevel = levels.has(log.level);
      const matchesSource = sources.has(log.source);
      const matchesQuery = !query || 
        log.message.toLowerCase().includes(query.toLowerCase()) ||
        log.source.toLowerCase().includes(query.toLowerCase()) ||
        (log.agent && log.agent.toLowerCase().includes(query.toLowerCase()));
      return matchesLevel && matchesSource && matchesQuery;
    });
  };

  useEffect(() => {
    setFilteredLogs(filterLogs(logs, selectedLevels, selectedSources, searchQuery));
  }, [logs, selectedLevels, selectedSources, searchQuery]);

  const stats: LogStats = {
    total: filteredLogs.length,
    info: filteredLogs.filter(l => l.level === 'info').length,
    success: filteredLogs.filter(l => l.level === 'success').length,
    warning: filteredLogs.filter(l => l.level === 'warning').length,
    error: filteredLogs.filter(l => l.level === 'error').length,
    debug: filteredLogs.filter(l => l.level === 'debug').length,
  };

  const toggleLevel = (level: string) => {
    setSelectedLevels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(level)) {
        newSet.delete(level);
      } else {
        newSet.add(level);
      }
      return newSet;
    });
  };

  const toggleSource = (source: string) => {
    setSelectedSources(prev => {
      const newSet = new Set(prev);
      if (newSet.has(source)) {
        newSet.delete(source);
      } else {
        newSet.add(source);
      }
      return newSet;
    });
  };

  const exportLogs = () => {
    const data = filteredLogs.map(log => ({
      timestamp: log.timestamp.toISOString(),
      level: log.level,
      message: log.message,
      source: log.source,
      agent: log.agent,
      duration: log.duration,
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wzrd-logs-${currentLog || 'export'}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  const levelIcons = {
    debug: <Bug className="w-4 h-4 text-gray-400" />,
    info: <Info className="w-4 h-4 text-blue-400" />,
    success: <CheckCircle className="w-4 h-4 text-green-400" />,
    warning: <AlertTriangle className="w-4 h-4 text-yellow-400" />,
    error: <XCircle className="w-4 h-4 text-red-400" />,
  };

  const levelColors = {
    debug: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    success: 'bg-green-500/20 text-green-400 border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    error: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const levelBorderColors = {
    debug: 'border-l-gray-500',
    info: 'border-l-blue-500',
    success: 'border-l-green-500',
    warning: 'border-l-yellow-500',
    error: 'border-l-red-500',
  };

  if (loading) {
    return (
      <div className="logs-page p-6 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          <span className="ml-3 text-muted-foreground">Loading logs...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="logs-page p-6 animate-fade-in">
        <div className="flex items-center justify-center h-64 text-red-400">
          <AlertTriangle className="w-8 h-8 mr-3" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="logs-page p-6 animate-fade-in">
      {/* Header */}
      <div className="logs-header mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <ScrollText className="w-7 h-7 text-primary" />
              <h1 className="page-title">System Logs</h1>
              <Badge variant="default" className="text-sm">{stats.total} entries</Badge>
              {!isPaused && activeTab === 'live' && (
                <Badge variant="default" className="text-xs animate-pulse">LIVE</Badge>
              )}
            </div>
            <p className="page-subtitle">
              {currentLog ? `Viewing: ${currentLog}` : 'Real-time system events and debug information'}
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
            <Button variant="default" size="sm" onClick={exportLogs} className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'live' | 'files')} className="mb-6">
        <TabsList>
          <TabsTrigger value="live" className="gap-2">
            <Activity className="w-4 h-4" />
            Live Logs
          </TabsTrigger>
          <TabsTrigger value="files" className="gap-2">
            <FolderOpen className="w-4 h-4" />
            Log Files ({logFiles.length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Stats */}
      <div className="stats-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Card className="stat-card debug-card">
          <CardContent className="p-4">
            <div className="stat-header">
              <Bug className="w-4 h-4 text-gray-400" />
              <span className="stat-label">Debug</span>
            </div>
            <div className="stat-value">{stats.debug}</div>
          </CardContent>
        </Card>

        <Card className="stat-card info-card">
          <CardContent className="p-4">
            <div className="stat-header">
              <Info className="w-4 h-4 text-blue-400" />
              <span className="stat-label">Info</span>
            </div>
            <div className="stat-value">{stats.info}</div>
          </CardContent>
        </Card>

        <Card className="stat-card success-card">
          <CardContent className="p-4">
            <div className="stat-header">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="stat-label">Success</span>
            </div>
            <div className="stat-value">{stats.success}</div>
          </CardContent>
        </Card>

        <Card className="stat-card warning-card">
          <CardContent className="p-4">
            <div className="stat-header">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span className="stat-label">Warning</span>
            </div>
            <div className="stat-value">{stats.warning}</div>
          </CardContent>
        </Card>

        <Card className="stat-card error-card">
          <CardContent className="p-4">
            <div className="stat-header">
              <XCircle className="w-4 h-4 text-red-400" />
              <span className="stat-label">Error</span>
            </div>
            <div className="stat-value">{stats.error}</div>
          </CardContent>
        </Card>

        <Card className="stat-card total-card">
          <CardContent className="p-4">
            <div className="stat-header">
              <Activity className="w-4 h-4 text-primary" />
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-value">{stats.total}</div>
          </CardContent>
        </Card>
      </div>

      {activeTab === 'files' ? (
        /* Log Files List */
        <Card className="logs-files-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-primary" />
              Available Log Files
            </CardTitle>
            <CardDescription>
              Click on a file to view its contents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="search-bar mb-4">
              <Search className="search-icon" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search log files..."
                className="search-input"
              />
            </div>
            
            <div className="log-files-grid grid gap-2">
              {logFiles
                .filter(file => file.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .sort((a, b) => b.modified - a.modified)
                .map((file) => (
                <div
                  key={file.path}
                  onClick={() => {
                    fetchLogContent(file.name);
                    setActiveTab('live');
                  }}
                  className="log-file-item p-3 rounded-lg bg-secondary/50 border border-white/10 hover:border-primary/30 hover:bg-secondary cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-medium text-sm">{file.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(file.modified)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="text-xs">
                        {formatFileSize(file.size)}
                      </Badge>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              ))}
              
              {logFiles.length === 0 && (
                <div className="empty-state text-center py-8">
                  <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No log files found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Search and Filters */}
          <div className="filters-section mb-6">
            <div className="search-bar">
              <Search className="search-icon" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs by message, source, or agent..."
                className="search-input"
              />
            </div>

            <div className="filter-groups">
              {/* Level Filters */}
              <div className="filter-group">
                <div className="filter-label flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Log Level
                </div>
                <div className="filter-pills">
                  {logLevels.map(level => (
                    <Button
                      key={level}
                      variant={selectedLevels.has(level) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleLevel(level)}
                      className="level-pill"
                    >
                      {levelIcons[level]}
                      <span className="ml-1 capitalize">{level}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Source Filters */}
              <div className="filter-group">
                <div className="filter-label flex items-center gap-2">
                  <Network className="w-4 h-4" />
                  Source
                </div>
                <div className="filter-pills">
                  {logSources.map(source => {
                    const SourceIcon = source.icon;
                    return (
                      <Button
                        key={source.id}
                        variant={selectedSources.has(source.id) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleSource(source.id)}
                        className="source-pill"
                      >
                        <SourceIcon className="w-3 h-3" />
                        <span className="ml-1">{source.name}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* View Options */}
            <div className="view-options">
              <Button
                variant={autoScroll ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAutoScroll(!autoScroll)}
                className="view-option"
              >
                {autoScroll ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span className="ml-1">Auto Scroll</span>
              </Button>
              <Button
                variant={showMetadata ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowMetadata(!showMetadata)}
                className="view-option"
              >
                <Terminal className="w-4 h-4" />
                <span className="ml-1">Show Metadata</span>
              </Button>
            </div>
          </div>

          {/* Logs Display */}
          <Card className="logs-display-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Log Stream</CardTitle>
                  <CardDescription>
                    {filteredLogs.length} entries • {selectedLevels.size} levels • {selectedSources.size} sources
                  </CardDescription>
                </div>
                <Clock className="w-4 h-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div
                ref={el => {
                  if (el && autoScroll && !isPaused) {
                    el.scrollTop = 0;
                  }
                }}
                className="logs-container"
              >
                {filteredLogs.length === 0 ? (
                  <div className="empty-logs">
                    <ScrollText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p>No logs match your filters</p>
                    <Button variant="default" size="sm" onClick={() => {
                      setSelectedLevels(new Set(['info', 'success', 'warning', 'error']));
                      setSelectedSources(new Set(logSources.map(s => s.id)));
                      setSearchQuery('');
                    }} className="mt-4">
                      Reset Filters
                    </Button>
                  </div>
                ) : (
                  <div className="logs-list">
                    {filteredLogs.map((log) => {
                      const SourceIcon = logSources.find(s => s.id === log.source)?.icon || Terminal;
                      return (
                        <div
                          key={log.id}
                          className={`log-entry log-${log.level} ${levelBorderColors[log.level]}`}
                        >
                          <div className="log-main">
                            <div className="log-timestamp">
                              {log.timestamp.toLocaleTimeString('en-US', { hour12: false })}
                            </div>
                            {levelIcons[log.level]}
                            <div className="log-source">
                              <SourceIcon className="w-3 h-3" />
                              <span>{log.source}</span>
                            </div>
                            {log.agent && (
                              <div className="log-agent">
                                <Zap className="w-3 h-3" />
                                <span>{log.agent}</span>
                              </div>
                            )}
                            <div className="log-message">{log.message}</div>
                            {log.duration && (
                              <div className="log-duration">
                                <Clock className="w-3 h-3" />
                                <span>{log.duration}ms</span>
                              </div>
                            )}
                            <Badge variant="default" className={`log-badge ${levelColors[log.level]}`}>
                              {log.level.toUpperCase()}
                            </Badge>
                          </div>
                          {showMetadata && log.metadata && (
                            <div className="log-metadata">
                              <Terminal className="w-3 h-3" />
                              <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
