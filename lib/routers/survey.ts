import { z } from 'zod'
import { router, publicProcedure, adminProcedure } from '@/lib/trpc'
import { TRPCError } from '@trpc/server'

const createSurveyInput = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  projectId: z.string().optional(),
  eventId: z.string().optional(),
  templateId: z.string(),
  type: z.enum(['PROJECT_FEEDBACK', 'EVENT_FEEDBACK', 'CUSTOM']).default('CUSTOM')
})

const updateSurveyInput = z.object({
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  schema: z.any().optional(),
  settings: z.any().optional()
})

const publishSurveyInput = z.object({
  id: z.string(),
  expiresAt: z.date().optional(),
  settings: z.any().optional()
})

export const surveyRouter = router({
  // Create a new survey
  create: adminProcedure
    .input(createSurveyInput)
    .mutation(async ({ ctx, input }) => {
      const survey = await ctx.prisma.survey.create({
        data: {
          title: input.title,
          description: input.description,
          templateId: input.templateId,
          projectId: input.projectId,
          eventId: input.eventId,
          status: 'DRAFT'
        },
        include: {
          template: true,
          project: true,
          event: true
        }
      })

      return survey
    }),

  // Get all surveys (admin)
  list: adminProcedure
    .input(z.object({
      status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED']).optional(),
      projectId: z.string().optional(),
      limit: z.number().default(20),
      cursor: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
      const surveys = await ctx.prisma.survey.findMany({
        where: {
          ...(input.status && { status: input.status }),
          ...(input.projectId && { projectId: input.projectId })
        },
        include: {
          template: true,
          project: true,
          event: true,
          _count: {
            select: { responses: true }
          }
        },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: 'desc' }
      })

      let nextCursor: typeof input.cursor | undefined = undefined
      if (surveys.length > input.limit) {
        const nextItem = surveys.pop()
        nextCursor = nextItem!.id
      }

      return { surveys, nextCursor }
    }),

  // Get survey by share link (public)
  getByShareLink: publicProcedure
    .input(z.object({ shareLink: z.string() }))
    .query(async ({ ctx, input }) => {
      const survey = await ctx.prisma.survey.findUnique({
        where: { shareLink: input.shareLink },
        include: {
          template: true,
          project: true,
          event: true
        }
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
          message: 'Survey is not available'
        })
      }

      // Check expiration
      if (survey.expiresAt && survey.expiresAt < new Date()) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Survey has expired'
        })
      }

      return survey
    }),

  // Get survey details (admin)
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const survey = await ctx.prisma.survey.findUnique({
        where: { id: input.id },
        include: {
          template: true,
          project: true,
          event: true,
          analytics: true,
          responses: {
            include: { aiAnalysis: true },
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }
      })

      if (!survey) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Survey not found'
        })
      }

      return survey
    }),

  // Update survey
  update: adminProcedure
    .input(updateSurveyInput)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      
      const survey = await ctx.prisma.survey.update({
        where: { id },
        data,
        include: {
          template: true,
          project: true,
          event: true
        }
      })

      return survey
    }),

  // Publish survey
  publish: adminProcedure
    .input(publishSurveyInput)
    .mutation(async ({ ctx, input }) => {
      const survey = await ctx.prisma.survey.update({
        where: { id: input.id },
        data: {
          status: 'PUBLISHED',
          publishedAt: new Date(),
          expiresAt: input.expiresAt,
          settings: input.settings
        }
      })

      return survey
    }),

  // Close survey
  close: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const survey = await ctx.prisma.survey.update({
        where: { id: input.id },
        data: { status: 'CLOSED' }
      })

      return survey
    }),

  // Delete survey
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // First delete related data
      await ctx.prisma.aIAnalysis.deleteMany({
        where: { 
          response: { surveyId: input.id } 
        }
      })
      
      await ctx.prisma.response.deleteMany({
        where: { surveyId: input.id }
      })

      await ctx.prisma.surveyAnalytics.deleteMany({
        where: { surveyId: input.id }
      })

      // Then delete the survey
      await ctx.prisma.survey.delete({
        where: { id: input.id }
      })

      return { success: true }
    })
})
