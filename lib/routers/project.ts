import { z } from 'zod'
import { router, adminProcedure } from '@/lib/trpc'
import { TRPCError } from '@trpc/server'

const createProjectInput = z.object({
  name: z.string().min(1),
  clientName: z.string().min(1),
  description: z.string().optional(),
  startDate: z.date(),
  endDate: z.date().optional(),
  metadata: z.any().optional()
})

const updateProjectInput = z.object({
  id: z.string(),
  name: z.string().optional(),
  clientName: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'ON_HOLD', 'ARCHIVED']).optional(),
  endDate: z.date().optional(),
  metadata: z.any().optional()
})

export const projectRouter = router({
  // Create a new project
  create: adminProcedure
    .input(createProjectInput)
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.prisma.project.create({
        data: input
      })
      return project
    }),

  // Get all projects
  list: adminProcedure
    .input(z.object({
      status: z.enum(['ACTIVE', 'COMPLETED', 'ON_HOLD', 'ARCHIVED']).optional(),
      clientName: z.string().optional(),
      limit: z.number().default(50)
    }))
    .query(async ({ ctx, input }) => {
      const projects = await ctx.prisma.project.findMany({
        where: {
          ...(input.status && { status: input.status }),
          ...(input.clientName && { 
            clientName: { contains: input.clientName, mode: 'insensitive' }
          })
        },
        include: {
          _count: {
            select: { surveys: true }
          }
        },
        take: input.limit,
        orderBy: { createdAt: 'desc' }
      })
      return projects
    }),

  // Get project by ID
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.prisma.project.findUnique({
        where: { id: input.id },
        include: {
          surveys: {
            include: {
              _count: {
                select: { responses: true }
              }
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      })

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found'
        })
      }

      return project
    }),

  // Update project
  update: adminProcedure
    .input(updateProjectInput)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      
      const project = await ctx.prisma.project.update({
        where: { id },
        data
      })

      return project
    }),

  // Delete project
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if project has surveys
      const surveyCount = await ctx.prisma.survey.count({
        where: { projectId: input.id }
      })

      if (surveyCount > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete project with existing surveys'
        })
      }

      await ctx.prisma.project.delete({
        where: { id: input.id }
      })

      return { success: true }
    })
})
