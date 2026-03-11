/**
 * Unified Memory System with jCodeMunch MCP Integration
 * Combines semantic search (jCodeMunch) with text search (ripgrep)
 */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class UnifiedMemory {
    constructor(config = {}) {
        this.memoryBasePath = config.memoryBasePath || './memory/storage';
        this.jcodeMunchPath = config.jcodeMunchPath || null;
        this.topicRegistryPath = config.topicRegistryPath || './memory/topics';
        this.cacheEnabled = config.cacheEnabled !== false;
        
        // Ensure directories exist
        this._ensureDirectories();
    }
    
    _ensureDirectories() {
        const dirs = [this.memoryBasePath, this.topicRegistryPath];
        dirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }
    
    /**
     * Semantic search using jCodeMunch MCP
     * Returns structured results with relevance scores
     */
    async semanticSearch(query, topic, filter) {
        if (!this.jcodeMunchPath) {
            return [];
        }
        
        const repoPath = process.cwd();
        
        // Python script template for jCodeMunch search
        const pythonScriptTemplate = `import os
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
results = run_jcodemunch_search("\${query}", "\${repo_path}")
print(json.dumps(results))`;
        
        return new Promise((resolve) => {
            try {
                // Replace template variables
                const pythonScript = pythonScriptTemplate
                    .replace(/"\${query}"/g, JSON.stringify(query))
                    .replace(/"\${repo_path}"/g, JSON.stringify(repoPath));
                
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
                        console.log(`[Memory] First 300 chars of script:`, pythonScript.substring(0, 300));
                        resolve([]);
                        return;
                    }
                    
                    if (output.trim()) {
                        try {
                            const results = JSON.parse(output.trim());
                            resolve(results);
                        } catch (e) {
                            console.log(`[Memory] jCodeMunch JSON parse error: ${e.message}`);
                            console.log(`[Memory] Output:`, output.substring(0, 500));
                            resolve([]);
                        }
                    } else {
                        resolve([]);
                    }
                });
            } catch (error) {
                console.log('[Memory] jCodeMunch setup error:', error.message);
                resolve([]);
            }
        });
    }
    
    /**
     * Agentic search using ripgrep/glob
     * Fast text-based search with clear results
     */
    agenticSearch(query, topic, filter, minResults) {
        const results = [];
        const fs = require('fs');
        const path = require('path');
        
        // Simple implementation - in production would use ripgrep
        // This is a fallback when jCodeMunch is not available
        
        return results;
    }
    
    /**
     * Unified search: tries jCodeMunch first, falls back to agentic search
     */
    async search(query, topic = 'general', options = {}) {
        const { useSemantic = true, useAgentic = true, minResults = 3 } = options;
        
        let results = [];
        
        // Try semantic search first if enabled and jCodeMunch available
        if (useSemantic && this.jcodeMunchPath) {
            try {
                results = await this.semanticSearch(query, topic);
            } catch (error) {
                console.log('[Memory] Semantic search failed, falling back:', error.message);
            }
        }
        
        // If not enough results and agentic search enabled, try that
        if (results.length < minResults && useAgentic) {
            const agenticResults = this.agenticSearch(query, topic);
            results = [...results, ...agenticResults];
        }
        
        return results;
    }
}

module.exports = { UnifiedMemory };