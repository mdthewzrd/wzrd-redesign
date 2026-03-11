#!/usr/bin/env python3
"""
Background Agent Spawner Script
Uses wzrd.dev Gateway V2 for true parallel execution
"""

import json
import subprocess
import time
import random
import sys
import os
from datetime import datetime
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError
import ssl

WZRD_ROOT = "/home/mdwzrd/wzrd-redesign"
GATEWAY_URL = "http://127.0.0.1:18801/api/gateway/chat"
JOBS_API = "http://127.0.0.1:18802/api/jobs"  # Mock API for now

def generate_job_id():
    """Generate a job ID if not provided"""
    timestamp = int(time.time())
    random_num = random.randint(1000, 9999)
    return f"job_{timestamp}_{random_num}"

def usage():
    """Show usage information"""
    print("""
Background Agent Spawner - True Parallel Execution

Usage:
  wzrd bg-spawn [options] --agent <agent> --prompt "<prompt>"

Options:
  --agent <name>         Agent name (raya, ted, renata, sadie, arya-fe, arya-be, chet)
  --prompt "<text>"      Task prompt for the agent
  --topic <topic>        Topic context (default: background-task)
  --model <model>        Model to use (default: based on agent)
  --job-id <id>          Custom job ID (auto-generated if not provided)
  --workdir <path>       Working directory (default: /home/mdwzrd)
  --wait                 Wait for completion and show result
  --list                 List all background jobs
  --status <job-id>      Check status of specific job
  --results <job-id>     Get results of completed job
  --kill <job-id>        Kill running job

Examples:
  wzrd bg-spawn --agent raya --prompt "Research WebSocket best practices"
  wzrd bg-spawn --agent ted --prompt "Review auth system architecture" --job-id arch-review
  wzrd bg-jobs                          # List all jobs
  wzrd bg-status job_123456_7890        # Check job status
  wzrd bg-results job_123456_7890       # Get job results
  wzrd bg-kill job_123456_7890         # Kill running job
    """)

def send_to_gateway(data):
    """Send request to Gateway V2"""
    print("[BG] Sending request to Gateway V2...")
    
    try:
        req = Request(
            GATEWAY_URL,
            data=json.dumps(data).encode('utf-8'),
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        
        with urlopen(req) as response:
            return response.read().decode('utf-8')
    except (URLError, HTTPError) as e:
        print(f"[BG] Error sending request: {e}")
        return None

def get_default_model(agent):
    """Get default model for agent"""
    model_map = {
        'raya': 'glm-4.5-air',
        'sadie': 'glm-4.5-air',
        'chet': 'glm-4.5-air',
        'renata': 'glm-4.5',
        'arya-fe': 'glm-4.5',
        'arya-be': 'glm-4.5',
        'ted': 'glm-4.7'
    }
    return model_map.get(agent, 'deepseek-ai/deepseek-v3.2')

def get_default_workdir(agent):
    """Get default workdir for agent"""
    if agent == 'renata':
        return "/home/mdwzrd/wzrd.dev/projects/edge.dev"
    return "/home/mdwzrd"

def spawn_agent(args):
    """Spawn background agent"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Spawn background agent')
    parser.add_argument('--agent', required=True, help='Agent name')
    parser.add_argument('--prompt', required=True, help='Task prompt')
    parser.add_argument('--topic', default='background-task', help='Topic context')
    parser.add_argument('--model', help='Model to use')
    parser.add_argument('--job-id', help='Custom job ID')
    parser.add_argument('--workdir', help='Working directory')
    parser.add_argument('--wait', action='store_true', help='Wait for completion')
    
    # Parse known args only
    known_args, _ = parser.parse_known_args(args)
    
    # Set defaults
    agent = known_args.agent
    prompt = known_args.prompt
    topic = known_args.topic
    model = known_args.model or get_default_model(agent)
    job_id = known_args.job_id or generate_job_id()
    workdir = known_args.workdir or get_default_workdir(agent)
    wait_for_result = known_args.wait
    
    # Prepare request data
    data = {
        "prompt": prompt,
        "agent": agent,
        "topic": topic,
        "model": model,
        "platform": "cli",
        "background": True,
        "jobId": job_id,
        "workdir": workdir
    }
    
    print(f"[BG] Spawning agent: {agent}")
    print(f"[BG] Job ID: {job_id}")
    print(f"[BG] Topic: {topic}")
    print(f"[BG] Model: {model}")
    print(f"[BG] Workdir: {workdir}")
    
    # Send request
    response = send_to_gateway(data)
    
    if response and '"ok":true' in response:
        print("[BG] ✅ Agent spawned successfully")
        print(f"[BG] Job ID: {job_id}")
        
        if wait_for_result:
            print("[BG] Waiting for completion...")
            wait_for_job(job_id)
        else:
            print("[BG] Job running in background. Use:")
            print(f"  wzrd bg-status {job_id}    # Check status")
            print(f"  wzrd bg-results {job_id}   # Get results")
    else:
        print("[BG] ❌ Failed to spawn agent")
        print(f"Response: {response}")
        sys.exit(1)

def wait_for_job(job_id):
    """Wait for job completion"""
    max_wait = 300  # 5 minutes
    interval = 5
    
    print(f"[BG] Polling job: {job_id}")
    
    for i in range(max_wait // interval):
        try:
            status_url = f"{JOBS_API}/{job_id}/status"
            req = Request(status_url)
            with urlopen(req) as response:
                status_response = response.read().decode('utf-8')
                
                if '"status":"completed"' in status_response:
                    print("[BG] ✅ Job completed")
                    get_job_results(job_id)
                    return True
                elif '"status":"failed"' in status_response:
                    print("[BG] ❌ Job failed")
                    print(status_response)
                    return False
                elif '"status":"running"' in status_response:
                    print(f"[BG] ⏳ Still running... ({i * interval}s)")
                else:
                    print("[BG] ⏳ Pending...")
        except Exception as e:
            print(f"[BG] Error checking status: {e}")
        
        time.sleep(interval)
    
    print("[BG] ⚠️ Timeout waiting for job")
    return False

def get_job_results(job_id):
    """Get job results"""
    print(f"[BG] Fetching results for: {job_id}")
    
    try:
        result_url = f"{JOBS_API}/{job_id}/results"
        req = Request(result_url)
        with urlopen(req) as response:
            result_response = response.read().decode('utf-8')
            
            if result_response:
                print("=== RESULTS ===")
                print(result_response)
                print("================")
                
                # Save to file
                logs_dir = os.path.join(WZRD_ROOT, "logs")
                os.makedirs(logs_dir, exist_ok=True)
                result_file = os.path.join(logs_dir, f"{job_id}-results.md")
                
                with open(result_file, 'w') as f:
                    f.write(result_response)
                
                print(f"[BG] Results saved to: {result_file}")
            else:
                print("[BG] No results found")
    except Exception as e:
        print(f"[BG] Error fetching results: {e}")

def list_jobs():
    """List all jobs"""
    print("[BG] Fetching job list...")
    
    try:
        req = Request(f"{JOBS_API}/list")
        with urlopen(req) as response:
            jobs_response = response.read().decode('utf-8')
            
            if jobs_response:
                print("=== BACKGROUND JOBS ===")
                try:
                    jobs = json.loads(jobs_response)
                    for job in jobs:
                        job_id = job.get('jobId', 'unknown')
                        status = job.get('status', 'unknown')
                        agent = job.get('agent', 'unknown')
                        topic = job.get('topic', 'unknown')
                        prompt_preview = job.get('prompt', '')[:50]
                        print(f"{job_id} [{status}] {agent} - {topic}")
                        print(f"  Prompt: {prompt_preview}...")
                except json.JSONDecodeError:
                    print(jobs_response)
                print("=======================")
            else:
                print("[BG] No jobs found")
    except Exception as e:
        print(f"[BG] Error fetching jobs: {e}")

def check_status(job_id):
    """Check job status"""
    print(f"[BG] Checking status for: {job_id}")
    
    try:
        status_url = f"{JOBS_API}/{job_id}/status"
        req = Request(status_url)
        with urlopen(req) as response:
            status_response = response.read().decode('utf-8')
            
            if status_response:
                print("=== JOB STATUS ===")
                try:
                    job_data = json.loads(status_response)
                    job_id = job_data.get('jobId', 'unknown')
                    agent = job_data.get('agent', 'unknown')
                    status = job_data.get('status', 'unknown')
                    created_at = job_data.get('createdAt', 0)
                    
                    if created_at:
                        created_time = datetime.fromtimestamp(created_at / 1000).strftime('%Y-%m-%d %H:%M:%S')
                    else:
                        created_time = 'N/A'
                    
                    print(f"Job ID: {job_id}")
                    print(f"Agent: {agent}")
                    print(f"Status: {status}")
                    print(f"Created: {created_time}")
                except json.JSONDecodeError:
                    print(status_response)
                print("==================")
            else:
                print("[BG] Job not found")
    except Exception as e:
        print(f"[BG] Error checking status: {e}")

def kill_job(job_id):
    """Kill running job"""
    print(f"[BG] Killing job: {job_id}")
    
    try:
        kill_url = f"{JOBS_API}/{job_id}/kill"
        req = Request(kill_url, method='POST')
        with urlopen(req) as response:
            kill_response = response.read().decode('utf-8')
            
            if '"ok":true' in kill_response:
                print("[BG] ✅ Job killed")
            else:
                print("[BG] ❌ Failed to kill job")
                print(f"Response: {kill_response}")
    except Exception as e:
        print(f"[BG] Error killing job: {e}")

def main():
    """Main function"""
    if len(sys.argv) < 2:
        usage()
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command in ['spawn', 'bg-spawn']:
        spawn_agent(sys.argv[2:])
    elif command in ['list', 'bg-jobs']:
        list_jobs()
    elif command in ['status', 'bg-status']:
        if len(sys.argv) < 3:
            print("Error: job ID required")
            usage()
            sys.exit(1)
        check_status(sys.argv[2])
    elif command in ['results', 'bg-results']:
        if len(sys.argv) < 3:
            print("Error: job ID required")
            usage()
            sys.exit(1)
        get_job_results(sys.argv[2])
    elif command in ['kill', 'bg-kill']:
        if len(sys.argv) < 3:
            print("Error: job ID required")
            usage()
            sys.exit(1)
        kill_job(sys.argv[2])
    elif command in ['help', '--help', '-h']:
        usage()
    else:
        print(f"Unknown command: {command}")
        usage()
        sys.exit(1)

if __name__ == "__main__":
    main()
