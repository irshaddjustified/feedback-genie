import { GET, POST } from '@/app/api/projects/route'

// Mocks
jest.mock('@/lib/context', () => ({
  createContext: jest.fn(),
}))

jest.mock('@/lib/prisma', () => ({
  database: {
    projects: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    clients: {
      findById: jest.fn(),
    },
  },
}))

const { createContext } = jest.requireMock('@/lib/context') as { createContext: jest.Mock }
const { database } = jest.requireMock('@/lib/prisma') as any

function mockGetRequest(url: string): any {
  return { url }
}

function mockPostRequest(url: string, body: any): any {
  return {
    url,
    json: async () => body,
  }
}

describe('API /api/projects', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('GET', () => {
    it('401 when unauthenticated', async () => {
      createContext.mockResolvedValueOnce({ session: null })
      const res = await GET(mockGetRequest('http://localhost/api/projects'))
      expect(res.status).toBe(401)
      expect(await res.json()).toEqual({ error: 'Unauthorized' })
    })

    it('200 and queries by clientId when provided', async () => {
      createContext.mockResolvedValueOnce({ session: { userId: 'u' } })
      const data = [{ id: 'p1' }]
      database.projects.findMany.mockResolvedValueOnce(data)
      const res = await GET(mockGetRequest('http://localhost/api/projects?clientId=c1'))
      expect(database.projects.findMany).toHaveBeenCalledWith('c1')
      expect(res.status).toBe(200)
      expect(await res.json()).toEqual(data)
    })
  })

  describe('POST', () => {
    it('401 when unauthenticated', async () => {
      createContext.mockResolvedValueOnce({ session: null })
      const res = await POST(mockPostRequest('http://localhost/api/projects', {}))
      expect(res.status).toBe(401)
      expect(await res.json()).toEqual({ error: 'Unauthorized' })
    })

    it('400 when name missing', async () => {
      createContext.mockResolvedValueOnce({ session: { userId: 'u' } })
      const res = await POST(mockPostRequest('http://localhost/api/projects', { clientId: 'c1' }))
      expect(res.status).toBe(400)
      expect(await res.json()).toEqual({ error: 'Project name is required' })
    })

    it('400 when clientId missing', async () => {
      createContext.mockResolvedValueOnce({ session: { userId: 'u' } })
      const res = await POST(mockPostRequest('http://localhost/api/projects', { name: 'N' }))
      expect(res.status).toBe(400)
      expect(await res.json()).toEqual({ error: 'Client ID is required' })
    })

    it('404 when client not found', async () => {
      createContext.mockResolvedValueOnce({ session: { userId: 'u' } })
      database.clients.findById.mockResolvedValueOnce(null)
      const res = await POST(mockPostRequest('http://localhost/api/projects', { name: 'N', clientId: 'c-miss' }))
      expect(res.status).toBe(404)
      expect(await res.json()).toEqual({ error: 'Client not found' })
    })

    it('201 when created', async () => {
      createContext.mockResolvedValueOnce({ session: { userId: 'u' } })
      database.clients.findById.mockResolvedValueOnce({ id: 'c1' })
      const created = { id: 'p-created' }
      database.projects.create.mockResolvedValueOnce(created)

      const body = { name: 'N', clientId: 'c1', description: 'd', status: 'active' }
      const res = await POST(mockPostRequest('http://localhost/api/projects', body))
      expect(database.projects.create).toHaveBeenCalledWith(expect.objectContaining(body))
      expect(res.status).toBe(201)
      expect(await res.json()).toEqual(created)
    })
  })
})
