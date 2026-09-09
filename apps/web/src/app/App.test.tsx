import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'

afterEach(cleanup)

describe('App', () => {
  it('renderiza o esqueleto da Home na rota inicial', () => {
    const { container } = render(<App />)

    expect(screen.getByRole('banner')).toHaveTextContent('Constructo')
    expect(screen.getByRole('navigation', { name: 'Navegação principal' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Expandir menu lateral' })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByRole('main')).toHaveTextContent('Mapa de Obras')
    expect(screen.queryByText('Navegação rápida')).not.toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'UFT' })).toBeChecked()
    expect(screen.getByRole('complementary', { name: 'Informações da Obra Selecionada' })).toHaveTextContent('Modernização dos espaços acadêmicos')
    expect(screen.getByRole('region', { name: 'Indicadores de acompanhamento' })).toHaveTextContent('58%')
    expect(container.querySelector('.map-wrapper [aria-label="Informações da Obra Selecionada"]')).not.toBeInTheDocument()
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

  it('sincroniza painel e indicadores ao selecionar outra obra no mapa', () => {
    const { container } = render(<App />)
    const poligonos = container.querySelectorAll('path.leaflet-interactive')

    fireEvent.click(screen.getByRole('button', { name: 'Fechar painel de informações' }))
    expect(screen.getByRole('list', { name: 'Como consultar uma obra' })).toHaveTextContent('Localize a obra no mapa')

    fireEvent.click(poligonos[1])

    expect(screen.getByRole('complementary', { name: 'Informações da Obra Selecionada' })).toHaveTextContent('Revitalização dos passeios e da iluminação')
    expect(screen.getByRole('region', { name: 'Indicadores de acompanhamento' })).toHaveTextContent('Revitalização dos passeios e da iluminação')
    expect(screen.getByRole('region', { name: 'Indicadores de acompanhamento' })).toHaveTextContent('42%')
  })
})
