/**
 * Sandbox Registry API Client
 * Bridges Web UI to framework's Sandbox/Worktree system
 */

export type SandboxStatus = 'running' | 'stopped' | 'error';
export type SandboxType = 'git_worktree' | 'docker_container' | 'process_namespace';
export type SandboxHealth = 'healthy' | 'warning' | 'error';

export interface SandboxResourceUsage {
  cpu?: number;
  memory?: number;
  disk?: number;
}

export interface Sandbox {
  id: string;
  name: string;
  type: SandboxType;
  path: string;
  status: SandboxStatus;
  health: SandboxHealth;
  createdAt: string;
  lastAccessed: string;
  branch?: string;
  commit?: string;
  resourceUsage: SandboxResourceUsage;
  topicId?: string;
  description?: string;
}

export interface SandboxRegistryEntry {
  sandbox_id: string;
  project_path: string;
  sandbox_type: SandboxType;
  created_at: string;
  resource_usage: SandboxResourceUsage;
  health_status: SandboxHealth;
  last_accessed: string;
  branch?: string;
  commit?: string;
  description?: string;
}

export interface SandboxRegistry {
  sandboxes: SandboxRegistryEntry[];
  created_at: string;
  updated_at: string;
}

export interface SandboxStatistics {
  totalSandboxes: number;
  activeSandboxes: number;
  healthySandboxes: number;
  totalDiskUsage: number;
  byType: {
    git_worktree: number;
    docker_container: number;
    process_namespace: number;
  };
}

export interface CreateSandboxRequest {
  name: string;
  type: SandboxType;
  branch?: string;
  description?: string;
  basePath?: string;
}

const API_BASE_URL = '/api';

class SandboxClient {
  private cache: Map<string, Sandbox> = new Map();
  private lastFetch: number = 0;
  private cacheTTL: number = 30000; // 30 seconds

  /**
   * Transform registry entry to UI-friendly Sandbox format
   */
  private transformEntry(entry: any): Sandbox {
    // Extract name from project_path or sandbox_id
    const name = entry.project_path
      ? entry.project_path.split('/').pop() || entry.sandbox_id
      : entry.sandbox_id;

    // Determine status from health and last accessed
    const lastAccessedTime = new Date(entry.last_accessed || entry.updatedAt || entry.createdAt).getTime();
    const isRecent = Date.now() - lastAccessedTime < 24 * 60 * 60 * 1000; // 24 hours

    let status: SandboxStatus = 'stopped';
    if (entry.health_status === 'error') {
      status = 'error';
    } else if (isRecent && (entry.health_status === 'healthy' || entry.status === 'active')) {
      status = 'running';
    }

    // Ensure we have proper health status
    const health: SandboxHealth = entry.health_status || (entry.status === 'active' ? 'healthy' : 'warning');

    return {
      id: entry.sandbox_id || entry.id,
      name: entry.name || name,
      type: entry.sandbox_type || entry.type,
      path: entry.project_path || entry.path,
      status,
      health,
      createdAt: entry.created_at || entry.createdAt,
      lastAccessed: entry.last_accessed || entry.updatedAt || entry.createdAt,
      branch: entry.branch,
      commit: entry.commit,
      resourceUsage: entry.resource_usage || entry.resourceUsage || {},
      description: entry.description,
    };
  }

  /**
   * Get disk usage for a directory
   */
  private async getDiskUsage(path: string): Promise<number> {
    try {
      // This would ideally call a server endpoint
      // For now, return a mock value
      return 0;
    } catch {
      return 0;
    }
  }

  /**
   * Fetch all sandboxes from the registry
   */
async listSandboxes(): Promise<Sandbox[]> {
    // Check cache
    const now = Date.now();
    if (now - this.lastFetch < this.cacheTTL && this.cache.size > 0) {
      return Array.from(this.cache.values());
    }

    try {
      console.log('🔍 SandboxClient: Fetching from', `${API_BASE_URL}/sandboxes`);
      const response = await fetch(`${API_BASE_URL}/sandboxes`, {
        headers: {
          'Accept': 'application/json',
        }
      }).catch(error => {
        console.error('🔍 SandboxClient: Fetch failed:', error);
        throw error;
      });
      console.log('🔍 SandboxClient: Response status', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No error text');
        console.error('🔍 SandboxClient: Response error:', errorText);
        throw new Error(`Failed to fetch sandboxes: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log('🔍 SandboxClient: Received', data.sandboxes?.length, 'sandboxes');
      
      const sandboxes = data.sandboxes.map((entry: any) => this.transformEntry(entry));
      console.log('🔍 SandboxClient: Transformed', sandboxes.length, 'sandboxes');
      
      // Update cache
      this.cache.clear();
      sandboxes.forEach(sandbox => this.cache.set(sandbox.id, sandbox));
      this.lastFetch = now;
      
      return sandboxes;
      this.lastFetch = Date.now();

      return sandboxes;
    } catch (error) {
      console.error('[SandboxClient] Error fetching sandboxes:', error);
      // Return cached data if available
      return Array.from(this.cache.values());
    }
  }

  /**
   * Get a single sandbox by ID
   */
  async getSandbox(id: string): Promise<Sandbox | undefined> {
    // Check cache first
    const cached = this.cache.get(id);
    if (cached && Date.now() - this.lastFetch < this.cacheTTL) {
      return cached;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/sandboxes/${id}`);
      if (!response.ok) throw new Error('Failed to fetch sandbox');
      const data = await response.json();
      
      if (data.sandbox) {
        const sandbox = this.transformEntry(data.sandbox);
        this.cache.set(id, sandbox);
        return sandbox;
      }
      return undefined;
    } catch (error) {
      console.error('[SandboxClient] Error fetching sandbox:', error);
      return this.cache.get(id);
    }
  }

  /**
   * Create a new sandbox
   */
  async createSandbox(request: CreateSandboxRequest): Promise<Sandbox> {
    const response = await fetch(`${API_BASE_URL}/sandboxes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create sandbox: ${error}`);
    }

    const data = await response.json();
    const sandbox = this.transformEntry(data.sandbox);
    this.cache.set(sandbox.id, sandbox);
    return sandbox;
  }

  /**
   * Delete a sandbox
   */
  async deleteSandbox(id: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/sandboxes/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete sandbox');
    }

    this.cache.delete(id);
    return true;
  }

  /**
   * Start a sandbox
   */
  async startSandbox(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/sandboxes/${id}/start`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to start sandbox');
    }

    // Update cache
    const sandbox = this.cache.get(id);
    if (sandbox) {
      sandbox.status = 'running';
      this.cache.set(id, sandbox);
    }
  }

  /**
   * Stop a sandbox
   */
  async stopSandbox(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/sandboxes/${id}/stop`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to stop sandbox');
    }

    // Update cache
    const sandbox = this.cache.get(id);
    if (sandbox) {
      sandbox.status = 'stopped';
      this.cache.set(id, sandbox);
    }
  }

  /**
   * Get sandbox statistics
   */
  async getStatistics(): Promise<SandboxStatistics> {
    try {
      const response = await fetch(`${API_BASE_URL}/sandboxes/statistics`);
      if (!response.ok) throw new Error('Failed to fetch statistics');
      const data = await response.json();
      return data.statistics;
    } catch (error) {
      console.error('[SandboxClient] Error fetching statistics:', error);
      // Return computed statistics from cache
      const sandboxes = Array.from(this.cache.values());
      return {
        totalSandboxes: sandboxes.length,
        activeSandboxes: sandboxes.filter(s => s.status === 'running').length,
        healthySandboxes: sandboxes.filter(s => s.health === 'healthy').length,
        totalDiskUsage: sandboxes.reduce((acc, s) => acc + (s.resourceUsage?.disk || 0), 0),
        byType: {
          git_worktree: sandboxes.filter(s => s.type === 'git_worktree').length,
          docker_container: sandboxes.filter(s => s.type === 'docker_container').length,
          process_namespace: sandboxes.filter(s => s.type === 'process_namespace').length,
        },
      };
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.lastFetch = 0;
  }
}

// Singleton instance
export const sandboxClient = new SandboxClient();
