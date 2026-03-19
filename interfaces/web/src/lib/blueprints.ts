/**
 * Blueprint Engine API Client
 * Bridges Web UI to framework's Blueprint Engine
 */

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

export interface BlueprintValidationGates {
  pre: boolean;
  mid: boolean;
  post: boolean;
}

export interface BlueprintData {
  name: string;
  description: string;
  mode: BlueprintMode;
  token_budget: number;
  phases: BlueprintPhase[];
  required_skills: string[];
  validation_gates: string[];
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
  created_at: number;
  updated_at: number;
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

export interface ExecuteBlueprintRequest {
  blueprintId: string;
  topicId?: string;
  parameters?: Record<string, any>;
}

export interface ExecuteBlueprintResponse {
  success: boolean;
  executionId: string;
  message: string;
}

const API_BASE_URL = '/api';

class BlueprintClient {
  private cache: Map<string, Blueprint> = new Map();
  private lastFetch: number = 0;
  private cacheTTL: number = 30000; // 30 seconds

  /**
   * Parse blueprint type from ID
   */
  private getBlueprintType(id: string): BlueprintType {
    const typeMap: Record<string, BlueprintType> = {
      feature_implementation: 'feature_implementation',
      bug_fixing: 'bug_fixing',
      research: 'research',
      planning: 'planning',
    };
    return typeMap[id] || 'feature_implementation';
  }

  /**
   * Parse validation gates from array to object
   */
  private parseValidationGates(gates: string[]): BlueprintValidationGates {
    return {
      pre: gates.includes('pre_execution'),
      mid: gates.includes('mid_execution'),
      post: gates.includes('post_execution'),
    };
  }

  /**
   * Transform raw YAML data to Blueprint interface
   */
  private transformBlueprint(id: string, data: BlueprintData): Blueprint {
    return {
      id,
      name: data.name,
      description: data.description,
      type: this.getBlueprintType(id),
      mode: data.mode,
      token_budget: data.token_budget,
      phases: data.phases || [],
      required_skills: data.required_skills || [],
      validation_gates: data.validation_gates || [],
      is_active: true,
      created_at: Date.now(),
      updated_at: Date.now(),
    };
  }

  /**
   * Fetch all blueprints from the framework
   */
  async listBlueprints(): Promise<Blueprint[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/blueprints`);
      if (!response.ok) throw new Error('Failed to fetch blueprints');
      const data = await response.json();

      const blueprints: Blueprint[] = [];
      if (data.blueprints) {
        Object.entries(data.blueprints).forEach(([id, blueprintData]: [string, any]) => {
          const blueprint = this.transformBlueprint(id, blueprintData);
          blueprints.push(blueprint);
          this.cache.set(id, blueprint);
        });
      }

      this.lastFetch = Date.now();
      return blueprints;
    } catch (error) {
      console.error('[BlueprintClient] Error fetching blueprints:', error);
      // Return cached data if available
      return Array.from(this.cache.values());
    }
  }

  /**
   * Get a single blueprint by ID
   */
  async getBlueprint(id: string): Promise<Blueprint | undefined> {
    // Check cache first
    const cached = this.cache.get(id);
    if (cached && Date.now() - this.lastFetch < this.cacheTTL) {
      return cached;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/blueprints/${id}`);
      if (!response.ok) throw new Error('Failed to fetch blueprint');
      const data = await response.json();
      
      if (data.blueprint) {
        const blueprint = this.transformBlueprint(id, data.blueprint);
        this.cache.set(id, blueprint);
        return blueprint;
      }
      return undefined;
    } catch (error) {
      console.error('[BlueprintClient] Error fetching blueprint:', error);
      return this.cache.get(id);
    }
  }

  /**
   * Get blueprint statistics
   */
  async getStatistics(): Promise<BlueprintStatistics> {
    const blueprints = await this.listBlueprints();
    
    return {
      totalBlueprints: blueprints.length,
      activeBlueprints: blueprints.filter(b => b.is_active).length,
      byMode: {
        coding: blueprints.filter(b => b.mode === 'coding').length,
        debugging: blueprints.filter(b => b.mode === 'debugging').length,
        research: blueprints.filter(b => b.mode === 'research').length,
        planning: blueprints.filter(b => b.mode === 'planning').length,
      },
    };
  }

  /**
   * Execute a blueprint
   */
  async executeBlueprint(request: ExecuteBlueprintRequest): Promise<ExecuteBlueprintResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/blueprints/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to execute blueprint: ${error}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[BlueprintClient] Error executing blueprint:', error);
      throw error;
    }
  }

  /**
   * Get blueprints by mode
   */
  async getBlueprintsByMode(mode: BlueprintMode): Promise<Blueprint[]> {
    const blueprints = await this.listBlueprints();
    return blueprints.filter(b => b.mode === mode);
  }

  /**
   * Get active blueprints
   */
  async getActiveBlueprints(): Promise<Blueprint[]> {
    const blueprints = await this.listBlueprints();
    return blueprints.filter(b => b.is_active);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.lastFetch = 0;
  }

  /**
   * Get mode display name
   */
  getModeDisplayName(mode: BlueprintMode): string {
    const names: Record<BlueprintMode, string> = {
      coding: 'Coding',
      debugging: 'Debugging',
      research: 'Research',
      planning: 'Planning',
    };
    return names[mode] || mode;
  }

  /**
   * Get mode color
   */
  getModeColor(mode: BlueprintMode): string {
    const colors: Record<BlueprintMode, string> = {
      coding: '#3B82F6',     // Blue
      debugging: '#EF4444',   // Red
      research: '#10B981',    // Green
      planning: '#F59E0B',    // Amber
    };
    return colors[mode] || '#6B7280';
  }

  /**
   * Get mode icon
   */
  getModeIcon(mode: BlueprintMode): string {
    const icons: Record<BlueprintMode, string> = {
      coding: 'Code',
      debugging: 'Bug',
      research: 'Search',
      planning: 'Map',
    };
    return icons[mode] || 'FileCode';
  }
}

// Singleton instance
export const blueprintClient = new BlueprintClient();
