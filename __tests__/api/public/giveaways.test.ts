import { createMocks } from 'node-mocks-http'
import handler from '../../../src/pages/api/public/giveaways'

// Mock the database module
jest.mock('../../../src/lib/db', () => ({
  dbQueries: {
    getActiveGiveaways: {
      all: jest.fn(),
    },
  },
}))

// Import after mocking
import { dbQueries } from '../../../src/lib/db'
import { Giveaway } from '../../../src/types'

const mockGetActiveGiveaways = dbQueries.getActiveGiveaways.all as jest.MockedFunction<() => Giveaway[]>

describe('/api/public/giveaways', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 405 for OPTIONS request', async () => {
    const { req, res } = createMocks({
      method: 'OPTIONS',
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(405)
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: 'Method not allowed'
    })
  })

  it('should return 405 for non-GET methods', async () => {
    const { req, res } = createMocks({
      method: 'POST',
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(405)
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: 'Method not allowed'
    })
  })

  it('should return active giveaways successfully', async () => {
    const mockGiveaways: Giveaway[] = [
      {
        id: '1',
        title: 'Test Giveaway 1',
        description: 'Description 1',
        status: 'active',
        winner_id: null,
        entry_count: 5,
        created_at: Date.now(),
        updated_at: Date.now()
      },
      {
        id: '2',
        title: 'Test Giveaway 2',
        description: 'Description 2',
        status: 'active',
        winner_id: null,
        entry_count: 10,
        created_at: Date.now(),
        updated_at: Date.now()
      }
    ]

    mockGetActiveGiveaways.mockReturnValue(mockGiveaways)

    const { req, res } = createMocks({
      method: 'GET',
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      data: mockGiveaways
    })
    expect(mockGetActiveGiveaways).toHaveBeenCalled()
  })

  it('should return empty array when no active giveaways', async () => {
    mockGetActiveGiveaways.mockReturnValue([])

    const { req, res } = createMocks({
      method: 'GET',
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      data: []
    })
    expect(mockGetActiveGiveaways).toHaveBeenCalled()
  })

  it('should handle database errors gracefully', async () => {
    mockGetActiveGiveaways.mockImplementation(() => {
      throw new Error('Database connection error')
    })

    const { req, res } = createMocks({
      method: 'GET',
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(500)
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: 'Failed to fetch giveaways'
    })
  })
})
