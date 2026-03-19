import React from 'react';
import { Trophy, Shield, CheckCircle, Target, Zap, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function GoldStandardPage() {
  const pillars = [
    {
      name: 'Validation',
      icon: Shield,
      color: 'from-blue-500 to-blue-600',
      description: 'Every output is verified against requirements',
      practices: ['Executable proof', 'Read-back verification', 'Loop prevention'],
    },
    {
      name: 'Context Optimization',
      icon: Target,
      color: 'from-purple-500 to-purple-600',
      description: 'Progressive disclosure of information',
      practices: ['Progressive disclosure', 'Token efficiency', 'Relevant context only'],
    },
    {
      name: 'Agent Coordination',
      icon: Users,
      color: 'from-green-500 to-green-600',
      description: 'Seamless multi-agent workflows',
      practices: ['Role shifting', 'Parallel execution', 'Handshake protocol'],
    },
    {
      name: 'Quality Enforcement',
      icon: CheckCircle,
      color: 'from-pink-500 to-pink-600',
      description: 'Automated quality checks',
      practices: ['Auto-validation', 'Quality gates', 'Regression testing'],
    },
  ];

  const learnings = [
    { title: 'Memory matters', description: '4-layer memory architecture prevents context loss' },
    { title: 'Validation first', description: 'Always validate assumptions before implementing' },
    { title: 'Progressive disclosure', description: 'Only reveal context when relevant to current task' },
    { title: 'Agent handoff', description: 'Clear protocol for switching between agent roles' },
    { title: 'Executable proof', description: 'Every claim must be verifiable through execution' },
    { title: 'Loop prevention', description: 'Track conversation state to avoid redundant work' },
  ];

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-semibold text-gradient-gold">Gold Standard</h1>
        </div>
        <p className="text-muted-foreground">Quality standards and learnings</p>
      </div>

      {/* The 4 Pillars */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">The Four Pillars</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <Card key={pillar.name} className="group">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${pillar.color}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{pillar.name}</CardTitle>
                      <CardDescription className="text-xs">{pillar.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {pillar.practices.map((practice) => (
                      <div key={practice} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-3 h-3 text-primary" />
                        <span>{practice}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Key Learnings */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Key Learnings</h2>
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {learnings.map((learning) => (
                <div
                  key={learning.title}
                  className="p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-3 h-3 text-primary" />
                    <h3 className="font-medium text-sm">{learning.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">{learning.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Standards Document */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Standards Document</CardTitle>
          <CardDescription>Complete quality guidelines</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg bg-secondary/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">GOLD_STANDARD.md</span>
              <span className="text-xs text-muted-foreground">5.4 KB</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">VALIDATION.md</span>
              <span className="text-xs text-muted-foreground">2.0 KB</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">PROTOCOL.md</span>
              <span className="text-xs text-muted-foreground">3.8 KB</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">MEMORY.md</span>
              <span className="text-xs text-muted-foreground">2.4 KB</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
