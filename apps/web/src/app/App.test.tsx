import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renderiza a rota inicial', () => {
    render(<App />)

    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })
})
