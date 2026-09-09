import { createBrowserRouter } from 'react-router'
import { DominusPage } from './pages/DominusPage'
import { RootLayout } from './RootLayout'

export const router = createBrowserRouter([
  {
    // Rota de layout sem path: não casa com URL nenhuma, só envolve as filhas
    // para que a navbar persista entre navegações em vez de remontar.
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <DominusPage />,
      },
    ],
  },
])
