import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { obrasMock } from '../mocks/obras'
import { MapComponent } from './MapComponent'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('MapComponent', () => {
  it('renderiza todas as obras e permite ocultar e reexibir suas camadas', () => {
    const { container } = render(<MapComponent />)
    const poligonos = () => container.querySelectorAll('path.leaflet-interactive')

    expect(screen.getByRole('region', { name: 'Mapa de Obras' })).toBeInTheDocument()
    expect(screen.getByText(`${obrasMock.length} obras cadastradas`)).toBeInTheDocument()
    expect(poligonos()).toHaveLength(obrasMock.length)

    obrasMock.forEach((obra, indice) => {
      const camada = screen.getByRole('checkbox', { name: obra.local })
      expect(camada).toBeChecked()
      fireEvent.click(camada)
      expect(camada).not.toBeChecked()
      expect(poligonos()).toHaveLength(obrasMock.length - indice - 1)
    })

    fireEvent.click(screen.getByRole('checkbox', { name: 'UFT' }))
    expect(poligonos()).toHaveLength(1)
  })

  it('abre os dados da obra selecionada e transfere o destaque entre polígonos', () => {
    const { container } = render(<MapComponent />)
    const poligonos = container.querySelectorAll('path.leaflet-interactive')

    fireEvent.click(poligonos[0])
    const popup = within(screen.getByRole('article'))
    expect(popup.getByRole('heading', { name: 'Modernização dos espaços acadêmicos' })).toBeInTheDocument()
    expect(popup.getByText('58%')).toBeInTheDocument()
    expect(popup.getByText('Construtora Horizonte (fictícia)')).toBeInTheDocument()
    expect(popup.getByText(/2\.800\.000,00/)).toBeInTheDocument()
    expect(popup.getByText('02/03/2026')).toBeInTheDocument()
    expect(popup.getByText('26/02/2027')).toBeInTheDocument()
    expect(popup.getByText('Obra e informações fictícias para demonstração.')).toBeInTheDocument()
    expect(poligonos[0]).toHaveAttribute('stroke', 'red')

    fireEvent.click(poligonos[1])
    expect(screen.getByRole('heading', { name: 'Revitalização dos passeios e da iluminação' })).toBeInTheDocument()
    expect(poligonos[1]).toHaveAttribute('stroke', 'red')
    expect(poligonos[0]).toHaveAttribute('stroke', 'white')
  })

  it('preserva os cinco pátios do HGP e apresenta o escopo e a fonte do contorno', () => {
    // JSDOM não calcula layout; fornecemos uma viewport para o recorte do Leaflet.
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(1024)
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(768)
    const hospital = obrasMock.find((obra) => obra.local === 'HGP — Hospital Geral de Palmas')!
    const { container } = render(<MapComponent obras={[hospital]} />)
    const poligono = container.querySelector('path.leaflet-interactive')!

    // Um subcaminho externo e cinco recortes no SVG renderizado pelo Leaflet.
    expect(poligono.getAttribute('d')?.match(/M/g)).toHaveLength(6)
    fireEvent.click(poligono)
    expect(screen.getByRole('heading', { name: hospital.nome })).toBeInTheDocument()
    expect(screen.getByText(hospital.escopoCoordenadas!)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Fonte do contorno' })).toHaveAttribute('href', hospital.fonteCoordenadas)
  })

  it('recebe uma coleção externa e informa quando não existem obras', () => {
    const { container, rerender } = render(<MapComponent obras={[]} />)
    expect(screen.getByRole('status')).toHaveTextContent('Nenhuma obra cadastrada')
    expect(container.querySelector('.leaflet-container')).not.toBeInTheDocument()

    rerender(<MapComponent obras={[obrasMock[2]]} />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.getByText('1 obra cadastrada')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: obrasMock[2].local })).toBeChecked()
    expect(container.querySelectorAll('path.leaflet-interactive')).toHaveLength(1)

    rerender(<MapComponent obras={[obrasMock[3]]} />)
    expect(screen.queryByRole('checkbox', { name: obrasMock[2].local })).not.toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: obrasMock[3].local })).toBeChecked()
  })
})
