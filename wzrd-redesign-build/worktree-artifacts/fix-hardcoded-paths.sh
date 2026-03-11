#!/bin/bash

# Script to fix hardcoded paths in test scripts
# Changes /home/mdwzrd/wzrd-redesign/ to current directory

echo "Fixing hardcoded paths in test scripts..."

# Fix test-phase1.sh
echo "Fixing test-phase1.sh..."
sed -i 's|/home/mdwzrd/wzrd-redesign/||g' test-phase1.sh

# Fix test-phase2.sh if it exists
if [ -f "test-phase2.sh" ]; then
    echo "Fixing test-phase2.sh..."
    sed -i 's|/home/mdwzrd/wzrd-redesign/||g' test-phase2.sh
fi

# Fix any other test scripts
for script in test-*.sh; do
    if [ "$script" != "fix-hardcoded-paths.sh" ]; then
        echo "Checking $script..."
        if grep -q "/home/mdwzrd/wzrd-redesign/" "$script"; then
            echo "  Fixing $script..."
            sed -i 's|/home/mdwzrd/wzrd-redesign/||g' "$script"
        fi
    fi
done

# Fix wzrd-mode CLI wrapper if it exists
if [ -f "wzrd-mode" ]; then
    echo "Checking wzrd-mode..."
    if grep -q "/home/mdwzrd/wzrd-redesign/" "wzrd-mode"; then
        echo "  Fixing wzrd-mode..."
        sed -i 's|/home/mdwzrd/wzrd-redesign/||g' "wzrd-mode"
    fi
fi

echo ""
echo "Verifying fixes..."
echo "Hardcoded paths remaining:"
grep -r "/home/mdwzrd/wzrd-redesign/" . --include="*.sh" --include="wzrd-mode" 2>/dev/null || echo "None found!"

echo ""
echo "Path fixing complete!"