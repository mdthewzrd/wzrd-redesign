import { useState, useEffect } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import {
  FileCode,
  Play,
  Search,
  MoreVertical,
  Settings,
  CheckCircle,
  Clock,
  AlertCircle,
  Code,
  Bug,
  Search as SearchIcon,
  Map,
  ChevronRight,
  X,
  Zap,
  Layers,
  Activity,
  Cpu,
  Target,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  blueprintsAtom,
  activeBlueprintAtom,
  blueprintLoadingAtom,
  blueprintErrorAtom,
  blueprintStatisticsAtom,
  blueprintFilterAtom,
  blueprintModeFilterAtom,
} from '@/stores/atoms';
import { blueprintClient, type Blueprint, type BlueprintMode } from '@/lib/blueprints';
import { cn } from '@/lib/utils';

// Mode configurations
const MODE_CONFIG: Record<BlueprintMode, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
  coding: {
    icon: Code,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20 border-blue-500/30',
    label: 'Coding',
  },
  debugging: {
    icon: Bug,
    color: 'text-red-400',
    bgColor: 'bg-red-500/20 border-red-500/30',
    label: 'Debugging',
  },
  research: {
    icon: SearchIcon,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20 border-green-500/30',
    label: 'Research',
  },
  planning: {
    icon: Map,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20 border-amber-500/30',
    label: 'Planning',
  },
};

// Validation gate configurations
const VALIDATION_CONFIG = {
  pre_execution: { label: 'Pre', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  mid_execution: { label: 'Mid', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  post_execution: { label: 'Post', color: 'text-green-400', bgColor: 'bg-green-500/20' },
};

export function BlueprintsPage() {
  const [blueprints, setBlueprints] = useAtom(blueprintsAtom);
  const [activeBlueprint, setActiveBlueprint] = useAtom(activeBlueprintAtom);
  const [loading, setLoading] = useAtom(blueprintLoadingAtom);
  const [error, setError] = useAtom(blueprintErrorAtom);
  const [statistics, setStatistics] = useAtom(blueprintStatisticsAtom);
  const [searchQuery, setSearchQuery] = useAtom(blueprintFilterAtom);
  const [modeFilter, setModeFilter] = useAtom(blueprintModeFilterAtom);

  const [selectedBlueprint, setSelectedBlueprint] = useState<Blueprint | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [executeModalOpen, setExecuteModalOpen] = useState(false);
  const [executingBlueprint, setExecutingBlueprint] = useState<Blueprint | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<{ success: boolean; message: string } | null>(null);

  // Load blueprints on mount
  useEffect(() => {
    loadBlueprints();
    const interval = setInterval(loadBlueprints, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadBlueprints = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedBlueprints = await blueprintClient.listBlueprints();
      setBlueprints(fetchedBlueprints);

      // Load statistics
      const stats = await blueprintClient.getStatistics();
      setStatistics(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load blueprints');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBlueprint = (blueprint: Blueprint) => {
    setSelectedBlueprint(blueprint);
    setDetailsOpen(true);
  };

  const handleExecuteBlueprint = (blueprint: Blueprint) => {
    setExecutingBlueprint(blueprint);
    setExecuteModalOpen(true);
    setExecutionResult(null);
  };

  const executeBlueprint = async () => {
    if (!executingBlueprint) return;

    setIsExecuting(true);
    try {
      const result = await blueprintClient.executeBlueprint({
        blueprintId: executingBlueprint.id,
      });
      setExecutionResult({
        success: result.success,
        message: result.message,
      });
    } catch (err) {
      setExecutionResult({
        success: false,
        message: err instanceof Error ? err.message : 'Failed to execute blueprint',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSetActive = (blueprint: Blueprint) => {
    setActiveBlueprint(blueprint);
  };

const filteredBlueprints = blueprints.filter((blueprint) => {
    const matchesSearch =
      blueprint.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blueprint.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blueprint.required_skills?.some((skill) =>
        skill && skill.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesMode = modeFilter === 'all' || blueprint.mode === modeFilter;

    return matchesSearch && matchesMode;
  });

  const getPhaseStatus = (phase: Blueprint['phases'][0]) => {
    const hasPre = phase.steps.some((s) => s.validation === 'pre_execution');
    const hasMid = phase.steps.some((s) => s.validation === 'mid_execution');
    const hasPost = phase.steps.some((s) => s.validation === 'post_execution');

    if (hasPre && hasMid && hasPost) return 'complete';
    if (hasPre || hasMid) return 'partial';
    return 'minimal';
  };

  const ModeIcon = ({ mode, className }: { mode: BlueprintMode; className?: string }) => {
    const Icon = MODE_CONFIG[mode].icon;
    return <Icon className={className} />;
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Blueprints</h1>
            <p className="text-gray-400">Framework workflow definitions</p>
          </div>
          <Button
            onClick={loadBlueprints}
            variant="outline"
            className="border-white/10 text-gray-400 hover:text-white"
          >
            <Settings className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-[#141414] border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Blueprints</p>
                  <p className="text-2xl font-bold text-white">
                    {statistics?.totalBlueprints || 0}
                  </p>
                </div>
                <FileCode className="w-8 h-8 text-[#FFD700]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#141414] border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active</p>
                  <p className="text-2xl font-bold text-green-400">
                    {statistics?.activeBlueprints || 0}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#141414] border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Coding Mode</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {statistics?.byMode.coding || 0}
                  </p>
                </div>
                <Code className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#141414] border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Research Mode</p>
                  <p className="text-2xl font-bold text-green-400">
                    {statistics?.byMode.research || 0}
                  </p>
                </div>
                <SearchIcon className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search blueprints..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-500"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'coding', 'debugging', 'research', 'planning'] as const).map((mode) => (
              <Button
                key={mode}
                variant={modeFilter === mode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setModeFilter(mode)}
                className={cn(
                  'capitalize',
                  modeFilter === mode
                    ? 'bg-[#FFD700] text-black hover:bg-[#FFD700]/90'
                    : 'border-white/10 text-gray-400 hover:text-white'
                )}
              >
                {mode === 'all' ? 'All Modes' : MODE_CONFIG[mode].label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
          {error}
          <Button
            variant="ghost"
            size="sm"
            onClick={loadBlueprints}
            className="ml-4 text-red-400 hover:text-red-300"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Blueprints Grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBlueprints.map((blueprint) => (
            <Card
              key={blueprint.id}
              className={cn(
                'bg-[#141414] border-white/10 hover:border-[#FFD700]/50 transition-all cursor-pointer group',
                activeBlueprint?.id === blueprint.id &&
                  'border-[#FFD700]/50 ring-1 ring-[#FFD700]/20'
              )}
              onClick={() => handleSelectBlueprint(blueprint)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        MODE_CONFIG[blueprint.mode].bgColor
                      )}
                    >
                      <ModeIcon
                        mode={blueprint.mode}
                        className={cn('w-5 h-5', MODE_CONFIG[blueprint.mode].color)}
                      />
                    </div>
                    <div>
                      <CardTitle className="text-base text-white group-hover:text-[#FFD700] transition-colors">
                        {blueprint.name}
                      </CardTitle>
                      <p className="text-xs text-gray-500">ID: {blueprint.id}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-white/10">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetActive(blueprint);
                        }}
                        className="text-white hover:bg-white/10"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Set Active
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExecuteBlueprint(blueprint);
                        }}
                        className="text-[#FFD700] hover:bg-white/10"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Execute
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectBlueprint(blueprint);
                        }}
                        className="text-white hover:bg-white/10"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-3">
                <p className="text-sm text-gray-400 line-clamp-2">
                  {blueprint.description}
                </p>

                {/* Mode Badge */}
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs',
                      MODE_CONFIG[blueprint.mode].bgColor,
                      MODE_CONFIG[blueprint.mode].color
                    )}
                  >
                    <ModeIcon mode={blueprint.mode} className="w-3 h-3 mr-1" />
                    {MODE_CONFIG[blueprint.mode].label}
                  </Badge>
                  {blueprint.is_active ? (
                    <Badge
                      variant="outline"
                      className="bg-green-500/20 text-green-400 border-green-500/30 text-xs"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-gray-500/20 text-gray-400 border-gray-500/30 text-xs"
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      Inactive
                    </Badge>
                  )}
                </div>

                {/* Token Budget */}
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Cpu className="w-4 h-4" />
                  <span>{blueprint.token_budget.toLocaleString()} tokens</span>
                </div>

                {/* Phases Summary */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {blueprint.phases.length} phases
                  </span>
                  <div className="flex gap-1">
                    {blueprint.phases.slice(0, 4).map((phase, idx) => {
                      const status = getPhaseStatus(phase);
                      return (
                        <TooltipProvider key={idx}>
                          <Tooltip>
                            <TooltipTrigger>
                              <div
                                className={cn(
                                  'w-2 h-2 rounded-full',
                                  status === 'complete' && 'bg-green-500',
                                  status === 'partial' && 'bg-yellow-500',
                                  status === 'minimal' && 'bg-gray-500'
                                )}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">{phase.name}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                    {blueprint.phases.length > 4 && (
                      <span className="text-xs text-gray-500">
                        +{blueprint.phases.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {/* Validation Gates */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Validation:</span>
                  <div className="flex gap-1">
                    {blueprint.validation_gates.includes('pre_execution') && (
                      <Badge
                        variant="outline"
                        className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px] px-1"
                      >
                        Pre
                      </Badge>
                    )}
                    {blueprint.validation_gates.includes('mid_execution') && (
                      <Badge
                        variant="outline"
                        className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[10px] px-1"
                      >
                        Mid
                      </Badge>
                    )}
                    {blueprint.validation_gates.includes('post_execution') && (
                      <Badge
                        variant="outline"
                        className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px] px-1"
                      >
                        Post
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Required Skills */}
                {blueprint.required_skills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {blueprint.required_skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="text-xs px-2 py-1 bg-white/5 rounded text-gray-400"
                      >
                        {skill}
                      </span>
                    ))}
                    {blueprint.required_skills.length > 3 && (
                      <span className="text-xs px-2 py-1 text-gray-500">
                        +{blueprint.required_skills.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Execute Button */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="text-xs text-gray-500">
                    {blueprint.phases.reduce((acc, p) => acc + p.steps.length, 0)} steps
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExecuteBlueprint(blueprint);
                    }}
                    className="text-[#FFD700] hover:text-[#FFD700] hover:bg-[#FFD700]/10"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Execute
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredBlueprints.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileCode className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              {searchQuery ? 'No blueprints found' : 'No blueprints available'}
            </h3>
            <p className="text-gray-400 max-w-md">
              {searchQuery
                ? 'Try adjusting your search or filters'
                : 'Blueprints will be loaded from the framework configuration'}
            </p>
          </div>
        )}
      </div>

      {/* Blueprint Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="bg-[#141414] border-white/10 text-white max-w-3xl max-h-[80vh] overflow-auto">
          {selectedBlueprint && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-lg flex items-center justify-center',
                      MODE_CONFIG[selectedBlueprint.mode].bgColor
                    )}
                  >
                    <ModeIcon
                      mode={selectedBlueprint.mode}
                      className={cn('w-6 h-6', MODE_CONFIG[selectedBlueprint.mode].color)}
                    />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">{selectedBlueprint.name}</DialogTitle>
                    <p className="text-sm text-gray-400">ID: {selectedBlueprint.id}</p>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Description */}
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Description</h4>
                  <p className="text-gray-400">{selectedBlueprint.description}</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#1a1a1a] rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Configuration</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Mode:</span>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs',
                            MODE_CONFIG[selectedBlueprint.mode].bgColor,
                            MODE_CONFIG[selectedBlueprint.mode].color
                          )}
                        >
                          {MODE_CONFIG[selectedBlueprint.mode].label}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Token Budget:</span>
                        <span className="text-white">
                          {selectedBlueprint.token_budget.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Phases:</span>
                        <span className="text-white">{selectedBlueprint.phases.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Steps:</span>
                        <span className="text-white">
                          {selectedBlueprint.phases.reduce((acc, p) => acc + p.steps.length, 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#1a1a1a] rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Validation Gates</h4>
                    <div className="flex gap-2">
                      {selectedBlueprint.validation_gates.map((gate) => {
                        const config =
                          VALIDATION_CONFIG[gate as keyof typeof VALIDATION_CONFIG];
                        return (
                          <Badge
                            key={gate}
                            variant="outline"
                            className={cn('text-xs', config?.bgColor, config?.color)}
                          >
                            {config?.label || gate}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Required Skills */}
                {selectedBlueprint.required_skills.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedBlueprint.required_skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="border-white/20 text-gray-300"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Phases */}
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Phases</h4>
                  <div className="space-y-3">
                    {selectedBlueprint.phases.map((phase, idx) => (
                      <div key={idx} className="bg-[#1a1a1a] rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-[#FFD700]" />
                            <h5 className="font-medium text-white">{phase.name}</h5>
                          </div>
                          <Badge variant="outline" className="text-xs text-gray-400">
                            {phase.steps.length} steps
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400 mb-3">{phase.description}</p>
                        <div className="space-y-2">
                          {phase.steps.map((step, stepIdx) => (
                            <div
                              key={stepIdx}
                              className="flex items-start gap-2 text-sm text-gray-400"
                            >
                              <div className="w-5 h-5 rounded bg-[#FFD700]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs text-[#FFD700]">{stepIdx + 1}</span>
                              </div>
                              <div className="flex-1">
                                <p className="text-white">{step.description}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-gray-500">Tools:</span>
                                  {step.tools.map((tool) => (
                                    <span key={tool} className="text-xs text-gray-600">
                                      {tool}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDetailsOpen(false)}
                  className="border-white/10 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4 mr-2" />
                  Close
                </Button>
                <Button
                  onClick={() => {
                    handleSetActive(selectedBlueprint);
                    setDetailsOpen(false);
                  }}
                  className="bg-[#FFD700] hover:bg-[#FFD700]/90 text-black"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Set as Active
                </Button>
                <Button
                  onClick={() => {
                    setDetailsOpen(false);
                    handleExecuteBlueprint(selectedBlueprint);
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Execute Blueprint
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Execute Blueprint Modal */}
      <Dialog open={executeModalOpen} onOpenChange={setExecuteModalOpen}>
        <DialogContent className="bg-[#141414] border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FFD700]" />
              Execute Blueprint
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {executingBlueprint
                ? `Execute "${executingBlueprint.name}" blueprint`
                : 'Execute blueprint'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {executingBlueprint && !executionResult && (
              <div className="space-y-4">
                <div className="bg-[#1a1a1a] rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        MODE_CONFIG[executingBlueprint.mode].bgColor
                      )}
                    >
                      <ModeIcon
                        mode={executingBlueprint.mode}
                        className={cn('w-5 h-5', MODE_CONFIG[executingBlueprint.mode].color)}
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{executingBlueprint.name}</h4>
                      <p className="text-sm text-gray-400">{executingBlueprint.id}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{executingBlueprint.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{executingBlueprint.phases.length} phases</span>
                    <span>
                      {executingBlueprint.phases.reduce((acc, p) => acc + p.steps.length, 0)}{' '}
                      steps
                    </span>
                    <span>{executingBlueprint.token_budget.toLocaleString()} tokens</span>
                  </div>
                </div>

                <div className="text-sm text-gray-400">
                  <AlertCircle className="w-4 h-4 inline mr-2 text-yellow-500" />
                  This will send a request to the Gateway to execute this blueprint workflow.
                </div>
              </div>
            )}

            {executionResult && (
              <div
                className={cn(
                  'rounded-lg p-4',
                  executionResult.success
                    ? 'bg-green-500/10 border border-green-500/30'
                    : 'bg-red-500/10 border border-red-500/30'
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  {executionResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span
                    className={cn(
                      'font-medium',
                      executionResult.success ? 'text-green-400' : 'text-red-400'
                    )}
                  >
                    {executionResult.success ? 'Success' : 'Error'}
                  </span>
                </div>
                <p
                  className={cn(
                    'text-sm',
                    executionResult.success ? 'text-green-300' : 'text-red-300'
                  )}
                >
                  {executionResult.message}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setExecuteModalOpen(false)}
              className="border-white/10 text-gray-400 hover:text-white"
            >
              {executionResult ? 'Close' : 'Cancel'}
            </Button>
            {!executionResult && (
              <Button
                onClick={executeBlueprint}
                disabled={isExecuting}
                className="bg-[#FFD700] hover:bg-[#FFD700]/90 text-black"
              >
                {isExecuting ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Execute
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
