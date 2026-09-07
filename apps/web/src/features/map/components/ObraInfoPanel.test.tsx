import '@testing-library/jest-dom/vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { describe, expect, it, vi, afterEach } from 'vitest'
import ObraInfoPanel from './ObraInfoPanel'
import type { ObraProperties } from '../types/obra'

const mockObra: ObraProperties = {
  id: 'OBR-001',
  nome: 'Residencial Ipê',
  municipio: 'Palmas',
  uf: 'TO',
  tipo: 'Residencial',
  status: 'Em andamento',
  progresso: 65,
  progressoFisico: 65,
  progressoPlanejado: 70,
  etapaAtual: 'Estrutura e Alvenaria',
  ultimaAtualizacao: '05/09/2026',
  descricao: 'Construção de dois blocos residenciais com área de convivência.',
  ficticia: true,
}

describe('ObraInfoPanel', () => {
  afterEach(() => {
    cleanup()
  })

  it('não deve renderizar nada se a obra for nula', () => {
    const { container } = render(
      <ObraInfoPanel obra={null} onClose={vi.fn()} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('deve exibir todas as informações principais da obra selecionada', () => {
    render(<ObraInfoPanel obra={mockObra} onClose={vi.fn()} />)

    expect(screen.getByText('Residencial Ipê')).toBeInTheDocument()
    expect(screen.getByText('OBR-001')).toBeInTheDocument()
    expect(screen.getByText('Em andamento')).toBeInTheDocument()
    expect(screen.getByText('Residencial')).toBeInTheDocument()
    expect(screen.getByText('Palmas, TO')).toBeInTheDocument()

    expect(screen.getByText('65%')).toBeInTheDocument()
    expect(screen.getByText('70%')).toBeInTheDocument()

    expect(screen.getByText('Estrutura e Alvenaria')).toBeInTheDocument()
    expect(screen.getByText('05/09/2026')).toBeInTheDocument()

    expect(screen.getByRole('button', { name: /ver detalhes/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ver documentos/i })).toBeInTheDocument()
  })

  it('deve disparar onClose ao clicar no botão de fechar', () => {
    const handleClose = vi.fn()
    render(<ObraInfoPanel obra={mockObra} onClose={handleClose} />)

    const closeButton = screen.getByRole('button', { name: /fechar painel/i })
    fireEvent.click(closeButton)

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('deve disparar onViewDetails e onViewDocuments ao clicar nos botões demonstrativos', () => {
    const handleViewDetails = vi.fn()
    const handleViewDocuments = vi.fn()

    render(
      <ObraInfoPanel
        obra={mockObra}
        onClose={vi.fn()}
        onViewDetails={handleViewDetails}
        onViewDocuments={handleViewDocuments}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /ver detalhes/i }))
    expect(handleViewDetails).toHaveBeenCalledWith(mockObra)

    fireEvent.click(screen.getByRole('button', { name: /ver documentos/i }))
    expect(handleViewDocuments).toHaveBeenCalledWith(mockObra)
  })
})
