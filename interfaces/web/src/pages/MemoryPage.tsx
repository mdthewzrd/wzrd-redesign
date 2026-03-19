import React from 'react';
import { Brain, FileText, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function MemoryPage() {
  const memoryFiles = [
    { name: 'MEMORY.md', size: '2.4 KB', updated: '2 hours ago', description: 'Shared context across all sessions' },
    { name: 'learnings.md', size: '1.8 KB', updated: '5 hours ago', description: 'Accumulated knowledge and patterns' },
    { name: 'patterns.md', size: '3.2 KB', updated: '1 day ago', description: 'Recognized patterns and heuristics' },
    { name: 'ARCHITECTURE.md', size: '4.1 KB', updated: '3 days ago', description: 'System architecture documentation' },
    { name: 'REGRESSIONS.md', size: '1.2 KB', updated: '1 week ago', description: 'Known issues and regressions' },
    { name: 'VALIDATION.md', size: '2.0 KB', updated: '1 week ago', description: 'Validation protocols and checklists' },
    { name: 'PROTOCOL.md', size: '3.8 KB', updated: '2 weeks ago', description: 'Communication protocols' },
    { name: 'GOLD_STANDARD.md', size: '5.4 KB', updated: '2 weeks ago', description: 'Quality standards and principles' },
  ];

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gradient-gold">Memory</h1>
        <p className="text-muted-foreground mt-1">Shared context and memory</p>
      </div>

      {/* Memory Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{memoryFiles.length}</div>
                <div className="text-xs text-muted-foreground">Active Files</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Brain className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">4</div>
                <div className="text-xs text-muted-foreground">Memory Layers</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">127</div>
                <div className="text-xs text-muted-foreground">Learnings</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Memory Architecture */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Memory Architecture</CardTitle>
          <CardDescription>4-layer memory system for persistent context</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Session', desc: 'Short-term conversation context', color: 'from-blue-500 to-blue-600' },
              { name: 'Working', desc: 'Current task awareness', color: 'from-purple-500 to-purple-600' },
              { name: 'Persistent', desc: 'Cross-session knowledge', color: 'from-pink-500 to-pink-600' },
              { name: 'Core', desc: 'Fundamental principles', color: 'from-primary to-primary/80' },
            ].map((layer) => (
              <div
                key={layer.name}
                className="p-4 rounded-lg bg-gradient-to-br from-secondary/50 to-secondary/30 border border-border/50"
              >
                <div className="text-sm font-medium mb-1">{layer.name}</div>
                <div className="text-xs text-muted-foreground">{layer.desc}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Memory Files */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Memory Files</CardTitle>
          <CardDescription>Persistent memory store</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {memoryFiles.map((file) => (
              <div
                key={file.name}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-sm">{file.name}</div>
                    <div className="text-xs text-muted-foreground">{file.description}</div>
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <div>{file.size}</div>
                  <div>{file.updated}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
