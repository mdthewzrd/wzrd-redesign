---
name: ui-vision
description: AI-powered UI understanding, layout analysis, and visual element extraction
category: ai-vision
priority: P1
tags: [vision, ai, layout-analysis, element-detection, ocr]
subskills:
  - layout-detection
  - element-extraction
  - ocr
  - visual-understanding
---

# UI Vision Skill

## Purpose
Understand and analyze UIs using AI vision - detect elements, extract text, understand layouts.

## Core Principle
**"UI is visual. AI vision bridges the gap between pixels and purpose."**

## Image Analysis

### GPT-4 Vision for UI
```python
from openai import OpenAI
import base64

client = OpenAI()

def analyze_ui_screenshot(image_path):
    """Analyze UI screenshot with GPT-4 Vision"""

    # Encode image
    with open(image_path, 'rb') as f:
        image_data = base64.b64encode(f.read()).decode()

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": """Analyze this UI screenshot. Provide:
1. Layout structure (grid/flex/absolute positioning)
2. Main sections (header, sidebar, content, footer)
3. Interactive elements (buttons, links, forms)
4. Typography (fonts, sizes, weights)
5. Color palette
6. Accessibility issues

Format as JSON."""
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/png;base64,{image_data}"
                        }
                    }
                ]
            }
        ],
        response_format={"type": "json_object"}
    )

    return response.choices[0].message.content

# Usage
analysis = analyze_ui_screenshot('screenshot.png')
print(analysis)
```

### Claude Vision for UI
```python
import anthropic

client = anthropic.Anthropic()

def analyze_ui_with_claude(image_path):
    """Analyze UI with Claude 3.5 Vision"""

    with open(image_path, 'rb') as f:
        image_data = base64.b64encode(f.read()).decode()

    message = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=4096,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/png",
                            "data": image_data
                        }
                    },
                    {
                        "type": "text",
                        "text": """Analyze this UI and provide:
1. Element tree (hierarchical structure)
2. Component suggestions (React/Vue components)
3. Spacing and layout measurements
4. Potential responsive breakpoints
5. Accessibility improvements"""
                    }
                ]
            }
        ]
    )

    return message.content[0].text
```

## Element Detection

### Detect Interactive Elements
```python
def detect_interactive_elements(image_path):
    """Find all clickable elements"""

    prompt = """
    Identify ALL interactive elements in this UI. For each element provide:
    - Type (button, link, input, dropdown, checkbox, radio, toggle)
    - Position (x, y, width, height)
    - Text/label
    - Suggested selector/CSS class

    Return as JSON array.
    """

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/png;base64,{encode_image(image_path)}"}
                    }
                ]
            }
        ],
        response_format={"type": "json_object"}
    )

    return json.loads(response.choices[0].message.content)

# Output example:
# {
#   "elements": [
#     {"type": "button", "x": 100, "y": 200, "width": 120, "height": 40, "text": "Submit", "selector": "button[type='submit']"},
#     {"type": "input", "x": 100, "y": 150, "width": 300, "height": 36, "text": "Email", "selector": "input[type='email']"}
#   ]
# }
```

### Detect Forms
```python
def extract_form_structure(image_path):
    """Extract form fields and validation rules"""

    prompt = """
    Extract all forms from this UI. For each form:
    - Form purpose/label
    - All fields with:
      - Field name/label
      - Field type
      - Required/optional
      - Placeholder
      - Validation rules (min/max, pattern)
      - Error messages visible

    Return as JSON.
    """

    # ... same API call pattern
    return forms
```

## Layout Analysis

### CSS Grid Detection
```python
def detect_grid_layout(image_path):
    """Analyze if layout uses CSS Grid"""

    prompt = """
    Analyze this UI's layout. Determine:
    1. Is it using CSS Grid? (look for equal columns, specific alignment patterns)
    2. If Grid:
       - Number of columns
       - Grid template areas
       - Gap sizes
       - Alignment (justify/align)
    3. Suggested grid CSS:

    Example output:
    ```css
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    ```

    Be specific with measurements.
    """

    return analysis
```

### Flexbox Detection
```python
def detect_flexbox_layout(image_path):
    """Analyze if layout uses Flexbox"""

    prompt = """
    Analyze this UI's layout. Determine:
    1. Is it using Flexbox? (look for one-dimensional layouts)
    2. If Flexbox:
       - Direction (row/column)
       - Justify content
       - Align items
       - Gap size
       - Wrap behavior
    3. Suggested flex CSS:

    Example output:
    ```css
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    ```
    """

    return analysis
```

### Generate Component Code
```python
def generate_react_component(image_path, component_name):
    """Generate React component from UI screenshot"""

    prompt = f"""
    Generate a complete React component for this UI element.

    Requirements:
    - Component name: {component_name}
    - Use TypeScript
    - Use Tailwind CSS for styling
    - Make it responsive
    - Include accessibility attributes
    - Handle hover/focus states

    Provide:
    1. Component code
    2. Any required types/interfaces
    3. Usage example
    4. Props documentation

    Return only the code, no explanation.
    """

    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=4096,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/png",
                            "data": encode_image(image_path)
                        }
                    },
                    {"type": "text", "text": prompt}
                ]
            }
        ]
    )

    return response.content[0].text
```

## OCR (Text Extraction)

### Tesseract OCR
```python
import pytesseract
from PIL import Image
import cv2
import numpy as np

def extract_text_from_image(image_path):
    """Extract all text using OCR"""

    # Load image
    image = cv2.imread(image_path)

    # Preprocess for better OCR
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    denoised = cv2.fastNlMeansDenoising(gray)
    thresh = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]

    # Extract text
    text = pytesseract.image_to_string(thresh)

    return text

def extract_text_with_positions(image_path):
    """Extract text with bounding boxes"""

    image = cv2.imread(image_path)

    # Get detailed data
    data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)

    results = []
    n_boxes = len(data['text'])

    for i in range(n_boxes):
        text = data['text'][i].strip()
        confidence = int(data['conf'][i])

        if text and confidence > 50:
            results.append({
                'text': text,
                'bbox': {
                    'x': data['left'][i],
                    'y': data['top'][i],
                    'width': data['width'][i],
                    'height': data['height'][i]
                },
                'confidence': confidence
            })

    return results
```

### EasyOCR
```python
import easyocr

reader = easyocr.Reader(['en'])

def extract_text_easyocr(image_path):
    """Extract text using EasyOCR (better accuracy)"""

    results = reader.readtext(image_path)

    extracted = []
    for (bbox, text, confidence) in results:
        extracted.append({
            'text': text,
            'bbox': bbox,
            'confidence': float(confidence)
        })

    return extracted
```

### Text in Specific Regions
```python
def extract_text_from_region(image_path, x, y, width, height):
    """Extract text from specific region"""

    image = Image.open(image_path)

    # Crop region
    region = image.crop((x, y, x + width, y + height))

    # Extract text
    text = pytesseract.image_to_string(region)

    return text.strip()
```

## Design Token Extraction

### Color Palette
```python
def extract_color_palette(image_path):
    """Extract color palette from UI"""

    prompt = """
    Extract the color palette from this UI. Provide:
    1. Primary colors (hex codes)
    2. Secondary colors
    3. Accent colors
    4. Background colors
    5. Text colors
    6. Border colors
    7. Semantic colors (success, warning, error, info)

    For each color:
    - Hex code
    - Usage/role
    - Suggested CSS variable name

    Return as JSON.
    """

    return analysis
```

### Typography
```python
def extract_typography(image_path):
    """Extract font information"""

    prompt = """
    Extract typography information from this UI:
    1. Font families used
    2. Font sizes for each element type
    3. Font weights
    4. Line heights
    5. Letter spacing
    6. Heading hierarchy

    Suggest CSS values:

    ```css
    --font-heading: 'Inter', sans-serif;
    --font-body: 'Inter', sans-serif;
    --text-h1: 48px;
    --text-body: 16px;
    ```

    Return as JSON.
    """

    return analysis
```

### Spacing System
```python
def extract_spacing_system(image_path):
    """Extract spacing/spacing tokens"""

    prompt = """
    Analyze the spacing system in this UI:
    1. Base spacing unit
    2. Spacing scale (4px, 8px, 16px, etc.)
    3. Padding values for components
    4. Margin values between elements
    5. Gap sizes in layouts

    Suggest CSS spacing tokens:

    ```css
    --space-xs: 4px;
    --space-sm: 8px;
    --space-md: 16px;
    --space-lg: 24px;
    --space-xl: 32px;
    ```

    Return as JSON.
    """

    return analysis
```

## Accessibility Analysis

### Detect Accessibility Issues
```python
def analyze_accessibility(image_path):
    """Find accessibility issues in UI"""

    prompt = """
    Analyze this UI for accessibility issues. Check:
    1. Color contrast (WCAG AA/AAA compliance)
    2. Font sizes (minimum 16px for body)
    3. Touch target sizes (minimum 44x44px)
    4. Visible focus indicators
    5. Clear labels for inputs
    6. Alt text candidates for images
    7. Heading structure
    8. Link vs button distinction

    For each issue:
    - Severity (critical/serious/moderate/minor)
    - WCAG criterion
    - Suggested fix

    Return as JSON array.
    """

    return analysis
```

## Comparison and Diff

### UI Comparison
```python
def compare_ui_designs(before_path, after_path):
    """Compare two UI versions"""

    prompt = """
    Compare these two UI versions (before/after).

    Identify:
    1. What changed (elements, colors, spacing, layout)
    2. What improved
    3. What got worse
    4. Potential bugs introduced
    5. Visual consistency issues

    Provide structured comparison with specific locations.
    """

    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=4096,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/png",
                            "data": encode_image(before_path)
                        }
                    },
                    {
                        "type": "text",
                        "text": "BEFORE version"
                    },
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/png",
                            "data": encode_image(after_path)
                        }
                    },
                    {
                        "type": "text",
                        "text": prompt
                    }
                ]
            }
        ]
    )

    return response.content[0].text
```

## Best Practices

### 1. High Quality Screenshots
```python
# Always use high-resolution screenshots
# Minimum 2x pixel density
screenshot_options = {
    'width': 1920,
    'height': 1080,
    'device_scale_factor': 2  # Retina quality
}
```

### 2. Clean Images
```python
# Remove clutter before analysis
def prepare_image_for_analysis(image_path):
    image = Image.open(image_path)

    # Crop to main content (remove browser chrome)
    # Remove scrollbars
    # Ensure consistent sizing

    return processed_image
```

### 3. Specific Prompts
```python
# ❌ Vague
"Analyze this UI"

# ✅ Specific
"Analyze this UI's navigation structure. List all menu items, their hierarchy, and any icons used."
```

### 4. Verify Results
```python
# Always verify AI vision results
# Cross-reference with manual inspection
# Test generated code
```

## Gold Standard Integration

### Read-Back Verification
After generating component:
```typescript
// Write component
fs.writeFileSync('Component.tsx', generatedCode);

// Verify syntax
const { execSync } = require('child_process');
try {
  execSync('npx tsc --noEmit Component.tsx', { stdio: 'inherit' });
  console.log('✅ Component syntax valid');
} catch (error) {
  console.log('❌ Component has syntax errors');
}
```

### Executable Proof
```bash
# Test generated component
$ npm run test Component.test.tsx
PASS  src/Component.test.tsx
  ✓ Component renders correctly (15ms)
  ✓ Component handles props (8ms)

✅ Generated component tested and working
```

---

**"AI vision transforms screenshots into specs. But verify before you ship."**
