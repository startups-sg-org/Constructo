import Indicadores from './modules/indicadores/indicadores'
import { indicadoresMock } from './modules/indicadores/data'
import './App.css'

function App() {
  return <Indicadores data={indicadoresMock} />
}

export default App
