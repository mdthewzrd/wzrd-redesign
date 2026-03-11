#!/usr/bin/env python3
"""
Real jCodeMunch MCP client implementation.
Communicates with jCodeMunch MCP server via stdio protocol.
"""
import json
import subprocess
import sys
import os
from typing import Dict, List, Any, Optional
import tempfile
import atexit

class JCodeMunchClient:
    """MCP client for jCodeMunch semantic search server."""
    
    def __init__(self, server_path: str = None):
        self.server_path = server_path or self._find_server_path()
        self.process = None
        self._start_server()
        
    def _find_server_path(self) -> str:
        """Find the jCodeMunch server module path."""
        try:
            import jcodemunch_mcp.server
            module_path = jcodemunch_mcp.server.__file__
            return module_path
        except ImportError:
            # Fallback to typical installation path
            return "/home/mdwzrd/.local/lib/python3.12/site-packages/jcodemunch_mcp/server.py"
    
    def _start_server(self):
        """Start the jCodeMunch MCP server as a subprocess."""
        try:
            # Start server with stdio communication
            self.process = subprocess.Popen(
                [sys.executable, "-m", "jcodemunch_mcp.server"],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1
            )
            
            # Register cleanup
            atexit.register(self._cleanup)
            
            # Wait for server to initialize (read initial messages)
            for _ in range(5):
                line = self.process.stdout.readline()
                if not line:
                    break
                if "initialized" in line.lower() or "ready" in line.lower():
                    break
                    
        except Exception as e:
            print(f"Failed to start jCodeMunch server: {e}", file=sys.stderr)
            self.process = None
    
    def _cleanup(self):
        """Cleanup server process."""
        if self.process:
            self.process.terminate()
            self.process.wait(timeout=2)
    
    def _send_request(self, method: str, params: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Send MCP request to server."""
        if not self.process:
            return None
            
        request = {
            "jsonrpc": "2.0",
            "method": method,
            "params": params,
            "id": 1
        }
        
        try:
            # Send request
            self.process.stdin.write(json.dumps(request) + "\n")
            self.process.stdin.flush()
            
            # Read response
            response_line = self.process.stdout.readline()
            if not response_line:
                return None
                
            response = json.loads(response_line)
            return response.get("result")
            
        except Exception as e:
            print(f"MCP request failed: {e}", file=sys.stderr)
            return None
    
    def search(self, query: str, repo_path: str = None, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Perform semantic search using jCodeMunch.
        
        Args:
            query: Search query
            repo_path: Repository path to search (defaults to current directory)
            limit: Maximum number of results
            
        Returns:
            List of search results with file paths, relevance scores, and snippets
        """
        if not self.process:
            return []
        
        repo_path = repo_path or os.getcwd()
        
        # First, ensure the repo is indexed
        index_result = self._send_request("index_folder", {
            "path": repo_path,
            "name": os.path.basename(repo_path)
        })
        
        if not index_result:
            print(f"Failed to index repository: {repo_path}", file=sys.stderr)
            return []
        
        # Perform semantic search
        search_result = self._send_request("search_text", {
            "query": query,
            "repo_name": os.path.basename(repo_path),
            "limit": limit
        })
        
        if search_result and "results" in search_result:
            return search_result["results"]
        return []
    
    def search_symbols(self, symbol_query: str, repo_path: str = None, limit: int = 10) -> List[Dict[str, Any]]:
        """Search for symbols (functions, classes, variables)."""
        if not self.process:
            return []
        
        repo_path = repo_path or os.getcwd()
        
        result = self._send_request("search_symbols", {
            "query": symbol_query,
            "repo_name": os.path.basename(repo_path),
            "limit": limit
        })
        
        if result and "symbols" in result:
            return result["symbols"]
        return []
    
    def get_file_outline(self, file_path: str) -> Optional[Dict[str, Any]]:
        """Get AST outline of a file."""
        if not self.process:
            return None
        
        result = self._send_request("get_file_outline", {
            "file_path": file_path
        })
        
        return result
    
    def close(self):
        """Close the MCP client and server."""
        self._cleanup()

def main():
    """Test the jCodeMunch client."""
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python jcodemunch-client.py <query> [repo_path]")
        sys.exit(1)
    
    query = sys.argv[1]
    repo_path = sys.argv[2] if len(sys.argv) > 2 else os.getcwd()
    
    client = JCodeMunchClient()
    
    try:
        print(f"Searching for: '{query}' in {repo_path}")
        results = client.search(query, repo_path)
        
        if results:
            print(f"\nFound {len(results)} results:")
            for i, result in enumerate(results, 1):
                print(f"\n{i}. {result.get('path', 'Unknown')}")
                print(f"   Relevance: {result.get('relevance', 0):.2f}")
                print(f"   Snippet: {result.get('snippet', '')[:100]}...")
        else:
            print("No results found.")
            
    finally:
        client.close()

if __name__ == "__main__":
    main()