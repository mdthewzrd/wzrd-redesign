#!/usr/bin/env python3
"""
Final verification of jCodeMunch integration for cost tracking.
This shows EXACTLY what jCodeMunch finds.
"""

import os
import sys
import json
import tempfile

def verify_jcodemunch_search():
    """Run jCodeMunch and show detailed results."""
    try:
        import jcodemunch_mcp.server
        
        repo_path = os.getcwd()
        storage_path = tempfile.mkdtemp(prefix='jcodemunch_final_')
        repo_name = os.path.basename(repo_path)
        
        print(f"Repository: {repo_path}")
        print(f"Storage: {storage_path}")
        print(f"Repo name: {repo_name}")
        
        # 1. Index the repository
        print("\n" + "="*60)
        print("STEP 1: Indexing repository")
        print("="*60)
        
        index_result = jcodemunch_mcp.server.index_folder(
            path=repo_path,
            storage_path=storage_path,
            use_ai_summaries=False
        )
        
        print(f"Indexing result: {json.dumps(index_result, indent=2)}")
        
        # 2. Test multiple queries related to cost tracking
        queries = [
            "cost tracker",
            "budget tracking", 
            "token usage",
            "daily limit",
            "circuit breaker",
            "trackTask function",
            "cost tracking system"
        ]
        
        all_results = []
        
        for query in queries:
            print(f"\n" + "="*60)
            print(f"QUERY: '{query}'")
            print("="*60)
            
            search_result = jcodemunch_mcp.server.search_text(
                repo=repo_name,
                query=query,
                max_results=5,
                storage_path=storage_path
            )
            
            print(f"Search result type: {type(search_result)}")
            if isinstance(search_result, dict):
                print(f"Keys: {list(search_result.keys())}")
                if "result_count" in search_result:
                    print(f"Result count: {search_result['result_count']}")
                
                if "results" in search_result:
                    results = search_result["results"]
                    print(f"Number of results: {len(results)}")
                    
                    for i, item in enumerate(results):
                        if isinstance(item, dict):
                            print(f"\nResult {i+1}:")
                            for key, value in item.items():
                                if key == "score":
                                    print(f"  {key}: {value:.4f}")
                                elif key == "line" and isinstance(value, str):
                                    print(f"  {key}: {value[:100]}{'...' if len(value) > 100 else ''}")
                                elif isinstance(value, (str, int, float, bool)):
                                elif isinstance(value, (str, int, float, bool)):
                                    print(f"  {key}: {value}")
                            
                            # Store for summary
                            all_results.append({
                                "query": query,
                                "file": item.get("file", ""),
                                "score": item.get("score", 0),
                                "line": item.get("line", "")[:100]
                            })
        
        # 3. Summary
        print("\n" + "="*60)
        print("SUMMARY: Cost Tracking References Found")
        print("="*60)
        
        if all_results:
            # Group by file
            files_summary = {}
            for result in all_results:
                file = result["file"]
                if file not in files_summary:
                    files_summary[file] = []
                files_summary[file].append(result)
            
            print(f"\nFound references in {len(files_summary)} files:")
            for file, results in sorted(files_summary.items(), key=lambda x: -max(r["score"] for r in x[1])):
                best_score = max(r["score"] for r in results)
                query_count = len(set(r["query"] for r in results))
                print(f"\n📄 {file}")
                print(f"   Best score: {best_score:.4f}")
                print(f"   Matched by {query_count} queries")
                for result in results[:3]:  # Show top 3 matches
                    print(f"   - '{result['query']}': {result['score']:.4f}")
        
        else:
            print("No results found for any cost tracking queries.")
        
        # 4. Cleanup
        import shutil
        shutil.rmtree(storage_path, ignore_errors=True)
        
        return len(all_results) > 0
        
    except ImportError as e:
        print(f"ERROR: jCodeMunch not installed: {e}")
        return False
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = verify_jcodemunch_search()
    sys.exit(0 if success else 1)