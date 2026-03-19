import React, { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, Server, Brain, Cpu, Database, Network, Shield, Zap, Globe, Clock, Sliders, Bell, Users, FileText, Key, HardDrive, Activity, ChevronRight, Check, X, ToggleLeft, ToggleRight, Copy, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';

interface ConfigSection {
  id: string;
  title: string;
  description: string;
  icon: any;
}

interface ConfigItem {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'textarea' | 'password';
  value: any;
  options?: { label: string; value: any }[];
  description?: string;
  category: string;
}

interface ApiConfig {
  gateway?: {
    host?: string;
    port?: number;
    protocolVersion?: string;
    websocketEnabled?: boolean;
    apiRateLimit?: number;
    connectionTimeout?: number;
  };
  agent?: {
    defaultModel?: string;
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    contextWindow?: number;
    streamingEnabled?: boolean;
    autoRetry?: boolean;
    maxRetries?: number;
  };
  memory?: {
    enabled?: boolean;
    maxSize?: number;
    ttl?: number;
    persistence?: string;
    indexPath?: string;
  };
  skills?: {
    enabled?: boolean;
    path?: string;
    autoLoad?: boolean;
    timeout?: number;
  };
  mcp?: {
    enabled?: boolean;
    servers?: { name: string; status: string; url: string }[];
  };
  security?: {
    apiKey?: string;
    encryptionEnabled?: boolean;
    auditLogging?: boolean;
    maxConnections?: number;
    ipWhitelist?: string;
  };
  logging?: {
    level?: string;
    format?: string;
    maxSize?: number;
    retentionDays?: number;
    toConsole?: boolean;
  };
  performance?: {
    maxConcurrentTasks?: number;
    taskTimeout?: number;
    cacheEnabled?: boolean;
    cacheTTL?: number;
    cacheMaxSize?: number;
  };
  ui?: {
    theme?: string;
    language?: string;
    timezone?: string;
    dateFormat?: string;
    notificationsEnabled?: boolean;
  };
}

const defaultConfig = {
  // Gateway
  gatewayHost: '127.0.0.1',
  gatewayPort: '18790',
  protocolVersion: '2.0.0',
  websocketEnabled: true,
  apiRateLimit: '1000',
  connectionTimeout: '30',

  // Agent
  defaultModel: 'claude-opus-4-6',
  maxTokens: '200000',
  temperature: '0.7',
  topP: '0.9',
  contextWindow: '1000000',
  streamingEnabled: true,
  autoRetry: true,
  maxRetries: '3',

  // Memory
  memoryEnabled: true,
  memoryMaxSize: '500',
  memoryTTL: '86400',
  memoryPersistence: 'redis',
  memoryIndexPath: '/home/mdwzrd/.claude/memory',

  // Skills
  skillsEnabled: true,
  skillsPath: '/home/mdwzrd/.claude/skills',
  skillsAutoLoad: true,
  skillsTimeout: '60',

  // MCP
  mcpEnabled: true,
  mcpServers: [
    { name: 'filesystem', status: 'connected', url: 'stdio://path' },
    { name: 'brave-search', status: 'connected', url: 'https://api.brave.com' },
    { name: 'sqlite', status: 'disconnected', url: 'file://data.db' },
  ],

  // Security
  apiKey: 'sk-ant-***',
  encryptionEnabled: true,
  auditLogging: true,
  maxConnections: '10',
  ipWhitelist: '',

  // Logging
  logLevel: 'info',
  logFormat: 'json',
  logMaxSize: '100',
  logRetentionDays: '30',
  logToConsole: true,

  // Performance
  maxConcurrentTasks: '5',
  taskTimeout: '300',
  cacheEnabled: true,
  cacheTTL: '3600',
  cacheMaxSize: '1000',

  // UI
  theme: 'dark',
  language: 'en',
  timezone: 'UTC',
  dateFormat: 'YYYY-MM-DD',
  notificationsEnabled: true,
};

function apiConfigToState(apiConfig: ApiConfig): Record<string, any> {
  return {
    // Gateway
    gatewayHost: apiConfig.gateway?.host ?? defaultConfig.gatewayHost,
    gatewayPort: String(apiConfig.gateway?.port ?? defaultConfig.gatewayPort),
    protocolVersion: apiConfig.gateway?.protocolVersion ?? defaultConfig.protocolVersion,
    websocketEnabled: apiConfig.gateway?.websocketEnabled ?? defaultConfig.websocketEnabled,
    apiRateLimit: String(apiConfig.gateway?.apiRateLimit ?? defaultConfig.apiRateLimit),
    connectionTimeout: String(apiConfig.gateway?.connectionTimeout ?? defaultConfig.connectionTimeout),

    // Agent
    defaultModel: apiConfig.agent?.defaultModel ?? defaultConfig.defaultModel,
    maxTokens: String(apiConfig.agent?.maxTokens ?? defaultConfig.maxTokens),
    temperature: String(apiConfig.agent?.temperature ?? defaultConfig.temperature),
    topP: String(apiConfig.agent?.topP ?? defaultConfig.topP),
    contextWindow: String(apiConfig.agent?.contextWindow ?? defaultConfig.contextWindow),
    streamingEnabled: apiConfig.agent?.streamingEnabled ?? defaultConfig.streamingEnabled,
    autoRetry: apiConfig.agent?.autoRetry ?? defaultConfig.autoRetry,
    maxRetries: String(apiConfig.agent?.maxRetries ?? defaultConfig.maxRetries),

    // Memory
    memoryEnabled: apiConfig.memory?.enabled ?? defaultConfig.memoryEnabled,
    memoryMaxSize: String(apiConfig.memory?.maxSize ?? defaultConfig.memoryMaxSize),
    memoryTTL: String(apiConfig.memory?.ttl ?? defaultConfig.memoryTTL),
    memoryPersistence: apiConfig.memory?.persistence ?? defaultConfig.memoryPersistence,
    memoryIndexPath: apiConfig.memory?.indexPath ?? defaultConfig.memoryIndexPath,

    // Skills
    skillsEnabled: apiConfig.skills?.enabled ?? defaultConfig.skillsEnabled,
    skillsPath: apiConfig.skills?.path ?? defaultConfig.skillsPath,
    skillsAutoLoad: apiConfig.skills?.autoLoad ?? defaultConfig.skillsAutoLoad,
    skillsTimeout: String(apiConfig.skills?.timeout ?? defaultConfig.skillsTimeout),

    // MCP
    mcpEnabled: apiConfig.mcp?.enabled ?? defaultConfig.mcpEnabled,
    mcpServers: apiConfig.mcp?.servers ?? defaultConfig.mcpServers,

    // Security
    apiKey: apiConfig.security?.apiKey ?? defaultConfig.apiKey,
    encryptionEnabled: apiConfig.security?.encryptionEnabled ?? defaultConfig.encryptionEnabled,
    auditLogging: apiConfig.security?.auditLogging ?? defaultConfig.auditLogging,
    maxConnections: String(apiConfig.security?.maxConnections ?? defaultConfig.maxConnections),
    ipWhitelist: apiConfig.security?.ipWhitelist ?? defaultConfig.ipWhitelist,

    // Logging
    logLevel: apiConfig.logging?.level ?? defaultConfig.logLevel,
    logFormat: apiConfig.logging?.format ?? defaultConfig.logFormat,
    logMaxSize: String(apiConfig.logging?.maxSize ?? defaultConfig.logMaxSize),
    logRetentionDays: String(apiConfig.logging?.retentionDays ?? defaultConfig.logRetentionDays),
    logToConsole: apiConfig.logging?.toConsole ?? defaultConfig.logToConsole,

    // Performance
    maxConcurrentTasks: String(apiConfig.performance?.maxConcurrentTasks ?? defaultConfig.maxConcurrentTasks),
    taskTimeout: String(apiConfig.performance?.taskTimeout ?? defaultConfig.taskTimeout),
    cacheEnabled: apiConfig.performance?.cacheEnabled ?? defaultConfig.cacheEnabled,
    cacheTTL: String(apiConfig.performance?.cacheTTL ?? defaultConfig.cacheTTL),
    cacheMaxSize: String(apiConfig.performance?.cacheMaxSize ?? defaultConfig.cacheMaxSize),

    // UI
    theme: apiConfig.ui?.theme ?? defaultConfig.theme,
    language: apiConfig.ui?.language ?? defaultConfig.language,
    timezone: apiConfig.ui?.timezone ?? defaultConfig.timezone,
    dateFormat: apiConfig.ui?.dateFormat ?? defaultConfig.dateFormat,
    notificationsEnabled: apiConfig.ui?.notificationsEnabled ?? defaultConfig.notificationsEnabled,
  };
}

function stateToApiConfig(config: Record<string, any>): { config: ApiConfig } {
  return {
    config: {
      gateway: {
        host: config.gatewayHost,
        port: parseInt(config.gatewayPort, 10),
        protocolVersion: config.protocolVersion,
        websocketEnabled: config.websocketEnabled,
        apiRateLimit: parseInt(config.apiRateLimit, 10),
        connectionTimeout: parseInt(config.connectionTimeout, 10),
      },
      agent: {
        defaultModel: config.defaultModel,
        maxTokens: parseInt(config.maxTokens, 10),
        temperature: parseFloat(config.temperature),
        topP: parseFloat(config.topP),
        contextWindow: parseInt(config.contextWindow, 10),
        streamingEnabled: config.streamingEnabled,
        autoRetry: config.autoRetry,
        maxRetries: parseInt(config.maxRetries, 10),
      },
      memory: {
        enabled: config.memoryEnabled,
        maxSize: parseInt(config.memoryMaxSize, 10),
        ttl: parseInt(config.memoryTTL, 10),
        persistence: config.memoryPersistence,
        indexPath: config.memoryIndexPath,
      },
      skills: {
        enabled: config.skillsEnabled,
        path: config.skillsPath,
        autoLoad: config.skillsAutoLoad,
        timeout: parseInt(config.skillsTimeout, 10),
      },
      mcp: {
        enabled: config.mcpEnabled,
        servers: config.mcpServers,
      },
      security: {
        apiKey: config.apiKey,
        encryptionEnabled: config.encryptionEnabled,
        auditLogging: config.auditLogging,
        maxConnections: parseInt(config.maxConnections, 10),
        ipWhitelist: config.ipWhitelist,
      },
      logging: {
        level: config.logLevel,
        format: config.logFormat,
        maxSize: parseInt(config.logMaxSize, 10),
        retentionDays: parseInt(config.logRetentionDays, 10),
        toConsole: config.logToConsole,
      },
      performance: {
        maxConcurrentTasks: parseInt(config.maxConcurrentTasks, 10),
        taskTimeout: parseInt(config.taskTimeout, 10),
        cacheEnabled: config.cacheEnabled,
        cacheTTL: parseInt(config.cacheTTL, 10),
        cacheMaxSize: parseInt(config.cacheMaxSize, 10),
      },
      ui: {
        theme: config.theme,
        language: config.language,
        timezone: config.timezone,
        dateFormat: config.dateFormat,
        notificationsEnabled: config.notificationsEnabled,
      },
    },
  };
}

export function ConfigPage() {
  const [config, setConfig] = useState<Record<string, any>>(defaultConfig);
  const [activeSection, setActiveSection] = useState<string>('gateway');
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function loadConfig() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/config');
        if (!response.ok) {
          throw new Error(`Failed to load config: ${response.statusText}`);
        }
        const data = await response.json();
        const apiConfig = data.config as ApiConfig;
        setConfig(apiConfigToState(apiConfig));
      } catch (error) {
        console.error('Error loading config:', error);
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load configuration',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadConfig();
  }, []);

  const sections: ConfigSection[] = [
    { id: 'gateway', title: 'Gateway', description: 'Core gateway configuration', icon: Server },
    { id: 'agent', title: 'Agent', description: 'Claude agent settings', icon: Brain },
    { id: 'memory', title: 'Memory', description: 'Memory and storage', icon: Database },
    { id: 'skills', title: 'Skills', description: 'Skills management', icon: Zap },
    { id: 'mcp', title: 'MCP', description: 'Model Context Protocol', icon: Network },
    { id: 'security', title: 'Security', description: 'Security and access', icon: Shield },
    { id: 'logging', title: 'Logging', description: 'System logging', icon: FileText },
    { id: 'performance', title: 'Performance', description: 'Performance tuning', icon: Cpu },
    { id: 'ui', title: 'UI', description: 'Interface settings', icon: Sliders },
  ];

  const handleConfigChange = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = stateToApiConfig(config);
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || `Failed to save config: ${response.statusText}`);
      }

      setHasChanges(false);
      toast({
        title: 'Success',
        description: 'Configuration saved successfully',
      });
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save configuration',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Reset all configuration to defaults?')) {
      window.location.reload();
    }
  };

  const renderConfigItem = (item: ConfigItem) => {
    switch (item.type) {
      case 'boolean':
        return (
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="text-sm font-medium">{item.label}</label>
              {item.description && <p className="text-xs text-muted-foreground mt-1">{item.description}</p>}
            </div>
            <Switch
              checked={config[item.key]}
              onCheckedChange={(checked) => handleConfigChange(item.key, checked)}
            />
          </div>
        );
      case 'password':
        return (
          <div>
            <label className="text-sm font-medium mb-1.5 block">{item.label}</label>
            <div className="flex gap-2">
              <Input
                type={showApiKeys ? 'text' : 'password'}
                value={config[item.key]}
                onChange={(e) => handleConfigChange(item.key, e.target.value)}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowApiKeys(!showApiKeys)}
              >
                {showApiKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        );
      case 'select':
        return (
          <div>
            <label className="text-sm font-medium mb-1.5 block">{item.label}</label>
            <select
              value={config[item.key]}
              onChange={(e) => handleConfigChange(item.key, e.target.value)}
              className="w-full p-2 rounded-lg border border-border bg-background text-sm"
            >
              {item.options?.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        );
      case 'textarea':
        return (
          <div>
            <label className="text-sm font-medium mb-1.5 block">{item.label}</label>
            <textarea
              value={config[item.key]}
              onChange={(e) => handleConfigChange(item.key, e.target.value)}
              className="w-full p-2 rounded-lg border border-border bg-background text-sm min-h-[100px]"
            />
          </div>
        );
      default:
        return (
          <div>
            <label className="text-sm font-medium mb-1.5 block">{item.label}</label>
            <Input
              type={item.type === 'number' ? 'number' : 'text'}
              value={config[item.key]}
              onChange={(e) => handleConfigChange(item.key, item.type === 'number' ? Number(e.target.value) : e.target.value)}
              placeholder={item.description}
            />
          </div>
        );
    }
  };

  const currentSection = sections.find(s => s.id === activeSection);
  const SectionIcon = currentSection?.icon || Settings;

  const configItems: ConfigItem[] = [
    // Gateway
    { key: 'gatewayHost', label: 'Gateway Host', type: 'text', value: config.gatewayHost, category: 'gateway', description: 'WebSocket gateway host address' },
    { key: 'gatewayPort', label: 'Gateway Port', type: 'number', value: config.gatewayPort, category: 'gateway', description: 'WebSocket gateway port' },
    { key: 'protocolVersion', label: 'Protocol Version', type: 'text', value: config.protocolVersion, category: 'gateway', description: 'Gateway protocol version (read-only)' },
    { key: 'websocketEnabled', label: 'WebSocket Enabled', type: 'boolean', value: config.websocketEnabled, category: 'gateway' },
    { key: 'apiRateLimit', label: 'API Rate Limit', type: 'number', value: config.apiRateLimit, category: 'gateway', description: 'Requests per minute' },
    { key: 'connectionTimeout', label: 'Connection Timeout', type: 'number', value: config.connectionTimeout, category: 'gateway', description: 'Timeout in seconds' },

    // Agent
    { key: 'defaultModel', label: 'Default Model', type: 'select', value: config.defaultModel, category: 'agent', options: [
      { label: 'Claude Opus 4.6', value: 'claude-opus-4-6' },
      { label: 'Claude Sonnet 4.6', value: 'claude-sonnet-4-6' },
      { label: 'Claude Haiku 4.5', value: 'claude-haiku-4-5' },
    ]},
    { key: 'maxTokens', label: 'Max Tokens', type: 'number', value: config.maxTokens, category: 'agent', description: 'Maximum tokens per request' },
    { key: 'temperature', label: 'Temperature', type: 'number', value: config.temperature, category: 'agent', description: '0.0-1.0, lower is more deterministic' },
    { key: 'topP', label: 'Top P', type: 'number', value: config.topP, category: 'agent', description: 'Nucleus sampling parameter' },
    { key: 'contextWindow', label: 'Context Window', type: 'number', value: config.contextWindow, category: 'agent', description: 'Maximum context tokens' },
    { key: 'streamingEnabled', label: 'Streaming Enabled', type: 'boolean', value: config.streamingEnabled, category: 'agent' },
    { key: 'autoRetry', label: 'Auto Retry', type: 'boolean', value: config.autoRetry, category: 'agent' },
    { key: 'maxRetries', label: 'Max Retries', type: 'number', value: config.maxRetries, category: 'agent', description: 'Maximum retry attempts' },

    // Memory
    { key: 'memoryEnabled', label: 'Memory Enabled', type: 'boolean', value: config.memoryEnabled, category: 'memory' },
    { key: 'memoryMaxSize', label: 'Memory Max Size', type: 'number', value: config.memoryMaxSize, category: 'memory', description: 'Maximum memory entries' },
    { key: 'memoryTTL', label: 'Memory TTL', type: 'number', value: config.memoryTTL, category: 'memory', description: 'Time to live in seconds' },
    { key: 'memoryPersistence', label: 'Memory Persistence', type: 'select', value: config.memoryPersistence, category: 'memory', options: [
      { label: 'Redis', value: 'redis' },
      { label: 'File', value: 'file' },
      { label: 'Memory', value: 'memory' },
    ]},
    { key: 'memoryIndexPath', label: 'Memory Index Path', type: 'text', value: config.memoryIndexPath, category: 'memory', description: 'Path to memory storage' },

    // Skills
    { key: 'skillsEnabled', label: 'Skills Enabled', type: 'boolean', value: config.skillsEnabled, category: 'skills' },
    { key: 'skillsPath', label: 'Skills Path', type: 'text', value: config.skillsPath, category: 'skills', description: 'Path to skills directory' },
    { key: 'skillsAutoLoad', label: 'Skills Auto Load', type: 'boolean', value: config.skillsAutoLoad, category: 'skills' },
    { key: 'skillsTimeout', label: 'Skills Timeout', type: 'number', value: config.skillsTimeout, category: 'skills', description: 'Skill execution timeout in seconds' },

    // Security
    { key: 'apiKey', label: 'API Key', type: 'password', value: config.apiKey, category: 'security' },
    { key: 'encryptionEnabled', label: 'Encryption Enabled', type: 'boolean', value: config.encryptionEnabled, category: 'security' },
    { key: 'auditLogging', label: 'Audit Logging', type: 'boolean', value: config.auditLogging, category: 'security' },
    { key: 'maxConnections', label: 'Max Connections', type: 'number', value: config.maxConnections, category: 'security', description: 'Maximum concurrent connections' },
    { key: 'ipWhitelist', label: 'IP Whitelist', type: 'textarea', value: config.ipWhitelist, category: 'security', description: 'Comma-separated IP addresses' },

    // Logging
    { key: 'logLevel', label: 'Log Level', type: 'select', value: config.logLevel, category: 'logging', options: [
      { label: 'Debug', value: 'debug' },
      { label: 'Info', value: 'info' },
      { label: 'Warning', value: 'warning' },
      { label: 'Error', value: 'error' },
    ]},
    { key: 'logFormat', label: 'Log Format', type: 'select', value: config.logFormat, category: 'logging', options: [
      { label: 'JSON', value: 'json' },
      { label: 'Text', value: 'text' },
    ]},
    { key: 'logMaxSize', label: 'Log Max Size', type: 'number', value: config.logMaxSize, category: 'logging', description: 'Maximum log file size in MB' },
    { key: 'logRetentionDays', label: 'Log Retention Days', type: 'number', value: config.logRetentionDays, category: 'logging', description: 'Days to retain logs' },
    { key: 'logToConsole', label: 'Log to Console', type: 'boolean', value: config.logToConsole, category: 'logging' },

    // Performance
    { key: 'maxConcurrentTasks', label: 'Max Concurrent Tasks', type: 'number', value: config.maxConcurrentTasks, category: 'performance', description: 'Maximum parallel tasks' },
    { key: 'taskTimeout', label: 'Task Timeout', type: 'number', value: config.taskTimeout, category: 'performance', description: 'Task timeout in seconds' },
    { key: 'cacheEnabled', label: 'Cache Enabled', type: 'boolean', value: config.cacheEnabled, category: 'performance' },
    { key: 'cacheTTL', label: 'Cache TTL', type: 'number', value: config.cacheTTL, category: 'performance', description: 'Cache time to live in seconds' },
    { key: 'cacheMaxSize', label: 'Cache Max Size', type: 'number', value: config.cacheMaxSize, category: 'performance', description: 'Maximum cache entries' },

    // UI
    { key: 'theme', label: 'Theme', type: 'select', value: config.theme, category: 'ui', options: [
      { label: 'Dark', value: 'dark' },
      { label: 'Light', value: 'light' },
      { label: 'System', value: 'system' },
    ]},
    { key: 'language', label: 'Language', type: 'select', value: config.language, category: 'ui', options: [
      { label: 'English', value: 'en' },
      { label: 'Spanish', value: 'es' },
      { label: 'French', value: 'fr' },
      { label: 'German', value: 'de' },
    ]},
    { key: 'timezone', label: 'Timezone', type: 'select', value: config.timezone, category: 'ui', options: [
      { label: 'UTC', value: 'UTC' },
      { label: 'America/New_York', value: 'America/New_York' },
      { label: 'America/Los_Angeles', value: 'America/Los_Angeles' },
      { label: 'Europe/London', value: 'Europe/London' },
    ]},
    { key: 'dateFormat', label: 'Date Format', type: 'select', value: config.dateFormat, category: 'ui', options: [
      { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
      { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
      { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
    ]},
    { key: 'notificationsEnabled', label: 'Notifications Enabled', type: 'boolean', value: config.notificationsEnabled, category: 'ui' },
  ];

  const currentItems = configItems.filter(item => item.category === activeSection);

  if (isLoading) {
    return (
      <div className="config-page flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="config-page">
      {/* Header */}
      <div className="config-header">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Settings className="w-7 h-7 text-primary" />
              <h1 className="page-title">Configuration</h1>
            </div>
            <p className="page-subtitle">WZRD.dev Gateway configuration and settings</p>
          </div>
          <div className="header-actions flex gap-2">
            {hasChanges && (
              <Badge variant="default" className="animate-pulse">Unsaved changes</Badge>
            )}
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
              {isSaving ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      <div className="status-banner">
        <div className="status-indicator status-online" />
        <span className="status-text">Gateway Online • Connected to ws://127.0.0.1:18790</span>
        <span className="status-uptime">Uptime: 4h 23m</span>
      </div>

      {/* Main Content */}
      <div className="config-content">
        {/* Sidebar */}
        <div className="config-sidebar">
          {sections.map(section => {
            const SectionIcon = section.icon;
            return (
              <button
                key={section.id}
                className={`sidebar-section ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <SectionIcon className="w-4 h-4" />
                <span>{section.title}</span>
                <ChevronRight className="w-4 h-4 ml-auto" />
              </button>
            );
          })}
        </div>

        {/* Config Panel */}
        <div className="config-panel">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="section-icon">
                  <SectionIcon className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">{currentSection?.title}</CardTitle>
                  <CardDescription>{currentSection?.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="config-items space-y-4">
                {activeSection === 'mcp' ? (
                  <div className="mcp-servers">
                    <div className="mcp-header">
                      <h3 className="mcp-title">MCP Servers</h3>
                      <Button size="sm" variant="outline">
                        <Plus className="w-3 h-3 mr-1" />
                        Add Server
                      </Button>
                    </div>
                    {config.mcpServers.map((server: any, idx: number) => (
                      <div key={idx} className="mcp-server-item">
                        <div className="mcp-server-info">
                          <div className="mcp-server-name">{server.name}</div>
                          <div className="mcp-server-url">{server.url}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={server.status === 'connected' ? 'success' : 'default'}>
                            {server.status}
                          </Badge>
                          <Button size="sm" variant="ghost">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  currentItems.map(item => (
                    <div key={item.key} className="config-item">
                      {renderConfigItem(item)}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Info Panel */}
          <div className="config-info">
            <div className="info-card">
              <Activity className="w-5 h-5 text-primary" />
              <div className="info-content">
                <div className="info-title">System Status</div>
                <div className="info-value">All services operational</div>
              </div>
            </div>
            <div className="info-card">
              <Database className="w-5 h-5 text-green-400" />
              <div className="info-content">
                <div className="info-title">Memory Usage</div>
                <div className="info-value">245 / 500 MB</div>
              </div>
            </div>
            <div className="info-card">
              <Cpu className="w-5 h-5 text-orange-400" />
              <div className="info-content">
                <div className="info-title">CPU Usage</div>
                <div className="info-value">12.3%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add Switch component if it doesn't exist
const Switch = ({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (checked: boolean) => void }) => {
  return (
    <button
      type="button"
      onClick={() => onCheckedChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-muted'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  );
};
