import '@testing-library/jest-dom/vitest'
import { Map as LeafletMap } from 'leaflet'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { obrasMock } from '@shared/mocks/obras'
import { MapComponent } from './MapComponent'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

// rotulo é obrigatória: quem compõe o mapa decide o nome acessível da região.
const ROTULO = 'Mapa de Obras'

describe('MapComponent', () => {
  it('renderiza todas as obras e permite ocultar e reexibir suas camadas', () => {
    const { container } = render(<MapComponent obras={obrasMock} rotulo={ROTULO} />)
    const poligonos = () => container.querySelectorAll('path.leaflet-interactive')

    expect(screen.getByRole('region', { name: ROTULO })).toBeInTheDocument()
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

  it('notifica o id da obra clicada e destaca apenas a obra selecionada', () => {
    const onSelecionarObra = vi.fn()
    const { container, rerender } = render(
      <MapComponent obras={obrasMock} rotulo={ROTULO} onSelecionarObra={onSelecionarObra} />,
    )
    const poligonos = container.querySelectorAll('path.leaflet-interactive')

    fireEvent.click(poligonos[0])
    expect(onSelecionarObra).toHaveBeenCalledWith(obrasMock[0].id)
    // Sem seleção externa, nenhum polígono é destacado.
    expect(poligonos[0]).toHaveClass('map-poligono-em-andamento')
    expect(poligonos[0]).not.toHaveClass('map-poligono-selecionado')

    rerender(
      <MapComponent obras={obrasMock} rotulo={ROTULO} obraSelecionadaId={obrasMock[0].id} onSelecionarObra={onSelecionarObra} />,
    )
    expect(poligonos[0]).toHaveClass('map-poligono-selecionado')

    rerender(
      <MapComponent obras={obrasMock} rotulo={ROTULO} obraSelecionadaId={obrasMock[1].id} onSelecionarObra={onSelecionarObra} />,
    )
    expect(poligonos[1]).toHaveClass('map-poligono-selecionado')
    expect(poligonos[0]).not.toHaveClass('map-poligono-selecionado')
  })

  it('não exibe a antiga faixa de informações e ação', () => {
    render(<MapComponent obras={[]} rotulo={ROTULO} />)

    expect(screen.queryByText(/obras cadastradas/)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Ver todas as obras' })).not.toBeInTheDocument()
  })

  it('reenquadra todas as obras quando a seleção é limpa', () => {
    const reenquadrar = vi.spyOn(LeafletMap.prototype, 'flyToBounds')
    const { rerender } = render(
      <MapComponent obras={obrasMock} rotulo={ROTULO} obraSelecionadaId={obrasMock[0].id} />,
    )

    rerender(<MapComponent obras={obrasMock} rotulo={ROTULO} obraSelecionadaId={null} />)

    expect(reenquadrar).toHaveBeenCalledOnce()
  })

  it('preserva os cinco pátios do HGP no polígono renderizado', () => {
    // JSDOM não calcula layout; fornecemos uma viewport para o recorte do Leaflet.
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(1024)
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(768)
    const hospital = obrasMock.find((obra) => obra.local === 'HGP — Hospital Geral de Palmas')!
    const { container } = render(<MapComponent obras={[hospital]} rotulo={ROTULO} />)
    const poligono = container.querySelector('path.leaflet-interactive')!

    // Um subcaminho externo e cinco recortes no SVG renderizado pelo Leaflet.
    expect(poligono.getAttribute('d')?.match(/M/g)).toHaveLength(6)


  })

  it('recebe uma coleção externa e informa quando não existem obras', () => {
    const { container, rerender } = render(<MapComponent obras={[]} rotulo={ROTULO} />)
    expect(screen.getByRole('status')).toHaveTextContent('Nenhuma obra cadastrada')
    expect(container.querySelector('.leaflet-container')).not.toBeInTheDocument()

    rerender(<MapComponent obras={[obrasMock[2]]} rotulo={ROTULO} />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: obrasMock[2].local })).toBeChecked()
    expect(container.querySelectorAll('path.leaflet-interactive')).toHaveLength(1)

    rerender(<MapComponent obras={[obrasMock[3]]} rotulo={ROTULO} />)
    expect(screen.queryByRole('checkbox', { name: obrasMock[2].local })).not.toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: obrasMock[3].local })).toBeChecked()
  })
})
