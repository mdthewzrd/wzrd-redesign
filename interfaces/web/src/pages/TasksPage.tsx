import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, Zap, AlertCircle, Play, Filter, ArrowRight, MoreHorizontal, Terminal, X, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAtom } from 'jotai';
import { currentProjectAtom, availableProjectsAtom, systemMetricsAtom } from '@/stores/atoms';
import { agentGateway } from '@/lib/agent-gateway';
import type { AgentInfo } from '@/lib/agent-gateway';

interface AgentTask {
  id: string;
  title: string;
  description: string;
  agent: string;
  status: 'running' | 'paused' | 'completed' | 'failed' | 'queued';
  priority: 'high' | 'medium' | 'low';
  progress: number;
  startTime?: Date;
  estimatedCompletion?: Date;
  type: 'coding' | 'testing' | 'research' | 'deployment';
}

interface TasksSummary {
  total: number;
  completed: number;
  running: number;
  failed: number;
  queued: number;
}

function getAgentColors(agentName?: string | null) {
  if (!agentName) return { bg: '#6b7280', text: 'bg-gray-500' };
  const colors: Record<string, { bg: string; text: string }> = {
    'Remi': { bg: '#fbbf24', text: 'bg-yellow-500' },
    'Renata': { bg: '#10b981', text: 'bg-emerald-500' },
    'Dilution': { bg: '#8b5cf6', text: 'bg-violet-500' },
    'Sadie': { bg: '#f472b6', text: 'bg-pink-500' },
    'Frontend': { bg: '#3b82f6', text: 'bg-blue-500' },
    'Builder': { bg: '#14b8a6', text: 'bg-teal-500' },
    'QA': { bg: '#f59e0b', text: 'bg-amber-500' },
    'Debugger': { bg: '#ef4444', text: 'bg-red-500' },
    'Backtester': { bg: '#8b5cf6', text: 'bg-violet-500' },
    'Research': { bg: '#06b6d4', text: 'bg-cyan-500' },
  };
  return colors[agentName] || { bg: '#6b7280', text: 'bg-gray-500' };
}

export function TasksPage() {
  const [currentProject, setCurrentProject] = useAtom(currentProjectAtom);
  const [availableProjects] = useAtom(availableProjectsAtom);
  const [metrics] = useAtom(systemMetricsAtom);
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'running' | 'completed' | 'failed' | 'queued'>('all');
  const [killingAgent, setKillingAgent] = useState<string | null>(null);

  const handleKillAgent = async (agentId: string) => {
    setKillingAgent(agentId);
    try {
      const killed = await agentGateway.killAgent(agentId);
      if (killed) {
        console.log(`Agent ${agentId} killed successfully`);
        // Refresh the agents list
        const agents = await agentGateway.listAgents();
        const agentTasks: AgentTask[] = agents.map((agent: AgentInfo) => {
          const isRunning = agent.conversationId !== undefined;
          return {
            id: agent.id,
            title: `${agent.conversationId || 'Background'} Agent`,
            description: `Working in ${agent.workdir || 'unknown directory'}`,
            agent: 'Claude',
            status: isRunning ? 'running' : 'completed',
            priority: 'medium',
            progress: isRunning ? 50 : 100,
            startTime: new Date(agent.startTime),
            type: 'coding'
          };
        });
        setTasks(agentTasks);
      }
    } catch (err) {
      console.error('Failed to kill agent:', err);
    } finally {
      setKillingAgent(null);
    }
  };

  useEffect(() => {
    // Load real agents from Gateway
    async function loadAgents() {
      setIsLoading(true);
      try {
        const agents = await agentGateway.listAgents();
        console.log('Loaded agents from Gateway:', agents);

        // Transform AgentInfo to AgentTask format
        const agentTasks: AgentTask[] = agents.map((agent: AgentInfo) => {
          const isRunning = agent.conversationId !== undefined;
          return {
            id: agent.id,
            title: `${agent.conversationId || 'Background'} Agent`,
            description: `Working in ${agent.workdir || 'unknown directory'}`,
            agent: 'Claude', // Agents are Claude processes
            status: isRunning ? 'running' : 'completed',
            priority: 'medium',
            progress: isRunning ? 50 : 100,
            startTime: new Date(agent.startTime),
            type: 'coding'
          };
        });

        setTasks(agentTasks);
      } catch (err) {
        console.error('Failed to load agents:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadAgents();

    // Refresh agents every 10 seconds
    const interval = setInterval(loadAgents, 10000);
    return () => clearInterval(interval);
  }, []);

  const tasksSummary: TasksSummary = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    running: tasks.filter(t => t.status === 'running').length,
    failed: tasks.filter(t => t.status === 'failed').length,
    queued: tasks.filter(t => t.status === 'queued').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-blue-500/15 text-blue-400';
      case 'completed':
        return 'bg-success/15 text-success-foreground';
      case 'failed':
        return 'bg-destructive/15 text-destructive-foreground';
      case 'queued':
        return 'bg-secondary/15 text-secondary-foreground';
      case 'paused':
        return 'bg-warning/15 text-warning-foreground';
      default:
        return 'bg-secondary/15 text-secondary-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive/15 text-destructive-foreground';
      case 'medium':
        return 'bg-warning/15 text-warning-foreground';
      case 'low':
        return 'bg-secondary/15 text-secondary-foreground';
      default:
        return 'bg-secondary/15 text-secondary-foreground';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'coding':
        return 'text-blue-400';
      case 'testing':
        return 'text-green-400';
      case 'research':
        return 'text-purple-400';
      case 'deployment':
        return 'text-yellow-400';
      default:
        return 'text-secondary-foreground';
    }
  };

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gradient-gold">Tasks</h1>
        <p className="text-muted-foreground mt-1">Agent task queue and execution tracking</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Tasks</CardTitle>
            <CardDescription>All agent tasks in queue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-foreground">{tasksSummary.total}</div>
            <div className="text-sm text-muted-foreground">in queue</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completed</CardTitle>
            <CardDescription>Successfully finished</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-success">{tasksSummary.completed}</div>
            <div className="text-sm text-muted-foreground">{Math.round((tasksSummary.completed / tasksSummary.total) * 100)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Running</CardTitle>
            <CardDescription>Currently executing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-blue-400">{tasksSummary.running}</div>
            <div className="text-sm text-muted-foreground">active</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Queued</CardTitle>
            <CardDescription>Waiting to start</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-secondary-foreground">{tasksSummary.queued}</div>
            <div className="text-sm text-muted-foreground">waiting</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Failed</CardTitle>
            <CardDescription>Errors encountered</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-destructive">{tasksSummary.failed}</div>
            <div className="text-sm text-muted-foreground">{Math.round((tasksSummary.failed / tasksSummary.total) * 100)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <Filter className="w-5 h-5 text-muted-foreground" />
        <Button onClick={() => setFilter('all')}>
          All
        </Button>
        <Button
          onClick={() => setFilter('running')}
          variant={filter === 'running' ? 'default' : 'outline'}
        >
          Running
        </Button>
        <Button
          onClick={() => setFilter('completed')}
          variant={filter === 'completed' ? 'default' : 'outline'}
        >
          Completed
        </Button>
        <Button
          onClick={() => setFilter('failed')}
          variant={filter === 'failed' ? 'default' : 'outline'}
        >
          Failed
        </Button>
        <Button
          onClick={() => setFilter('queued')}
          variant={filter === 'queued' ? 'default' : 'outline'}
        >
          Queued
        </Button>
      </div>

      {/* Task List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary/30 rounded-full animate-spin" />
          <span className="ml-4 text-muted-foreground">Loading tasks...</span>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks
            .filter(task => filter === 'all' || task.status === filter)
            .map((task) => (
              <div key={task.id} className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card">
                <CheckCircle2
                  className={`w-5 h-5 flex-shrink-0 rounded-full ${getStatusColor(task.status)}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-medium">{task.title}</span>
                    {task.agent && (
                      <Badge className={getAgentColors(task.agent)?.text}>{task.agent}</Badge>
                    )}
                  </div>
                  {task.type && (
                    <Badge variant="outline" className="text-xs ml-2">
                      {task.type}
                    </Badge>
                  )}
                  {task.startTime && (
                    <span className="text-xs text-muted-foreground ml-2">
                      {task.startTime.toLocaleTimeString()}
                    </span>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <div className={`text-xs font-medium ${getTypeColor(task.type)}`}>
                      {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </div>
                    {task.priority && (
                      <Badge variant="outline" className="ml-2">
                        {task.priority.toUpperCase()}
                      </Badge>
                    )}
                    {task.progress > 0 && (
                      <span className="text-xs text-muted-foreground ml-2">
                        {task.progress}%
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {task.description}
                  </p>
                  {task.estimatedCompletion && (
                    <div className="flex items-center gap-2 mt-3">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Est: {task.estimatedCompletion.toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
                {task.status === 'running' && (
                  <Button
                    onClick={() => handleKillAgent(task.id)}
                    disabled={killingAgent === task.id}
                  >
                    {killingAgent === task.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <X className="mr-2 h-4 w-4" />
                    )}
                    {killingAgent === task.id ? 'Killing...' : 'Kill'}
                  </Button>
                )}
              </div>
            ))}
        </div>
      )}

      {/* Empty State */}
      {tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Terminal className="w-16 h-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            No tasks currently. System metrics:
          </p>
          <div className="mt-4 text-sm text-muted-foreground space-y-2">
            <div>Tasks: 0</div>
            <div>Completed: 0</div>
            <div>Running: {metrics.activeAgents}</div>
            <div>Queued: 0</div>
          </div>
        </div>
      )}
    </div>
  );
}
