#!/usr/bin/env node
/**
 * Auto Mode Detector for WZRD CLI
 * Detects the most appropriate mode based on user prompt/task
 */

class AutoModeDetector {
  constructor() {
    this.patterns = {
      thinker: [
        // Planning & strategy
        /\b(plan|strategy|architecture|design|roadmap|timeline|milestone)\b/i,
        /\b(analyze|analysis|assess|evaluate|consider|review|assess)\b/i,
        /\b(should|would|could|what.*if|how.*to|best.*approach)\b/i,
        /\b(brainstorm|ideate|conceptualize|blueprint|framework)\b/i,
        
        // Questions requiring deep thought
        /\b(why.*question|philosophical|theoretical|conceptual|abstract)\b/i,
        /\b(compare.*contrast|pros.*cons|advantages.*disadvantages)\b/i,
        /\b(dilemma|trade.*off|decision.*making|choose.*between)\b/i,
        
        // System design
        /\b(system.*design|scalability|reliability|availability)\b/i,
        /\b(microservices|monolith|distributed|architecture.*pattern)\b/i,
        /\b(database.*design|schema|index|normalization|denormalization)\b/i
      ],
      
      coder: [
        // Code-related
        /\b(code|program|script|function|class|method|algorithm)\b/i,
        /\b(implement|write|create|build|develop|programming)\b/i,
        /\b(fix.*bug|debug|error|exception|crash|segfault)\b/i,
        /\b(refactor|optimize|clean.*up|restructure|reorganize)\b/i,
        /\b(test.*case|unit.*test|integration.*test|test.*suite)\b/i,
        /\b(api.*endpoint|route|controller|service|repository)\b/i,
        /\b(database.*query|sql|migration|schema|orm)\b/i,
        /\b(git.*commit|push|pull|branch|merge|rebase)\b/i,
        
        // File operations
        /\b(file.*path|directory|folder|read.*file|write.*file)\b/i,
        /\b(edit.*file|modify.*file|update.*file|change.*file)\b/i,
        /\b(create.*file|new.*file|delete.*file|remove.*file)\b/i,
        
        // Specific technologies
        /\b(react|vue|angular|svelte|nextjs|nodejs|express)\b/i,
        /\b(python|javascript|typescript|java|cpp|rust|go)\b/i,
        /\b(docker|kubernetes|container|deployment|ci.*cd)\b/i
      ],
      
      debug: [
        // Debugging
        /\b(debug|troubleshoot|investigate|diagnose|root.*cause)\b/i,
        /\b(error.*message|bug.*report|issue.*tracking|defect)\b/i,
        /\b(test.*fail|test.*broken|test.*not.*working)\b/i,
        /\b(performance.*issue|slow|latency|bottleneck)\b/i,
        /\b(memory.*leak|cpu.*usage|disk.*space|resource)\b/i,
        /\b(crash.*report|stack.*trace|exception.*log)\b/i,
        /\b(security.*vulnerability|exploit|penetration.*test)\b/i,
        /\b(monitor.*alert|alert.*triggered|system.*down)\b/i
      ],
      
      research: [
        // Research
        /\b(research|investigate|look.*up|find.*information)\b/i,
        /\b(learn.*about|understand.*better|explore.*topic)\b/i,
        /\b(search.*for|google|internet.*search|web.*search)\b/i,
        /\b(data.*analysis|statistics|metrics|analytics)\b/i,
        /\b(compare.*options|evaluate.*alternatives|research.*tools)\b/i,
        /\b(best.*practices|industry.*standards|methodologies)\b/i,
        /\b(documentation|tutorial|guide|how.*to.*article)\b/i,
        /\b(case.*study|white.*paper|academic.*paper)\b/i
      ],
      
      chat: [
        // Default/chat
        /\b(hello|hi|hey|greetings|good.*morning|good.*afternoon)\b/i,
        /\b(thank.*you|thanks|appreciate.*it|grateful)\b/i,
        /\b(how.*are.*you|how.*is.*it.*going|what.*up)\b/i,
        /\b(help.*me|assist.*me|support.*me|guide.*me)\b/i,
        /\b(explain.*to.*me|tell.*me.*about|describe.*to.*me)\b/i,
        /\b(conversation|discussion|talk.*about|chat.*about)\b/i,
        /\b(general.*question|simple.*question|basic.*question)\b/i,
        /\b(opinion.*on|thoughts.*on|perspective.*on)\b/i
      ]
    };
  }

  detectMode(prompt) {
    if (!prompt || prompt.trim() === '') {
      return 'chat';
    }

    const scores = {
      thinker: 0,
      coder: 0,
      debug: 0,
      research: 0,
      chat: 0
    };

    // Score each pattern match
    for (const [mode, patterns] of Object.entries(this.patterns)) {
      for (const pattern of patterns) {
        const matches = (prompt.match(pattern) || []).length;
        scores[mode] += matches;
      }
    }

    // Special case: empty or very short prompts
    if (prompt.trim().length < 10) {
      scores.chat += 2;
    }

    // Special case: questions with "?"
    if (prompt.includes('?')) {
      scores.thinker += 1;
      scores.chat += 1;
    }

    // Find highest score
    let highestScore = -1;
    let detectedMode = 'chat';

    for (const [mode, score] of Object.entries(scores)) {
      if (score > highestScore) {
        highestScore = score;
        detectedMode = mode;
      }
    }

    // Confidence check
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    const confidence = totalScore > 0 ? (highestScore / totalScore) : 0;

    return {
      mode: detectedMode,
      confidence: confidence.toFixed(2),
      scores
    };
  }

  static detectFromPrompt(prompt) {
    const detector = new AutoModeDetector();
    return detector.detectMode(prompt);
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node auto-mode-detector.js "your prompt here"');
    console.log('Example: node auto-mode-detector.js "How should I design this API?"');
    process.exit(1);
  }

  const prompt = args.join(' ');
  const result = AutoModeDetector.detectFromPrompt(prompt);
  
  console.log(`Prompt: "${prompt}"`);
  console.log(`Detected mode: ${result.mode} (confidence: ${result.confidence})`);
  console.log('Score breakdown:', result.scores);
  
  // Output as JSON for programmatic use
  if (args.includes('--json')) {
    console.log(JSON.stringify(result, null, 2));
  }
}

module.exports = { default: AutoModeDetector, AutoModeDetector };