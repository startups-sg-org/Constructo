import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { DominusPage } from './DominusPage'

afterEach(cleanup)

describe('DominusPage', () => {
  it('abre a sidebar com os indicadores da obra clicada e a fecha pelo botão', () => {
    const { container } = render(<DominusPage />)
    const poligonos = container.querySelectorAll('path.leaflet-interactive')

    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()

    fireEvent.click(poligonos[0])
    const painel = screen.getByRole('complementary', { name: 'Modernização dos espaços acadêmicos' })
    expect(painel).toBeInTheDocument()
    expect(screen.getByText('58%')).toBeInTheDocument()
    expect(poligonos[0]).toHaveClass('map-poligono-selecionado')

    fireEvent.click(poligonos[1])
    expect(screen.getByRole('complementary', { name: 'Revitalização dos passeios e da iluminação' }))
      .toBeInTheDocument()
    expect(poligonos[1]).toHaveClass('map-poligono-selecionado')
    expect(poligonos[0]).not.toHaveClass('map-poligono-selecionado')

    fireEvent.click(screen.getByRole('button', { name: 'Fechar detalhes da obra' }))
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
    expect(poligonos[1]).not.toHaveClass('map-poligono-selecionado')
  })

  it('não exibe a antiga faixa de título, contagem e ação acima do mapa', () => {
    render(<DominusPage />)

    expect(screen.queryByText('6 obras cadastradas')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Ver todas as obras' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Mapa de Obras' })).toHaveClass('sr-only')
  })
})
