#!/usr/bin/env node

/**
 * WZRD.dev Excalidraw Diagram Generator
 *
 * Generates .excalidraw JSON files for visualizing WZRD.dev topics
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// WZRD.dev Color Palette
const COLORS = {
  wzrd: {
    primary: '#D4AF37',
    secondary: '#F59E0B',
    accent: '#EAB308',
    background: '#18181B'
  },
  agents: {
    remi: '#6366F1',
    renata: '#10B981',
    dilution: '#795548',
    press: '#3B82F6',
    gateway: '#8B5CF6'
  },
  components: {
    frontend: '#22C55E',
    backend: '#1F2937',
    database: '#0EA5E9',
    platform: '#E67E22',
    memory: '#7C3AED'
  },
  evidence: {
    background: '#27AE60',
    text: '#FFFFFF',
    border: '#8B4513'
  }
};

// Diagram Templates
const TEMPLATES = {
  architecture: (customization = {}) => {
    formatVersion: 1,
    canvas: { origin: 'center', zoom: 1.0 },
    elements: [
      // You (COO)
      {
        type: 'ellipse',
        id: 'you-coo',
        x: 400,
        y: 100,
        width: 140,
        height: 80,
        stroke: COLORS.wzrd.primary,
        strokeWidth: 3,
        label: {
          type: 'text',
          content: 'You (COO)',
          fontSize: 16,
          color: '#FFFFFF'
        }
      },
      // Remi (Orchestrator)
      {
        type: 'ellipse',
        id: 'remi-orchestrator',
        x: 400,
        y: 200,
        width: 150,
        height: 100,
        stroke: COLORS.agents.remi,
        strokeWidth: 3,
        label: {
          type: 'text',
          content: 'Remi (Orchestrator)',
          fontSize: 16,
          color: '#FFFFFF'
        }
      },
      // Shared Foundation
      {
        type: 'rectangle',
        id: 'shared-foundation',
        x: 200,
        y: 350,
        width: 320,
        height: 40,
        stroke: COLORS.wzrd.primary,
        strokeWidth: 2,
        fill: COLORS.wzrd.background,
        fillOpacity: 0.1,
        label: {
          type: 'text',
          content: 'WZRD.dev Framework (Shared Foundation)',
          fontSize: 14,
          color: '#FFFFFF'
        }
      },
      // Project Agents Group
      {
        type: 'group',
        id: 'project-agents',
        x: 200,
        y: 500,
        elements: [],
        // Renata
        {
          type: 'ellipse',
          id: 'renata',
          x: 80,
          y: 460,
          width: 130,
          height: 90,
          stroke: COLORS.agents.renata,
          strokeWidth: 2,
          label: {
            type: 'text',
            content: 'Renata',
            fontSize: 14,
            color: '#FFFFFF'
          }
        },
        // Dilution
        {
          type: 'ellipse',
          id: 'dilution',
          x: 340,
          y: 460,
          width: 130,
          height: 90,
          stroke: COLORS.agents.dilution,
          strokeWidth: 2,
          label: {
            type: 'text',
            content: 'Dilution Agent',
            fontSize: 14,
            color: '#FFFFFF'
          }
        },
        // Press Agent
        {
          type: 'ellipse',
          id: 'press',
          x: 540,
          y: 460,
          width: 130,
          height: 90,
          stroke: COLORS.agents.press,
          strokeWidth: 2,
          label: {
            type: 'text',
            content: 'Press Agent',
            fontSize: 14,
            color: '#FFFFFF'
          }
        }
      }
    ]
  },

  flow: {
    formatVersion: 1,
    canvas: { origin: 'center', zoom: 1.0 },
    elements: [
      // You → Remi
      {
        type: 'arrow',
        id: 'arrow-you-to-remi',
        from: { id: 'you-coo', position: 'right', x: 470, y: 180 },
        to: { id: 'remi-orchestrator', position: 'left', x: 330, y: 180 },
        stroke: COLORS.wzrd.secondary,
        strokeWidth: 2
      },
      // Remi → Projects
      {
        type: 'arrow',
        id: 'arrow-remi-to-framework',
        from: { id: 'remi-orchestrator', position: 'right', x: 500, y: 200 },
        to: { id: 'shared-foundation', position: 'left', x: 200, y: 200 },
        stroke: COLORS.wzrd.secondary,
        strokeWidth: 2
      },
      // Framework → Agents
      {
        type: 'arrow',
        id: 'arrow-framework-to-agents',
        from: { id: 'shared-foundation', position: 'right', x: 300, y: 280 },
        to: { id: 'project-agents', position: 'left', x: 100, y: 280 },
        stroke: COLORS.wzrd.secondary,
        strokeWidth: 2
      }
    ],
    label: {
      type: 'text',
      content: 'WZRD.dev Framework (Shared)',
      x: 600,
      y: 50,
      fontSize: 18,
      color: COLORS.wzrd.secondary
    }
  },

  dataFlow: {
    formatVersion: 1,
    canvas: { origin: 'center', zoom: 1.0 },
    elements: [
      // Query
      {
        type: 'text',
        id: 'query-label',
        content: 'Query',
        x: 100,
        y: 80,
        fontSize: 16,
        color: '#FFFFFF'
      },
      // Analyze
      {
        type: 'ellipse',
        id: 'query-analyze',
        x: 150,
        y: 120,
        width: 180,
        height: 100,
        stroke: COLORS.components.backend,
        strokeWidth: 2,
        label: {
          type: 'text',
          content: 'Analyze',
          fontSize: 14,
          color: '#FFFFFF'
        }
      },
      // Decision Box
      {
        type: 'rectangle',
        id: 'decision-box',
        x: 100,
        y: 150,
        width: 200,
        height: 120,
        stroke: COLORS.components.frontend,
        strokeWidth: 2,
        fill: COLORS.evidence.background,
        fillOpacity: 0.1,
        elements: [
          // Decision 1
          {
            type: 'text',
            id: 'decision-1',
            content: 'Code Pattern?',
            x: 120,
            y: 170,
            fontSize: 12,
            color: '#FFFFFF'
          },
          // Decision 2
          {
            type: 'text',
            id: 'decision-2',
            content: 'Direct Fact?',
            x: 120,
            y: 200,
            fontSize: 12,
            color: '#FFFFFF'
          },
          // Decision 3
          {
            type: 'text',
            id: 'decision-3',
            content: 'Concept Search?',
            x: 120,
            y: 230,
            fontSize: 12,
            color: '#FFFFFF'
          }
        ]
      },
      // Choose Strategy
      {
        type: 'arrow',
        id: 'arrow-choose-strategy',
        from: { id: 'decision-box', position: 'right', x: 300, y: 190 },
        to: {
          id: 'strategies',
          position: 'top',
          x: 150,
          y: 100,
          stroke: COLORS.wzrd.secondary,
          strokeWidth: 2
        },
        // Strategies
      {
        type: 'group',
        id: 'strategies',
        x: 150,
        y: 100,
        elements: [
          // Regex Strategy
          {
            type: 'ellipse',
            id: 'regex-strategy',
            x: 100,
            y: 60,
            width: 120,
            height: 60,
            stroke: COLORS.evidence.text,
            strokeWidth: 2,
            label: {
              type: 'text',
              content: 'Regex Search',
              fontSize: 12,
              color: '#FFFFFF'
            }
          },
          // Grep Strategy
          {
            type: 'ellipse',
            id: 'grep-strategy',
            x: 120,
            y: 140,
            width: 120,
            height: 60,
            stroke: COLORS.evidence.text,
            strokeWidth: 2,
            label: {
              type: 'text',
              content: 'Grep Search',
              fontSize: 12,
              color: '#FFFFFF'
            }
          },
          // Embedding Strategy
          {
            type: 'ellipse',
            id: 'embedding-strategy',
            x: 140,
            y: 220,
            width: 120,
            height: 60,
            stroke: COLORS.evidence.text,
            strokeWidth: 2,
            label: {
              type: 'text',
              content: 'Embedding',
              fontSize: 12,
              color: '#FFFFFF'
            }
          }
        ]
      },
      // Retrieve
      {
        type: 'arrow',
        id: 'arrow-retrieve',
        from: { id: 'strategies', position: 'bottom', x: 250, y: 180 },
        to: { id: 'retrieve-label', position: 'left', x: 50, y: 180 },
        stroke: COLORS.wzrd.secondary,
        strokeWidth: 2,
        label: {
          type: 'text',
          content: 'Retrieve',
          fontSize: 14,
          color: '#FFFFFF'
        }
      }
    ],
    label: {
      type: 'text',
      content: 'Bridge Pattern - Query Analysis',
      x: 400,
      y: 20,
      fontSize: 18,
      color: '#FFFFFF'
    }
  },

  decision: {
    formatVersion: 1,
    canvas: { origin: 'center', zoom: 1.0 },
    elements: [
      // Incoming Query
      {
        type: 'text',
        id: 'query-label',
        content: 'Incoming Query',
        x: 100,
        y: 120,
        fontSize: 16,
        color: '#FFFFFF'
      },
      // Decision
      {
        type: 'rectangle',
        id: 'decision-box',
        x: 100,
        y: 80,
        width: 180,
        height: 80,
        stroke: COLORS.components.backend,
        strokeWidth: 2,
        fill: COLORS.evidence.background,
        fillOpacity: 0.1,
        elements: [
          // Is Urgent?
          {
            type: 'text',
            id: 'decision-yes',
            content: 'Yes',
            x: 120,
            y: 170,
            fontSize: 14,
            color: '#FFFFFF'
          },
          // No
          {
            type: 'text',
            id: 'decision-no',
            content: 'No',
            x: 240,
            y: 170,
            fontSize: 14,
            color: '#FFFFFF'
          }
        ]
      },
      // Search Memory
      {
        type: 'arrow',
        id: 'arrow-search-memory',
        from: { id: 'decision-box', position: 'bottom', x: 180, y: 180 },
        to: { id: 'search-memory-label', position: 'right', x: 50, y: 180 },
        stroke: COLORS.wzrd.secondary,
        strokeWidth: 2,
        label: {
          type: 'text',
          content: 'Search Memory',
          fontSize: 14,
          color: '#FFFFFF'
        }
      },
      // Format Response
      {
        type: 'arrow',
        id: 'arrow-format-response',
        from: { id: 'search-memory-label', position: 'right', x: 50, y: 180 },
        to: { id: 'format-response-label', position: 'left', x: 50, y: 180 },
        stroke: COLORS.wzrd.secondary,
        strokeWidth: 2,
        label: {
          type: 'text',
          content: 'Format',
          fontSize: 14,
          color: '#FFFFFF'
        }
      },
      // Send
      {
        type: 'arrow',
        id: 'arrow-send',
        from: { id: 'format-response-label', position: 'left', x: 50, y: 180 },
        to: { id: 'return-label', position: 'right', x: 200, y: 180 },
        stroke: COLORS.wzrd.secondary,
        strokeWidth: 2,
        label: {
          type: 'text',
          content: 'Return',
          fontSize: 14,
          color: '#FFFFFF'
        }
      }
    ],
    label: {
      type: 'text',
      content: 'Agent Response Decision',
      x: 400,
      y: 20,
      fontSize: 18,
      color: '#FFFFFF'
    }
  }
};

/**
 * Generate diagram based on request type
 */
function generateDiagram(type, customization = {}) {
  const template = TEMPLATES[type];
  if (!template) {
    console.error(`Unknown diagram type: ${type}`);
    return null;
  }

  // Apply customizations
  const diagram = JSON.parse(JSON.stringify(template));
  applyCustomizations(diagram, customization);

  return JSON.stringify(diagram, null, 2);
}

/**
 * Apply custom modifications to diagram
 */
function applyCustomizations(diagram, customization) {
  if (customization.title) {
    diagram.label = { ...diagram.label, content: customization.title };
  }
  if (customization.subtitle) {
    // Add subtitle if supported
  }
  if (customization.zoom) {
    diagram.canvas.zoom = customization.zoom;
  }
  if (customization.elements) {
    customizeElements(diagram, customization.elements);
  }
}

/**
 * Customize specific elements
 */
function customizeElements(diagram, customizations) {
  for (const [id, ...customizations] of Object.entries(customizations)) {
    if (Array.isArray(diagram.elements)) {
      for (let i = 0; i < diagram.elements.length; i++) {
        if (diagram.elements[i].id === id) {
          diagram.elements[i] = { ...diagram.elements[i], ...customizations[id] };
        }
      }
    }
    if (Array.isArray(diagram.canvas?.elements)) {
      for (const elem of diagram.canvas.elements) {
        if (customizations[elem.id]) {
          diagram.canvas.elements[elem.id] = { ...elem, ...customizations[elem.id] };
        }
      }
    }
  }
}

// CLI interface
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const type = args[1];

  switch (command) {
    case 'architecture':
      const diagram = generateDiagram('architecture');
      console.log(JSON.stringify(diagram, null, 2));
      break;

    case 'flow':
      const diagram = generateDiagram('flow');
      console.log(JSON.stringify(diagram, null, 2));
      break;

    case 'decision':
      const diagram = generateDiagram('decision');
      console.log(JSON.stringify(diagram, null, 2));
      break;

    default:
      console.log(`
Usage: node index.js <command> <type> [options]

Commands:
  architecture   Generate system architecture diagram
  flow          Generate process flow diagram
  decision       Generate decision tree diagram

Types:
  architecture   System overview, component relationships
  flow          PIV loop, data flows, agent interactions
  decision       Complex decision logic with multiple branches

Examples:
  node index.js architecture
  node index.js flow "PIV Loop"
  node index.js decision "Agent Response"

Options:
  --title "Custom Title"     Override default title
  --zoom 1.5                Set zoom level (default: 1.0)
      `);
      break;
  }
}
