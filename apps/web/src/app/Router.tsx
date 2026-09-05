import { createBrowserRouter } from 'react-router'
import MapComponent from '@features/Map/MapComponent'


export const router = createBrowserRouter([
  {
    path: '/MapComponent',
    element: <MapComponent/>,
  },
])
