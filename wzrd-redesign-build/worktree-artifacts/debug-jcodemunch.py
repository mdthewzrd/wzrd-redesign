#!/usr/bin/env python3
"""
Debug jCodeMunch template issue
"""

import os
import sys
import json
import tempfile

def debug_template():
    # This is what the template looks like after JS replacement
    query = "cost tracker"
    repo_path = os.getcwd()
    
    print(f"Query: {repr(query)}")
    print(f"Repo path: {repr(repo_path)}")
    print()
    
    # This should be what gets generated
    python_code = '''
import os
import sys
import json
import tempfile

def run_jcodemunch_search(query, repo_path):
    """Real jCodeMunch MCP integration using Python API directly."""
    try:
        # Import jCodeMunch
        import jcodemunch_mcp.server
        
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
results = run_jcodemunch_search("cost tracker", "/home/mdwzrd/wzrd-redesign/.worktrees/opencode-plugin-test")
print(json.dumps(results))
'''
    
    print("Generated Python code (first 1000 chars):")
    print(python_code[:1000])
    print("...")
    
    # Now test it
    print("\n" + "="*60)
    print("Testing the generated code...")
    print("="*60)
    
    exec_result = {}
    try:
        exec(python_code, {}, exec_result)
    except Exception as e:
        print(f"Error executing generated code: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_template()