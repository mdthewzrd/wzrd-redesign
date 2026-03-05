---
name: excalidraw
description: Generate .excalidraw diagram JSON files for WZRD.dev topics (architecture, workflows, decisions)

**Implementation**: See `index.js` for the actual generator

---

# Excalidraw Diagram Generator for WZRD.dev

# Excalidraw Diagram Generator for WZRD.dev

**Purpose**: Generate `.excalidraw` JSON files for WZRD.dev topics (architecture, workflows, decisions)

**When to Use This Skill**
```
excalidraw skill to create a [diagram type] for [subject]

Examples:
- excalidraw skill to create an architecture diagram for WZRD.dev system
- excalidraw skill to create a flow diagram showing the PIV loop workflow
- excalidraw skill to create a decision diagram for agent response logic
```

---

## WZRD.dev Color Palette

All diagrams use consistent WZRD.dev colors:

```json
{
  "wzrd-brand": {
    "primary": "#D4AF37",
    "secondary": "#F59E0B",
    "accent": "#EAB308"
    "background": "#18181B"
  },
  "agents": {
    "remi": "#6366F1",
    "renata": "#10B981",
    "dilution": "#795548",
    "press": "#3B82F6",
    "gateway": "#8B5CF6"
  },
  "components": {
    "frontend": "#22C55E",
    "backend": "#1F2937",
    "database": "#0EA5E9",
    "platform": "#E67E22",
    "memory": "#7C3AED"
  },
  "evidence": {
    "background": "#27AE60",
    "text": "#FFFFFF",
    "border": "#8B4513"
  }
}
```

---

## Diagram Templates

### 1. Architecture Diagrams

**Purpose**: Show overall system structure

```
{
  "formatVersion": 1,
  "canvas": {
    "origin": "center",
    "zoom": 1.0
  },
  "elements": [
    {
      "type": "ellipse",
      "id": "you-coo",
      "x": 50,
      "y": 50,
      "width": 120,
      "height": 80,
      "stroke": "#D4AF37",
      "strokeWidth": 3,
      "label": {
        "type": "text",
        "content": "You (COO)",
        "fontSize": 16,
        "color": "#FFFFFF"
      }
    },
    {
      "type": "ellipse",
      "id": "remi-orchestrator",
      "x": 50,
      "y": 180,
      "width": 140,
      "height": 100,
      "stroke": "#6366F1",
      "strokeWidth": 3,
      "label": {
        "type": "text",
        "content": "Remi (Orchestrator)",
        "fontSize": 16,
        "color": "#FFFFFF"
      }
    },
    {
      "type": "text",
      "id": "framework-label",
      "content": "WZRD.dev Framework (Shared Foundation)",
      "x": 50,
      "y": 280,
      "fontSize": 14,
      "color": "#EAB308"
    },
    {
      "type": "rectangle",
      "id": "shared-foundation",
      "x": 350,
      "y": 50,
      "width": 300,
      "height": 320,
      "stroke": "#18181B",
      "strokeWidth": 2,
      "fill": "#18181B",
      "fillOpacity": 0.1,
      "elements": [
        {
          "type": "text",
          "id": "foundation-skills",
          "content": "• Skills (50+)",
          "x": 370,
          "y": 60,
          "fontSize": 12,
          "color": "#FFFFFF"
        },
        {
          "type": "text",
          "id": "foundation-commands",
          "content": "• Commands",
          "x": 370,
          "y": 90,
          "fontSize": 12,
          "color": "#FFFFFF"
        },
        {
          "type": "text",
          "id": "foundation-memory",
          "content": "• Memory System",
          "x": 370,
          "y": 120,
          "fontSize": 12,
          "color": "#FFFFFF"
        },
        {
          "type": "text",
          "id": "foundation-gold-standard",
          "content": "• Gold Standard",
          "x": 370,
          "y": 150,
          "fontSize": 12,
          "color": "#FFFFFF"
        }
      ]
    },
    {
      "type": "arrow",
      "id": "arrow-remi-to-framework",
      "from": {
        "id": "remi-orchestrator",
        "position": "right",
        "x": 190,
        "y": 230
      },
      "to": {
        "id": "shared-foundation",
        "position": "left",
        "x": 350,
        "y": 210
      },
      "stroke": "#EAB308",
      "strokeWidth": 2
    },
    {
      "type": "group",
      "id": "project-agents",
      "x": 250,
      "y": 400,
      "elements": [
        {
          "type": "ellipse",
          "id": "renata-agent",
          "x": 80,
          "y": 360,
          "width": 130,
          "height": 90,
          "stroke": "#10B981",
          "strokeWidth": 2,
          "label": {
            "type": "text",
            "content": "Renata",
            "fontSize": 14,
            "color": "#FFFFFF"
          }
        },
        {
          "type": "ellipse",
          "id": "dilution-agent",
          "x": 420,
          "y": 360,
          "width": 130,
          "height": 90,
          "stroke": "#795548",
          "strokeWidth": 2,
          "label": {
            "type": "text",
            "content": "Dilution Agent",
            "fontSize": 14,
            "color": "#FFFFFF"
          }
        },
        {
          "type": "ellipse",
          "id": "press-agent",
          "x": 80,
          "y": 450,
          "width": 130,
          "height": 90,
          "stroke": "#3B82F6",
          "strokeWidth": 2,
          "label": {
            "type": "text",
            "content": "Press Agent",
            "fontSize": 14,
            "color": "#FFFFFF"
          }
        },
        {
          "type": "rectangle",
          "id": "agent-label",
          "x": 120,
          "y": 520,
          "width": 260,
          "height": 40,
          "stroke": "#EAB308",
          "strokeWidth": 1,
          "label": {
            "type": "text",
            "content": "Specialized Team",
            "fontSize": 12,
            "color": "#FFFFFF"
          }
        }
      ]
    },
    {
      "type": "group",
      "id": "platform-services",
      "x": 350,
      "y": 550,
      "elements": [
        {
          "type": "ellipse",
          "id": "gateway",
          "x": 100,
          "y": 580,
          "width": 110,
          "height": 80,
          "stroke": "#8B5CF6",
          "strokeWidth": 2,
          "label": {
            "type": "text",
            "content": "Gateway",
            "fontSize": 14,
            "color": "#FFFFFF"
          }
        },
        {
          "type": "ellipse",
          "id": "memory-system",
          "x": 350,
          "y": 580,
          "width": 110,
          "height": 80,
          "stroke": "#7C3AED",
          "strokeWidth": 2,
          "label": {
            "type": "text",
            "content": "Memory System",
            "fontSize": 14,
            "color": "#FFFFFF"
          }
        },
        {
          "type": "ellipse",
          "id": "heartbeat",
          "x": 600,
          "y": 580,
          "width": 110,
          "height": 80,
          "stroke": "#8B5CF6",
          "strokeWidth": 2,
          "label": {
            "type": "text",
            "content": "Heartbeat",
            "fontSize": 14,
            "color": "#FFFFFF"
          }
        }
      ]
    }
  ]
}
```

### 2. Flow Diagrams

**Purpose**: Show how things work, step by step

**PIV Loop Flow**:
```
{
  "formatVersion": 1,
  "canvas": {
    "origin": "center",
    "zoom": 1.0
  },
  "elements": [
    {
      "type": "text",
      "id": "title",
      "content": "PIV Loop Workflow",
      "x": 50,
      "y": 20,
      "fontSize": 18,
      "color": "#EAB308"
    },
    {
      "type": "rectangle",
      "id": "prd-phase",
      "x": 50,
      "y": 60,
      "width": 200,
      "height": 80,
      "stroke": "#1F2937",
      "strokeWidth": 2,
      "fill": "#1F2937",
      "fillOpacity": 0.1,
      "label": {
        "type": "text",
        "content": "Create PRD",
        "fontSize": 14,
        "color": "#FFFFFF"
      }
    },
    {
      "type": "arrow",
      "id": "arrow-1",
      "from": {
        "id": "prd-phase",
        "position": "right",
        "x": 250,
        "y": 100
      },
      "to": {
        "id": "impl-phase",
        "position": "left",
        "x": 250,
        "y": 180
      },
      "stroke": "#EAB308",
      "strokeWidth": 2
    },
    {
      "type": "rectangle",
      "id": "impl-phase",
      "x": 50,
      "y": 160,
      "width": 200,
      "height": 80,
      "stroke": "#1F2937",
      "strokeWidth": 2,
      "fill": "#1F2937",
      "fillOpacity": 0.1,
      "label": {
        "type": "text",
        "content": "Implement",
        "fontSize": 14,
        "color": "#FFFFFF"
      }
    },
    {
      "type": "arrow",
      "id": "arrow-2",
      "from": {
        "id": "impl-phase",
        "position": "right",
        "x": 250,
        "y": 200
      },
      "to": {
        "id": "valid-phase",
        "position": "left",
        "x": 250,
        "y": 240
      },
      "stroke": "#EAB308",
      "strokeWidth": 2
    },
    {
      "type": "rectangle",
      "id": "valid-phase",
      "x": 50,
      "y": 220,
      "width": 200,
      "height": 80,
      "stroke": "#1F2937",
      "strokeWidth": 2,
      "fill": "#1F2937",
      "fillOpacity": 0.1,
      "label": {
        "type": "text",
        "content": "Validate (E2E)",
        "fontSize": 14,
        "color": "#FFFFFF"
      }
    }
  ]
}
```

### 3. Data Flow Diagrams

**Bridge Pattern Flow**:
```
{
  "formatVersion": 1,
  "canvas": {
    "origin": "center",
    "zoom": 1.0
  },
  "elements": [
    {
      "type": "text",
      "id": "title",
      "content": "Bridge Pattern - Query Analysis",
      "x": 50,
      "y": 20,
      "fontSize": 18,
      "color": "#EAB308"
    },
    {
      "type": "text",
      "id": "subtitle",
      "content": "Agent chooses optimal retrieval method",
      "x": 50,
      "y": 45,
      "fontSize": 14,
      "color": "#FFFFFF"
    },
    {
      "type": "ellipse",
      "id": "query-analyze",
      "x": 50,
      "y": 120,
      "width": 160,
      "height": 80,
      "stroke": "#7C3AED",
      "strokeWidth": 2,
      "label": {
        "type": "text",
        "content": "Analyze",
        "fontSize": 14,
        "color": "#FFFFFF"
      }
    },
    {
      "type": "rectangle",
      "id": "decision-box",
      "x": 50,
      "y": 190,
      "width": 200,
      "height": 120,
      "stroke": "#EAB308",
      "strokeWidth": 2,
      "fill": "#27AE60",
      "fillOpacity": 0.1,
      "elements": [
        {
          "type": "text",
          "id": "decision-1",
          "content": "Code Pattern?",
          "x": 65,
          "y": 205,
          "fontSize": 12,
          "color": "#FFFFFF"
        },
        {
          "type": "text",
          "id": "decision-2",
          "content": "Direct Fact?",
          "x": 135,
          "y": 205,
          "fontSize": 12,
          "color": "#FFFFFF"
        },
        {
          "type": "text",
          "id": "decision-3",
          "content": "Concept Search?",
          "x": 65,
          "y": 165,
          "fontSize": 12,
          "color": "#FFFFFF"
        }
      ]
    },
    {
      "type": "arrow",
      "id": "arrow-1",
      "from": {
        "id": "query-analyze",
        "position": "bottom",
        "x": 130,
        "y": 200
      },
      "to": {
        "id": "choose-strategy",
        "position": "top",
        "x": 130,
        "y": 120
      },
      "stroke": "#EAB308",
      "strokeWidth": 2
    },
    {
      "type": "text",
      "id": "choose-label",
      "content": "Choose Strategy",
      "x": 130,
      "y": 130,
      "fontSize": 14,
      "color": "#FFFFFF"
    },
    {
      "type": "group",
      "id": "strategies",
      "x": 50,
      "y": 100,
      "elements": [
        {
          "type": "ellipse",
          "id": "regex-strategy",
          "x": 30,
          "y": 60,
          "width": 120,
          "height": 60,
          "stroke": "#22C55E",
          "strokeWidth": 2,
          "label": {
            "type": "text",
            "content": "Regex Search",
            "fontSize": 14,
            "color": "#FFFFFF"
          }
        },
        {
          "type": "ellipse",
          "id": "grep-strategy",
          "x": 70,
          "y": 60,
          "width": 120,
          "height": 60,
          "stroke": "#0EA5E9",
          "strokeWidth": 2,
          "label": {
            "type": "text",
            "content": "Grep Search",
            "fontSize": 14,
            "color": "#FFFFFF"
          }
        },
        {
          "type": "ellipse",
          "id": "embedding-strategy",
          "x": 110,
          "y": 60,
          "width": 120,
          "height": 60,
          "stroke": "#7C3AED",
          "strokeWidth": 2,
          "label": {
            "type": "text",
            "content": "Embedding",
            "fontSize": 14,
            "color": "#FFFFFF"
          }
        }
      ]
    },
    {
      "type": "arrow",
      "id": "arrow-2",
      "from": {
        "id": "choose-strategy",
        "position": "right",
        "x": 170,
        "y": 100
      },
      "to": {
        "id": "retrieve-label",
        "position": "left",
        "x": 50,
        "y": 60,
      },
      "stroke": "#EAB308",
      "strokeWidth": 2
    },
    {
      "type": "text",
      "id": "retrieve-label",
      "content": "Retrieve",
      "x": 70,
      "y": 70,
      "fontSize": 14,
      "color": "#FFFFFF"
    }
  ]
}
```

---

## WZRD.dev Specific Diagrams

**Quick Templates** (Pre-built for common topics)

### System Overview
```
excalidraw skill to create an architecture diagram for WZRD.dev
```
Generates: You (COO) at top, Remi (orchestrator), Shared Foundation (framework, skills, memory), Project Agents (Renata, Dilution, Press, Gateway, Memory System, Heartbeat)

### PIV Loop
```
excalidraw skill to create a flow diagram for PIV loop
```
Generates: Create PRD → Implement → Validate → Learn, with E2E testing in Validate phase, and System Evolution in Learn phase

### Bridge Pattern
```
excalidraw skill to create a diagram for Bridge Pattern
```
Generates: Query → Analyze → Choose Strategy → Retrieve, showing the decision process and three strategies (Regex, Grep, Embedding)

---

## How This Skill Works

### Input Analysis

I'll analyze what type of diagram you need:
- **Architecture**: High-level system overview
- **Flow**: Step-by-step process
- **Data flow**: How information moves
- **Decision**: Complex logic visualization

### Template Selection

Based on your request, I'll select the appropriate template and customize the content with WZRD.dev-specific details.

### Output Format

The skill returns `.excalidraw` JSON that you can:
1. Import directly into Excalidraw app
2. View in browser or Excalidraw viewer
3. Export as PNG, SVG, or PDF

---

**This is a WZRD.dev-optimized version of Cole Medin's skill with our color scheme and architecture-specific templates.**
