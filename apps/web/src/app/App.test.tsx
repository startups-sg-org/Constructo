import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'

afterEach(cleanup)

describe('App', () => {
  it('renderiza o mapa na rota inicial', () => {
    render(<App />)

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Mapa de Obras' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'UFT' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Praça dos Girassóis' })).toBeChecked()
  })
})
