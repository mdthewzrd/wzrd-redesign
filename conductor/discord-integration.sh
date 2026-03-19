#!/bin/bash
# WZRD.dev Day 4: Discord Integration
# Wires Discord bot to WZRD framework

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_FILE="${SCRIPT_DIR}/logs/discord-integration-$(date +%Y%m%d-%H%M%S).log"

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js not found. Install with: sudo apt install nodejs"
        return 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm not found. Install with: sudo apt install npm"
        return 1
    fi
    
    # Check Discord bot files
    if [ ! -f "${SCRIPT_DIR}/../interfaces/discord-bot.js" ]; then
        log_error "Discord bot not found at ${SCRIPT_DIR}/../interfaces/discord-bot.js"
        return 1
    fi
    
    if [ ! -f "${SCRIPT_DIR}/../interfaces/discord-config.yaml" ]; then
        log_error "Discord config not found at ${SCRIPT_DIR}/../interfaces/discord-config.yaml"
        return 1
    fi
    
    # Check dependencies
    if [ ! -d "${SCRIPT_DIR}/../interfaces/node_modules" ]; then
        log_warning "Node dependencies not installed. Installing..."
        cd "${SCRIPT_DIR}/../interfaces" && npm install discord.js js-yaml
        if [ $? -ne 0 ]; then
            log_error "Failed to install dependencies"
            return 1
        fi
    fi
    
    log_success "Prerequisites satisfied"
    return 0
}

# Start Discord bot
start_discord_bot() {
    log_info "Starting Discord bot..."
    
    cd "${SCRIPT_DIR}/../interfaces"
    
    # Check if bot token is set
    if grep -q "bot_token: \"\"" discord-config.yaml || grep -q "bot_token: \"TEST_MODE\"" discord-config.yaml; then
        log_warning "Bot token not configured in discord-config.yaml"
        log_warning "Please add your Discord bot token to proceed"
        return 1
    fi
    
    # Start bot in background
    node discord-bot.js > "${SCRIPT_DIR}/logs/discord-bot-$(date +%Y%m%d-%H%M%S).log" 2>&1 &
    BOT_PID=$!
    
    echo $BOT_PID > "${SCRIPT_DIR}/discord-bot.pid"
    log_success "Discord bot started with PID $BOT_PID"
    
    # Wait a moment for bot to initialize
    sleep 3
    
    # Check if bot is running
    if kill -0 $BOT_PID 2>/dev/null; then
        log_success "Discord bot is running"
        return 0
    else
        log_error "Discord bot failed to start"
        return 1
    fi
}

# Create Discord message handler that creates jobs
setup_discord_job_creation() {
    log_info "Setting up Discord → Job integration..."
    
    # This would require modifying discord-bot.js to call our database
    # For now, create a wrapper script that monitors Discord logs
    
    cat > "${SCRIPT_DIR}/discord-job-bridge.sh" << 'EOF'
#!/bin/bash
# Bridge between Discord logs and WZRD job creation

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_FILE="${SCRIPT_DIR}/logs/discord-job-bridge.log"

# Monitor Discord log for new messages
tail -f "${SCRIPT_DIR}/../logs/discord.log" | while read line; do
    # Look for message patterns
    if echo "$line" | grep -q "Received message:"; then
        # Extract channel and message
        CHANNEL=$(echo "$line" | sed -n 's/.*channel: \([^,]*\).*/\1/p')
        MESSAGE=$(echo "$line" | sed -n 's/.*content: "\([^"]*\)".*/\1/p')
        
        if [ -n "$CHANNEL" ] && [ -n "$MESSAGE" ]; then
            echo "$(date): Processing Discord message from $CHANNEL: $MESSAGE" >> "$LOG_FILE"
            
            # Create job for non-command messages (not starting with !)
            if [[ ! "$MESSAGE" =~ ^! ]]; then
                TOPIC="discord-$CHANNEL: $MESSAGE"
                JOB_ID=$(python3 "${SCRIPT_DIR}/lib/db.py" save-job "$TOPIC" "discord-blueprint")
                echo "$(date): Created job $JOB_ID for Discord message" >> "$LOG_FILE"
                
                # Trigger blueprint
                "${SCRIPT_DIR}/blueprint-engine.sh" execute "$JOB_ID" "$TOPIC" "discord-$CHANNEL" &
            fi
        fi
    fi
done
EOF
    
    chmod +x "${SCRIPT_DIR}/discord-job-bridge.sh"
    log_success "Created Discord job bridge script"
}

# Main function
main() {
    log_info "=========================================="
    log_info "WZRD.dev Day 4: Discord Integration"
    log_info "=========================================="
    echo ""
    
    # Create logs directory
    mkdir -p "${SCRIPT_DIR}/logs"
    
    # Check prerequisites
    if ! check_prerequisites; then
        log_error "Prerequisites failed, cannot continue"
        return 1
    fi
    
    # Setup Discord job creation
    setup_discord_job_creation
    
    # Start Discord bot
    if start_discord_bot; then
        log_success "Discord integration complete!"
        echo ""
        echo "Next steps:"
        echo "1. Discord bot is running (PID saved to discord-bot.pid)"
        echo "2. Discord → Job bridge script created: discord-job-bridge.sh"
        echo "3. Messages in Discord will create jobs in database"
        echo ""
        echo "To start the job bridge:"
        echo "  ./discord-job-bridge.sh &"
        echo ""
        echo "To stop everything:"
        echo "  ./discord-integration.sh stop"
    else
        log_error "Failed to start Discord bot"
        return 1
    fi
}

# Stop function
stop() {
    log_info "Stopping Discord integration..."
    
    if [ -f "${SCRIPT_DIR}/discord-bot.pid" ]; then
        BOT_PID=$(cat "${SCRIPT_DIR}/discord-bot.pid")
        if kill -0 $BOT_PID 2>/dev/null; then
            kill $BOT_PID
            log_success "Stopped Discord bot (PID $BOT_PID)"
        else
            log_warning "Discord bot not running"
        fi
        rm -f "${SCRIPT_DIR}/discord-bot.pid"
    fi
    
    # Kill job bridge if running
    pkill -f "discord-job-bridge.sh" 2>/dev/null && log_success "Stopped job bridge"
    
    log_success "Discord integration stopped"
}

# Handle arguments
case "$1" in
    "start")
        main
        ;;
    "stop")
        stop
        ;;
    *)
        echo "Usage: $0 {start|stop}"
        echo ""
        echo "Commands:"
        echo "  start  - Start Discord integration"
        echo "  stop   - Stop Discord integration"
        echo ""
        echo "Day 4 of WZRD.dev 14-day sprint:"
        echo "Wires Discord bot to framework, creating jobs from messages"
        exit 1
        ;;
esac