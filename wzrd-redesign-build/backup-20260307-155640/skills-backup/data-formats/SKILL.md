---
name: data-formats
description: Working with data formats - JSON, YAML, CSV, XML, TOML, INI, and more
category: data
priority: P1
tags: [data, formats, json, yaml, csv, xml, serialization]
subskills:
  - json-handling
  - yaml-handling
  - csv-processing
  - xml-parsing
  - config-formats
---

# Data Formats Skill

## Purpose
Read, write, transform, and validate data in various formats for storage, transmission, and configuration.

## Core Principle
**"Right format for the job. Don't use YAML when JSON will do. Don't use XML when either works."**

## Format Selection Guide

| Format | Best For | Readable | Comments | Schema |
|--------|----------|----------|----------|--------|
| **JSON** | APIs, web, NoSQL | Yes | No | JSON Schema |
| **YAML** | Config files | Yes | Yes | No standard |
| **CSV** | Tabular data | Yes | No | Header row |
| **XML** | Legacy systems, documents | Yes | Yes | XSD, DTD |
| **TOML** | Config files | Yes | Yes | No |
| **INI** | Simple config | Yes | Yes | No |
| **MessagePack** | Binary data | No | No | MsgPack schema |

## JSON (JavaScript Object Notation)

### Reading JSON
```python
import json

# From file
with open('data.json', 'r') as f:
    data = json.load(f)

# From string
json_string = '{"name": "John", "age": 30}'
data = json.loads(json_string)

# From URL
import requests
response = requests.get('https://api.example.com/data')
data = response.json()
```

```javascript
// JavaScript/Node.js
// From file
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));

// From string
const data = JSON.parse('{"name": "John", "age": 30}');

// From URL
const response = await fetch('https://api.example.com/data');
const data = await response.json();
```

### Writing JSON
```python
import json

# To file (with pretty formatting)
with open('output.json', 'w') as f:
    json.dump(data, f, indent=2)

# To string
json_string = json.dumps(data, indent=2)

# Handle special types
json.dumps(data, indent=2, default=str)  # Convert dates to strings
```

```javascript
// To file
fs.writeFileSync('output.json', JSON.stringify(data, null, 2));

// With custom replacer
JSON.stringify(data, (key, value) => {
    if (value instanceof Date) return value.toISOString();
    return value;
}, 2);
```

### JSON Manipulation
```python
# Access nested data
name = data['users'][0]['name']
name = data.get('users', [{}])[0].get('name', 'Unknown')

# Update nested data
data['users'][0]['name'] = 'Jane'

# Add to array
data['users'].append({'name': 'Bob', 'age': 25})

# Merge dictionaries
data.update(new_data)

# Filter
filtered = [u for u in data['users'] if u['age'] > 25]

# Sort by field
sorted_users = sorted(data['users'], key=lambda x: x['age'])
```

### JSON Schema Validation
```python
from jsonschema import validate, ValidationError

schema = {
    "type": "object",
    "properties": {
        "name": {"type": "string"},
        "age": {"type": "number", "minimum": 0},
        "email": {"type": "string", "format": "email"}
    },
    "required": ["name", "email"]
}

try:
    validate(instance=data, schema=schema)
    print("✅ Valid JSON")
except ValidationError as e:
    print(f"❌ Invalid: {e.message}")
```

## YAML (YAML Ain't Markup Language)

### Reading YAML
```python
import yaml

# From file
with open('config.yaml', 'r') as f:
    config = yaml.safe_load(f)

# From string
yaml_string = """
name: John
age: 30
hobbies:
  - reading
  - coding
"""
config = yaml.safe_load(yaml_string)

# Multiple documents
with open('multi.yaml', 'r') as f:
    docs = list(yaml.safe_load_all(f))
```

### Writing YAML
```python
import yaml

# To file
with open('output.yaml', 'w') as f:
    yaml.dump(data, f, default_flow_style=False, sort_keys=False)

# To string
yaml_string = yaml.dump(data, default_flow_style=False)

# Custom formatting
class MyDumper(yaml.SafeDumper):
    def represent_list(self, data):
        if len(data) == 0:
            return self.represent_sequence('tag:yaml.org,2002:seq', data, flow_style=True)
        return self.represent_sequence('tag:yaml.org,2002:seq', data, flow_style=False)

yaml.dump(data, Dumper=MyDumper)
```

### YAML Features
```yaml
# Scalars
string: "hello"
number: 42
float: 3.14
bool: true
null: null

# Lists
- item1
- item2
- item3

# Dictionaries
key: value
nested:
  key: value

# Multiline strings
literal: |
  This preserves
  newlines exactly

folded: >
  This folds
  newlines into spaces

# Anchors and aliases
defaults: &defaults
  timeout: 30
  retry: 3

service1:
  <<: *defaults
  url: http://service1.com

service2:
  <<: *defaults
  url: http://service2.com
```

## CSV (Comma-Separated Values)

### Reading CSV
```python
import pandas as pd

# With pandas (recommended)
df = pd.read_csv('data.csv')

# Options
df = pd.read_csv('data.csv',
    sep=',',           # Separator
    header=0,          # Row with column names
    index_col=0,       # Column to use as index
    dtype={'col1': str},  # Data types
    na_values=['NA', 'null'],  # Missing values
    parse_dates=['date_col'],  # Parse dates
    thousands=',',     # Thousand separator
    encoding='utf-8'
)

# With csv module
import csv

with open('data.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(row['column_name'])
```

### Writing CSV
```python
# With pandas
df.to_csv('output.csv', index=False)

# Options
df.to_csv('output.csv',
    index=False,       # Don't write row names
    header=True,       # Write column names
    sep=',',           # Separator
    na_rep='NA',       # Missing value representation
    quoting=csv.QUOTE_MINIMAL
)

# With csv module
import csv

with open('output.csv', 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=['name', 'age', 'city'])
    writer.writeheader()
    writer.writerow({'name': 'John', 'age': 30, 'city': 'NYC'})
```

### CSV Operations
```python
# Filter rows
filtered = df[df['age'] > 25]

# Group and aggregate
summary = df.groupby('category')['value'].agg(['mean', 'sum', 'count'])

# Merge CSVs
merged = pd.merge(df1, df2, on='key')

# Concatenate
combined = pd.concat([df1, df2])

# Pivot
pivot = df.pivot(index='date', columns='category', values='value')
```

## XML (Extensible Markup Language)

### Parsing XML
```python
import xml.etree.ElementTree as ET

# Parse file
tree = ET.parse('data.xml')
root = tree.getroot()

# Find elements
for child in root:
    print(child.tag, child.text)

# XPath search
for elem in root.findall('.//item'):
    print(elem.get('id'), elem.text)

# Get attributes
value = root.get('attribute_name')

# Navigate
name = root.find('name').text
items = root.findall('items/item')
```

```python
# With lxml (advanced)
from lxml import etree

# Parse
tree = etree.parse('data.xml')
root = tree.getroot()

# XPath
results = root.xpath('//item[@category="books"]')

# Pretty print
print(etree.tostring(root, pretty_print=True).decode())
```

### Writing XML
```python
import xml.etree.ElementTree as ET

# Create element
root = ET.Element('root')

# Add children
name = ET.SubElement(root, 'name')
name.text = 'John'

# Add attributes
item = ET.SubElement(root, 'item')
item.set('id', '1')
item.text = 'Value'

# Build tree
tree = ET.ElementTree(root)

# Write
ET.indent(tree, space="  ")
tree.write('output.xml', encoding='utf-8', xml_declaration=True)
```

## TOML (Tom's Obvious Minimal Language)

### Reading TOML
```python
import toml

# From file
config = toml.load('config.toml')

# Access
database_url = config['database']['url']
```

### Writing TOML
```python
import toml

config = {
    'database': {
        'url': 'postgresql://localhost/mydb',
        'pool_size': 10
    },
    'app': {
        'name': 'MyApp',
        'debug': True
    }
}

with open('config.toml', 'w') as f:
    toml.dump(config, f)
```

```toml
# config.toml example
[database]
url = "postgresql://localhost/mydb"
pool_size = 10

[app]
name = "MyApp"
debug = true

[logging]
level = "info"
file = "/var/log/app.log"
```

## INI Files

### Reading INI
```python
import configparser

config = configparser.ConfigParser()
config.read('settings.ini')

# Get values
value = config.get('section', 'key')
value = config['section']['key']

# With fallback
value = config.get('section', 'key', fallback='default')

# Boolean
flag = config.getboolean('section', 'flag')

# Integer
number = config.getint('section', 'number')
```

### Writing INI
```python
import configparser

config = configparser.ConfigParser()

config['section'] = {
    'key': 'value',
    'number': '42'
}

with open('settings.ini', 'w') as f:
    config.write(f)
```

```ini
; settings.ini example
[section]
key = value
number = 42

[database]
host = localhost
port = 5432
```

## Data Transformation

### JSON to YAML
```python
import json
import yaml

with open('data.json', 'r') as f:
    data = json.load(f)

with open('data.yaml', 'w') as f:
    yaml.dump(data, f)
```

### CSV to JSON
```python
import pandas as pd
import json

df = pd.read_csv('data.csv')
data = df.to_dict(orient='records')

with open('data.json', 'w') as f:
    json.dump(data, f, indent=2)
```

### XML to JSON
```python
import xml.etree.ElementTree as ET
import json

def xml_to_dict(element):
    """Convert XML element to dictionary"""
    result = {}
    for child in element:
        if len(child) > 0:
            result[child.tag] = xml_to_dict(child)
        else:
            result[child.tag] = child.text
    return result

tree = ET.parse('data.xml')
root = tree.getroot()
data = xml_to_dict(root)

with open('data.json', 'w') as f:
    json.dump(data, f, indent=2)
```

### Format Conversion Utility
```python
import json
import yaml
import csv
import pandas as pd
from pathlib import Path

def convert_format(input_file, output_file):
    """Convert between data formats"""

    input_ext = Path(input_file).suffix
    output_ext = Path(output_file).suffix

    # Read input
    if input_ext == '.json':
        with open(input_file, 'r') as f:
            data = json.load(f)
    elif input_ext in ['.yaml', '.yml']:
        with open(input_file, 'r') as f:
            data = yaml.safe_load(f)
    elif input_ext == '.csv':
        data = pd.read_csv(input_file).to_dict(orient='records')
    else:
        raise ValueError(f"Unsupported input format: {input_ext}")

    # Write output
    if output_ext == '.json':
        with open(output_file, 'w') as f:
            json.dump(data, f, indent=2)
    elif output_ext in ['.yaml', '.yml']:
        with open(output_file, 'w') as f:
            yaml.dump(data, f, default_flow_style=False)
    elif output_ext == '.csv':
        df = pd.DataFrame(data)
        df.to_csv(output_file, index=False)
    else:
        raise ValueError(f"Unsupported output format: {output_ext}")

    print(f"✅ Converted {input_file} to {output_file}")

# Usage
convert_format('data.json', 'data.yaml')
convert_format('data.csv', 'data.json')
```

## Best Practices

### JSON
- Use `json.dump()` with `indent=2` for human-readable output
- Use `default=str` to handle non-serializable types
- Validate with JSON Schema for APIs

### YAML
- Always use `yaml.safe_load()` to avoid code execution
- Use anchors (`&`) and aliases (`*`) for repeated config
- Be careful with type coercion (yes/no become booleans)

### CSV
- Use pandas for complex operations
- Specify encoding (`utf-8`, `latin-1`) to avoid issues
- Use `quoting=QUOTE_NONNUMERIC` for CSV with commas in values

### General
- Choose JSON for APIs and web services
- Choose YAML for config files
- Choose CSV for tabular data export
- Choose XML only when required by legacy systems

## Gold Standard Integration

### Read-Back Verification
```python
# Write file
with open('output.json', 'w') as f:
    json.dump(data, f, indent=2)

# Verify
with open('output.json', 'r') as f:
    loaded = json.load(f)
    assert loaded == data
    print("✅ Data written and verified")
```

### Executable Proof
```python
# Show file exists and is valid
import os

if os.path.exists('output.json'):
    with open('output.json', 'r') as f:
        json.load(f)
    print("✅ output.json is valid JSON")
```

---

**"Data formats are the languages we speak to computers. Choose the right dialect."**
