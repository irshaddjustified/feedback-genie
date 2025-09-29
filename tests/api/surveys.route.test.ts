import { GET, POST } from '@/app/api/surveys/route'

// Mocks
jest.mock('@/lib/context', () => ({
  createContext: jest.fn(),
}))

jest.mock('@/lib/database', () => ({
  database: {
    surveys: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    projects: {
      findById: jest.fn(),
    },
  },
}))

const { createContext } = jest.requireMock('@/lib/context') as {
  createContext: jest.Mock
}
const { database } = jest.requireMock('@/lib/database') as any

// Helpers to create mock request objects
function mockGetRequest(url: string): any {
  return { url }
}

function mockPostRequest(url: string, body: any): any {
  return {
    url,
    json: async () => body,
  }
}

describe('API /api/surveys', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('GET', () => {
    it('returns 401 if not authenticated', async () => {
      createContext.mockResolvedValueOnce({ session: null })

      const res = await GET(mockGetRequest('http://localhost/api/surveys'))
      expect(res.status).toBe(401)
      const json = await res.json()
      expect(json).toEqual({ error: 'Unauthorized' })
    })

    it('returns surveys when authenticated', async () => {
      createContext.mockResolvedValueOnce({ session: { userId: 'u1' } })
      const surveys = [{ id: 's1' }]
      database.surveys.findMany.mockResolvedValueOnce(surveys)

      const res = await GET(mockGetRequest('http://localhost/api/surveys?projectId=abc123'))
      expect(database.surveys.findMany).toHaveBeenCalledWith('abc123')
      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json).toEqual(surveys)
    })
  })

  describe('POST', () => {
    beforeEach(() => {
      // Ensure crypto.randomUUID is defined in test env
      ;(global as any).crypto = (global as any).crypto || {}
      ;(global as any).crypto.randomUUID = jest.fn(() => 'mock-uuid')
    })

    it('returns 401 if not authenticated', async () => {
      createContext.mockResolvedValueOnce({ session: null })

      const res = await POST(mockPostRequest('http://localhost/api/surveys', {}))
      expect(res.status).toBe(401)
      const json = await res.json()
      expect(json).toEqual({ error: 'Unauthorized' })
    })

    it('validates required fields: missing title', async () => {
      createContext.mockResolvedValueOnce({ session: { userId: 'u1' } })

      const res = await POST(
        mockPostRequest('http://localhost/api/surveys', { projectId: 'p1' })
      )
      expect(res.status).toBe(400)
      const json = await res.json()
      expect(json).toEqual({ error: 'Survey title is required' })
    })

    it('validates required fields: missing projectId', async () => {
      createContext.mockResolvedValueOnce({ session: { userId: 'u1' } })

      const res = await POST(
        mockPostRequest('http://localhost/api/surveys', { title: 'T' })
      )
      expect(res.status).toBe(400)
      const json = await res.json()
      expect(json).toEqual({ error: 'Project ID is required' })
    })

    it('returns 404 if project not found', async () => {
      createContext.mockResolvedValueOnce({ session: { userId: 'u1' } })
      database.projects.findById.mockResolvedValueOnce(null)

      const res = await POST(
        mockPostRequest('http://localhost/api/surveys', { title: 'T', projectId: 'p-miss' })
      )
      expect(res.status).toBe(404)
      const json = await res.json()
      expect(json).toEqual({ error: 'Project not found' })
    })

    it('creates a survey and returns 201', async () => {
      createContext.mockResolvedValueOnce({ session: { userId: 'u1' } })
      database.projects.findById.mockResolvedValueOnce({ id: 'p1' })
      const created = { id: 's-created' }
      database.surveys.create.mockResolvedValueOnce(created)

      const body = {
        projectId: 'p1',
        title: 'T',
        type: 'client-project',
        description: 'desc',
        questions: [],
        isActive: true,
      }
      const res = await POST(
        mockPostRequest('http://localhost/api/surveys', body)
      )
      expect(database.surveys.create).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: 'p1',
          title: 'T',
          type: 'client-project',
          description: 'desc',
          questions: [],
          isActive: true,
          shareLink: expect.any(String),
          status: 'DRAFT',
        })
      )
      expect(res.status).toBe(201)
      const json = await res.json()
      expect(json).toEqual(created)
    })
  })
})
