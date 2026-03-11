#!/bin/bash

# WZRD.dev Finished Work Validator
# Determines if work in a worktree is "finished" and ready for migration

set -e

WZRD_ROOT="/home/mdwzrd/wzrd-redesign"
WORKTREE_BASE="$WZRD_ROOT/.worktrees"
VALIDATION_LOG="$WZRD_ROOT/logs/finished-work-$(date +%Y%m%d-%H%M%S).log"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[VALIDATOR]${NC} $1" | tee -a "$VALIDATION_LOG"
}

success() {
    echo -e "${GREEN}[PASS]${NC} $1" | tee -a "$VALIDATION_LOG"
}

warning() {
    echo -e "${YELLOW}[WARN]${NC} $1" | tee -a "$VALIDATION_LOG"
}

error() {
    echo -e "${RED}[FAIL]${NC} $1" | tee -a "$VALIDATION_LOG"
}

mkdir -p "$WZRD_ROOT/logs"

# Main validation function
check_if_finished() {
    local worktree="${1:-.}"
    local score=0
    local max_score=100
    local criteria_met=0
    local total_criteria=10
    
    log "Checking if work is finished in: $worktree"
    log "=========================================="
    
    # Criterion 1: Git status - are changes committed?
    log "1. Checking git status..."
    if [ -d "$worktree/.git" ]; then
        cd "$worktree"
        local uncommitted=$(git status --porcelain 2>/dev/null | wc -l)
        local staged=$(git diff --cached --name-only 2>/dev/null | wc -l)
        
        if [ "$uncommitted" -eq 0 ]; then
            success "No uncommitted changes"
            score=$((score + 10))
            criteria_met=$((criteria_met + 1))
        elif [ "$staged" -gt 0 ] && [ "$uncommitted" -eq "$staged" ]; then
            success "All changes staged and ready"
            score=$((score + 8))
            criteria_met=$((criteria_met + 1))
        else
            warning "Has $uncommitted uncommitted change(s)"
            score=$((score + 3))
        fi
    else
        error "Not a git repository"
    fi
    
    # Criterion 2: Tests exist and pass (if applicable)
    log "2. Checking tests..."
    local has_tests=false
    if [ -f "$worktree/package.json" ]; then
        if grep -q '"test"' "$worktree/package.json" 2>/dev/null; then
            has_tests=true
            if [ -d "$worktree/node_modules" ]; then
                # Check if tests pass
                log "  Running tests..."
                if npm test 2>/dev/null | grep -q "pass\|success"; then
                    success "Tests passing"
                    score=$((score + 10))
                    criteria_met=$((criteria_met + 1))
                else
                    warning "Tests exist but may have failures"
                    score=$((score + 5))
                fi
            else
                warning "Tests defined but node_modules not installed"
                score=$((score + 5))
            fi
        fi
    elif [ -f "$worktree/requirements.txt" ] || [ -f "$worktree/pyproject.toml" ]; then
        if [ -d "$worktree/tests" ] || [ -d "$worktree/test" ]; then
            has_tests=true
            success "Python tests exist"
            score=$((score + 8))
            criteria_met=$((criteria_met + 1))
        fi
    fi
    
    if [ "$has_tests" = false ]; then
        warning "No tests found"
        score=$((score + 2))
    fi
    
    # Criterion 3: Documentation exists
    log "3. Checking documentation..."
    if [ -f "$worktree/README.md" ]; then
        local readme_size=$(wc -c < "$worktree/README.md")
        if [ "$readme_size" -gt 1000 ]; then
            success "Comprehensive README"
            score=$((score + 10))
            criteria_met=$((criteria_met + 1))
        else
            success "Basic README exists"
            score=$((score + 7))
            criteria_met=$((criteria_met + 1))
        fi
    else
        warning "No README found"
    fi
    
    # Criterion 4: No TODO/FIXME markers in critical files
    log "4. Checking for TODOs..."
    local todos=$(grep -r "TODO\|FIXME\|XXX\|HACK" "$worktree" --include="*.js" --include="*.ts" --include="*.py" --include="*.sh" --include="*.md" 2>/dev/null | wc -l || echo "0")
    if [ "$todos" -eq 0 ]; then
        success "No TODO/FIXME markers"
        score=$((score + 10))
        criteria_met=$((criteria_met + 1))
    elif [ "$todos" -lt 5 ]; then
        warning "Found $todos TODO/FIXME markers"
        score=$((score + 5))
        criteria_met=$((criteria_met + 1))
    else
        warning "Found $todos TODO/FIXME markers"
        score=$((score + 2))
    fi
    
    # Criterion 5: Project structure is complete
    log "5. Checking project structure..."
    local structure_score=0
    [ -f "$worktree/README.md" ] && structure_score=$((structure_score + 1))
    [ -d "$worktree/src" ] || [ -d "$worktree/lib" ] || [ -d "$worktree/app" ] && structure_score=$((structure_score + 1))
    [ -f "$worktree/.gitignore" ] && structure_score=$((structure_score + 1))
    
    if [ "$structure_score" -eq 3 ]; then
        success "Complete project structure"
        score=$((score + 10))
        criteria_met=$((criteria_met + 1))
    elif [ "$structure_score" -eq 2 ]; then
        success "Mostly complete structure"
        score=$((score + 7))
        criteria_met=$((criteria_met + 1))
    else
        warning "Incomplete structure"
        score=$((score + 3))
    fi
    
    # Criterion 6: No obvious errors or broken references
    log "6. Checking for obvious errors..."
    local errors=0
    
    # Check for syntax errors in common files
    if [ -f "$worktree/package.json" ]; then
        if ! python3 -c "import json; json.load(open('$worktree/package.json'))" 2>/dev/null; then
            errors=$((errors + 1))
        fi
    fi
    
    if [ "$errors" -eq 0 ]; then
        success "No obvious syntax errors"
        score=$((score + 10))
        criteria_met=$((criteria_met + 1))
    else
        error "Found $errors syntax errors"
        score=$((score + 2))
    fi
    
    # Criterion 7: Recent activity (not stale)
    log "7. Checking activity freshness..."
    if [ -d "$worktree/.git" ]; then
        cd "$worktree"
        local last_commit=$(git log -1 --format=%ct 2>/dev/null || echo "0")
        local now=$(date +%s)
        local days_since=$(( (now - last_commit) / 86400 ))
        
        if [ "$days_since" -lt 1 ]; then
            success "Recent activity (today)"
            score=$((score + 10))
            criteria_met=$((criteria_met + 1))
        elif [ "$days_since" -lt 7 ]; then
            success "Activity within last week"
            score=$((score + 8))
            criteria_met=$((criteria_met + 1))
        else
            warning "Last activity $days_since days ago"
            score=$((score + 5))
        fi
    fi
    
    # Criterion 8: No oversized files
    log "8. Checking file sizes..."
    local large_files=$(find "$worktree" -type f -size +50M 2>/dev/null | wc -l || echo "0")
    if [ "$large_files" -eq 0 ]; then
        success "No oversized files"
        score=$((score + 10))
        criteria_met=$((criteria_met + 1))
    else
        warning "Found $large_files large files"
        score=$((score + 3))
    fi
    
    # Criterion 9: No dependency issues (if applicable)
    log "9. Checking dependencies..."
    if [ -f "$worktree/package.json" ] && [ -f "$worktree/package-lock.json" ]; then
        success "Dependencies locked"
        score=$((score + 10))
        criteria_met=$((criteria_met + 1))
    elif [ -f "$worktree/requirements.txt" ] || [ -f "$worktree/Pipfile" ]; then
        success "Python dependencies defined"
        score=$((score + 8))
        criteria_met=$((criteria_met + 1))
    else
        log "  No dependency management detected (neutral)"
        score=$((score + 5))
    fi
    
    # Criterion 10: User confirmation or completion markers
    log "10. Checking for completion markers..."
    local completed=false
    if [ -f "$worktree/.finished" ] || [ -f "$worktree/COMPLETE" ] || [ -f "$worktree/.complete" ]; then
        success "Completion marker found"
        score=$((score + 10))
        criteria_met=$((criteria_met + 1))
        completed=true
    elif [ -f "$worktree/topics"/*/status ] 2>/dev/null; then
        local status=$(cat "$worktree/topics"/*/status 2>/dev/null | grep -c "completed" || echo "0")
        if [ "$status" -gt 0 ]; then
            success "Topic marked as completed"
            score=$((score + 10))
            criteria_met=$((criteria_met + 1))
            completed=true
        fi
    else
        log "  No explicit completion marker"
        score=$((score + 5))
    fi
    
    # Calculate final result
    log "=========================================="
    log "FINISHED WORK VALIDATION RESULT"
    log "=========================================="
    log "Score: $score/$max_score ($((score * 100 / max_score))%)"
    log "Criteria Met: $criteria_met/$total_criteria"
    
    # Determine status
    if [ $score -ge 80 ] && [ $criteria_met -ge 7 ]; then
        echo ""
        success "✓✓✓ WORK IS FINISHED ✓✓✓"
        echo ""
        echo "This work appears complete and ready for migration."
        echo "Run: ./conductor/auto-migration-system.sh migrate"
        return 0
    elif [ $score -ge 60 ] && [ $criteria_met -ge 5 ]; then
        echo ""
        warning "⚠ WORK IS MOSTLY FINISHED ⚠"
        echo ""
        echo "This work is close to complete but has some minor issues."
        echo "Review warnings above before migrating."
        return 1
    else
        echo ""
        error "✗ WORK IS NOT FINISHED ✗"
        echo ""
        echo "This work needs more attention before migration."
        echo "Address the failed criteria above."
        return 2
    fi
}

# Run validation
check_if_finished "${1:-.}"
