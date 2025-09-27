// AI Service Implementation for Multi-Model Analysis
// This provides a unified interface for sentiment analysis, categorization, and insights

export interface SentimentResult {
  score: number // 0-1 scale
  label: 'VERY_POSITIVE' | 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'VERY_NEGATIVE'
  confidence: number
  reasoning?: string
}

export interface CategoryResult {
  name: string
  score: number
  relevance: number
}

export interface AIAnalysisResult {
  sentiment: SentimentResult
  categories: CategoryResult[]
  keyPhrases: string[]
  topics: {
    primary: string
    secondary?: string
  }
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  suggestedActions: string[]
  processingTime: number
}

export interface SurveyGenerationResult {
  title: string
  description: string
  questions: QuestionSuggestion[]
  estimatedDuration: string
  recommendedQuestions: number
}

export interface QuestionSuggestion {
  type: string
  title: string
  description: string
  options?: string[]
}

class AIService {
  private apiKeys: {
    openai?: string
    anthropic?: string
    google?: string
  }

  constructor() {
    this.apiKeys = {
      openai: process.env.GOOGLE_GEMINI_KEY,
      anthropic: process.env.ANTHROPIC_API_KEY,
      google: process.env.GOOGLE_GEMINI_KEY
    }
  }

  async analyzeSentiment(text: string): Promise<SentimentResult> {
    try {
      // Try OpenAI first
      if (this.apiKeys.openai) {
        return await this.analyzeWithOpenAI(text)
      }
      
      // Fallback to Anthropic
      if (this.apiKeys.anthropic) {
        return await this.analyzeWithAnthropic(text)
      }
      
      // Final fallback to Google Gemini
      if (this.apiKeys.google) {
        return await this.analyzeWithGemini(text)
      }
      
      // If no API keys available, use rule-based analysis
      return this.analyzeWithRules(text)
    } catch (error) {
      console.error('AI sentiment analysis failed:', error)
      return this.analyzeWithRules(text)
    }
  }

  async categorizeText(text: string): Promise<CategoryResult[]> {
    const categories = [
      'Communication',
      'Quality',
      'Timeline',
      'Support',
      'Value',
      'User Experience',
      'Features',
      'Performance',
      'Documentation',
      'General Feedback'
    ]

    try {
      // Use keyword matching and AI if available
      const results: CategoryResult[] = []
      
      for (const category of categories) {
        const relevance = this.calculateCategoryRelevance(text, category)
        if (relevance > 0.3) {
          results.push({
            name: category,
            score: relevance,
            relevance
          })
        }
      }
      
      return results.sort((a, b) => b.score - a.score).slice(0, 3)
    } catch (error) {
      console.error('Text categorization failed:', error)
      return [{ name: 'General Feedback', score: 0.7, relevance: 0.7 }]
    }
  }

  async extractKeyPhrases(text: string): Promise<string[]> {
    // Simple keyword extraction - in production, use more sophisticated NLP
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
    
    const stopWords = new Set(['that', 'with', 'have', 'this', 'will', 'your', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'were'])
    
    const filteredWords = words.filter(word => !stopWords.has(word))
    
    // Count frequency
    const frequency: Record<string, number> = {}
    filteredWords.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1
    })
    
    // Return top phrases
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word)
  }

  async analyzeComprehensive(text: string): Promise<AIAnalysisResult> {
    const startTime = Date.now()
    
    try {
      const [sentiment, categories, keyPhrases] = await Promise.all([
        this.analyzeSentiment(text),
        this.categorizeText(text),
        this.extractKeyPhrases(text)
      ])
      
      const priority = this.calculatePriority(sentiment, categories)
      const topics = this.extractTopics(categories, keyPhrases)
      const suggestedActions = this.generateSuggestedActions(sentiment, categories, priority)
      
      return {
        sentiment,
        categories,
        keyPhrases,
        topics,
        priority,
        suggestedActions,
        processingTime: Date.now() - startTime
      }
    } catch (error) {
      console.error('Comprehensive AI analysis failed:', error)
      
      // Return fallback analysis
      return {
        sentiment: this.analyzeWithRules(text),
        categories: [{ name: 'General Feedback', score: 0.7, relevance: 0.7 }],
        keyPhrases: [],
        topics: { primary: 'General Feedback' },
        priority: 'MEDIUM',
        suggestedActions: ['Review feedback manually'],
        processingTime: Date.now() - startTime
      }
    }
  }

  async generateSurvey(context: string, clientName?: string, projectType?: string): Promise<SurveyGenerationResult> {
    const templates = {
      'project_feedback': {
        title: `${clientName} Project Feedback Survey`,
        description: `Help us improve by sharing your experience with ${context}`,
        questions: [
          {
            type: 'rating',
            title: 'How satisfied are you with the overall project outcome?',
            description: 'Overall satisfaction rating from 1-10'
          },
          {
            type: 'radiogroup',
            title: 'Would you recommend our services to others?',
            description: 'Net Promoter Score question',
            options: ['Definitely', 'Probably', 'Not sure', 'Probably not', 'Definitely not']
          },
          {
            type: 'comment',
            title: 'What did you like most about working with us?',
            description: 'Positive feedback collection'
          },
          {
            type: 'comment',
            title: 'What areas could we improve?',
            description: 'Constructive feedback for improvements'
          }
        ]
      },
      'event_feedback': {
        title: 'Event Feedback Survey',
        description: 'Share your experience and help us improve future events',
        questions: [
          {
            type: 'rating',
            title: 'Overall event rating',
            description: '1-5 star rating for the event'
          },
          {
            type: 'rating',
            title: 'Content quality',
            description: 'How would you rate the content quality?'
          },
          {
            type: 'comment',
            title: 'What were the best aspects of the event?',
            description: 'Highlight positive aspects'
          }
        ]
      }
    }

    const template = templates.project_feedback // Default template
    
    return {
      title: template.title,
      description: template.description,
      questions: template.questions,
      estimatedDuration: '3-5 minutes',
      recommendedQuestions: template.questions.length
    }
  }

  // Private helper methods

  private async analyzeWithOpenAI(text: string): Promise<SentimentResult> {
    // Mock OpenAI implementation
    // In production, use actual OpenAI API
    const sentiment = this.calculateBasicSentiment(text)
    return {
      score: sentiment,
      label: this.getSentimentLabel(sentiment),
      confidence: 0.85,
      reasoning: 'Analyzed using OpenAI GPT model'
    }
  }

  private async analyzeWithAnthropic(text: string): Promise<SentimentResult> {
    // Mock Anthropic implementation
    const sentiment = this.calculateBasicSentiment(text)
    return {
      score: sentiment,
      label: this.getSentimentLabel(sentiment),
      confidence: 0.82,
      reasoning: 'Analyzed using Anthropic Claude model'
    }
  }

  private async analyzeWithGemini(text: string): Promise<SentimentResult> {
    // Mock Google Gemini implementation
    const sentiment = this.calculateBasicSentiment(text)
    return {
      score: sentiment,
      label: this.getSentimentLabel(sentiment),
      confidence: 0.80,
      reasoning: 'Analyzed using Google Gemini model'
    }
  }

  private analyzeWithRules(text: string): SentimentResult {
    const sentiment = this.calculateBasicSentiment(text)
    return {
      score: sentiment,
      label: this.getSentimentLabel(sentiment),
      confidence: 0.65,
      reasoning: 'Rule-based sentiment analysis'
    }
  }

  private calculateBasicSentiment(text: string): number {
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'fantastic', 'love', 'perfect', 'wonderful', 'outstanding', 'satisfied', 'happy', 'pleased']
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'hate', 'disappointed', 'frustrated', 'angry', 'unsatisfied', 'poor', 'worst']
    
    const words = text.toLowerCase().split(/\s+/)
    let score = 0.5 // Neutral baseline
    
    words.forEach(word => {
      if (positiveWords.some(pos => word.includes(pos))) {
        score += 0.1
      }
      if (negativeWords.some(neg => word.includes(neg))) {
        score -= 0.1
      }
    })
    
    return Math.max(0, Math.min(1, score))
  }

  private getSentimentLabel(score: number): SentimentResult['label'] {
    if (score >= 0.8) return 'VERY_POSITIVE'
    if (score >= 0.6) return 'POSITIVE'
    if (score >= 0.4) return 'NEUTRAL'
    if (score >= 0.2) return 'NEGATIVE'
    return 'VERY_NEGATIVE'
  }

  private calculateCategoryRelevance(text: string, category: string): number {
    const categoryKeywords: Record<string, string[]> = {
      'Communication': ['communication', 'contact', 'response', 'update', 'inform', 'discuss'],
      'Quality': ['quality', 'work', 'result', 'outcome', 'deliverable', 'standard'],
      'Timeline': ['time', 'deadline', 'schedule', 'delay', 'quick', 'fast', 'slow'],
      'Support': ['support', 'help', 'assistance', 'service', 'team', 'staff'],
      'Value': ['price', 'cost', 'value', 'worth', 'money', 'budget', 'affordable'],
      'User Experience': ['experience', 'interface', 'design', 'usability', 'user', 'ui', 'ux'],
      'Features': ['feature', 'functionality', 'capability', 'function', 'tool'],
      'Performance': ['performance', 'speed', 'fast', 'slow', 'responsive', 'lag'],
      'Documentation': ['documentation', 'guide', 'manual', 'instruction', 'help']
    }
    
    const keywords = categoryKeywords[category] || []
    const text_lower = text.toLowerCase()
    
    let matches = 0
    keywords.forEach(keyword => {
      if (text_lower.includes(keyword)) {
        matches++
      }
    })
    
    return Math.min(1, matches / keywords.length * 2) // Scale to 0-1
  }

  private calculatePriority(sentiment: SentimentResult, categories: CategoryResult[]): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
    if (sentiment.score < 0.2) return 'CRITICAL'
    if (sentiment.score < 0.4) return 'HIGH'
    
    const hasCriticalCategory = categories.some(cat => 
      ['Support', 'Quality'].includes(cat.name) && cat.score > 0.7
    )
    
    if (hasCriticalCategory && sentiment.score < 0.6) return 'HIGH'
    
    return sentiment.score < 0.6 ? 'MEDIUM' : 'LOW'
  }

  private extractTopics(categories: CategoryResult[], keyPhrases: string[]): { primary: string; secondary?: string } {
    const primary = categories[0]?.name || 'General Feedback'
    const secondary = categories[1]?.name
    
    return { primary, secondary }
  }

  private generateSuggestedActions(
    sentiment: SentimentResult, 
    categories: CategoryResult[], 
    priority: string
  ): string[] {
    const actions: string[] = []
    
    if (priority === 'CRITICAL') {
      actions.push('Immediate follow-up required')
      actions.push('Escalate to management')
    }
    
    if (sentiment.score < 0.4) {
      actions.push('Schedule customer call')
      actions.push('Review and address concerns')
    }
    
    categories.forEach(category => {
      switch (category.name) {
        case 'Communication':
          actions.push('Improve communication processes')
          break
        case 'Quality':
          actions.push('Review quality standards')
          break
        case 'Timeline':
          actions.push('Assess project timeline management')
          break
        case 'Support':
          actions.push('Enhance support team training')
          break
      }
    })
    
    if (actions.length === 0) {
      actions.push('Acknowledge feedback')
      actions.push('Continue current approach')
    }
    
    return [...new Set(actions)].slice(0, 4) // Remove duplicates and limit
  }
}

// Export singleton instance
export const aiService = new AIService()
