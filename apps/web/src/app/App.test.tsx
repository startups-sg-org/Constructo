import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import MapComponent from '@features/map/components/MapComponent'

describe('MapComponent', () => {
  it('renderiza a seção do mapa', () => {
    render(<MapComponent />)

    expect(
      screen.getByRole('region', { name: 'Mapa de Obras' }),
    ).toBeInTheDocument()
  })
})

