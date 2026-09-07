import { createBrowserRouter } from 'react-router'
import { MapComponent } from '@features/map'


export const router = createBrowserRouter([
  {
    path: '/',
    element: <MapComponent/>,
  },
])
