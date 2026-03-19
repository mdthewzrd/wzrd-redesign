# WZRD.dev Web UI Master Plan
*Based on comprehensive user feedback - March 15, 2026*

## CURRENT STATE ASSESSMENT
**Problem:** Web UI has superficial React components but lacks real data integration, providing little value to users.

**Root Causes:**
1. Frontend components built but not connected to real backend APIs
2. Mock/hardcoded data everywhere instead of real system data
3. Missing connections to: Gateway V2, SQLite database, file system, memory system
4. Design focused on aesthetics over functionality

## PHASE 1: REAL DATA INTEGRATION (CRITICAL)

### A. Backend API Enhancement
1. **Enhance API Server** (`/home/mdwzrd/wzrd-redesign/interfaces/web/api-server.js`)
   - Add real data endpoints for all systems
   - Connect to SQLite database (topics, tasks, sandboxes)
   - Connect to file system (memory files, worktrees)
   - Connect to Gateway V2 for real-time metrics
   - Connect to Discord bot status

2. **Required API Endpoints:**
   ```
   GET  /api/real/topics           - Real topics from database
   GET  /api/real/worktrees        - Real git worktrees
   GET  /api/real/memory/files     - Real memory file count/structure
   GET  /api/real/sandboxes        - Real sandboxes
   GET  /api/real/tasks            - Real tasks with assignment
   GET  /api/real/agents           - Agent status/lifecycle
   GET  /api/real/heartbeats       - Cronjob/heartbeat status
   GET  /api/real/blueprints       - Active blueprints
   GET  /api/real/skills           - Toolshed skills
   GET  /api/real/projects         - All projects (WZRD.dev, Dilution Agent, Edge.dev)
   GET  /api/real/gateway/metrics  - Real Gateway V2 metrics
   GET  /api/real/discord/status   - Discord bot real status
   GET  /api/real/nvidia/status    - NVIDIA API real status
   ```

### B. Frontend Data Layer
1. **Create data fetching services** that replace mock data
2. **Implement real-time updates** for dynamic data
3. **Add error handling** for when APIs are unavailable
4. **Create data transformation layer** for UI presentation

## PHASE 2: PAGE-BY-PAGE OVERHAUL

### 1. Topbar (Global Navigation)
**Issues:** Uptime wrong, icons too small, missing project dropdown
**Solutions:**
- Remove uptime display (user request)
- Increase icon size for better visibility
- Add "View" dropdown with dynamic project list:
  - WZRD.dev (default)
  - Dilution Agent
  - Edge.dev
  - Auto-populate from projects database
- Fix "dark glitch" (CSS/theme issue)

### 2. Chat Page
**Issues:** No topics, chat not functional, no file upload
**Solutions:**
- Load real topics from database
- Implement real chat functionality with Gateway V2
- Add file/photo upload capability
- Change user message background to more yellow
- Show active conversations with real data

### 3. Overview Page (Complete Rethink)
**Issues:** "Pointless for users", shows no data, padding wrong
**Redesign Concept:** "System Dashboard"
- **Left Panel:** Real-time system health
  - Gateway V2 status (real)
  - NVIDIA API status (real) 
  - Discord bot status (real)
  - Database connectivity
- **Center Panel:** Active work
  - Current topic/project
  - Active agents/tasks
  - Recent messages/activity
- **Right Panel:** Quick actions
  - Switch project
  - Create new topic
  - Start new agent
  - View logs
- **Bottom:** System metrics
  - CPU/Memory usage
  - Active connections
  - Message throughput

### 4. Activity Page
**Issues:** Boring lists, should show active/recent side-by-side
**Redesign:**
- **Left:** Active Work (real-time)
  - Current agents working
  - Live task progress
  - Active blueprints
- **Right:** Recent Activity (historical)
  - Completed tasks
  - System events
  - User interactions
- **Bottom:** Usage & Server Stats
  - API call statistics
  - Gateway metrics
  - Resource utilization
- Integrate sync data from separate sync page

### 5. Topics Page
**Issues:** No real data, should be project-organized
**Redesign:**
- Group topics by project (WZRD.dev, Dilution Agent, Edge.dev)
- Show topic metadata (created, last active, file count)
- Quick actions per topic (open, archive, delete)
- Search/filter by project, date, status
- Visual indicators for active/inactive topics

### 6. Tasks Page
**Issues:** "Big components don't show tasks by who", lacking value
**Redesign:**
- **Kanban Board View:**
  - To Do | In Progress | Done
  - Tasks assigned to agents/users
  - Drag-and-drop between columns
- **List View Alternative:**
  - Filter by assignee, project, priority
  - Show task dependencies
  - Time tracking/completion estimates
- **Real Data:** Pull from task database

### 7. MCP Server Page
**Issues:** "Weak and boring"
**Enhancement:**
- Show active MCP connections
- Protocol version compatibility
- Message throughput graphs
- Connection health monitoring
- Server configuration settings

### 8. Instances Page
**Issues:** No real data
**Redesign:** "Agent Lifecycle Dashboard"
- **Active Agents:** Real-time status, uptime, load
- **Agent Pool:** Available/capacity visualization
- **Lifecycle History:** Agent creation → work → completion
- **Performance Metrics:** Response times, success rates
- **Management:** Start/stop/restart agents

### 9. Recommendations Page
**Issues:** List form not engaging
**Redesign:** "AI Insights Dashboard"
- **Priority Recommendations:** Card-based with actions
- **System Optimizations:** Visual suggestions with impact scores
- **Learning Patterns:** What the system has learned
- **Actionable Insights:** One-click implementation

### 10. Files Page
**Issues:** "All over the place", doesn't connect to folders, shows only 8 files
**Redesign:** "Unified Memory Explorer"
- **Tree View:** Actual folder structure of `/home/mdwzrd/wzrd-redesign/`
- **File Count:** Real count of memory files
- **Search:** Full-text search across memory
- **Metadata:** File types, sizes, last modified
- **Quick Actions:** Open, edit, delete files

### 11. Skills Page
**Issues:** Doesn't load, should show toolshed
**Redesign:** "Skills & Toolshed Gallery"
- **Skill Cards:** Each skill with description, usage, dependencies
- **Categories:** Group by function (debugging, coding, research, etc.)
- **Status:** Loaded/available metrics
- **Usage Stats:** Most used skills, success rates
- **Management:** Enable/disable skills

### 12. Gold Standard Page → WZRD.dev Framework Page
**Issues:** Should show ecosystem, not just gold standard
**Redesign:** "Framework Architecture"
- **System Diagram:** Visual of all components
- **Component Status:** Each Stripe Minion with health
- **Data Flow:** How messages travel through system
- **Integration Points:** APIs, databases, external services
- **Documentation:** Framework principles, usage guidelines

### 13. Blueprints Page
**Issues:** Not loading, should update live
**Redesign:** "Blueprint Engine Dashboard"
- **Active Blueprints:** Real-time execution status
- **Execution History:** Past blueprint runs
- **Performance Metrics:** Success/failure rates
- **Template Library:** Available blueprints
- **Create New:** Blueprint builder interface

### 14. Config Page
**Issues:** Doesn't load, needs full functionality
**Redesign:** "System Configuration Center"
- **Sections:**
  - General Settings (theme, layout)
  - Gateway Configuration
  - Discord Integration
  - NVIDIA API Settings
  - Database Configuration
  - Security Settings
- **Live Preview:** Changes preview before saving
- **Import/Export:** Configuration profiles
- **Validation:** Settings validation with error highlighting

### 15. Logs Page
**Issues:** Failed to load
**Redesign:** "Centralized Log Viewer"
- **Real-time Log Streaming:** Live system logs
- **Filter by:** Component, severity, time range
- **Search:** Full-text log search
- **Export:** Download logs for analysis
- **Correlation:** Link related log entries

### 16. Sync Page
**Issues:** Could consolidate with activity
**Decision:** Keep separate but enhance
- **Sync Status:** File synchronization across systems
- **Conflict Resolution:** Visual conflict display
- **Sync History:** Timeline of sync operations
- **Manual Controls:** Force sync, resolve conflicts

### 17. Sandbox Page
**Issues:** Shows 0 sandboxes, should be in WZRD section
**Redesign:** "Sandbox Management"
- **Move to:** WZRD section (from standalone)
- **Real Sandboxes:** List actual sandboxes from database
- **Sandbox Details:** Type, status, resources
- **Management:** Create, start, stop, delete sandboxes
- **Quick Launch:** Start new sandbox from template

## PHASE 3: MISSING FEATURES IMPLEMENTATION

### 1. Heartbeats & Cronjobs Dashboard
- **Visual Schedule:** Cronjob timeline
- **Execution History:** Past runs with success/failure
- **Real-time Monitoring:** Live heartbeat status
- **Configuration:** Edit cron schedules
- **Alerts:** Failed job notifications

### 2. Agent Automation Lifecycle
- **Agent Creation:** Visualize agent spawning
- **Work Assignment:** See tasks assigned to agents
- **Execution Flow:** Step-by-step agent work
- **Completion Tracking:** Agent results and outputs
- **Resource Usage:** CPU/memory per agent

### 3. Projects Page (New)
- **Project Gallery:** All active projects
- **Project Switching:** Quick context change
- **Project Metrics:** Activity, resources, team
- **Cross-Project:** Dependencies and relationships
- **Management:** Create, archive, delete projects

### 4. File Upload & Messaging
- **Drag & Drop:** File upload to chat
- **Media Preview:** Image/video thumbnails
- **File Management:** Upload history, storage usage
- **Real Chat:** WebSocket-based messaging
- **Message History:** Persistent conversation storage

## PHASE 4: DESIGN & UX OVERHAUL

### 1. Component Library Enhancement
- Replace boring lists with interactive cards, grids, visualizations
- Implement consistent design system across all pages
- Add animations and transitions for better UX
- Ensure mobile responsiveness

### 2. Real-time Updates
- WebSocket connections for live data
- Auto-refresh for dynamic content
- Visual indicators for updates (badges, notifications)

### 3. Error Handling & User Feedback
- Graceful degradation when APIs unavailable
- Clear error messages with recovery options
- Loading states with progress indicators
- Success/confirmation feedback

### 4. Navigation & Information Architecture
- Consistent sidebar/navigation
- Breadcrumb trails for deep navigation
- Quick access to frequent actions
- Keyboard shortcuts

## TECHNICAL IMPLEMENTATION PLAN

### Week 1: Foundation & Core APIs
1. Enhance API server with real data endpoints
2. Create data services layer in frontend
3. Fix Topbar and global navigation
4. Implement project switching

### Week 2: Critical Pages (Chat, Overview, Activity)
1. Chat page with real topics and messaging
2. Overview page complete redesign
3. Activity page with real data visualization
4. File upload functionality

### Week 3: Data-Intensive Pages (Topics, Tasks, Files)
1. Topics page with project organization
2. Tasks page Kanban board
3. Files page with real folder structure
4. Skills page with toolshed integration

### Week 4: System Pages (Config, Logs, Blueprints)
1. Config page fully functional
2. Logs page with real-time streaming
3. Blueprints live dashboard
4. Agent lifecycle visualization

### Week 5: Missing Features & Polish
1. Heartbeats/cronjobs dashboard
2. Projects page implementation
3. Design consistency pass
4. Performance optimization

### Week 6: Testing & Validation
1. End-to-end testing of all functionality
2. Real data validation across all pages
3. User experience testing
4. Performance benchmarking

## VALIDATION CRITERIA
**Each page must:**
✅ Load real data (no mock/hardcoded values)
✅ Provide clear value to users
✅ Have functional interactive elements
✅ Display correctly (no layout bugs)
✅ Update dynamically where appropriate
✅ Handle errors gracefully
✅ Follow consistent design system

**System must:**
✅ Connect to all backend systems (Gateway V2, SQLite, file system)
✅ Support real-time updates
✅ Allow configuration changes
✅ Provide comprehensive system visibility
✅ Enable user productivity

## IMMEDIATE NEXT STEPS
1. **Audit current API server** - identify missing endpoints
2. **Survey real data sources** - what exists vs what's mocked
3. **Create component library** - standardize UI patterns
4. **Prioritize pages** - start with highest user value

## SUCCESS METRICS
- **Data Accuracy:** 100% real data on all pages
- **Page Load Time:** < 2 seconds for initial load
- **User Engagement:** All interactive elements functional
- **System Coverage:** All WZRD.dev components represented
- **User Satisfaction:** Pages provide clear value and utility

---

*This plan will transform the web UI from a superficial React demo into a powerful system management dashboard that provides real value to users.*