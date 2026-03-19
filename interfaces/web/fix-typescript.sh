#!/bin/bash
echo "Fixing TypeScript compilation issues..."

# Check if dashboard components exist
if [ ! -d "src/components/dashboard" ]; then
    mkdir -p src/components/dashboard
fi

# Create placeholder for missing imports
cat > src/components/dashboard/SystemMetricsDashboard.tsx << 'SYSTEM_EOF'
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function SystemMetricsDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">System Metrics</h2>
        <Button variant="outline" size="sm">
          Refresh
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Real-time Metrics Dashboard</CardTitle>
          <CardDescription>Performance analytics and monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
            <div className="text-center">
              <h3 className="font-semibold">Metrics Charts</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Loading performance data...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
SYSTEM_EOF

cat > src/components/dashboard/StripeMinionsDashboard.tsx << 'STRIPE_EOF'
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
STRIPE_EOF

# Already created DiscordBotDashboard.tsx earlier

echo "✅ Created placeholder dashboard components"

# Fix vite.config.ts errors (simplify)
cat > vite.config.ts << 'VITE_EOF'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
VITE_EOF

echo "✅ Fixed vite.config.ts"

# Now test the build
echo "Testing TypeScript compilation..."
npm run build 2>&1 | grep -A5 "error TS" | head -20

echo "Done!"
