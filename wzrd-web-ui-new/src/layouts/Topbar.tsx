import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, BarChart3, Settings, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WzrdEmoji } from '@/components/WzrdIcon';
import { ThemeToggle } from '@/components/ThemeToggle';

export function Topbar() {
  // Gateway V2 connection status - check HTTP API health instead of WebSocket
  const [isGatewayConnected, setIsGatewayConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [gatewayUptime, setGatewayUptime] = useState<string>('');

  // Check Gateway V2 health periodically - use our API endpoint
  useEffect(() => {
    const checkGatewayHealth = async () => {
      try {
        const response = await fetch('/api/gateway/health');
        if (response.ok) {
          const data = await response.json();
          setIsGatewayConnected(true);
          
          // Calculate uptime string
          if (data.uptime) {
            const hours = Math.floor(data.uptime / 3600);
            const minutes = Math.floor((data.uptime % 3600) / 60);
            setGatewayUptime(`${hours}h ${minutes}m`);
          }
        } else {
          setIsGatewayConnected(false);
          setGatewayUptime('');
        }
      } catch (error) {
        setIsGatewayConnected(false);
        setGatewayUptime('');
      }
    };

    // Initial check
    checkGatewayHealth();
    
    // Check every 30 seconds
    const interval = setInterval(checkGatewayHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleConnectionClick = async () => {
    if (isGatewayConnected || isReconnecting) return;
    
    setIsReconnecting(true);
    try {
      // Test Gateway V2 HTTP endpoint
      const response = await fetch('/api/gateway/health');
      if (response.ok) {
        setIsGatewayConnected(true);
        console.log('[Topbar] Gateway V2 reconnection successful');
      } else {
        throw new Error('Gateway not responding');
      }
    } catch (error) {
      console.error('[Topbar] Reconnection failed:', error);
      setIsGatewayConnected(false);
    } finally {
      setIsReconnecting(false);
    }
  };

  return (
    <header className="h-[52px] border-b border-border/50 glass flex items-center justify-between px-4 z-20">
      {/* Logo and Brand */}
      <div className="flex items-center gap-3">
        <WzrdEmoji className="w-8 h-8" />
        <div className="flex flex-col items-start">
          <span className="text-xl font-bold text-gradient-gold">WZRD.dev</span>
          {gatewayUptime && (
            <span className="text-sm text-muted-foreground ml-2">
              {gatewayUptime} uptime
            </span>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Gateway Connection Status */}
        <div 
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
            isGatewayConnected 
              ? 'bg-green-500/10 hover:bg-green-500/20 text-green-600' 
              : 'bg-red-500/10 hover:bg-red-500/20 text-red-600'
          }`}
          onClick={handleConnectionClick}
        >
          {isGatewayConnected ? (
            <>
              <Wifi className="w-4 h-4" />
              <span className="text-sm font-medium">Connected</span>
            </>
          ) : isReconnecting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">Connecting...</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4" />
              <span className="text-sm font-medium">Disconnected</span>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 w-8">
            <BarChart3 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}