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
