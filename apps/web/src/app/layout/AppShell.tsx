import { useMemo, useState } from 'react'
import { Outlet } from 'react-router'
import {
  ChevronIcon,
  ConstructoLogo,
  HomeIcon,
  IndicatorsIcon,
  MapIcon,
  ProfileIcon,
  SearchIcon,
} from './Icons'
import './AppShell.css'

const navigationItems = [
  { label: 'Home', icon: HomeIcon, href: '/', current: true },
  { label: 'Obras', icon: MapIcon, href: '/Dominus', current: true},
  { label: 'Indicadores', icon: IndicatorsIcon, href: '#indicadores', current: false },
]

export function AppShell() {
  const [isNavigationOpen, setIsNavigationOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const visibleNavigationItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase('pt-BR')

    if (!normalizedSearch) return navigationItems

    return navigationItems.filter(({ label }) =>
      label.toLocaleLowerCase('pt-BR').includes(normalizedSearch),
    )
  }, [searchTerm])

  return (
    <div className='app-shell'>
      <header className='app-header'>
        <a className='brand' href='/' aria-label='Constructo — página inicial'>
          <span className='brand-mark' aria-hidden='true'>
            <ConstructoLogo />
          </span>
          <span>Constructo</span>
        </a>

        <button className='profile-button' type='button' aria-label='Abrir perfil do usuário'>
          <ProfileIcon />
        </button>
      </header>

      <div className='app-body'>
        <div className={`navigation-shell${isNavigationOpen ? ' is-open' : ''}`}>
          <nav className='navigation-rail' aria-label='Navegação principal'>
            <div className='navigation-search'>
              {isNavigationOpen ? (
                <label className='search-field'>
                  <SearchIcon />
                  <span className='sr-only'>Pesquisar no menu</span>
                  <input
                    type='search'
                    placeholder='Pesquisar'
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </label>
              ) : (
                <button
                  className='navigation-item navigation-search-button'
                  type='button'
                  aria-label='Abrir pesquisa'
                  title='Pesquisar'
                  onClick={() => setIsNavigationOpen(true)}
                >
                  <SearchIcon />
                </button>
              )}
            </div>

            <div className='navigation-list'>
              {visibleNavigationItems.map(({ label, icon: Icon, href, current }) => (
                <a
                  key={label}
                  className='navigation-item'
                  href={href}
                  aria-current={current ? 'page' : undefined}
                  aria-label={label}
                  title={isNavigationOpen ? undefined : label}
                >
                  <Icon />
                  {isNavigationOpen && <span>{label}</span>}
                </a>
              ))}
              {isNavigationOpen && visibleNavigationItems.length === 0 && (
                <p className='navigation-empty'>Nenhuma opção encontrada.</p>
              )}
            </div>
          </nav>

          <button
            className='navigation-toggle'
            type='button'
            aria-expanded={isNavigationOpen}
            aria-label={isNavigationOpen ? 'Recolher menu lateral' : 'Expandir menu lateral'}
            onClick={() => setIsNavigationOpen((isOpen) => !isOpen)}
          >
            <ChevronIcon />
          </button>
        </div>

        <main className='app-main' id='main-content'>
          <Outlet />
        </main>
      </div>

      <footer className='app-footer'>
        <div className='footer-meta'>
          <span>© Constructo</span>
          <small className='map-credits'>
            Mapas: <a href='https://leafletjs.com/'>Leaflet</a>,{' '}
            <a href='https://stadiamaps.com/'>Stadia Maps</a>,{' '}
            <a href='https://stamen.com/'>Stamen Design</a>,{' '}
            <a href='https://openmaptiles.org/'>OpenMapTiles</a> e{' '}
            <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a>
          </small>
        </div>
        <nav className='footer-links' aria-label='Links institucionais'>
          <a href='#privacidade'>Privacidade</a>
          <a href='#termos'>Termos de uso</a>
          <a href='https://github.com/startups-sg-org/Constructo'>GitHub</a>
          <a href='#sobre'>Sobre</a>
          <a href='#desenvolvedores'>Desenvolvedores</a>
        </nav>
      </footer>
    </div>
  )
}
