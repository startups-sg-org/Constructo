import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Obra } from '@shared/domain/obra'
import { SidebarComponent } from './SidebarComponent'

afterEach(cleanup)

// Fixture própria: a sidebar é apresentacional e não deve depender dos mocks do mapa.
const obra: Obra = {
  id: 'OBR-001',
  nome: 'Modernização dos espaços acadêmicos',
  local: 'UFT',
  municipio: 'Palmas',
  uf: 'TO',
  tipo: 'Educacional',
  status: 'Em andamento',
  descricao: 'Reforma de blocos acadêmicos.',
  responsavel: 'Construtora Horizonte (fictícia)',
  progresso: 58,
  progressoFisico : 58,
  progressoPlanejado : 65,
  etapaAtual: 'Adequação de acessibilidade e laboratórios',
  ultimaAtualizacao : '2026-09-01',
  orcamento: 2800000,
  dataInicio: '2026-03-02',
  previsaoConclusao: '2027-02-26',
  coordenadas: [[-10.18, -48.36], [-10.18, -48.35], [-10.17, -48.35], [-10.18, -48.36]],
  origemCoordenadas: 'OpenStreetMap',
  ficticia: true,
}

describe('SidebarComponent', () => {
  // A decisão de montar ou não a sidebar é de quem compõe a página; o componente
  // só descreve a obra que recebe.

  it('apresenta os indicadores da obra selecionada', () => {
    render(<SidebarComponent obra={obra} onFechar={vi.fn()} />)

    expect(screen.getByRole('complementary', { name: obra.nome })).toBeInTheDocument()
    expect(screen.getByText('UFT · Palmas/TO')).toBeInTheDocument()
    expect(screen.getByText('OBR-001')).toBeInTheDocument()
    expect(screen.getByText('Em andamento')).toBeInTheDocument()
    expect(screen.getByText('58%')).toBeInTheDocument()
    expect(screen.getByText('Construtora Horizonte (fictícia)')).toBeInTheDocument()
    expect(screen.getByText(/2\.800\.000,00/)).toBeInTheDocument()
    expect(screen.getByText('02/03/2026')).toBeInTheDocument()
    expect(screen.getByText('26/02/2027')).toBeInTheDocument()
    expect(screen.getByText('Obra e informações fictícias para demonstração.')).toBeInTheDocument()
  })

  it('exibe escopo e fonte do contorno apenas quando a obra os possui', () => {
    const { rerender } = render(<SidebarComponent obra={obra} onFechar={vi.fn()} />)
    expect(screen.queryByRole('link', { name: 'Fonte do contorno' })).not.toBeInTheDocument()

    const detalhado: Obra = {
      ...obra,
      escopoCoordenadas: 'Contorno do câmpus.',
      fonteCoordenadas: 'https://www.openstreetmap.org/way/961919966',
    }
    rerender(<SidebarComponent obra={detalhado} onFechar={vi.fn()} />)

    expect(screen.getByText('Contorno do câmpus.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Consultar fonte do contorno/ }))
      .toHaveAttribute('href', detalhado.fonteCoordenadas)
  })

  it('aciona o fechamento pelo botão', () => {
    const onFechar = vi.fn()
    render(<SidebarComponent obra={obra} onFechar={onFechar} />)

    fireEvent.click(screen.getByRole('button', { name: 'Fechar detalhes da obra' }))
    expect(onFechar).toHaveBeenCalledOnce()
  })
})
