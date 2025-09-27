import { z } from 'zod'
import { router, adminProcedure } from '@/lib/trpc'

export const analyticsRouter = router({
  // Dashboard metrics
  dashboard: adminProcedure
    .input(z.object({
      projectId: z.string().optional(),
      dateRange: z.object({
        from: z.date(),
        to: z.date()
      }).optional()
    }))
    .query(async ({ ctx, input }) => {
      const dateFilter = input.dateRange ? {
        submittedAt: {
          gte: input.dateRange.from,
          lte: input.dateRange.to
        }
      } : {}

      const projectFilter = input.projectId ? {
        survey: { projectId: input.projectId }
      } : {}

      const whereClause = { ...dateFilter, ...projectFilter }

      const [
        totalResponses,
        totalSurveys,
        avgSentiment,
        criticalCount,
        recentResponses
      ] = await Promise.all([
        // Total responses
        ctx.prisma.response.count({ where: whereClause }),

        // Total active surveys
        ctx.prisma.survey.count({
          where: {
            status: 'PUBLISHED',
            ...(input.projectId && { projectId: input.projectId })
          }
        }),

        // Average sentiment
        ctx.prisma.aIAnalysis.aggregate({
          where: { response: whereClause },
          _avg: { sentimentScore: true }
        }),

        // Critical feedback count
        ctx.prisma.aIAnalysis.count({
          where: { 
            priority: 'CRITICAL',
            response: whereClause 
          }
        }),

        // Recent responses
        ctx.prisma.response.findMany({
          where: whereClause,
          include: {
            survey: { select: { title: true } },
            aiAnalysis: { select: { sentimentLabel: true, priority: true } }
          },
          orderBy: { submittedAt: 'desc' },
          take: 10
        })
      ])

      return {
        totalResponses,
        totalSurveys,
        avgSentiment: avgSentiment._avg.sentimentScore || 0,
        criticalCount,
        recentResponses
      }
    }),

  // Sentiment trends
  sentimentTrend: adminProcedure
    .input(z.object({
      projectId: z.string().optional(),
      days: z.number().default(30)
    }))
    .query(async ({ ctx, input }) => {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - input.days)

      const sentimentData = await ctx.prisma.$queryRaw`
        SELECT 
          DATE(r.submitted_at) as date,
          AVG(ai.sentiment_score) as avg_sentiment,
          COUNT(*) as response_count
        FROM "Response" r
        JOIN "AIAnalysis" ai ON ai.response_id = r.id
        ${input.projectId ? `JOIN "Survey" s ON s.id = r.survey_id WHERE s.project_id = ${input.projectId}` : ''}
        WHERE r.submitted_at >= ${startDate}
        GROUP BY DATE(r.submitted_at)
        ORDER BY DATE(r.submitted_at)
      `

      return sentimentData
    }),

  // Category analysis
  categoryDistribution: adminProcedure
    .input(z.object({
      projectId: z.string().optional(),
      limit: z.number().default(10)
    }))
    .query(async ({ ctx, input }) => {
      // This is a simplified version - in reality you'd need to parse JSON categories
      const analyses = await ctx.prisma.aIAnalysis.findMany({
        where: input.projectId ? {
          response: {
            survey: { projectId: input.projectId }
          }
        } : undefined,
        select: { categories: true }
      })

      // Process categories (mock implementation)
      const categoryMap = new Map<string, number>()
      
      analyses.forEach(analysis => {
        if (Array.isArray(analysis.categories)) {
          analysis.categories.forEach((cat: any) => {
            const name = cat.name || cat
            categoryMap.set(name, (categoryMap.get(name) || 0) + 1)
          })
        }
      })

      return Array.from(categoryMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, input.limit)
    }),

  // Export data
  export: adminProcedure
    .input(z.object({
      surveyId: z.string().optional(),
      projectId: z.string().optional(),
      format: z.enum(['csv', 'json']).default('csv')
    }))
    .query(async ({ ctx, input }) => {
      const whereClause: any = {}
      
      if (input.surveyId) {
        whereClause.surveyId = input.surveyId
      } else if (input.projectId) {
        whereClause.survey = { projectId: input.projectId }
      }

      const responses = await ctx.prisma.response.findMany({
        where: whereClause,
        include: {
          survey: { select: { title: true } },
          aiAnalysis: true
        },
        orderBy: { submittedAt: 'desc' }
      })

      if (input.format === 'json') {
        return { data: responses, format: 'json' }
      }

      // Convert to CSV format
      const csvHeader = 'Survey,Submitted At,Completion Rate,Sentiment Score,Sentiment Label,Priority'
      const csvRows = responses.map(r => [
        r.survey.title,
        r.submittedAt.toISOString(),
        r.completionRate,
        r.aiAnalysis?.sentimentScore || 'N/A',
        r.aiAnalysis?.sentimentLabel || 'N/A',
        r.aiAnalysis?.priority || 'N/A'
      ].join(','))

      return {
        data: [csvHeader, ...csvRows].join('\n'),
        format: 'csv'
      }
    })
})
