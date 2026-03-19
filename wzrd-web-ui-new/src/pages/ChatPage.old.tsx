'use client';

import { useState, useEffect, useRef, type KeyboardEvent } from 'react';
import { useAtom } from 'jotai';
import {
  Send, MessageSquare, Hash, Users, Bot, Clock, 
  Copy, CheckCircle, Volume2, Image as ImageIcon, 
  RefreshCw, Zap, Target, Search,
  Paperclip, Smile, MoreVertical, Edit, Trash2,
  ChevronLeft, ChevronRight, Filter, BookOpen,
  Sparkles, Terminal
} from 'lucide-react';

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

// State Atoms
import {
  wsConnectedAtom,
  wsConnectingAtom,
  chatMessagesAtom,
  chatInputAtom,
  chatLoadingAtom,
  topicsAtom,
  activeTopicAtom,
  topicsLoadingAtom,
  syncEventsAtom,
  syncStatusAtom,
  activeInterfacesAtom,
} from '@/stores/atoms';

// Gateway & Services
import { gateway } from '@/lib/gateway';
import { topicRegistry } from '@/lib/topic-registry';
import type { Topic } from '@/lib/topic-registry';

// Utility
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/stores/atoms';

export function ChatPage() {
  // Jotai State
  const [wsConnected] = useAtom(wsConnectedAtom);
  const [wsConnecting] = useAtom(wsConnectingAtom);
  const [messages, setMessages] = useAtom(chatMessagesAtom);
  const [input, setInput] = useAtom(chatInputAtom);
  const [loading, setLoading] = useAtom(chatLoadingAtom);
  const [topics] = useAtom(topicsAtom);
  const [activeTopic, setActiveTopic] = useAtom(activeTopicAtom);
  const [topicsLoading] = useAtom(topicsLoadingAtom);
  const [syncEvents] = useAtom(syncEventsAtom);
  const [syncStatus] = useAtom(syncStatusAtom);
  const [activeInterfaces] = useAtom(activeInterfacesAtom);

  // Local State
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'topics' | 'history' | 'files'>('chat');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchTopics();
    loadRecentMessages();
    connectToGateway();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const connectToGateway = async () => {
    try {
      // Connect to wzrd-redesign Gateway on port 8765
      console.log('Connecting to Gateway at ws://127.0.0.1:8765...');
      // Gateway should auto-connect via ShellLayout useEffect
    } catch (err) {
      console.error('Failed to connect to Gateway:', err);
    }
  };

const fetchTopics = async () => {
    try {
      // Use TopicRegistry to fetch real topics
      const fetchedTopics = await topicRegistry.listTopics();
      console.log('Fetched topics:', fetchedTopics);
      
      // Set active topic if none selected
      if (!activeTopic && fetchedTopics.length > 0) {
        const active = fetchedTopics.find(t => t.status === 'active') || fetchedTopics[0];
        setActiveTopic(active);
      }
    } catch (err) {
      console.error('Failed to fetch topics:', err);
      // Fallback to API fetch
      try {
        const response = await fetch('/api/topics');
        const data = await response.json();
        if (data.topics && data.topics.length > 0) {
          const apiTopics: Topic[] = data.topics.map((t: any) => ({
            id: t.id,
            title: t.title || t.id,
            description: t.description || '',
            created_at: t.created_at || new Date().toISOString(),
            updated_at: t.updated_at || new Date().toISOString(),
            status: t.status || 'inactive',
            progress: t.progress || 0,
            tasks_completed: t.tasks_completed || 0,
            tasks_total: t.tasks_total || 0,
            memory_path: t.memory_path || `/home/mdwzrd/wzrd-redesign/memory/topics/${t.id}`,
            discord_channel_id: t.discord_channel_id || null,
            cli_alias: t.cli_alias || t.id,
            project_path: t.project_path || '/home/mdwzrd/wzrd-redesign',
            interface_mapping: t.interface_mapping || {
              discord: t.discord_channel_id || null,
              web: true,
              cli: t.cli_alias || null,
            },
          }));
          if (!activeTopic && apiTopics.length > 0) {
            setActiveTopic(apiTopics.find(t => t.status === 'active') || apiTopics[0]);
          }
        }
      } catch (apiErr) {
        console.error('Failed to fetch topics from API:', apiErr);
      }
    }
  };

  const loadRecentMessages = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, this would fetch from Gateway
      const mockMessages: ChatMessage[] = [
        {
          id: '1',
          content: 'Welcome to the WZRD Redesign chat! This is connected to the new Gateway on port 8765.',
          sender: 'system',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          topic: 'system'
        },
        {
          id: '2',
          content: 'I\'m working on redesigning the Web UI to show real framework data instead of fake metrics.',
          sender: 'assistant',
          timestamp: new Date(Date.now() - 240000).toISOString(),
          topic: 'wzrd-redesign',
          agent: 'Remi',
          metadata: {
            tokens: 42,
            model: 'deepseek-ai/deepseek-v3.2',
            processingTime: 1200
          }
        },
        {
          id: '3',
          content: 'That\'s great! The old UI was showing "0 requests today" which felt disconnected from what I was actually doing.',
          sender: 'user',
          timestamp: new Date(Date.now() - 180000).toISOString(),
          topic: 'wzrd-redesign'
        },
        {
          id: '4',
          content: 'Exactly! Now the Overview page shows real topics, memory files, worktrees, and recent activity from the actual framework.',
          sender: 'assistant',
          timestamp: new Date(Date.now() - 120000).toISOString(),
          topic: 'wzrd-redesign',
          agent: 'Remi',
          metadata: {
            tokens: 56,
            model: 'deepseek-ai/deepseek-v3.2',
            processingTime: 1500
          }
        },
        {
          id: '5',
          content: 'Discord: "The Web UI redesign looks promising"',
          sender: 'discord',
          timestamp: new Date(Date.now() - 60000).toISOString(),
          topic: 'wzrd-redesign',
          source: 'discord'
        }
      ];
      
      setMessages(mockMessages);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedTopic || sending) return;
    
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      content: input,
      sender: 'user',
      timestamp: new Date().toISOString(),
      topic: topics.find(t => t.id === selectedTopic)?.name
    };
    
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setSending(true);
    
    try {
      // In a real implementation, this would send to Gateway
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const responseMessage: ChatMessage = {
        id: `assistant_${Date.now()}`,
        content: `I received your message about "${currentInput}". This would be processed by the Gateway and routed to the appropriate agent based on the topic.`,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        topic: topics.find(t => t.id === selectedTopic)?.name,
        agent: 'Remi',
        metadata: {
          tokens: Math.floor(currentInput.length / 4),
          model: 'deepseek-ai/deepseek-v3.2',
          processingTime: 1800
        }
      };
      
      setMessages(prev => [...prev, responseMessage]);
    } catch (err) {
      console.error('Failed to send message:', err);
      
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        content: 'Failed to send message. Please check Gateway connection.',
        sender: 'system',
        timestamp: new Date().toISOString(),
        topic: 'system'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getSenderColor = (sender: string) => {
    switch (sender) {
      case 'user': return 'bg-blue-500';
      case 'assistant': return 'bg-green-500';
      case 'discord': return 'bg-purple-500';
      case 'cli': return 'bg-yellow-500';
      case 'system': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getSenderIcon = (sender: string) => {
    switch (sender) {
      case 'user': return <Users className="w-4 h-4" />;
      case 'assistant': return <Bot className="w-4 h-4" />;
      case 'discord': return <Hash className="w-4 h-4" />;
      case 'cli': return <MessageSquare className="w-4 h-4" />;
      case 'system': return <Zap className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getSelectedTopicName = () => {
    const topic = topics.find(t => t.id === selectedTopic);
    return topic ? topic.name : 'Select a topic';
  };

  if (loading && messages.length === 0) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-96 rounded-lg" />
          <Skeleton className="h-96 rounded-lg md:col-span-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="w-8 h-8 text-blue-400" />
              Chat
            </h1>
            <p className="text-muted-foreground mt-2">
              Gateway-connected chat with session sync across interfaces
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={connected ? 'default' : 'destructive'} className="gap-2">
              {connected ? (
                <>
                  <CheckCircle className="w-3 h-3" />
                  Connected
                </>
              ) : (
                <>
                  <RefreshCw className="w-3 h-3" />
                  Disconnected
                </>
              )}
            </Badge>
            <Button variant="outline" size="sm" onClick={fetchTopics} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Topics Sidebar */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Topics
            </CardTitle>
            <CardDescription>
              Select a topic to focus the conversation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${selectedTopic === topic.id ? 'bg-accent border border-primary' : 'hover:bg-accent/50'}`}
                  onClick={() => setSelectedTopic(topic.id)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium truncate">{topic.name}</div>
                    {topic.is_active && (
                      <Badge variant="default" className="text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground line-clamp-2">
                    {topic.description}
                  </div>
                </div>
              ))}
              
              {topics.length === 0 && (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                  <p className="text-muted-foreground">No topics found</p>
                  <Button variant="outline" className="mt-4">
                    Create Topic
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="md:col-span-2 flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  {getSelectedTopicName()}
                </CardTitle>
                <CardDescription>
                  {messages.length} messages • {formatTimeAgo(messages[messages.length - 1]?.timestamp || new Date().toISOString())}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {topics.map((topic) => (
                      <SelectItem key={topic.id} value={topic.id}>
                        {topic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Volume2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-hidden flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-1">
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getSenderColor(message.sender)} text-white flex-shrink-0`}>
                    {getSenderIcon(message.sender)}
                  </div>
                  
                  {/* Message */}
                  <div className={`flex-1 ${message.sender === 'user' ? 'items-end' : ''}`}>
                    <div className={`p-3 rounded-lg max-w-[80%] ${message.sender === 'user' ? 'bg-primary text-primary-foreground ml-auto' : 'bg-accent'}`}>
                      <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    </div>
                    
                    {/* Metadata */}
                    <div className={`flex items-center gap-3 mt-1 text-xs text-muted-foreground ${message.sender === 'user' ? 'justify-end' : ''}`}>
                      <span>{formatTimeAgo(message.timestamp)}</span>
                      {message.topic && (
                        <Badge variant="outline" className="text-xs">
                          <Target className="w-3 h-3 mr-1" />
                          {message.topic}
                        </Badge>
                      )}
                      {message.agent && (
                        <Badge variant="secondary" className="text-xs">
                          <Bot className="w-3 h-3 mr-1" />
                          {message.agent}
                        </Badge>
                      )}
                      {message.metadata?.tokens && (
                        <span>{message.metadata.tokens} tokens</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button variant="outline" size="icon" disabled>
                  <ImageIcon className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" disabled>
                  <Copy className="w-4 h-4" />
                </Button>
                <div className="flex-1" />
                <Badge variant="outline" className="text-xs">
                  {selectedTopic ? topics.find(t => t.id === selectedTopic)?.name : 'No topic selected'}
                </Badge>
              </div>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message... (Press Enter to send)"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={sending || !selectedTopic}
                  className="flex-1"
                />
                <Button onClick={handleSend} disabled={sending || !input.trim() || !selectedTopic}>
                  {sending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send
                    </>
                  )}
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground flex justify-between">
                <span>
                  Connected to Gateway: {connected ? '✅' : '❌'}
                </span>
                <span>
                  Messages sync with Discord & CLI
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}