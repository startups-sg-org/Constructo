import { Outlet } from 'react-router'
import { NavbarComponent, type ItemNavegacao } from '@features/navbar'
import './RootLayout.css'

/** Espelha as rotas que Router.tsx registra; cresce junto com ele. A navbar
    em si não sabe que este arquivo, ou qualquer Router, existe. */
const ITENS_NAVEGACAO: ItemNavegacao[] = [
  { rotulo: 'Mapa', para: '/', exato: true },
]

export function RootLayout() {
  return (
    <>
      <NavbarComponent itens={ITENS_NAVEGACAO} />
      <main className='app-main'>
        <Outlet />
      </main>
    </>
  )
}
