import { GET, POST } from '@/app/api/responses/route'

jest.mock('@/lib/context', () => ({
  createContext: jest.fn(),
}))

jest.mock('@/lib/prisma', () => ({
  database: {
    responses: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}))

const { createContext } = jest.requireMock('@/lib/context') as { createContext: jest.Mock }
const { database } = jest.requireMock('@/lib/prisma') as any

function mockGetRequest(url: string): any {
  return { url }
}

function mockPostRequest(url: string, body: any, ua: string = 'jest-UA', ip: string = '127.0.0.1'): any {
  return {
    url,
    json: async () => body,
    headers: new Map([
      ['user-agent', ua],
      ['x-forwarded-for', ip],
    ]),
  }
}

describe('API /api/responses', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('GET', () => {
    it('401 when unauthenticated', async () => {
      createContext.mockResolvedValueOnce({ session: null })
      const res = await GET(mockGetRequest('http://localhost/api/responses'))
      expect(res.status).toBe(401)
      expect(await res.json()).toEqual({ error: 'Unauthorized' })
    })

    it('200 and returns responses; filters by surveyId when provided', async () => {
      createContext.mockResolvedValueOnce({ session: { userId: 'u' } })
      const rows = [{ id: 'r1' }]
      database.responses.findMany.mockResolvedValueOnce(rows)
      const res = await GET(mockGetRequest('http://localhost/api/responses?surveyId=s1'))
      expect(database.responses.findMany).toHaveBeenCalledWith('s1')
      expect(res.status).toBe(200)
      expect(await res.json()).toEqual(rows)
    })
  })

  describe('POST', () => {
    it('400 when missing required fields', async () => {
      const res = await POST(mockPostRequest('http://localhost/api/responses', { foo: 'bar' }))
      expect(res.status).toBe(400)
      expect(await res.json()).toEqual({ error: 'Survey ID and response data are required' })
    })

    it('201 when created and passes device headers', async () => {
      const created = { id: 'resp-1' }
      database.responses.create.mockResolvedValueOnce(created)

      const body = {
        surveyId: 's1',
        responseData: { q1: 'a' },
        completionRate: 80,
      }
      const res = await POST(
        mockPostRequest('http://localhost/api/responses', body, 'jest-UA', '10.0.0.1')
      )

      expect(database.responses.create).toHaveBeenCalledWith(
        expect.objectContaining({
          surveyId: 's1',
          responseData: { q1: 'a' },
          completionRate: 80,
          deviceInfo: expect.objectContaining({ userAgent: 'jest-UA', ip: '10.0.0.1' }),
        })
      )
      expect(res.status).toBe(201)
      expect(await res.json()).toEqual(created)
    })
  })
})
