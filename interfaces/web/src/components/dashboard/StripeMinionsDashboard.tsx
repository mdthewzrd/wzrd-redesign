import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function StripeMinionsDashboard() {
  const components = [
    { name: 'SQLite State Management', status: 'healthy', color: 'bg-green-500' },
    { name: 'Sandbox System', status: 'healthy', color: 'bg-green-500' },
    { name: 'Agent Harness (Blueprints)', status: 'healthy', color: 'bg-green-500' },
    { name: 'Rules File', status: 'healthy', color: 'bg-green-500' },
    { name: 'Tool Shed Meta-Layer', status: 'healthy', color: 'bg-green-500' },
    { name: 'Validation Layer', status: 'healthy', color: 'bg-green-500' },
    { name: 'End-to-End Flow', status: 'healthy', color: 'bg-green-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Stripe Minions Framework</h2>
          <p className="text-muted-foreground">
            All 7 components of the Stripe Minions framework
          </p>
        </div>
        <Button variant="outline" size="sm">
          Run Health Check
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {components.map((component, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{component.name}</CardTitle>
              <CardDescription>Component {index + 1} of 7</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${component.color}`} />
                  <span className="font-medium capitalize">{component.status}</span>
                </div>
                <Badge variant="outline">Active</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Framework Health</CardTitle>
          <CardDescription>Overall system integration status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Component Integration</span>
              <Badge variant="default">100%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Data Flow</span>
              <Badge variant="default">Operational</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Gateway Connection</span>
              <Badge variant="default">Healthy</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
