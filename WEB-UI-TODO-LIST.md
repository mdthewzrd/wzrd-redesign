# WZRD.dev Web UI To-Do List
*Complete implementation plan based on user feedback*

## PRIORITY 1: REAL DATA INTEGRATION (WEEK 1)

### 1.1 Enhance API Server (Critical)
- [ ] **Audit current API endpoints** - identify what's mocked vs real
- [ ] **Add SQLite database connection** - topics, tasks, sandboxes
- [ ] **Add file system scanning** - real memory files, worktrees
- [ ] **Connect to Gateway V2 APIs** - real metrics, agent status
- [ ] **Add Discord bot status endpoint** - real connection status
- [ ] **Fix NVIDIA API status endpoint** - show real status

### 1.2 Required New API Endpoints
- [ ] `GET /api/real/topics` - Real topics from database
- [ ] `GET /api/real/worktrees` - Git worktrees from file system
- [ ] `GET /api/real/memory/files` - Memory file count/structure
- [ ] `GET /api/real/sandboxes` - Sandboxes from database
- [ ] `GET /api/real/tasks` - Tasks with assignee information
- [ ] `GET /api/real/agents` - Agent lifecycle status
- [ ] `GET /api/real/heartbeats` - Cronjob/heartbeat status
- [ ] `GET /api/real/blueprints` - Active blueprints
- [ ] `GET /api/real/skills` - Toolshed skills inventory
- [ ] `GET /api/real/projects` - All projects (dynamic list)
- [ ] `GET /api/real/gateway/metrics` - Gateway V2 real metrics
- [ ] `GET /api/real/nvidia/status` - NVIDIA API real status

### 1.3 Frontend Data Layer
- [ ] **Create data service layer** - replace all mock data calls
- [ ] **Implement real-time updates** - WebSocket for live data
- [ ] **Add error handling** - graceful degradation when APIs fail
- [ ] **Create data transformers** - format data for UI presentation

## PRIORITY 2: TOPBAR & GLOBAL FIXES

### 2.1 Topbar Enhancements
- [ ] **Remove uptime display** (user request)
- [ ] **Increase icon size** - icons next to dark mode too small
- [ ] **Add "View" dropdown** with dynamic project list:
  - [ ] WZRD.dev (default)
  - [ ] Dilution Agent
  - [ ] Edge.dev
  - [ ] Auto-populate from projects API
- [ ] **Fix "dark glitch"** - CSS/theme issue affecting multiple pages

### 2.2 Global Navigation
- [ ] **Project switching functionality** - change context globally
- [ ] **Update page titles/subtitles** based on project
- [ ] **Persist project selection** across sessions

## PRIORITY 3: PAGE-SPECIFIC OVERHAULS

### 3.1 Chat Page
- [ ] **Load real topics** from database API
- [ ] **Implement real chat** with Gateway V2 messaging
- [ ] **Add file/photo upload** capability
- [ ] **Change user message background** to more yellow
- [ ] **Show active conversations** with real data
- [ ] **Add typing indicators** and read receipts
- [ ] **Implement message history** persistence

### 3.2 Overview Page (Complete Rethink)
- [ ] **Redesign layout** - new dashboard concept
- [ ] **Left Panel:** Real-time system health
  - [ ] Gateway V2 status (real)
  - [ ] NVIDIA API status (real)
  - [ ] Discord bot status (real)
  - [ ] Database connectivity
- [ ] **Center Panel:** Active work
  - [ ] Current topic/project
  - [ ] Active agents/tasks
  - [ ] Recent messages/activity
- [ ] **Right Panel:** Quick actions
  - [ ] Switch project
  - [ ] Create new topic
  - [ ] Start new agent
  - [ ] View logs
- [ ] **Bottom:** System metrics
  - [ ] CPU/Memory usage
  - [ ] Active connections
  - [ ] Message throughput
- [ ] **Fix padding issues**

### 3.3 Activity Page
- [ ] **Redesign layout** - active vs recent side-by-side
- [ ] **Left:** Active Work (real-time)
  - [ ] Current agents working
  - [ ] Live task progress
  - [ ] Active blueprints
- [ ] **Right:** Recent Activity (historical)
  - [ ] Completed tasks
  - [ ] System events
  - [ ] User interactions
- [ ] **Bottom:** Usage & Server Stats
  - [ ] API call statistics
  - [ ] Gateway metrics
  - [ ] Resource utilization
- [ ] **Integrate sync data** from separate sync page

### 3.4 Topics Page
- [ ] **Load real topics** from database
- [ ] **Organize by project** (WZRD.dev, Dilution Agent, Edge.dev)
- [ ] **Show topic metadata** - created, last active, file count
- [ ] **Add quick actions** - open, archive, delete
- [ ] **Implement search/filter** by project, date, status
- [ ] **Add visual indicators** for active/inactive topics

### 3.5 Tasks Page
- [ ] **Redesign as Kanban Board**
  - [ ] To Do | In Progress | Done columns
  - [ ] Tasks assigned to agents/users
  - [ ] Drag-and-drop functionality
- [ ] **Alternative List View**
  - [ ] Filter by assignee, project, priority
  - [ ] Show task dependencies
  - [ ] Time tracking/completion estimates
- [ ] **Load real task data** from database

### 3.6 MCP Server Page
- [ ] **Enhance with real data**
- [ ] **Show active MCP connections**
- [ ] **Add protocol version info**
- [ ] **Implement message throughput graphs**
- [ ] **Add connection health monitoring**
- [ ] **Display server configuration**

### 3.7 Instances Page → Agent Lifecycle Dashboard
- [ ] **Rename to "Agents" page**
- [ ] **Active Agents:** Real-time status, uptime, load
- [ ] **Agent Pool:** Available/capacity visualization
- [ ] **Lifecycle History:** Creation → work → completion
- [ ] **Performance Metrics:** Response times, success rates
- [ ] **Management:** Start/stop/restart agents UI

### 3.8 Recommendations Page → AI Insights Dashboard
- [ ] **Redesign from lists to cards**
- [ ] **Priority Recommendations** with actions
- [ ] **System Optimizations** with impact scores
- [ ] **Learning Patterns** visualization
- [ ] **Actionable Insights** with one-click implementation

### 3.9 Files Page → Unified Memory Explorer
- [ ] **Connect to real folder structure** `/home/mdwzrd/wzrd-redesign/`
- [ ] **Implement tree view** of actual files
- [ ] **Show real file count** (not just 8 files)
- [ ] **Add full-text search** across memory
- [ ] **Display file metadata** - types, sizes, last modified
- [ ] **Add quick actions** - open, edit, delete

### 3.10 Skills Page → Skills & Toolshed Gallery
- [ ] **Load actual skills** from toolshed
- [ ] **Create skill cards** with description, usage
- [ ] **Group by category** - debugging, coding, research, etc.
- [ ] **Show status** - loaded/available metrics
- [ ] **Display usage stats** - most used skills
- [ ] **Add management** - enable/disable skills

### 3.11 Gold Standard Page → WZRD.dev Framework Page
- [ ] **Rename to "Framework" page**
- [ ] **System Diagram** visual of all components
- [ ] **Component Status** each Stripe Minion with health
- [ ] **Data Flow** visualization
- [ ] **Integration Points** APIs, databases, services
- [ ] **Documentation** framework principles

### 3.12 Blueprints Page
- [ ] **Fix loading issues**
- [ ] **Show active blueprints** real-time execution
- [ ] **Display execution history**
- [ ] **Add performance metrics** success/failure rates
- [ ] **Create template library** available blueprints
- [ ] **Add blueprint builder** interface

### 3.13 Config Page
- [ ] **Fix loading issues**
- [ ] **Build complete configuration center**
  - [ ] General Settings (theme, layout)
  - [ ] Gateway Configuration
  - [ ] Discord Integration
  - [ ] NVIDIA API Settings
  - [ ] Database Configuration
  - [ ] Security Settings
- [ ] **Add live preview** of changes
- [ ] **Implement import/export** configuration profiles
- [ ] **Add validation** with error highlighting

### 3.14 Logs Page
- [ ] **Fix loading issues**
- [ ] **Implement real-time log streaming**
- [ ] **Add filters** by component, severity, time
- [ ] **Create search functionality**
- [ ] **Add export capability**
- [ ] **Implement log correlation** linking related entries

### 3.15 Sync Page
- [ ] **Enhance or consolidate** with activity page
- [ ] **Sync Status** visualization
- [ ] **Conflict Resolution** interface
- [ ] **Sync History** timeline
- [ ] **Manual Controls** force sync, resolve conflicts

### 3.16 Sandbox Page
- [ ] **Move to WZRD section** (from standalone)
- [ ] **Load real sandboxes** from database
- [ ] **Display sandbox details** - type, status, resources
- [ ] **Add management** - create, start, stop, delete
- [ ] **Implement quick launch** from templates

## PRIORITY 4: MISSING FEATURES

### 4.1 Heartbeats & Cronjobs Dashboard (New Page)
- [ ] **Create new page** "Automation"
- [ ] **Visual schedule** cronjob timeline
- [ ] **Execution history** past runs with outcomes
- [ ] **Real-time monitoring** live heartbeat status
- [ ] **Configuration interface** edit cron schedules
- [ ] **Alert system** failed job notifications

### 4.2 Projects Page (New)
- [ ] **Create new page** "Projects"
- [ ] **Project Gallery** all active projects
- [ ] **Project switching** quick context change
- [ ] **Project metrics** activity, resources, team
- [ ] **Cross-project** dependencies visualization
- [ ] **Management** create, archive, delete projects

### 4.3 Agent Automation Lifecycle Visualization
- [ ] **Add to Agents page**
- [ ] **Agent creation** visualization
- [ ] **Work assignment** visualization
- [ ] **Execution flow** step-by-step display
- [ ] **Completion tracking** results and outputs
- [ ] **Resource usage** CPU/memory per agent

## PRIORITY 5: DESIGN & UX OVERHAUL

### 5.1 Component Library Enhancement
- [ ] **Replace boring lists** with interactive cards, grids
- [ ] **Implement consistent design system** across all pages
- [ ] **Add animations and transitions** for better UX
- [ ] **Ensure mobile responsiveness**
- [ ] **Create reusable component library**

### 5.2 Real-time Updates
- [ ] **WebSocket connections** for live data
- [ ] **Auto-refresh** for dynamic content
- [ ] **Visual indicators** for updates (badges, notifications)
- [ ] **Optimistic UI updates**

### 5.3 Error Handling & User Feedback
- [ ] **Graceful degradation** when APIs unavailable
- [ ] **Clear error messages** with recovery options
- [ ] **Loading states** with progress indicators
- [ ] **Success/confirmation feedback**

### 5.4 Navigation & Information Architecture
- [ ] **Consistent sidebar/navigation**
- [ ] **Breadcrumb trails** for deep navigation
- [ ] **Quick access** to frequent actions
- [ ] **Keyboard shortcuts**

## PRIORITY 6: VALIDATION & TESTING

### 6.1 Data Validation
- [ ] **Every page shows real data** (no mock values)
- [ ] **API connections verified** for all systems
- [ ] **Data accuracy confirmed** against source systems

### 6.2 Functionality Testing
- [ ] **All interactive elements work**
- [ ] **Forms submit and validate correctly**
- [ ] **File upload/download works**
- [ ] **Real-time updates function**
- [ ] **Project switching works**

### 6.3 Performance Testing
- [ ] **Page load time** < 2 seconds
- [ ] **Real-time updates** < 1 second latency
- [ ] **Memory usage** within acceptable limits
- [ ] **Concurrent users** handle multiple sessions

### 6.4 User Experience Testing
- [ ] **All pages provide clear value**
- [ ] **Navigation intuitive and consistent**
- [ ] **Error recovery clear and helpful**
- [ ] **Mobile/responsive design works**

## IMPLEMENTATION ORDER

### Week 1: Foundation & Core APIs
1. Enhance API server with real endpoints
2. Create frontend data service layer
3. Fix Topbar and global navigation
4. Implement project switching

### Week 2: Critical Pages (Highest User Value)
1. Chat page with real topics/messaging
2. Overview page complete redesign
3. Activity page with real data visualization
4. File upload functionality

### Week 3: Data-Intensive Pages
1. Topics page with project organization
2. Tasks page Kanban board
3. Files page with real folder structure
4. Skills page with toolshed integration

### Week 4: System Management Pages
1. Config page fully functional
2. Logs page with real-time streaming
3. Blueprints live dashboard
4. Agents lifecycle visualization

### Week 5: Missing Features & Enhancement
1. Heartbeats/cronjobs dashboard
2. Projects page implementation
3. Design consistency pass
4. Performance optimization

### Week 6: Testing & Polish
1. End-to-end testing
2. Real data validation
3. User experience refinement
4. Performance optimization

## SKILLS NEEDED
1. **API Integration** - Connect frontend to backend systems
2. **Database Access** - SQLite queries for real data
3. **File System Access** - Scan directories for files
4. **WebSocket Implementation** - Real-time updates
5. **UI/UX Design** - Component library enhancement
6. **Data Visualization** - Charts, graphs, metrics display
7. **Error Handling** - Graceful degradation patterns
8. **Performance Optimization** - Fast page loads, efficient updates

## SUCCESS CRITERIA
**COMPLETED WHEN:**
✅ Every page loads real data (no mock/hardcoded values)
✅ All interactive elements function correctly
✅ System provides clear value to users
✅ User can manage entire WZRD.dev ecosystem via web UI
✅ Performance meets standards (<2s load, <1s updates)
✅ Design consistent and professional across all pages

**VALIDATION METHOD:**
- Manual testing of every page/feature
- API response verification
- Real data comparison with source systems
- User experience walkthrough
- Performance benchmarking

---

*This to-do list represents approximately 150-200 hours of development work. Each item must be completed and validated before marking as done.*