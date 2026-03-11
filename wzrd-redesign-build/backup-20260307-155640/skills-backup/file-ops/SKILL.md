---
name: file-ops
description: File operations - reading, writing, searching, and managing files
category: file-operations
priority: P0
tags: [files, io, filesystem, directories]
subskills:
  - file-reading
  - file-writing
  - directory-operations
  - file-search
  - file-metadata
---

# File Operations Skill

## Purpose
Efficiently read, write, search, and manage files and directories across different contexts.

## Core Principle
**"Files are the interface between data and code. Handle them carefully, verify thoroughly."**

## Reading Files

### Python
```python
# Read entire file
with open('file.txt', 'r') as f:
    content = f.read()

# Read line by line
with open('file.txt', 'r') as f:
    for line in f:
        line = line.strip()  # Remove newline
        print(line)

# Read all lines into list
with open('file.txt', 'r') as f:
    lines = f.readlines()

# Read with encoding
with open('file.txt', 'r', encoding='utf-8') as f:
    content = f.read()

# Read specific line
with open('file.txt', 'r') as f:
    line = next(islice(f, 9, None))  # 10th line (0-indexed)

# Read JSON
import json
with open('data.json', 'r') as f:
    data = json.load(f)

# Read CSV
import csv
with open('data.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(row['column'])

# Read with pandas
import pandas as pd
df = pd.read_csv('data.csv')
df = pd.read_json('data.json')
df = pd.read_excel('data.xlsx')
```

### Node.js
```javascript
const fs = require('fs').promises;

// Read entire file
const content = await fs.readFile('file.txt', 'utf-8');

// Read as buffer (binary)
const buffer = await fs.readFile('file.png');

// Read JSON
const data = JSON.parse(await fs.readFile('data.json', 'utf-8'));

// Read line by line
const readline = require('readline');
const fileStream = fs.createReadStream('file.txt');

const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity
});

for await (const line of rl) {
  console.log(line);
}
```

### Bash
```bash
# Read entire file
cat file.txt

# Read first/last lines
head -n 10 file.txt    # First 10 lines
tail -n 10 file.txt    # Last 10 lines

# Read specific line
sed -n '10p' file.txt  # 10th line

# Read with line numbers
cat -n file.txt

# Search in file
grep "pattern" file.txt
grep -n "pattern" file.txt  # With line numbers
```

## Writing Files

### Python
```python
# Write text
with open('output.txt', 'w') as f:
    f.write('Hello, World!')

# Write multiple lines
with open('output.txt', 'w') as f:
    f.write('Line 1\n')
    f.write('Line 2\n')

# Write list of lines
with open('output.txt', 'w') as f:
    f.writelines(['Line 1\n', 'Line 2\n'])

# Append to file
with open('output.txt', 'a') as f:
    f.write('New content\n')

# Write JSON
import json
with open('data.json', 'w') as f:
    json.dump(data, f, indent=2)

# Write CSV
import csv
with open('data.csv', 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=['name', 'age'])
    writer.writeheader()
    writer.writerow({'name': 'John', 'age': 30})

# With pandas
df.to_csv('output.csv', index=False)
df.to_json('output.json', orient='records', indent=2)
```

### Node.js
```javascript
const fs = require('fs').promises;

// Write text
await fs.writeFile('output.txt', 'Hello, World!');

// Write JSON
await fs.writeFile('data.json', JSON.stringify(data, null, 2));

// Append to file
await fs.appendFile('output.txt', 'New content\n');

// Write stream (for large files)
const { createWriteStream } = require('fs');
const stream = createWriteStream('output.txt');
stream.write('Line 1\n');
stream.write('Line 2\n');
stream.end();
```

## Directory Operations

### Python
```python
import os
from pathlib import Path

# Current directory
os.getcwd()
Path.cwd()

# Change directory
os.chdir('/path/to/dir')

# List directory
os.listdir('.')
list(Path('.').iterdir())

# Create directory
os.makedirs('path/to/dir', exist_ok=True)
Path('path/to/dir').mkdir(parents=True, exist_ok=True)

# Remove directory
os.removedirs('path/to/dir')  # Must be empty
Path('path/to/dir').rmdir()

# Check if exists
os.path.exists('path')
Path('path').exists()

# Check if file/directory
os.path.isfile('path')
os.path.isdir('path')
Path('path').is_file()
Path('path').is_dir()

# Walk directory tree
for root, dirs, files in os.walk('path'):
    for file in files:
        filepath = os.path.join(root, file)
        print(filepath)

# With pathlib
for path in Path('path').rglob('*'):
    print(path)

# Get directory info
os.path.getsize('file.txt')    # Size in bytes
os.path.getmtime('file.txt')   # Modification time
os.stat('file.txt')
```

### Node.js
```javascript
const fs = require('fs').promises;
const path = require('path');

// List directory
const files = await fs.readdir('.');

// Create directory
await fs.mkdir('path/to/dir', { recursive: true });

// Remove directory
await fs.rmdir('path/to/dir', { recursive: true });

// Check if exists
await fs.access('path').then(() => true).catch(() => false);

// Get file info
const stats = await fs.stat('file.txt');
console.log(stats.size);      // Size
console.log(stats.mtime);     // Modified time
console.log(stats.isDirectory());

// Walk directory
async function walkDir(dir) {
  const files = await fs.readdir(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    const stats = await fs.stat(filepath);
    if (stats.isDirectory()) {
      await walkDir(filepath);
    } else {
      console.log(filepath);
    }
  }
}
```

### Bash
```bash
# List directory
ls
ls -la              # With details
ls -lh              # Human-readable sizes
tree                # Directory tree

# Create directory
mkdir dir
mkdir -p path/to/dir    # With parents

# Remove directory
rmdir empty_dir     # Must be empty
rm -r dir           # Recursive (careful!)

# Copy files/directories
cp file1 file2
cp -r dir1 dir2     # Recursive

# Move/rename
mv old_name new_name
mv file /path/to/dir/

# Find files
find . -name "*.txt"
find . -type f -name "*.py"
find . -mtime -7        # Modified in last 7 days
find . -size +1M        # Larger than 1MB

# Disk usage
du -sh *               # Size of each item
df -h                  # Disk space
```

## File Search

### Glob Patterns
```python
import glob

# All Python files
python_files = glob.glob('**/*.py', recursive=True)

# All JSON files
json_files = glob.glob('**/*.json', recursive=True)

# Multiple patterns
import pathlib
files = list(pathlib.Path('.').rglob('*.py'))
files = list(pathlib.Path('.').rglob('*.{py,js,ts}'))
```

```javascript
const glob = require('glob');

// All JavaScript files
const files = await glob('**/*.js', { cwd: '.' });

// Multiple patterns
const files = await glob('+(*.js|*.ts)', { cwd: '.' });
```

### Content Search (Grep)
```bash
# Search for pattern
grep "pattern" file.txt

# Search recursively
grep -r "pattern" .

# Case insensitive
grep -i "pattern" file.txt

# With line numbers
grep -n "pattern" file.txt

# Only matching filenames
grep -l "pattern" *.txt

# Invert match
grep -v "pattern" file.txt

# Regex search
grep -E "pattern.*[0-9]+" file.txt

# Context (lines before/after)
grep -B 2 -A 2 "pattern" file.txt
```

```python
import re

# Search in file
with open('file.txt', 'r') as f:
    for line_num, line in enumerate(f, 1):
        if 'pattern' in line:
            print(f"Line {line_num}: {line.strip()}")

# Regex search
pattern = re.compile(r'pattern.*(\d+)')
with open('file.txt', 'r') as f:
    for match in pattern.finditer(f.read()):
        print(match.group())
```

## File Metadata

### Python
```python
import os
from datetime import datetime

# Get stats
stats = os.stat('file.txt')

size = stats.st_size          # Size in bytes
mtime = stats.st_mtime        # Modification time (timestamp)
atime = stats.st_atime        # Access time
ctime = stats.st_ctime        # Creation time (Unix) / metadata change (Unix)

# Convert timestamp to datetime
mtime_dt = datetime.fromtimestamp(mtime)

# File permissions
mode = stats.st_mode
is_readable = bool(mode & 0o444)
is_writable = bool(mode & 0o222)
is_executable = bool(mode & 0o111)

# Get extension
import os.path
ext = os.path.splitext('file.txt')[1]  # '.txt'
filename = os.path.basename('path/to/file.txt')
dirname = os.path.dirname('path/to/file.txt')
```

### Node.js
```javascript
const fs = require('fs').promises;
const path = require('path');

// Get stats
const stats = await fs.stat('file.txt');

console.log(stats.size);      // Size
console.log(stats.mtime);     // Modified time (Date)
console.log(stats.atime);     // Access time
console.log(stats.mode);      // Permissions

// Path parts
path.basename('/path/to/file.txt');  // 'file.txt'
path.dirname('/path/to/file.txt');   // '/path/to'
path.extname('/path/to/file.txt');   // '.txt'
```

## File Operations Patterns

### Safe File Overwrite
```python
import tempfile
import shutil
from pathlib import Path

def safe_write(filepath, content):
    """Write to temp file, then atomic replace"""
    filepath = Path(filepath)

    # Write to temp file
    temp_path = filepath.with_suffix(filepath.suffix + '.tmp')
    temp_path.write_text(content)

    # Atomic replace
    temp_path.replace(filepath)

safe_write('important.txt', 'content')
```

### Batch File Processing
```python
from pathlib import Path

def process_directory(input_dir, output_dir):
    """Process all files in directory"""
    input_path = Path(input_dir)
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    for file in input_path.glob('*.txt'):
        # Read
        content = file.read_text()

        # Process
        processed = content.upper()

        # Write
        output_file = output_path / file.name
        output_file.write_text(processed)
        print(f"✅ Processed {file.name}")

process_directory('input', 'output')
```

### File Watching
```python
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class Handler(FileSystemEventHandler):
    def on_modified(self, event):
        if not event.is_directory:
            print(f"File modified: {event.src_path}")

observer = Observer()
observer.schedule(Handler(), path='.', recursive=True)
observer.start()

try:
    while True:
        pass
except KeyboardInterrupt:
    observer.stop()
observer.join()
```

## Best Practices

### 1. Context Managers (Python)
```python
# ✅ GOOD - Auto-closes file
with open('file.txt', 'r') as f:
    content = f.read()

# ❌ BAD - Manual close
f = open('file.txt', 'r')
content = f.read()
f.close()  # Can be missed if error occurs
```

### 2. Error Handling
```python
try:
    with open('file.txt', 'r') as f:
        content = f.read()
except FileNotFoundError:
    print("File not found")
except PermissionError:
    print("Permission denied")
except IOError as e:
    print(f"Error: {e}")
```

### 3. Encoding
```python
# Always specify encoding for text files
with open('file.txt', 'r', encoding='utf-8') as f:
    content = f.read()

# Handle encoding errors
with open('file.txt', 'r', encoding='utf-8', errors='replace') as f:
    content = f.read()
```

### 4. Large Files
```python
# Process line by line for large files
with open('large.txt', 'r') as f:
    for line in f:
        process_line(line)

# Or read in chunks
with open('large.bin', 'rb') as f:
    while chunk := f.read(4096):
        process_chunk(chunk)
```

## Role-Shifting

When shifting **to** file operations:
```
"Shifting to file processing mode..."
→ Verify file exists before reading
→ Use context managers (with statements)
→ Handle encoding properly
→ Verify writes with read-back
```

## Gold Standard Integration

### Read-Back Verification
```python
# Write file
with open('output.txt', 'w') as f:
    f.write(content)

# Verify
with open('output.txt', 'r') as f:
    written = f.read()
    assert written == content
    print("✅ File written and verified")
```

### Executable Proof
```python
from pathlib import Path

# Prove file exists
filepath = Path('output.txt')
if filepath.exists():
    print(f"✅ File exists: {filepath}")
    print(f"   Size: {filepath.stat().size} bytes")
else:
    print("❌ File not created")
```

---

**"Files are the contract between your code and persistence. Honor it."**
