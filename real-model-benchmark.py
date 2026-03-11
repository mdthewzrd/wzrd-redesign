#!/usr/bin/env python3
"""
Real Model Benchmark - Actually tests models and measures results
Tests: GLM-4.7, DeepSeek V3.2, Kimi K2.5 with real API calls
"""

import subprocess
import time
import json
import os
from datetime import datetime

# Test configuration
TEST_PROMPTS = [
    {
        "name": "fibonacci",
        "prompt": "Write a Python function to calculate the fibonacci sequence. Return only the code, no explanation.",
        "expected_keywords": ["def", "fibonacci", "return"],
        "max_tokens": 200
    },
    {
        "name": "explain",
        "prompt": "Explain what a REST API is in exactly 2 sentences. Be concise.",
        "expected_keywords": ["API", "HTTP", "client", "server"],
        "max_tokens": 150
    },
    {
        "name": "debug",
        "prompt": "Find the bug in this code: def add(a, b): return a - b. Just say what the bug is in 1 sentence.",
        "expected_keywords": ["subtraction", "minus", "addition", "plus", "-", "+"],
        "max_tokens": 100
    }
]

# Models to test
MODELS = [
    {"name": "GLM-4.7", "model_id": "nvidia/z-ai/glm4.7", "provider": "NVIDIA"},
    {"name": "DeepSeek-V3.2", "model_id": "nvidia/deepseek-ai/deepseek-v3.2", "provider": "NVIDIA"},
    {"name": "Kimi-K2.5", "model_id": "nvidia/moonshotai/kimi-k2.5", "provider": "NVIDIA"},
]

def run_opencode_command(model_id: str, prompt: str, max_tokens: int) -> dict:
    """Run opencode command and capture results"""
    start_time = time.time()
    
    try:
        # Build command
        cmd = [
            "opencode", "run",
            "--model", model_id,
            "--max-tokens", str(max_tokens),
            "--temperature", "0.7",
            prompt
        ]
        
        # Run with timeout
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=30
        )
        
        end_time = time.time()
        latency_ms = (end_time - start_time) * 1000
        
        success = result.returncode == 0
        output = result.stdout if success else result.stderr
        
        return {
            "success": success,
            "output": output.strip(),
            "latency_ms": round(latency_ms, 2),
            "returncode": result.returncode
        }
        
    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "output": "",
            "latency_ms": 30000,
            "returncode": -1,
            "error": "Timeout after 30s"
        }
    except Exception as e:
        return {
            "success": False,
            "output": "",
            "latency_ms": 0,
            "returncode": -2,
            "error": str(e)
        }

def calculate_quality_score(output: str, expected_keywords: list) -> float:
    """Calculate quality score based on keyword matches"""
    if not output:
        return 0.0
    
    output_lower = output.lower()
    matches = sum(1 for kw in expected_keywords if kw.lower() in output_lower)
    
    # Base score from keyword matching
    score = (matches / len(expected_keywords)) * 100
    
    # Bonus for code blocks in coding tasks
    if "```" in output:
        score += 10
    
    # Bonus for reasonable length (not too short, not too long)
    if 50 < len(output) < 1000:
        score += 5
    
    return min(100, score)

def estimate_tokens(text: str) -> int:
    """Rough token estimation"""
    if not text:
        return 0
    return len(text) // 4

def run_benchmark():
    """Run full benchmark suite"""
    print("🚀 REAL MODEL BENCHMARK")
    print("=" * 80)
    print(f"Timestamp: {datetime.now().isoformat()}")
    print(f"Models: {len(MODELS)}")
    print(f"Tests per model: {len(TEST_PROMPTS)}")
    print("=" * 80)
    print()
    
    results = {
        "timestamp": datetime.now().isoformat(),
        "models_tested": [],
        "overall": {}
    }
    
    for model in MODELS:
        print(f"\n{'='*80}")
        print(f"Testing Model: {model['name']} ({model['model_id']})")
        print(f"Provider: {model['provider']}")
        print(f"{'='*80}")
        
        model_results = {
            "name": model['name'],
            "model_id": model['model_id'],
            "provider": model['provider'],
            "tests": [],
            "success_count": 0,
            "avg_latency_ms": 0,
            "avg_quality_score": 0,
            "avg_tokens": 0
        }
        
        latencies = []
        qualities = []
        tokens_list = []
        
        for test in TEST_PROMPTS:
            print(f"\n  Test: {test['name']}")
            print(f"  Prompt: {test['prompt'][:60]}...")
            
            result = run_opencode_command(
                model['model_id'],
                test['prompt'],
                test['max_tokens']
            )
            
            quality_score = calculate_quality_score(result['output'], test['expected_keywords'])
            token_estimate = estimate_tokens(result['output'])
            
            test_result = {
                "test_name": test['name'],
                "success": result['success'],
                "latency_ms": result['latency_ms'],
                "quality_score": round(quality_score, 1),
                "tokens": token_estimate,
                "output_preview": result['output'][:200] + "..." if len(result['output']) > 200 else result['output']
            }
            
            if 'error' in result:
                test_result['error'] = result['error']
            
            model_results['tests'].append(test_result)
            
            if result['success']:
                model_results['success_count'] += 1
                latencies.append(result['latency_ms'])
                qualities.append(quality_score)
                tokens_list.append(token_estimate)
            
            print(f"    Status: {'✅ SUCCESS' if result['success'] else '❌ FAILED'}")
            print(f"    Latency: {result['latency_ms']:.0f}ms")
            print(f"    Quality: {quality_score:.1f}/100")
            print(f"    Tokens: ~{token_estimate}")
            
            # Small delay between calls
            time.sleep(0.5)
        
        # Calculate averages
        if latencies:
            model_results['avg_latency_ms'] = round(sum(latencies) / len(latencies), 2)
            model_results['avg_quality_score'] = round(sum(qualities) / len(qualities), 1)
            model_results['avg_tokens'] = round(sum(tokens_list) / len(tokens_list))
        
        model_results['success_rate'] = (model_results['success_count'] / len(TEST_PROMPTS)) * 100
        
        print(f"\n  Summary for {model['name']}:")
        print(f"    Success Rate: {model_results['success_rate']:.0f}%")
        print(f"    Avg Latency: {model_results['avg_latency_ms']:.0f}ms")
        print(f"    Avg Quality: {model_results['avg_quality_score']:.1f}/100")
        print(f"    Avg Tokens: {model_results['avg_tokens']}")
        
        results['models_tested'].append(model_results)
    
    # Overall summary
    print(f"\n{'='*80}")
    print("OVERALL SUMMARY")
    print(f"{'='*80}")
    
    print(f"\n{'Model':<20} {'Latency':<12} {'Quality':<12} {'Success':<10} {'Tokens'}")
    print("-" * 80)
    
    for model_result in results['models_tested']:
        print(f"{model_result['name']:<20} "
              f"{model_result['avg_latency_ms']:<12.0f} "
              f"{model_result['avg_quality_score']:<12.1f} "
              f"{model_result['success_rate']:<10.0f} "
              f"{model_result['avg_tokens']}")
    
    # Compare to Claude Code baseline
    print(f"\n{'='*80}")
    print("COMPARISON TO CLAUDE CODE BASELINE")
    print(f"{'='*80}")
    print("Claude Code Baseline: 1800ms, 9.1 quality")
    print()
    
    for model_result in results['models_tested']:
        if model_result['avg_latency_ms'] > 0:
            speedup = 1800 / model_result['avg_latency_ms']
            quality_diff = model_result['avg_quality_score'] - 9.1
            
            print(f"{model_result['name']}:")
            print(f"  Speed: {speedup:.1f}x {'faster' if speedup > 1 else 'slower'} than Claude")
            print(f"  Quality: {quality_diff:+.1f} vs Claude baseline")
    
    # Save results
    output_dir = "/home/mdwzrd/wzrd-validation-logs"
    os.makedirs(output_dir, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    output_file = f"{output_dir}/real-benchmark-{timestamp}.json"
    
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n✅ Results saved to: {output_file}")
    
    return results

if __name__ == "__main__":
    print("Starting real model benchmark...")
    print("This will take ~2-3 minutes to test all models")
    print()
    
    results = run_benchmark()
    
    print("\n" + "="*80)
    print("BENCHMARK COMPLETE")
    print("="*80)
