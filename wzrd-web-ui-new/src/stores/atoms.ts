import { atom } from 'jotai';
import { RESET, atomWithStorage } from 'jotai/utils';
import type { Topic, TopicStatistics } from '@/lib/topic-registry';
import type { SkillCategory } from '@/lib/skills';

// ============================================================================
// TAB NAVIGATION
// ============================================================================

// OpenClaw-inspired navigation adapted for WZRD.dev
// 4 main groups: Chat, Control, Agent, Settings
export const TAB_GROUPS = [
  { 
    label: 'Chat & Communication', 
    tabs: ['chat', 'discord', 'gateway'] 
  },
  { 
    label: 'Framework Control', 
    tabs: ['overview', 'minions', 'topics', 'memory', 'sandbox', 'costs'] 
  },
  { 
    label: 'Agent Operations', 
    tabs: ['skills', 'modes', 'blueprints', 'instances', 'tasks'] 
  },
  { 
    label: 'System Settings', 
    tabs: ['config', 'logs', 'sync', 'network'] 
  },
] as const;

// New tabs added for framework integration:
// - topics: Topic Management (replaces projects)
// - blueprints: Blueprint Engine
// - sync: Interface Sync Dashboard
// - sandbox: Sandbox/Worktree Manager

export type Tab =
  // Chat & Communication
  | 'chat'
  | 'discord'
  | 'gateway'
  
  // Framework Control  
  | 'overview'
  | 'minions'
  | 'topics'
  | 'memory'
  | 'sandbox'
  | 'costs'
  
  // Agent Operations
  | 'skills'
  | 'modes'
  | 'blueprints'
  | 'instances'
  | 'tasks'
  
  // System Settings
  | 'config'
  | 'logs'
  | 'sync'
  | 'network';

// ============================================================================
// UI STATE
// ============================================================================

export type UIMode = 'dark' | 'light';
export const uiModeAtom = atom<UIMode>(
  (typeof localStorage !== 'undefined' ? (localStorage.getItem('wzrd_ui_mode') as UIMode) : 'dark'),
);

// Sync UI mode to localStorage
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'wzrd_ui_mode') {
      const mode = e.newValue as UIMode;
      if (mode === 'light') {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
      }
    }
  });

  // Apply initial mode
  const initialMode = localStorage.getItem('wzrd_ui_mode') as UIMode || 'dark';
  if (initialMode === 'light') {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  }
}

export const currentTabAtom = atom<Tab>(
  (typeof localStorage !== 'undefined' ? (localStorage.getItem('wzrd_current_tab') as Tab) : 'overview'),
);
export const navGroupsCollapsedAtom = atom<Record<string, boolean>>({});
export const sidebarCollapsedAtom = atom(false);

// ============================================================================
// TOPIC SYSTEM (FRAMEWORK INTEGRATION)
// ============================================================================

// Topics from TopicRegistry
export const topicsAtom = atom<Topic[]>([]);
export const activeTopicAtom = atom<Topic | null>(null);
export const topicsLoadingAtom = atom<boolean>(false);
export const topicsErrorAtom = atom<string | null>(null);
export const topicStatisticsAtom = atom<TopicStatistics | null>(null);

// Derived topics
export const activeTopicsAtom = atom((get) => {
  const topics = get(topicsAtom);
  return topics.filter(t => t.config.is_active !== false);
});

export const topicsByInterfaceAtom = atom((get) => {
  const topics = get(topicsAtom);
  return {
    discord: topics.filter(t => t.discord_channel_id),
    web: topics.filter(t => t.web_ui_tab),
    cli: topics.filter(t => t.cli_alias),
  };
});

// Topic filters
export const topicFilterAtom = atom<string>('');
export const topicStatusFilterAtom = atom<'all' | 'active' | 'paused' | 'completed'>('all');

// ============================================================================
// CHAT SYSTEM (INTEGRATED WITH TOPICS)
// ============================================================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  image?: string;
  platform?: 'web' | 'telegram' | 'discord';
  topicId?: string;
  syncId?: string;  // For cross-interface sync
}

export const chatMessagesAtom = atom<ChatMessage[]>([]);
export const chatInputAtom = atom('');
export const chatLoadingAtom = atom(false);

// Legacy support - current topic from activeTopicAtom
export const currentTopicAtom = atom(
  (get) => get(activeTopicAtom)?.id || 'general',
  (get, set, newTopic: string) => {
    const topics = get(topicsAtom);
    const topic = topics.find(t => t.id === newTopic);
    set(activeTopicAtom, topic || null);
  }
);

// ============================================================================
// SYNC MANAGER (FRAMEWORK INTEGRATION)
// ============================================================================

export type SyncEventType = 
  | 'topic_switch' 
  | 'message' 
  | 'file_change' 
  | 'memory_update' 
  | 'progress_update' 
  | 'command' 
  | 'topic_created' 
  | 'topic_mapped' 
  | 'sync_pulse';

export interface SyncEvent {
  id: string;
  type: SyncEventType;
  interface: 'discord' | 'web-ui' | 'cli';
  content: string;
  topic?: string;
  userId?: string;
  channelId?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export const syncEventsAtom = atom<SyncEvent[]>([]);
export const syncStatusAtom = atom<'connected' | 'disconnected' | 'error'>('disconnected');
export const syncLastPulseAtom = atom<number>(0);
export const activeInterfacesAtom = atom<{ discord: boolean; web: boolean; cli: boolean }>({
  discord: false,
  web: false,
  cli: false,
});

// ============================================================================
// SYSTEM METRICS (REAL DATA)
// ============================================================================

export const systemMetricsAtom = atom({
  uptime: '0h 0m',
  latency: { avg: '0ms', p50: '0ms', p95: '0ms', p99: '0ms' },
  storage: { used: '0', total: 0, unit: 'GB' },
  requests: { today: 0, total: 0 },
  memory: { used: '0', total: 16, unit: 'GB' },
  activeAgents: '0',
});

// ============================================================================
// ACTIVITY & LOGS (REAL DATA)
// ============================================================================

export interface ActivityLogEntry {
  timestamp: number;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  agent?: string;
  source?: string;
  topicId?: string;
  syncId?: string;
}

export const activityDataAtom = atom({
  activity: [{ day: 'Mon', value: 0 }, { day: 'Tue', value: 0 }, { day: 'Wed', value: 0 }, { day: 'Thu', value: 0 }, { day: 'Fri', value: 0 }, { day: 'Sat', value: 0 }, { day: 'Sun', value: 0 }],
  tokens: { today: 0, week: 0, savings: '0%', byModel: {} as Record<string, number> },
  activityLog: [] as ActivityLogEntry[],
});

// Real logs from framework
export const systemLogsAtom = atom<ActivityLogEntry[]>([]);
export const logsFilterAtom = atom<{ level: string; source: string; search: string }>({
  level: 'all',
  source: 'all',
  search: '',
});

// ============================================================================
// MEMORY SYSTEM (FRAMEWORK INTEGRATION)
// ============================================================================

export interface MemoryItem {
  id: string;
  type: 'decision' | 'note' | 'reference' | 'activity';
  content: string;
  topicId: string;
  timestamp: number;
  tokens: number;
  source: 'semantic' | 'agentic';
}

export const memoryItemsAtom = atom<MemoryItem[]>([]);
export const memorySearchQueryAtom = atom('');
export const memorySearchResultsAtom = atom<MemoryItem[]>([]);
export const memorySearchLoadingAtom = atom(false);
export const memoryStatisticsAtom = atom({
  totalItems: 0,
  totalTokens: 0,
  tokensSaved: 0,
  costAvoided: 0,
  byTopic: {} as Record<string, number>,
});

// ============================================================================
// SKILLS (REAL DATA FROM TOOL-SHED)
// ============================================================================

import type { Skill as LibSkill, SkillCategory as LibSkillCategory } from '@/lib/skills';

// Re-export Skill type for backward compatibility
export interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  categoryId: string;
  dependencies?: string[];
  executions: number;
  successRate: number;
  avgResponseTime: number;
  isLoaded: boolean;
  version?: string;
  lastUsed?: string;
}

// Skill category info for UI
export interface SkillCategoryInfo {
  id: string;
  name: string;
  description: string;
  count: number;
}

export const skillsAtom = atom<Skill[]>([]);
export const skillsLoadingAtom = atom(false);
export const skillsErrorAtom = atom<string | null>(null);
export const skillFilterAtom = atom('');
export const skillCategoryFilterAtom = atom<string>('all');
export const skillCategoriesAtom = atom<SkillCategoryInfo[]>([]);

// ============================================================================
// BLUEPRINT ENGINE (FRAMEWORK INTEGRATION)
// ============================================================================

export type BlueprintMode = 'coding' | 'debugging' | 'research' | 'planning';
export type BlueprintType = 'feature_implementation' | 'bug_fixing' | 'research' | 'planning';

export interface BlueprintStep {
  id: string;
  description: string;
  tools: string[];
  validation: 'pre_execution' | 'mid_execution' | 'post_execution';
  success_criteria: string;
}

export interface BlueprintPhase {
  name: string;
  description: string;
  steps: BlueprintStep[];
}

export interface Blueprint {
  id: string;
  name: string;
  description: string;
  type: BlueprintType;
  mode: BlueprintMode;
  token_budget: number;
  phases: BlueprintPhase[];
  required_skills: string[];
  validation_gates: string[];
  is_active: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface BlueprintStatistics {
  totalBlueprints: number;
  activeBlueprints: number;
  byMode: {
    coding: number;
    debugging: number;
    research: number;
    planning: number;
  };
}

// Blueprint state atoms
export const blueprintsAtom = atom<Blueprint[]>([]);
export const activeBlueprintAtom = atom<Blueprint | null>(null);
export const blueprintLoadingAtom = atom<boolean>(false);
export const blueprintErrorAtom = atom<string | null>(null);
export const blueprintStatisticsAtom = atom<BlueprintStatistics | null>(null);

// Blueprint filters
export const blueprintFilterAtom = atom<string>('');
export const blueprintModeFilterAtom = atom<BlueprintMode | 'all'>('all');

// Derived blueprints
export const activeBlueprintsAtom = atom((get) => {
  const blueprints = get(blueprintsAtom);
  return blueprints.filter(b => b.is_active);
});

export const blueprintsByModeAtom = atom((get) => {
  const blueprints = get(blueprintsAtom);
  return {
    coding: blueprints.filter(b => b.mode === 'coding'),
    debugging: blueprints.filter(b => b.mode === 'debugging'),
    research: blueprints.filter(b => b.mode === 'research'),
    planning: blueprints.filter(b => b.mode === 'planning'),
  };
});

// Legacy atoms for backward compatibility
export const blueprintTemplatesAtom = atom<Array<{ type: BlueprintType; name: string; description: string }>>([]);

// ============================================================================
// SANDBOX / WORKTREES (FRAMEWORK INTEGRATION)
// ============================================================================

// Import Sandbox type from lib/sandboxes
import type { Sandbox as LibSandbox, SandboxType as LibSandboxType, SandboxStatus as LibSandboxStatus, SandboxHealth as LibSandboxHealth } from '@/lib/sandboxes';

// Re-export for backward compatibility
export type { LibSandbox as Sandbox, LibSandboxType as SandboxType, LibSandboxStatus as SandboxStatus, LibSandboxHealth as SandboxHealth };

export const sandboxesAtom = atom<LibSandbox[]>([]);
export const sandboxLoadingAtom = atom(false);
export const sandboxErrorAtom = atom<string | null>(null);
export const sandboxFilterAtom = atom<{ status: string; type: string; search: string }>({
  status: 'all',
  type: 'all',
  search: '',
});
export const sandboxStatisticsAtom = atom<{
  totalSandboxes: number;
  activeSandboxes: number;
  healthySandboxes: number;
  totalDiskUsage: number;
  byType: {
    git_worktree: number;
    docker_container: number;
    process_namespace: number;
  };
} | null>(null);

// ============================================================================
// MCP SERVERS (REAL DATA)
// ============================================================================

export interface McpServer {
  id: string;
  name: string;
  transport: 'stdio' | 'http';
  status: 'connected' | 'disconnected' | 'error';
  capabilities: string[];
  latency?: number;
  lastConnected?: number;
  config?: Record<string, any>;
}

export const mcpServersAtom = atom<McpServer[]>([]);
export const mcpServersLoadingAtom = atom(false);

// ============================================================================
// INSTANCES (REAL DATA)
// ============================================================================

export interface Instance {
  id: string;
  name: string;
  type: 'gateway' | 'discord-bot' | 'web-ui' | 'agent' | 'sandbox';
  status: 'running' | 'stopped' | 'error';
  uptime: number;
  cpu: number;
  memory: number;
  port?: number;
  pid?: number;
  topicId?: string;
}

export const instancesAtom = atom<Instance[]>([]);
export const instancesLoadingAtom = atom(false);

// ============================================================================
// CONFIGURATION (REAL DATA)
// ============================================================================

export interface FrameworkConfig {
  gateway: {
    host: string;
    port: number;
    protocol: 'ws' | 'wss';
  };
  agent: {
    model: string;
    maxTokens: number;
    temperature: number;
    topP: number;
  };
  memory: {
    enabled: boolean;
    maxSize: number;
    ttl: number;
    semanticSearch: boolean;
  };
  skills: {
    enabled: boolean;
    path: string;
    timeout: number;
    autoLoad: boolean;
  };
  mcp: {
    servers: McpServer[];
  };
  security: {
    apiKey: string;
    encryption: boolean;
    rateLimit: number;
  };
  logging: {
    level: 'debug' | 'info' | 'warning' | 'error';
    format: 'json' | 'text';
    retention: number;
  };
  performance: {
    maxTasks: number;
    cache: boolean;
    cacheSize: number;
  };
  ui: {
    theme: 'dark' | 'light' | 'system';
    language: string;
    timezone: string;
  };
}

export const frameworkConfigAtom = atom<FrameworkConfig | null>(null);
export const configLoadingAtom = atom(false);
export const configSavingAtom = atom(false);
export const configModifiedAtom = atom(false);

// ============================================================================
// RECOMMENDATIONS (REAL DATA)
// ============================================================================

export type RecommendationType = 'optimization' | 'security' | 'performance' | 'feature' | 'bug' | 'best-practice';
export type RecommendationImpact = 'high' | 'medium' | 'low';

export interface Recommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  impact: RecommendationImpact;
  status: 'new' | 'acknowledged' | 'in-progress' | 'completed' | 'dismissed';
  createdAt: number;
  topicId?: string;
  metrics?: {
    before?: number;
    after?: number;
    unit?: string;
  };
}

export const recommendationsAtom = atom<Recommendation[]>([]);
export const recommendationsLoadingAtom = atom(false);
export const recommendationFilterAtom = atom<{ type: string; impact: string; status: string }>({
  type: 'all',
  impact: 'all',
  status: 'all',
});

// ============================================================================
// FILES (ECOSYSTEM)
// ============================================================================

export interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'dir';
  relativePath?: string;
  size?: number;
  fileCount?: number;
  dirCount?: number;
  children?: FileItem[];
}

export const ecosystemFilesAtom = atom<FileItem[]>([]);
export const loadingEcosystemFilesAtom = atom(false);
export const selectedFileAtom = atom<{ name: string; path: string; content: string } | null>(null);

// ============================================================================
// LOG FILES (REAL DATA)
// ============================================================================

export interface LogFile {
  name: string;
  path: string;
  size: number;
  modified: number;
  type: 'log' | 'json' | 'md';
}

export const logFilesAtom = atom<LogFile[]>([]);
export const currentLogAtom = atom<string | null>(null);

// ============================================================================
// WEBSOCKET STATE
// ============================================================================

export const wsConnectedAtom = atom(false);
export const wsConnectingAtom = atom(false);

// ============================================================================
// MODAL STATES
// ============================================================================

export const createTopicModalOpenAtom = atom(false);  // Renamed from createProjectModalOpenAtom
export const settingsModalOpenAtom = atom(false);
export const createBlueprintModalOpenAtom = atom(false);
export const createSandboxModalOpenAtom = atom(false);

// ============================================================================
// ICON & TITLE MAPPING
// ============================================================================

export function iconForTab(tab: Tab): string {
  const icons: Record<Tab, string> = {
    // Chat & Communication
    chat: 'MessageSquare',
    discord: 'MessageCircle',
    gateway: 'Globe',
    
    // Framework Control
    overview: 'BarChart3',
    minions: 'Zap',
    topics: 'Layers',
    memory: 'Brain',
    sandbox: 'Container',
    costs: 'DollarSign',
    
    // Agent Operations
    skills: 'BookOpen',
    modes: 'Cpu',
    blueprints: 'FileCode',
    instances: 'Server',
    tasks: 'CheckSquare',
    
    // System Settings
    config: 'Settings',
    logs: 'ScrollText',
    sync: 'RefreshCw',
    network: 'Network',
  };
  return icons[tab];
}

export function titleForTab(tab: Tab): string {
  const titles: Record<Tab, string> = {
    // Chat & Communication
    chat: 'Chat',
    discord: 'Discord',
    gateway: 'Gateway',
    
    // Framework Control
    overview: 'Dashboard',
    minions: '7 Minions',
    topics: 'Topics',
    memory: 'Memory',
    sandbox: 'Sandboxes',
    costs: 'Cost Tracking',
    
    // Agent Operations
    skills: 'Skills',
    modes: 'Modes',
    blueprints: 'Blueprints',
    instances: 'Instances',
    tasks: 'Tasks',
    
    // System Settings
    config: 'Configuration',
    logs: 'Logs',
    sync: 'Sync',
    network: 'Network',
  };
  return titles[tab];
}

export function subtitleForTab(tab: Tab): string {
  const subtitles: Record<Tab, string> = {
    // Chat & Communication
    chat: 'Interact with Remi',
    discord: 'Discord bot and channels',
    gateway: 'Gateway V2 status and sessions',
    
    // Framework Control
    overview: 'System status and metrics',
    minions: '7 Stripe Minions status',
    topics: 'Topic-based memory management',
    memory: 'Memory and worktree browsing',
    sandbox: 'Sandbox and worktree management',
    costs: 'API usage and cost tracking',
    
    // Agent Operations
    skills: 'Browse and manage 180+ skills',
    modes: 'Switch between CHAT/CODER/THINKER/DEBUG/RESEARCH',
    blueprints: 'Create and execute workflow templates',
    instances: 'Running agent instances',
    tasks: 'Background tasks and cron jobs',
    
    // System Settings
    config: 'Configuration and preferences',
    logs: 'System logs and debugging',
    sync: 'Interface synchronization',
    network: 'Network configuration',
  };
  return subtitles[tab];
}

// ============================================================================
// CONVERSATIONS (DEPRECATED - Use topics instead)
// ============================================================================

export interface Conversation {
  id: string;
  agentId: string;
  platform?: 'telegram' | 'discord' | 'web';
  topic?: string;
  startTime: number;
  endTime?: number;
  summary?: string;
  messageCount: number;
}

export const conversationsAtom = atom<Conversation[]>([]);
export const selectedConversationAtom = atom<Conversation | null>(null);

// ============================================================================
// BACKWARD COMPATIBILITY (Legacy project system - maps to topics)
// ============================================================================

export interface Project {
  id: string;
  name: string;
  key: string;
  color: string;
  description?: string;
  agent: string;
  topics: number;
}

// Legacy project atoms - now map to topics for backward compatibility
export const availableProjectsAtom = atom<Project[]>([
  { id: 'wzrd-dev', name: 'WZRD Dev', key: 'wzrd-dev', color: '#FFD700', agent: 'remi', topics: 8, description: 'Core development' },
  { id: 'edge-dev', name: 'Edge Dev', key: 'edge-dev', color: '#3B82F6', agent: 'edge', topics: 4, description: 'Edge features' },
  { id: 'dilution-agent', name: 'Dilution Agent', key: 'dilution-agent', color: '#EF4444', agent: 'dilution', topics: 2, description: 'Financial analysis' },
  { id: 'press-agent', name: 'Press Agent', key: 'press-agent', color: '#10B981', agent: 'press', topics: 3, description: 'PR automation' },
]);

export const currentProjectAtom = atomWithStorage<Project | null>('wzrd_current_project', null);
export const selectedProjectAtom = atom<string | null>(null);
export const projectViewOpenAtom = atom<boolean>(false);
