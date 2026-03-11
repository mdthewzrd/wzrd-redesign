/**
 * Optimized Pipeline - Performance-focused message processing
 * Key improvements:
 * 1. Async skill loading (non-blocking)
 * 2. Immediate response streaming
 * 3. Parallel processing
 * 4. Progressive enhancement
 */

const AsyncSkillLoader = require('../bin/async-skill-loader.js');

export interface PipelineOptions {
  enableStreaming?: boolean;
  skillLoadTimeout?: number; // ms to wait for skills
  immediateResponseThreshold?: number; // ms to send "Thinking..."
  cacheSkills?: boolean;
}

export interface PipelineMetrics {
  totalTime: number;
  skillLoadTime: number;
  apiCallTime: number;
  modeDetectionTime: number;
  responseProcessingTime: number;
  immediateResponseSent: boolean;
  skillsLoaded: number;
  cacheHit: boolean;
}

export class OptimizedPipeline {
  private skillLoader;
  private options;
  private metrics: PipelineMetrics[] = [];
  
  constructor(options: PipelineOptions = {}) {
    this.skillLoader = new AsyncSkillLoader();
    this.options = {
      enableStreaming: true,
      skillLoadTimeout: 2000, // Don't wait >2s for skills
      immediateResponseThreshold: 100, // Send "Thinking..." after 100ms
      cacheSkills: true,
      ...options
    };
  }
  
  /**
   * Process a message with performance optimizations
   */
  async processMessage(
    message: string, 
    onProgress?: (chunk: string, type: 'immediate' | 'enhanced' | 'final') => void,
    apiCallFn?: (query: string, context?: any) => Promise<string>
  ): Promise<{
    response: string;
    metrics: PipelineMetrics;
    mode: string;
    skills: any[];
  }> {
    const startTime = Date.now();
    const metrics: PipelineMetrics = {
      totalTime: 0,
      skillLoadTime: 0,
      apiCallTime: 0,
      modeDetectionTime: 0,
      responseProcessingTime: 0,
      immediateResponseSent: false,
      skillsLoaded: 0,
      cacheHit: false
    };
    
    try {
      // PHASE 1: Immediate acknowledgment (if streaming enabled)
      if (this.options.enableStreaming && onProgress) {
        setTimeout(() => {
          onProgress("Let me think about that...", 'immediate');
          metrics.immediateResponseSent = true;
        }, this.options.immediateResponseThreshold);
      }
      
      // PHASE 2: Start API call IMMEDIATELY (don't wait for skills)
      const apiCallStart = Date.now();
      let apiPromise: Promise<string>;
      
      if (apiCallFn) {
        // Use provided API function
        apiPromise = apiCallFn(message, { minimalContext: true });
      } else {
        // Mock API call for testing
        apiPromise = this.mockApiCall(message);
      }
      
      // PHASE 3: Load skills ASYNCHRONOUSLY (in parallel with API call)
      const skillLoadStart = Date.now();
      const skillLoadPromise = this.skillLoader.loadSkillsForMessage(message);
      
      // Race: Skills vs Timeout
      const skillsResult = await Promise.race([
        skillLoadPromise,
        new Promise<{ skills: any[]; error?: string }>(resolve => 
          setTimeout(() => resolve({ 
            skills: [], 
            error: 'Skill load timeout' 
          }), this.options.skillLoadTimeout)
        )
      ]);
      
      metrics.skillLoadTime = Date.now() - skillLoadStart;
      metrics.skillsLoaded = skillsResult.skills?.length || 0;
      
      // PHASE 4: Get API response
      const apiResponse = await apiPromise;
      metrics.apiCallTime = Date.now() - apiCallStart;
      
      // PHASE 5: Enhance response with skills (if loaded)
      let enhancedResponse = apiResponse;
      let enhancementApplied = false;
      
      if (skillsResult.skills && skillsResult.skills.length > 0) {
        const enhanceStart = Date.now();
        enhancedResponse = this.enhanceResponseWithSkills(apiResponse, skillsResult.skills);
        metrics.responseProcessingTime = Date.now() - enhanceStart;
        enhancementApplied = true;
      }
      
      // PHASE 6: Send enhanced response
      if (onProgress && enhancementApplied) {
        onProgress(enhancedResponse, 'enhanced');
      } else if (onProgress) {
        onProgress(enhancedResponse, 'final');
      }
      
      // Calculate final metrics
      metrics.totalTime = Date.now() - startTime;
      
      // Get cache stats
      const loaderMetrics = this.skillLoader.getMetrics();
      metrics.cacheHit = loaderMetrics.cacheHitRate > 0.5;
      
      // Store metrics
      this.metrics.push(metrics);
      
      return {
        response: enhancedResponse,
        metrics,
        mode: skillsResult.mode || 'CHAT',
        skills: skillsResult.skills || []
      };
      
    } catch (error) {
      console.error('Pipeline error:', error);
      
      // Return fallback response
      metrics.totalTime = Date.now() - startTime;
      
      return {
        response: `I encountered an error: ${(error as Error).message}. How can I help?`,
        metrics,
        mode: 'CHAT',
        skills: []
      };
    }
  }
  
  /**
   * Mock API call for testing
   */
  private async mockApiCall(message: string): Promise<string> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate response based on message
    const messageLower = message.toLowerCase();
    
    if (messageLower.includes('hey') || messageLower.includes('hi') || messageLower.includes('hello')) {
      return "Hi there! 👋 How can I help you today?";
    }
    
    if (messageLower.includes('python') && messageLower.includes('function')) {
      return "Here's a Python function:\n\n```python\ndef example_function():\n    return 'Hello from Python!'\n```";
    }
    
    if (messageLower.includes('design') && messageLower.includes('database')) {
      return "For a database schema, you'll need tables for users, products, orders, etc.";
    }
    
    return "I understand your query. Let me provide some helpful information about that topic.";
  }
  
  /**
   * Enhance response with loaded skills
   */
  private enhanceResponseWithSkills(response: string, skills: any[]): string {
    if (!skills || skills.length === 0) return response;
    
    const skillNames = skills.map(skill => skill.name).filter(Boolean);
    
    // Add skill-based enhancement
    let enhanced = response;
    
    // Add mode/context awareness
    enhanced += `\n\n---\n`;
    enhanced += `*Response enhanced using ${skillNames.length} skills: ${skillNames.join(', ')}*`;
    enhanced += `\n---\n`;
    
    return enhanced;
  }
  
  /**
   * Get performance metrics summary
   */
  getPerformanceMetrics() {
    if (this.metrics.length === 0) {
      return {
        averageTotalTime: 0,
        averageSkillLoadTime: 0,
        averageApiCallTime: 0,
        totalProcessed: 0,
        cacheHitRate: 0
      };
    }
    
    const avg = (key: keyof PipelineMetrics) => {
      const values = this.metrics.map(m => m[key]);
      const numericValues = values.filter(v => typeof v === 'number') as number[];
      return numericValues.reduce((sum, v) => sum + v, 0) / numericValues.length;
    };
    
    const cacheHits = this.metrics.filter(m => m.cacheHit).length;
    
    return {
      averageTotalTime: avg('totalTime'),
      averageSkillLoadTime: avg('skillLoadTime'),
      averageApiCallTime: avg('apiCallTime'),
      averageResponseProcessingTime: avg('responseProcessingTime'),
      immediateResponseRate: this.metrics.filter(m => m.immediateResponseSent).length / this.metrics.length,
      averageSkillsLoaded: avg('skillsLoaded'),
      cacheHitRate: cacheHits / this.metrics.length,
      totalProcessed: this.metrics.length
    };
  }
  
  /**
   * Clear metrics
   */
  clearMetrics() {
    this.metrics = [];
    console.log('Pipeline metrics cleared');
  }
  
  /**
   * Get skill loader instance
   */
  getSkillLoader() {
    return this.skillLoader;
  }
  
  /**
   * Test the pipeline with a simple query
   */
  async testPipeline(message = 'hey remi') {
    console.log(`Testing pipeline with: "${message}"`);
    
    const chunks: Array<{type: string, content: string, timestamp: number}> = [];
    
    const result = await this.processMessage(
      message,
      (chunk, type) => {
        chunks.push({
          type,
          content: chunk,
          timestamp: Date.now()
        });
        console.log(`[${type.toUpperCase()}] ${chunk}`);
      }
    );
    
    console.log('\n=== PIPELINE TEST RESULTS ===');
    console.log(`Response: ${result.response.substring(0, 100)}...`);
    console.log(`Mode: ${result.mode}`);
    console.log(`Skills loaded: ${result.skills.length}`);
    console.log(`Total time: ${result.metrics.totalTime}ms`);
    console.log(`Skill load time: ${result.metrics.skillLoadTime}ms`);
    console.log(`API call time: ${result.metrics.apiCallTime}ms`);
    
    console.log('\n=== CHUNK TIMELINE ===');
    chunks.forEach((chunk, i) => {
      const delay = i === 0 ? 0 : chunk.timestamp - chunks[i-1].timestamp;
      console.log(`${i+1}. ${chunk.type} (${delay}ms delay): ${chunk.content.substring(0, 50)}...`);
    });
    
    return result;
  }
}

// Export for testing
if (require.main === module) {
  const pipeline = new OptimizedPipeline();
  
  pipeline.testPipeline()
    .then(() => {
      console.log('\nPipeline test completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { OptimizedPipeline };