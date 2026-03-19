import React, { useState, useEffect } from 'react';
import { 
  Zap, Code, Activity, Clock, Database, Shield, 
  BarChart3, CheckCircle2, AlertCircle, 
  Filter, RefreshCw, Search, Layers, Container,
  Brain, Trophy, FileCode, Code2, Boxes, Lock, Palette,
  Database as DataIcon, BrainCircuit, LayoutGrid, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAtom } from 'jotai';
import { gateway } from '@/lib/gateway';
import { 
  skillsAtom, 
  skillsLoadingAtom, 
  skillsErrorAtom,
  skillCategoriesAtom,
  skillFilterAtom,
  skillCategoryFilterAtom,
  systemMetricsAtom,
  type Skill 
} from '@/stores/atoms';
import { skillsClient, getCategoryColor, getCategoryBgColor, transformSkillToUI } from '@/lib/skills';

interface SkillUsage {
  skill: string;
  executions: number;
  successRate: string;
  avgTime: string;
  lastExecuted: string;
}

interface ExecutionMetrics {
  executions: SkillUsage[];
  total: number;
  successRate: number;
  avgTime: number;
  running: number;
}

// Category icon mapping
const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  development: Code2,
  architecture: Boxes,
  infrastructure: Container,
  security: Lock,
  ai_ml: BrainCircuit,
  business: BarChart3,
  ui_ux: Palette,
  data: DataIcon,
  general: Zap,
};

// Skill icon mapping by category
const getSkillIcon = (categoryId: string) => {
  const icons: Record<string, any> = {
    development: Code,
    architecture: Boxes,
    infrastructure: Container,
    security: Shield,
    ai_ml: Brain,
    business: BarChart3,
    ui_ux: Palette,
    data: Database,
  };
  return icons[categoryId.toLowerCase()] || Zap;
};

export function SkillsPage() {
  const [skills, setSkills] = useAtom(skillsAtom);
  const [loading, setLoading] = useAtom(skillsLoadingAtom);
  const [error, setError] = useAtom(skillsErrorAtom);
  const [categories, setCategories] = useAtom(skillCategoriesAtom);
  const [filter, setFilter] = useAtom(skillFilterAtom);
  const [categoryFilter, setCategoryFilter] = useAtom(skillCategoryFilterAtom);
  const [executionMetrics, setExecutionMetrics] = useState<ExecutionMetrics | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Fetch skills data
  useEffect(() => {
    async function fetchSkills() {
      setLoading(true);
      setError(null);
      
      try {
        const response = await skillsClient.listSkills();
        const transformedSkills = response.skills.map(transformSkillToUI);
        setSkills(transformedSkills);
        
        // Transform categories
        const categoryInfo = response.categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          description: cat.description,
          count: cat.skills.length,
        }));
        setCategories(categoryInfo);
      } catch (err) {
        console.error('Failed to fetch skills:', err);
        setError(err instanceof Error ? err.message : 'Failed to load skills');
      } finally {
        setLoading(false);
      }
    }

    fetchSkills();
  }, [setSkills, setCategories, setLoading, setError]);

  // Listen for Gateway metrics updates
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('gateway:metrics', (event: any) => {
        const data = event.detail;
        if (data) {
          setExecutionMetrics(data);
          setIsConnected(true);
        }
      });
    }

    async function fetchMetrics() {
      try {
        await gateway.getMetrics();
      } catch (err) {
        console.error('Failed to fetch execution metrics:', err);
      }
    }

    fetchMetrics();
  }, []);

  // Filter skills
  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(filter.toLowerCase()) ||
                         skill.description?.toLowerCase().includes(filter.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || skill.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Group skills by category
  const skillsByCategory = filteredSkills.reduce((acc, skill) => {
    if (!acc[skill.categoryId]) {
      acc[skill.categoryId] = [];
    }
    acc[skill.categoryId].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  const running = executionMetrics?.running || 0;
  const loadedCount = skills.filter(s => s.isLoaded).length;
  const totalCount = skills.length;

  // Parse success rate string to number
  const parseSuccessRate = (rate: string): number => {
    const match = rate.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  };

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gradient-gold">Skills</h1>
        <p className="text-muted-foreground mt-1">
          {running > 0 ? `${running} active now` : `${loadedCount} skills loaded from ${totalCount} available`}
        </p>
      </div>

      {/* Connection Status & Stats */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className={`w-5 h-5 ${isConnected ? 'text-green-400' : 'text-gray-400'}`} />
          <span className="text-sm text-muted-foreground">
            {isConnected ? 'Connected to Gateway' : 'Waiting for connection...'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {loadedCount} of {totalCount} skills loaded
          </span>
        </div>
      </div>

      {/* Stats Bar */}
      {executionMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Executions</CardTitle>
              <CardDescription>All skill invocations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-foreground">{executionMetrics.total}</div>
              <div className="text-sm text-muted-foreground">lifetime total</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Success Rate</CardTitle>
              <CardDescription>Overall success rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-green-400">{executionMetrics.successRate.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">across all skills</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Average Response</CardTitle>
              <CardDescription>Mean execution time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-foreground">{executionMetrics.avgTime}ms</div>
              <div className="text-sm text-muted-foreground">per invocation</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Currently Running</CardTitle>
              <CardDescription>Active skill executions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-blue-400">{running}</div>
              <div className="text-sm text-muted-foreground">skill(s) executing</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Controls */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search skills..."
              className="w-64"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          
          {/* Category filter buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={categoryFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategoryFilter('all')}
            >
              All
            </Button>
            {categories.map(cat => (
              <Button
                key={cat.id}
                variant={categoryFilter === cat.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter(cat.id)}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => skillsClient.listSkills().then(r => setSkills(r.skills.map(transformSkillToUI)))}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => gateway.getMetrics()}>
            <Activity className="mr-2 h-4 w-4" />
            Metrics
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading skills from Tool Shed...</p>
          <p className="text-xs text-muted-foreground mt-2">Scanning {totalCount} skills</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <p className="text-red-400 font-medium">Failed to load skills</p>
          <p className="text-muted-foreground text-sm mt-1">{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      )}

      {/* Skills Grid by Category */}
      {!loading && !error && filteredSkills.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="w-16 h-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No skills match your search</p>
          <Button className="mt-4" variant="outline" onClick={() => { setFilter(''); setCategoryFilter('all'); }}>
            Clear Filters
          </Button>
        </div>
      )}

      {!loading && !error && filteredSkills.length > 0 && (
        <div className="space-y-8">
          {categoryFilter === 'all' ? (
            // Show skills grouped by category
            Object.entries(skillsByCategory).map(([catId, catSkills]) => {
              const category = categories.find(c => c.id === catId);
              const Icon = getSkillIcon(catId);
              
              return (
                <div key={catId}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${getCategoryBgColor(catId)}`}>
                      <Icon className={`w-5 h-5 ${getCategoryColor(catId)}`} />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">
                        {category?.name || catId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </h2>
                      <p className="text-sm text-muted-foreground">{catSkills.length} skills</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {catSkills.map((skill) => {
                      const SkillIcon = getSkillIcon(skill.categoryId);
                      const successRate = skill.successRate || 0;
                      
                      return (
                        <Card key={skill.id} className="group hover:border-primary/50 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${getCategoryBgColor(skill.categoryId)}`}>
                                  <SkillIcon className={`w-5 h-5 ${getCategoryColor(skill.categoryId)}`} />
                                </div>
                                <div>
                                  <div className="font-medium capitalize">{skill.name}</div>
                                  <Badge 
                                    variant={skill.isLoaded ? 'default' : 'outline'} 
                                    className="text-xs mt-1"
                                  >
                                    {skill.isLoaded ? 'Active' : 'Registered'}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2 text-sm">
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Executions</span>
                                <span className="font-medium">{skill.executions.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Success Rate</span>
                                <span className={`font-medium ${successRate >= 90 ? 'text-green-400' : successRate >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>
                                  {successRate.toFixed(1)}%
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Avg Time</span>
                                <span className="font-medium">{skill.avgResponseTime}ms</span>
                              </div>
                            </div>

                            <p className="text-xs text-muted-foreground mt-3 line-clamp-2">
                              {skill.description || 'No description available'}
                            </p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            // Show filtered skills in a single grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredSkills.map((skill) => {
                const SkillIcon = getSkillIcon(skill.categoryId);
                const successRate = skill.successRate || 0;
                
                return (
                  <Card key={skill.id} className="group hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${getCategoryBgColor(skill.categoryId)}`}>
                            <SkillIcon className={`w-5 h-5 ${getCategoryColor(skill.categoryId)}`} />
                          </div>
                          <div>
                            <div className="font-medium capitalize">{skill.name}</div>
                                <Badge 
                                  variant={skill.isLoaded ? 'default' : 'outline'} 
                                  className="text-xs mt-1"
                                >
                                  {skill.isLoaded ? 'Active' : 'Registered'}
                                </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Executions</span>
                          <span className="font-medium">{skill.executions.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Success Rate</span>
                          <span className={`font-medium ${successRate >= 90 ? 'text-green-400' : successRate >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {successRate.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Avg Time</span>
                          <span className="font-medium">{skill.avgResponseTime}ms</span>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground mt-3 line-clamp-2">
                        {skill.description || 'No description available'}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
