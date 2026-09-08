import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { obrasMock } from '../mocks/obras'
import { PainelInfoObra } from './PainelInfoObra'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('PainelInfoObra', () => {
  const mockObra = obrasMock[0]

  it('não renderiza nada quando obra é null', () => {
    const { container } = render(<PainelInfoObra obra={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('exibe corretamente as informações principais da obra selecionada', () => {
    render(<PainelInfoObra obra={mockObra} />)

    expect(screen.getByRole('heading', { name: mockObra.nome })).toBeInTheDocument()
    expect(screen.getAllByText(mockObra.status).length).toBeGreaterThan(0)
    expect(screen.getByText(`${mockObra.progressoFisico}%`)).toBeInTheDocument()
    expect(screen.getByText(`${mockObra.progressoPlanejado}%`)).toBeInTheDocument()
    expect(screen.getByText(mockObra.etapaAtual!)).toBeInTheDocument()
    expect(screen.getByText('01/09/2026')).toBeInTheDocument()

    expect(screen.getByRole('button', { name: 'Ver detalhes' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ver documentos' })).toBeInTheDocument()
  })

  it('chama o callback onClose ao clicar no botão de fechar ou pressionar Escape', () => {
    const handleClose = vi.fn()
    render(<PainelInfoObra obra={mockObra} onClose={handleClose} />)

    fireEvent.click(screen.getByRole('button', { name: 'Fechar painel de informações' }))
    expect(handleClose).toHaveBeenCalledTimes(1)

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(handleClose).toHaveBeenCalledTimes(2)
  })

  it('dispara as ações demonstrativas ao clicar em Ver detalhes e Ver documentos', () => {
    const handleVerDetalhes = vi.fn()
    const handleVerDocumentos = vi.fn()

    render(
      <PainelInfoObra
        obra={mockObra}
        onVerDetalhes={handleVerDetalhes}
        onVerDocumentos={handleVerDocumentos}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Ver detalhes' }))
    expect(handleVerDetalhes).toHaveBeenCalledWith(mockObra)

    fireEvent.click(screen.getByRole('button', { name: 'Ver documentos' }))
    expect(handleVerDocumentos).toHaveBeenCalledWith(mockObra)
  })
})
