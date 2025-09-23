import { render, screen } from '@testing-library/react'
import { useRouter } from 'next/router'
import GiveawayCard from '../../src/components/GiveawayCards'
import type { Giveaway } from '../../src/types'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}))

// Mock Next.js Link component
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
  MockLink.displayName = 'MockLink'
  return MockLink
})

const mockPush = jest.fn()
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

const mockGiveaway: Giveaway = {
  id: '1',
  title: 'iPhone 15 Pro Giveaway',
  description: 'Win the latest iPhone 15 Pro in purple!',
  status: 'active',
  winner_id: null,
  entry_count: 150,
  created_at: 1640995200, // Jan 1, 2022
  updated_at: 1640995200
}

const completedGiveaway: Giveaway = {
  id: '2',
  title: 'Completed Gaming Setup',
  description: 'This giveaway has ended',
  status: 'completed',
  winner_id: 'winner-123',
  entry_count: 300,
  created_at: 1640995200,
  updated_at: 1641081600
}

describe('GiveawayCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue({
      push: mockPush,
      pathname: '/',
      query: {},
      asPath: '/',
      route: '/',
      isReady: true,
      back: jest.fn(),
      forward: jest.fn(),
      beforePopState: jest.fn(),
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

  it('renders giveaway information correctly', () => {
    render(<GiveawayCard giveaway={mockGiveaway} />)
    
    expect(screen.getByText('iPhone 15 Pro Giveaway')).toBeInTheDocument()
    expect(screen.getByText('Win the latest iPhone 15 Pro in purple!')).toBeInTheDocument()
    expect(screen.getByText('active')).toBeInTheDocument()
    expect(screen.getByText('150')).toBeInTheDocument()
    expect(screen.getByText(/entries/)).toBeInTheDocument()
  })

  it('shows enter giveaway link for active giveaways', () => {
    render(<GiveawayCard giveaway={mockGiveaway} />)
    
    const enterLink = screen.getByText('Enter Giveaway')
    expect(enterLink.closest('a')).toHaveAttribute('href', '/giveaway/1')
  })

  it('does not show enter link for completed giveaways', () => {
    render(<GiveawayCard giveaway={completedGiveaway} />)
    
    expect(screen.queryByText('Enter Giveaway')).not.toBeInTheDocument()
    expect(screen.getByText('completed')).toBeInTheDocument()
  })

  it('shows manage link for admin view', () => {
    render(<GiveawayCard giveaway={mockGiveaway} isAdmin={true} />)
    
    const manageLink = screen.getByText('Manage')
    expect(manageLink.closest('a')).toHaveAttribute('href', '/admin/giveaway/1')
  })

  it('does not show enter link in admin view', () => {
    render(<GiveawayCard giveaway={mockGiveaway} isAdmin={true} />)
    
    expect(screen.queryByText('Enter Giveaway')).not.toBeInTheDocument()
    expect(screen.getByText('Manage')).toBeInTheDocument()
  })

  it('displays correct status styling', () => {
    render(<GiveawayCard giveaway={mockGiveaway} />)
    
    const statusBadge = screen.getByText('active')
    expect(statusBadge).toHaveClass('bg-green-100', 'text-green-800', 'border-green-200')
  })

  it('displays completed status styling', () => {
    render(<GiveawayCard giveaway={completedGiveaway} />)
    
    const statusBadge = screen.getByText('completed')
    expect(statusBadge).toHaveClass('bg-purple-100', 'text-purple-800', 'border-purple-200')
  })

  it('renders without description when null', () => {
    const giveawayWithoutDesc: Giveaway = {
      ...mockGiveaway,
      description: null
    }
    
    render(<GiveawayCard giveaway={giveawayWithoutDesc} />)
    
    expect(screen.getByText('iPhone 15 Pro Giveaway')).toBeInTheDocument()
    expect(screen.queryByText('Win the latest iPhone 15 Pro in purple!')).not.toBeInTheDocument()
  })

  it('displays entry count with highlighting', () => {
    render(<GiveawayCard giveaway={mockGiveaway} />)
    
    const entryCount = screen.getByText('150')
    expect(entryCount).toHaveClass('text-purple-600', 'font-semibold')
  })

  it('displays creation date', () => {
    render(<GiveawayCard giveaway={mockGiveaway} />)
    
    // The component uses formatDate utility, so we check for "Created" text
    expect(screen.getByText(/Created/)).toBeInTheDocument()
  })

  it('applies hover effects classes', () => {
    render(<GiveawayCard giveaway={mockGiveaway} />)
    
    // Find the outermost card div that has the hover classes
    const card = screen.getByText('iPhone 15 Pro Giveaway').closest('div')?.parentElement
    expect(card).toHaveClass('hover:shadow-xl', 'transition-all', 'duration-300', 'hover:-translate-y-1')
  })

  it('applies purple theme styling', () => {
    render(<GiveawayCard giveaway={mockGiveaway} />)
    
    // Check for purple-themed elements
    const infoBox = screen.getByText(/entries/).closest('div')
    expect(infoBox).toHaveClass('bg-purple-50')
    
    // Just verify the Enter Giveaway button exists
    expect(screen.getByText('Enter Giveaway')).toBeInTheDocument()
  })

  it('handles closed status', () => {
    const closedGiveaway: Giveaway = {
      ...mockGiveaway,
      status: 'closed'
    }
    
    render(<GiveawayCard giveaway={closedGiveaway} />)
    
    const statusBadge = screen.getByText('closed')
    expect(statusBadge).toHaveClass('bg-yellow-100', 'text-yellow-800', 'border-yellow-200')
    expect(screen.queryByText('Enter Giveaway')).not.toBeInTheDocument()
  })
})
