#!/usr/bin/env python3
"""
WZRD.dev SQLite State Layer Interface
Python-based database interface for cross-platform compatibility
"""

import sqlite3
import json
import uuid
import sys
from pathlib import Path
from datetime import datetime
from typing import Optional

# Configuration
DB_DIR = Path(__file__).parent / ".." / "db"
DB_PATH = DB_DIR / "state.db"
INIT_SQL = DB_DIR / "init.sql"

class WzrdDB:
    def __init__(self):
        self.db_path = DB_PATH
        self._ensure_db_exists()
    
    def _ensure_db_exists(self):
        """Initialize database if it doesn't exist"""
        if not self.db_path.exists():
            print(f"Creating WZRD.dev state database at {self.db_path}...")
            self.init_db()
    
    def init_db(self):
        """Initialize database schema"""
        DB_DIR.mkdir(parents=True, exist_ok=True)
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Jobs table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS jobs (
                id TEXT PRIMARY KEY,
                topic TEXT NOT NULL,
                status TEXT NOT NULL,
                sandbox_id TEXT,
                blueprint TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP,
                result TEXT,
                error TEXT,
                CHECK (status IN ('pending', 'running', 'completed', 'failed'))
            )
        """)
        
        # State table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS state (
                key TEXT PRIMARY KEY,
                value TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Skills registry
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS skills_loaded (
                job_id TEXT,
                skill_name TEXT,
                loaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (job_id) REFERENCES jobs(id)
            )
        """)
        
        # Sandbox registry
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS sandboxes (
                id TEXT PRIMARY KEY,
                job_id TEXT,
                project_path TEXT NOT NULL,
                sandbox_type TEXT NOT NULL,
                status TEXT DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (job_id) REFERENCES jobs(id)
            )
        """)
        
        # Create indexes
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_jobs_created ON jobs(created_at)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_skills_job ON skills_loaded(job_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_sandboxes_status ON sandboxes(status)")
        
        # Insert default state
        cursor.execute("""
            INSERT OR IGNORE INTO state (key, value) VALUES (?, ?)
        """, ('framework_version', '1.0.0'))
        cursor.execute("""
            INSERT OR IGNORE INTO state (key, value) VALUES (?, ?)
        """, ('last_startup', datetime.now().isoformat()))
        
        conn.commit()
        conn.close()
        print("Database initialized successfully")
    
    def save_job(self, topic: str, blueprint: str = "default") -> str:
        """Create a new job and return its ID"""
        job_id = str(uuid.uuid4())
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO jobs (id, topic, status, blueprint)
            VALUES (?, ?, ?, ?)
        """, (job_id, topic, 'pending', blueprint))
        conn.commit()
        conn.close()
        
        return job_id
    
    def update_job_status(self, job_id: str, status: str, result: str = "", error: str = ""):
        """Update job status"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        if status in ('completed', 'failed'):
            cursor.execute("""
                UPDATE jobs 
                SET status = ?, completed_at = ?, result = ?, error = ?
                WHERE id = ?
            """, (status, datetime.now().isoformat(), result, error, job_id))
        else:
            cursor.execute("""
                UPDATE jobs 
                SET status = ?, result = ?, error = ?
                WHERE id = ?
            """, (status, result, error, job_id))
        
        conn.commit()
        conn.close()
    
    def link_sandbox(self, job_id: str, sandbox_id: str):
        """Link a sandbox to a job"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE jobs SET sandbox_id = ? WHERE id = ?
        """, (sandbox_id, job_id))
        conn.commit()
        conn.close()
    
    def get_job_status(self, job_id: str) -> Optional[dict]:
        """Get job status as dictionary"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM jobs WHERE id = ?
        """, (job_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return dict(row)
        return None
    
    def list_active_jobs(self) -> list:
        """List all active jobs"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, topic, status, created_at
            FROM jobs 
            WHERE status IN ('pending', 'running')
            ORDER BY created_at DESC
        """)
        
        rows = cursor.fetchall()
        conn.close()
        
        return [dict(row) for row in rows]
    
    def load_skill(self, job_id: str, skill_name: str):
        """Record that a skill was loaded for a job"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO skills_loaded (job_id, skill_name)
            VALUES (?, ?)
        """, (job_id, skill_name))
        conn.commit()
        conn.close()
    
    def get_job_skills(self, job_id: str) -> list:
        """Get all skills loaded for a job"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT skill_name FROM skills_loaded WHERE job_id = ?
        """, (job_id,))
        
        rows = cursor.fetchall()
        conn.close()
        
        return [row[0] for row in rows]
    
    def save_state(self, key: str, value: str):
        """Save a state value"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO state (key, value) VALUES (?, ?)
            ON CONFLICT(key) DO UPDATE 
            SET value = ?, updated_at = ?
        """, (key, value, value, datetime.now().isoformat()))
        conn.commit()
        conn.close()
    
    def get_state(self, key: str) -> Optional[str]:
        """Get a state value"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT value FROM state WHERE key = ?", (key,))
        row = cursor.fetchone()
        conn.close()
        
        return row[0] if row else None
    
    def register_sandbox(self, sandbox_id: str, job_id: str, project_path: str, sandbox_type: str):
        """Register a sandbox"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO sandboxes (id, job_id, project_path, sandbox_type)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET 
                job_id = ?,
                project_path = ?,
                sandbox_type = ?,
                last_activity = ?
        """, (sandbox_id, job_id, project_path, sandbox_type,
              job_id, project_path, sandbox_type, datetime.now().isoformat()))
        conn.commit()
        conn.close()
    
    def list_active_sandboxes(self) -> list:
        """List all active sandboxes"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM sandboxes
            WHERE status = 'active'
            ORDER BY last_activity DESC
        """)
        
        rows = cursor.fetchall()
        conn.close()
        
        return [dict(row) for row in rows]
    
    def cleanup_old_records(self, days: int = 7):
        """Clean up old completed/failed records"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            DELETE FROM jobs 
            WHERE status IN ('completed', 'failed') 
            AND created_at < datetime('now', '-{} days')
        """.format(days))
        
        cursor.execute("""
            DELETE FROM sandboxes 
            WHERE status != 'active' 
            AND created_at < datetime('now', '-{} days')
        """.format(days))
        
        conn.commit()
        conn.close()

# CLI Interface
def main():
    if len(sys.argv) < 2:
        print("""Usage: db.py <command> [args]

Commands:
  init                              - Initialize database
  save-job <topic> [blueprint]      - Create new job
  update-status <job-id> <status> [result] [error]
                                    - Update job status
  link-sandbox <job-id> <sandbox-id>
                                    - Link sandbox to job
  get-status <job-id>               - Get job details
  list-active                       - List active jobs
  load-skill <job-id> <skill-name>  - Load skill for job
  get-skills <job-id>               - Get job skills
  save-state <key> <value>          - Save state value
  get-state <key>                   - Get state value
  register-sandbox <id> <job-id> <path> <type>
                                    - Register sandbox
  list-sandboxes                    - List active sandboxes
  cleanup [days]                    - Cleanup old records
""")
        sys.exit(1)
    
    db = WzrdDB()
    cmd = sys.argv[1]
    
    if cmd == "init":
        print(f"Database ready at {DB_PATH}")
    
    elif cmd == "save-job":
        if len(sys.argv) < 3:
            print("Error: save-job requires topic")
            sys.exit(1)
        topic = sys.argv[2]
        blueprint = sys.argv[3] if len(sys.argv) > 3 else "default"
        job_id = db.save_job(topic, blueprint)
        print(job_id)
    
    elif cmd == "update-status":
        if len(sys.argv) < 4:
            print("Error: update-status requires job-id and status")
            sys.exit(1)
        job_id = sys.argv[2]
        status = sys.argv[3]
        result = sys.argv[4] if len(sys.argv) > 4 else ""
        error = sys.argv[5] if len(sys.argv) > 5 else ""
        db.update_job_status(job_id, status, result, error)
        print(f"Updated job {job_id} to status: {status}")
    
    elif cmd == "link-sandbox":
        if len(sys.argv) < 4:
            print("Error: link-sandbox requires job-id and sandbox-id")
            sys.exit(1)
        db.link_sandbox(sys.argv[2], sys.argv[3])
        print(f"Linked sandbox {sys.argv[3]} to job {sys.argv[2]}")
    
    elif cmd == "get-status":
        if len(sys.argv) < 3:
            print("Error: get-status requires job-id")
            sys.exit(1)
        status = db.get_job_status(sys.argv[2])
        print(json.dumps(status, indent=2) if status else "Job not found")
    
    elif cmd == "list-active":
        jobs = db.list_active_jobs()
        print(json.dumps(jobs, indent=2))
    
    elif cmd == "load-skill":
        if len(sys.argv) < 4:
            print("Error: load-skill requires job-id and skill-name")
            sys.exit(1)
        db.load_skill(sys.argv[2], sys.argv[3])
        print(f"Loaded skill {sys.argv[3]} for job {sys.argv[2]}")
    
    elif cmd == "get-skills":
        if len(sys.argv) < 3:
            print("Error: get-skills requires job-id")
            sys.exit(1)
        skills = db.get_job_skills(sys.argv[2])
        print(json.dumps(skills, indent=2))
    
    elif cmd == "save-state":
        if len(sys.argv) < 4:
            print("Error: save-state requires key and value")
            sys.exit(1)
        db.save_state(sys.argv[2], sys.argv[3])
        print(f"Saved state: {sys.argv[2]} = {sys.argv[3]}")
    
    elif cmd == "get-state":
        if len(sys.argv) < 3:
            print("Error: get-state requires key")
            sys.exit(1)
        value = db.get_state(sys.argv[2])
        print(value if value else "Key not found")
    
    elif cmd == "register-sandbox":
        if len(sys.argv) < 6:
            print("Error: register-sandbox requires id, job-id, path, type")
            sys.exit(1)
        db.register_sandbox(sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5])
        print(f"Registered sandbox {sys.argv[2]}")
    
    elif cmd == "list-sandboxes":
        sandboxes = db.list_active_sandboxes()
        print(json.dumps(sandboxes, indent=2))
    
    elif cmd == "cleanup":
        days = int(sys.argv[2]) if len(sys.argv) > 2 else 7
        db.cleanup_old_records(days)
        print(f"Cleaned up records older than {days} days")
    
    else:
        print(f"Unknown command: {cmd}")
        sys.exit(1)

if __name__ == "__main__":
    main()
