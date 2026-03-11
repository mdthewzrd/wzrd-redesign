#!/usr/bin/env node
/**
 * Smart Skill Loader
 * Intelligently loads skills based on task detection from user message
 * Reduces token usage by only loading relevant skills for the current task
 */

const path = require('path');
const fs = require('fs');

class SmartSkillLoader {
  constructor() {
    this.basePath = path.join(__dirname, '..');
    this.skillsPath = path.join(this.basePath, '.claude', 'skills');
    this.totalSkillsCount = this.getTotalSkillsCount();
  }

  // Get total number of available skills
  getTotalSkillsCount() {
    if (!fs.existsSync(this.skillsPath)) {
      return 0;
    }
    const items = fs.readdirSync(this.skillsPath);
    return items.filter(item => {
      const skillPath = path.join(this.skillsPath, item, 'SKILL.md');
      return fs.existsSync(skillPath);
    }).length;
  }

  // Core skills always loaded in every mode
  getCoreSkills() {
    return [
      'using-superpowers',
      'context',
      'workflow-patterns',
      'documentation'
    ];
  }

  // Task detection patterns
  taskPatterns = {
    // Frontend / React / UI / Design patterns
    frontend: {
      triggers: [
        'react', 'component', 'jsx', 'tsx', 'ui', 'design', 'tailwind',
        'shadcn', 'frontend', 'html', 'css', 'javascript', 'vue', 'svelte',
        'vercel', 'nextjs', 'next.js', 'button', 'form', 'modal', 'dialog'
      ],
      skills: [
        'vercel-composition-patterns'
      ],
      // Framework-specific frontend skills
      languageBased: {
        javascript: ['vercel-react-best-practices', 'nextjs-app-router-patterns'],
        typescript: ['vercel-react-best-practices', 'nextjs-app-router-patterns'],
        react: ['vercel-react-native-skills'], // Load only for React Native tasks
        'react-native': ['vercel-react-native-skills']
      }
    },

    // Python / Backend patterns
    python: {
      triggers: [
        'python', '.py', 'fastapi', 'django', 'flask', 'pandas', 'numpy',
        'ai agent', 'pydantic', 'pytest', 'async', 'python-', 'python ' // matches "python" with space after
      ],
      skills: [
        'python-project-structure',
        'python-code-style',
        'python-performance-optimization'
      ],
      // Language-specific Python skills
      languageBased: {
        python: ['python-resource-management', 'python-observability']
      }
    },

    // Testing / Debugging patterns
    testing: {
      triggers: [
        'test', 'debug', 'fix bug', 'error', 'issue', 'troubleshoot',
        'verify', 'validate', 'bug hunt', 'qa', 'assert', 'mock'
      ],
      skills: [
        'test-driven-development',
        'debugging',
        'systematic-debugging'
      ],
      // Language-specific testing skills (loaded dynamically based on context)
      languageBased: {
        python: ['python-testing-patterns'],
        javascript: ['e2e-testing-patterns'], // Replaces removed javascript-testing-patterns
        typescript: ['e2e-testing-patterns'], // TypeScript uses E2E testing patterns
        'c#': [], // dotnet-backend-patterns was removed, no replacement
        'dotnet': []
      }
    },

    // API / Backend patterns
    api: {
      triggers: [
        'api', 'endpoint', 'rest', 'graphql', 'http', 'request', 'response',
        'backend', 'server', 'route', 'handler', 'middleware', 'controllers'
      ],
      skills: [
        'api-design-principles'
      ],
      // Language-specific backend skills
      languageBased: {
        javascript: ['nextjs-app-router-patterns', 'nodejs-backend-patterns'],
        typescript: ['nextjs-app-router-patterns', 'nodejs-backend-patterns'],
        'c#': [], // dotnet-backend-patterns was removed
        dotnet: [], // dotnet-backend-patterns was removed
        python: ['python-project-structure', 'python-resource-management']
      }
    },

    // Database / SQL patterns
    database: {
      triggers: [
        'database', 'sql', 'postgres', 'mysql', 'query', 'schema',
        'migration', 'table', 'orm', 'prisma', 'sequeliz', 'typeorm'
      ],
      skills: [
        'sql',
        'postgresql-table-design',
        'sql-optimization-patterns',
        'database-migration'
      ]
    },

    // Deployment / DevOps patterns
    devops: {
      triggers: [
        'deploy', 'deployment', 'production', 'ci/cd', 'github actions',
        'pipeline', 'release', 'publish', 'docker', 'kubernetes', 'k8s',
        'terraform', 'ansible', 'helm', 'infrastructure'
      ],
      skills: [
        'cli',
        'architecture',
        'github-actions-templates',
        'k8s-manifest-generator',
        'helm-chart-scaffolding'
      ]
    },

    // Security patterns
    security: {
      triggers: [
        'security', 'auth', 'authentication', 'authorization', 'session',
        'jwt', 'oauth', 'permission', 'role', 'access', 'encrypt',
        'vulnerability', 'hack', 'attack', 'threat', 'pci', 'gdpr'
      ],
      skills: [
        'security',
        'auth-implementation-patterns',
        'pci-compliance',
        'gdpr-data-handling'
      ]
    },

    // Architecture / Design patterns
    architecture: {
      triggers: [
        'architecture', 'design pattern', 'solid', 'dry', 'clean architecture',
        'hexagonal', 'domain-driven', 'ddd', 'microservice', 'event-sourcing',
        'cqrs', 'saga', 'system design', 'scalability'
      ],
      skills: [
        'architecture',
        'architecture-patterns',
        'architecture-decision-records',
        'cqrs-implementation'
      ]
    },

    // LLM / AI / Prompt patterns
    llm: {
      triggers: [
        'llm', 'prompt', 'rag', 'embedding', 'ai', 'model', 'token',
        'optimizing prompt', 'prompt engineering', 'vector', 'langchain',
        'openai', 'claude', 'gpt', 'anthropic', 'ai agent'
      ],
      skills: [
        'prompt-engineering-patterns',
        'rag-implementation',
        'embedding-strategies',
        'langchain-architecture'
      ]
    },

    // Documentation / Writing patterns
    documentation: {
      triggers: [
        'document', 'readme', 'write to file', 'doc', 'guide', 'tutorial',
        'explain', 'describe', 'comment', 'changelog', 'technical writing'
      ],
      skills: [
        'documentation',
        'writing-plans',
        'changelog-automation'
      ]
    },

    // Git / Version control patterns
    git: {
      triggers: [
        'git', 'commit', 'branch', 'merge', 'pull request', 'pr',
        'push', 'checkout', 'rebase', 'cherry-pick', 'version'
      ],
      skills: [
        'github',
        'git-advanced-workflows'
      ]
    }
  };

  // Detect task type from user message
  detectTask(message) {
    const messageLower = message.toLowerCase();

    const detectedTasks = [];

    for (const [taskType, config] of Object.entries(this.taskPatterns)) {
      const matchedTriggers = config.triggers.filter(trigger =>
        messageLower.includes(trigger.toLowerCase())
      );

      if (matchedTriggers.length > 0) {
        detectedTasks.push({
          task: taskType,
          triggers: matchedTriggers,
          skills: config.skills,
          languageBased: config.languageBased || null
        });
      }
    }

    return detectedTasks;
  }

  // Detect programming languages in message
  detectLanguages(message) {
    const messageLower = message.toLowerCase();
    const detectedLanguages = new Set();

    // Language detection patterns
    const languagePatterns = {
      python: ['python', '.py', 'fastapi', 'django', 'flask', 'pandas', 'numpy'],
      javascript: ['javascript', 'js', 'react', 'vue', 'node', 'nodejs', 'nextjs', 'express', 'angular'],
      typescript: ['typescript', 'ts', '.tsx', '.ts'],
      'c#': ['c#', 'dotnet', '.net', 'asp.net'],
      dotnet: ['dotnet', '.net', 'c#'],
      java: ['java', 'spring'],
      go: ['go', 'golang'],
      rust: ['rust'],
      ruby: ['ruby', 'rails'],
      php: ['php'],
      sql: ['sql', 'database', 'postgres', 'mysql', 'mongo', 'postgresql']
    };

    for (const [language, patterns] of Object.entries(languagePatterns)) {
      if (patterns.some(pattern => messageLower.includes(pattern))) {
        detectedLanguages.add(language);
      }
    }

    return Array.from(detectedLanguages);
  }

  // Load skills for a given message
  loadSkillsForMessage(message, mode = 'chat') {
    const coreSkills = this.getCoreSkills();
    const detectedTasks = this.detectTask(message);
    const detectedLanguages = this.detectLanguages(message);

    // Collect all unique skills
    const loadedSkills = new Set(coreSkills);

    // Add mode-specific skills
    const modeSkills = this.getModeSkills(mode);
    modeSkills.forEach(skill => loadedSkills.add(skill));

    // Add task-specific skills with language awareness
    const taskDetails = [];
    for (const task of detectedTasks) {
      // Add base skills for this task
      task.skills.forEach(skill => loadedSkills.add(skill));
      
      // Add language-specific skills if this task has them
      if (task.languageBased && detectedLanguages.length > 0) {
        for (const language of detectedLanguages) {
          const languageSkills = task.languageBased[language];
          if (languageSkills) {
            languageSkills.forEach(skill => loadedSkills.add(skill));
          }
        }
      }
      
      taskDetails.push({
        task: task.task,
        triggers: task.triggers,
        skillCount: task.skills.length,
        languages: detectedLanguages,
        languageBasedSkills: task.languageBased ? 
          Object.entries(task.languageBased)
            .filter(([lang]) => detectedLanguages.includes(lang))
            .flatMap(([, skills]) => skills)
            .length : 0
      });
    }

    const skillsArray = Array.from(loadedSkills);

    return {
      skills: skillsArray,
      coreCount: coreSkills.length,
      modeCount: modeSkills.length,
      taskCount: skillsArray.length - coreSkills.length - modeSkills.length,
      totalSkills: skillsArray.length,
      totalAvailable: this.totalSkillsCount,
      tasksDetected: taskDetails,
      languagesDetected: detectedLanguages,
      percentLoaded: ((skillsArray.length / this.totalSkillsCount) * 100).toFixed(1),
      percentSaved: (((this.totalSkillsCount - skillsArray.length) / this.totalSkillsCount) * 100).toFixed(1)
    };
  }

  // Get mode-specific skills
  getModeSkills(mode) {
    const modeSkills = {
      chat: ['orchestration', 'communication', 'topic-switcher', 'auto-memory'],
      thinker: ['planning', 'architecture', 'research', 'validation'],
      coder: ['coding', 'debugging', 'testing', 'github'],
      debug: ['debugging', 'system-health', 'performance', 'verification-before-completion'],
      research: ['research', 'web-search', 'documentation', 'data-analysis']
    };

    return modeSkills[mode] || modeSkills.chat;
  }

  // Display skill load report
  displaySkillLoadReport(message, mode = 'chat') {
    const result = this.loadSkillsForMessage(message, mode);

    console.log(`
═══════════════════════════════════════════════════
     🔧 SMART SKILL LOADER - TASK ANALYSIS
═══════════════════════════════════════════════════

📝 Input Message:
   "${message.substring(0, 150)}${message.length > 150 ? '...' : ''}"

🎯 Detected Tasks:
${result.tasksDetected.length > 0
  ? result.tasksDetected.map(t => {
      let line = `   • ${t.task.toUpperCase()}: ${t.triggers.length} trigger(s) [+${t.skillCount} base skills`;
      if (t.languageBasedSkills > 0) {
        line += ` +${t.languageBasedSkills} language skills`;
      }
      line += ']';
      return line;
    }).join('\n')
  : '   • No specific task detected (using mode-based skills)'}

${result.languagesDetected?.length > 0
  ? `🔤 Languages Detected: ${result.languagesDetected.join(', ')}`
  : ''}

🛠️ Skills to Load: ${result.totalSkills} / ${result.totalAvailable} (${result.percentLoaded}% of available)

   Always Loaded (${result.coreCount} skills):
${result.skills.slice(0, result.coreCount).map(s => `     ✅ ${s}`).join('\n')}

   Mode-Specific (${mode} mode, ${result.modeCount} skills):
${result.skills.slice(result.coreCount, result.coreCount + result.modeCount).map(s => `     🎯 ${s}`).join('\n')}

${result.taskCount > 0
  ? `   Task-Specific (${result.taskCount} skills):
${result.skills.slice(result.coreCount + result.modeCount).map(s => `     🔶 ${s}`).join('\n')}
`
  : ''}   Optimized Away (${result.totalAvailable - result.totalSkills} skills):
     💡 Smart loading: ${result.percentSaved}% token savings (${result.totalSkills} loaded vs ${result.totalAvailable} total)

═══════════════════════════════════════════════════
    `);

    return result;
  }
}

// CLI interface
function main() {
  const args = process.argv.slice(2);
  let message = '';
  let mode = 'chat';

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--mode' && i + 1 < args.length) {
      mode = args[i + 1];
      i++;
    } else if (args[i] === '--message' && i + 1 < args.length) {
      message = args[i + 1];
      i++;
    } else if (!args[i].startsWith('--')) {
      message += ' ' + args[i];
    }
  }

  if (!message) {
    console.error('Usage: node bin/smart-skill-loader.js [--mode MODE] --message "your message"');
    process.exit(1);
  }

  const loader = new SmartSkillLoader();
  return loader.displaySkillLoadReport(message, mode);
}

if (require.main === module) {
  main();
}

module.exports = SmartSkillLoader;
