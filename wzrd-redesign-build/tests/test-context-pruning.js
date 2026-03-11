#!/usr/bin/env node

/**
 * Test script for Dynamic Context Pruning Plugin
 */

const DynamicContextPruningPlugin = require('../src/plugins/opencode-dynamic-context-pruning.js');
const fs = require('fs');
const path = require('path');

// Create test directory
const testDir = path.join(__dirname, '..', 'sandbox', 'context-pruning-test');
const testHistoryFile = path.join(testDir, 'prompt-history.jsonl');

// Ensure test directory exists
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

// Create test history file with 100 conversations
function createTestHistory() {
  const conversations = [];
  const now = Date.now();
  
  // Create conversations spanning 48 hours
  for (let i = 0; i < 100; i++) {
    const timestamp = now - (i * 30 * 60 * 1000); // 30 minutes apart
    conversations.push({
      timestamp,
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: `Test conversation ${i} - ${new Date(timestamp).toISOString()}`,
      model: 'test-model'
    });
  }
  
  // Write to file (JSONL format)
  const content = conversations.map(c => JSON.stringify(c)).join('\n');
  fs.writeFileSync(testHistoryFile, content);
  
  console.log(`Created test history with ${conversations.length} conversations`);
  return conversations.length;
}

async function runTest() {
  console.log('=== Dynamic Context Pruning Plugin Test ===\n');
  
  // Step 1: Create test history
  console.log('1. Creating test history...');
  const initialCount = createTestHistory();
  console.log(`   Initial conversations: ${initialCount}\n`);
  
  // Step 2: Initialize plugin with test config
  console.log('2. Initializing plugin...');
  const plugin = new DynamicContextPruningPlugin({
    maxConversations: 50,
    maxAgeMs: 24 * 60 * 60 * 1000, // 24 hours
    pruneAfterConversations: 5,
    backupEnabled: false, // Disable backup for testing
    backupDir: path.join(testDir, 'backups')
  });
  
  // Override history file path for testing
  plugin.historyFile = testHistoryFile;
  
  await plugin.init();
  console.log('   Plugin initialized successfully\n');
  
  // Step 3: Run initial prune check
  console.log('3. Running initial prune check...');
  const shouldPrune = plugin.shouldPrune();
  console.log(`   Should prune: ${shouldPrune}\n`);
  
  // Step 4: Force pruning
  console.log('4. Running pruning...');
  const pruned = await plugin.prune();
  console.log(`   Pruning executed: ${pruned}\n`);
  
  // Step 5: Verify results
  console.log('5. Verifying results...');
  if (fs.existsSync(testHistoryFile)) {
    const content = fs.readFileSync(testHistoryFile, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    
    console.log(`   Final conversations: ${lines.length}`);
    
    if (lines.length <= 50) {
      console.log('   ✓ PASS: Pruning successful (kept ≤ 50 conversations)');
    } else {
      console.log('   ✗ FAIL: Pruning unsuccessful (still > 50 conversations)');
    }
    
    // Check timestamps
    const keptConversations = lines.map(line => {
      try {
        return JSON.parse(line);
      } catch (e) {
        return null;
      }
    }).filter(c => c);
    
    const oldestKept = keptConversations[keptConversations.length - 1];
    const newestKept = keptConversations[0];
    
    if (oldestKept && newestKept) {
      const ageHours = (newestKept.timestamp - oldestKept.timestamp) / (1000 * 60 * 60);
      console.log(`   Age range of kept conversations: ${ageHours.toFixed(2)} hours`);
      
      if (ageHours <= 24) {
        console.log('   ✓ PASS: Kept conversations are within 24 hour window');
      } else {
        console.log('   ✗ FAIL: Kept conversations exceed 24 hour window');
      }
    }
  } else {
    console.log('   ✗ FAIL: History file missing after pruning');
  }
  
  // Step 6: Test hooks
  console.log('\n6. Testing plugin hooks...');
  
  // Test conversation complete hook
  const mockConversation = {
    timestamp: Date.now(),
    role: 'user',
    content: 'Test hook conversation',
    model: 'test-model'
  };
  
  const result = await plugin.onConversationComplete(mockConversation);
  console.log(`   Conversation hook result: ${result ? 'Success' : 'No pruning needed'}`);
  
  // Test compact command hook
  const compactResult = await plugin.onCompactCommand();
  console.log(`   Compact command hook result: ${compactResult ? 'Pruning executed' : 'No pruning needed'}`);
  
  console.log('\n=== Test Complete ===');
  
  // Cleanup
  console.log('\nCleaning up test files...');
  try {
    fs.rmSync(testDir, { recursive: true, force: true });
    console.log('Test directory cleaned up');
  } catch (error) {
    console.log('Cleanup failed:', error.message);
  }
}

// Run test
runTest().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});