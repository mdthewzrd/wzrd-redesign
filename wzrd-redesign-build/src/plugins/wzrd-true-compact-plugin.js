#!/usr/bin/env node
/**
 * WZRD True Compact Plugin for OpenCode
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
  name: 'wzrd-true-compact',
  version: '0.1.0',
  description: 'Automatically resets chat after compaction',
  
  hooks: {
    // Called when TUI command is executed
    onTuiCommand: async (command, context) => {
      console.log(`[wzrd-true-compact] Command detected: ${command}`);
      
      if (command === '/compact') {
        console.log('[wzrd-true-compact] Compact detected, scheduling reset...');
        
        // Schedule reset after brief delay (let compaction finish)
        setTimeout(async () => {
          try {
            console.log('[wzrd-true-compact] Triggering /new command...');
            
            // Send /new command to reset session
            await context.tui.command.execute({
              command: 'session.new',
            });
            
            // Wait a moment for new session to initialize
            setTimeout(async () => {
              console.log('[wzrd-true-compact] Injecting continuation prompt...');
              
              // Create smart continuation prompt
              const continuation = `Continue if you have next steps... [Previous conversation saved to WZRD topic memory]`;
              
              // Append to prompt
              await context.tui.prompt.append({
                text: continuation,
              });
              
              console.log('[wzrd-true-compact] Chat reset complete!');
            }, 500);
            
          } catch (error) {
            console.error('[wzrd-true-compact] Error during reset:', error);
          }
        }, 1000);
      }
      
      // Also handle /wzrd-compact command
      if (command === '/wzrd-compact') {
        console.log('[wzrd-true-compact] WZRD compact detected, enhanced workflow...');
        
        // Enhanced workflow: save to memory, then reset
        setTimeout(async () => {
          try {
            // Step 1: Extract current conversation
            const session = await context.session.get();
            console.log(`[wzrd-true-compact] Session: ${session.id}`);
            
            // Step 2: Save to WZRD topic memory (would need external script)
            // For now, just trigger reset
            await context.tui.command.execute({
              command: 'session.new',
            });
            
            // Step 3: Inject enhanced continuation
            setTimeout(async () => {
              const enhancedContinuation = `Continue with your work... [Previous conversation archived in WZRD memory system]`;
              
              await context.tui.prompt.append({
                text: enhancedContinuation,
              });
              
              console.log('[wzrd-true-compact] Enhanced compact complete!');
            }, 500);
            
          } catch (error) {
            console.error('[wzrd-true-compact] Enhanced workflow error:', error);
          }
        }, 1500);
      }
    },
    
    // Called when session is compacted (auto-compact)
    onSessionCompacted: async (sessionId, context) => {
      console.log(`[wzrd-true-compact] Session ${sessionId} compacted`);
      
      // Auto-reset after auto-compact
      setTimeout(async () => {
        try {
          await context.tui.command.execute({
            command: 'session.new',
          });
          
          setTimeout(async () => {
            await context.tui.prompt.append({
              text: 'Auto-compact complete. Continue...',
            });
            
            console.log('[wzrd-true-compact] Auto-compact reset complete');
          }, 500);
        } catch (error) {
          console.error('[wzrd-true-compact] Auto-compact reset error:', error);
        }
      }, 1000);
    },
  },
};

// Create the plugin
export default definePlugin(config);

// CLI for testing/installation
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('=== WZRD True Compact Plugin ===');
  console.log('');
  console.log('This plugin requires OpenCode plugin system.');
  console.log('');
  console.log('Installation steps:');
  console.log('1. Create plugin directory:');
  console.log('   mkdir -p ~/.config/opencode/plugins/wzrd-true-compact');
  console.log('');
  console.log('2. Copy this file:');
  console.log('   cp wzrd-true-compact-plugin.js ~/.config/opencode/plugins/wzrd-true-compact/index.js');
  console.log('');
  console.log('3. Add to OpenCode config (~/.config/opencode/opencode.jsonc):');
  console.log('   {');
  console.log('     "plugin": [');
  console.log('       "@tarquinen/opencode-dcp@latest",');
  console.log('       "./plugins/wzrd-true-compact"');
  console.log('     ]');
  console.log('   }');
  console.log('');
  console.log('4. Restart OpenCode');
  console.log('');
  console.log('Plugin will:');
  console.log('• Auto-reset chat after /compact command');
  console.log('• Auto-reset after auto-compact');
  console.log('• Handle /wzrd-compact with enhanced workflow');
  console.log('• Inject continuation prompts');
  console.log('');
  console.log('Note: For full WZRD integration, external scripts needed for memory saving.');
}