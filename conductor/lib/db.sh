#!/bin/bash
# WZRD.dev SQLite State Layer Interface
# Handles all database operations for job tracking and state management

# Configuration
DB_DIR="${WZRD_DB_DIR:-$(dirname "$0")}"
DB_PATH="${DB_DIR}/state.db"
INIT_SQL="${DB_DIR}/../db/init.sql"

# Initialize database
init_db() {
    if [ ! -f "$DB_PATH" ]; then
        echo "Creating WZRD.dev state database at $DB_PATH..."
        sqlite3 "$DB_PATH" < "$INIT_SQL"
        echo "Database initialized successfully"
    else
        echo "Database already exists at $DB_PATH"
    fi
}

# Save a new job
save_job() {
    local topic="$1"
    local blueprint="${2:-default}"
    local job_id=$(uuidgen 2>/dev/null || date +%s%N | cut -b1-16)
    
    sqlite3 "$DB_PATH" <<EOF
INSERT INTO jobs (id, topic, status, blueprint)
VALUES ('$job_id', '$(escape_sql "$topic")', 'pending', '$(escape_sql "$blueprint")');
SELECT '$job_id';
EOF
}

# Update job status
update_job_status() {
    local job_id="$1"
    local status="$2"
    local result="${3:-}"
    local error="${4:-}"
    
    if [ "$status" = "completed" ] || [ "$status" = "failed" ]; then
        sqlite3 "$DB_PATH" <<EOF
UPDATE jobs 
SET status = '$status', 
    completed_at = CURRENT_TIMESTAMP,
    result = '$(escape_sql "$result")',
    error = '$(escape_sql "$error")'
WHERE id = '$job_id';
EOF
    else
        sqlite3 "$DB_PATH" <<EOF
UPDATE jobs 
SET status = '$status',
    result = '$(escape_sql "$result")',
    error = '$(escape_sql "$error")'
WHERE id = '$job_id';
EOF
    fi
}

# Link sandbox to job
link_sandbox() {
    local job_id="$1"
    local sandbox_id="$2"
    
    sqlite3 "$DB_PATH" <<EOF
UPDATE jobs SET sandbox_id = '$sandbox_id' WHERE id = '$job_id';
EOF
}

# Get job status
get_job_status() {
    local job_id="$1"
    
    sqlite3 "$DB_PATH" <<EOF
SELECT json_object(
    'id', id,
    'topic', topic,
    'status', status,
    'sandbox_id', sandbox_id,
    'blueprint', blueprint,
    'created_at', created_at,
    'completed_at', completed_at,
    'result', result,
    'error', error
) FROM jobs WHERE id = '$job_id';
EOF
}

# List active jobs
list_active_jobs() {
    sqlite3 "$DB_PATH" <<EOF
SELECT json_group_array(json_object(
    'id', id,
    'topic', topic,
    'status', status,
    'created_at', created_at
))
FROM jobs 
WHERE status IN ('pending', 'running')
ORDER BY created_at DESC;
EOF
}

# Load skill for job
load_skill() {
    local job_id="$1"
    local skill_name="$2"
    
    sqlite3 "$DB_PATH" <<EOF
INSERT INTO skills_loaded (job_id, skill_name)
VALUES ('$job_id', '$(escape_sql "$skill_name")');
EOF
}

# Get skills for job
get_job_skills() {
    local job_id="$1"
    
    sqlite3 "$DB_PATH" <<EOF
SELECT json_group_array(skill_name)
FROM skills_loaded
WHERE job_id = '$job_id';
EOF
}

# Save state value
save_state() {
    local key="$1"
    local value="$2"
    
    sqlite3 "$DB_PATH" <<EOF
INSERT INTO state (key, value) VALUES ('$(escape_sql "$key")', '$(escape_sql "$value")')
ON CONFLICT(key) DO UPDATE SET value = '$(escape_sql "$value")', updated_at = CURRENT_TIMESTAMP;
EOF
}

# Get state value
get_state() {
    local key="$1"
    
    sqlite3 "$DB_PATH" <<EOF
SELECT value FROM state WHERE key = '$(escape_sql "$key")';
EOF
}

# Escape SQL strings
escape_sql() {
    echo "$1" | sed "s/'/''/g"
}

# Register sandbox
register_sandbox() {
    local sandbox_id="$1"
    local job_id="$2"
    local project_path="$3"
    local sandbox_type="$4"
    
    sqlite3 "$DB_PATH" <<EOF
INSERT INTO sandboxes (id, job_id, project_path, sandbox_type)
VALUES ('$sandbox_id', '$job_id', '$(escape_sql "$project_path")', '$sandbox_type')
ON CONFLICT(id) DO UPDATE SET 
    job_id = '$job_id',
    project_path = '$(escape_sql "$project_path")',
    sandbox_type = '$sandbox_type',
    last_activity = CURRENT_TIMESTAMP;
EOF
}

# List active sandboxes
list_active_sandboxes() {
    sqlite3 "$DB_PATH" <<EOF
SELECT json_group_array(json_object(
    'id', id,
    'job_id', job_id,
    'project_path', project_path,
    'sandbox_type', sandbox_type,
    'created_at', created_at,
    'last_activity', last_activity
))
FROM sandboxes
WHERE status = 'active'
ORDER BY last_activity DESC;
EOF
}

# Cleanup old records
cleanup_old_records() {
    local days="${1:-7}"
    
    sqlite3 "$DB_PATH" <<EOF
DELETE FROM jobs 
WHERE status IN ('completed', 'failed') 
AND created_at < datetime('now', '-$days days');

DELETE FROM sandboxes 
WHERE status != 'active' 
AND created_at < datetime('now', '-$days days');
EOF
}

# CLI Interface
case "${1:-}" in
    init)
        init_db
        ;;
    save-job)
        save_job "$2" "$3"
        ;;
    update-status)
        update_job_status "$2" "$3" "$4" "$5"
        ;;
    link-sandbox)
        link_sandbox "$2" "$3"
        ;;
    get-status)
        get_job_status "$2"
        ;;
    list-active)
        list_active_jobs
        ;;
    load-skill)
        load_skill "$2" "$3"
        ;;
    get-skills)
        get_job_skills "$2"
        ;;
    save-state)
        save_state "$2" "$3"
        ;;
    get-state)
        get_state "$2"
        ;;
    register-sandbox)
        register_sandbox "$2" "$3" "$4" "$5"
        ;;
    list-sandboxes)
        list_active_sandboxes
        ;;
    cleanup)
        cleanup_old_records "${2:-7}"
        ;;
    *)
        echo "Usage: $0 {init|save-job|update-status|link-sandbox|get-status|list-active|load-skill|get-skills|save-state|get-state|register-sandbox|list-sandboxes|cleanup}"
        echo ""
        echo "Examples:"
        echo "  $0 init                              - Initialize database"
        echo "  $0 save-job 'research topic' blueprint  - Create new job"
        echo "  $0 update-status <job-id> running    - Update job status"
        echo "  $0 get-status <job-id>               - Get job details"
        echo "  $0 list-active                       - List active jobs"
        echo "  $0 save-state key value              - Save state value"
        echo "  $0 get-state key                     - Get state value"
        exit 1
        ;;
esac
