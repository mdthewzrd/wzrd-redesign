/**
 * Test script for Agent Pool Manager
 */

import { agentPool } from './agent-pool.js';

async function runTests() {
  console.log('🧪 Testing Agent Pool Manager...\n');
  
  // Test 1: Get initial stats
  console.log('Test 1: Initial Stats');
  const initialStats = agentPool.getPoolStats();
  console.log(JSON.stringify(initialStats, null, 2));
  
  // Test 2: Submit multiple tasks
  console.log('\nTest 2: Submitting Tasks...');
  
  const tasks = [
    { type: 'coding', description: 'Create a React component for user profile', priority: 'high' },
    { type: 'research', description: 'Research best practices for TypeScript error handling', priority: 'medium' },
    { type: 'planning', description: 'Plan architecture for new microservices', priority: 'high' },
    { type: 'debugging', description: 'Fix memory leak in Node.js application', priority: 'high' },
    { type: 'analysis', description: 'Analyze performance metrics from production', priority: 'medium' },
  ];
  
  const taskIds = tasks.map(task => 
    agentPool.submitTask(task.type, task.description, task.priority)
  );
  
  console.log(`Submitted ${taskIds.length} tasks`);
  
  // Test 3: Check task statuses
  console.log('\nTest 3: Task Statuses (initial)');
  taskIds.forEach((taskId, i) => {
    const status = agentPool.getTaskStatus(taskId);
    console.log(`Task ${i + 1}: ${status.status} - ${status.description}`);
  });
  
  // Test 4: Check agent statuses
  console.log('\nTest 4: Agent Statuses');
  const agents = Array.from(agentPool.agents.keys());
  agents.forEach(agentId => {
    const status = agentPool.getAgentStatus(agentId);
    console.log(`Agent ${agentId}: ${status.status} (${status.type})`);
  });
  
  // Test 5: Wait for tasks to complete
  console.log('\nTest 5: Waiting for tasks to complete...');
  
  let completed = 0;
  const checkInterval = setInterval(() => {
    const stats = agentPool.getPoolStats();
    completed = stats.tasks.completed;
    
    console.log(`Progress: ${completed}/${taskIds.length} tasks completed`);
    
    if (completed === taskIds.length) {
      clearInterval(checkInterval);
      
      // Test 6: Final stats
      console.log('\nTest 6: Final Stats');
      const finalStats = agentPool.getPoolStats();
      console.log(JSON.stringify(finalStats, null, 2));
      
      // Test 7: Add new agent
      console.log('\nTest 7: Adding new agent');
      const newAgentId = agentPool.addAgent('coder', ['typescript', 'react', 'nextjs', 'graphql']);
      console.log(`Added agent: ${newAgentId}`);
      
      const newStats = agentPool.getPoolStats();
      console.log(`Total agents: ${newStats.agents.total}`);
      
      console.log('\n✅ All tests passed!');
    }
  }, 1000);
  
  // Test with event listeners
  agentPool.on('task_completed', (task, result) => {
    console.log(`🎉 Event: Task ${task.id} completed by agent ${result.agentId}`);
  });
  
  agentPool.on('task_failed', (task, error) => {
    console.error(`💥 Event: Task ${task.id} failed: ${error.message}`);
  });
}

// Run tests
runTests().catch(console.error);