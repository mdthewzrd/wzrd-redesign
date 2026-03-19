import { useEffect, useState, useCallback } from 'react';
import { useAtom } from 'jotai';
import { gateway } from '@/lib/gateway';
import { systemMetricsAtom } from '@/stores/atoms';

export function useSystemMetrics() {
  const [metrics, setMetrics] = useAtom(systemMetricsAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    if (!gateway.isConnected()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await gateway.getMetrics();
      // Metrics will be updated via WebSocket message
      // The message handler will setMetricsAtom
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      console.error('Failed to fetch metrics:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchMetrics();

    // Poll every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchMetrics]);

  return { metrics, isLoading, error, refetch: fetchMetrics };
}
