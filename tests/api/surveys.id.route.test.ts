import { GET, PUT, DELETE } from '@/app/api/surveys/[id]/route'

// Mocks
jest.mock('@/lib/context', () => ({
  createContext: jest.fn(),
}))

jest.mock('@/lib/prisma', () => ({
  database: {
    surveys: {
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}))

const { createContext } = jest.requireMock('@/lib/context') as { createContext: jest.Mock }
const { database } = jest.requireMock('@/lib/prisma') as any

function mockReq(url: string, body?: any): any {
  return {
    url,
    json: async () => body,
  }
}

const params = { params: { id: 's1' } }

describe('API /api/surveys/[id]', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('GET', () => {
    it('401 when unauthenticated', async () => {
      createContext.mockResolvedValueOnce({ session: null })
      const res = await GET(mockReq('http://x/api/surveys/s1'), params)
      expect(res.status).toBe(401)
      expect(await res.json()).toEqual({ error: 'Unauthorized' })
    })

    it('404 when not found', async () => {
      createContext.mockResolvedValueOnce({ session: { userId: 'u' } })
      database.surveys.findById.mockResolvedValueOnce(null)
      const res = await GET(mockReq('http://x/api/surveys/s1'), params)
      expect(res.status).toBe(404)
      expect(await res.json()).toEqual({ error: 'Survey not found' })
    })

    it('200 with survey when found', async () => {
      createContext.mockResolvedValueOnce({ session: { userId: 'u' } })
      const survey = { id: 's1' }
      database.surveys.findById.mockResolvedValueOnce(survey)
      const res = await GET(mockReq('http://x/api/surveys/s1'), params)
      expect(res.status).toBe(200)
      expect(await res.json()).toEqual(survey)
    })
  })

  describe('PUT', () => {
    it('401 when unauthenticated', async () => {
      createContext.mockResolvedValueOnce({ session: null })
      const res = await PUT(mockReq('http://x/api/surveys/s1', { title: 'T' }), params)
      expect(res.status).toBe(401)
    })

    it('200 with updated survey', async () => {
      createContext.mockResolvedValueOnce({ session: { userId: 'u' } })
      const updated = { id: 's1', title: 'T' }
      database.surveys.update.mockResolvedValueOnce(updated)
      const res = await PUT(mockReq('http://x/api/surveys/s1', { title: 'T' }), params)
      expect(database.surveys.update).toHaveBeenCalledWith('s1', { title: 'T' })
      expect(res.status).toBe(200)
      expect(await res.json()).toEqual(updated)
    })
  })

  describe('DELETE', () => {
    it('401 when unauthenticated', async () => {
      createContext.mockResolvedValueOnce({ session: null })
      const res = await DELETE(mockReq('http://x/api/surveys/s1'), params)
      expect(res.status).toBe(401)
    })

    it('200 with success true', async () => {
      createContext.mockResolvedValueOnce({ session: { userId: 'u' } })
      database.surveys.delete.mockResolvedValueOnce(undefined)
      const res = await DELETE(mockReq('http://x/api/surveys/s1'), params)
      expect(database.surveys.delete).toHaveBeenCalledWith('s1')
      expect(res.status).toBe(200)
      expect(await res.json()).toEqual({ success: true })
    })
  })
})
