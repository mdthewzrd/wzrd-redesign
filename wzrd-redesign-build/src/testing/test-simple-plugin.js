#!/usr/bin/env node
/**
 * Simple test plugin for OpenCode
 * Just logs when loaded and when commands are executed
 */

import { definePlugin } from '@opencode-ai/plugin';

const config = {
  name: 'test-simple-plugin',
  version: '0.1.0',
  description: 'Simple test plugin',
  
  hooks: {
    // Called when plugin is loaded
    onLoad: async (context) => {
      console.log('[TEST PLUGIN] Plugin loaded successfully!');
      console.log(`[TEST PLUGIN] Context:`, Object.keys(context));
      return true;
    },
    
    // Called when TUI command is executed
    onTuiCommand: async (command, context) => {
      console.log(`[TEST PLUGIN] Command detected: "${command}"`);
      
      // Special handling for /compact
      if (command === '/compact') {
        console.log('[TEST PLUGIN] /compact detected - doing nothing yet');
        
        // Let's see what context we have
        console.log(`[TEST PLUGIN] Context keys:`, Object.keys(context));
        if (context.tui) {
          console.log(`[TEST PLUGIN] TUI available`);
          console.log(`[TEST PLUGIN] TUI methods:`, Object.keys(context.tui));
        }
      }
      
      // Also test /test-command
      if (command === '/test-plugin') {
        console.log('[TEST PLUGIN] Test command received!');
        
        // Try to send a message to TUI
        if (context.tui && context.tui.prompt && context.tui.prompt.append) {
          try {
            await context.tui.prompt.append({
              text: '[TEST PLUGIN] Test command executed successfully!',
            });
            console.log('[TEST PLUGIN] Message appended');
          } catch (error) {
            console.error('[TEST PLUGIN] Error appending:', error);
          }
        } else {
          console.log('[TEST PLUGIN] TUI prompt.append not available');
        }
      }
    },
    
    // Called when session is compacted
    onSessionCompacted: async (sessionId, context) => {
      console.log(`[TEST PLUGIN] Session ${sessionId} compacted`);
    },
  },
};

export default definePlugin(config);

// CLI for testing
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('=== Test Simple Plugin ===');
  console.log('This is a test plugin for debugging OpenCode plugin system.');
}