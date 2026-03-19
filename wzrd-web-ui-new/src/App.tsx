import React, { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { ShellLayout } from '@/layouts/ShellLayout';
import { currentTabAtom, type Tab } from '@/stores/atoms';

// Pages
import { ChatPage } from '@/pages/ChatPage';
import { OverviewPage } from '@/pages/OverviewPage';
import { OverviewPageSimple } from '@/pages/OverviewPage.simple';
import { ActivityPage } from '@/pages/ActivityPage';
import { TopicsPage } from '@/pages/TopicsPage';
import { TasksPage } from '@/pages/TasksPage';
import { FilesPage } from '@/pages/FilesPage';
import { MemoryPage } from '@/pages/MemoryPage';
import { SkillsPage } from '@/pages/SkillsPage';
import { GoldStandardPage } from '@/pages/GoldStandardPage';
import { McpPage } from '@/pages/McpPage';
import { InstancesPage } from '@/pages/InstancesPage';
import { ConfigPage } from '@/pages/ConfigPage';
import { LogsPage } from '@/pages/LogsPage';
import { RecommendationsPage } from '@/pages/RecommendationsPage';
import { BlueprintsPage } from '@/pages/BlueprintsPage';
import { SandboxPage } from '@/pages/SandboxPage';
import { SyncPage } from '@/pages/SyncPage';

// Mapping routes to tabs
const routeToTab: Record<string, Tab> = {
  '/chat': 'chat',
  '/overview': 'overview',
  '/activity': 'activity',
  '/topics': 'topics',
  '/tasks': 'tasks',
  '/files': 'files',
  '/memory': 'memory',
  '/skills': 'skills',
  '/gold-standard': 'gold-standard',
  '/mcp': 'mcp',
  '/instances': 'instances',
  '/config': 'config',
  '/logs': 'logs',
  '/recommendations': 'recommendations',
  '/blueprints': 'blueprints',
  '/sync': 'sync',
  '/sandbox': 'sandbox',
};

const tabToRoute: Record<Tab, string> = {
  chat: '/chat',
  overview: '/overview',
  activity: '/activity',
  topics: '/topics',
  tasks: '/tasks',
  files: '/files',
  memory: '/memory',
  skills: '/skills',
  'gold-standard': '/gold-standard',
  mcp: '/mcp',
  instances: '/instances',
  config: '/config',
  logs: '/logs',
  recommendations: '/recommendations',
  blueprints: '/blueprints',
  sync: '/sync',
  sandbox: '/sandbox',
};

function AppContent() {
  const [currentTab, setCurrentTab] = useAtom(currentTabAtom);
  const navigate = useNavigate();
  const popstateListenerRegistered = useRef(false);
  const initializedRef = useRef(false);

  // Initialize tab from URL on first render
  useEffect(() => {
    if (!initializedRef.current) {
      const path = window.location.pathname;
      const tabFromUrl = routeToTab[path];
      if (tabFromUrl && tabFromUrl !== currentTab) {
        setCurrentTab(tabFromUrl);
      }
      initializedRef.current = true;
    }
  }, [currentTab, setCurrentTab]);

  // Persist tab to localStorage
  useEffect(() => {
    if (initializedRef.current) {
      localStorage.setItem('wzrd_current_tab', currentTab);
    }
  }, [currentTab]);

  // Sync URL with tab changes
  useEffect(() => {
    const route = tabToRoute[currentTab];
    if (route && window.location.pathname !== route) {
      navigate(route, { replace: true });
    }
  }, [currentTab, navigate]);

  // Handle popstate for URL sync (only register once)
  useEffect(() => {
    if (popstateListenerRegistered.current) return;

    const handlePopState = () => {
      const path = window.location.pathname;
      const tab = routeToTab[path] || 'overview';
      setCurrentTab(tab);
    };

    window.addEventListener('popstate', handlePopState);
    popstateListenerRegistered.current = true;

    return () => {
      if (popstateListenerRegistered.current) {
        window.removeEventListener('popstate', handlePopState);
        popstateListenerRegistered.current = false;
      }
    };
  }, []);

  return (
    <Routes>
      <Route path="/" element={<ShellLayout />}>
      <Route index element={<Navigate to="/overview" replace />} />
      <Route path="chat" element={<ChatPage />} />
      <Route path="overview" element={<OverviewPageSimple />} />
      <Route path="activity" element={<ActivityPage />} />
      <Route path="topics" element={<TopicsPage />} />
      <Route path="tasks" element={<TasksPage />} />
      <Route path="files" element={<FilesPage />} />
      <Route path="memory" element={<MemoryPage />} />
      <Route path="skills" element={<SkillsPage />} />
      <Route path="gold-standard" element={<GoldStandardPage />} />
      <Route path="mcp" element={<McpPage />} />
      <Route path="instances" element={<InstancesPage />} />
      <Route path="config" element={<ConfigPage />} />
      <Route path="logs" element={<LogsPage />} />
      <Route path="recommendations" element={<RecommendationsPage />} />
      <Route path="blueprints" element={<BlueprintsPage />} />
      <Route path="sync" element={<SyncPage />} />
      <Route path="sandbox" element={<SandboxPage />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
