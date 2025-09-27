import { z } from 'zod'
import { router, publicProcedure, adminProcedure } from '@/lib/trpc'
import { TRPCError } from '@trpc/server'

const submitResponseInput = z.object({
  surveyId: z.string(),
  responseData: z.any(),
  respondentEmail: z.string().email().optional(),
  respondentName: z.string().optional(),
  completionRate: z.number().min(0).max(1).default(0),
  deviceInfo: z.any().optional()
})

export const responseRouter = router({
  // Submit a response (public)
  submit: publicProcedure
    .input(submitResponseInput)
    .mutation(async ({ ctx, input }) => {
      // Verify survey exists and is active
      const survey = await ctx.prisma.survey.findUnique({
        where: { id: input.surveyId }
      })

      if (!survey) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Survey not found'
        })
      }

      if (survey.status !== 'PUBLISHED') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Survey is not accepting responses'
        })
      }

      // Check expiration
      if (survey.expiresAt && survey.expiresAt < new Date()) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Survey has expired'
        })
      }

      // Create the response
      const response = await ctx.prisma.response.create({
        data: {
          surveyId: input.surveyId,
          responseData: input.responseData,
          respondentEmail: input.respondentEmail,
          respondentName: input.respondentName,
          completionRate: input.completionRate,
          deviceInfo: input.deviceInfo,
          submittedAt: new Date()
        }
      })

      // Trigger AI analysis (async)
      // This would typically be done via a queue/background job
      // For now, we'll simulate it
      process.nextTick(async () => {
        try {
          await analyzeResponse(response.id, input.responseData)
        } catch (error) {
          console.error('AI analysis failed:', error)
        }
      })

      return response
    }),

  // Get responses for a survey (admin)
  list: adminProcedure
    .input(z.object({
      surveyId: z.string(),
      includeAnalysis: z.boolean().default(false),
      limit: z.number().default(20),
      cursor: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
      const responses = await ctx.prisma.response.findMany({
        where: { surveyId: input.surveyId },
        include: {
          aiAnalysis: input.includeAnalysis
        },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { submittedAt: 'desc' }
      })

      let nextCursor: typeof input.cursor | undefined = undefined
      if (responses.length > input.limit) {
        const nextItem = responses.pop()
        nextCursor = nextItem!.id
      }

      return { responses, nextCursor }
    }),

  // Get response details (admin)
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const response = await ctx.prisma.response.findUnique({
        where: { id: input.id },
        include: {
          survey: {
            include: {
              project: true,
              event: true
            }
          },
          aiAnalysis: true
        }
      })

      if (!response) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Response not found'
        })
      }

      return response
    }),

  // Get response analytics summary
  getAnalytics: adminProcedure
    .input(z.object({
      surveyId: z.string().optional(),
      projectId: z.string().optional(),
      dateRange: z.object({
        from: z.date(),
        to: z.date()
      }).optional()
    }))
    .query(async ({ ctx, input }) => {
      const whereClause: any = {}
      
      if (input.surveyId) {
        whereClause.surveyId = input.surveyId
      }
      
      if (input.projectId) {
        whereClause.survey = { projectId: input.projectId }
      }
      
      if (input.dateRange) {
        whereClause.submittedAt = {
          gte: input.dateRange.from,
          lte: input.dateRange.to
        }
      }

      const [
        totalResponses,
        completedResponses,
        avgSentiment,
        sentimentDistribution
      ] = await Promise.all([
        // Total responses
        ctx.prisma.response.count({ where: whereClause }),
        
        // Completed responses (completion rate > 0.8)
        ctx.prisma.response.count({
          where: { ...whereClause, completionRate: { gte: 0.8 } }
        }),
        
        // Average sentiment
        ctx.prisma.aIAnalysis.aggregate({
          where: { response: whereClause },
          _avg: { sentimentScore: true }
        }),
        
        // Sentiment distribution
        ctx.prisma.aIAnalysis.groupBy({
          by: ['sentimentLabel'],
          where: { response: whereClause },
          _count: true
        })
      ])

      return {
        totalResponses,
        completedResponses,
        completionRate: totalResponses > 0 ? completedResponses / totalResponses : 0,
        avgSentiment: avgSentiment._avg.sentimentScore || 0,
        sentimentDistribution: sentimentDistribution.reduce((acc, item) => {
          acc[item.sentimentLabel] = item._count
          return acc
        }, {} as Record<string, number>)
      }
    })
})

// Placeholder AI analysis function
async function analyzeResponse(responseId: string, responseData: any) {
  // This would integrate with your AI service
  // For now, return mock analysis
  const mockAnalysis = {
    responseId,
    sentimentScore: Math.random(),
    sentimentLabel: 'NEUTRAL' as const,
    confidence: 0.85,
    categories: [
      { name: 'General Feedback', score: 0.9 },
      { name: 'Feature Request', score: 0.6 }
    ],
    keyPhrases: ['good experience', 'needs improvement'],
    priority: 'MEDIUM' as const,
    suggestedActions: ['Follow up with customer'],
    modelUsed: 'mock-model',
    processingTime: 250
  }

  // In a real implementation, this would call your AI service
  // and then save to the database
  console.log('Mock AI analysis for response:', responseId, mockAnalysis)
}
