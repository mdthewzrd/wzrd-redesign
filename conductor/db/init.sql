-- WZRD.dev SQLite State Layer
-- Initialize database schema for job tracking and state management

-- Jobs table: Tracks all work through the system
CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    topic TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    sandbox_id TEXT,
    blueprint TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    result TEXT,
    error TEXT
);

-- State table: Persistent memory for agents
CREATE TABLE IF NOT EXISTS state (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skills registry: What's loaded where
CREATE TABLE IF NOT EXISTS skills_loaded (
    job_id TEXT,
    skill_name TEXT,
    loaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id)
);

-- Sandbox registry: Active sandboxes
CREATE TABLE IF NOT EXISTS sandboxes (
    id TEXT PRIMARY KEY,
    job_id TEXT,
    project_path TEXT NOT NULL,
    sandbox_type TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created ON jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_skills_job ON skills_loaded(job_id);
CREATE INDEX IF NOT EXISTS idx_sandboxes_status ON sandboxes(status);

-- Insert default state values
INSERT OR IGNORE INTO state (key, value) VALUES ('framework_version', '1.0.0');
INSERT OR IGNORE INTO state (key, value) VALUES ('last_startup', datetime('now'));
