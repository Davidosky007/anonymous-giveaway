// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock uuid
let counter = 0
jest.mock('uuid', () => ({
  v4: jest.fn(() => `mocked-uuid-v4-${++counter}`),
}))

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))

// Mock window.location
delete global.window.location
global.window.location = {
  href: 'http://localhost:3000',
  assign: jest.fn(),
  reload: jest.fn(),
  replace: jest.fn(),
}

// Mock fetch
global.fetch = jest.fn()

// Setup test database
process.env.NODE_ENV = 'test'
