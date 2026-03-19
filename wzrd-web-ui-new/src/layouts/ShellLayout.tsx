import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Topbar } from './Topbar';
import { Sidebar } from '@/components/nav/Sidebar';
import { agentGateway } from '@/lib/agent-gateway';

export function ShellLayout() {
  // Auto-connect to Gateway on app load
  useEffect(() => {
    console.log('[ShellLayout] Auto-connecting to Gateway...');
    agentGateway.connect();
  }, []);

  return (
    <div className="shell h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Topbar */}
      <Topbar />

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-52px)]">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-auto custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
