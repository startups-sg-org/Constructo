import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { indicatorsMock } from '../data'
import { IndicatorsPanel } from './IndicatorsPanel'

afterEach(cleanup)

describe('IndicatorsPanel', () => {
  it('renderiza as métricas recuperadas e o progresso físico', () => {
    render(<IndicatorsPanel data={indicatorsMock} />)

    expect(screen.getByRole('heading', { name: indicatorsMock.workName })).toBeInTheDocument()
    expect(screen.getByText(`Atualizado em ${indicatorsMock.updatedAt}`)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Atualizar indicadores' })).toBeDisabled()
    expect(screen.getByText('Progresso')).toBeInTheDocument()
    expect(screen.getByText('Prazo')).toBeInTheDocument()
    expect(screen.getAllByText('Etapa atual')).toHaveLength(2)
    expect(screen.getByText('Situação')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Progresso físico da obra' })).toHaveAttribute(
      'aria-valuenow',
      '68',
    )
  })

  it('representa estados de carregamento, erro e ausência de dados', () => {
    const { rerender } = render(<IndicatorsPanel state='loading' />)
    expect(screen.getByText('Carregando indicadores...')).toBeInTheDocument()

    rerender(<IndicatorsPanel state='error' errorMessage='Falha de teste' />)
    expect(screen.getByText('Falha de teste')).toBeInTheDocument()

    rerender(<IndicatorsPanel state='empty' />)
    expect(screen.getByText('Nenhum indicador disponível.')).toBeInTheDocument()
  })
})
