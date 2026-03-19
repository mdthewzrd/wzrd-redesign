import React from 'react';
import { ChevronRight, ChevronLeft, MessageSquare, BarChart3, Zap, FileText, Database, Link2, Server, Settings, ScrollText, Brain, Trophy, Layers, FileCode, RefreshCw, Container, MessageCircle, Globe, DollarSign, BookOpen, Cpu, CheckSquare, Network } from 'lucide-react';
import { useAtom } from 'jotai';
import { currentTabAtom, navGroupsCollapsedAtom, sidebarCollapsedAtom, TAB_GROUPS, iconForTab, titleForTab, type Tab } from '@/stores/atoms';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const [currentTab, setCurrentTab] = useAtom(currentTabAtom);
  const [collapsed, setCollapsed] = useAtom(sidebarCollapsedAtom);
  const [groupsCollapsed, setGroupsCollapsed] = useAtom(navGroupsCollapsedAtom);

  const toggleGroup = (label: string) => {
    setGroupsCollapsed({ ...groupsCollapsed, [label]: !groupsCollapsed[label] });
  };

const iconMap: Record<string, React.ElementType> = {
  // Chat & Communication
  MessageSquare,
  MessageCircle,
  Globe,
  
  // Framework Control
  BarChart3,
  Zap,
  Layers,
  Brain,
  Container,
  DollarSign,
  
  // Agent Operations
  BookOpen,
  Cpu,
  FileCode,
  Server,
  CheckSquare,
  
  // System Settings
  Settings,
  ScrollText,
  RefreshCw,
  Network,
  
  // Legacy icons (keep for compatibility)
  FileText,
  Link2,
  Trophy,
};

  const NavIcon = ({ tab }: { tab: Tab }) => {
    const iconName = iconForTab(tab);
    const Icon = iconMap[iconName] || FileText;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <nav
      className={cn(
        'border-r border-border/50 glass transition-all duration-300 flex flex-col relative',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-primary border-2 border-background flex items-center justify-center z-10 hover:scale-110 transition-transform"
      >
        {collapsed ? <ChevronRight className="w-3 h-3 text-primary-foreground" /> : <ChevronLeft className="w-3 h-3 text-primary-foreground" />}
      </button>

      <div className="flex-1 overflow-y-auto custom-scrollbar py-4">
        {TAB_GROUPS.map((group) => (
          <div key={group.label} className="mb-2">
            {/* Group Header */}
            {!collapsed && (
              <button
                onClick={() => toggleGroup(group.label)}
                className="w-full flex items-center justify-between px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
              >
                <span>{group.label}</span>
                <span
                  className={cn(
                    'transition-transform duration-200',
                    groupsCollapsed[group.label] ? '-rotate-90' : ''
                  )}
                >
                  ▼
                </span>
              </button>
            )}

            {/* Group Tabs */}
            {!groupsCollapsed[group.label] && (
              <div className="space-y-0.5">
                {group.tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setCurrentTab(tab)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2 text-sm transition-all duration-200 relative',
                      'hover:bg-accent/50 hover:text-foreground',
                      currentTab === tab
                        ? 'text-primary bg-primary/10 border-r-2 border-primary'
                        : 'text-muted-foreground',
                      collapsed && 'justify-center px-4'
                    )}
                  >
                    <NavIcon tab={tab} />
                    {!collapsed && <span>{titleForTab(tab)}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-border/50 text-xs text-muted-foreground text-center">
          v0.1.0-alpha
        </div>
      )}
    </nav>
  );
}
