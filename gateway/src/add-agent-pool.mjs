// Add agent pool endpoints to Gateway V2 - ES module version
import { promises as fs } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const filePath = join(__dirname, 'http-gateway-v2.js');

try {
  let content = await fs.readFile(filePath, 'utf8');

  // Find the routing section and add agent routes
  const routingMarker = '// Route requests';
  const beforeRouting = content.substring(0, content.indexOf(routingMarker) + routingMarker.length);
  const afterRouting = content.substring(content.indexOf(routingMarker) + routingMarker.length);

  // Add agent pool routes after existing routes but before the catch block
  const newRoutes = `
    else if (req.method === 'POST' && url.pathname === '/agent/register') {
      await handleAgentRegister(req, res);
    }
    else if (req.method === 'GET' && url.pathname === '/agent/pool') {
      await handleAgentPool(req, res);
    }
    else if (req.method === 'POST' && url.pathname === '/agent/task') {
      await handleAgentTask(req, res);
    }
    else if (req.method === 'GET' && url.pathname === '/agent/status') {
      await handleAgentStatus(req, res, url);
    }
`;

  // Insert after existing routes (before the "else {" for 404)
  const updatedContent = beforeRouting + afterRouting.replace(
    '    else if (req.method === \\'GET\\' && url.pathname === \\'/health\\') {',
    newRoutes + '    else if (req.method === \\'GET\\' && url.pathname === \\'/health\\') {'
  );

  // Now add the handler functions before export
  const exportMarker = 'export { server, httpState, sessionManager, connectToWebSocketGateway };';
  const beforeExport = updatedContent.substring(0, updatedContent.indexOf(exportMarker));
  const afterExport = updatedContent.substring(updatedContent.indexOf(exportMarker));

  // Add agent pool implementation
  const agentImplementation = `

// Agent pool state
const agentPool = {
  agents: new Map(), // agentId -> Agent
  tasks: new Map(), // taskId -> Task
  taskQueue: [],
};

class Agent {
  constructor(agentId, agentType, capabilities) {
    this.agentId = agentId;
    this.agentType = agentType;
    this.capabilities = capabilities;
    this.status = 'idle';
    this.lastHeartbeat = Date.now();
    this.activeTask = null;
    this.createdAt = Date.now();
  }

  updateStatus(status, taskId = null) {
    this.status = status;
    this.activeTask = taskId;
    this.lastHeartbeat = Date.now();
  }

  isAlive() {
    return Date.now() - this.lastHeartbeat < 30000; // 30 seconds
  }
}

class Task {
  constructor(taskId, taskType, prompt, priority = 'normal') {
    this.taskId = taskId;
    this.taskType = taskType;
    this.prompt = prompt;
    this.priority = priority;
    this.status = 'pending';
    this.assignedTo = null;
    this.createdAt = Date.now();
    this.completedAt = null;
    this.result = null;
  }
}

// Agent registration
async function handleAgentRegister(req, res) {
  try {
    const body = await parseRequestBody(req);
    const { agentId, agentType, capabilities } = body;

    if (!agentId || !agentType) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Missing agentId or agentType' }));
    }

    const agent = new Agent(agentId, agentType, capabilities || []);
    agentPool.agents.set(agentId, agent);

    console.log(\`[AgentPool] Registered agent: \${agentId} (\${agentType})\`);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      success: true, 
      agentId,
      message: \`Agent \${agentId} registered successfully\`
    }));
  } catch (error) {
    console.error('Agent registration error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}

// Get agent pool status
async function handleAgentPool(req, res) {
  const agents = Array.from(agentPool.agents.values())
    .filter(agent => agent.isAlive())
    .map(agent => ({
      agentId: agent.agentId,
      agentType: agent.agentType,
      status: agent.status,
      capabilities: agent.capabilities,
      lastHeartbeat: agent.lastHeartbeat,
      activeTask: agent.activeTask,
      uptime: Date.now() - agent.createdAt
    }));

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    success: true,
    agents,
    totalAgents: agents.length,
    idleAgents: agents.filter(a => a.status === 'idle').length,
    busyAgents: agents.filter(a => a.status === 'busy').length
  }));
}

// Submit task to agent pool
async function handleAgentTask(req, res) {
  try {
    const body = await parseRequestBody(req);
    const { taskType, prompt, priority = 'normal', agentType } = body;

    if (!taskType || !prompt) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Missing taskType or prompt' }));
    }

    const taskId = uuidv4();
    const task = new Task(taskId, taskType, prompt, priority);
    agentPool.tasks.set(taskId, task);
    agentPool.taskQueue.push(taskId);

    console.log(\`[AgentPool] Task created: \${taskId} (\${taskType})\`);

    // Try to assign to idle agent
    assignTasks();

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      success: true,
      taskId,
      status: task.status,
      message: \`Task \${taskId} queued successfully\`
    }));
  } catch (error) {
    console.error('Task submission error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}

// Get agent/task status
async function handleAgentStatus(req, res, url) {
  const urlParams = new URLSearchParams(url.search);
  const agentId = urlParams.get('agentId');
  const taskId = urlParams.get('taskId');

  if (agentId) {
    const agent = agentPool.agents.get(agentId);
    if (!agent) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Agent not found' }));
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      agentId: agent.agentId,
      agentType: agent.agentType,
      status: agent.status,
      capabilities: agent.capabilities,
      lastHeartbeat: agent.lastHeartbeat,
      activeTask: agent.activeTask,
      isAlive: agent.isAlive()
    }));
  } else if (taskId) {
    const task = agentPool.tasks.get(taskId);
    if (!task) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Task not found' }));
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      taskId: task.taskId,
      taskType: task.taskType,
      status: task.status,
      assignedTo: task.assignedTo,
      createdAt: task.createdAt,
      completedAt: task.completedAt,
      result: task.result
    }));
  } else {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Missing agentId or taskId parameter' }));
  }
}

// Assign tasks to idle agents
function assignTasks() {
  // Get idle agents
  const idleAgents = Array.from(agentPool.agents.values())
    .filter(agent => agent.status === 'idle' && agent.isAlive());

  // Get pending tasks
  const pendingTasks = agentPool.taskQueue
    .filter(taskId => {
      const task = agentPool.tasks.get(taskId);
      return task && task.status === 'pending';
    });

  // Simple round-robin assignment
  for (let i = 0; i < Math.min(idleAgents.length, pendingTasks.length); i++) {
    const agent = idleAgents[i];
    const taskId = pendingTasks[i];
    const task = agentPool.tasks.get(taskId);

    if (task && agent) {
      task.status = 'assigned';
      task.assignedTo = agent.agentId;
      agent.updateStatus('busy', taskId);

      console.log(\`[AgentPool] Task \${taskId} assigned to agent \${agent.agentId}\`);
    }
  }
}

// Cleanup dead agents periodically
setInterval(() => {
  const deadAgents = Array.from(agentPool.agents.values())
    .filter(agent => !agent.isAlive());

  deadAgents.forEach(agent => {
    console.log(\`[AgentPool] Removing dead agent: \${agent.agentId}\`);
    agentPool.agents.delete(agent.agentId);
  });
}, 60000); // Every minute
`;

  const finalContent = beforeExport + agentImplementation + afterExport;

  // Write backup first
  await fs.writeFile(filePath + '.backup', content);
  await fs.writeFile(filePath, finalContent);

  console.log('✅ Agent pool added to Gateway V2');
  console.log('Backup saved to:', filePath + '.backup');
} catch (error) {
  console.error('Error:', error);
}
