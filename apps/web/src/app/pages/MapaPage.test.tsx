import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MapaPage } from './MapaPage'

afterEach(cleanup)

describe('MapaPage', () => {
  it('abre a sidebar com os indicadores da obra clicada e a fecha pelo botão', () => {
    const { container } = render(<MapaPage />)
    const poligonos = container.querySelectorAll('path.leaflet-interactive')

    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()

    fireEvent.click(poligonos[0])
    const painel = screen.getByRole('complementary', { name: 'Modernização dos espaços acadêmicos' })
    expect(painel).toBeInTheDocument()
    expect(screen.getByText('58%')).toBeInTheDocument()
    expect(poligonos[0]).toHaveAttribute('stroke', 'green')

    fireEvent.click(poligonos[1])
    expect(screen.getByRole('complementary', { name: 'Revitalização dos passeios e da iluminação' }))
      .toBeInTheDocument()
    expect(poligonos[1]).toHaveAttribute('stroke', 'green')
    expect(poligonos[0]).toHaveAttribute('stroke', 'white')

    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
    expect(poligonos[1]).toHaveAttribute('stroke', 'white')
  })

  it('volta à visão geral pelo botão, encerrando a seleção', () => {
    const { container } = render(<MapaPage />)
    const poligonos = container.querySelectorAll('path.leaflet-interactive')

    fireEvent.click(poligonos[0])
    expect(screen.getByRole('complementary')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Ver todas as obras' }))
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
    expect(poligonos[0]).toHaveAttribute('stroke', 'white')
  })
})
