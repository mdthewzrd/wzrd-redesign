/**
 * WZRD.dev Agent Pool Manager
 * 
 * Manages a pool of agents for parallel execution
 * Features:
 * - Load balancing across agents
 * - Agent type matching (coder, thinker, researcher)
 * - Task queue with priorities
 * - Results aggregation
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

class Agent {
  constructor(id, type, capabilities) {
    this.id = id;
    this.type = type; // 'coder', 'thinker', 'researcher', 'general'
    this.capabilities = capabilities; // ['typescript', 'python', 'react', 'sql', ...]
    this.status = 'idle'; // 'idle', 'busy', 'error'
    this.currentTask = null;
    this.startedAt = Date.now();
    this.completedTasks = 0;
    this.failedTasks = 0;
    this.avgResponseTime = 0;
  }

  assignTask(task) {
    this.status = 'busy';
    this.currentTask = task;
    task.assignedAgent = this.id;
    task.assignedAt = Date.now();
    console.log(`🤖 Agent ${this.id} (${this.type}) assigned task ${task.id}`);
  }

  completeTask(task, result) {
    this.status = 'idle';
    this.currentTask = null;
    this.completedTasks++;
    
    const responseTime = Date.now() - task.assignedAt;
    this.avgResponseTime = (this.avgResponseTime * (this.completedTasks - 1) + responseTime) / this.completedTasks;
    
    console.log(`✅ Agent ${this.id} completed task ${task.id} in ${responseTime}ms`);
    return result;
  }

  failTask(task, error) {
    this.status = 'error';
    this.currentTask = null;
    this.failedTasks++;
    console.error(`❌ Agent ${this.id} failed task ${task.id}:`, error);
    
    // Reset to idle after failure (could implement backoff)
    setTimeout(() => {
      this.status = 'idle';
    }, 5000);
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      status: this.status,
      capabilities: this.capabilities,
      startedAt: this.startedAt,
      completedTasks: this.completedTasks,
      failedTasks: this.failedTasks,
      avgResponseTime: this.avgResponseTime,
      currentTask: this.currentTask?.id
    };
  }
}

class Task {
  constructor(id, type, description, priority = 'medium', requirements = {}) {
    this.id = id;
    this.type = type; // 'coding', 'research', 'planning', 'debugging'
    this.description = description;
    this.priority = priority; // 'high', 'medium', 'low'
    this.requirements = requirements; // { languages: ['typescript'], frameworks: ['react'] }
    this.status = 'pending'; // 'pending', 'assigned', 'completed', 'failed'
    this.createdAt = Date.now();
    this.assignedAt = null;
    this.completedAt = null;
    this.result = null;
    this.error = null;
    this.dependencies = []; // Other task IDs that must complete first
  }

  markAssigned(agentId) {
    this.status = 'assigned';
    this.assignedAt = Date.now();
    this.assignedAgent = agentId;
  }

  markCompleted(result) {
    this.status = 'completed';
    this.completedAt = Date.now();
    this.result = result;
  }

  markFailed(error) {
    this.status = 'failed';
    this.completedAt = Date.now();
    this.error = error;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      description: this.description.substring(0, 100) + '...',
      priority: this.priority,
      status: this.status,
      createdAt: this.createdAt,
      assignedAt: this.assignedAt,
      completedAt: this.completedAt,
      assignedAgent: this.assignedAgent,
      dependencies: this.dependencies
    };
  }
}

class AgentPoolManager extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.agents = new Map(); // agentId -> Agent
    this.tasks = new Map(); // taskId -> Task
    this.taskQueue = []; // Queue of pending task IDs sorted by priority
    this.maxAgents = config.maxAgents || 10;
    this.autoScale = config.autoScale !== false;
    this.maxQueueSize = config.maxQueueSize || 100;
    
    // Initialize with some default agents
    this.initializeDefaultAgents();
    
    // Start task processor
    this.startTaskProcessor();
    
    console.log(`🚀 Agent Pool Manager initialized with ${this.agents.size} agents`);
  }

  initializeDefaultAgents() {
    // Default agent types
    const defaultAgents = [
      { type: 'coder', capabilities: ['typescript', 'javascript', 'python', 'react', 'nodejs'] },
      { type: 'thinker', capabilities: ['architecture', 'planning', 'system-design', 'analysis'] },
      { type: 'researcher', capabilities: ['web-search', 'documentation', 'comparison', 'analysis'] },
      { type: 'general', capabilities: ['chat', 'general', 'documentation', 'troubleshooting'] },
    ];

    defaultAgents.forEach((agentDef, index) => {
      const agent = new Agent(
        `agent-${index + 1}`,
        agentDef.type,
        agentDef.capabilities
      );
      this.agents.set(agent.id, agent);
    });
  }

  startTaskProcessor() {
    // Process queue every second
    setInterval(() => {
      this.processQueue();
    }, 1000);
  }

  processQueue() {
    if (this.taskQueue.length === 0) return;

    // Sort queue by priority and creation time
    this.taskQueue.sort((a, b) => {
      const taskA = this.tasks.get(a);
      const taskB = this.tasks.get(b);
      
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[taskA.priority] !== priorityOrder[taskB.priority]) {
        return priorityOrder[taskA.priority] - priorityOrder[taskB.priority];
      }
      
      return taskA.createdAt - taskB.createdAt;
    });

    // Try to assign tasks
    for (let i = 0; i < Math.min(this.taskQueue.length, 5); i++) {
      const taskId = this.taskQueue[i];
      const task = this.tasks.get(taskId);
      
      if (task.status === 'pending' && this.canStartTask(task)) {
        this.assignTask(task);
      }
    }
  }

  canStartTask(task) {
    // Check if all dependencies are completed
    for (const depId of task.dependencies) {
      const depTask = this.tasks.get(depId);
      if (!depTask || depTask.status !== 'completed') {
        return false;
      }
    }
    return true;
  }

  assignTask(task) {
    // Find suitable agent
    const suitableAgents = Array.from(this.agents.values())
      .filter(agent => agent.status === 'idle')
      .filter(agent => this.agentCanHandleTask(agent, task))
      .sort((a, b) => {
        // Prefer agents with fewer completed tasks (load balancing)
        return a.completedTasks - b.completedTasks;
      });

    if (suitableAgents.length === 0) {
      console.log(`⚠️ No idle agents available for task ${task.id}`);
      return false;
    }

    const agent = suitableAgents[0];
    task.markAssigned(agent.id);
    agent.assignTask(task);
    
    // Remove from queue
    const queueIndex = this.taskQueue.indexOf(task.id);
    if (queueIndex !== -1) {
      this.taskQueue.splice(queueIndex, 1);
    }

    // Simulate task execution (in real implementation, this would call actual agent)
    this.executeTask(task, agent);
    
    return true;
  }

  agentCanHandleTask(agent, task) {
    // Simple matching: agent type should match task type
    const typeMapping = {
      'coding': 'coder',
      'research': 'researcher',
      'planning': 'thinker',
      'debugging': 'coder',
      'analysis': 'thinker'
    };

    const expectedType = typeMapping[task.type] || 'general';
    return agent.type === expectedType;
  }

  async executeTask(task, agent) {
    try {
      console.log(`▶️ Executing task ${task.id} with agent ${agent.id}: ${task.description.substring(0, 50)}...`);
      
      // In real implementation, this would:
      // 1. Call the actual agent (API, subprocess, etc.)
      // 2. Wait for response
      // 3. Process result
      
      // Simulate execution time based on task type
      const executionTime = this.getSimulatedExecutionTime(task);
      await new Promise(resolve => setTimeout(resolve, executionTime));
      
      // Simulate result
      const result = {
        taskId: task.id,
        agentId: agent.id,
        executionTime,
        output: `Completed task: ${task.description}`,
        metadata: {
          simulated: true,
          actualExecution: 'In real implementation, would call actual agent'
        }
      };
      
      task.markCompleted(result);
      agent.completeTask(task, result);
      
      this.emit('task_completed', task, result);
      
    } catch (error) {
      task.markFailed(error.message);
      agent.failTask(task, error);
      this.emit('task_failed', task, error);
    }
  }

  getSimulatedExecutionTime(task) {
    // Simulate different execution times based on task type
    const times = {
      'coding': 3000,
      'research': 5000,
      'planning': 2000,
      'debugging': 4000,
      'analysis': 3000
    };
    
    return times[task.type] || 1000;
  }

  // Public API

  submitTask(type, description, priority = 'medium', requirements = {}, dependencies = []) {
    if (this.taskQueue.length >= this.maxQueueSize) {
      throw new Error(`Task queue full (max: ${this.maxQueueSize})`);
    }

    const taskId = `task-${uuidv4()}`;
    const task = new Task(taskId, type, description, priority, requirements);
    task.dependencies = dependencies;

    this.tasks.set(taskId, task);
    this.taskQueue.push(taskId);
    
    console.log(`📥 Submitted task ${taskId}: ${description.substring(0, 50)}...`);
    
    return taskId;
  }

  getTaskStatus(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);
    return task.toJSON();
  }

  getAgentStatus(agentId) {
    const agent = this.agents.get(agentId);
    if (!agent) throw new Error(`Agent ${agentId} not found`);
    return agent.toJSON();
  }

  getPoolStats() {
    const agents = Array.from(this.agents.values());
    const tasks = Array.from(this.tasks.values());
    
    return {
      agents: {
        total: agents.length,
        idle: agents.filter(a => a.status === 'idle').length,
        busy: agents.filter(a => a.status === 'busy').length,
        error: agents.filter(a => a.status === 'error').length,
      },
      tasks: {
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'pending').length,
        assigned: tasks.filter(t => t.status === 'assigned').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        failed: tasks.filter(t => t.status === 'failed').length,
      },
      queue: {
        size: this.taskQueue.length,
        maxSize: this.maxQueueSize,
      },
      performance: {
        avgResponseTime: agents.reduce((sum, a) => sum + a.avgResponseTime, 0) / agents.length,
        completedTasks: agents.reduce((sum, a) => sum + a.completedTasks, 0),
        failedTasks: agents.reduce((sum, a) => sum + a.failedTasks, 0),
      }
    };
  }

  addAgent(type, capabilities) {
    if (this.agents.size >= this.maxAgents) {
      console.warn(`⚠️ Max agents (${this.maxAgents}) reached, cannot add more`);
      return null;
    }

    const agentId = `agent-${uuidv4().slice(0, 8)}`;
    const agent = new Agent(agentId, type, capabilities);
    this.agents.set(agentId, agent);
    
    console.log(`➕ Added agent ${agentId} (${type}) with capabilities: ${capabilities.join(', ')}`);
    
    return agentId;
  }

  removeAgent(agentId) {
    const agent = this.agents.get(agentId);
    if (!agent) throw new Error(`Agent ${agentId} not found`);
    
    if (agent.status === 'busy') {
      throw new Error(`Cannot remove busy agent ${agentId}`);
    }
    
    this.agents.delete(agentId);
    console.log(`➖ Removed agent ${agentId}`);
  }
}

// Export singleton instance
const agentPool = new AgentPoolManager({
  maxAgents: 10,
  maxQueueSize: 100,
  autoScale: true
});

export { AgentPoolManager, agentPool };