'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Clock, MessageSquare, FileText, CheckCircle, Zap, TrendingUp,
  RefreshCw, Activity, Users, Target, Hash, FolderOpen,
  AlertCircle, Play, Pause, Filter
} from 'lucide-react';

interface ActivityEvent {
  id: string;
  type: string;
  timestamp: string;
  source: string;
  description: string;
  topic: string;
  agent: string;
  details: any;
}

export function ActivityPage() {
  const [activityLog, setActivityLog] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTopic, setActiveTopic] = useState<string>('all');
  const [activeSource, setActiveSource] = useState<string>('all');
  const [viewMode, setViewMode] = useState('projects');

  const viewModes = [
    { value: 'activity', label: 'Activity Timeline', icon: <Activity className="w-4 h-4" /> },
    { value: 'projects', label: 'Projects View', icon: <FolderOpen className="w-4 h-4" /> },
  ];

  const [topics, setTopics] = useState<string[]>([]);

  function getEventIcon(type: string) {
    const icons: Record<string, JSX.Element> = {
      'topic_switch': <Target className="w-4 h-4 text-blue-400" />,
      'message': <MessageSquare className="w-4 h-4 text-green-400" />,
      'file_change': <FileText className="w-4 h-4 text-purple-400" />,
      'memory_update': <Activity className="w-4 h-4 text-yellow-400" />,
      'skill_executed': <Zap className="w-4 h-4 text-red-400" />,
      'gateway_connection': <CheckCircle className="w-4 h-4 text-emerald-400" />,
      'task_completed': <CheckCircle className="w-4 h-4 text-emerald-400" />,
    };
    return icons[type] || <Activity className="w-4 h-4" />;
  }

  function getSourceColor(source: string): string {
    const colors: Record<string, string> = {
      'web-ui': 'bg-blue-500',
      'discord': 'bg-purple-500',
      'cli': 'bg-green-500',
      'gateway': 'bg-yellow-500',
      'memory': 'bg-red-500',
      'sandbox': 'bg-indigo-500',
    };
    return colors[source] || 'bg-gray-500';
  }

  function formatTimeAgo(timestamp: string): string {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return String(minutes) + 'm ago';
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return String(hours) + 'h ago';
    return String(Math.floor(hours / 24)) + 'd ago';
  }

  function formatTime(timestamp: string): string {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  const fetchActivityData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/activity');
      if (response.ok) {
        const data = await response.json();
        setActivityLog(data.events || []);
        setTopics(data.topics || []);
      }
    } catch (err) {
      console.error('Failed to fetch activity:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivityData();
    const interval = setInterval(fetchActivityData, 10000);
    return () => clearInterval(interval);
  }, []);

  const liveEvents = activityLog.slice(0, 10);
  const recentEvents = activityLog.slice(10, 30);

  const filteredEvents = activityLog.filter(event => {
    if (activeTopic !== 'all' && event.topic !== activeTopic) return false;
    if (activeSource !== 'all' && event.source !== activeSource) return false;
    return true;
  });

  const topicGroups = topics.reduce((acc, topic) => {
    acc[topic] = activityLog.filter(e => e.topic === topic);
    return acc;
  }, {} as Record<string, ActivityEvent[]>);

  return (
    <div className="h-[calc(100vh-4rem)] bg-background flex flex-col">
      {/* Top Bar - View Mode & Refresh */}
      <div className="border-b border-border p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-semibold">Activity Log</h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">View Mode:</span>
            <Select value={viewMode} onValueChange={setViewMode}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select view" />
              </SelectTrigger>
              <SelectContent>
                {viewModes.map(mode => (
                  <SelectItem key={mode.value} value={mode.value}>
                    <div className="flex items-center gap-2">
                      {mode.icon}
                      <span>{mode.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={fetchActivityData} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-7xl mx-auto">
          {loading && activityLog.length === 0 ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Live Activities */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      <CardTitle>Live Activities</CardTitle>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Live
                    </Badge>
                  </div>
                  <CardDescription>Most recent activity in real-time</CardDescription>
                </CardHeader>
                <CardContent>
                  {liveEvents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No live activity yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {liveEvents.map(event => (
                        <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg bg-accent/50">
                          {getEventIcon(event.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium truncate">{event.description}</span>
                              <Badge variant="outline" className="text-xs">
                                {formatTimeAgo(event.timestamp)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <div className={`w-2 h-2 rounded-full ${getSourceColor(event.source)}`} />
                              <span>{event.source}</span>
                              {event.agent && <span>• {event.agent}</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activities */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <CardTitle>Recent Activities</CardTitle>
                  </div>
                  <CardDescription>Last 20 events from the activity log</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentEvents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No recent activity</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentEvents.map(event => (
                        <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg border border-border">
                          {getEventIcon(event.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium truncate">{event.description}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatTime(event.timestamp)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <div className={`w-2 h-2 rounded-full ${getSourceColor(event.source)}`} />
                              <span>{event.source}</span>
                              {event.topic && <span>• {event.topic}</span>}
                              {event.agent && <span>• {event.agent}</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Projects View */}
              {viewMode === 'projects' && topics.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="w-5 h-5 text-purple-500" />
                      <CardTitle>Projects View</CardTitle>
                    </div>
                    <CardDescription>Activities grouped by topic/project</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topics.map(topic => {
                        const topicEvents = topicGroups[topic] || [];
                        if (topicEvents.length === 0) return null;

                        return (
                          <div key={topic} className="border border-border rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Hash className="w-4 h-4 text-muted-foreground" />
                              <h3 className="font-medium">{topic}</h3>
                              <Badge variant="secondary">{topicEvents.length} events</Badge>
                            </div>
                            <div className="space-y-2">
                              {topicEvents.slice(0, 5).map(event => (
                                <div key={event.id} className="flex items-start gap-2 text-sm">
                                  {getEventIcon(event.type)}
                                  <span className="text-muted-foreground">{formatTime(event.timestamp)}</span>
                                  <span className="flex-1 truncate">{event.description}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Filter Bar */}
      <div className="border-t border-border p-4 bg-card">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Filter:</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Topic:</span>
              <Select value={activeTopic} onValueChange={setActiveTopic}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All topics" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  {topics.map(topic => (
                    <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Source:</span>
              <Select value={activeSource} onValueChange={setActiveSource}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="web-ui">Web UI</SelectItem>
                  <SelectItem value="discord">Discord</SelectItem>
                  <SelectItem value="cli">CLI</SelectItem>
                  <SelectItem value="gateway">Gateway</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {filteredEvents.length} events
          </div>
        </div>
      </div>
    </div>
  );
}
