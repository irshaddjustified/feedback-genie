import { router } from '@/lib/trpc'
import { surveyRouter } from './survey'
import { responseRouter } from './response'
import { projectRouter } from './project'
import { analyticsRouter } from './analytics'
import { aiRouter } from './ai'

export const appRouter = router({
  survey: surveyRouter,
  response: responseRouter,
  project: projectRouter,
  analytics: analyticsRouter,
  ai: aiRouter
})

export type AppRouter = typeof appRouter
