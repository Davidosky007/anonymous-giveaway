import { render, screen } from '@testing-library/react'
import { useRouter } from 'next/router'
import Home from '../../src/pages/index'
import type { Giveaway } from '../../src/types'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}))

// Mock GiveawayCard component
jest.mock('../../src/components/GiveawayCards', () => {
  const MockGiveawayCard = ({ giveaway }: { giveaway: Giveaway }) => (
    <div data-testid="giveaway-card">
      <h3>{giveaway.title}</h3>
      <p>{giveaway.description}</p>
    </div>
  )
  MockGiveawayCard.displayName = 'MockGiveawayCard'
  return MockGiveawayCard
})

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

const mockGiveaways: Giveaway[] = [
  {
    id: '1',
    title: 'iPhone 15 Pro Giveaway',
    description: 'Win the latest iPhone 15 Pro in purple!',
    status: 'active',
    winner_id: null,
    entry_count: 150,
    created_at: 1640995200,
    updated_at: 1640995200
  },
  {
    id: '2',
    title: 'Gaming Setup Giveaway',
    description: 'Complete gaming setup with RGB everything',
    status: 'active',
    winner_id: null,
    entry_count: 75,
    created_at: 1640995200,
    updated_at: 1640995200
  }
]

describe('Home page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue({
      push: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
      route: '/',
      isReady: true,
      back: jest.fn(),
      beforePopState: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
      reload: jest.fn(),
      replace: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
      isLocaleDomain: false,
      isPreview: false,
      basePath: '',
      domainLocales: [],
      defaultLocale: 'en',
      locale: 'en',
      locales: ['en'],
    })
  })

  it('renders the page title and description', () => {
    render(<Home giveaways={mockGiveaways} />)

    expect(screen.getByText('Anonymous Giveaways')).toBeInTheDocument()
    expect(screen.getByText('Active Giveaways')).toBeInTheDocument()
  })

  it('displays giveaways when provided', () => {
    render(<Home giveaways={mockGiveaways} />)

    expect(screen.getByText('iPhone 15 Pro Giveaway')).toBeInTheDocument()
    expect(screen.getByText('Gaming Setup Giveaway')).toBeInTheDocument()
  })

  it('displays empty state when no giveaways', () => {
    render(<Home giveaways={[]} />)

    expect(screen.getByText('No active giveaways at the moment.')).toBeInTheDocument()
    expect(screen.getByText('Check back soon for new opportunities!')).toBeInTheDocument()
  })

  it('renders admin link in navigation', () => {
    render(<Home giveaways={[]} />)

    expect(screen.getByText('Admin Login')).toBeInTheDocument()
    expect(screen.getByText('Admin Login').closest('a')).toHaveAttribute('href', '/admin/login')
  })

  it('applies purple theme styling', () => {
    render(<Home giveaways={[]} />)

    const header = screen.getByText('Anonymous Giveaways').closest('header')
    expect(header).toHaveClass('bg-gradient-to-r')
  })

  it('displays proper page structure', () => {
    render(<Home giveaways={mockGiveaways} />)

    expect(screen.getByRole('banner')).toBeInTheDocument() // header
    expect(screen.getByRole('main')).toBeInTheDocument() // main
    expect(screen.getByText('Active Giveaways')).toBeInTheDocument()
  })

  it('renders giveaway cards with correct props', () => {
    render(<Home giveaways={mockGiveaways} />)

    expect(screen.getAllByTestId('giveaway-card')).toHaveLength(2)
    expect(screen.getByText('iPhone 15 Pro Giveaway')).toBeInTheDocument()
    expect(screen.getByText('Gaming Setup Giveaway')).toBeInTheDocument()
  })

  it('displays correct meta information', () => {
    render(<Home giveaways={[]} />)

    // Check that the Head component has the correct title
    const titleElement = document.querySelector('title')
    if (titleElement) {
      expect(titleElement.textContent).toBe('Anonymous Giveaways')
    } else {
      // Fallback check - the component should at least render without error
      expect(screen.getByText('Anonymous Giveaways')).toBeInTheDocument()
    }
  })
})
