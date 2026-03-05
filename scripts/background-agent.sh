#!/bin/bash
# Background Agent Spawner Script
# Uses wzrd.dev Gateway V2 for true parallel execution

set -e

WZRD_ROOT="/home/mdwzrd/wzrd-redesign"
GATEWAY_URL="http://127.0.0.1:18801/api/gateway/chat"
JOBS_API="http://127.0.0.1:18801/api/jobs"

# Generate a job ID if not provided
generate_job_id() {
    echo "job_$(date +%s)_$(shuf -i 1000-9999 -n 1)"
}

# Show usage
usage() {
    cat <<EOF
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
