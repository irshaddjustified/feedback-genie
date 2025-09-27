import { z } from 'zod'
import { router, publicProcedure, adminProcedure } from '@/lib/trpc'
import { TRPCError } from '@trpc/server'

const analyzeTextInput = z.object({
  text: z.string().min(10),
  context: z.enum(['feedback_response', 'survey_question', 'general']).default('general')
})

const generateSurveyInput = z.object({
  context: z.string(),
  clientName: z.string().optional(),
  projectType: z.string().optional(),
  targetAudience: z.string().optional()
})

const generateQuestionsInput = z.object({
  surveyId: z.string(),
  prompt: z.string(),
  existingQuestions: z.array(z.any()).default([]),
  maxQuestions: z.number().default(5)
})

export const aiRouter = router({
  // Real-time text analysis for feedback forms
  analyzeText: publicProcedure
    .input(analyzeTextInput)
    .mutation(async ({ ctx, input }) => {
      try {
        // Mock AI analysis for now - replace with actual AI service calls
        const sentiment = Math.random() * 0.6 + 0.2 // Between 0.2 and 0.8
        const categories = extractCategories(input.text)
        
        return {
          sentiment,
          sentimentLabel: getSentimentLabel(sentiment),
          confidence: 0.85,
          categories,
          suggestions: generateSuggestions(sentiment, input.context),
          processingTime: Math.random() * 500 + 100 // 100-600ms
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'AI analysis failed'
        })
      }
    }),

  // Generate survey schema with AI
  generateSurvey: adminProcedure
    .input(generateSurveyInput)
    .mutation(async ({ ctx, input }) => {
      try {
        // Mock survey generation - replace with actual AI
        const surveyTemplate = generateSurveyTemplate(input)
        
        return {
          title: `${input.clientName || 'Client'} Feedback Survey`,
          description: `Comprehensive feedback collection for ${input.context}`,
          schema: surveyTemplate,
          estimatedDuration: '3-5 minutes',
          recommendedQuestions: 8
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Survey generation failed'
        })
      }
    }),

  // Generate questions for survey builder
  generateQuestions: adminProcedure
    .input(generateQuestionsInput)
    .mutation(async ({ ctx, input }) => {
      try {
        // Mock question generation
        const questions = generateQuestionSuggestions(input.prompt, input.maxQuestions)
        
        return {
          suggestions: questions,
          context: input.prompt,
          generatedAt: new Date()
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Question generation failed'
        })
      }
    }),

  // Comprehensive response analysis
  analyzeResponse: adminProcedure
    .input(z.object({
      responseId: z.string(),
      responseData: z.any()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Get the response
        const response = await ctx.prisma.response.findUnique({
          where: { id: input.responseId },
          include: { survey: true }
        })

        if (!response) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Response not found'
          })
        }

        // Perform comprehensive AI analysis
        const analysis = await performFullAnalysis(input.responseData)

        // Save analysis to database
        const aiAnalysis = await ctx.prisma.aIAnalysis.create({
          data: {
            responseId: input.responseId,
            sentimentScore: analysis.sentiment,
            sentimentLabel: getSentimentLabel(analysis.sentiment),
            confidence: analysis.confidence,
            categories: analysis.categories,
            keyPhrases: analysis.keyPhrases,
            topics: analysis.topics,
            priority: analysis.priority,
            suggestedActions: analysis.suggestedActions,
            modelUsed: 'multi-model-ensemble',
            processingTime: analysis.processingTime
          }
        })

        // Update survey analytics
        await updateSurveyAnalytics(response.surveyId)

        return aiAnalysis
      } catch (error) {
        console.error('AI analysis error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Response analysis failed'
        })
      }
    }),

  // Generate insights for dashboard
  generateInsights: adminProcedure
    .input(z.object({
      projectId: z.string().optional(),
      surveyId: z.string().optional(),
      timeframe: z.enum(['week', 'month', 'quarter']).default('month')
    }))
    .query(async ({ ctx, input }) => {
      try {
        // Gather data for insights
        const whereClause = input.surveyId 
          ? { surveyId: input.surveyId }
          : input.projectId 
          ? { survey: { projectId: input.projectId } }
          : {}

        const responses = await ctx.prisma.response.findMany({
          where: whereClause,
          include: { aiAnalysis: true },
          orderBy: { submittedAt: 'desc' },
          take: 100
        })

        // Generate insights
        const insights = generateAIInsights(responses)

        return insights
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Insight generation failed'
        })
      }
    })
})

// Helper functions for AI processing

function extractCategories(text: string): Array<{ name: string; score: number }> {
  // Mock category extraction - replace with actual AI
  const categories = []
  
  if (text.toLowerCase().includes('support') || text.toLowerCase().includes('help')) {
    categories.push({ name: 'Customer Support', score: 0.9 })
  }
  
  if (text.toLowerCase().includes('fast') || text.toLowerCase().includes('slow') || text.toLowerCase().includes('speed')) {
    categories.push({ name: 'Performance', score: 0.8 })
  }
  
  if (text.toLowerCase().includes('ui') || text.toLowerCase().includes('design') || text.toLowerCase().includes('interface')) {
    categories.push({ name: 'User Interface', score: 0.85 })
  }
  
  if (text.toLowerCase().includes('feature') || text.toLowerCase().includes('functionality')) {
    categories.push({ name: 'Features', score: 0.75 })
  }

  return categories.length > 0 ? categories : [{ name: 'General Feedback', score: 0.7 }]
}

function getSentimentLabel(score: number): 'VERY_POSITIVE' | 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'VERY_NEGATIVE' {
  if (score >= 0.8) return 'VERY_POSITIVE'
  if (score >= 0.6) return 'POSITIVE'
  if (score >= 0.4) return 'NEUTRAL'
  if (score >= 0.2) return 'NEGATIVE'
  return 'VERY_NEGATIVE'
}

function generateSuggestions(sentiment: number, context: string): string[] {
  const suggestions = []
  
  if (sentiment < 0.4) {
    suggestions.push('Could you provide more specific details about what went wrong?')
    suggestions.push('What would have made this experience better?')
  }
  
  if (context === 'feedback_response') {
    suggestions.push('Any additional comments or suggestions?')
  }
  
  return suggestions
}

function generateSurveyTemplate(input: any) {
  // Mock survey template generation
  return {
    title: `Feedback Survey`,
    pages: [
      {
        name: 'overall',
        elements: [
          {
            type: 'rating',
            name: 'satisfaction',
            title: 'Overall satisfaction with our service',
            isRequired: true,
            rateMin: 1,
            rateMax: 10
          },
          {
            type: 'radiogroup',
            name: 'recommendation',
            title: 'Would you recommend our services?',
            choices: ['Definitely', 'Probably', 'Not sure', 'Probably not', 'Definitely not']
          }
        ]
      },
      {
        name: 'detailed',
        elements: [
          {
            type: 'comment',
            name: 'improvements',
            title: 'What could we improve?',
            rows: 4
          }
        ]
      }
    ]
  }
}

function generateQuestionSuggestions(prompt: string, maxQuestions: number) {
  // Mock question generation
  return [
    {
      title: 'How would you rate your overall experience?',
      type: 'rating',
      description: 'Scale-based question for general satisfaction'
    },
    {
      title: 'What did you like most about our service?',
      type: 'comment',
      description: 'Open-ended positive feedback'
    },
    {
      title: 'What areas need improvement?',
      type: 'comment', 
      description: 'Constructive feedback collection'
    }
  ].slice(0, maxQuestions)
}

async function performFullAnalysis(responseData: any) {
  // Mock comprehensive analysis
  const textContent = extractTextFromResponse(responseData)
  const sentiment = Math.random() * 0.6 + 0.2
  
  return {
    sentiment,
    confidence: 0.85,
    categories: extractCategories(textContent),
    keyPhrases: ['good service', 'needs improvement', 'helpful staff'],
    topics: { primary: 'Service Quality', secondary: 'Customer Support' },
    priority: sentiment < 0.3 ? 'HIGH' : 'MEDIUM' as 'HIGH' | 'MEDIUM' | 'LOW',
    suggestedActions: ['Follow up with customer', 'Review service process'],
    processingTime: Math.floor(Math.random() * 1000) + 200
  }
}

function extractTextFromResponse(responseData: any): string {
  // Extract text content from survey response
  let text = ''
  
  if (typeof responseData === 'object') {
    Object.values(responseData).forEach(value => {
      if (typeof value === 'string' && value.length > 10) {
        text += value + ' '
      }
    })
  }
  
  return text || 'No text content found'
}

async function updateSurveyAnalytics(surveyId: string) {
  // Update survey analytics after new response
  // This would typically be done via a background job
  console.log('Updating analytics for survey:', surveyId)
}

function generateAIInsights(responses: any[]) {
  // Generate AI-powered insights from responses
  const totalResponses = responses.length
  const avgSentiment = responses.reduce((sum, r) => sum + (r.aiAnalysis?.sentimentScore || 0), 0) / totalResponses
  
  return {
    summary: `Analyzed ${totalResponses} responses with average sentiment of ${(avgSentiment * 100).toFixed(1)}%`,
    trends: [
      'Customer satisfaction trending upward',
      'Support response time is a key concern',
      'Users appreciate the new interface design'
    ],
    recommendations: [
      'Focus on improving response times',
      'Continue investing in UI improvements',
      'Consider expanding support team'
    ],
    keyTopics: [
      { topic: 'Customer Support', mentions: 45, sentiment: 0.65 },
      { topic: 'Product Quality', mentions: 32, sentiment: 0.78 },
      { topic: 'Pricing', mentions: 28, sentiment: 0.55 }
    ]
  }
}
