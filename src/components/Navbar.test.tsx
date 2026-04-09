import { render, screen } from '@testing-library/react'
import Navbar from './Navbar'
import { useSession } from 'next-auth/react'

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}))

describe('Navbar Component', () => {
  const mockDict = {
    navbar: {
      dashboard: 'Dashboard',
      logout: 'Logout',
      login: 'Login',
      register: 'Register'
    }
  }

  it('renders logo correctly', () => {
    ;(useSession as jest.Mock).mockReturnValue({ data: null, status: 'unauthenticated' })
    render(<Navbar lang="en" dict={mockDict} />)
    expect(screen.getByText('PLEN.')).toBeInTheDocument()
  })

  it('shows login and register buttons when unauthenticated', () => {
    ;(useSession as jest.Mock).mockReturnValue({ data: null, status: 'unauthenticated' })
    render(<Navbar lang="en" dict={mockDict} />)
    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.getByText('Register')).toBeInTheDocument()
  })

  it('shows dashboard and logout when authenticated', () => {
    ;(useSession as jest.Mock).mockReturnValue({
      data: { user: { name: 'Test User' } },
      status: 'authenticated',
    })
    render(<Navbar lang="en" dict={mockDict} />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Logout')).toBeInTheDocument()
  })
})
