#!/usr/bin/env node
// Bot supervisor - keeps bot permanently online

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('👁️‍🗨️ WZRDClaw Bot Supervisor Starting...');
console.log('========================================');

const BOT_SCRIPT = path.join(__dirname, 'wzrdclaw-discord-bot-ai.js');
const LOG_FILE = '/tmp/wzrdclaw-supervisor.log';

let botProcess = null;
let restartCount = 0;
const MAX_RESTARTS_PER_HOUR = 20;
let restartsThisHour = 0;
let hourStart = Date.now();

function log(message) {
  const timestamp = new Date().toISOString();
  const logMsg = `[${timestamp}] ${message}`;
  console.log(logMsg);
  fs.appendFileSync(LOG_FILE, logMsg + '\n');
}

function startBot() {
  if (botProcess) {
    log('⚠️ Killing existing bot process');
    botProcess.kill('SIGTERM');
  }
  
  restartCount++;
  restartsThisHour++;
  
  log(`🚀 Starting bot (attempt ${restartCount}, hour: ${restartsThisHour}/${MAX_RESTARTS_PER_HOUR})`);
  
  // Set environment
  const env = {
    ...process.env,
    DISCORD_BOT_TOKEN: "YOUR_DISCORD_BOT_TOKEN_HERE"
  };
  
  botProcess = spawn('node', [BOT_SCRIPT], {
    env,
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  // Log bot output
  botProcess.stdout.on('data', (data) => {
    const output = data.toString().trim();
    if (output) {
      log(`🤖 BOT: ${output}`);
    }
  });
  
  botProcess.stderr.on('data', (data) => {
    const error = data.toString().trim();
    if (error) {
      log(`❌ BOT ERROR: ${error}`);
    }
  });
  
  botProcess.on('close', (code) => {
    log(`⚠️ Bot exited with code ${code}`);
    
    // Check rate limit
    const now = Date.now();
    if (now - hourStart > 3600000) { // 1 hour passed
      hourStart = now;
      restartsThisHour = 0;
    }
    
    if (restartsThisHour >= MAX_RESTARTS_PER_HOUR) {
      log(`🚨 MAX RESTARTS REACHED (${MAX_RESTARTS_PER_HOUR}/hour). Waiting 5 minutes...`);
      setTimeout(startBot, 300000); // 5 minutes
    } else {
      // Restart after delay
      const delay = Math.min(30000, restartCount * 5000); // Max 30s delay
      log(`🔄 Restarting in ${delay/1000}s...`);
      setTimeout(startBot, delay);
    }
  });
  
  botProcess.on('error', (error) => {
    log(`💥 Bot process error: ${error.message}`);
  });
}

function checkBackend() {
  const https = require('https');
  
  return new Promise((resolve) => {
    const req = https.get('https://discord.com/api/v9/users/@me', {
      headers: {
        'Authorization': `Bot YOUR_DISCORD_BOT_TOKEN_HERE
      },
      timeout: 10000
    }, (res) => {
      log(`🌐 Discord API check: ${res.statusCode}`);
      resolve(res.statusCode === 200);
    });
    
    req.on('error', (error) => {
      log(`🌐 Discord API error: ${error.message}`);
      resolve(false);
    });
    
    req.on('timeout', () => {
      log('🌐 Discord API timeout');
      req.destroy();
      resolve(false);
    });
  });
}

async function monitor() {
  log('📡 Starting monitoring loop...');
  
  // Initial backend check
  const backendOk = await checkBackend();
  log(`🌐 Initial Discord API: ${backendOk ? '✅ Reachable' : '❌ Unreachable'}`);
  
  // Start bot
  startBot();
  
  // Periodic health checks
  setInterval(async () => {
    if (!botProcess || botProcess.exitCode !== null) {
      log('⚠️ Bot process dead, triggering restart...');
      startBot();
      return;
    }
    
    // Check backend every 5 minutes
    const backendOk = await checkBackend();
    if (!backendOk) {
      log('🌐 Discord API unreachable, bot may disconnect soon');
    }
    
    log(`📊 Status: Bot ${botProcess ? '✅ Running' : '❌ Stopped'} | Restarts: ${restartCount} | This hour: ${restartsThisHour}/${MAX_RESTARTS_PER_HOUR}`);
    
  }, 300000); // 5 minutes
  
  // Quick status every minute
  setInterval(() => {
    const status = botProcess && botProcess.exitCode === null ? '✅ Online' : '❌ Offline';
    log(`⏱️ Quick check: ${status}`);
  }, 60000);
}

// Handle shutdown
process.on('SIGINT', () => {
  log('\n👋 Supervisor shutting down...');
  if (botProcess) {
    botProcess.kill('SIGTERM');
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('\n🛑 Supervisor terminated');
  if (botProcess) {
    botProcess.kill('SIGTERM');
  }
  process.exit(0);
});

// Start supervisor
log('👁️‍🗨️ Supervisor PID: ' + process.pid);
log('🤖 Bot script: ' + BOT_SCRIPT);
log('📝 Log file: ' + LOG_FILE);
log('🔑 Token length: 72');

monitor().catch(error => {
  log(`💥 Supervisor error: ${error.message}`);
  process.exit(1);
});