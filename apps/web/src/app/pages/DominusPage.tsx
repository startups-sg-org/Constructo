import { useState } from 'react'
import { MapComponent, type Obra } from '@features/map'
import { SidebarComponent } from '@features/sidebar'
import './DominusPage.css'

export function DominusPage() {
  const [obraSelecionada, setObraSelecionada] = useState<Obra | null>(null)

  return (
    <div className='dominus-page'>
      <SidebarComponent obra={obraSelecionada} onFechar={() => setObraSelecionada(null)} />
      <MapComponent
        obraSelecionadaId={obraSelecionada?.id ?? null}
        onSelecionarObra={setObraSelecionada}
      />
    </div>
  )
}
