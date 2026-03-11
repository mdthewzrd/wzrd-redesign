#!/usr/bin/env node
/**
 * Real-Time Conversation Capture for Memory System
 * Captures conversations and stores them in topic-based memory
 * Minimal automation (not semantic enhancement)
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

class ConversationCapturer {
  constructor() {
    this.basePath = path.join(__dirname, '..');
    this.memoryPath = path.join(this.basePath, 'memory');
    this.topicsPath = path.join(this.memoryPath, 'topics');
    
    // Ensure directories exist
    if (!fs.existsSync(this.topicsPath)) {
      fs.mkdirSync(this.topicsPath, { recursive: true });
    }
  }

  /**
   * Capture conversation entry
   */
  async capture(entry) {
    console.log('💾 Capturing conversation to memory...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const date = new Date().toISOString().split('T')[0];
    
    try {
      // Determine topic
      const topic = this.determineTopic(entry.conversation || entry.query || '');
      
      // Create topic directory if needed
      const topicDir = path.join(this.topicsPath, topic);
      if (!fs.existsSync(topicDir)) {
        fs.mkdirSync(topicDir, { recursive: true });
      }
      
      // Create conversation file
      const conversationFile = path.join(topicDir, `conversation-${timestamp}.json`);
      
      // Extract key information
      const summary = this.extractSummary(entry);
      const keyPoints = this.extractKeyPoints(entry);
      
      const conversationData = {
        metadata: {
          capturedAt: new Date().toISOString(),
          topic: topic,
          source: entry.source || 'direct-capture',
          participants: entry.participants || ['user', 'remi'],
          duration: entry.duration || 0,
          tokenEstimate: this.estimateTokens(entry)
        },
        summary: summary,
        keyPoints: keyPoints,
        rawEntry: entry // Store raw for reference
      };
      
      // Save conversation
      fs.writeFileSync(conversationFile, JSON.stringify(conversationData, null, 2));
      
      // Update topic index
      this.updateTopicIndex(topic, conversationFile, summary);
      
      // Update daily log
      this.updateDailyLog(date, topic, summary);
      
      console.log(`✅ Captured to: memory/topics/${topic}/conversation-${timestamp}.json`);
      console.log(`📝 Summary: ${summary.substring(0, 100)}...`);
      
      return {
        success: true,
        file: conversationFile,
        topic: topic,
        summary: summary
      };
      
    } catch (error) {
      console.error('❌ Failed to capture conversation:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Determine topic from conversation content
   */
  determineTopic(content) {
    const contentLower = content.toLowerCase();
    
    // Topic mapping
    if (contentLower.includes('skill') || contentLower.includes('token') || contentLower.includes('loading')) {
      return 'implementation/skills';
    } else if (contentLower.includes('phase') || contentLower.includes('roadmap') || contentLower.includes('plan')) {
      return 'planning/roadmap';
    } else if (contentLower.includes('memory') || contentLower.includes('grep') || contentLower.includes('search')) {
      return 'implementation/memory';
    } else if (contentLower.includes('code') || contentLower.includes('function') || contentLower.includes('implement')) {
      return 'implementation/coding';
    } else if (contentLower.includes('test') || contentLower.includes('debug') || contentLower.includes('bug')) {
      return 'implementation/debugging';
    } else if (contentLower.includes('api') || contentLower.includes('endpoint') || contentLower.includes('server')) {
      return 'implementation/api';
    } else if (contentLower.includes('ui') || contentLower.includes('react') || contentLower.includes('component')) {
      return 'implementation/ui';
    } else {
      return 'general/conversations';
    }
  }

  /**
   * Extract summary from conversation
   */
  extractSummary(entry) {
    const content = entry.conversation || entry.query || '';
    
    // Simple extraction: first 3 sentences or 200 chars
    const sentences = content.split(/[.!?]+/);
    if (sentences.length >= 3) {
      return sentences.slice(0, 3).join('. ') + '.';
    } else {
      return content.substring(0, 200) + (content.length > 200 ? '...' : '');
    }
  }

  /**
   * Extract key points
   */
  extractKeyPoints(entry) {
    const content = entry.conversation || entry.query || '';
    const lines = content.split('\n');
    
    const keyPoints = [];
    
    // Look for lines with key markers
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.length > 10) { // Reasonable length
        // Look for decision indicators
        if (trimmed.toLowerCase().includes('decision:') || 
            trimmed.toLowerCase().includes('decided') ||
            trimmed.toLowerCase().includes('agreed') ||
            trimmed.toLowerCase().includes('conclusion:')) {
          keyPoints.push(trimmed);
        }
        
        // Look for action items
        if (trimmed.includes('✅') || trimmed.includes('❌') || trimmed.includes('⏳') ||
            trimmed.toLowerCase().includes('next:') || trimmed.toLowerCase().includes('action:')) {
          keyPoints.push(trimmed);
        }
      }
    }
    
    // Limit to 5 key points
    return keyPoints.slice(0, 5);
  }

  /**
   * Estimate token count
   */
  estimateTokens(entry) {
    const text = JSON.stringify(entry);
    // Rough estimate: 1.3 tokens per word, ~5 chars per word
    return Math.ceil(text.length / 5 * 1.3);
  }

  /**
   * Update topic index
   */
  updateTopicIndex(topic, filePath, summary) {
    const topicParts = topic.split('/');
    let currentPath = this.topicsPath;
    
    // Navigate/create nested directories
    for (const part of topicParts) {
      currentPath = path.join(currentPath, part);
      if (!fs.existsSync(currentPath)) {
        fs.mkdirSync(currentPath);
      }
      
      // Update index in each level
      const indexPath = path.join(currentPath, 'INDEX.md');
      const entry = {
        file: path.relative(currentPath, filePath),
        summary: summary.substring(0, 100),
        captured: new Date().toISOString()
      };
      
      let index = [];
      if (fs.existsSync(indexPath)) {
        try {
          const content = fs.readFileSync(indexPath, 'utf8');
          // Simple line-based index
          const lines = content.split('\n').filter(l => l.trim());
          index = lines.map(line => {
            try {
              return JSON.parse(line);
            } catch (e) {
              return null;
            }
          }).filter(Boolean);
        } catch (e) {
          // Start fresh if corrupted
        }
      }
      
      // Add new entry
      index.unshift(entry);
      
      // Keep only last 20 entries
      index = index.slice(0, 20);
      
      // Save index
      const indexContent = index.map(entry => JSON.stringify(entry)).join('\n');
      fs.writeFileSync(indexPath, indexContent);
    }
  }

  /**
   * Update daily log
   */
  updateDailyLog(date, topic, summary) {
    const dailyLogPath = path.join(this.memoryPath, 'daily', `${date}.log`);
    const dailyDir = path.join(this.memoryPath, 'daily');
    
    if (!fs.existsSync(dailyDir)) {
      fs.mkdirSync(dailyDir, { recursive: true });
    }
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      topic: topic,
      summary: summary,
      length: summary.length
    };
    
    fs.appendFileSync(dailyLogPath, JSON.stringify(logEntry) + '\n');
  }

  /**
   * Compact old conversations
   */
  async compactConversations(daysToKeep = 30, deleteCompressedAfter = 90) {
    console.log('🗜️ Compacting old conversations...');
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const cutoffTime = cutoffDate.getTime();
    
    const deleteCutoffDate = new Date();
    deleteCutoffDate.setDate(deleteCutoffDate.getDate() - deleteCompressedAfter);
    const deleteCutoffTime = deleteCutoffDate.getTime();
    
    let compacted = 0;
    let deleted = 0;
    
    const self = this; // Capture 'this' for nested function
    
    function processDir(dir) {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          processDir(fullPath);
        } else if (stat.isFile()) {
          try {
            // 1. Delete old compressed files (> deleteCompressedAfter days)
            if (item.includes('-compressed') && stat.mtimeMs < deleteCutoffTime) {
              fs.unlinkSync(fullPath);
              deleted++;
              console.log(`  • Deleted old compressed: ${path.relative(self.memoryPath, fullPath)}`);
            }
            // 2. Compact regular conversation files (> daysToKeep days)
            else if (item.includes('conversation-') && !item.includes('-compressed') && stat.mtimeMs < cutoffTime) {
              // Read and compress
              const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
              
              // Create compressed version (keep only metadata + summary)
              const compressed = {
                metadata: data.metadata,
                summary: data.summary,
                keyPoints: data.keyPoints,
                compressed: true,
                originalSize: JSON.stringify(data).length,
                compressedSize: 0
              };
              
              compressed.compressedSize = JSON.stringify(compressed).length;
              
              // Save compressed version (only if not already compressed)
              let compressedPath = fullPath;
              if (!fullPath.includes('-compressed')) {
                compressedPath = fullPath.replace('.json', '-compressed.json');
              }
              fs.writeFileSync(compressedPath, JSON.stringify(compressed, null, 2));
              
              // Delete original
              fs.unlinkSync(fullPath);
              compacted++;
              
              console.log(`  • Compacted: ${path.relative(self.memoryPath, fullPath)}`);
            }
          } catch (error) {
            console.error(`  ⚠️ Failed to process ${item}:`, error.message);
          }
        }
      }
    }
    
    processDir(this.topicsPath);
    
    console.log(`✅ Compacted ${compacted} conversations, deleted ${deleted} old compressed files`);
    return { compacted, deleted };
  }

  /**
   * Search captured conversations
   */
  async search(query) {
    console.log(`🔍 Searching captured conversations for: "${query}"`);
    
    const results = [];
    const queryLower = query.toLowerCase();
    
    function searchDir(dir) {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          searchDir(fullPath);
        } else if (stat.isFile() && (item.includes('conversation-') || item.includes('-compressed'))) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const data = JSON.parse(content);
            
            // Search in summary and key points
            const searchText = [
              data.summary,
              ...(data.keyPoints || []),
              JSON.stringify(data.metadata || {})
            ].join(' ').toLowerCase();
            
            if (searchText.includes(queryLower)) {
              results.push({
                file: path.relative(this.memoryPath, fullPath),
                topic: data.metadata?.topic || 'unknown',
                summary: data.summary,
                timestamp: data.metadata?.capturedAt || stat.mtime.toISOString(),
                score: this.calculateRelevance(searchText, queryLower)
              });
            }
          } catch (e) {
            // Skip corrupted files
          }
        }
      }
    }
    
    searchDir.call(this, this.topicsPath);
    
    // Sort by relevance and recency
    results.sort((a, b) => {
      const recencyA = new Date(a.timestamp).getTime();
      const recencyB = new Date(b.timestamp).getTime();
      return (b.score * 0.7 + (recencyB / 1000000000000) * 0.3) - 
             (a.score * 0.7 + (recencyA / 1000000000000) * 0.3);
    });
    
    console.log(`  Found ${results.length} matches`);
    if (results.length > 0) {
      console.log('  Top matches:');
      results.slice(0, 3).forEach((r, i) => {
        console.log(`    ${i+1}. ${r.file} (${r.topic})`);
        console.log(`       ${r.summary.substring(0, 80)}...`);
      });
    }
    
    return results;
  }

  /**
   * Calculate relevance score
   */
  calculateRelevance(text, query) {
    // Simple frequency-based relevance
    const words = query.split(/\s+/);
    let score = 0;
    
    for (const word of words) {
      if (word.length > 2) { // Ignore short words
        const regex = new RegExp(word, 'gi');
        const matches = (text.match(regex) || []).length;
        score += matches * 0.1;
      }
    }
    
    return Math.min(score, 1.0);
  }
}

// CLI interface
if (require.main === module) {
  const capturer = new ConversationCapturer();
  const command = process.argv[2];
  
  switch (command) {
    case 'capture':
      // Capture from stdin or arguments
      const conversation = process.argv[3] || '';
      const source = process.argv[4] || 'cli';
      
      if (!conversation && process.stdin.isTTY) {
        console.error('Error: No conversation provided');
        console.log('Usage: node capture-conversation.js capture "conversation text" [source]');
        process.exit(1);
      }
      
      if (!conversation && !process.stdin.isTTY) {
        // Read from stdin
        let input = '';
        process.stdin.on('data', chunk => {
          input += chunk;
        });
        
        process.stdin.on('end', () => {
          capturer.capture({
            conversation: input,
            source: source,
            participants: ['user', 'remi']
          }).then(() => process.exit(0));
        });
      } else {
        capturer.capture({
          conversation: conversation,
          source: source,
          participants: ['user', 'remi']
        }).then(() => process.exit(0));
      }
      break;
      
    case 'search':
      const query = process.argv[3];
      if (!query) {
        console.error('Error: No query provided');
        console.log('Usage: node capture-conversation.js search "query text"');
        process.exit(1);
      }
      
      capturer.search(query)
        .then(() => process.exit(0));
      break;
      
    case 'compact':
      const days = process.argv[3] ? parseInt(process.argv[3]) : 30;
      capturer.compactConversations(days)
        .then(() => process.exit(0));
      break;
      
    case 'test':
      // Test capture
      capturer.capture({
        conversation: 'Test conversation about memory system implementation.',
        source: 'test',
        participants: ['tester', 'system']
      }).then(() => {
        console.log('\n🧪 Test complete');
        process.exit(0);
      });
      break;
      
    default:
      console.log('Usage: node capture-conversation.js [command]');
      console.log('Commands:');
      console.log('  capture "text" [source] - Capture conversation');
      console.log('  search "query"         - Search captured conversations');
      console.log('  compact [days]         - Compact old conversations');
      console.log('  test                   - Run test capture');
      break;
  }
}

module.exports = ConversationCapturer;