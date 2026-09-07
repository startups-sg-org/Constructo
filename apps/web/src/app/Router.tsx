import { createBrowserRouter } from 'react-router'
import MapComponent from '@features/map/components/MapComponent'


export const router = createBrowserRouter([
  {
    path: '/',
    element: <MapComponent/>,
  },
])
