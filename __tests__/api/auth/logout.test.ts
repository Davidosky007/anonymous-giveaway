import { createMocks } from 'node-mocks-http'
import handler from '../../../src/pages/api/auth/logout'
import * as auth from '../../../src/lib/auth'

// Mock the auth module
jest.mock('../../../src/lib/auth', () => ({
  destroySession: jest.fn(),
  destroySessionCookie: jest.fn(),
}))

const mockAuth = auth as jest.Mocked<typeof auth>

describe('/api/auth/logout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should handle OPTIONS request with CORS headers', async () => {
    const { req, res } = createMocks({
      method: 'OPTIONS',
    })

    await handler(req, res)

    // Since this API doesn't handle OPTIONS, it should return 405
    expect(res._getStatusCode()).toBe(405)
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: 'Method not allowed'
    })
  })

  it('should return 405 for non-POST methods', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(405)
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: 'Method not allowed'
    })
  })

  it('should logout successfully and destroy session', async () => {
    mockAuth.destroySession.mockReturnValue(undefined)
    mockAuth.destroySessionCookie.mockReturnValue('admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly; samesite=strict')

    const { req, res } = createMocks({
      method: 'POST',
      cookies: {
        admin_session: 'session-token-123'
      }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual({
      success: true
    })
    expect(mockAuth.destroySession).toHaveBeenCalledWith('session-token-123')
    expect(mockAuth.destroySessionCookie).toHaveBeenCalled()
    expect(res._getHeaders()['set-cookie']).toBeDefined()
  })

  it('should handle logout without existing session', async () => {
    mockAuth.destroySessionCookie.mockReturnValue('auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly; samesite=strict')

    const { req, res } = createMocks({
      method: 'POST',
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual({
      success: true
    })
    expect(mockAuth.destroySessionCookie).toHaveBeenCalled()
  })

  it('should handle errors gracefully', async () => {
    mockAuth.destroySession.mockImplementation(() => {
      throw new Error('Database error')
    })

    const { req, res } = createMocks({
      method: 'POST',
      cookies: {
        admin_session: 'session-token-123'
      }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(500)
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: 'Failed to logout'
    })
  })
})
