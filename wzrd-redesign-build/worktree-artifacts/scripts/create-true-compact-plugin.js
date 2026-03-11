#!/usr/bin/env node
/**
 * OpenCode True Compact Plugin
 * Automatically runs /new after /compact to reset chat like Claude
 */

const { OpenCode } = require('@opencode-ai/sdk');

// Configuration
const config = {
  enabled: true,
  debug: false,
  autoReset: true, // Automatically run /new after /compact
  resetDelay: 1000, // Delay in ms before reset
  continuationPrompt: "Continue if you have next steps...", // Prompt to add after reset
};

// Track compact events
let compactTriggered = false;
let resetScheduled = false;

async function createTrueCompactPlugin() {
  console.log('=== OpenCode True Compact Plugin ===');
  console.log('Goal: Automatically reset chat after compaction like Claude');
  console.log('Config:', config);
  console.log('');
  
  // Check if we can access OpenCode SDK
  try {
    // Initialize SDK (if available)
    const sdk = new OpenCode({
      baseURL: 'http://localhost:3000',
      // Note: This may require authentication
    });
    
    console.log('✅ OpenCode SDK available');
    console.log('Note: Plugin would need to be loaded by OpenCode');
    
    return {
      name: 'true-compact-plugin',
      version: '0.1.0',
      description: 'Automatically resets chat after compaction',
      hooks: {
        onSessionCompacted: async (sessionId) => {
          if (config.autoReset && !resetScheduled) {
            console.log(`Session ${sessionId} compacted, scheduling reset...`);
            resetScheduled = true;
            
            // Schedule reset
            setTimeout(async () => {
              try {
                console.log(`Resetting session ${sessionId}...`);
                
                // Send session.new command
                await sdk.tui.command.execute({
                  command: 'session.new',
                });
                
                // Add continuation prompt
                setTimeout(() => {
                  sdk.tui.prompt.append({
                    text: config.continuationPrompt,
                  });
                  console.log('✅ Chat reset complete with continuation prompt');
                }, 500);
                
              } catch (error) {
                console.error('❌ Failed to reset session:', error);
              } finally {
                resetScheduled = false;
              }
            }, config.resetDelay);
          }
        },
        
        onTuiCommand: async (command) => {
          if (command === '/compact') {
            compactTriggered = true;
            console.log('Compact command detected');
          }
        },
      },
    };
    
  } catch (error) {
    console.log('⚠ OpenCode SDK not available');
    console.log('Alternative approach needed');
    
    return {
      name: 'true-compact-plugin',
      version: '0.1.0',
      description: 'Automatically resets chat after compaction',
      manualInstructions: `
      Since SDK access is limited, here's an alternative approach:
      
      1. **Monitor prompt-history.jsonl**:
         - Watch ~/.local/state/opencode/prompt-history.jsonl
         - When size grows beyond threshold (e.g., 20KB)
      
      2. **Trigger automation**:
         - Save current conversation to topic memory
         - Send keyboard shortcuts programmatically
         - Or create wrapper script that:
           a. Kills OpenCode
           b. Clears prompt-history.jsonl
           c. Restarts OpenCode with continuation
      
      3. **Integration options**:
         a. External watchdog script
         b. Modified wzrd-compact-workflow.sh
         c. Custom OpenCode plugin if API available
      `,
    };
  }
}

// Plugin implementation alternatives
function createExternalAutomationScript() {
  return `#!/bin/bash
# OpenCode True Compact Automation Script
# External solution that monitors and resets chat

HISTORY_FILE="\$HOME/.local/state/opencode/prompt-history.jsonl"
THRESHOLD_KB=20  # 20KB threshold
CONTINUATION="Continue if you have next steps..."

# Function to check file size
check_size() {
    size_kb=\$(stat -c%s "\$HISTORY_FILE" 2>/dev/null)
    size_kb=\$((size_kb / 1024))
    echo "\$size_kb"
}

# Function to save conversation
save_conversation() {
    timestamp=\$(date +%Y%m%d_%H%M%S)
    backup_file="\$HOME/.opencode/backups/compact-\$timestamp.jsonl"
    mkdir -p "\$(dirname "\$backup_file")"
    cp "\$HISTORY_FILE" "\$backup_file"
    echo "Conversation saved to: \$backup_file"
}

# Function to reset chat
reset_chat() {
    echo "Resetting OpenCode chat..."
    
    # 1. Save conversation
    save_conversation
    
    # 2. Kill OpenCode (if running)
    pkill -f "opencode.*--agent remi" 2>/dev/null
    sleep 1
    
    # 3. Clear history file
    echo "[]" > "\$HISTORY_FILE"
    
    # 4. Restart OpenCode with continuation
    # This requires user interaction
    echo ""
    echo "=== MANUAL STEPS REQUIRED ==="
    echo "1. Start OpenCode:"
    echo "   opencode --model nvidia/z-ai/glm4.7 --agent remi"
    echo ""
    echo "2. Type the continuation:"
    echo "   \$CONTINUATION"
    echo ""
    echo "Note: Full automation requires OpenCode API access"
}

# Main monitoring loop
main() {
    echo "OpenCode True Compact Monitor"
    echo "Monitoring: \$HISTORY_FILE"
    echo "Threshold: \$THRESHOLD_KB KB"
    echo ""
    
    while true; do
        size_kb=\$(check_size)
        if [ "\$size_kb" -ge "\$THRESHOLD_KB" ]; then
            echo "Threshold reached: \$size_kb KB"
            reset_chat
            break
        fi
        sleep 60  # Check every minute
    done
}

# Run if called directly
if [[ "\${BASH_SOURCE[0]}" == "\${0}" ]]; then
    main
fi
`;
}

// Main execution
if (require.main === module) {
  console.log('=== OpenCode True Compact Plugin Generator ===');
  console.log('');
  
  const plugin = createTrueCompactPlugin();
  console.log('Plugin structure:', JSON.stringify(plugin, null, 2));
  
  console.log('');
  console.log('=== Alternative: External Automation Script ===');
  console.log(createExternalAutomationScript());
  
  console.log('');
  console.log('=== Recommendations ===');
  console.log('1. Test if OpenCode SDK events are accessible');
  console.log('2. Try monitoring prompt-history.jsonl size');
  console.log('3. Consider modifying wzrd-compact-workflow.sh');
  console.log('4. Look for existing plugins that modify TUI behavior');
  console.log('5. Check OpenCode extension API documentation');
}