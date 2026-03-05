/**
 * Unified Memory System with jCodeMunch integration
 * Implements agentic search + semantic search for token efficiency
 */

export interface MemoryContent {
  content: string;
  type: 'text' | 'code' | 'message' | 'file';
  topicId?: string;
  metadata?: Record<string, any>;
  timestamp: number;
}

export interface SearchOptions {
  query: string;
  topicId?: string;
  type?: string;
  limit?: number;
  minResults?: number;
  useSemantic?: boolean;
  useAgentic?: boolean;
}

export interface TokenMetrics {
  tokensSaved: number;
  totalTokensSaved: number;
  costAvoided: number;
  totalCostAvoided: number;
  semanticSearchCount: number;
  agenticSearchCount: number;
}

export interface HealthMetrics {
  memorySize: number;
  topicCount: number;
  searchLatency: number;
  cacheHitRate: number;
  tokenEfficiency: number;
}

export default class UnifiedMemory {
  private basePath: string;
  private cache: Map<string, MemoryContent[]> = new Map();
  private searchHistory: string[] = [];
  private jcodeMunchAvailable: boolean = false;
  private tokenMetrics: TokenMetrics = {
    tokensSaved: 0,
    totalTokensSaved: 0,
    costAvoided: 0,
    totalCostAvoided: 0,
    semanticSearchCount: 0,
    agenticSearchCount: 0
  };

  constructor(basePath?: string) {
    this.basePath = basePath || '/home/mdwzrd/wzrd-redesign/memory';
    this.checkjCodeMunch();
  }

  private async checkjCodeMunch(): Promise<void> {
    try {
      const { spawn } = await import('child_process');
      const result = spawn('python3', ['-c', 'import jcodemunch_mcp; print("available")'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 5000
      });
      
      result.on('close', (code) => {
        this.jcodeMunchAvailable = code === 0;
        console.log(`[Memory] jCodeMunch ${this.jcodeMunchAvailable ? 'available' : 'unavailable'}`);
      });
    } catch (error) {
      console.log('[Memory] jCodeMunch check failed:', error.message);
    }
  }

  async store(content: MemoryContent): Promise<void> {
    const topicPath = `${this.basePath}/topics/${content.topicId || 'global'}`;
    const fs = await import('fs');
    const path = await import('path');
    
    // Create directory if needed
    if (!fs.existsSync(topicPath)) {
      fs.mkdirSync(topicPath, { recursive: true });
    }
    
    // Store in topic file
    const timestamp = Date.now();
    const filename = `${content.type}_${timestamp}.json`;
    const filepath = path.join(topicPath, filename);
    
    const storeData = {
      ...content,
      storedAt: new Date().toISOString(),
      filepath
    };
    
    fs.writeFileSync(filepath, JSON.stringify(storeData, null, 2));
    
    console.log(`[Memory] Stored ${content.type} to ${filepath}`);
    
    // Index in jCodeMunch if available and it's code
    if (this.jcodeMunchAvailable && content.type === 'code') {
      await this.indexInJCodeMunch(content);
    }
  }

  async search(options: SearchOptions): Promise<MemoryContent[]> {
    const cacheKey = `${options.query}|${options.topicId}|${options.type}|${options.useSemantic}|${options.useAgentic}`;
    
    // Check cache (5 minute TTL)
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      const cacheAge = Date.now() - (cached[0]?.timestamp || 0);
      if (cacheAge < 5 * 60 * 1000) {
        console.log(`[Memory] Cache hit for: ${options.query}`);
        return cached.slice(0, options.limit || 10);
      }
    }
    
    const results: MemoryContent[] = [];
    
    // 1. Try semantic search with jCodeMunch
    if (options.useSemantic !== false && this.jcodeMunchAvailable) {
      try {
        const semanticResults = await this.semanticSearch(options.query, options.topicId);
        results.push(...semanticResults);
        this.tokenMetrics.semanticSearchCount++;
        
        // Record token savings (estimate)
        const tokensSaved = Math.min(1000, options.query.length * 10); // Conservative estimate
        this.tokenMetrics.tokensSaved += tokensSaved;
        this.tokenMetrics.totalTokensSaved += tokensSaved;
        this.tokenMetrics.costAvoided += tokensSaved * 0.00001; // $0.01 per 1000 tokens
        this.tokenMetrics.totalCostAvoided += tokensSaved * 0.00001;
      } catch (error) {
        console.log('[Memory] Semantic search failed:', error.message);
      }
    }
    
    // 2. Agentic search fallback (ripgrep/glob)
    if (options.useAgentic !== false && results.length < (options.minResults || 3)) {
      const agenticResults = await this.agenticSearch(options.query, options.topicId, options.type);
      results.push(...agenticResults);
      this.tokenMetrics.agenticSearchCount++;
    }
    
    // Rank and deduplicate
    const rankedResults = this.rankResults(results, options.query);
    const finalResults = rankedResults.slice(0, options.limit || 10);
    
    // Update cache
    this.cache.set(cacheKey, finalResults);
    if (this.searchHistory.length > 100) {
      this.searchHistory.shift();
    }
    this.searchHistory.push(cacheKey);
    
    return finalResults;
  }

  private async semanticSearch(query: string, topicId?: string): Promise<MemoryContent[]> {
    // jCodeMunch integration
    const { spawn } = await import('child_process');
    const util = await import('util');
    const exec = util.promisify(spawn);
    
    try {
      // Use jCodeMunch to search for code patterns
      const result = spawn('python3', [
        '-c',
        `import jcodemunch_mcp, json, sys; 
         result = jcodemunch_mcp.search("${query}", {"limit": 5});
         print(json.dumps(result))`
      ]);
      
      let stdout = '';
      let stderr = '';
      
      result.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      result.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      return new Promise((resolve) => {
        result.on('close', () => {
          try {
            const parsed = JSON.parse(stdout);
            const results: MemoryContent[] = parsed.map((item: any) => ({
              content: item.content || '',
              type: 'code',
              topicId: topicId,
              metadata: { source: 'jCodeMunch', relevance: item.relevance || 0 },
              timestamp: Date.now()
            }));
            resolve(results);
          } catch (error) {
            console.log('[Memory] Failed to parse jCodeMunch results:', error.message);
            resolve([]);
          }
        });
      });
    } catch (error) {
      console.log('[Memory] jCodeMunch search error:', error.message);
      return [];
    }
  }

  private async agenticSearch(query: string, topicId?: string, type?: string): Promise<MemoryContent[]> {
    const { exec } = await import('child_process');
    const util = await import('util');
    const execPromise = util.promisify(exec);
    const path = await import('path');
    
    const searchPath = topicId 
      ? `${this.basePath}/topics/${topicId}`
      : `${this.basePath}/topics`;
    
    try {
      // Use ripgrep for fast text search
      const { stdout } = await execPromise(`rg -i "${query}" "${searchPath}" --json`);
      
      const lines = stdout.trim().split('\n').filter(Boolean);
      const results: MemoryContent[] = [];
      
      for (const line of lines) {
        try {
          const match = JSON.parse(line);
          if (match.type === 'match') {
            results.push({
              content: match.data.lines.text,
              type: 'text',
              topicId: topicId,
              metadata: {
                file: match.data.path.text,
                line: match.data.line_number,
                source: 'ripgrep'
              },
              timestamp: Date.now()
            });
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
      
      return results;
    } catch (error) {
      // Fallback to simple file reading
      console.log('[Memory] Ripgrep search failed, using file scan');
      return this.fileScanSearch(query, searchPath);
    }
  }

  private async fileScanSearch(query: string, searchPath: string): Promise<MemoryContent[]> {
    const fs = await import('fs');
    const path = await import('path');
    
    const results: MemoryContent[] = [];
    
    if (!fs.existsSync(searchPath)) {
      return results;
    }
    
    const files = fs.readdirSync(searchPath);
    
    for (const file of files.slice(0, 20)) { // Limit to first 20 files
      const filePath = path.join(searchPath, file);
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        if (content.toLowerCase().includes(query.toLowerCase())) {
          results.push({
            content: content.substring(0, 500), // Limit content size
            type: path.extname(file) === '.json' ? 'text' : 'file',
            topicId: path.basename(searchPath),
            metadata: { file, source: 'file-scan' },
            timestamp: Date.now()
          });
        }
      } catch (error) {
        // Skip unreadable files
      }
    }
    
    return results;
  }

  private rankResults(results: MemoryContent[], query: string): MemoryContent[] {
    return results.sort((a, b) => {
      // Simple ranking: exact match > semantic match > partial match
      const aContent = a.content.toLowerCase();
      const bContent = b.content.toLowerCase();
      const queryLower = query.toLowerCase();
      
      const aScore = aContent.includes(queryLower) ? 100 : 
                    (a.metadata?.relevance || 0) * 100;
      const bScore = bContent.includes(queryLower) ? 100 : 
                    (b.metadata?.relevance || 0) * 100;
      
      return bScore - aScore;
    });
  }

  private async indexInJCodeMunch(content: MemoryContent): Promise<void> {
    // Placeholder for jCodeMunch indexing
    console.log(`[Memory] Would index ${content.type} in jCodeMunch`);
  }

  async query(options: SearchOptions): Promise<MemoryContent[]> {
    return this.search(options);
  }

  async getTokenMetrics(): Promise<TokenMetrics> {
    return { ...this.tokenMetrics };
  }

  async getHealthMetrics(): Promise<HealthMetrics> {
    const fs = await import('fs');
    const path = await import('path');
    
    const topicsPath = `${this.basePath}/topics`;
    let topicCount = 0;
    let memorySize = 0;
    
    if (fs.existsSync(topicsPath)) {
      const topics = fs.readdirSync(topicsPath);
      topicCount = topics.length;
      
      for (const topic of topics) {
        const topicPath = path.join(topicsPath, topic);
        const stats = fs.statSync(topicPath);
        if (stats.isDirectory()) {
          const files = fs.readdirSync(topicPath);
          memorySize += files.length;
        }
      }
    }
    
    const cacheHitRate = this.searchHistory.length > 0 
      ? this.cache.size / this.searchHistory.length 
      : 0;
    
    const tokenEfficiency = this.tokenMetrics.totalTokensSaved > 0
      ? this.tokenMetrics.totalTokensSaved / (this.tokenMetrics.semanticSearchCount + this.tokenMetrics.agenticSearchCount)
      : 0;
    
    return {
      memorySize,
      topicCount,
      searchLatency: 50, // Estimated
      cacheHitRate: Math.min(1, cacheHitRate),
      tokenEfficiency
    };
  }

  clearCache(): void {
    this.cache.clear();
    this.searchHistory = [];
  }
}
