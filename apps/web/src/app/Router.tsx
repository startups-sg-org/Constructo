import { createBrowserRouter } from 'react-router'
import { MapaPage } from './pages/MapaPage'


export const router = createBrowserRouter([
  {
    path: '/',
    element: <MapaPage/>,
  },
])
