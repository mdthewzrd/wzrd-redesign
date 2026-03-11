#!/usr/bin/env node
/**
 * Test template replacement to debug "repo_path is not defined"
 */

const fs = require('fs');
const path = require('path');

// Read the actual Python template from unified-memory.js
const unifiedMemoryContent = fs.readFileSync('memory/unified-memory.js', 'utf8');

// Extract the pythonScriptTemplate
const templateMatch = unifiedMemoryContent.match(/const pythonScriptTemplate = `([\s\S]*?)`;/);
if (!templateMatch) {
    console.error('Could not find pythonScriptTemplate');
    process.exit(1);
}

const pythonScriptTemplate = templateMatch[1];
console.log('Python template (first 500 chars):');
console.log(pythonScriptTemplate.substring(0, 500));
console.log('...\\n');

// Test the replacement
const query = 'cost tracker';
const repoPath = process.cwd();

console.log(`Query: "${query}"`);
console.log(`Repo path: "${repoPath}"\\n`);

// Try the replacement
const pythonScript = pythonScriptTemplate
    .replace(/"\\$\\{query\\}"/g, JSON.stringify(query))
    .replace(/"\\$\\{repo_path\\}"/g, JSON.stringify(repoPath));

console.log('After replacement (first 500 chars):');
console.log(pythonScript.substring(0, 500));
console.log('...\\n');

// Check if the replacement worked
const hasQueryPlaceholder = pythonScript.includes('"${query}"');
const hasRepoPathPlaceholder = pythonScript.includes('"${repo_path}"');

console.log(`Has query placeholder after replace: ${hasQueryPlaceholder}`);
console.log(`Has repo_path placeholder after replace: ${hasRepoPathPlaceholder}`);

// Write to file and test execution
const tempFile = '/tmp/test_python_template.py';
fs.writeFileSync(tempFile, pythonScript);

console.log(`\\nWrote to ${tempFile}`);
console.log('Checking file...');
const fileContent = fs.readFileSync(tempFile, 'utf8');
console.log(`File size: ${fileContent.length} bytes`);

// Check for syntax errors
console.log('\\nChecking for Python syntax errors...');
const { execSync } = require('child_process');
try {
    const syntaxCheck = execSync(`python3 -m py_compile ${tempFile}`, { 
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
    });
    console.log('✅ Python syntax check passed');
} catch (error) {
    console.log('❌ Python syntax error:');
    console.log(error.stderr || error.message);
}

// Look at the actual line with repo_path
console.log('\\nSearching for repo_path in generated code...');
const lines = pythonScript.split('\\n');
lines.forEach((line, index) => {
    if (line.includes('repo_path')) {
        console.log(`Line ${index + 1}: ${line.trim()}`);
    }
});