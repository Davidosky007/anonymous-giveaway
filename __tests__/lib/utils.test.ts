import { generateId, formatDate, getClientIP } from '../../src/lib/utils'
import { NextApiRequest } from 'next'

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-' + Math.random().toString(36).substr(2, 9))
}))

describe('utils', () => {
  describe('generateId', () => {
    it('generates a unique ID', () => {
      const id1 = generateId()
      const id2 = generateId()
      
      expect(typeof id1).toBe('string')
      expect(typeof id2).toBe('string')
      expect(id1).not.toBe(id2)
      expect(id1.length).toBeGreaterThan(0)
    })

    it('generates IDs without spaces or special characters', () => {
      const id = generateId()
      
      expect(id).toMatch(/^[a-zA-Z0-9-_]+$/)
      expect(id).not.toContain(' ')
    })

    it('generates consistent length IDs', () => {
      const ids = Array.from({ length: 10 }, () => generateId())
      const lengths = ids.map(id => id.length)
      
      // All IDs should have the same length (UUID v4 format)
      expect(new Set(lengths).size).toBe(1)
    })
  })

  describe('formatDate', () => {
    it('formats Unix timestamp correctly', () => {
      const timestamp = 1640995200 // Jan 1, 2022 00:00:00 UTC
      const result = formatDate(timestamp)
      
      expect(typeof result).toBe('string')
      expect(result).toContain('2022')
    })

    it('handles current timestamp', () => {
      const now = Math.floor(Date.now() / 1000)
      const result = formatDate(now)
      
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('handles different date formats consistently', () => {
      const timestamps = [
        1640995200, // Jan 1, 2022
        1672531200, // Jan 1, 2023
        1704067200, // Jan 1, 2024
      ]
      
      const formatted = timestamps.map(formatDate)
      
      formatted.forEach(date => {
        expect(typeof date).toBe('string')
        expect(date.length).toBeGreaterThan(0)
      })
    })

    it('handles zero timestamp', () => {
      const result = formatDate(0)
      
      expect(typeof result).toBe('string')
      expect(result).toContain('1970')
    })
  })

  describe('getClientIP', () => {
    it('extracts IP from x-forwarded-for header', () => {
      const mockReq = {
        headers: {
          'x-forwarded-for': '192.168.1.1, 10.0.0.1',
        },
        connection: {
          remoteAddress: '127.0.0.1',
        },
      } as unknown as NextApiRequest

      const result = getClientIP(mockReq)
      expect(result).toBe('192.168.1.1')
    })

    it('extracts IP from x-real-ip header when x-forwarded-for is not available', () => {
      const mockReq = {
        headers: {
          'x-real-ip': '192.168.1.100',
        },
        connection: {
          remoteAddress: '127.0.0.1',
        },
      } as unknown as NextApiRequest

      const result = getClientIP(mockReq)
      expect(result).toBe('192.168.1.100')
    })

    it('falls back to connection.remoteAddress', () => {
      const mockReq = {
        headers: {},
        connection: {
          remoteAddress: '10.0.0.50',
        },
      } as unknown as NextApiRequest

      const result = getClientIP(mockReq)
      expect(result).toBe('10.0.0.50')
    })

    it('falls back to socket.remoteAddress when connection is not available', () => {
      const mockReq = {
        headers: {},
        socket: {
          remoteAddress: '172.16.0.1',
        },
      } as unknown as NextApiRequest

      const result = getClientIP(mockReq)
      expect(result).toBe('172.16.0.1')
    })

    it('returns 127.0.0.1 when no IP is available', () => {
      const mockReq = {
        headers: {},
      } as unknown as NextApiRequest

      const result = getClientIP(mockReq)
      expect(result).toBe('127.0.0.1')
    })

    it('handles IPv6 addresses', () => {
      const mockReq = {
        headers: {
          'x-forwarded-for': '2001:db8::1',
        },
        connection: {
          remoteAddress: '127.0.0.1',
        },
      } as unknown as NextApiRequest

      const result = getClientIP(mockReq)
      expect(result).toBe('2001:db8::1')
    })

    it('handles multiple IPs in x-forwarded-for and takes the first one', () => {
      const mockReq = {
        headers: {
          'x-forwarded-for': '203.0.113.1, 198.51.100.1, 192.0.2.1',
        },
        connection: {
          remoteAddress: '127.0.0.1',
        },
      } as unknown as NextApiRequest

      const result = getClientIP(mockReq)
      expect(result).toBe('203.0.113.1')
    })

    it('extracts first IP from comma-separated list', () => {
      const mockReq = {
        headers: {
          'x-forwarded-for': '  192.168.1.1  , 10.0.0.1',
        },
        connection: {
          remoteAddress: '127.0.0.1',
        },
      } as unknown as NextApiRequest

      const result = getClientIP(mockReq)
      expect(result).toBe('  192.168.1.1  ')
    })

    it('handles empty x-forwarded-for header', () => {
      const mockReq = {
        headers: {
          'x-forwarded-for': '',
        },
        connection: {
          remoteAddress: '127.0.0.1',
        },
      } as unknown as NextApiRequest

      const result = getClientIP(mockReq)
      expect(result).toBe('127.0.0.1')
    })

    it('handles undefined headers gracefully', () => {
      const mockReq = {
        headers: {
          'x-forwarded-for': undefined,
          'x-real-ip': undefined,
        },
        connection: {
          remoteAddress: '127.0.0.1',
        },
      } as unknown as NextApiRequest

      const result = getClientIP(mockReq)
      expect(result).toBe('127.0.0.1')
    })
  })

  describe('edge cases and error handling', () => {
    it('generateId handles multiple rapid calls', () => {
      const ids = []
      for (let i = 0; i < 1000; i++) {
        ids.push(generateId())
      }
      
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length) // All IDs should be unique
    })

    it('formatDate handles very large timestamps', () => {
      const largeTimestamp = 4102444800 // Jan 1, 2100
      const result = formatDate(largeTimestamp)
      
      expect(typeof result).toBe('string')
      expect(result).toContain('2100')
    })

    it('getClientIP prioritizes headers correctly', () => {
      const mockReq = {
        headers: {
          'x-forwarded-for': '1.1.1.1',
          'x-real-ip': '2.2.2.2',
        },
        connection: {
          remoteAddress: '3.3.3.3',
        },
        socket: {
          remoteAddress: '4.4.4.4',
        },
      } as unknown as NextApiRequest

      const result = getClientIP(mockReq)
      expect(result).toBe('1.1.1.1') // Should prioritize x-forwarded-for
    })
  })
})
