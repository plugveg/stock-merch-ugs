import * as ReactRouter from 'react-router'
import { BrowserRouter } from 'react-router'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import NavBar from '../navbar'

// Mock useNavigate
const mockedNavigate = vi.fn()

vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof ReactRouter>('react-router')
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  }
})

describe('NavBar', () => {
  const renderWithRouter = (ui: React.ReactElement) => render(<BrowserRouter>{ui}</BrowserRouter>)

  it('should render the title', () => {
    renderWithRouter(<NavBar />)
    expect(screen.getByText('StockMerch by UGS')).toBeInTheDocument()
  })

  it("should navigate to '/' on title click", () => {
    renderWithRouter(<NavBar />)
    const title = screen.getByText('StockMerch by UGS')
    fireEvent.click(title)
    expect(mockedNavigate).toHaveBeenCalledWith('/')
  })

  it('should contain a link to the GitHub repository', () => {
    renderWithRouter(<NavBar />)
    const githubLink = screen.getByRole('link', {
      name: /github/i,
    })
    expect(githubLink).toHaveAttribute('href', 'https://github.com/plugveg/stock-merch-ugs')
  })

  it('should render children elements', () => {
    renderWithRouter(
      <NavBar>
        <button>Test Button</button>
      </NavBar>
    )
    expect(screen.getByText('Test Button')).toBeInTheDocument()
  })
})
