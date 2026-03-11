#!/usr/bin/env python3
"""
Real API Benchmark using OpenCode server
Tests actual model responses with real latency and quality scoring
"""

import requests
import time
import json
import os
from datetime import datetime

SERVER_URL = "http://localhost:4096"

# Test prompts
TEST_CASES = [
    {
        "name": "simple_math",
        "prompt": "What is 2+2? Answer with just the number.",
        "expected": ["4"],
        "category": "basic"
    },
    {
        "name": "code_function",
        "prompt": "Write a Python function to reverse a string. Return only the code.",
        "expected": ["def", "reverse", "return"],
        "category": "coding"
    },
    {
        "name": "explain_concept",
        "prompt": "Explain what an API is in exactly 2 sentences.",
        "expected": ["API", "application", "interface"],
        "category": "explanation"
    }
]

MODELS = [
    {"name": "GLM-4.7", "id": "nvidia/z-ai/glm4.7"},
    {"name": "DeepSeek-V3.2", "id": "nvidia/deepseek-ai/deepseek-v3.2"},
    {"name": "Kimi-K2.5", "id": "nvidia/moonshotai/kimi-k2.5"}
]

def send_prompt(model_id: str, prompt: str) -> dict:
    """Send prompt to opencode server and measure response"""
    start_time = time.time()
    
    try:
        # Create a new session
        session_resp = requests.post(
            f"{SERVER_URL}/tui/command",
            json={"command": f"opencode run --model {model_id} '{prompt}'"},
            timeout=30
        )
        
        end_time = time.time()
        latency_ms = (end_time - start_time) * 1000
        
        if session_resp.status_code == 200:
            data = session_resp.json()
            return {
                "success": True,
                "output": data.get("output", ""),
                "latency_ms": round(latency_ms, 2),
                "status_code": session_resp.status_code
            }
        else:
            return {
                "success": False,
                "output": "",
                "latency_ms": round(latency_ms, 2),
                "error": f"HTTP {session_resp.status_code}",
                "status_code": session_resp.status_code
            }
            
    except requests.Timeout:
        return {
            "success": False,
            "output": "",
            "latency_ms": 30000,
            "error": "Timeout after 30s"
        }
    except Exception as e:
        return {
            "success": False,
            "output": "",
            "latency_ms": 0,
            "error": str(e)
        }

def calculate_quality(output: str, expected: list) -> float:
    """Score quality based on keyword matches"""
    if not output:
        return 0.0
    
    output_lower = output.lower()
    matches = sum(1 for kw in expected if kw.lower() in output_lower)
    score = (matches / len(expected)) * 100
    
    # Bonus points
    if len(output) > 50:
        score += 5
    if "```" in output:
        score += 10
    
    return min(100, score)

def run_benchmark():
    """Run full benchmark"""
    print("🚀 REAL MODEL BENCHMARK (API Mode)")
    print("=" * 80)
    print(f"Server: {SERVER_URL}")
    print(f"Timestamp: {datetime.now().isoformat()}")
    print("=" * 80)
    print()
    
    results = {
        "timestamp": datetime.now().isoformat(),
        "models": [],
        "summary": {}
    }
    
    for model in MODELS:
        print(f"\n{'='*80}")
        print(f"Testing: {model['name']} ({model['id']})")
        print(f"{'='*80}")
        
        model_results = {
            "name": model['name'],
            "model_id": model['id'],
            "tests": [],
            "avg_latency_ms": 0,
            "avg_quality": 0,
            "success_rate": 0
        }
        
        latencies = []
        qualities = []
        successes = 0
        
        for test in TEST_CASES:
            print(f"\n  Test: {test['name']}")
            print(f"  Prompt: {test['prompt'][:60]}...")
            
            result = send_prompt(model['id'], test['prompt'])
            quality = calculate_quality(result['output'], test['expected'])
            
            test_result = {
                "test_name": test['name'],
                "success": result['success'],
                "latency_ms": result['latency_ms'],
                "quality_score": round(quality, 1),
                "output_preview": result['output'][:150] + "..." if len(result['output']) > 150 else result['output']
            }
            
            if 'error' in result:
                test_result['error'] = result['error']
            
            model_results['tests'].append(test_result)
            
            if result['success']:
                successes += 1
                latencies.append(result['latency_ms'])
                qualities.append(quality)
            
            print(f"    Status: {'✅ SUCCESS' if result['success'] else '❌ FAILED'}")
            print(f"    Latency: {result['latency_ms']:.0f}ms")
            print(f"    Quality: {quality:.1f}/100")
            
            time.sleep(0.5)
        
        # Calculate averages
        if latencies:
            model_results['avg_latency_ms'] = round(sum(latencies) / len(latencies), 2)
            model_results['avg_quality'] = round(sum(qualities) / len(qualities), 1)
        
        model_results['success_rate'] = (successes / len(TEST_CASES)) * 100
        
        print(f"\n  Summary:")
        print(f"    Success Rate: {model_results['success_rate']:.0f}%")
        print(f"    Avg Latency: {model_results['avg_latency_ms']:.0f}ms")
        print(f"    Avg Quality: {model_results['avg_quality']:.1f}/100")
        
        results['models'].append(model_results)
    
    # Print comparison table
    print(f"\n{'='*80}")
    print("BENCHMARK RESULTS")
    print(f"{'='*80}")
    print(f"\n{'Model':<20} {'Latency':<12} {'Quality':<12} {'Success':<10}")
    print("-" * 80)
    
    for model in results['models']:
        print(f"{model['name']:<20} "
              f"{model['avg_latency_ms']:<12.0f} "
              f"{model['avg_quality']:<12.1f} "
              f"{model['success_rate']:<10.0f}")
    
    # Compare to Claude
    print(f"\n{'='*80}")
    print("COMPARISON TO CLAUDE CODE (1800ms, 9.1 quality)")
    print(f"{'='*80}")
    
    for model in results['models']:
        if model['avg_latency_ms'] > 0:
            speedup = 1800 / model['avg_latency_ms']
            quality_gap = 9.1 - model['avg_quality']
            
            print(f"\n{model['name']}:")
            print(f"  {speedup:.1f}x faster than Claude")
            print(f"  {quality_gap:.1f} points below Claude quality")
    
    # Save results
    output_dir = "/home/mdwzrd/wzrd-validation-logs"
    os.makedirs(output_dir, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    output_file = f"{output_dir}/api-benchmark-{timestamp}.json"
    
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n✅ Results saved: {output_file}")
    
    return results

if __name__ == "__main__":
    print("Starting real API benchmark...")
    print("Make sure opencode server is running on port 4096")
    print()
    
    results = run_benchmark()
    
    print("\n" + "="*80)
    print("BENCHMARK COMPLETE")
    print("="*80)
