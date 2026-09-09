import { Outlet } from 'react-router'
import { NavbarComponent } from '@features/navbar'
import './RootLayout.css'

export function RootLayout() {
  return (
    <>
      <NavbarComponent />
      <main className='app-main'>
        <Outlet />
      </main>
    </>
  )
}
