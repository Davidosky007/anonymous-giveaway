import { createMocks } from 'node-mocks-http'
import handler from '../../../../src/pages/api/public/enter/[id]'

// Mock the modules
jest.mock('../../../../src/lib/db', () => ({
  dbQueries: {
    getGiveawayById: {
      get: jest.fn(),
    },
    checkIPEntry: {
      get: jest.fn(),
    },
    createEntry: {
      run: jest.fn(),
    },
  },
}))

jest.mock('../../../../src/lib/utils', () => ({
  generateId: jest.fn(),
  getClientIP: jest.fn(),
}))

jest.mock('../../../../src/lib/auth', () => ({
  hashIP: jest.fn(),
}))

// Import after mocking
import { dbQueries } from '../../../../src/lib/db'
import { generateId, getClientIP } from '../../../../src/lib/utils'
import { hashIP } from '../../../../src/lib/auth'

const mockGetGiveawayById = dbQueries.getGiveawayById.get as jest.MockedFunction<(id: string) => unknown>
const mockCheckIPEntry = dbQueries.checkIPEntry.get as jest.MockedFunction<(giveawayId: string, ipHash: string) => unknown>
const mockCreateEntry = dbQueries.createEntry.run as jest.MockedFunction<(...args: unknown[]) => unknown>
const mockGenerateId = generateId as jest.MockedFunction<() => string>
const mockGetClientIP = getClientIP as jest.MockedFunction<(req: unknown) => string>
const mockHashIP = hashIP as jest.MockedFunction<(ip: string) => string>

describe('/api/public/enter/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGenerateId.mockReturnValue('generated-id')
    mockGetClientIP.mockReturnValue('127.0.0.1')
    mockHashIP.mockReturnValue('hashed-ip')
  })

  it('should return 405 for non-POST methods', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { id: 'giveaway-123' }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(405)
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: 'Method not allowed'
    })
  })

  it('should return 400 when giveaway ID is missing', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      query: {}
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: 'Invalid giveaway ID'
    })
  })

  it('should return 400 when giveaway does not exist', async () => {
    mockGetGiveawayById.mockReturnValue(undefined)

    const { req, res } = createMocks({
      method: 'POST',
      query: { id: 'nonexistent-giveaway' }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: 'Giveaway not available'
    })
    expect(mockGetGiveawayById).toHaveBeenCalledWith('nonexistent-giveaway')
  })

  it('should return 400 when giveaway is not active', async () => {
    const inactiveGiveaway = {
      id: 'giveaway-123',
      title: 'Inactive Giveaway',
      status: 'completed'
    }

    mockGetGiveawayById.mockReturnValue(inactiveGiveaway)

    const { req, res } = createMocks({
      method: 'POST',
      query: { id: 'giveaway-123' }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: 'Giveaway not available'
    })
  })

  it('should return 400 when IP already entered', async () => {
    const activeGiveaway = {
      id: 'giveaway-123',
      title: 'Active Giveaway',
      status: 'active'
    }

    mockGetGiveawayById.mockReturnValue(activeGiveaway)
    mockCheckIPEntry.mockReturnValue({ count: 1 })

    const { req, res } = createMocks({
      method: 'POST',
      query: { id: 'giveaway-123' }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: 'You have already entered this giveaway'
    })
    expect(mockCheckIPEntry).toHaveBeenCalledWith('giveaway-123', 'hashed-ip')
  })

  it('should successfully create entry', async () => {
    const activeGiveaway = {
      id: 'giveaway-123',
      title: 'Active Giveaway',
      status: 'active'
    }

    mockGetGiveawayById.mockReturnValue(activeGiveaway)
    mockCheckIPEntry.mockReturnValue({ count: 0 })
    mockCreateEntry.mockReturnValue(undefined)

    const { req, res } = createMocks({
      method: 'POST',
      query: { id: 'giveaway-123' }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      data: { anonymousId: 'generated-id' }
    })
    expect(mockCreateEntry).toHaveBeenCalledWith(
      'generated-id',
      'giveaway-123', 
      'generated-id',
      'hashed-ip'
    )
  })

  it('should handle database errors gracefully', async () => {
    mockGetGiveawayById.mockImplementation(() => {
      throw new Error('Database error')
    })

    const { req, res } = createMocks({
      method: 'POST',
      query: { id: 'giveaway-123' }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(500)
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: 'Failed to submit entry'
    })
  })
})
