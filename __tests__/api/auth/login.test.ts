import { createMocks } from 'node-mocks-http'
import handler from '../../../src/pages/api/auth/login'
import * as auth from '../../../src/lib/auth'

// Mock the auth module
jest.mock('../../../src/lib/auth', () => ({
  validatePassword: jest.fn(),
  createSession: jest.fn(),
  createSessionCookie: jest.fn(),
}))

const mockAuth = auth as jest.Mocked<typeof auth>

describe('/api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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

  it('should return 400 when password is missing', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {}
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: 'Password is required'
    })
  })

  it('should return 401 for invalid password', async () => {
    mockAuth.validatePassword.mockResolvedValue(false)

    const { req, res } = createMocks({
      method: 'POST',
      body: { password: 'wrongpassword' }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(401)
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: 'Invalid password'
    })
    expect(mockAuth.validatePassword).toHaveBeenCalledWith('wrongpassword')
  })

  it('should return 200 and set cookie for valid password', async () => {
    mockAuth.validatePassword.mockResolvedValue(true)
    mockAuth.createSession.mockReturnValue('session-123')
    mockAuth.createSessionCookie.mockReturnValue('session=session-123; HttpOnly; Path=/')

    const { req, res } = createMocks({
      method: 'POST',
      body: { password: 'correct-password' }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual({
      success: true
    })
    expect(mockAuth.validatePassword).toHaveBeenCalledWith('correct-password')
    expect(mockAuth.createSession).toHaveBeenCalled()
    expect(mockAuth.createSessionCookie).toHaveBeenCalledWith('session-123')
    expect(res._getHeaders()['set-cookie']).toBe('session=session-123; HttpOnly; Path=/')
  })

  it('should handle errors gracefully', async () => {
    mockAuth.validatePassword.mockResolvedValue(true)
    mockAuth.createSession.mockImplementation(() => {
      throw new Error('Database error')
    })

    const { req, res } = createMocks({
      method: 'POST',
      body: { password: 'correct-password' }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(500)
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: 'Failed to create session'
    })
  })
})
