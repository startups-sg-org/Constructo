import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'

afterEach(cleanup)

describe('App', () => {
  it('renderiza o esqueleto da Home na rota inicial', () => {
    const { container } = render(<App />)

    expect(screen.getByRole('region', { name: 'Mapa de Obras' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'UFT' })).toBeChecked()
    expect(screen.queryByRole('complementary', { name: 'Informações da Obra Selecionada' })).not.toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Indicadores de acompanhamento' })).not.toBeInTheDocument()
    expect(container.querySelector('.map-slot [aria-label="Informações da Obra Selecionada"]')).not.toBeInTheDocument()
    expect(screen.queryByText('Visão geral')).not.toBeInTheDocument()
    expect(screen.queryByText('Área de integração')).not.toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Links institucionais' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
      'href',
      'https://github.com/startups-sg-org/Constructo',
    )
  })

  it('expande o menu lateral e pesquisa suas opções', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Expandir menu lateral' }))

    expect(screen.getByRole('button', { name: 'Recolher menu lateral' })).toBeInTheDocument()
    const search = screen.getByRole('searchbox', { name: 'Pesquisar no menu' })
    fireEvent.change(search, { target: { value: 'obras' } })

    expect(screen.getByRole('link', { name: 'Obras' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Indicadores' })).not.toBeInTheDocument()
  })

  it('aponta o item Obras para a página Dominus', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Expandir menu lateral' }))

    expect(screen.getByRole('link', { name: 'Obras' })).toHaveAttribute('href', '/Dominus')
  })

  it('sincroniza painel e indicadores ao selecionar outra obra no mapa', () => {
    const { container } = render(<App />)
    const poligonos = container.querySelectorAll('path.leaflet-interactive')

    expect(screen.queryByRole('complementary', { name: 'Informações da Obra Selecionada' })).not.toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Indicadores de acompanhamento' })).not.toBeInTheDocument()

    fireEvent.click(poligonos[1])

    expect(screen.getByRole('complementary', { name: 'Informações da Obra Selecionada' })).toHaveTextContent('Revitalização dos passeios e da iluminação')
    expect(container.querySelector('.map-slot > .painel-info-obra')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Indicadores de acompanhamento' })).toHaveTextContent('Revitalização dos passeios e da iluminação')
    expect(screen.getByRole('region', { name: 'Indicadores de acompanhamento' })).toHaveTextContent('42%')

    fireEvent.click(screen.getByRole('button', { name: 'Fechar painel de informações' }))
    expect(screen.queryByRole('complementary', { name: 'Informações da Obra Selecionada' })).not.toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Indicadores de acompanhamento' })).not.toBeInTheDocument()
  })
})
