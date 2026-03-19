import React, { useState, useEffect } from 'react';
import { Sparkles, Lightbulb, Zap, TrendingUp, Shield, AlertTriangle, CheckCircle2, ArrowRight, X, RefreshCw, Filter, ChevronDown, Clock, Target, Beaker, Code, FileText, Database, Activity, Settings, Bug, Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Recommendation {
  id: string;
  type: 'optimization' | 'security' | 'performance' | 'feature' | 'bug' | 'best-practice';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
  effort: 'low' | 'medium' | 'high';
  status: 'new' | 'acknowledged' | 'in-progress' | 'completed' | 'dismissed';
  source: 'ai' | 'system' | 'user';
  createdAt: Date;
  action?: string;
  metrics?: {
    label: string;
    value: string;
    trend?: 'up' | 'down' | 'stable';
  }[];
}

interface RecommendationStats {
  total: number;
  byType: Record<string, number>;
  byImpact: Record<string, number>;
  byStatus: Record<string, number>;
}

export function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterImpact, setFilterImpact] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const generateRecommendations = (): Recommendation[] => {
    const baseRecommendations: Recommendation[] = [
      // Optimization
      {
        id: 'opt-1',
        type: 'optimization',
        title: 'Increase cache TTL for API responses',
        description: 'The current cache TTL of 3600s may be too short for read-heavy endpoints. Consider increasing to 7200s for better hit rates.',
        impact: 'high',
        category: 'Performance',
        effort: 'low',
        status: 'new',
        source: 'ai',
        createdAt: new Date(),
        action: 'Update cache configuration in settings',
        metrics: [
          { label: 'Current Hit Rate', value: '67%', trend: 'stable' },
          { label: 'Projected Hit Rate', value: '82%', trend: 'up' },
        ],
      },
      {
        id: 'opt-2',
        type: 'optimization',
        title: 'Optimize file tree rendering',
        description: 'The file tree component is re-rendering on every state change. Implement React.memo or virtualization for large directories.',
        impact: 'medium',
        category: 'Frontend',
        effort: 'medium',
        status: 'new',
        source: 'ai',
        createdAt: new Date(Date.now() - 3600000),
        action: 'Refactor FilesPage component',
      },
      {
        id: 'opt-3',
        type: 'performance',
        title: 'Enable response compression',
        description: 'Enable gzip compression on the backend to reduce payload sizes by approximately 60-70%.',
        impact: 'high',
        category: 'Backend',
        effort: 'low',
        status: 'acknowledged',
        source: 'system',
        createdAt: new Date(Date.now() - 7200000),
        action: 'Add compression middleware',
      },

      // Security
      {
        id: 'sec-1',
        type: 'security',
        title: 'Implement rate limiting per user',
        description: 'Current rate limiting is global. Implement per-user rate limiting to prevent abuse and ensure fair resource allocation.',
        impact: 'high',
        category: 'Security',
        effort: 'medium',
        status: 'new',
        source: 'ai',
        createdAt: new Date(),
        action: 'Update rate limiting middleware',
        metrics: [
          { label: 'Current', value: 'Global limit', trend: 'stable' },
          { label: 'Recommended', value: 'Per-user limit', trend: 'up' },
        ],
      },
      {
        id: 'sec-2',
        type: 'security',
        title: 'Add CORS headers',
        description: 'Cross-Origin Resource Sharing headers are not configured. Add proper CORS middleware for security.',
        impact: 'medium',
        category: 'Security',
        effort: 'low',
        status: 'in-progress',
        source: 'system',
        createdAt: new Date(Date.now() - 86400000),
        action: 'Configure CORS middleware',
      },

      // Performance
      {
        id: 'perf-1',
        type: 'performance',
        title: 'Database query optimization needed',
        description: 'The scans table query is taking >500ms on average. Consider adding indexes on ticker and date columns.',
        impact: 'high',
        category: 'Database',
        effort: 'medium',
        status: 'new',
        source: 'ai',
        createdAt: new Date(),
        action: 'Add database indexes',
        metrics: [
          { label: 'Avg Query Time', value: '512ms', trend: 'down' },
          { label: 'With Indexes', value: '<50ms', trend: 'up' },
        ],
      },
      {
        id: 'perf-2',
        type: 'performance',
        title: 'Lazy load MCP server configurations',
        description: 'All MCP servers are loaded at startup. Implement lazy loading to improve startup time.',
        impact: 'medium',
        category: 'Performance',
        effort: 'medium',
        status: 'new',
        source: 'ai',
        createdAt: new Date(Date.now() - 1800000),
        action: 'Implement lazy loading',
      },

      // Feature
      {
        id: 'feat-1',
        type: 'feature',
        title: 'Add real-time notifications',
        description: 'Users are requesting real-time notifications for scan completion and errors. Consider WebSocket or Server-Sent Events.',
        impact: 'medium',
        category: 'Feature',
        effort: 'high',
        status: 'acknowledged',
        source: 'user',
        createdAt: new Date(Date.now() - 172800000),
        action: 'Implement notification system',
      },
      {
        id: 'feat-2',
        type: 'feature',
        title: 'Export functionality for scan results',
        description: 'Add ability to export scan results to CSV, JSON, or Excel formats for better data portability.',
        impact: 'low',
        category: 'Feature',
        effort: 'medium',
        status: 'new',
        source: 'user',
        createdAt: new Date(),
        action: 'Add export endpoints',
      },

      // Bug
      {
        id: 'bug-1',
        type: 'bug',
        title: 'Fix memory leak in file preview',
        description: 'The file preview component is not cleaning up Blob URLs when unmounting, causing memory leaks.',
        impact: 'medium',
        category: 'Bug',
        effort: 'low',
        status: 'new',
        source: 'system',
        createdAt: new Date(),
        action: 'Fix memory leak in FilesPage',
      },

      // Best Practice
      {
        id: 'bp-1',
        type: 'best-practice',
        title: 'Add unit tests for critical paths',
        description: 'Code coverage is at 45%. Aim for 80% coverage on critical paths like scan execution and data processing.',
        impact: 'medium',
        category: 'Quality',
        effort: 'high',
        status: 'acknowledged',
        source: 'ai',
        createdAt: new Date(Date.now() - 259200000),
        action: 'Write unit tests',
        metrics: [
          { label: 'Current Coverage', value: '45%', trend: 'stable' },
          { label: 'Target Coverage', value: '80%', trend: 'up' },
        ],
      },
      {
        id: 'bp-2',
        type: 'best-practice',
        title: 'Implement error boundaries',
        description: 'Add React error boundaries to prevent white screen crashes and improve error reporting.',
        impact: 'low',
        category: 'Quality',
        effort: 'medium',
        status: 'new',
        source: 'ai',
        createdAt: new Date(),
        action: 'Add error boundaries',
      },
    ];

    return baseRecommendations;
  };

  useEffect(() => {
    const recs = generateRecommendations();
    setRecommendations(recs);
  }, []);

  const stats: RecommendationStats = {
    total: recommendations.length,
    byType: recommendations.reduce((acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byImpact: recommendations.reduce((acc, r) => {
      acc[r.impact] = (acc[r.impact] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byStatus: recommendations.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  const filteredRecommendations = recommendations.filter(r => {
    const matchesType = !filterType || r.type === filterType;
    const matchesImpact = !filterImpact || r.impact === filterImpact;
    const matchesStatus = !filterStatus || r.status === filterStatus;
    return matchesType && matchesImpact && matchesStatus;
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRecommendations(generateRecommendations());
    setIsRefreshing(false);
  };

  const handleDismiss = (id: string) => {
    setRecommendations(prev => prev.map(r =>
      r.id === id ? { ...r, status: 'dismissed' as const } : r
    ));
  };

  const handleAcknowledge = (id: string) => {
    setRecommendations(prev => prev.map(r =>
      r.id === id ? { ...r, status: 'acknowledged' as const } : r
    ));
  };

  const handleComplete = (id: string) => {
    setRecommendations(prev => prev.map(r =>
      r.id === id ? { ...r, status: 'completed' as const } : r
    ));
  };

  const typeIcons = {
    optimization: <Zap className="w-4 h-4" />,
    security: <Shield className="w-4 h-4" />,
    performance: <Activity className="w-4 h-4" />,
    feature: <Lightbulb className="w-4 h-4" />,
    bug: <Bug className="w-4 h-4" />,
    'best-practice': <Wrench className="w-4 h-4" />,
  };

  const typeColors = {
    optimization: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    security: 'bg-red-500/20 text-red-400 border-red-500/30',
    performance: 'bg-green-500/20 text-green-400 border-green-500/30',
    feature: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    bug: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'best-practice': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  const impactColors = {
    high: 'text-red-400',
    medium: 'text-yellow-400',
    low: 'text-green-400',
  };

  const effortLabels = {
    low: 'Quick Win',
    medium: 'Medium',
    high: 'Complex',
  };

  const statusLabels = {
    new: 'New',
    acknowledged: 'Acknowledged',
    'in-progress': 'In Progress',
    completed: 'Completed',
    dismissed: 'Dismissed',
  };

  const statusColors = {
    new: 'bg-blue-500/20 text-blue-400',
    acknowledged: 'bg-purple-500/20 text-purple-400',
    'in-progress': 'bg-amber-500/20 text-amber-400',
    completed: 'bg-green-500/20 text-green-400',
    dismissed: 'bg-gray-500/20 text-gray-400',
  };

  return (
    <div className="recommendations-page p-6 animate-fade-in">
      {/* Header */}
      <div className="rec-header mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Sparkles className="w-7 h-7 text-primary" />
              <h1 className="page-title">Recommendations</h1>
              <Badge variant="default" className="text-sm">{stats.total} items</Badge>
            </div>
            <p className="page-subtitle">AI-powered insights and optimization suggestions</p>
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="stat-card high-impact">
          <CardContent className="p-4">
            <div className="stat-header">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="stat-label">High Impact</span>
            </div>
            <div className="stat-value">{stats.byImpact.high || 0}</div>
          </CardContent>
        </Card>

        <Card className="stat-card new-items">
          <CardContent className="p-4">
            <div className="stat-header">
              <Lightbulb className="w-4 h-4 text-blue-400" />
              <span className="stat-label">New Items</span>
            </div>
            <div className="stat-value">{stats.byStatus.new || 0}</div>
          </CardContent>
        </Card>

        <Card className="stat-card optimization">
          <CardContent className="p-4">
            <div className="stat-header">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="stat-label">Optimizations</span>
            </div>
            <div className="stat-value">{stats.byType.optimization || 0}</div>
          </CardContent>
        </Card>

        <Card className="stat-card completed">
          <CardContent className="p-4">
            <div className="stat-header">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="stat-label">Completed</span>
            </div>
            <div className="stat-value">{stats.byStatus.completed || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="filters-bar mb-6">
        <div className="filters-header">
          <Filter className="w-4 h-4" />
          <span>Filters</span>
        </div>
        <div className="filters-content">
          <div className="filter-group">
            <span className="filter-label">Type</span>
            <div className="filter-buttons">
              <Button
                variant={filterType === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType(null)}
                className="filter-btn"
              >
                All
              </Button>
              {Object.keys(typeIcons).map(type => (
                <Button
                  key={type}
                  variant={filterType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType(type)}
                  className="filter-btn"
                >
                  {typeIcons[type as keyof typeof typeIcons]}
                  <span className="ml-1 capitalize">{type.replace('-', ' ')}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <span className="filter-label">Impact</span>
            <div className="filter-buttons">
              <Button
                variant={filterImpact === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterImpact(null)}
                className="filter-btn"
              >
                All
              </Button>
              {(['high', 'medium', 'low'] as const).map(impact => (
                <Button
                  key={impact}
                  variant={filterImpact === impact ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterImpact(impact)}
                  className="filter-btn"
                >
                  <span className={impactColors[impact]}>{impact.charAt(0).toUpperCase() + impact.slice(1)}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <span className="filter-label">Status</span>
            <div className="filter-buttons">
              <Button
                variant={filterStatus === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus(null)}
                className="filter-btn"
              >
                All
              </Button>
              {(['new', 'acknowledged', 'in-progress', 'completed'] as const).map(status => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                  className="filter-btn"
                >
                  {statusLabels[status]}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="recommendations-list">
        {filteredRecommendations.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No recommendations found</h3>
              <p className="text-muted-foreground mb-4">
                {filterType || filterImpact || filterStatus
                  ? 'Try adjusting your filters'
                  : 'All recommendations have been addressed'}
              </p>
              {(filterType || filterImpact || filterStatus) && (
                <Button variant="outline" onClick={() => {
                  setFilterType(null);
                  setFilterImpact(null);
                  setFilterStatus(null);
                }}>
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRecommendations.map((rec) => {
              const isExpanded = expandedId === rec.id;
              return (
                <Card
                  key={rec.id}
                  className={`recommendation-card rec-${rec.type} ${rec.status === 'dismissed' ? 'dismissed' : ''}`}
                >
                  <CardHeader>
                    <div className="rec-header-content">
                      <div className="rec-main">
                        <div className="rec-icon-wrapper">
                          {typeIcons[rec.type]}
                        </div>
                        <div className="rec-info">
                          <div className="rec-title-row">
                            <CardTitle className="rec-title">{rec.title}</CardTitle>
                            <Badge variant="default" className={`rec-type-badge ${typeColors[rec.type]}`}>
                              {rec.type}
                            </Badge>
                          </div>
                          <CardDescription className="rec-meta">
                            <span className="rec-category">{rec.category}</span>
                            <span>•</span>
                            <span className={`rec-impact ${impactColors[rec.impact]}`}>
                              {rec.impact} impact
                            </span>
                            <span>•</span>
                            <span className="rec-effort">{effortLabels[rec.effort]}</span>
                            <span>•</span>
                            <span className="rec-source">
                              {rec.source === 'ai' ? 'AI' : rec.source === 'system' ? 'System' : 'User'}
                            </span>
                            <span>•</span>
                            <span className="rec-age">
                              <Clock className="w-3 h-3" />
                              {rec.createdAt.getTime() > Date.now() - 3600000
                                ? 'Just now'
                                : rec.createdAt.getTime() > Date.now() - 86400000
                                ? 'Today'
                                : `${Math.floor((Date.now() - rec.createdAt.getTime()) / 86400000)}d ago`}
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                      <div className="rec-actions">
                        <Badge variant="default" className={`rec-status-badge ${statusColors[rec.status]}`}>
                          {statusLabels[rec.status]}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                        >
                          <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent>
                      <div className="rec-expanded">
                        <div className="rec-description">
                          {rec.description}
                        </div>

                        {rec.action && (
                          <div className="rec-action">
                            <Target className="w-4 h-4" />
                            <span className="action-label">Action:</span>
                            <span className="action-text">{rec.action}</span>
                          </div>
                        )}

                        {rec.metrics && rec.metrics.length > 0 && (
                          <div className="rec-metrics">
                            {rec.metrics.map((metric, idx) => (
                              <div key={idx} className="metric-item">
                                <div className="metric-label">{metric.label}</div>
                                <div className={`metric-value ${metric.trend === 'up' ? 'trend-up' : metric.trend === 'down' ? 'trend-down' : ''}`}>
                                  {metric.value}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="rec-footer">
                          <div className="quick-actions">
                            {rec.status === 'new' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAcknowledge(rec.id)}
                                  className="gap-2"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  Acknowledge
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setRecommendations(prev => prev.map(r =>
                                    r.id === rec.id ? { ...r, status: 'in-progress' as const } : r
                                  ))}
                                  className="gap-2"
                                >
                                  <Code className="w-3 h-3" />
                                  Start
                                </Button>
                              </>
                            )}
                            {rec.status === 'in-progress' && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleComplete(rec.id)}
                                className="gap-2"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                Mark Complete
                              </Button>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDismiss(rec.id)}
                            className="gap-2 text-muted-foreground"
                          >
                            <X className="w-3 h-3" />
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
