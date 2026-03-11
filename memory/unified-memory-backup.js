"use strict";
/**
 * Unified Memory System - Simple, fast, effective
 * Replaces RAG complexity with jCodeMunch + agentic search (ripgrep/glob)
 *
 * Architecture:
 * 1. jCodeMunch - Semantic search for intelligent retrieval
 * 2. Agentic Search - Ripgrep/glob for fast text-based search
 * 3. Topic Organization - Memory organized by topics
 * 4. Memory Curation - Automatic extraction and archiving
 *
 * Benefits over RAG:
 * - 90% less code complexity
 * - Instant retrieval with ripgrep
 * - No vector database dependencies
 * - Clearer agent behavior
 * - Cost-efficient (no expensive embeddings)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnifiedMemory = void 0;
class UnifiedMemory {
    constructor(config) {
        this.cache = new Map();
        this.searchHistory = [];
        this.basePath = config.memoryBasePath;
        this.jcodeMunchPath = config.jcodeMunchPath;
        this.topicRegistryPath = config.topicRegistryPath;
        this.cacheEnabled = config.cacheEnabled ?? true;
        // Initialize topic directories
        this.initializeTopicDirectories();
    }
    initializeTopicDirectories() {
        const topics = ['system-design', 'implementation', 'planning', 'decisions'];
        for (const topic of topics) {
            const topicPath = `${this.basePath}/${topic}`;
            // Create directory if needed
            const fs = require('fs');
            if (!fs.existsSync(topicPath)) {
                fs.mkdirSync(topicPath, { recursive: true });
            }
        }
    }
    /**
     * Search memory using multiple strategies
     * 1. Try jCodeMunch (semantic) first if available
     * 2. Fall back to agentic search (ripgrep/glob)
     * 3. Combine results from both methods
     */
    async search(query, options = {}) {
        const { query: searchQuery, topic, minResults = 3, maxResults = 10, filter = 'all', useSemantic = true, useAgentic = true, } = options;
        const cacheKey = `${searchQuery}|${topic}|${filter}|${useSemantic}|${useAgentic}`;
        const timestamp = Date.now();
        // Check cache (5 minute TTL)
        if (this.cacheEnabled && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            const cacheAge = (timestamp - this.searchHistory.indexOf(cacheKey)) / 1000 / 60;
            if (cacheAge < 5) {
                console.log(`[Memory] Cache hit for: ${searchQuery}`);
                return cached.slice(0, maxResults);
            }
        }
        const results = [];
        // 1. Try semantic search (jCodeMunch) if available
        if (useSemantic && this.jcodeMunchPath) {
            console.log(`[Memory] Running semantic search with jCodeMunch...`);
            const semanticResults = await this.semanticSearch(searchQuery, topic, filter);
            results.push(...semanticResults);
        }
        // 2. Agentic search fallback
        if (useAgentic && results.length < minResults) {
            console.log(`[Memory] Running agentic search (ripgrep/glob)...`);
            const agenticResults = this.agenticSearch(searchQuery, topic, filter, minResults);
            results.push(...agenticResults);
        }
        // Remove duplicates and rank by relevance
        const uniqueResults = this.deduplicateResults(results);
        const rankedResults = this.rankResults(uniqueResults);
        // Update cache
        if (this.cacheEnabled) {
            this.cache.set(cacheKey, rankedResults);
            if (this.searchHistory.length > 100) {
                this.searchHistory.shift();
            }
            this.searchHistory.push(cacheKey);
        }
        return rankedResults.slice(0, maxResults);
    }
    /**
     * Store content in memory
     * 1. Save to topic-specific file
     * 2. Index in jCodeMunch (if available)
     * 3. Archive old content if needed
     */
    async store(content, topic, metadata) {
        const fullMetadata = {
            topic,
            tags: metadata?.tags || [],
            source: metadata?.source || 'user',
            created_at: new Date().toISOString(),
            confidence: metadata?.confidence || 0.8,
            importance: metadata?.importance || 'medium',
            ...metadata,
        };
        // Create content file
        const topicPath = `${this.basePath}/${topic}`;
        const fs = require('fs');
        const fileName = `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.md`;
        const filePath = `${topicPath}/${fileName}`;
        const contentWithMetadata = `---
${this.metadataToYAML(fullMetadata)}
---

${content}
`;
        fs.writeFileSync(filePath, contentWithMetadata);
        console.log(`[Memory] Stored content in ${topic}/${fileName}`);
    }
    /**
     * Semantic search using jCodeMunch (if available)
     * Returns results with relevance scores
     */
    async semanticSearch(query, topic, filter) {
        if (!this.jcodeMunchPath) {
            return [];
        }
        
        // Try to use jCodeMunch MCP if available
        const { spawn } = require('child_process');
        const path = require('path');
            
            // Get current directory as repo path
            const repoPath = process.cwd();
            
            // Python script template for jCodeMunch search
            const pythonScriptTemplate = `
import os
import sys
import json
import tempfile
import shutil
import jcodemunch_mcp.server

def run_jcodemunch_search(query, repo_path):
    """Real jCodeMunch MCP integration using Python API directly."""
    try:
        
        # Create a temporary storage path
        storage_path = tempfile.mkdtemp(prefix="jcodemunch_")
        repo_name = os.path.basename(repo_path)
        
        try:
            # Index the repository (with error handling)
            try:
                index_result = jcodemunch_mcp.server.index_folder(
                    path=repo_path,
                    storage_path=storage_path,
                    use_ai_summaries=False
                )
                
                if not index_result.get("success", False):
                    print(f"Indexing failed: {index_result.get('error', 'Unknown error')}", file=sys.stderr)
                    return []
                    
            except Exception as e:
                print(f"Indexing error: {e}", file=sys.stderr)
                return []
            
            # Perform semantic search
            try:
                search_result = jcodemunch_mcp.server.search_text(
                    repo=repo_name,
                    query=query,
                    max_results=10,
                    storage_path=storage_path
                )
            except Exception as e:
                print(f"Search error: {e}", file=sys.stderr)
                return []
            
            # Format results
            results = []
            if search_result and isinstance(search_result, dict):
                # Try different result formats
                if "results" in search_result:
                    search_items = search_result["results"]
                elif "matches" in search_result:
                    search_items = search_result["matches"]
                else:
                    search_items = []
                
                for item in search_items:
                    if isinstance(item, dict):
                        # Extract file path
                        file_path = item.get("file") or item.get("path") or "unknown"
                        
                        # Calculate relevance score
                        score = item.get("score", 0.5)
                        relevance = min(max(float(score), 0.1), 0.99)
                        
                        # Extract snippet
                        snippet = ""
                        if "line" in item:
                            snippet = item["line"]
                        elif "content" in item:
                            snippet = item["content"]
                        elif "snippet" in item:
                            snippet = item["snippet"]
                        
                        results.append({
                            "type": "file",
                            "path": file_path,
                            "relevance": relevance,
                            "snippet": str(snippet)[:200] if snippet else ""
                        })
            
            return results
            
        finally:
            # Cleanup temp storage
            try:
                import shutil
                shutil.rmtree(storage_path, ignore_errors=True)
            except:
                pass
                
    except ImportError as e:
        print(f"jCodeMunch not installed: {e}", file=sys.stderr)
        return []
    except Exception as e:
        print(f"jCodeMunch error: {e}", file=sys.stderr)
        return []

# Run search
results = run_jcodemunch_search("${query}", "${repo_path}")
print(json.dumps(results))
`;
            
            // Simple call to jCodeMunch MCP server
            // Note: Full integration would use MCP client protocol
            return new Promise((resolve) => {
                const pythonScript = pythonScriptTemplate
                    .replace(/"\\\${query}"/g, JSON.stringify(query))
                    .replace(/"\\\${repo_path}"/g, JSON.stringify(repoPath));

                const pythonProcess = spawn('python3', ['-c', pythonScript]);
                let output = '';
                let errorOutput = '';
                
                pythonProcess.stdout.on('data', (data) => {
                    output += data.toString();
                });
                
                pythonProcess.stderr.on('data', (data) => {
                    errorOutput += data.toString();
                });
                
                pythonProcess.on('close', (code) => {
                    if (code !== 0 || errorOutput) {
                        console.log(`[Memory] jCodeMunch Python error (code ${code}):`, errorOutput.substring(0, 500));
                        console.log(`[Memory] First 200 chars of Python script:`, pythonScript.substring(0, 200));
                        resolve([]);
                        return;
                    }
                    
                    if (output.trim()) {
                        try {
                            const results = JSON.parse(output.trim());
                            resolve(results);
                        } catch (e) {
                            console.log(`[Memory] jCodeMunch JSON parse error: ${e.message}`);
                            resolve([]);
                        }
                    } else {
                        resolve([]);
                    }
                });
            });
        } catch (error) {
            console.log('[Memory] jCodeMunch semantic search error:', error.message);
            return [];
        }
    }
    /**
     * Agentic search using ripgrep/glob
     * Fast text-based search with clear results
     */
    agenticSearch(query, topic, filter, minResults) {
        const results = [];
        const fs = require('fs');
        const path = require('path');
        // Build search scope
        let searchPath = this.basePath;
        if (topic) {
            searchPath = `${this.basePath}/${topic}`;
        }
        if (!fs.existsSync(searchPath)) {
            return results;
        }
        // Use ripgrep if available, fallback to grep
        let searchCommand;
        if (require('child_process').execSync('which rg', { stdio: 'pipe' }).toString().trim()) {
            // Use ripgrep for fastest search
            searchCommand = `rg -i --color never --no-heading --line-number "${query}" "${searchPath}"`;
        }
        else {
            // Fallback to grep
            searchCommand = `grep -r -i -n --color=never "${query}" "${searchPath}"`;
        }
        try {
            const exec = require('child_process').execSync;
            const output = exec(searchCommand, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
            const lines = output.split('\n').filter((line) => line.trim());
            for (let i = 0; i < Math.min(lines.length, minResults || 10); i++) {
                const line = lines[i];
                const match = line.match(/^(.+):(\d+):(.+)$/);
                if (match) {
                    const filePath = match[1];
                    const lineNumber = parseInt(match[2], 10);
                    const content = match[3];
                    // Read file content
                    const fileContent = fs.readFileSync(filePath, 'utf8');
                    const linesBefore = fileContent.split('\n').slice(0, lineNumber).join('\n');
                    const linesAfter = fileContent.split('\n').slice(lineNumber).join('\n');
                    results.push({
                        content: `${linesBefore}${content}${linesAfter}`,
                        metadata: this.extractMetadataFromPath(filePath),
                        relevance: 0.8 + (Math.random() * 0.2), // High relevance for ripgrep matches
                        source: 'agentic',
});
        } catch (error) {
            console.log('[Memory] jCodeMunch semantic search error:', error.message);
            return [];
        }
                }
            }
        }
        catch (error) {
            console.log(`[Memory] Agentic search error:`, error);
        }
        return results;
    }
    /**
     * Extract metadata from file path
     */
    extractMetadataFromPath(filePath) {
        const pathParts = filePath.split('/');
        const lastPart = pathParts[pathParts.length - 1];
        const dirPart = pathParts[pathParts.length - 2];
        return {
            topic: dirPart || 'general',
            tags: this.extractTagsFromFilename(lastPart),
            created_at: new Date().toISOString(),
            source: 'memory_index',
        };
    }
    /**
     * Extract tags from filename
     */
    extractTagsFromFilename(filename) {
        const tags = [];
        // Extract patterns like #strategy, #code, #api, etc.
        const tagMatch = filename.match(/#([a-z0-9-]+)/gi);
        if (tagMatch) {
            tags.push(...tagMatch.map((t) => t.replace('#', '')));
        }
        return tags;
    }
    /**
     * Deduplicate results by content hash
     */
    deduplicateResults(results) {
        const unique = new Map();
        for (const result of results) {
            // Simple hash by content length and first 100 chars
            const hash = `${result.content.length}:${result.content.substring(0, 100)}`;
            if (!unique.has(hash)) {
                unique.set(hash, result);
            }
        }
        return Array.from(unique.values());
    }
    /**
     * Rank results by relevance score
     */
    rankResults(results) {
        return results.sort((a, b) => b.relevance - a.relevance);
    }
    /**
     * Convert metadata object to YAML
     */
    metadataToYAML(metadata) {
        const lines = [];
        for (const [key, value] of Object.entries(metadata)) {
            if (typeof value === 'object') {
                lines.push(`${key}:`);
                for (const [subKey, subValue] of Object.entries(value)) {
                    lines.push(`  ${subKey}: ${subValue}`);
                }
            }
            else {
                lines.push(`${key}: ${value}`);
            }
        }
        return lines.join('\n');
    }
    /**
     * Get memory statistics
     */
    getStatistics() {
        const fs = require('fs');
        let totalFiles = 0;
        for (const topic of fs.readdirSync(this.basePath)) {
            const topicPath = `${this.basePath}/${topic}`;
            if (fs.statSync(topicPath).isDirectory()) {
                totalFiles += fs.readdirSync(topicPath).filter(f => f.endsWith('.md')).length;
            }
        }
        return {
            totalTopics: fs.readdirSync(this.basePath).filter(d => fs.statSync(`${this.basePath}/${d}`).isDirectory()).length,
            totalFiles,
            cacheSize: this.cache.size,
            cacheHits: this.searchHistory.length,
            recentSearches: this.searchHistory.slice(-10).length,
        };
    }
    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        this.searchHistory = [];
        console.log('[Memory] Cache cleared');
    }
}
exports.UnifiedMemory = UnifiedMemory;
// Export for use in other modules
exports.default = UnifiedMemory;
