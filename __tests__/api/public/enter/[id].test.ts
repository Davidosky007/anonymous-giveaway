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
      query: { id: '123e4567-e89b-12d3-a456-426614174000' }
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
      query: { id: '123e4567-e89b-12d3-a456-426614174000' }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: 'Giveaway not available'
    })
    expect(mockGetGiveawayById).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000')
  })

  it('should return 400 when giveaway is not active', async () => {
    const inactiveGiveaway = {
      id: '123e4567-e89b-12d3-a456-426614174001',
      title: 'Inactive Giveaway',
      status: 'completed'
    }

    mockGetGiveawayById.mockReturnValue(inactiveGiveaway)

    const { req, res } = createMocks({
      method: 'POST',
      query: { id: '123e4567-e89b-12d3-a456-426614174001' }
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
      id: '123e4567-e89b-12d3-a456-426614174002',
      title: 'Active Giveaway',
      status: 'active'
    }

    mockGetGiveawayById.mockReturnValue(activeGiveaway)
    mockCheckIPEntry.mockReturnValue({ count: 1 })

    const { req, res } = createMocks({
      method: 'POST',
      query: { id: '123e4567-e89b-12d3-a456-426614174002' }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: 'You have already entered this giveaway'
    })
    expect(mockCheckIPEntry).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174002', 'hashed-ip')
  })

  it('should successfully create entry', async () => {
    const activeGiveaway = {
      id: '123e4567-e89b-12d3-a456-426614174003',
      title: 'Active Giveaway',
      status: 'active'
    }

    mockGetGiveawayById.mockReturnValue(activeGiveaway)
    mockCheckIPEntry.mockReturnValue({ count: 0 })
    mockCreateEntry.mockReturnValue(undefined)

    const { req, res } = createMocks({
      method: 'POST',
      query: { id: '123e4567-e89b-12d3-a456-426614174003' }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      data: { anonymousId: 'generated-id' }
    })
    expect(mockCreateEntry).toHaveBeenCalledWith(
      'generated-id',
      '123e4567-e89b-12d3-a456-426614174003', 
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
      query: { id: '123e4567-e89b-12d3-a456-426614174004' }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(500)
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: 'Failed to submit entry'
    })
  })
})
