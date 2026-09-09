import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { createIndicatorsFromWork } from '../data'
import { obrasMock } from '@shared/mocks/obras'
import { IndicatorsPanel } from './IndicatorsPanel'

afterEach(cleanup)

describe('IndicatorsPanel', () => {
  it('renderiza as métricas recuperadas e o progresso físico', () => {
    const obra = obrasMock[0]
    const indicators = createIndicatorsFromWork(obra)

    render(<IndicatorsPanel data={indicators} />)

    expect(
      screen.getByRole('heading', { name: indicators.workName }),
    ).toBeInTheDocument()

    expect(
      screen.getByText(`Atualizado em ${indicators.updatedAt}`),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', { name: 'Atualizar indicadores' }),
    ).toBeDisabled()

    expect(screen.getByText('Progresso')).toBeInTheDocument()
    expect(screen.getByText('Prazo')).toBeInTheDocument()
    expect(screen.getAllByText('Etapa atual')).toHaveLength(2)
    expect(screen.getByText('Situação')).toBeInTheDocument()
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
