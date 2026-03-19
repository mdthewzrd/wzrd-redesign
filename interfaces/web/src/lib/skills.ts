/**
 * Skills Client - Interface with WZRD.dev Tool Shed
 * Fetches skills from tool-shed.yaml and scans .agents/skills/ directory
 */

export interface SkillCategory {
  id: string;
  name: string;
  description: string;
  skills: string[];
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  categoryId: string;
  isLoaded: boolean;
  executions: number;
  successRate: number;
  avgResponseTime: number;
  version?: string;
  dependencies?: string[];
  lastUsed?: string;
}

export interface SkillsResponse {
  skills: Skill[];
  totalCount: number;
  loadedCount: number;
  categories: SkillCategory[];
}

export interface SkillDetails {
  id: string;
  name: string;
  description: string;
  category: string;
  content: string;
  isLoaded: boolean;
  metadata: {
    version?: string;
    dependencies?: string[];
    aliases?: string[];
    related?: string[];
  };
}

export class SkillsClient {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  /**
   * Fetch all skills with categories
   */
  async listSkills(): Promise<SkillsResponse> {
    const response = await fetch(`${this.baseUrl}/api/skills`);
    if (!response.ok) {
      throw new Error(`Failed to fetch skills: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Fetch skill categories
   */
  async getCategories(): Promise<SkillCategory[]> {
    const response = await fetch(`${this.baseUrl}/api/skills/categories`);
    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }
    const data = await response.json();
    return data.categories;
  }

  /**
   * Get specific skill details
   */
  async getSkill(id: string): Promise<SkillDetails> {
    const response = await fetch(`${this.baseUrl}/api/skills/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch skill: ${response.statusText}`);
    }
    return response.json();
  }
}

// Export singleton instance
export const skillsClient = new SkillsClient();

// Transform raw API skill to UI format with mock metrics
export function transformSkillToUI(skill: Skill): Skill {
  // Generate mock execution data based on skill name
  const nameHash = skill.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const mockExecutions = Math.floor(nameHash % 1000) + 50;
  const mockSuccessRate = 85 + (nameHash % 15);
  const mockAvgTime = Math.floor(nameHash % 500) + 100;

  return {
    ...skill,
    executions: skill.executions || mockExecutions,
    successRate: skill.successRate || mockSuccessRate,
    avgResponseTime: skill.avgResponseTime || mockAvgTime,
  };
}

// Get category color mapping
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    development: 'text-blue-400',
    architecture: 'text-purple-400',
    infrastructure: 'text-orange-400',
    security: 'text-red-400',
    ai_ml: 'text-green-400',
    business: 'text-yellow-400',
    ui_ux: 'text-pink-400',
    data: 'text-cyan-400',
  };
  return colors[category.toLowerCase()] || 'text-secondary-foreground';
}

// Get category background color
export function getCategoryBgColor(category: string): string {
  const colors: Record<string, string> = {
    development: 'bg-blue-500/15',
    architecture: 'bg-purple-500/15',
    infrastructure: 'bg-orange-500/15',
    security: 'bg-red-500/15',
    ai_ml: 'bg-green-500/15',
    business: 'bg-yellow-500/15',
    ui_ux: 'bg-pink-500/15',
    data: 'bg-cyan-500/15',
  };
  return colors[category.toLowerCase()] || 'bg-secondary/15';
}
