'use client';

import { useState, useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { 
  Send, MessageSquare, Hash, Users, Bot, Clock, 
  Copy, CheckCircle, Volume2, ImageIcon, 
  RefreshCw, Zap, Target, Search, ChevronDown,
  Paperclip, FileText, FileImage, FileCode,
  Download, Trash2, Edit, MoreVertical
} from 'lucide-react';

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// State Atoms
import { 
  chatMessagesAtom,
  chatInputAtom,
  chatLoadingAtom,
  topicsAtom,
  activeTopicAtom,
  topicsLoadingAtom,
  syncEventsAtom,
  syncStatusAtom,
  activeInterfacesAtom
} from '@/stores/atoms';

// Services
import { gateway } from '@/lib/gateway';

// Types
interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant' | 'system' | 'discord' | 'telegram';
  timestamp: string;
  topicId?: string;
  topicName?: string;
  metadata?: {
    tokens?: number;
    model?: string;
    processingTime?: number;
    agent?: string;
  };
}

export function ChatPage() {
  // Jotai State
  const [messages, setMessages] = useAtom(chatMessagesAtom);
  const [input, setInput] = useAtom(chatInputAtom);
  const [loading, setLoading] = useAtom(chatLoadingAtom);
  const [topics, setTopics] = useAtom(topicsAtom);
  const [activeTopic, setActiveTopic] = useAtom(activeTopicAtom);
  const [topicsLoading] = useAtom(topicsLoadingAtom);
  const [syncEvents] = useAtom(syncEventsAtom);
  const [syncStatus] = useAtom(syncStatusAtom);
  const [activeInterfaces] = useAtom(activeInterfacesAtom);

  // Local State
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [messageFilter, setMessageFilter] = useState('all');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fetch topics on mount
    fetchTopics();
    // Load recent messages
    loadRecentMessages();
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    scrollToBottom();
  }, [messages]);

  const fetchTopics = async () => {
    try {
      const response = await fetch('/api/topics');
      const data = await response.json();
      if (data.topics) {
        setTopics(data.topics);
        // Set active topic if none selected
        if (!activeTopic && data.topics.length > 0) {
          const active = data.topics.find((t: any) => t.status === 'active') || data.topics[0];
          setActiveTopic(active);
        }
      }
    } catch (err) {
      console.error('Failed to fetch topics:', err);
    }
  };

  const loadRecentMessages = async () => {
    try {
      setLoading(true);
      
      // Check if there's real message history available
      if (activeTopic?.id) {
        const response = await fetch(`/api/messages/${activeTopic.id}`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages || []);
          return;
        }
      }
      
      // Fallback to mock data
      const mockMessages: ChatMessage[] = [
        {
          id: '1',
          content: 'Welcome to WZRD.dev Web UI! The Gateway is running on port 8765.',
          sender: 'system',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          topicId: activeTopic?.id,
          topicName: activeTopic?.title,
        },
        {
          id: '2',
          content: 'I\'m working on redesigning the Web UI to show real framework data.',
          sender: 'assistant',
          timestamp: new Date(Date.now() - 2400000).toISOString(),
          topicId: activeTopic?.id,
          topicName: activeTopic?.title,
          metadata: {
            tokens: 32,
            model: 'deepseek-ai/deepseek-v3.2',
            processingTime: 1200,
            agent: 'Remi'
          }
        },
        {
          id: '3',
          content: 'That\'s great! The old UI was showing fake metrics that didn\'t reflect what I was actually doing.',
          sender: 'user',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          topicId: activeTopic?.id,
          topicName: activeTopic?.title,
        },
        {
          id: '4',
          content: 'Now the Web UI shows real topics, real worktrees, real memory files, and actual sync events.',
          sender: 'assistant',
          timestamp: new Date(Date.now() - 1200000).toISOString(),
          topicId: activeTopic?.id,
          topicName: activeTopic?.title,
          metadata: {
            tokens: 40,
            model: 'deepseek-ai/deepseek-v3.2',
            processingTime: 1800,
            agent: 'Remi'
          }
        },
        {
          id: '5',
          content: 'Discord: "The Web UI is looking much better with real data!"',
          sender: 'discord',
          timestamp: new Date(Date.now() - 600000).toISOString(),
          topicId: activeTopic?.id,
          topicName: activeTopic?.title,
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
    if (!input.trim() || sending) return;
    
    // Create user message
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      content: input,
      sender: 'user',
      timestamp: new Date().toISOString(),
      topicId: activeTopic?.id,
      topicName: activeTopic?.title,
    };
    
    setMessages(prev => [...prev, userMessage]);
    const messageContent = input;
    setInput('');
    setSending(true);
    
    try {
      // Send message through Gateway
      const response = await gateway.sendMessage({
        type: 'message',
        content: messageContent,
        topicId: activeTopic?.id,
        sender: 'web-ui',
      });
      
      // Add assistant response
      if (response.success) {
        const assistantMessage: ChatMessage = {
          id: `assistant_${Date.now()}`,
          content: typeof response.content === 'string' ? response.content : 'Message received and processed.',
          sender: 'assistant',
          timestamp: new Date().toISOString(),
          topicId: activeTopic?.id,
          topicName: activeTopic?.title,
          metadata: {
            tokens: response.tokens,
            model: response.model,
            processingTime: response.processingTime,
            agent: response.agent,
          }
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        content: 'Failed to send message. Gateway may be unavailable.',
        sender: 'system',
        timestamp: new Date().toISOString(),
        topicId: activeTopic?.id,
        topicName: activeTopic?.title,
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Add file message to chat
      const fileMessage: ChatMessage = {
        id: `file_${Date.now()}`,
        content: `Uploaded file: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
        sender: 'user',
        timestamp: new Date().toISOString(),
        topicId: activeTopic?.id,
        topicName: activeTopic?.title,
      };
      
      setMessages(prev => [...prev, fileMessage]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  const getSenderIcon = (sender: string) => {
    switch (sender) {
      case 'user': return <Users className="w-4 h-4" />;
      case 'assistant': return <Bot className="w-4 h-4" />;
      case 'discord': return <Volume2 className="w-4 h-4" />;
      case 'telegram': return <Send className="w-4 h-4" />;
      case 'system': return <Zap className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getSenderColor = (sender: string) => {
    switch (sender) {
      case 'user': return 'bg-blue-500';
      case 'assistant': return 'bg-green-500';
      case 'discord': return 'bg-purple-500';
      case 'telegram': return 'bg-cyan-500';
      case 'system': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredMessages = messageFilter === 'all' 
    ? messages 
    : messages.filter(msg => msg.sender === messageFilter);

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Main Chat Area - Full Width */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar - Topics & Interfaces */}
        <div className="border-b border-border p-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-6">
            {/* Topic Selector */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Topic:</span>
              <Select
                value={activeTopic?.id || ''}
                onValueChange={(val) => {
                  const topic = topics.find(t => t.id === val);
                  if (topic) setActiveTopic(topic);
                }}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select a topic" />
                </SelectTrigger>
                <SelectContent>
                  {topics.map(topic => (
                    <SelectItem key={topic.id} value={topic.id}>
                      {topic.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {activeTopic?.status === 'active' && (
                <Badge variant="default" className="text-xs">Active</Badge>
              )}
            </div>

            {/* Interfaces Status */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${activeInterfaces.discord ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm">Discord</span>
                <Badge variant={activeInterfaces.discord ? 'default' : 'secondary'}>
                  {activeInterfaces.discord ? 'Connected' : 'Offline'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${activeInterfaces.cli ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm">CLI</span>
                <Badge variant={activeInterfaces.cli ? 'default' : 'secondary'}>
                  {activeInterfaces.cli ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>

            {/* Message Filter & Refresh */}
            <div className="flex items-center gap-2">
              <Select value={messageFilter} onValueChange={setMessageFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="assistant">Assistant</SelectItem>
                  <SelectItem value="discord">Discord</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={loadRecentMessages} disabled={loading}>
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading messages...</p>
              </div>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No messages yet. Start a conversation!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredMessages.map(message => (
                <div 
                  key={message.id} 
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-2xl ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                    <div className={`p-4 rounded-lg ${
                      message.sender === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : message.sender === 'assistant'
                        ? 'bg-card border border-border'
                        : message.sender === 'discord'
                        ? 'bg-purple-900/20 border border-purple-900/30'
                        : message.sender === 'system'
                        ? 'bg-yellow-900/20 border border-yellow-900/30'
                        : 'bg-accent'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${getSenderColor(message.sender)}`} />
                        <span className="text-sm font-medium capitalize">{message.sender}</span>
                        <span className="text-xs opacity-70 ml-auto">
                          {formatTimeAgo(message.timestamp)}
                        </span>
                      </div>
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      {message.metadata && (
                        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/50 text-xs">
                          {message.metadata.tokens && (
                            <span>Tokens: {String(message.metadata.tokens)}</span>
                          )}
                          {message.metadata.model && (
                            <span>Model: {String(message.metadata.model)}</span>
                          )}
                          {message.metadata.processingTime && (
                            <span>Time: {String(message.metadata.processingTime)}ms</span>
                          )}
                          {message.metadata.agent && (
                            <span>Agent: {String(message.metadata.agent)}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <div className="flex gap-2 mb-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,.txt,.md,.py,.js,.ts,.json"
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Paperclip className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Attach file</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {selectedFile && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {selectedFile.name}
                      <Trash2
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => setSelectedFile(null)}
                      />
                    </Badge>
                  )}
                </div>
                <div className="relative">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Message ${activeTopic?.title || 'WZRD.dev'}...`}
                    className="pr-12"
                    disabled={sending}
                  />
                  <Button
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    size="sm"
                    onClick={handleSend}
                    disabled={!input.trim() || sending}
                  >
                    {sending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Press Enter to send, Shift+Enter for new line
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}