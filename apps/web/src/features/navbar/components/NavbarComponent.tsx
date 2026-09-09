import { useEffect, useId, useState, type ReactNode } from 'react'
import { Link, NavLink } from 'react-router'
import type { ItemNavegacao } from '../types/navegacao'
import './NavbarComponent.css'

interface NavbarComponentProps {
  /** Itens da navegação principal. Rotas novas entram aqui, não no componente. */
  itens?: ItemNavegacao[]
  marca?: string
  /** Área à direita da navegação: sessão do usuário, busca, notificações. */
  acoes?: ReactNode
}

/** Apenas as rotas que o Router já registra; a lista cresce junto com ele. */
const ITENS_PADRAO: ItemNavegacao[] = [
  { rotulo: 'Mapa', para: '/', exato: true },
]

export function NavbarComponent({ itens = ITENS_PADRAO, marca = 'Constructo', acoes }: NavbarComponentProps) {
  const menuId = useId()
  const [menuAberto, setMenuAberto] = useState(false)

  // Em telas estreitas o menu cobre a página; Escape é a saída esperada de
  // qualquer sobreposição, inclusive para quem navega só pelo teclado.
  useEffect(() => {
    if (!menuAberto) {
      return
    }

    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === 'Escape') {
        setMenuAberto(false)
      }
    }

    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [menuAberto])

  function fecharMenu() {
    setMenuAberto(false)
  }

  return (
    <header className='navbar'>
      <nav className='navbar-conteudo' aria-label='Principal'>
        {/* Link simples, não NavLink: o NavLink marcaria aria-current na marca e
            na rota inicial ao mesmo tempo, anunciando duas "páginas atuais". */}
        <Link to='/' className='navbar-marca' onClick={fecharMenu}>
          <span className='navbar-marca-simbolo' aria-hidden='true' />
          <span className='navbar-marca-texto'>{marca}</span>
        </Link>

        <button
          type='button'
          className='navbar-alternador'
          aria-controls={menuId}
          aria-expanded={menuAberto}
          onClick={() => setMenuAberto((aberto) => !aberto)}
        >
          <span className='navbar-alternador-barras' aria-hidden='true' />
          <span className='navbar-alternador-texto'>{menuAberto ? 'Fechar menu' : 'Abrir menu'}</span>
        </button>

        {/* O menu permanece no DOM em qualquer largura: quem controla a exibição
            é o CSS, então a navegação continua alcançável sem JavaScript ativo. */}
        <div id={menuId} className={menuAberto ? 'navbar-menu navbar-menu-aberto' : 'navbar-menu'}>
          <ul className='navbar-lista'>
            {itens.map((item) => (
              <li key={item.para} className='navbar-item'>
                <NavLink to={item.para} end={item.exato} className='navbar-link' onClick={fecharMenu}>
                  {item.rotulo}
                </NavLink>
              </li>
            ))}
          </ul>
          {acoes && <div className='navbar-acoes'>{acoes}</div>}
        </div>
      </nav>
    </header>
  )
}
