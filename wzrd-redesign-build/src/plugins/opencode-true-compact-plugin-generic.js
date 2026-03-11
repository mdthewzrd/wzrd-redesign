#!/usr/bin/env node
/**
 * OpenCode True Compact Plugin (Generic Version)
 * Automatically resets chat after compaction like Claude
 * 
 * This plugin:
 * 1. Listens for /compact command
 * 2. Automatically triggers /new 
 * 3. Injects continuation prompt
 * 4. Works inside OpenCode TUI
 */

import { definePlugin } from '@opencode-ai/plugin';

// Plugin configuration
const config = {
  name: 'opencode-true-compact',
  version: '0.1.0',
  description: 'Automatically resets chat after compaction like Claude',
  
  hooks: {
    // Called when TUI command is executed
    onTuiCommand: async (command, context) => {
      console.log(`[true-compact] Command detected: ${command}`);
      
      if (command === '/compact') {
        console.log('[true-compact] Compact detected, scheduling reset...');
        
        // Schedule reset after brief delay (let compaction finish)
        setTimeout(async () => {
          try {
            console.log('[true-compact] Triggering /new command...');
            
            // Send /new command to reset session
            await context.tui.command.execute({
              command: 'session.new',
            });
            
            // Wait a moment for new session to initialize
            setTimeout(async () => {
              console.log('[true-compact] Injecting continuation prompt...');
              
              // Generic continuation prompt
              const continuation = `Continue if you have next steps...`;
              
              // Append to prompt
              await context.tui.prompt.append({
                text: continuation,
              });
              
              console.log('[true-compact] Chat reset complete!');
            }, 500);
            
          } catch (error) {
            console.error('[true-compact] Error during reset:', error);
          }
        }, 1000);
      }
    },
    
    // Called when session is compacted (auto-compact)
    onSessionCompacted: async (sessionId, context) => {
      console.log(`[true-compact] Session ${sessionId} compacted`);
      
      // Auto-reset after auto-compact
      setTimeout(async () => {
        try {
          await context.tui.command.execute({
            command: 'session.new',
          });
          
          setTimeout(async () => {
            await context.tui.prompt.append({
              text: 'Auto-compact complete. Continue with your work...',
            });
            
            console.log('[true-compact] Auto-compact reset complete');
          }, 500);
        } catch (error) {
          console.error('[true-compact] Auto-compact reset error:', error);
        }
      }, 1000);
    },
  },
};

// Create the plugin
export default definePlugin(config);

// CLI for testing/installation
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('=== OpenCode True Compact Plugin (Generic) ===');
  console.log('');
  console.log('This plugin requires OpenCode plugin system.');
  console.log('');
  console.log('Installation steps:');
  console.log('1. Create plugin directory:');
  console.log('   mkdir -p ~/.config/opencode/plugins/opencode-true-compact');
  console.log('');
  console.log('2. Copy this file:');
  console.log('   cp opencode-true-compact-plugin-generic.js ~/.config/opencode/plugins/opencode-true-compact/index.js');
  console.log('');
  console.log('3. Add to OpenCode config (~/.config/opencode/opencode.jsonc):');
  console.log('   {');
  console.log('     "plugin": [');
  console.log('       "@tarquinen/opencode-dcp@latest",');
  console.log('       "./plugins/opencode-true-compact"');
  console.log('     ]');
  console.log('   }');
  console.log('');
  console.log('4. Restart OpenCode');
  console.log('');
  console.log('Plugin will:');
  console.log('• Auto-reset chat after /compact command');
  console.log('• Auto-reset after auto-compact');
  console.log('• Inject continuation prompts');
  console.log('• Work independently of any ecosystem');
  console.log('');
  console.log('Note: Pure OpenCode plugin, no external dependencies.');
}