import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'
import type { ItemNavegacao } from '../types/navegacao'
import { NavbarComponent } from './NavbarComponent'

afterEach(cleanup)

// Fixture própria: a navbar não tem mais itens embutidos, quem a compõe decide.
const ITENS_MAPA: ItemNavegacao[] = [
  { rotulo: 'Mapa', para: '/', exato: true },
]

describe('NavbarComponent', () => {
  it('apresenta a marca e a navegação principal', () => {
    render(<NavbarComponent itens={ITENS_MAPA} />, { wrapper: MemoryRouter })

    const cabecalho = screen.getByRole('banner')

    expect(within(cabecalho).getByRole('link', { name: 'Constructo' })).toHaveAttribute('href', '/')
    expect(within(cabecalho).getByRole('navigation', { name: 'Principal' })).toBeInTheDocument()
    expect(within(cabecalho).getByRole('link', { name: 'Mapa' })).toHaveAttribute('href', '/')
  })

  it('não concorre com o título da página', () => {
    render(<NavbarComponent itens={ITENS_MAPA} />, { wrapper: MemoryRouter })

    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('marca o link da rota ativa', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <NavbarComponent itens={ITENS_MAPA} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Mapa' })).toHaveAttribute('aria-current', 'page')
  })

  it('renderiza os itens recebidos', () => {
    const itens = [
      { rotulo: 'Obras', para: '/obras' },
      { rotulo: 'Timeline', para: '/timeline' },
    ]
    render(<NavbarComponent itens={itens} marca='DOMINUS' />, { wrapper: MemoryRouter })

    expect(screen.getByRole('link', { name: 'DOMINUS' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Obras' })).toHaveAttribute('href', '/obras')
    expect(screen.getByRole('link', { name: 'Timeline' })).toHaveAttribute('href', '/timeline')
    expect(screen.queryByRole('link', { name: 'Mapa' })).not.toBeInTheDocument()
  })

  it('alterna o menu recolhido e o fecha ao navegar', () => {
    render(<NavbarComponent itens={ITENS_MAPA} />, { wrapper: MemoryRouter })

    const alternador = screen.getByRole('button', { name: 'Abrir menu' })
    const menu = document.getElementById(alternador.getAttribute('aria-controls') ?? '')

    expect(menu).toContainElement(screen.getByRole('link', { name: 'Mapa' }))
    expect(alternador).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(alternador)
    expect(screen.getByRole('button', { name: 'Fechar menu' })).toHaveAttribute('aria-expanded', 'true')

    fireEvent.click(screen.getByRole('link', { name: 'Mapa' }))
    expect(screen.getByRole('button', { name: 'Abrir menu' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('fecha o menu aberto com Escape', () => {
    render(<NavbarComponent itens={ITENS_MAPA} />, { wrapper: MemoryRouter })

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }))
    fireEvent.keyDown(window, { key: 'Escape' })

    expect(screen.getByRole('button', { name: 'Abrir menu' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('exibe a área de ações apenas quando ela é fornecida', () => {
    const { rerender } = render(<NavbarComponent itens={ITENS_MAPA} />, { wrapper: MemoryRouter })

    expect(screen.queryByRole('button', { name: 'Entrar' })).not.toBeInTheDocument()

    // rerender reaplica o wrapper: repetir o MemoryRouter aqui aninharia dois routers.
    rerender(<NavbarComponent itens={ITENS_MAPA} acoes={<button type='button'>Entrar</button>} />)

    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  })
})
