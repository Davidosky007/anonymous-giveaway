import { validatePassword, hashIP, createSession, validateSession, destroySession, destroySessionCookie } from '../../src/lib/auth'
import { dbQueries } from '../../src/lib/db'
import crypto from 'crypto'
import bcrypt from 'bcrypt'

// Mock bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}))

const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>

// Mock the database queries
jest.mock('../../src/lib/db', () => ({
  dbQueries: {
    createSession: {
      run: jest.fn(),
    },
    getSession: {
      get: jest.fn(),
    },
    deleteSession: {
      run: jest.fn(),
    },
  },
}))

// Mock crypto
jest.mock('crypto', () => ({
  createHash: jest.fn(() => ({
    update: jest.fn(() => ({
      digest: jest.fn(() => 'hashed-value'),
    })),
  })),
}))

const mockCrypto = crypto as jest.Mocked<typeof crypto>

// Mock environment variables with a hashed password
const originalEnv = process.env
const testPasswordHash = '$2b$10$abcd1234567890' // Mock hash
beforeEach(() => {
  jest.resetModules()
  process.env = {
    ...originalEnv,
    ADMIN_PASSWORD_HASH: testPasswordHash,
  }
})

afterEach(() => {
  process.env = originalEnv
})

describe('auth utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('validatePassword', () => {
    it('returns true for correct password', async () => {
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
      const result = await validatePassword('admin123')
      expect(result).toBe(true)
      expect(bcrypt.compare).toHaveBeenCalledWith('admin123', expect.any(String))
    })

    it('returns false for incorrect password', async () => {
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)
      const result = await validatePassword('wrong-password')
      expect(result).toBe(false)
      expect(bcrypt.compare).toHaveBeenCalledWith('wrong-password', expect.any(String))
    })

    it('returns false for empty password', async () => {
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)
      const result = await validatePassword('')
      expect(result).toBe(false)
    })

    it('returns false when ADMIN_PASSWORD_HASH is not set', async () => {
      delete process.env.ADMIN_PASSWORD_HASH
      const result = await validatePassword('any-password')
      expect(result).toBe(false)
    })
  })

  describe('hashIP', () => {
    it('hashes IP address using sha256', () => {
      const result = hashIP('192.168.1.1')
      
      expect(mockCrypto.createHash).toHaveBeenCalledWith('sha256')
      expect(result).toBe('hashed-value')
    })

    it('handles different IP formats', () => {
      const result1 = hashIP('::1')
      expect(result1).toBe('hashed-value')
      
      const result2 = hashIP('10.0.0.1')
      expect(result2).toBe('hashed-value')
    })
  })

  describe('createSession', () => {
    beforeEach(() => {
      // Mock Date.now() to return a fixed timestamp
      jest.spyOn(Date, 'now').mockReturnValue(1640995200000) // Jan 1, 2022
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('creates a session with 24 hour expiry', () => {
      const sessionId = createSession()
      
      expect(typeof sessionId).toBe('string')
      expect(sessionId.length).toBeGreaterThan(0)
      
      // Should call database to store session
      expect(dbQueries.createSession.run).toHaveBeenCalledWith(
        sessionId,
        Math.floor(1640995200000 / 1000) + 24 * 60 * 60 // +24 hours
      )
    })

    it('generates unique session IDs', () => {
      const session1 = createSession()
      const session2 = createSession()
      
      expect(session1).not.toBe(session2)
    })
  })

  describe('validateSession', () => {
    it('returns true for valid session', () => {
      const mockSession = {
        id: 'valid-session-id',
        expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        created_at: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
      }
      
      ;(dbQueries.getSession.get as jest.Mock).mockReturnValue(mockSession)
      
      const result = validateSession('valid-session-id')
      expect(result).toBe(true)
      expect(dbQueries.getSession.get).toHaveBeenCalledWith('valid-session-id')
    })

    it('returns false for invalid session', () => {
      ;(dbQueries.getSession.get as jest.Mock).mockReturnValue(undefined)
      
      const result = validateSession('invalid-session-id')
      expect(result).toBe(false)
    })

    it('returns false for empty session ID', () => {
      const result = validateSession('')
      expect(result).toBe(false)
    })

    it('returns false for null session ID', () => {
      const result = validateSession(null as unknown as string)
      expect(result).toBe(false)
    })
  })

  describe('destroySession', () => {
    it('deletes session from database', () => {
      destroySession('session-to-delete')
      
      expect(dbQueries.deleteSession.run).toHaveBeenCalledWith('session-to-delete')
    })

    it('handles empty session ID gracefully', () => {
      destroySession('')
      
      expect(dbQueries.deleteSession.run).toHaveBeenCalledWith('')
    })
  })

  describe('destroySessionCookie', () => {
    it('returns cookie string that expires the auth cookie', () => {
      const result = destroySessionCookie()
      
      expect(result).toContain('admin_session=;')
      expect(result).toContain('Expires=Thu, 01 Jan 1970 00:00:00 GMT')
      expect(result).toContain('Path=/')
      expect(result).toContain('HttpOnly')
      expect(result).toContain('SameSite=Strict')
    })

    it('ensures cookie is properly formatted', () => {
      const result = destroySessionCookie()
      
      // Check that it's a valid cookie string format
      expect(result).toMatch(/^admin_session=;.*/)
      expect(result).not.toContain('undefined')
      expect(result).not.toContain('null')
    })
  })

  describe('integration scenarios', () => {
    it('handles complete session lifecycle', () => {
      // Create session
      const sessionId = createSession()
      expect(sessionId).toBeTruthy()
      
      // Mock successful validation
      const mockSession = {
        id: sessionId,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        created_at: Math.floor(Date.now() / 1000),
      }
      ;(dbQueries.getSession.get as jest.Mock).mockReturnValue(mockSession)
      
      // Validate session
      expect(validateSession(sessionId)).toBe(true)
      
      // Destroy session
      destroySession(sessionId)
      expect(dbQueries.deleteSession.run).toHaveBeenCalledWith(sessionId)
    })

    it('handles password validation and session creation flow', async () => {
      // Mock successful bcrypt comparison
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
      
      // Validate password
      expect(await validatePassword('admin123')).toBe(true)

      // Create session after successful password validation
      const sessionId = createSession()
      expect(sessionId).toBeTruthy()
      expect(dbQueries.createSession.run).toHaveBeenCalled()
    })
  })
})
