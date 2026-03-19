import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

/**
 * Generate a clean, descriptive title from raw task text.
 * Uses intent detection to rewrite conversational text into clear task titles.
 */
export function generateWorkTitle(task: string): string {
  if (!task || typeof task !== 'string') return 'Untitled Task';

  let text = task.trim();

  // Return early if empty after trim
  if (!text) return 'Untitled Task';

  // ===== 1. Detect intent patterns and rewrite =====

  // "I tell X she has it" / "I told X" → "Inform X of..."
  if (/^(i tell|i told|i'm telling|i let)/i.test(text)) {
    const targetMatch = text.match(/(?:tell|inform)\s+([\w\s-]+)\s+(?:she|he|they|it)\s+has/i);
    if (targetMatch) {
      return `Inform ${targetMatch[1].trim()} of confirmation`;
    }
    text = text.replace(/^(i tell|i told)\s+/i, 'inform ');
  }

  // "Alright X to make sure..." → Remove greeting
  if (/^(alright|okay|great|perfect|beautiful|awesome|nice)\s+\w+/i.test(text)) {
    text = text.replace(/^(alright|okay|great|perfect|beautiful|awesome|nice)\s+/i, '');
  }

  // "to make sure you can use..." → "Verify..."
  if (/to make sure (?:you|we|they) can/i.test(text)) {
    text = text.replace(/to make sure (?:you|we|they) can\s+(?:use|access|run|execute|handle)\s+/i, 'verify ');
  }

  // "checking how its going" → "Check progress"
  if (/checking how (?:it|things|everything|its|that's) (?:is )?(?:going|progressing|doing)/i.test(text)) {
    return 'Check work progress';
  }

  // "how is it going" → "Check status"
  if (/how is (?:it|that|everything) going/i.test(text)) {
    return 'Check work status';
  }

  // "checking in" → "Check in on work"
  if (/^(checking in|check in)/i.test(text)) {
    return 'Check in on work';
  }

  // "update all the agents..." → "Update all agents"
  if (/update all (?:the )?(?:agents|bots|services)/i.test(text)) {
    const detailMatch = text.match(/update all (?:the )?(?:agents|bots|services)(?:\s+(?:to|with|for)\s+([\w\s-]+))?/i);
    if (detailMatch && detailMatch[1]) {
      return `Update all agents to ${detailMatch[1].trim()}`;
    }
    return 'Update all agents';
  }

  // "morning X, i'm..." → Remove greeting
  if (/^(morning|good morning|hey|hi)\s+[\w\s,]+,\s*/i.test(text)) {
    text = text.replace(/^(morning|good morning|hey|hi)\s+[\w\s,]+,\s*/i, '');
  }

  // "currently working with X on..." → "Collaborate with X on..."
  text = text.replace(/(?:i'm|i am|im)\s+currently\s+working\s+with\s+([\w\s-]+)\s+on\s*/gi, 'collaborate with $1 on ');

  // "i'm working with X on..." → "Collaborate with X on..."
  text = text.replace(/(?:i'm|i am|im)\s+working\s+with\s+([\w\s-]+)\s+on\s*/gi, 'collaborate with $1 on ');

  // "working on X" → "Work on X"
  text = text.replace(/(?:i'm|i am|im)\s+working\s+on\s*/gi, 'work on ');

  // ===== 2. Remove conversational fluff =====
  text = text.replace(/can you (?:please )?(?:just )?/gi, '');
  text = text.replace(/to make sure\s+/gi, 'verify ');
  text = text.replace(/to ensure\s+/gi, 'ensure ');

  const removePatterns = [
    /^(can we|could you|please|help me|i need|i want|i would like|would you mind|would you be able to)\s*/gi,
    /^(just|simply|basically|essentially)\s*/gi,
    /^(go ahead and|please go ahead and|feel free to)\s*/gi,
    /^(thanks for|thanks|thank you)\s*/gi,
    /^(i think|i believe|i feel)\s*/gi,
    /^(actually|basically|so)\s*/gi,
    /^(right|okay|alright|got it|understood|sure)\s*,?\s*/gi,
  ];

  for (const pattern of removePatterns) {
    text = text.replace(pattern, '');
  }

  // Remove trailing conversational fluff
  text = text.replace(/(?:,?\s*(?:thanks?|please|asap|right now|for me|thank you)?\.?\s*)$/i, '');
  text = text.replace(/\.{3,}$/, ''); // Remove trailing dots

  // ===== 3. Clean and normalize =====
  text = text.replace(/^[.,!?;:\-_\s]+|[.,!?;:\-_\s]+$/g, '').trim();

  // ===== 4. Capitalize action verb =====
  const actionVerbs = [
    'create', 'make', 'build', 'add', 'implement', 'develop', 'set up', 'setup',
    'fix', 'resolve', 'debug', 'solve', 'patch', 'repair',
    'update', 'change', 'modify', 'edit', 'adjust', 'tweak', 'refactor',
    'delete', 'remove', 'delete', 'clear',
    'test', 'verify', 'check', 'validate', 'confirm', 'review', 'audit',
    'deploy', 'release', 'publish', 'push', 'ship',
    'configure', 'setup', 'set up',
    'document', 'write', 'explain', 'describe', 'summarize',
    'analyze', 'investigate', 'explore', 'research', 'study',
    'optimize', 'improve', 'enhance', 'boost', 'speed up',
    'integrate', 'connect', 'link', 'combine', 'merge',
    'monitor', 'watch', 'track', 'observe', 'log',
    'backup', 'restore', 'migrate', 'import', 'export',
    'install', 'uninstall', 'enable', 'disable', 'activate',
    'inform', 'tell', 'notify', 'alert', 'communicate', 'message',
    'collaborate', 'coordinate', 'sync', 'synchronize',
  ];

  const textLower = text.toLowerCase();
  let foundVerb = false;
  for (const verb of actionVerbs) {
    if (textLower.includes(verb)) {
      const verbIndex = textLower.indexOf(verb);
      if (verbIndex === 0 || text[verbIndex - 1] === ' ') {
        // Capitalize this verb
        text = text.substring(0, verbIndex) +
               text.substring(verbIndex, verbIndex + 1).toUpperCase() +
               text.substring(verbIndex + 1);
        foundVerb = true;
        break;
      }
    }
  }

  // If no verb found and first char exists, capitalize it
  if (!foundVerb && text.length > 0) {
    text = text.charAt(0).toUpperCase() + text.slice(1);
  }

  // ===== 5. Capitalize proper nouns =====
  const properNouns = [
    'wzrd', 'wzrd.dev', 'renata', 'remi', 'claude', 'anthropic',
    'openai', 'grok', 'discord', 'telegram', 'dilution', 'edge',
  ];

  // Work on lowercase version of text to find positions, then capitalize original
  let searchLower = text.toLowerCase();
  for (const noun of properNouns) {
    const nounLower = noun.toLowerCase();
    let startIndex = searchLower.indexOf(nounLower);
    while (startIndex !== -1) {
      // Check if it's a word boundary
      const beforeOk = startIndex === 0 || !/\w/.test(text[startIndex - 1]);
      const afterOk = startIndex + nounLower.length === text.length ||
                      !/\w/.test(text[startIndex + nounLower.length]);
      if (beforeOk && afterOk) {
        // Capitalize first letter only (title case)
        const firstChar = text[startIndex].toUpperCase();
        const restOfWord = text.substring(startIndex + 1, startIndex + noun.length).toLowerCase();
        text = text.substring(0, startIndex) +
               firstChar + restOfWord +
               text.substring(startIndex + noun.length);
        // Update lowercase text to reflect the change
        searchLower = text.toLowerCase();
      }
      // Find next occurrence
      startIndex = searchLower.indexOf(nounLower, startIndex + 1);
    }
  }

  // ===== 6. Final cleanup =====
  // Remove any remaining conversational phrases
  text = text.replace(/\s+can\s+you.*$/i, '');
  text = text.replace(/\s+could\s+you.*$/i, '');
  text = text.replace(/\s+would\s+you.*$/i, '');
  text = text.replace(/\s+please.*$/i, '');
  text = text.replace(/\s+thanks?.*$/i, '');
  text = text.replace(/\.\.\.$/, ''); // Remove trailing ellipsis

  // Clean up any double spaces
  text = text.replace(/\s{2,}/g, ' ').trim();

  // Truncate if too long
  const maxLength = 55;
  if (text.length > maxLength) {
    text = text.substring(0, maxLength).trim().replace(/\s+\S*$/, '...');
  }

  // Fallback if empty
  if (!text || text.length < 3) {
    return 'Task update';
  }

  return text;
}
