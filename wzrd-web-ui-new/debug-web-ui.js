const fetch = require('node-fetch');

async function testWebUIFetches() {
  console.log('Testing web UI API endpoints from browser perspective...\n');
  
  const endpoints = [
    '/api/topics',
    '/api/sandboxes',
    '/api/memory/stats',
    '/api/memory/files',
    '/api/health'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`http://localhost:3000${endpoint}`);
      const status = response.status;
      const ok = response.ok;
      console.log(`${endpoint}: ${status} ${ok ? '✅ OK' : '❌ FAILED'}`);
      
      if (ok) {
        const data = await response.json();
        console.log(`  Data: ${JSON.stringify(data).slice(0, 100)}...`);
      }
    } catch (error) {
      console.log(`${endpoint}: ❌ ERROR ${error.message}`);
    }
  }
  
  console.log('\nTesting direct Gateway V2 endpoints...\n');
  
  const gatewayEndpoints = [
    'http://127.0.0.1:18801/health',
    'http://127.0.0.1:18801/agent/pool'
  ];
  
  for (const url of gatewayEndpoints) {
    try {
      const response = await fetch(url);
      const status = response.status;
      const ok = response.ok;
      console.log(`${url}: ${status} ${ok ? '✅ OK' : '❌ FAILED'}`);
    } catch (error) {
      console.log(`${url}: ❌ ERROR ${error.message}`);
    }
  }
}

testWebUIFetches();
