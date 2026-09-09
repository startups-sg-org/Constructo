import { createBrowserRouter } from 'react-router'
import { AppShell } from './layout/AppShell'
import { HomePage } from './pages/HomePage'

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
    ],
  },
])
